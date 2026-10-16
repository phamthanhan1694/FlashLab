import { readFile, mkdir, rename, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { profileIdSchema, type Profile } from '@flashlab/shared';
import { writeAtomic, ConflictError } from './store.js';
export const articleInput = z.object({
  author: z.string().trim().min(1).max(60).optional(),
  title: z.string().trim().min(1).max(200),
  markdown: z.string().trim().min(1).max(200000),
});
const article = articleInput.extend({
  author: z.string().trim().min(1).max(60),
  ownerId: profileIdSchema.optional(),
  id: z.string().uuid(),
  revision: z.number().int().positive(),
  created: z.number(),
  updated: z.number(),
});
const catalog = z.array(article);
export class BlogAccessError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}
export class BlogStore {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private directory: string) {}
  async list() {
    try {
      return catalog.parse(
        JSON.parse(await readFile(join(this.directory, 'index.json'), 'utf8')),
      );
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        return [];
      throw error;
    }
  }
  save(
    body: z.infer<typeof articleInput>,
    owner: Profile,
    id?: string,
    revision?: number,
  ) {
    const operation = this.queue.then(async () => {
      const articles = await this.list();
      const previous = id ? articles.find((a) => a.id === id) : undefined;
      if (id && !previous)
        throw new BlogAccessError('Không tìm thấy bài viết.', 404);
      if (previous && previous.ownerId !== owner.id)
        throw new BlogAccessError(
          'Chỉ chủ bài viết được sửa hoặc xóa bài.',
          403,
        );
      if (id && previous?.revision !== revision)
        throw new ConflictError(
          'Bài viết đã thay đổi. Hãy tải lại trước khi sửa.',
        );
      const next = article.parse({
        ...body,
        author: body.author ?? previous?.author ?? owner.name,
        ownerId: owner.id,
        id: previous?.id ?? randomUUID(),
        revision: (previous?.revision ?? 0) + 1,
        created: previous?.created ?? Date.now(),
        updated: Date.now(),
      });
      await mkdir(this.directory, { recursive: true });
      const file = join(this.directory, `${next.id}.md`);
      const temporary = `${file}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, next.markdown, 'utf8');
        await rename(temporary, file);
      } finally {
        await unlink(temporary).catch(() => undefined);
      }
      await writeAtomic(join(this.directory, 'index.json'), [
        next,
        ...articles.filter((a) => a.id !== next.id),
      ]);
      return next;
    });
    this.queue = operation.catch(() => undefined);
    return operation;
  }
  delete(id: string, ownerId: string, revision: number) {
    const operation = this.queue.then(async () => {
      const articles = await this.list();
      const previous = articles.find((article) => article.id === id);
      if (!previous) throw new BlogAccessError('Không tìm thấy bài viết.', 404);
      if (previous.ownerId !== ownerId)
        throw new BlogAccessError(
          'Chỉ chủ bài viết được sửa hoặc xóa bài.',
          403,
        );
      if (previous.revision !== revision)
        throw new ConflictError(
          'Bài viết đã thay đổi. Hãy tải lại trước khi xóa.',
        );
      await writeAtomic(
        join(this.directory, 'index.json'),
        articles.filter((article) => article.id !== id),
      );
      await unlink(join(this.directory, `${id}.md`)).catch((error: unknown) => {
        if (!(
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ))
          throw error;
      });
    });
    this.queue = operation.catch(() => undefined);
    return operation;
  }
}
