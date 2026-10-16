import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window, type HTMLButtonElement } from 'happy-dom';
import { initializeLanguage, translateText } from '../src/core/i18n';
import { notify } from '../src/ui/feedback';

test('notification title and message use the selected language and switch together', async (t) => {
  const window = new Window();
  for (const key of ['document', 'NodeFilter', 'MutationObserver'] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: window[key],
    });
    t.after(() =>
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : Reflect.deleteProperty(globalThis, key),
    );
  }
  t.after(() => window.happyDOM.abort());
  window.document.body.innerHTML =
    '<button data-language="vi"></button><button data-language="en"></button><div id="toast-root"></div><div class="card-term"><span data-user-content>one</span><small data-user-content data-part-of-speech="Numeral"></small><small data-user-content data-part-of-speech="Interrogative Word"></small></div>';
  initializeLanguage('vi', () => {});
  const parts = () =>
    Array.from(
      window.document.querySelectorAll('[data-part-of-speech]'),
      (element) => element.textContent,
    );
  assert.deepEqual(parts(), ['(num.)', '(interrog.)']);
  const message =
    'Dữ liệu đã thay đổi ở cửa sổ khác. Thay đổi chưa lưu vẫn được giữ trên trình duyệt.';
  notify(message, true);
  assert.equal(
    window.document.querySelector('.toast strong')?.textContent,
    'Chưa thực hiện được',
  );
  assert.equal(window.document.querySelector('.toast p')?.textContent, message);
  window.document
    .querySelector<HTMLButtonElement>('[data-language="en"]')!
    .click();
  assert.equal(
    window.document.querySelector('.toast strong')?.textContent,
    'Unable to complete',
  );
  assert.deepEqual(parts(), ['(num.)', '(interrog.)']);
  assert.equal(
    window.document.querySelector('.card-term span')?.textContent,
    'one',
  );
  assert.equal(
    window.document.querySelector('.toast p')?.textContent,
    translateText(message, 'en'),
  );
  window.document
    .querySelector<HTMLButtonElement>('[data-language="vi"]')!
    .click();
  assert.equal(
    window.document.querySelector('.toast strong')?.textContent,
    'Chưa thực hiện được',
  );
  assert.equal(window.document.querySelector('.toast p')?.textContent, message);
  assert.deepEqual(parts(), ['(num.)', '(interrog.)']);
  window.document.querySelector<HTMLButtonElement>('.toast-close')!.click();
  window.document
    .querySelector<HTMLButtonElement>('[data-language="en"]')!
    .click();
  notify(message, true);
  assert.equal(
    window.document.querySelector('.toast p')?.textContent,
    translateText(message, 'en'),
  );
  window.document.querySelector<HTMLButtonElement>('.toast-close')!.click();
});

test('sync errors translate fully while embedded user content is preserved', () => {
  for (const message of [
    'Bản trên trình duyệt và máy chủ khác nhau. Thay đổi chưa lưu được giữ lại. Mở Cài đặt → Xử lý đồng bộ để tiếp tục.',
    'Máy chủ phản hồi quá lâu. Thay đổi vẫn được giữ trên trình duyệt.',
    'Không lưu được dữ liệu (mã 503). Thay đổi vẫn được giữ trên trình duyệt.',
  ]) {
    assert.notEqual(translateText(message, 'en'), message);
    assert.equal(translateText(message, 'vi'), message);
  }
  assert.equal(
    translateText('Internal server error', 'vi'),
    'Lỗi máy chủ. Hãy thử lại.',
  );
  assert.equal(
    translateText(
      'Thuật ngữ “Xin chào” bị trùng trong học phần “Tiếng Việt”.',
      'en',
    ),
    'The term “Xin chào” is duplicated in the study set “Tiếng Việt”.',
  );
});
