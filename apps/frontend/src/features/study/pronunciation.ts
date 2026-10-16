export const speechLanguages = [
  ['en-US', 'Tiếng Anh (Mỹ)', 'Ví dụ: /həˈloʊ/'],
  ['en-GB', 'Tiếng Anh (Anh)', 'Ví dụ: /həˈləʊ/'],
  ['zh-CN', 'Tiếng Trung (Quan thoại)', 'Ví dụ: nǐ hǎo'],
  ['zh-TW', 'Tiếng Trung (Đài Loan)', 'Ví dụ: ㄋㄧˇ ㄏㄠˇ'],
  ['ja-JP', 'Tiếng Nhật', 'Ví dụ: こんにちは / konnichiwa'],
  ['ko-KR', 'Tiếng Hàn', 'Ví dụ: 안녕하세요 / annyeonghaseyo'],
  ['vi-VN', 'Tiếng Việt', 'Nhập cách đọc nếu cần'],
  ['fr-FR', 'Tiếng Pháp', 'Ví dụ: /bɔ̃.ʒuʁ/'],
  ['de-DE', 'Tiếng Đức', 'Ví dụ: /ˈhaloː/'],
  ['es-ES', 'Tiếng Tây Ban Nha', 'Ví dụ: /ˈola/'],
] as const;

export function selectSpeechVoice(
  voices: readonly SpeechSynthesisVoice[],
  language: string,
) {
  const exact = voices.find(
    (voice) => voice.lang.toLowerCase() === language.toLowerCase(),
  );
  // Keep Chinese regional variants distinct instead of substituting Cantonese.
  return (
    exact ??
    (language.startsWith('zh-')
      ? undefined
      : voices.find(
          (voice) => voice.lang.split('-')[0] === language.split('-')[0],
        ))
  );
}

const englishIPA =
  'iː ɪ ʊ uː e ə ɜː ɔː æ ʌ ɑː ɒ eɪ aɪ ɔɪ əʊ aʊ ɪə eə ʊə p b t d k ɡ f v θ ð s z ʃ ʒ h tʃ dʒ m n ŋ l r j w ˈ ˌ ː /';
export function pronunciationKeyboard(language: string): {
  title: string;
  hint: string;
  groups: { label: string; symbols: string[] }[];
} {
  const group = (label: string, symbols: string) => ({
    label,
    symbols: symbols.split(' '),
  });
  if (language === 'zh-CN')
    return {
      title: 'Pinyin · dấu thanh',
      hint: 'Nhập âm bằng chữ Latin, dùng các nút để chèn nguyên âm có dấu thanh.',
      groups: [
        group('a · o · e', 'ā á ǎ à ō ó ǒ ò ē é ě è'),
        group('i · u · ü', 'ī í ǐ ì ū ú ǔ ù ü ǖ ǘ ǚ ǜ'),
        group('Tách âm', '’'),
      ],
    };
  if (language === 'zh-TW')
    return {
      title: 'Zhuyin · Chú âm',
      hint: 'Chèn ký hiệu Chú âm và dấu thanh; bạn cũng có thể nhập Pinyin.',
      groups: [
        group(
          'Phụ âm',
          'ㄅ ㄆ ㄇ ㄈ ㄉ ㄊ ㄋ ㄌ ㄍ ㄎ ㄏ ㄐ ㄑ ㄒ ㄓ ㄔ ㄕ ㄖ ㄗ ㄘ ㄙ',
        ),
        group('Nguyên âm', 'ㄧ ㄨ ㄩ ㄚ ㄛ ㄜ ㄝ ㄞ ㄟ ㄠ ㄡ ㄢ ㄣ ㄤ ㄥ ㄦ'),
        group('Dấu thanh', 'ˊ ˇ ˋ ˙'),
      ],
    };
  if (language === 'ja-JP')
    return {
      title: 'Kana · Hiragana',
      hint: 'Chèn Hiragana để ghi cách đọc; cũng có thể gõ Katakana hoặc Romaji trực tiếp.',
      groups: [
        group(
          'Âm cơ bản',
          'あ い う え お か き く け こ さ し す せ そ た ち つ て と な に ぬ ね の は ひ ふ へ ほ ま み む め も や ゆ よ ら り る れ ろ わ を ん',
        ),
        group(
          'Âm đục / bán đục',
          'が ぎ ぐ げ ご ざ じ ず ぜ ぞ だ ぢ づ で ど ば び ぶ べ ぼ ぱ ぴ ぷ ぺ ぽ',
        ),
        group('Âm nhỏ / trường âm', 'ゃ ゅ ょ っ ぁ ぃ ぅ ぇ ぉ ー'),
      ],
    };
  if (language === 'ko-KR')
    return {
      title: 'Tiếng Hàn · phiên âm Latin',
      hint: 'Gõ cách đọc bằng chữ Latin hoặc nhập Hangul trực tiếp bằng bàn phím tiếng Hàn.',
      groups: [
        group(
          'Nguyên âm',
          'a eo o u eu i ae e ya yeo yo yu yae ye wa wae oe wo we wi ui',
        ),
        group('Phụ âm', 'g kk n d tt r l m b pp s ss j jj ch k t p h ng'),
      ],
    };
  return {
    title: language.startsWith('en-')
      ? 'IPA · tiếng Anh'
      : 'IPA · ký tự thường dùng',
    hint: 'Bấm ký tự để chèn vào vị trí con trỏ. Bạn có thể gõ thêm ký tự trực tiếp.',
    groups: [
      group(
        'Nguyên âm & phụ âm',
        englishIPA +
          (language.startsWith('en-') ? '' : ' y ø œ ɛ ɐ ʁ ɲ ɣ β ʎ ̃'),
      ),
    ],
  };
}
