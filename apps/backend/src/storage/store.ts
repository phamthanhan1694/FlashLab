import { readFile } from 'node:fs/promises';
import { snapshotSchema, type Snapshot } from '@flashlab/shared';

export class ConflictError extends Error {}

/** Read-only migration: original JSON files are never changed or deleted. */
export async function readLegacySnapshot(
  file: string,
  userId?: string,
): Promise<Snapshot> {
  try {
    const raw: unknown = JSON.parse(await readFile(file, 'utf8'));
    if (
      userId &&
      typeof raw === 'object' &&
      raw !== null &&
      'userId' in raw &&
      raw.userId !== userId
    )
      throw new Error('Stored user ID does not match its folder');
    return snapshotSchema.parse(raw);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
      return { revision: 0, data: null };
    throw error;
  }
}
