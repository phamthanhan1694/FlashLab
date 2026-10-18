import { readFile, readdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { BlogAccessError } from './blog.js';
import { StorageDatabase } from './database.js';

const types: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};
export const imageNamePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|gif|webp)$/;
export function validateStoredImage(name: string, value: Uint8Array) {
  if (!imageNamePattern.test(name))
    throw new BlogAccessError('Tên ảnh không hợp lệ.', 400);
  const bytes = Buffer.from(value);
  const extension = name.split('.').at(-1)!;
  const valid =
    extension === 'png'
      ? bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : extension === 'jpg'
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : extension === 'gif'
          ? /^GIF8[79]a$/.test(bytes.subarray(0, 6).toString())
          : bytes.subarray(0, 4).toString() === 'RIFF' &&
            bytes.subarray(8, 12).toString() === 'WEBP';
  if (!valid || bytes.length > 2_000_000)
    throw new BlogAccessError(
      'Chọn ảnh PNG, JPEG, WebP hoặc GIF tối đa 2 MB.',
      400,
    );
  return { bytes, type: types[extension]! };
}
export async function readLegacyImages(directory: string) {
  let names: string[] = [];
  try {
    names = await readdir(directory);
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT'))
      throw error;
  }
  return Promise.all(
    names
      .filter((name) => imageNamePattern.test(name))
      .map(async (name) => ({
        name,
        ...validateStoredImage(name, await readFile(join(directory, name))),
      })),
  );
}
export class BlogImages {
  private initialization?: Promise<void>;
  constructor(
    private directory: string,
    private database: StorageDatabase,
  ) {}
  private async migrate() {
    if (this.database.migrated('images')) return;
    const images = await readLegacyImages(this.directory);
    this.database.transaction(() => {
      if (this.database.migrated('images')) return;
      for (const image of images)
        this.database.db
          .prepare('INSERT INTO images (name, type, data) VALUES (?, ?, ?)')
          .run(image.name, image.type, image.bytes);
      this.database.markMigrated('images');
    });
  }
  initialize() {
    return (this.initialization ??= this.migrate().catch((error) => {
      this.initialization = undefined;
      throw error;
    }));
  }
  async save(value: unknown) {
    const match =
      typeof value === 'string' &&
      value.match(
        /^data:image\/(png|jpeg|gif|webp);base64,([A-Za-z0-9+/]+={0,2})$/,
      );
    if (!match)
      throw new BlogAccessError(
        'Chọn ảnh PNG, JPEG, WebP hoặc GIF tối đa 2 MB.',
        400,
      );
    const name = `${randomUUID()}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`;
    const image = validateStoredImage(name, Buffer.from(match[2], 'base64'));
    await this.initialize();
    this.database.db
      .prepare('INSERT INTO images (name, type, data) VALUES (?, ?, ?)')
      .run(name, image.type, image.bytes);
    return { url: `/api/blog-images/${name}` };
  }
  async read(name: string) {
    if (!imageNamePattern.test(name))
      throw new BlogAccessError('Không tìm thấy ảnh.', 404);
    await this.initialize();
    const row = this.database.db
      .prepare('SELECT type, data FROM images WHERE name = ?')
      .get(name);
    if (!row || !(row.data instanceof Uint8Array))
      throw new BlogAccessError('Không tìm thấy ảnh.', 404);
    return { bytes: Buffer.from(row.data), type: String(row.type) };
  }
}
