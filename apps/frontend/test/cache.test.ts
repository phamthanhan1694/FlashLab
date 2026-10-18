import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { BrowserCache } from '../src/core/cache';

function fixture(t: TestContext) {
  const values = new Map<string, string>();
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: () => {
      throw new Error('Large snapshots must never be written to localStorage');
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });
  const factory = new IDBFactory();
  const cache = new BrowserCache(() => factory);
  t.after(async () => {
    await cache.close();
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });
  return { cache, factory, values };
}

test('pending legacy snapshots migrate once and survive reopening IndexedDB', async (t) => {
  const { cache, factory, values } = fixture(t);
  const snapshot = {
    revision: 7,
    pending: true,
    data: { history: { today: 2 } },
    base: { history: {} },
  };
  values.set('flashlab.server.v1', JSON.stringify(snapshot));
  assert.deepEqual(await cache.read('flashlab.server.v1'), snapshot);
  assert.equal(values.has('flashlab.server.v1'), false);
  await cache.close();
  const reopened = new BrowserCache(() => factory);
  t.after(() => reopened.close());
  assert.deepEqual(await reopened.read('flashlab.server.v1'), snapshot);
});

test('quota failures preserve legacy originals and report failed new writes', async (t) => {
  const { cache, values } = fixture(t);
  values.set('legacy', JSON.stringify({ important: true }));
  t.mock.method(IDBObjectStore.prototype, 'put', () => {
    throw new DOMException('quota', 'QuotaExceededError');
  });
  assert.deepEqual(await cache.read('legacy'), { important: true });
  assert.equal(values.has('legacy'), true);
  await assert.rejects(cache.write('new', { important: true }), /quota/);
  assert.equal(values.has('new'), false);
});

test('aborted IndexedDB transactions are rejected rather than acknowledged as saved', async (t) => {
  const { cache } = fixture(t);
  const original = IDBObjectStore.prototype.put;
  const mock = t.mock.method(
    IDBObjectStore.prototype,
    'put',
    function (this: IDBObjectStore, ...args: Parameters<typeof original>) {
      const request = original.apply(this, args);
      this.transaction.abort();
      return request;
    },
  );
  await assert.rejects(cache.write('pending', { changes: true }));
  mock.mock.restore();
  assert.equal(await cache.read('pending'), undefined);
});

test('profile snapshots are independent and deletion removes both storage generations', async (t) => {
  const { cache, values } = fixture(t);
  await cache.write('profile-a', { progress: 1 });
  await cache.write('profile-b', { progress: 2 });
  values.set('profile-a', '{}');
  await cache.remove('profile-a');
  assert.equal(await cache.read('profile-a'), undefined);
  assert.equal(values.has('profile-a'), false);
  assert.deepEqual(await cache.read('profile-b'), { progress: 2 });
});

test('blocked browser storage never falls back to synchronous snapshot writes', async (t) => {
  const { values } = fixture(t);
  const cache = new BrowserCache(() => {
    throw new Error('blocked');
  });
  values.set('legacy', '{"pending":true}');
  assert.deepEqual(await cache.read('legacy'), { pending: true });
  assert.equal(values.has('legacy'), true);
  await assert.rejects(cache.write('new', {}), /blocked/);
});
