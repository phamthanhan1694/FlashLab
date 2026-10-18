import { DatabaseSync } from 'node:sqlite';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import {
  profilesSchema,
  snapshotSchema,
  normalizeTerm,
  type Profile,
  type Snapshot,
} from '@flashlab/shared';
import { articleSchema, BlogStore } from './blog.js';
import { BlogImages, validateStoredImage } from './blog-images.js';
import { Profiles } from './profiles.js';
import { ConflictError } from './store.js';

export const BACKUP_TYPE = 'application/vnd.sqlite3';
export const MAX_BACKUP_BYTES = 100_000_000;
const formatKey = 'flashlab-backup-version';
const scopeKey = 'flashlab-backup-scope';
export class BackupError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
  }
}
type Article = ReturnType<typeof articleSchema.parse>;
interface Records {
  scope: 'profile' | 'all';
  profiles: { profile: Profile; snapshot: Snapshot }[];
  articles: Article[];
  images: { name: string; type: string; bytes: Buffer }[];
}
function references(records: Pick<Records, 'profiles' | 'articles'>) {
  const text = JSON.stringify([records.profiles, records.articles]);
  return new Set(
    [
      ...text.matchAll(
        /\/api\/blog-images\/([0-9a-f-]+\.(?:png|jpg|gif|webp))/g,
      ),
    ].map((match) => match[1]!),
  );
}
function noDiscardedFields(raw: unknown, parsed: unknown) {
  if (raw && parsed && typeof raw === 'object' && typeof parsed === 'object') {
    for (const key of Object.keys(raw)) {
      if (!Object.hasOwn(parsed, key))
        throw new BackupError(
          'Database có trường dữ liệu của phiên bản mới hơn. Hãy cập nhật FlashLab trước khi nhập.',
        );
      noDiscardedFields(
        (raw as Record<string, unknown>)[key],
        (parsed as Record<string, unknown>)[key],
      );
    }
  }
}
function readRecords(db: DatabaseSync): Records {
  db.exec('PRAGMA trusted_schema = OFF; PRAGMA query_only = ON');
  for (const name of [
    'metadata',
    'profiles',
    'profile_states',
    'articles',
    'images',
  ]) {
    if (
      db.prepare('SELECT type FROM sqlite_schema WHERE name = ?').get(name)
        ?.type !== 'table'
    )
      throw new BackupError(
        'Database thiếu dữ liệu FlashLab. Hãy xuất lại bằng phiên bản hiện tại.',
      );
  }
  if (db.prepare('PRAGMA quick_check').get()?.quick_check !== 'ok')
    throw new BackupError('Database bị hỏng.');
  const version = db
    .prepare('SELECT value FROM metadata WHERE key = ?')
    .get(formatKey)?.value;
  if (version !== undefined && version !== '1')
    throw new BackupError('Phiên bản database sao lưu chưa được hỗ trợ.');
  const rawScope =
    db.prepare('SELECT value FROM metadata WHERE key = ?').get(scopeKey)
      ?.value ?? 'all';
  if (rawScope !== 'all' && rawScope !== 'profile')
    throw new BackupError('Phạm vi bản sao lưu không hợp lệ.');
  if (
    Number(db.prepare('SELECT count(*) count FROM profiles').get()!.count) > 50
  )
    throw new BackupError('Database có quá nhiều hồ sơ.');
  const profiles = profilesSchema.parse(
    db.prepare('SELECT id, name, created FROM profiles ORDER BY rowid').all(),
  );
  const stateRows = db
    .prepare('SELECT profile_id, revision, data FROM profile_states')
    .all();
  if (
    stateRows.length !== profiles.length ||
    new Set(stateRows.map((row) => row.profile_id)).size !== profiles.length
  )
    throw new BackupError('Database thiếu hoặc trùng trạng thái hồ sơ.');
  const records: Records = {
    scope: rawScope,
    profiles: profiles.map((profile) => {
      const row = stateRows.find((state) => state.profile_id === profile.id);
      if (!row) throw new BackupError('Database thiếu trạng thái hồ sơ.');
      const raw = {
        revision: row.revision,
        data: row.data === null ? null : JSON.parse(String(row.data)),
      };
      const snapshot = snapshotSchema.parse(raw);
      noDiscardedFields(raw, snapshot);
      return { profile, snapshot };
    }),
    articles: db
      .prepare('SELECT id, revision, document FROM articles ORDER BY rowid')
      .all()
      .map((row) => {
        const raw: unknown = JSON.parse(String(row.document));
        const article = articleSchema.parse(raw);
        noDiscardedFields(raw, article);
        if (article.id !== row.id || article.revision !== row.revision)
          throw new BackupError('Thông tin bài viết không khớp database.');
        return article;
      }),
    images: db
      .prepare('SELECT name, type, data FROM images')
      .all()
      .map((row) => {
        if (!(row.data instanceof Uint8Array))
          throw new BackupError('Dữ liệu ảnh không hợp lệ.');
        const image = validateStoredImage(String(row.name), row.data);
        if (row.type !== image.type)
          throw new BackupError('Định dạng ảnh không khớp database.');
        return { name: String(row.name), ...image };
      }),
  };
  if (
    new Set(records.articles.map((item) => item.id)).size !==
      records.articles.length ||
    new Set(records.images.map((item) => item.name)).size !==
      records.images.length
  )
    throw new BackupError('Database có ID bài viết hoặc ảnh bị trùng.');
  if (
    records.scope === 'profile' &&
    (profiles.length !== 1 ||
      records.articles.some((article) => article.ownerId !== profiles[0]!.id))
  )
    throw new BackupError('Bản sao lưu hồ sơ chứa dữ liệu ngoài phạm vi.');
  const images = new Set(records.images.map((image) => image.name));
  for (const name of references(records))
    if (!images.has(name))
      throw new BackupError(
        'Database thiếu ảnh được tham chiếu. Hãy xuất lại từ ứng dụng gốc.',
      );
  return records;
}
async function temporary<T>(operation: (path: string) => Promise<T>) {
  const directory = await mkdtemp(join(tmpdir(), 'flashlab-backup-'));
  try {
    return await operation(join(directory, 'backup.sqlite'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
async function uploaded(bytes: Buffer) {
  if (bytes.length > MAX_BACKUP_BYTES)
    throw new BackupError('Tệp database vượt quá 100 MB.');
  if (bytes.subarray(0, 16).toString() !== 'SQLite format 3\0')
    throw new BackupError('Tệp không phải database SQLite hợp lệ.');
  try {
    return await temporary(async (path) => {
      await writeFile(path, bytes, { flag: 'wx', mode: 0o600 });
      const db = new DatabaseSync(path, { readOnly: true });
      try {
        return readRecords(db);
      } finally {
        db.close();
      }
    });
  } catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError(
      'Database bị hỏng hoặc dữ liệu không tương thích với FlashLab.',
    );
  }
}
function summary(records: Records) {
  return {
    scope: records.scope,
    profiles: records.profiles.map(({ profile, snapshot }) => ({
      ...profile,
      revision: snapshot.revision,
    })),
    decks: records.profiles.reduce(
      (count, item) => count + (item.snapshot.data?.decks.length ?? 0),
      0,
    ),
    cards: records.profiles.reduce(
      (count, item) =>
        count +
        (item.snapshot.data?.decks.reduce(
          (sum, deck) => sum + deck.cards.length,
          0,
        ) ?? 0),
      0,
    ),
    articles: records.articles.length,
    images: records.images.length,
  };
}
export class DatabaseBackups {
  constructor(
    private profiles: Profiles,
    private blog: BlogStore,
    private images: BlogImages,
  ) {}
  private async ready() {
    await this.profiles.list();
    await this.blog.list();
    await this.images.initialize();
  }
  async export(id?: string) {
    await this.ready();
    return temporary(async (path) => {
      this.profiles.database.db.prepare('VACUUM INTO ?').run(path);
      const copy = new DatabaseSync(path);
      try {
        copy.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = DELETE');
        if (id) {
          if (!copy.prepare('SELECT 1 FROM profiles WHERE id = ?').get(id))
            throw new BackupError('Người dùng không còn tồn tại.', 404);
          copy.prepare('DELETE FROM profiles WHERE id != ?').run(id);
          copy
            .prepare(
              "DELETE FROM articles WHERE json_extract(document, '$.ownerId') IS NOT ?",
            )
            .run(id);
          const text =
            String(
              copy
                .prepare('SELECT data FROM profile_states WHERE profile_id = ?')
                .get(id)!.data ?? '',
            ) +
            JSON.stringify(copy.prepare('SELECT document FROM articles').all());
          const used = new Set(
            [
              ...text.matchAll(
                /\/api\/blog-images\/([0-9a-f-]+\.(?:png|jpg|gif|webp))/g,
              ),
            ].map((match) => match[1]),
          );
          for (const row of copy.prepare('SELECT name FROM images').all())
            if (!used.has(String(row.name)))
              copy.prepare('DELETE FROM images WHERE name = ?').run(row.name);
        }
        copy
          .prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)')
          .run(formatKey, '1');
        copy
          .prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)')
          .run(scopeKey, id ? 'profile' : 'all');
        copy.exec('VACUUM'); // Also remove deleted users' content from unused pages of per-profile backups.
        readRecords(copy);
      } finally {
        copy.close();
      }
      const bytes = await readFile(path);
      if (bytes.length > MAX_BACKUP_BYTES)
        throw new BackupError('Tệp database vượt quá 100 MB.');
      return bytes;
    });
  }
  async inspect(bytes: Buffer) {
    await this.ready();
    const records = await uploaded(bytes);
    return {
      ...summary(records),
      hash: createHash('sha256').update(bytes).digest('hex'),
      expectedRevision: this.profiles.database.revision,
    };
  }
  async restore(bytes: Buffer, expectedRevision: number, hash: string) {
    await this.ready();
    if (
      !Number.isSafeInteger(expectedRevision) ||
      expectedRevision < 0 ||
      hash !== createHash('sha256').update(bytes).digest('hex')
    )
      throw new BackupError(
        'Cần kiểm tra và xác nhận đúng tệp database trước khi khôi phục.',
      );
    const records = await uploaded(bytes);
    if (this.profiles.database.revision !== expectedRevision)
      throw new ConflictError(
        'Dữ liệu vừa thay đổi. Hãy kiểm tra lại bản sao lưu trước khi khôi phục.',
      );
    const recoveryName = `before-restore-${Date.now()}-${randomUUID()}.sqlite`;
    const recoveryDirectory = join(this.profiles.root, 'restore-backups');
    const recovery = await this.export();
    await mkdir(recoveryDirectory, { recursive: true, mode: 0o700 });
    await writeFile(join(recoveryDirectory, recoveryName), recovery, {
      flag: 'wx',
      mode: 0o600,
    });
    return this.profiles.database.transaction(() => {
      const database = this.profiles.database;
      const db = database.db;
      if (database.revision !== expectedRevision)
        throw new ConflictError(
          'Dữ liệu vừa thay đổi. Hãy kiểm tra lại bản sao lưu trước khi khôi phục.',
        );
      const currentProfiles = profilesSchema.parse(
        db
          .prepare('SELECT id, name, created FROM profiles ORDER BY rowid')
          .all(),
      );
      const oldRevisions = new Map(
        db
          .prepare('SELECT profile_id, revision FROM profile_states')
          .all()
          .map((row) => [String(row.profile_id), Number(row.revision)]),
      );
      const oldArticles = new Map(
        db
          .prepare('SELECT id, revision, document FROM articles')
          .all()
          .map((row) => [String(row.id), row]),
      );
      if (records.scope === 'profile') {
        const id = records.profiles[0]!.profile.id;
        try {
          profilesSchema.parse([
            ...currentProfiles.filter((profile) => profile.id !== id),
            records.profiles[0]!.profile,
          ]);
        } catch {
          throw new BackupError(
            'Tên hoặc số lượng hồ sơ xung đột với dữ liệu hiện tại.',
            409,
          );
        }
        for (const article of records.articles) {
          const current = oldArticles.get(article.id);
          if (current && JSON.parse(String(current.document)).ownerId !== id)
            throw new BackupError(
              'ID bài viết trùng với bài của người dùng khác.',
              409,
            );
        }
        for (const image of records.images) {
          const current = db
            .prepare('SELECT type, data FROM images WHERE name = ?')
            .get(image.name);
          if (
            current &&
            (!(current.data instanceof Uint8Array) ||
              !Buffer.from(current.data).equals(image.bytes) ||
              current.type !== image.type)
          )
            throw new BackupError(
              'ID ảnh trùng với ảnh khác đang được sử dụng.',
              409,
            );
        }
        db.prepare(
          "DELETE FROM articles WHERE json_extract(document, '$.ownerId') = ?",
        ).run(id);
        db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
      } else {
        db.exec(
          'DELETE FROM articles; DELETE FROM images; DELETE FROM profiles',
        );
      }
      for (const { profile, snapshot } of records.profiles) {
        db.prepare(
          'INSERT INTO profiles (id, name, normalized_name, created) VALUES (?, ?, ?, ?)',
        ).run(
          profile.id,
          profile.name,
          normalizeTerm(profile.name),
          profile.created,
        );
        const revision =
          Math.max(
            snapshot.revision,
            oldRevisions.get(profile.id) ?? 0,
            expectedRevision,
          ) + 1;
        db.prepare(
          'INSERT INTO profile_states (profile_id, revision, data) VALUES (?, ?, ?)',
        ).run(
          profile.id,
          revision,
          snapshot.data === null ? null : JSON.stringify(snapshot.data),
        );
      }
      for (const article of records.articles) {
        const revision =
          Math.max(
            article.revision,
            Number(oldArticles.get(article.id)?.revision ?? 0),
          ) + 1;
        db.prepare(
          'INSERT INTO articles (id, revision, document) VALUES (?, ?, ?)',
        ).run(article.id, revision, JSON.stringify({ ...article, revision }));
      }
      for (const image of records.images)
        db.prepare(
          'INSERT OR IGNORE INTO images (name, type, data) VALUES (?, ?, ?)',
        ).run(image.name, image.type, image.bytes);
      for (const key of ['profiles', 'articles', 'images'])
        db.prepare(
          'INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)',
        ).run(key, '1');
      return {
        ...summary(records),
        recoveryFile: join('restore-backups', recoveryName),
        affectedProfileIds: [
          ...new Set([
            ...records.profiles.map((item) => item.profile.id),
            ...(records.scope === 'all'
              ? currentProfiles.map((profile) => profile.id)
              : []),
          ]),
        ],
        profiles: profilesSchema.parse(
          db
            .prepare('SELECT id, name, created FROM profiles ORDER BY rowid')
            .all(),
        ),
      };
    });
  }
}
