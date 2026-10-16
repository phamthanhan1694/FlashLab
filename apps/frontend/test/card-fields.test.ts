import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardSchema } from '@flashlab/shared';
import { parseDelimited } from '../src/core/csv';

test('optional card fields survive validation while old cards remain readable', () => {
  const old = { id: 'a', front: 'hello', back: 'xin chào' };
  assert.equal(cardSchema.parse(old).pronunciation, undefined);
  const card = cardSchema.parse({
    ...old,
    pronunciation: '/həˈləʊ/',
    notes: 'A greeting\nUsed daily',
  });
  assert.equal(card.pronunciation, '/həˈləʊ/');
  assert.equal(card.notes, 'A greeting\nUsed daily');
  assert.equal(
    cardSchema.safeParse({ ...old, pronunciation: 'x'.repeat(501) }).success,
    false,
  );
});

test('CSV reads optional fields with quoted commas and newlines and accepts old files', () => {
  assert.deepEqual(
    parseDelimited(
      'front,back,pronunciation,notes\nhello,xin chào,/həˈləʊ/,"A greeting, informal\nExample"',
    ),
    [['hello', 'xin chào', '/həˈləʊ/', 'A greeting, informal\nExample']],
  );
  assert.deepEqual(parseDelimited('front,back\nhello,xin chào'), [
    ['hello', 'xin chào'],
  ]);
});

test('Chinese, Japanese and Korean language settings survive schema and CSV parsing', () => {
  for (const speechLanguage of ['zh-CN', 'ja-JP', 'ko-KR']) {
    const card = cardSchema.parse({
      id: 'a',
      front: '你好',
      back: 'xin chào',
      speechLanguage,
    });
    assert.equal(card.speechLanguage, speechLanguage);
    assert.deepEqual(
      parseDelimited(
        `front,back,speechLanguage\n你好,xin chào,${speechLanguage}`,
      ),
      [['你好', 'xin chào', '', '', speechLanguage]],
    );
  }
});

test('five-column vocabulary imports preserve metadata with or without headers', () => {
  const expected = [['book', 'quyển sách', '/bʊk/', 'example', '', 'Danh từ']];
  assert.deepEqual(
    parseDelimited(
      'từ vựng\tnghĩa\ttừ loại\tphiên âm\tchú thích\nbook\tquyển sách\tDanh từ\t/bʊk/\texample',
    ),
    expected,
  );
  assert.deepEqual(
    parseDelimited('book\tquyển sách\tDanh từ\t/bʊk/\texample'),
    expected,
  );
  assert.deepEqual(parseDelimited('từ vựng,nghĩa\nbook,quyển sách'), [
    ['book', 'quyển sách'],
  ]);
  assert.throws(() => parseDelimited('book,quyển sách\nbad,'), /Dòng 2/);
  const card = cardSchema.parse({
    id: 'a',
    front: 'book',
    back: 'sách',
    partOfSpeech: 'Noun',
    image: 'data:image/png;base64,YQ==',
  });
  assert.equal(card.partOfSpeech, 'Noun');
  assert.equal(card.image, 'data:image/png;base64,YQ==');
  assert.equal(
    cardSchema.safeParse({ ...card, image: 'javascript:alert(1)' }).success,
    false,
  );
});

test('every built-in part of speech has a consistent English abbreviation', async () => {
  const { formatPartOfSpeech, partOptions } =
    await import('../src/core/parts-of-speech');
  for (const language of ['vi', 'en'] as const) {
    for (const value of [
      'Numeral',
      'Số từ',
      'Số từ (num.)',
      'num.',
      '(num.)',
    ]) {
      assert.equal(formatPartOfSpeech(value, language), '(num.)');
    }
    assert.equal(formatPartOfSpeech('Noun', language), '(n.)');
    assert.equal(formatPartOfSpeech('Modal Verb', language), '(mod.)');
    assert.equal(
      formatPartOfSpeech('Động từ khuyết thiếu (modal)', language),
      '(mod.)',
    );
    for (const [english, label] of partOptions) {
      const abbreviation = label.match(/\(([a-z]+\.)\)$/)?.[1];
      assert.ok(abbreviation, `${english} has an English abbreviation`);
      assert.equal(formatPartOfSpeech(english, language), `(${abbreviation})`);
      assert.equal(formatPartOfSpeech(label, language), `(${abbreviation})`);
      assert.equal(
        formatPartOfSpeech(abbreviation, language),
        `(${abbreviation})`,
      );
    }
    assert.equal(formatPartOfSpeech('', language), '');
  }
  assert.equal(formatPartOfSpeech('Interrogative Word', 'vi'), '(interrog.)');
  assert.equal(formatPartOfSpeech('Từ nghi vấn', 'en'), '(interrog.)');
  assert.equal(formatPartOfSpeech('Relative Word', 'vi'), '(rel.)');
  assert.equal(formatPartOfSpeech('Relative Word', 'en'), '(rel.)');
  assert.equal(formatPartOfSpeech('Từ quan hệ (—)', 'vi'), '(rel.)');
});

test('card images larger than the former 500 KB limit are accepted', () => {
  const image = 'data:image/png;base64,' + 'YWFh'.repeat(250000);
  assert.equal(
    cardSchema.parse({ id: 'large-image', front: 'book', back: 'sách', image })
      .image,
    image,
  );
});
