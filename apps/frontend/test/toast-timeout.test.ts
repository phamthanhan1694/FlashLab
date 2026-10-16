import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { notify } from '../src/ui/feedback';

test('success and error notifications dismiss automatically even while hovered or focused', async (t) => {
  const window = new Window();
  for (const key of ['document', 'NodeFilter'] as const) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: window[key],
    });
    t.after(() =>
      original
        ? Object.defineProperty(globalThis, key, original)
        : Reflect.deleteProperty(globalThis, key),
    );
  }
  t.after(() => window.happyDOM.abort());
  t.mock.timers.enable({ apis: ['setTimeout'] });
  window.document.body.innerHTML = '<div id="toast-root"></div>';
  notify('Đã lưu');
  window.document
    .querySelector('.toast')!
    .dispatchEvent(new window.Event('mouseenter'));
  t.mock.timers.tick(3999);
  assert.equal(window.document.querySelectorAll('.toast').length, 1);
  t.mock.timers.tick(1);
  assert.equal(window.document.querySelectorAll('.toast').length, 0);
  notify('Lỗi', true);
  window.document
    .querySelector('.toast')!
    .dispatchEvent(new window.Event('focusin'));
  t.mock.timers.tick(5999);
  assert.equal(window.document.querySelectorAll('.toast').length, 1);
  t.mock.timers.tick(1);
  assert.equal(window.document.querySelectorAll('.toast').length, 0);
});
