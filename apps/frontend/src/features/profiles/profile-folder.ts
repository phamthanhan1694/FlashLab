import {
  profileSchema,
  snapshotSchema,
  uniqueStateSchema,
} from '@flashlab/shared';
import { parseDelimited } from '../../core/csv';
import { id } from '../../core/utils';

export async function readProfileFolder(files: File[]) {
  const rootFiles = files.filter(
    (file) => file.webkitRelativePath.split('/').length === 2,
  );
  const user = rootFiles.find((file) => file.name === 'user.json');
  const state = rootFiles.find((file) => file.name === 'state.json');
  if (user || state) {
    if (!user || !state)
      throw new Error('Thư mục người dùng cần có cả user.json và state.json.');
    if (user.size > 10000 || state.size > 20_000_000)
      throw new Error('Thư mục vượt giới hạn kích thước dữ liệu.');
    return {
      profile: profileSchema.parse(JSON.parse(await user.text())),
      data: uniqueStateSchema.parse(
        snapshotSchema.parse(JSON.parse(await state.text())).data ?? {
          version: 2,
          decks: [],
          history: {},
          sessions: [],
        },
      ),
    };
  }
  const csvFiles = files.filter((file) => /\.csv$/i.test(file.name));
  if (!csvFiles.length)
    throw new Error(
      'Thư mục cần chứa file CSV hoặc dữ liệu người dùng đã xuất từ FlashLab.',
    );
  if (csvFiles.reduce((size, file) => size + file.size, 0) > 15_000_000)
    throw new Error('Tổng dung lượng CSV vượt quá 15 MB.');
  const profile = profileSchema.parse({
    id: id(),
    name: files[0]!.webkitRelativePath.split('/')[0],
    created: Date.now(),
  });
  const decks = [];
  for (const file of csvFiles) {
    const rows = parseDelimited(await file.text(), ',');
    if (!rows.length) throw new Error(`File ${file.name} không có thẻ hợp lệ.`);
    decks.push({
      id: id(),
      title: file.name.replace(/\.csv$/i, ''),
      description: '',
      color: 'purple',
      created: Date.now(),
      cards: rows.map(
        ([
          front,
          back,
          pronunciation,
          notes,
          language,
          partOfSpeech,
          definitions,
          image,
        ]) => ({
          id: id(),
          front,
          back,
          pronunciation,
          notes,
          image: image || undefined,
          speechLanguage: language || undefined,
          partOfSpeech,
          definitions: definitions ? JSON.parse(definitions) : undefined,
          starred: false,
          remembered: false,
        }),
      ),
    });
  }
  return {
    profile,
    data: uniqueStateSchema.parse({
      version: 2,
      decks,
      history: {},
      sessions: [],
    }),
  };
}
