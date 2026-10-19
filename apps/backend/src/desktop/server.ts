import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { buildApp } from '../http/app.js';
import { loadConfig, publicConfig } from '../../../../scripts/config.mjs';
import { startMcpStdio } from '../mcp/stdio.js';
import { fileURLToPath } from 'node:url';

// This entry point owns a private loopback server; it never uses the web .env or data store.
async function start() {
  const [resourceDir, appDataDir] = process.argv.slice(2);
  if (
    !resourceDir ||
    !appDataDir ||
    !isAbsolute(resourceDir) ||
    !isAbsolute(appDataDir)
  )
    throw Error('Expected absolute resource and application data directories.');
  await mkdir(appDataDir, { recursive: true });
  const configPath = join(appDataDir, 'config.json');
  try {
    await readFile(configPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const template = await readFile(
      join(resourceDir, 'config.example.json'),
      'utf8',
    );
    await writeFile(configPath, template, { flag: 'wx' });
  }
  process.env.FLASHLAB_CONFIG = configPath;
  const config = loadConfig();
  const relativeToConfig = (path: string) =>
    isAbsolute(path) ? path : resolve(dirname(configPath), path);
  const storage = {
    dataFile: relativeToConfig(config.storage.legacyDataFile),
    storageDir: relativeToConfig(config.storage.directory),
  };
  if (process.argv[4] === '--mcp') {
    await startMcpStdio(storage, process.argv.slice(5));
    return;
  }
  const app = buildApp({
    ...storage,
    mcpLaunch: {
      command: process.execPath,
      args: [fileURLToPath(import.meta.url), resourceDir, appDataDir, '--mcp'],
    },
    runtimeConfig: publicConfig(config),
    staticRoot: join(resourceDir, 'frontend'),
    logger: false,
  });
  let closing = false;
  const close = () => {
    if (closing) return;
    closing = true;
    void app.close().then(
      () => process.exit(0),
      () => process.exit(1),
    );
  };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
  // Rust retains the write end of this pipe. Closing the app (even a crash) closes Node.
  process.stdin.resume();
  process.stdin.once('end', close);
  process.stdin.once('error', close);
  let address = '';
  for (let offset = 0; offset < config.server.portSearchLimit; offset++) {
    const port = config.server.apiPort + offset;
    if (port > 65535) break;
    try {
      address = await app.listen({ port, host: '127.0.0.1' });
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EADDRINUSE') throw error;
    }
  }
  if (!address) throw Error('Không còn cổng trống để mở FlashLab.');
  process.stdout.write(JSON.stringify({ ready: address }) + '\n');
}
start().catch((error: Error) => {
  process.stderr.write(`FlashLab backend: ${error.message}\n`);
  process.exit(1);
});
