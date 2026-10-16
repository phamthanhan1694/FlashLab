import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { zipSync, strToU8 } from 'fflate';
import { readVocabularyFile } from '../src/core/vocabulary-import';
import { renderMarkdown } from '../src/features/blog';

test('xlsx handles shared strings, inline strings and empty optional cells', async () => {
  const window = new Window();
  Object.assign(globalThis, { DOMParser: window.DOMParser });
  const bytes = zipSync({
    'xl/worksheets/sheet1.xml': strToU8(
      '<worksheet><sheetData><row><c r="A1" t="s"><v>0</v></c><c r="B1" t="inlineStr"><is><t>quyển sách</t></is></c><c r="C1" t="inlineStr"><is><t>Noun</t></is></c><c r="E1" t="inlineStr"><is><t>ghi chú</t></is></c></row></sheetData></worksheet>',
    ),
    'xl/sharedStrings.xml': strToU8('<sst><si><t>book</t></si></sst>'),
  });
  const file = new window.File([bytes], 'vocabulary.xlsx');
  assert.deepEqual(await readVocabularyFile(file as unknown as File), [
    ['book', 'quyển sách', '', 'ghi chú', '', 'Noun'],
  ]);
  await window.happyDOM.abort();
});

test('Markdown renders headings and code while keeping raw HTML inert', async () => {
  const browser = new Window();
  const html = renderMarkdown(
    '# Hello\n**world**\n<script>alert(1)</script>\n```\n<img onerror=x>\n```',
  );
  assert.ok(html.includes('<h1>Hello</h1>'));
  assert.ok(html.includes('<strong>world</strong>'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img'));
  await browser.happyDOM.abort();
});

test('text and CSV use five comma-separated fields including empty optional fields and quoted commas', async () => {
  const window = new Window();
  const file = new window.File(
    [
      'book,quyển sách,Noun,/bʊk/,Đồ dùng học tập\nhello,xin chào,,,\n"red, blue","đỏ, xanh",Adjective,,"a,b"',
    ],
    'words.txt',
  );
  const rows = await readVocabularyFile(file as unknown as File);
  assert.deepEqual(rows, [
    ['book', 'quyển sách', '/bʊk/', 'Đồ dùng học tập', '', 'Noun'],
    ['hello', 'xin chào', '', '', '', ''],
    ['red, blue', 'đỏ, xanh', '', 'a,b', '', 'Adjective'],
  ]);
  await assert.rejects(
    readVocabularyFile(
      new window.File(['int a,b;'], 'source.cpp') as unknown as File,
    ),
    /Chỉ nhập/,
  );
  await assert.rejects(
    readVocabularyFile(
      new window.File(['# Heading'], 'note.md') as unknown as File,
    ),
    /Chỉ nhập/,
  );
  await assert.rejects(
    readVocabularyFile(
      new window.File(['book,,Noun,,'], 'bad.csv') as unknown as File,
    ),
    /thiếu/,
  );
  await window.happyDOM.abort();
});

test('six-field text imports additional meanings without requiring optional fields', async () => {
  const window = new Window();
  const file = new window.File(
    [
      'book,quyển sách,Noun,/bʊk/,ghi chú,đặt chỗ|đặt trước\nhello,xin chào,,,,\nold,cũ',
    ],
    'six.txt',
  );
  assert.deepEqual(await readVocabularyFile(file as unknown as File), [
    [
      'book',
      'quyển sách',
      '/bʊk/',
      'ghi chú',
      '',
      'Noun',
      '["đặt chỗ","đặt trước"]',
    ],
    ['hello', 'xin chào', '', '', '', '', ''],
    ['old', 'cũ', '', '', '', '', ''],
  ]);
  const csv = new window.File(
    ['front,back,definitions\nbank,ngân hàng,bờ sông|bãi cát'],
    'six.csv',
  );
  assert.deepEqual(await readVocabularyFile(csv as unknown as File), [
    ['bank', 'ngân hàng', '', '', '', '', '["bờ sông","bãi cát"]'],
  ]);
  await window.happyDOM.abort();
});

test('paired text fields and explicit columns preserve separate word classes and optional language', async () => {
  const { parseDelimited } = await import('../src/core/csv');
  const quick = parseDelimited(
    'book,sách,n.,/bʊk/,ghi chú,v.::đặt chỗ|n.::sổ sách,en-GB',
    ',',
  )[0];
  assert.equal(quick[4], 'en-GB');
  assert.deepEqual(JSON.parse(quick[6]), [
    { meaning: 'đặt chỗ', partOfSpeech: 'v.' },
    { meaning: 'sổ sách', partOfSpeech: 'n.' },
  ]);
  const columns = parseDelimited(
    'partOfSpeech3,back2,front,partOfSpeech2,back,partOfSpeech,back3\nn.,đặt chỗ,book,v.,sách,n.,sổ sách',
  )[0];
  assert.deepEqual(JSON.parse(columns[6]), [
    { meaning: 'đặt chỗ', partOfSpeech: 'v.' },
    { meaning: 'sổ sách', partOfSpeech: 'n.' },
  ]);
  assert.throws(
    () => parseDelimited('front,back,partOfSpeech2\nbook,sách,v.'),
    /thiếu nghĩa/,
  );
  assert.throws(() => parseDelimited('book,sách,n.,,,v.::'), /phải có nghĩa/);
});

test('CSV, TXT and real XLSX exports round trip all meaning/word-class pairs including punctuation', async (t) => {
  const { cardSchema, cardsToCsv, cardSenses } =
    await import('@flashlab/shared');
  const { vocabularyToXlsx } = await import('../src/core/vocabulary-export');
  const browser = new Window();
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'DOMParser');
  Object.defineProperty(globalThis, 'DOMParser', {
    configurable: true,
    value: browser.DOMParser,
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'DOMParser', previous);
    else Reflect.deleteProperty(globalThis, 'DOMParser');
    return browser.happyDOM.abort();
  });
  const cards = [
    cardSchema.parse({
      id: 'pairs',
      front: 'book & "record"',
      back: 'sách',
      partOfSpeech: 'Noun',
      pronunciation: '/bʊk/',
      notes: 'line one\nline two, with | and ::',
      speechLanguage: 'en-GB',
      image: 'data:image/png;base64,YQ==',
      definitions: [
        { meaning: 'đặt, chỗ | trước::sau', partOfSpeech: 'Verb' },
        { meaning: 'sổ sách', partOfSpeech: 'Noun' },
      ],
    }),
    cardSchema.parse({
      id: 'single',
      front: '=literal text',
      back: 'một nghĩa',
    }),
  ];
  for (const extension of ['csv', 'txt', 'xlsx']) {
    const content =
      extension === 'xlsx' ? vocabularyToXlsx(cards) : cardsToCsv(cards);
    const file = new browser.File([content], `cards.${extension}`);
    const rows = await readVocabularyFile(file as unknown as File);
    assert.equal(rows.length, cards.length);
    rows.forEach(
      (
        [
          front,
          back,
          pronunciation,
          notes,
          speechLanguage,
          partOfSpeech,
          definitions,
          image,
        ],
        i,
      ) => {
        const restored = cardSchema.parse({
          id: 'restored',
          image: image || undefined,
          front,
          back,
          pronunciation,
          notes,
          speechLanguage: speechLanguage || undefined,
          partOfSpeech,
          definitions: definitions ? JSON.parse(definitions) : undefined,
        });
        assert.deepEqual(cardSenses(restored), cardSenses(cards[i]));
        assert.equal(restored.image, cards[i].image);
        assert.equal(restored.notes, cards[i].notes ?? '');
        assert.equal(restored.speechLanguage, cards[i].speechLanguage);
      },
    );
  }
});

test('five fields group meanings and keep reading, notes and image in their own cells', async () => {
  const { parseDelimited } = await import('../src/core/csv');
  assert.deepEqual(
    parseDelimited(
      'book,n.::sách|v.::đặt chỗ,/bʊk/,Ví dụ,data:image/png;base64;YQ==',
    ),
    [
      [
        'book',
        'sách',
        '/bʊk/',
        'Ví dụ',
        '',
        'n.',
        '[{"meaning":"đặt chỗ","partOfSpeech":"v."}]',
        'data:image/png;base64;YQ==',
      ],
    ],
  );
});

test('new definitions also work with only the two required fields', async () => {
  const { parseDelimited } = await import('../src/core/csv');
  for (const text of [
    'book,n.::sách|v.::đặt chỗ',
    'front,definition\nbook,n.::sách|v.::đặt chỗ',
  ]) {
    const [row] = parseDelimited(text);
    assert.equal(row[1], 'sách');
    assert.equal(row[5], 'n.');
    assert.deepEqual(JSON.parse(row[6]), [
      { meaning: 'đặt chỗ', partOfSpeech: 'v.' },
    ]);
  }
});
