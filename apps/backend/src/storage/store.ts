import {
  mkdir,
  readFile,
  rename,
  writeFile,
  unlink,
  readdir,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import {
  cardsToCsv,
  snapshotSchema,
  type AppData,
  type Snapshot,
} from '@flashlab/shared';

export async function writeAtomic(file: string, value: unknown) {
  await writeTextAtomic(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeTextAtomic(file: string, content: string) {
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, content, {
      encoding: 'utf8',
      mode: 0o600,
      flag: 'wx',
    });
    await rename(temporary, file);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

/** CSV files are derived from state.json, never used to replace study progress. */
async function writeMaterials(
  directory: string,
  snapshot: Snapshot,
  userId: string,
) {
  await mkdir(directory, { recursive: true });
  const decks = snapshot.data?.decks ?? [];
  const files = new Set<string>();
  const index = [];
  for (const deck of decks) {
    // Hash the complete ID so imported IDs cannot escape the storage folder.
    const file = `deck-${createHash('sha256').update(deck.id).digest('hex')}.csv`;
    files.add(file);
    const csv = cardsToCsv(deck.cards);
    const path = join(directory, file);
    let existing: string | undefined;
    try {
      existing = await readFile(path, 'utf8');
    } catch (error) {
      if (!(
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ))
        throw error;
    }
    if (existing !== csv) await writeTextAtomic(path, csv);
    index.push({
      id: deck.id,
      title: deck.title,
      file,
      cards: deck.cards.length,
    });
  }
  await writeAtomic(join(directory, 'index.json'), {
    userId,
    revision: snapshot.revision,
    decks: index,
  });
  for (const file of await readdir(directory)) {
    if (/^deck-[a-f0-9]{64}\.csv$/.test(file) && !files.has(file))
      await unlink(join(directory, file));
  }
}

export class ConflictError extends Error {}

/** Single server process; writes are serialized and atomically replace the file. */
export class FileStore {
  private queue: Promise<unknown> = Promise.resolve();
  private materialsRevision: number | undefined;
  constructor(
    private readonly file: string,
    private readonly userId?: string,
    private readonly materialsDirectory?: string,
  ) {}

  private async exportMaterials(snapshot: Snapshot) {
    if (
      this.materialsDirectory &&
      this.userId &&
      this.materialsRevision !== snapshot.revision
    ) {
      await writeMaterials(this.materialsDirectory, snapshot, this.userId);
      this.materialsRevision = snapshot.revision;
    }
  }

  async read(): Promise<Snapshot> {
    let snapshot: Snapshot;
    try {
      const raw: unknown = JSON.parse(await readFile(this.file, 'utf8'));
      if (
        this.userId &&
        typeof raw === 'object' &&
        raw !== null &&
        'userId' in raw &&
        raw.userId !== this.userId
      )
        throw new Error('Stored user ID does not match its folder');
      snapshot = snapshotSchema.parse(raw);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        snapshot = { revision: 0, data: null };
      else throw error; // Never overwrite corrupt or unreadable state.
    }
    await this.exportMaterials(snapshot);
    return snapshot;
  }

  update(revision: number, data: AppData): Promise<Snapshot> {
    const operation = this.queue.then(async () => {
      const current = await this.read();
      if (current.revision !== revision)
        throw new ConflictError('State changed; reload before saving');
      const next = snapshotSchema.parse({ revision: revision + 1, data });
      await writeAtomic(
        this.file,
        this.userId ? { ...next, userId: this.userId } : next,
      );
      await this.exportMaterials(next);
      return next;
    });
    this.queue = operation.catch(() => undefined);
    return operation;
  }
}
