import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gradeTestMeanings } from '../src/features/study/test-grading';
const card = {
  back: 'sách',
  definitions: [{ meaning: 'đặt chỗ', partOfSpeech: 'v.' }, ' SÁCH '],
};
test('single answer accepts any complete meaning', () => {
  assert.equal(gradeTestMeanings(card, ['đặt chỗ'], false), true);
  assert.equal(gradeTestMeanings(card, ['sách', 'đặt chỗ'], false), false);
});
test('multiple answers require the exact set, in any order, without duplicates or blanks', () => {
  assert.equal(gradeTestMeanings(card, [' ĐẶT  CHỖ ', 'sách'], true), true);
  for (const answers of [
    [],
    ['sách'],
    ['sách', 'sách'],
    ['sách', 'đặt chỗ', 'sai'],
    ['sách', 'đặt chỗ', ''],
  ])
    assert.equal(gradeTestMeanings(card, answers, true), false);
});

test('multiple-answer headings are translated into English', async () => {
  const { translateText } = await import('../src/core/i18n');
  assert.equal(
    translateText('CÂU 3 · CÂU NHIỀU LỰA CHỌN', 'en'),
    'QUESTION 3 · SELECT MULTIPLE ANSWERS',
  );
  assert.equal(
    translateText('CÂU 4 · ĐIỀN NHIỀU ĐÁP ÁN', 'en'),
    'QUESTION 4 · WRITE MULTIPLE ANSWERS',
  );
});
