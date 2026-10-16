import { probeDevReadiness } from './readiness.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, delimiter } from 'node:path';
import { loadConfig, projectRoot } from './config.mjs';

test(
  'dev launcher skips occupied ports and frontend proxies to the selected API port',
  { skip: process.platform === 'win32', timeout: 30000 },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), 'flashlab-dev-'));
    const blockers = [createServer(), createServer()];
    for (const blocker of blockers) {
      blocker.listen(0, '127.0.0.1');
      await once(blocker, 'listening');
    }
    const config = loadConfig();
    config.server.apiPort = blockers[0].address().port;
    config.server.webPort = blockers[1].address().port;
    config.server.host = '127.0.0.1';
    config.storage.directory = join(directory, 'storage');
    config.storage.legacyDataFile = join(directory, 'legacy.json');
    config.study.autoAdvanceSeconds = 7;
    const file = join(directory, 'config.json');
    await writeFile(file, JSON.stringify(config));
    const child = spawn(process.execPath, ['scripts/dev.mjs'], {
      cwd: projectRoot,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PATH: [dirname(process.execPath), process.env.PATH]
          .filter(Boolean)
          .join(delimiter),
        FLASHLAB_CONFIG: file,
        PORT: '',
        HOST: '127.0.0.1',
        STORAGE_DIR: '',
        DATA_FILE: '',
      },
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    t.after(async () => {
      if (child.exitCode === null) {
        const closed = once(child, 'exit');
        try {
          process.kill(-child.pid, 'SIGTERM');
        } catch (error) {
          if (error.code !== 'ESRCH') throw error;
        }
        await closed;
      }
      for (const blocker of blockers)
        await new Promise((resolve) => blocker.close(resolve));
      await rm(directory, { recursive: true, force: true });
    });
    let api;
    let web;
    let ready = false;
    for (let i = 0; i < 300; i++) {
      if (child.exitCode !== null) throw new Error(output);
      api = output.match(/FlashLab API: (http:\/\/[^\s]+)/)?.[1];
      web = output.match(/FlashLab frontend: (http:\/\/[^\s]+)/)?.[1];
      if (api && web) {
        try {
          ready = (await probeDevReadiness(api, web)).ready;
        } catch {
          /* Services are still starting. */
        }
      }
      if (ready) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.ok(ready, output);
    assert.notEqual(Number(new URL(api).port), config.server.apiPort);
    assert.notEqual(Number(new URL(web).port), config.server.webPort);
    assert.notEqual(new URL(api).port, new URL(web).port);
    assert.ok((await (await fetch(web)).text()).includes('FlashLab'));
    const apiModule = await (await fetch(`${web}/src/core/api.ts`)).text();
    assert.ok(apiModule.includes('/packages/shared/src/index.ts'), apiModule);
    assert.ok(!output.includes('[shared]'), output);
    assert.ok(!output.includes('http proxy error: /api/health'), output);

    assert.equal(
      (await (await fetch(`${web}/api/storage`)).json()).directory,
      config.storage.directory,
    );
    assert.equal(
      (await (await fetch(`${web}/api/config`)).json()).study
        .autoAdvanceSeconds,
      7,
    );
  },
);
