import { norm } from './utils';
import { partOptions } from './parts-of-speech';
function definitionsField(value: string) {
  const text = value.trim();
  if (!text) return '';
  if (text.startsWith('[')) return text;
  return JSON.stringify(
    text
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => {
        const separator = value.indexOf('::');
        if (separator < 0) return value;
        const partOfSpeech = value.slice(0, separator).trim();
        const meaning = value.slice(separator + 2).trim();
        if (!meaning) throw Error('Mỗi cặp từ loại phải có nghĩa đi kèm.');
        return { meaning, partOfSpeech };
      }),
  );
}
export function parseDelimited(text: string, delimiter?: ',' | '\t') {
  text = text.replace(/^\uFEFF/, '');
  const line = text.split(/\r?\n/, 1)[0];
  const separator = delimiter ?? (line.includes('\t') ? '\t' : ',');
  const rows: string[][] = [];
  let row: string[] = [],
    field = '',
    inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else field += ch;
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === separator) {
        row.push(field);
        field = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(field);
        if (row.some((v) => v.trim())) rows.push(row);
        row = [];
        field = '';
      } else field += ch;
    }
  }
  if (inQuote) throw new Error('File CSV có dấu nháy kép chưa đóng.');
  row.push(field);
  if (row.some((v) => v.trim())) rows.push(row);
  if (!rows.length) return [];
  // Five-field format: one cell contains all meaning/word-class pairs.
  const names = rows[0].map(norm);
  const canonical =
    names.includes('front') &&
    names.includes('definition') &&
    (names.includes('image') || !names.includes('partofspeech'));
  const legacyParts = new Set(
    partOptions.flatMap(([name, label]) => [
      norm(name),
      norm(label),
      norm(label.replace(/ \(.*$/, '')),
      norm(label.match(/\(([^)]+)\)/)?.[1] ?? ''),
    ]),
  );
  const fiveField =
    canonical ||
    (rows.some((row) => row.length > 2 || /::|[|]|^\[/.test(row[1] ?? '')) &&
      rows.every((row) => row.length <= 5) &&
      !rows.some((row) => row[2]?.trim() && legacyParts.has(norm(row[2]))));
  if (fiveField) {
    const positions = canonical
      ? ['front', 'definition', 'pronunciation', 'notes', 'image'].map((name) =>
          names.indexOf(name),
        )
      : [0, 1, 2, 3, 4];
    const data = canonical ? rows.slice(1) : rows;
    // Other named legacy formats keep their existing parser below.
    const legacyHeader =
      !canonical &&
      names.some((name) =>
        [
          'front',
          'term',
          'question',
          'thuật ngữ',
          'từ vựng',
          'mặt trước',
          'câu hỏi',
        ].includes(name),
      );
    if (!legacyHeader)
      return data.map((row, index) => {
        const [front, value, reading, notes, image] = positions.map(
          (position) => (row[position] ?? '').trim(),
        );
        const senses = JSON.parse(definitionsField(value) || '[]') as Array<
          string | { meaning: string; partOfSpeech?: string }
        >;
        const first = senses.shift();
        const back = typeof first === 'string' ? first : first?.meaning;
        if (!front || !back)
          throw Error(
            `Dòng ${index + 1}: thiếu từ vựng hoặc nghĩa. Chưa nhập thẻ nào.`,
          );
        if (senses.length > 19) throw Error('Mỗi thẻ có tối đa 20 nghĩa.');
        const pronunciation = reading.startsWith('{')
          ? JSON.parse(reading)
          : { text: reading };
        return [
          front,
          back,
          pronunciation.text ?? '',
          notes,
          pronunciation.language ?? '',
          typeof first === 'string' ? '' : (first?.partOfSpeech ?? ''),
          JSON.stringify(senses),
          image,
        ];
      });
  }
  let start = 0;
  let ixFront = 0,
    ixBack = 1;
  const headers = rows[0].map(norm);
  const f = headers.findIndex((h) =>
    [
      'front',
      'term',
      'question',
      'thuật ngữ',
      'mặt trước',
      'câu hỏi',
      'từ vựng',
    ].includes(h),
  );
  const b = headers.findIndex((h) =>
    [
      'back',
      'definition',
      'answer',
      'định nghĩa',
      'mặt sau',
      'đáp án',
      'nghĩa',
    ].includes(h),
  );
  if (f >= 0 && b >= 0) {
    start = 1;
    ixFront = f;
    ixBack = b;
  }
  const ixDefinitions = headers.findIndex((h) =>
    ['definitions', 'định nghĩa khác'].includes(h),
  );
  const ixPronunciation = headers.findIndex((h) =>
    ['pronunciation', 'ipa', 'phiên âm'].includes(h),
  );
  const ixNotes = headers.findIndex((h) =>
    ['notes', 'note', 'chú thích', 'ghi chú'].includes(h),
  );
  const ixLanguage = headers.findIndex((h) =>
    ['speechlanguage', 'language', 'ngôn ngữ'].includes(h),
  );
  const ixPart = headers.findIndex((h) =>
    ['partofspeech', 'part of speech', 'từ loại', 'loại từ'].includes(h),
  );
  const pairNumbers = start
    ? [
        ...new Set(
          headers.flatMap((header) => {
            const match = header.match(
              /^(?:back|definition|meaning|nghĩa|định nghĩa|partofspeech|part of speech|từ loại|loại từ)\s*(\d+)$/,
            );
            return match && Number(match[1]) >= 2 ? [Number(match[1])] : [];
          }),
        ),
      ].sort((a, b) => a - b)
    : [];
  const pairedColumns = pairNumbers.map((number) => ({
    number,
    meaningIndex: headers.findIndex((value) =>
      new RegExp(
        `^(?:back|definition|meaning|nghĩa|định nghĩa)\\s*${number}$`,
      ).test(value),
    ),
    partIndex: headers.findIndex((value) =>
      new RegExp(
        `^(?:partofspeech|part of speech|từ loại|loại từ)\\s*${number}$`,
      ).test(value),
    ),
  }));
  rows.slice(start).forEach((row, index) => {
    for (const pair of pairedColumns) {
      if (
        pair.partIndex >= 0 &&
        row[pair.partIndex]?.trim() &&
        !row[pair.meaningIndex]?.trim()
      )
        throw Error(
          `Dòng ${index + start + 1}: từ loại có nhưng thiếu nghĩa đi kèm.`,
        );
    }
  });
  const extraDefinitions = (row: string[]) => {
    const raw = start
      ? ixDefinitions >= 0
        ? (row[ixDefinitions] ?? '')
        : ''
      : (row[5] ?? '');
    const field = definitionsField(raw);
    if (!pairedColumns.length) return field;
    const definitions = field ? JSON.parse(field) : [];
    if (!Array.isArray(definitions))
      throw Error('Định nghĩa khác phải là danh sách nghĩa.');
    for (const pair of pairedColumns) {
      const meaning = row[pair.meaningIndex]?.trim();
      if (meaning)
        definitions.push({
          meaning,
          partOfSpeech:
            pair.partIndex >= 0 ? (row[pair.partIndex]?.trim() ?? '') : '',
        });
    }
    if (definitions.length > 19) throw Error('Mỗi thẻ có tối đa 20 nghĩa.');
    return JSON.stringify(definitions);
  };
  if (rows.length - start > 10000)
    throw Error('Tối đa 10.000 thẻ mỗi lần nhập.');
  rows.slice(start).forEach((row, i) => {
    if (!row[ixFront]?.trim() || !row[ixBack]?.trim())
      throw Error(
        `Dòng ${i + start + 1}: thiếu từ vựng hoặc nghĩa. Chưa nhập thẻ nào.`,
      );
  });
  return rows
    .slice(start)
    .map((row) => [
      String(row[ixFront] || '').trim(),
      String(row[ixBack] || '').trim(),
      start && ixPronunciation >= 0
        ? String(row[ixPronunciation] || '').trim()
        : !start
          ? String(row[3] || '').trim()
          : '',
      start && ixNotes >= 0
        ? String(row[ixNotes] || '').trim()
        : !start
          ? String(row[4] || '').trim()
          : '',
      start && ixLanguage >= 0
        ? String(row[ixLanguage] || '').trim()
        : !start
          ? String(row[6] || '').trim()
          : '',
      start
        ? ixPart >= 0
          ? String(row[ixPart] || '').trim()
          : ''
        : String(row[2] || '').trim(),
      extraDefinitions(row),
    ])
    .map((row) =>
      (start && (ixDefinitions >= 0 || pairedColumns.length > 0)) ||
      (!start && rows.some((r) => r.length > 5))
        ? row
        : ixPart >= 0 || (!start && rows.some((r) => r.length > 2))
          ? row.slice(0, 6)
          : start && ixLanguage >= 0
            ? row.slice(0, 5)
            : start && (ixPronunciation >= 0 || ixNotes >= 0)
              ? row.slice(0, 4)
              : row.slice(0, 2),
    )
    .filter(([a, b]) => a && b)
    .slice(0, 10000);
}
