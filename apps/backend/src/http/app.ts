import { loadConfig, publicConfig } from '../../../../scripts/config.mjs';
import { join } from 'node:path';
import { BlogImages } from '../storage/blog-images.js';
import { BlogStore, BlogAccessError, articleInput } from '../storage/blog.js';
import Fastify from 'fastify';
import staticFiles from '@fastify/static';
import {
  updateSchema,
  profileNameSchema,
  profileIdSchema,
  importSchema,
  stateSchema,
  type PublicConfig,
} from '@flashlab/shared';
import { ConflictError } from '../storage/store.js';
import { Profiles } from '../storage/profiles.js';
import {
  DatabaseBackups,
  BackupError,
  BACKUP_TYPE,
  MAX_BACKUP_BYTES,
} from '../storage/backups.js';

export function buildApp(options: {
  dataFile: string;
  storageDir?: string;
  runtimeConfig?: PublicConfig;
  staticRoot?: string;
  logger?: boolean;
}) {
  const app = Fastify({
    logger: options.logger ?? false,
    bodyLimit: 20_000_000,
  });
  const profiles = new Profiles(options.dataFile, options.storageDir);
  const blog = new BlogStore(join(profiles.root, 'blog'), profiles.database);
  app.addHook('onClose', async () => profiles.close());
  async function blogOwner(header: unknown) {
    const id = profileIdSchema.safeParse(header);
    if (!id.success)
      throw new BlogAccessError('Chọn người dùng trước khi đăng bài.', 401);
    const owner = (await profiles.list()).find(
      (profile) => profile.id === id.data,
    );
    if (!owner) throw new BlogAccessError('Người dùng không còn tồn tại.', 401);
    return owner;
  }
  const blogImages = new BlogImages(
    join(profiles.root, 'blog', 'images'),
    profiles.database,
  );
  const backups = new DatabaseBackups(profiles, blog, blogImages);
  app.addHook('onReady', async () => blogImages.initialize());
  app.addContentTypeParser(
    BACKUP_TYPE,
    { parseAs: 'buffer', bodyLimit: MAX_BACKUP_BYTES },
    (_request, body, done) => done(null, body),
  );
  app.get('/api/backups/database', async (_request, reply) =>
    reply
      .type(BACKUP_TYPE)
      .header(
        'Content-Disposition',
        'attachment; filename="FlashLab-all.sqlite"',
      )
      .send(await backups.export()),
  );
  app.get<{ Params: { id: string } }>(
    '/api/profiles/:id/database',
    async (request, reply) => {
      const id = profileIdSchema.parse(request.params.id);
      return reply
        .type(BACKUP_TYPE)
        .header(
          'Content-Disposition',
          `attachment; filename="FlashLab-${id}.sqlite"`,
        )
        .send(await backups.export(id));
    },
  );
  app.post(
    '/api/backups/inspect',
    { bodyLimit: MAX_BACKUP_BYTES },
    async (request) => {
      if (!Buffer.isBuffer(request.body))
        throw new BackupError('Cần chọn một tệp database SQLite.');
      return backups.inspect(request.body);
    },
  );
  app.post(
    '/api/backups/restore',
    { bodyLimit: MAX_BACKUP_BYTES },
    async (request, reply) => {
      if (
        !Buffer.isBuffer(request.body) ||
        request.headers['x-flashlab-confirm'] !== 'restore'
      )
        throw new BackupError('Cần xác nhận trước khi khôi phục database.');
      const revision = request.headers['x-flashlab-revision'];
      const hash = request.headers['x-flashlab-backup-hash'];
      if (
        typeof revision !== 'string' ||
        !/^\d+$/.test(revision) ||
        typeof hash !== 'string'
      )
        throw new BackupError('Thiếu thông tin kiểm tra database.');
      try {
        return await backups.restore(request.body, Number(revision), hash);
      } catch (error) {
        if (error instanceof ConflictError)
          return reply.code(409).send({ error: error.message });
        throw error;
      }
    },
  );
  app.post(
    '/api/blog-images',
    { bodyLimit: 3_000_000 },
    async (request, reply) => {
      await blogOwner(request.headers['x-flashlab-profile']);
      const image = await blogImages.save(
        (request.body as { data?: unknown } | null)?.data,
      );
      return reply.code(201).send(image);
    },
  );
  app.get<{ Params: { name: string } }>(
    '/api/blog-images/:name',
    async (request, reply) => {
      const image = await blogImages.read(request.params.name);
      return reply.type(image.type).send(image.bytes);
    },
  );
  app.get('/api/blog', async () => blog.list());
  app.post('/api/blog', async (request, reply) => {
    const parsed = articleInput.safeParse(request.body);
    if (!parsed.success)
      return reply
        .code(400)
        .send({ error: 'Tiêu đề, tác giả hoặc nội dung không hợp lệ.' });
    return reply
      .code(201)
      .send(
        await blog.save(
          parsed.data,
          await blogOwner(request.headers['x-flashlab-profile']),
        ),
      );
  });
  app.put<{ Params: { id: string } }>(
    '/api/blog/:id',
    async (request, reply) => {
      const parsed = articleInput.safeParse(request.body);
      const revision = (request.body as { revision?: number } | null)?.revision;
      if (!parsed.success || !Number.isInteger(revision))
        return reply.code(400).send({ error: 'Bài viết không hợp lệ.' });
      try {
        return await blog.save(
          parsed.data,
          await blogOwner(request.headers['x-flashlab-profile']),
          request.params.id,
          revision,
        );
      } catch (error) {
        if (error instanceof ConflictError)
          return reply.code(409).send({ error: error.message });
        throw error;
      }
    },
  );
  app.delete<{ Params: { id: string } }>(
    '/api/blog/:id',
    async (request, reply) => {
      const owner = await blogOwner(request.headers['x-flashlab-profile']);
      const revision = (request.body as { revision?: number } | null)?.revision;
      if (!Number.isInteger(revision))
        return reply.code(400).send({ error: 'Bài viết không hợp lệ.' });
      try {
        await blog.delete(request.params.id, owner.id, revision!);
        return reply.code(204).send();
      } catch (error) {
        if (error instanceof ConflictError)
          return reply.code(409).send({ error: error.message });
        throw error;
      }
    },
  );
  app.addHook('onRequest', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Referrer-Policy', 'same-origin');
    if (request.url.startsWith('/api/'))
      reply.header('Cache-Control', 'no-store');
    // JSON-only writes; no cross-origin access is enabled.
    if (
      ['PUT', 'POST', 'DELETE'].includes(request.method) &&
      request.headers['sec-fetch-site'] === 'cross-site'
    )
      return reply
        .code(403)
        .send({ error: 'Cross-origin writes are forbidden' });
  });
  app.get('/api/health', async () => ({ status: 'ok' }));
  app.get(
    '/api/config',
    async () => options.runtimeConfig ?? publicConfig(loadConfig()),
  );
  app.get('/api/profiles', async () => profiles.list());
  app.get<{ Params: { id: string } }>(
    '/api/profiles/:id/export',
    async (request, reply) => {
      const id = profileIdSchema.parse(request.params.id);
      const archive = await profiles.exportFolder(id);
      return reply
        .type('application/zip')
        .header(
          'Content-Disposition',
          `attachment; filename="FlashLab-${id}.zip"`,
        )
        .send(archive);
    },
  );
  app.get('/api/storage', async () => ({
    directory: profiles.root,
    engine: 'sqlite',
    database: profiles.database.file,
  }));
  app.post<{ Params: { id: string } }>(
    '/api/profiles/:id/import',
    async (request, reply) => {
      const id = profileIdSchema.safeParse(request.params.id);
      const parsed = importSchema.safeParse(request.body);
      if (!id.success || !parsed.success)
        return reply
          .code(400)
          .send({ error: 'Bản sao lưu hoặc xác nhận không hợp lệ.' });
      const { backup, revision } = parsed.data;
      if (backup.userId && backup.userId !== id.data)
        return reply
          .code(400)
          .send({ error: 'ID trong bản sao lưu không khớp người dùng đích.' });
      try {
        return await profiles.restore(
          id.data,
          backup.userName,
          revision,
          stateSchema.parse(backup),
          backup.userCreated,
        );
      } catch (error) {
        if (error instanceof ConflictError)
          return reply.code(409).send({ error: error.message });
        throw error;
      }
    },
  );
  app.post('/api/profiles', async (request, reply) => {
    const body = request.body;
    const name = profileNameSchema.safeParse(
      typeof body === 'object' && body !== null && 'name' in body
        ? body.name
        : undefined,
    );
    if (!name.success)
      return reply
        .code(400)
        .send({ error: 'Tên người dùng cần từ 1 đến 60 ký tự.' });
    return reply.code(201).send(await profiles.create(name.data));
  });
  app.put<{ Params: { id: string } }>(
    '/api/profiles/:id',
    async (request, reply) => {
      const body = request.body;
      const name = profileNameSchema.safeParse(
        typeof body === 'object' && body !== null && 'name' in body
          ? body.name
          : undefined,
      );
      if (!name.success)
        return reply
          .code(400)
          .send({ error: 'Tên người dùng cần từ 1 đến 60 ký tự.' });
      return profiles.rename(
        profileIdSchema.parse(request.params.id),
        name.data,
      );
    },
  );
  app.delete<{ Params: { id: string } }>(
    '/api/profiles/:id',
    async (request, reply) => {
      await profiles.delete(request.params.id);
      return reply.code(204).send();
    },
  );
  for (const url of ['/api/state', '/api/profiles/:id/state']) {
    app.get<{ Params: { id?: string } }>(url, async (request) =>
      profiles.read(request.params.id ?? 'default'),
    );
    app.put<{ Params: { id?: string } }>(url, async (request, reply) => {
      const parsed = updateSchema.safeParse(request.body);
      if (!parsed.success)
        return reply
          .code(400)
          .send({ error: 'Invalid state', issues: parsed.error.issues });
      try {
        return await profiles.update(
          request.params.id ?? 'default',
          parsed.data.revision,
          parsed.data.data,
        );
      } catch (error) {
        if (error instanceof ConflictError)
          return reply.code(409).send({ error: error.message });
        throw error;
      }
    });
  }
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const statusCode =
      error instanceof Error && 'statusCode' in error
        ? error.statusCode
        : undefined;
    const status =
      typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500
        ? statusCode
        : 500;
    reply.code(status).send({
      error:
        status === 500
          ? 'Internal server error'
          : error instanceof Error
            ? error.message
            : 'Request failed',
    });
  });
  if (options.staticRoot)
    app.register(staticFiles, { root: options.staticRoot });
  return app;
}
