import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { BlogAccessError } from './blog.js';

const types: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};
export class BlogImages {
  constructor(private directory: string) {}
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
    const bytes = Buffer.from(match[2], 'base64');
    const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
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
    await mkdir(this.directory, { recursive: true });
    const name = `${randomUUID()}.${extension}`;
    await writeFile(join(this.directory, name), bytes, { flag: 'wx' });
    return { url: `/api/blog-images/${name}` };
  }
  async read(name: string) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|gif|webp)$/.test(
        name,
      )
    )
      throw new BlogAccessError('Không tìm thấy ảnh.', 404);
    try {
      return {
        bytes: await readFile(join(this.directory, name)),
        type: types[name.split('.').at(-1)!],
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        throw new BlogAccessError('Không tìm thấy ảnh.', 404);
      throw error;
    }
  }
}
