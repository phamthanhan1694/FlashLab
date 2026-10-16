import { cardsToCsv } from '@flashlab/shared';
import { readFile, access, rm, mkdir } from 'node:fs/promises';
import { zipSync, strToU8 } from 'fflate';
import { randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import {
  profilesSchema,
  profileIdSchema,
  normalizeTerm,
  type Profile,
  type AppData,
} from '@flashlab/shared';
import { FileStore, writeAtomic, ConflictError } from './store.js';

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

/** Registry/state operations share a queue so imports and deletion cannot race with saves. */
export class Profiles {
  private queue: Promise<unknown> = Promise.resolve();
  private stores = new Map<string, FileStore>();
  readonly root: string;
  constructor(
    private legacyFile: string,
    root?: string,
  ) {
    this.root = resolve(root ?? join(dirname(legacyFile), 'storage'));
  }
  private run<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation);
    this.queue = result.catch(() => undefined);
    return result;
  }
  private get registryFile() {
    return join(this.root, 'profiles.json');
  }
  private folder(id: string) {
    return join(this.root, profileIdSchema.parse(id));
  }
  private stateFile(id: string) {
    return join(this.folder(id), 'state.json');
  }
  private createStore(id: string) {
    return new FileStore(
      this.stateFile(id),
      id,
      join(this.folder(id), 'materials'),
    );
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
  private async registry(): Promise<Profile[]> {
    try {
      return profilesSchema.parse(
        JSON.parse(await readFile(this.registryFile, 'utf8')),
      );
    } catch (error) {
      if (!missing(error)) throw error;
    }
    // Copy without deleting originals; prefer the current default storage when moving to another disk.
    const defaultRoot = resolve(join(dirname(this.legacyFile), 'storage'));
    const sourceRoot =
      defaultRoot !== this.root &&
      (await this.exists(join(defaultRoot, 'profiles.json')))
        ? defaultRoot
        : undefined;
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
    for (const profile of profiles) {
      const destination = this.stateFile(profile.id);
      if (await this.exists(destination)) {
        await this.createStore(profile.id).read();
      } else {
        const source = sourceRoot
          ? join(sourceRoot, profile.id, 'state.json')
          : profile.id === 'default'
            ? this.legacyFile
            : `${this.legacyFile}.profiles/${profile.id}.json`;
        const snapshot = await new FileStore(source, profile.id).read();
        await writeAtomic(destination, { ...snapshot, userId: profile.id });
        await this.createStore(profile.id).read();
      }
      await writeAtomic(join(this.folder(profile.id), 'user.json'), profile);
    }
    await writeAtomic(this.registryFile, profiles);
    return profiles;
  }
  private async store(id: string) {
    const profiles = await this.registry();
    if (!profiles.some((p) => p.id === id))
      throw new ProfileError('Người dùng không còn tồn tại.', 404);
    let store = this.stores.get(id);
    if (!store) {
      store = this.createStore(id);
      this.stores.set(id, store);
    }
    return store;
  }
  private checkName(profiles: Profile[], name: string) {
    if (profiles.length >= 50)
      throw new ProfileError('Tối đa 50 người dùng.', 400);
    if (profiles.some((p) => normalizeTerm(p.name) === normalizeTerm(name)))
      throw new ProfileError('Tên người dùng đã tồn tại với ID khác.', 409);
  }
  private async add(profiles: Profile[], profile: Profile, data: AppData) {
    // Never overwrite an orphaned/external folder with an unregistered ID.
    if (await this.exists(this.folder(profile.id)))
      throw new ProfileError(
        'Thư mục ID này đã tồn tại nhưng chưa có trong danh sách người dùng.',
        409,
      );
    try {
      await mkdir(this.folder(profile.id), { mode: 0o700 });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'EEXIST')
        throw new ProfileError('Thư mục ID này đã tồn tại.', 409);
      throw error;
    }
    try {
      const store = this.createStore(profile.id);
      const snapshot = await store.update(0, data);
      await writeAtomic(join(this.folder(profile.id), 'user.json'), profile);
      await writeAtomic(this.registryFile, [...profiles, profile]);
      this.stores.set(profile.id, store);
      return snapshot;
    } catch (error) {
      await rm(this.folder(profile.id), { recursive: true, force: true }).catch(
        () => undefined,
      );
      throw error;
    }
  }

  list() {
    return this.run(async () => {
      const profiles = await this.registry();
      for (const profile of profiles)
        await (await this.store(profile.id)).read();
      return profiles;
    });
  }
  create(name: string) {
    return this.run(async () => {
      const profiles = await this.registry();
      this.checkName(profiles, name);
      let id: string;
      do {
        id = randomUUID();
      } while (
        profiles.some((p) => p.id === id) ||
        (await this.exists(this.folder(id)))
      );
      const profile = { id, name, created: Date.now() };
      await this.add(profiles, profile, {
        version: 2,
        decks: [],
        sessions: [],
        history: {},
      });
      return profile;
    });
  }
  rename(id: string, name: string) {
    return this.run(async () => {
      const profiles = await this.registry();
      const profile = profiles.find((p) => p.id === id);
      if (!profile)
        throw new ProfileError('Người dùng không còn tồn tại.', 404);
      if (
        profiles.some(
          (p) => p.id !== id && normalizeTerm(p.name) === normalizeTerm(name),
        )
      )
        throw new ProfileError('Tên người dùng đã tồn tại với ID khác.', 409);
      const updated = { ...profile, name };
      await writeAtomic(
        this.registryFile,
        profiles.map((p) => (p.id === id ? updated : p)),
      );
      await writeAtomic(join(this.folder(id), 'user.json'), updated);
      return updated;
    });
  }
  exportFolder(id: string) {
    return this.run(async () => {
      const store = await this.store(id);
      const profile = (await this.registry()).find((p) => p.id === id)!;
      const snapshot = await store.read();
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
  delete(id: string) {
    return this.run(async () => {
      const profiles = await this.registry();
      if (!profiles.some((p) => p.id === id))
        throw new ProfileError('Người dùng không còn tồn tại.', 404);
      if (profiles.length === 1)
        throw new ProfileError('Cần giữ lại ít nhất một người dùng.', 400);
      await writeAtomic(
        this.registryFile,
        profiles.filter((p) => p.id !== id),
      );
      await rm(this.folder(id), { recursive: true, force: true });
      this.stores.delete(id);
    });
  }
  read(id: string) {
    return this.run(async () => (await this.store(id)).read());
  }
  update(id: string, revision: number, data: AppData) {
    return this.run(async () => (await this.store(id)).update(revision, data));
  }
  restore(
    id: string,
    name: string | undefined,
    revision: number | null,
    data: AppData,
    created?: number,
  ) {
    return this.run(async () => {
      const profiles = await this.registry();
      const existing = profiles.find((p) => p.id === id);
      if (existing) {
        if (revision === null)
          throw new ConflictError(
            'Người dùng vừa được tạo. Hãy tải lại danh sách trước khi nhập.',
          );
        const store = this.stores.get(id) ?? this.createStore(id);
        this.stores.set(id, store);
        return {
          profile: existing,
          snapshot: await store.update(revision, data),
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
      return { profile, snapshot: await this.add(profiles, profile, data) };
    });
  }
}
