import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadConfig,
  storagePath,
  findFreePort,
  publicConfig,
  projectRoot,
} from './config.mjs';

test('one config file controls runtime defaults and storage paths resolve from project root', () => {
  const config = loadConfig();
  assert.notEqual(config.server.apiPort, config.server.webPort);
  assert.equal(storagePath('data/storage'), join(projectRoot, 'data/storage'));
  if (process.platform === 'linux') {
    assert.equal(storagePath('E:/data'), '/mnt/e/data');
    assert.equal(storagePath('E:\\data'), '/mnt/e/data');
  }
  assert.deepEqual(Object.keys(publicConfig(config)).sort(), [
    'defaults',
    'study',
  ]);
});

test('invalid config fails clearly before launching services', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'flashlab-config-'));
  const previous = process.env.FLASHLAB_CONFIG;
  t.after(async () => {
    if (previous === undefined) delete process.env.FLASHLAB_CONFIG;
    else process.env.FLASHLAB_CONFIG = previous;
    await rm(directory, { recursive: true, force: true });
  });
  const config = loadConfig();
  process.env.FLASHLAB_CONFIG = join(directory, 'config.json');
  config.server.apiPort = config.server.webPort;
  await writeFile(process.env.FLASHLAB_CONFIG, JSON.stringify(config));
  assert.throws(() => loadConfig(), /hai cổng khác nhau/);
  config.server.apiPort--;
  config.storage.directory = '';
  await writeFile(process.env.FLASHLAB_CONFIG, JSON.stringify(config));
  assert.throws(() => loadConfig(), /storage.directory/);
});

test('port selection skips an occupied port and never reuses the API port for the frontend', async (t) => {
  const blocker = createServer();
  blocker.listen(0, '127.0.0.1');
  await once(blocker, 'listening');
  t.after(() => new Promise((resolve) => blocker.close(resolve)));
  const occupied = blocker.address().port;
  const api = await findFreePort(occupied, '127.0.0.1', 20);
  assert.notEqual(api, occupied);
  const web = await findFreePort(occupied, '127.0.0.1', 20, [api]);
  assert.notEqual(web, api);
  assert.notEqual(web, occupied);
  await assert.rejects(
    findFreePort(occupied, '127.0.0.1', 1),
    /Không có cổng trống/,
  );
});
