export const partOptions = [
  ['Noun', 'Danh từ (n.)'],
  ['Pronoun', 'Đại từ (pron.)'],
  ['Verb', 'Động từ (v.)'],
  ['Adjective', 'Tính từ (adj.)'],
  ['Adverb', 'Trạng từ (adv.)'],
  ['Preposition', 'Giới từ (prep.)'],
  ['Conjunction', 'Liên từ (conj.)'],
  ['Interjection', 'Thán từ (interj.)'],
  ['Determiner', 'Từ hạn định (det.)'],
  ['Article', 'Mạo từ (art.)'],
  ['Auxiliary Verb', 'Trợ động từ (aux.)'],
  ['Modal Verb', 'Động từ khuyết thiếu (mod.)'],
  ['Numeral', 'Số từ (num.)'],
  ['Particle', 'Tiểu từ (part.)'],
  ['Predeterminer', 'Từ tiền hạn định (predet.)'],
  ['Quantifier', 'Từ chỉ lượng (quant.)'],
  ['Interrogative Word', 'Từ nghi vấn (interrog.)'],
  ['Relative Word', 'Từ quan hệ (rel.)'],
  ['Exclamation Word', 'Từ cảm thán (exclam.)'],
  ['Discourse Marker', 'Từ/cụm từ đánh dấu diễn ngôn (disc.)'],
  ['Infinitive Marker', 'Dấu hiệu động từ nguyên mẫu (inf.)'],
  ['Negative Marker', 'Từ phủ định (neg.)'],
  ['Existential There', 'Từ chỉ sự tồn tại (exist.)'],
];

/** Display metadata without changing the stored/imported part of speech. */
export function formatPartOfSpeech(
  value: string,
  language: 'vi' | 'en' = 'vi',
): string {
  const cleaned = value
    .trim()
    .replace(/^\((.*)\)$/, '$1')
    .trim();
  if (!cleaned) return '';
  for (const [english, vietnamese] of partOptions) {
    const abbreviation = vietnamese.match(/\(([^)]+)\)$/)?.[1];
    const name = vietnamese.replace(/ \([^)]+\)$/, '');
    const aliases = [
      english,
      vietnamese,
      name,
      `${name} (—)`,
      `${english} (—)`,
    ];
    if (english === 'Modal Verb')
      aliases.push(
        'modal',
        'Modal Verb (modal)',
        'Động từ khuyết thiếu (modal)',
      );
    if (abbreviation && abbreviation !== '—')
      aliases.push(
        abbreviation,
        abbreviation.replace(/\.$/, ''),
        `${english} (${abbreviation})`,
      );
    if (
      aliases.some(
        (alias) => alias.toLocaleLowerCase() === cleaned.toLocaleLowerCase(),
      )
    ) {
      return `(${abbreviation && abbreviation !== '—' ? abbreviation : language === 'en' ? english : name})`;
    }
  }
  return `(${cleaned})`;
}
