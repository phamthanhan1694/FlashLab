import { unzipSync, strFromU8 } from 'fflate';
import { parseDelimited } from './csv';

export async function readVocabularyFile(file: File): Promise<string[][]> {
  if (!/\.(xlsx|csv|tsv|txt)$/i.test(file.name))
    throw Error('Chỉ nhập từ vựng từ file .txt, .csv, .tsv hoặc .xlsx.');
  if (!file.name.toLowerCase().endsWith('.xlsx'))
    return parseDelimited(
      await file.text(),
      file.name.toLowerCase().endsWith('.tsv') ? '\t' : ',',
    );
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: (entry) => {
      if (entry.originalSize > 10000000) throw Error('Bảng tính quá lớn.');
      return (
        /^(xl\/(worksheets\/sheet\d+|sharedStrings|workbook)|xl\/_rels\/workbook.xml.rels).*\.xml$/.test(
          entry.name,
        ) || entry.name === 'xl/_rels/workbook.xml.rels'
      );
    },
  });
  const xml = (name: string) =>
    new DOMParser().parseFromString(
      strFromU8(entries[name] ?? new Uint8Array()),
      'application/xml',
    );
  const shared = Array.from(
    xml('xl/sharedStrings.xml').getElementsByTagName('si'),
  ).map((node) =>
    Array.from(node.getElementsByTagName('t'))
      .map((t) => t.textContent ?? '')
      .join(''),
  );
  const sheetId = xml('xl/workbook.xml')
    .getElementsByTagName('sheet')[0]
    ?.getAttribute('r:id');
  const target = Array.from(
    xml('xl/_rels/workbook.xml.rels').getElementsByTagName('Relationship'),
  )
    .find((r) => r.getAttribute('Id') === sheetId)
    ?.getAttribute('Target');
  const path = target
    ? target.startsWith('/')
      ? target.slice(1)
      : `xl/${target}`
    : 'xl/worksheets/sheet1.xml';
  if (!entries[path]) throw Error('Không đọc được trang tính đầu tiên.');
  const rows = Array.from(xml(path).getElementsByTagName('row')).map((row) => {
    const values: string[] = [];
    for (const cell of Array.from(row.getElementsByTagName('c'))) {
      const letters = cell.getAttribute('r')?.match(/^[A-Z]+/)?.[0] ?? 'A';
      const column =
        [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      if (column > 50) continue;
      const value = cell.getElementsByTagName('v')[0]?.textContent ?? '';
      values[column] =
        cell.getAttribute('t') === 's'
          ? (shared[Number(value)] ?? '')
          : cell.getAttribute('t') === 'inlineStr'
            ? Array.from(cell.getElementsByTagName('t'))
                .map((t) => t.textContent ?? '')
                .join('')
            : value;
    }
    return Array.from(
      { length: Math.max(2, values.length) },
      (_, i) => `"${(values[i] ?? '').replace(/"/g, '""')}"`,
    ).join(',');
  });
  return parseDelimited(rows.join('\n'), ',');
}
