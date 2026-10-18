import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { profileIdSchema, type Profile } from '@flashlab/shared';
import { ConflictError } from './store.js';
import { StorageDatabase } from './database.js';
export const articleInput = z.object({
  author: z.string().trim().min(1).max(60).optional(),
  title: z.string().trim().min(1).max(200),
  markdown: z.string().trim().min(1).max(200000),
});
export const articleSchema = articleInput.extend({
  author: z.string().trim().min(1).max(60),
  ownerId: profileIdSchema.optional(),
  id: z.string().uuid(),
  revision: z.number().int().positive(),
  created: z.number(),
  updated: z.number(),
});
const catalog = z.array(articleSchema);
export async function readLegacyArticles(directory: string) {
  try {
    return catalog.parse(
      JSON.parse(await readFile(join(directory, 'index.json'), 'utf8')),
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
      return [];
    throw error;
  }
}
export class BlogAccessError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}
export class BlogStore {
  private initialization?: Promise<void>;
  constructor(
    private directory: string,
    private database: StorageDatabase,
  ) {}
  private async migrate() {
    if (this.database.migrated('articles')) return;
    const articles = await readLegacyArticles(this.directory);
    this.database.transaction(() => {
      if (this.database.migrated('articles')) return;
      // Insert oldest first to preserve the old newest-first listing.
      for (const item of [...articles].reverse())
        this.database.db
          .prepare(
            'INSERT INTO articles (id, revision, document) VALUES (?, ?, ?)',
          )
          .run(item.id, item.revision, JSON.stringify(item));
      this.database.markMigrated('articles');
    });
  }
  private ready() {
    return (this.initialization ??= this.migrate().catch((error) => {
      this.initialization = undefined;
      throw error;
    }));
  }
  private records() {
    return catalog.parse(
      this.database.db
        .prepare('SELECT document FROM articles ORDER BY rowid DESC')
        .all()
        .map((row) => JSON.parse(String(row.document))),
    );
  }
  async list() {
    await this.ready();
    return this.records();
  }
  async save(
    body: z.infer<typeof articleInput>,
    owner: Profile,
    id?: string,
    revision?: number,
  ) {
    await this.ready();
    return this.database.transaction(() => {
      const previous = id ? this.records().find((a) => a.id === id) : undefined;
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
      const next = articleSchema.parse({
        ...body,
        author: body.author ?? previous?.author ?? owner.name,
        ownerId: owner.id,
        id: previous?.id ?? randomUUID(),
        revision: (previous?.revision ?? 0) + 1,
        created: previous?.created ?? Date.now(),
        updated: Date.now(),
      });
      this.database.db
        .prepare(
          'INSERT INTO articles (id, revision, document) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET revision = excluded.revision, document = excluded.document',
        )
        .run(next.id, next.revision, JSON.stringify(next));
      return next;
    });
  }
  async delete(id: string, ownerId: string, revision: number) {
    await this.ready();
    this.database.transaction(() => {
      const previous = this.records().find((a) => a.id === id);
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
      this.database.db.prepare('DELETE FROM articles WHERE id = ?').run(id);
    });
  }
}
