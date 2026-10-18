import {
  cardsToCsv,
  profilesSchema,
  profileIdSchema,
  normalizeTerm,
  snapshotSchema,
  type Profile,
  type AppData,
  type Snapshot,
} from '@flashlab/shared';
import { readFile, access } from 'node:fs/promises';
import { zipSync, strToU8 } from 'fflate';
import { randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { StorageDatabase } from './database.js';
import { readLegacySnapshot, ConflictError } from './store.js';
import { articleSchema, readLegacyArticles } from './blog.js';
import { readLegacyImages, validateStoredImage } from './blog-images.js';

export class ProfileError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}
const missing = (error: unknown) =>
  error instanceof Error && 'code' in error && error.code === 'ENOENT';

export class Profiles {
  readonly root: string;
  readonly database: StorageDatabase;
  private initialization?: Promise<void>;
  constructor(
    private legacyFile: string,
    root?: string,
  ) {
    this.root = resolve(root ?? join(dirname(legacyFile), 'storage'));
    this.database = new StorageDatabase(this.root);
  }
  private async exists(file: string) {
    try {
      await access(file);
      return true;
    } catch (error) {
      if (missing(error)) return false;
      throw error;
    }
  }
  private registry(): Profile[] {
    return profilesSchema.parse(
      this.database.db
        .prepare('SELECT id, name, created FROM profiles ORDER BY rowid')
        .all(),
    );
  }
  private snapshot(id: string): Snapshot {
    const row = this.database.db
      .prepare('SELECT revision, data FROM profile_states WHERE profile_id = ?')
      .get(id);
    if (!row) throw new ProfileError('Người dùng không còn tồn tại.', 404);
    return snapshotSchema.parse({
      revision: row.revision,
      data: row.data === null ? null : JSON.parse(String(row.data)),
    });
  }
  private insert(profile: Profile, snapshot: Snapshot) {
    this.database.db
      .prepare(
        'INSERT INTO profiles (id, name, normalized_name, created) VALUES (?, ?, ?, ?)',
      )
      .run(
        profile.id,
        profile.name,
        normalizeTerm(profile.name),
        profile.created,
      );
    this.database.db
      .prepare(
        'INSERT INTO profile_states (profile_id, revision, data) VALUES (?, ?, ?)',
      )
      .run(
        profile.id,
        snapshot.revision,
        snapshot.data === null ? null : JSON.stringify(snapshot.data),
      );
  }
  private async migrate() {
    if (this.database.migrated('profiles')) return;
    let records: { profile: Profile; snapshot: Snapshot }[];
    let movedArticles:
      Awaited<ReturnType<typeof readLegacyArticles>> | undefined;
    let movedImages: Awaited<ReturnType<typeof readLegacyImages>> | undefined;
    const defaultRoot = resolve(join(dirname(this.legacyFile), 'storage'));
    if (
      !(await this.exists(join(this.root, 'profiles.json'))) &&
      defaultRoot !== this.root &&
      (await this.exists(join(defaultRoot, 'flashlab.sqlite')))
    ) {
      const source = new DatabaseSync(join(defaultRoot, 'flashlab.sqlite'), {
        readOnly: true,
      });
      try {
        source.exec('BEGIN');
        const profiles = profilesSchema.parse(
          source
            .prepare('SELECT id, name, created FROM profiles ORDER BY rowid')
            .all(),
        );
        records = profiles.map((profile) => {
          const row = source
            .prepare(
              'SELECT revision, data FROM profile_states WHERE profile_id = ?',
            )
            .get(profile.id);
          if (!row) throw new Error('Missing source profile state');
          return {
            profile,
            snapshot: snapshotSchema.parse({
              revision: row.revision,
              data: row.data === null ? null : JSON.parse(String(row.data)),
            }),
          };
        });
        if (
          source.prepare('SELECT 1 FROM metadata WHERE key = ?').get('articles')
        ) {
          movedArticles = source
            .prepare('SELECT document FROM articles ORDER BY rowid')
            .all()
            .map((row) =>
              articleSchema.parse(JSON.parse(String(row.document))),
            );
        }
        if (
          source.prepare('SELECT 1 FROM metadata WHERE key = ?').get('images')
        ) {
          movedImages = source
            .prepare('SELECT name, data FROM images')
            .all()
            .map((row) => {
              if (!(row.data instanceof Uint8Array))
                throw new Error('Invalid stored image');
              return {
                name: String(row.name),
                ...validateStoredImage(String(row.name), row.data),
              };
            });
        }
        source.exec('COMMIT');
      } finally {
        source.close();
      }
      movedArticles ??= await readLegacyArticles(join(defaultRoot, 'blog'));
      movedImages ??= await readLegacyImages(
        join(defaultRoot, 'blog', 'images'),
      );
    } else {
      let sourceRoot: string | undefined;
      if (await this.exists(join(this.root, 'profiles.json')))
        sourceRoot = this.root;
      else if (
        defaultRoot !== this.root &&
        (await this.exists(join(defaultRoot, 'profiles.json')))
      )
        sourceRoot = defaultRoot;
      let profiles: Profile[];
      try {
        profiles = profilesSchema.parse(
          JSON.parse(
            await readFile(
              sourceRoot
                ? join(sourceRoot, 'profiles.json')
                : `${this.legacyFile}.profiles.json`,
              'utf8',
            ),
          ),
        );
      } catch (error) {
        if (!missing(error)) throw error;
        profiles = [
          { id: 'default', name: 'Người dùng mặc định', created: Date.now() },
        ];
      }
      records = await Promise.all(
        profiles.map(async (profile) => ({
          profile,
          snapshot: await readLegacySnapshot(
            sourceRoot
              ? join(sourceRoot, profile.id, 'state.json')
              : profile.id === 'default'
                ? this.legacyFile
                : `${this.legacyFile}.profiles/${profile.id}.json`,
            profile.id,
          ),
        })),
      );
    }
    // Validate every source before importing any row. A failed migration remains retryable.
    this.database.transaction(() => {
      if (this.database.migrated('profiles')) return;
      for (const record of records)
        this.insert(record.profile, record.snapshot);
      if (movedArticles) {
        for (const article of movedArticles)
          this.database.db
            .prepare(
              'INSERT OR REPLACE INTO articles (id, revision, document) VALUES (?, ?, ?)',
            )
            .run(article.id, article.revision, JSON.stringify(article));
        this.database.db
          .prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)')
          .run('articles', '1');
      }
      if (movedImages) {
        for (const image of movedImages)
          this.database.db
            .prepare(
              'INSERT OR REPLACE INTO images (name, type, data) VALUES (?, ?, ?)',
            )
            .run(image.name, image.type, image.bytes);
        this.database.db
          .prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)')
          .run('images', '1');
      }
      this.database.markMigrated('profiles');
    });
  }
  private ready() {
    return (this.initialization ??= this.migrate().catch((error) => {
      this.initialization = undefined;
      throw error;
    }));
  }
  private checkName(profiles: Profile[], name: string, except?: string) {
    if (!except && profiles.length >= 50)
      throw new ProfileError('Tối đa 50 người dùng.', 400);
    if (
      profiles.some(
        (p) => p.id !== except && normalizeTerm(p.name) === normalizeTerm(name),
      )
    )
      throw new ProfileError('Tên người dùng đã tồn tại với ID khác.', 409);
  }
  private updateState(id: string, revision: number, data: AppData) {
    const current = this.snapshot(id);
    if (current.revision !== revision)
      throw new ConflictError('State changed; reload before saving');
    const next = snapshotSchema.parse({ revision: revision + 1, data });
    this.database.db
      .prepare(
        'UPDATE profile_states SET revision = ?, data = ? WHERE profile_id = ? AND revision = ?',
      )
      .run(next.revision, JSON.stringify(next.data), id, revision);
    return next;
  }
  async list() {
    await this.ready();
    return this.registry();
  }
  async create(name: string) {
    await this.ready();
    return this.database.transaction(() => {
      this.checkName(this.registry(), name);
      const profile = { id: randomUUID(), name, created: Date.now() };
      this.insert(profile, {
        revision: 1,
        data: { version: 2, decks: [], sessions: [], history: {} },
      });
      return profile;
    });
  }
  async rename(id: string, name: string) {
    await this.ready();
    return this.database.transaction(() => {
      const profiles = this.registry();
      const profile = profiles.find((p) => p.id === id);
      if (!profile)
        throw new ProfileError('Người dùng không còn tồn tại.', 404);
      this.checkName(profiles, name, id);
      this.database.db
        .prepare(
          'UPDATE profiles SET name = ?, normalized_name = ? WHERE id = ?',
        )
        .run(name, normalizeTerm(name), id);
      return { ...profile, name };
    });
  }
  async exportFolder(id: string) {
    await this.ready();
    return this.database.transaction(() => {
      const snapshot = this.snapshot(id);
      const profile = this.registry().find((p) => p.id === id)!;
      const files: Record<string, Uint8Array> = {};
      const add = (name: string, text: string) => {
        files[`${id}/${name}`] = strToU8(text);
      };
      add('user.json', JSON.stringify(profile, null, 2));
      add('state.json', JSON.stringify(snapshot, null, 2));
      const index = [];
      for (const [i, deck] of (snapshot.data?.decks ?? []).entries()) {
        const file = `deck-${i + 1}.csv`;
        add(`materials/${file}`, cardsToCsv(deck.cards));
        index.push({ id: deck.id, title: deck.title, file });
      }
      add(
        'materials/index.json',
        JSON.stringify({ userId: id, decks: index }, null, 2),
      );
      return Buffer.from(zipSync(files));
    });
  }
  async delete(id: string) {
    await this.ready();
    this.database.transaction(() => {
      const profiles = this.registry();
      if (!profiles.some((p) => p.id === id))
        throw new ProfileError('Người dùng không còn tồn tại.', 404);
      if (profiles.length === 1)
        throw new ProfileError('Cần giữ lại ít nhất một người dùng.', 400);
      this.database.db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
    });
  }
  async read(id: string) {
    await this.ready();
    return this.snapshot(id);
  }
  async update(id: string, revision: number, data: AppData) {
    await this.ready();
    return this.database.transaction(() =>
      this.updateState(id, revision, data),
    );
  }
  async restore(
    id: string,
    name: string | undefined,
    revision: number | null,
    data: AppData,
    created?: number,
  ) {
    profileIdSchema.parse(id);
    await this.ready();
    return this.database.transaction(() => {
      const profiles = this.registry();
      const existing = profiles.find((p) => p.id === id);
      if (existing) {
        if (revision === null)
          throw new ConflictError(
            'Người dùng vừa được tạo. Hãy tải lại danh sách trước khi nhập.',
          );
        return {
          profile: existing,
          snapshot: this.updateState(id, revision, data),
        };
      }
      if (revision !== null)
        throw new ConflictError(
          'Người dùng vừa bị xóa. Hãy kiểm tra lại trước khi khôi phục.',
        );
      if (!name)
        throw new ProfileError(
          'Bản sao lưu cần có tên người dùng để khôi phục hồ sơ mới.',
          400,
        );
      this.checkName(profiles, name);
      const profile = { id, name, created: created ?? Date.now() };
      const snapshot = snapshotSchema.parse({ revision: 1, data });
      this.insert(profile, snapshot);
      return { profile, snapshot };
    });
  }
  close() {
    this.database.close();
  }
}
