import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  selectSpeechVoice,
  pronunciationKeyboard,
} from '../src/features/study/pronunciation';

test('speech selects the requested language without reading Asian text with an English voice', () => {
  const voices = ['en-US', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-HK'].map(
    (lang) => ({ lang }) as SpeechSynthesisVoice,
  );
  for (const language of ['ja-JP', 'ko-KR', 'zh-CN'])
    assert.equal(selectSpeechVoice(voices, language)?.lang, language);
  assert.equal(selectSpeechVoice(voices, 'zh-TW'), undefined);
  assert.equal(selectSpeechVoice(voices, 'fr-FR'), undefined);
  assert.equal(selectSpeechVoice(voices, 'en-GB')?.lang, 'en-US');
});

test('pronunciation keyboards provide appropriate input symbols for each language', () => {
  const symbols = (lang: string) =>
    pronunciationKeyboard(lang).groups.flatMap((group) => group.symbols);
  assert.ok(symbols('zh-CN').includes('ǐ'));
  assert.ok(symbols('zh-TW').includes('ㄋ'));
  assert.ok(symbols('ja-JP').includes('き'));
  assert.ok(symbols('ko-KR').includes('eo'));
  assert.ok(symbols('en-US').includes('ə'));
});
