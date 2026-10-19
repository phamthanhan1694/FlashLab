import {
  loadConfig,
  storagePath,
  publicConfig,
} from '../../../scripts/config.mjs';
import { fileURLToPath } from 'node:url';
import { buildApp } from './http/app.js';

const config = loadConfig();
const host = process.env.HOST ?? config.server.host;
const configuredPort = Number(
  process.env.FLASHLAB_API_PORT || process.env.PORT || config.server.apiPort,
);
if (
  !Number.isInteger(configuredPort) ||
  configuredPort < 1 ||
  configuredPort > 65535
)
  throw new Error('Cổng API phải từ 1 đến 65535.');
const app = buildApp({
  mcpLaunch: {
    command: process.execPath,
    args: [
      ...(import.meta.url.endsWith('.ts')
        ? ['--import', import.meta.resolve('tsx')]
        : []),
      fileURLToPath(
        new URL(
          `./mcp/cli.${import.meta.url.endsWith('.ts') ? 'ts' : 'js'}`,
          import.meta.url,
        ),
      ),
      '--storage-dir',
      storagePath(process.env.STORAGE_DIR ?? config.storage.directory),
      '--legacy-file',
      storagePath(process.env.DATA_FILE ?? config.storage.legacyDataFile),
    ],
  },
  dataFile: process.env.DATA_FILE
    ? storagePath(process.env.DATA_FILE)
    : storagePath(config.storage.legacyDataFile),
  storageDir: process.env.STORAGE_DIR
    ? storagePath(process.env.STORAGE_DIR)
    : storagePath(config.storage.directory),
  runtimeConfig: publicConfig(config),
  staticRoot:
    process.env.NODE_ENV === 'development'
      ? undefined
      : fileURLToPath(new URL('../../frontend/dist', import.meta.url)),
  logger: true,
});
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, () => {
    app.close().then(
      () => process.exit(0),
      (error) => {
        app.log.error(error);
        process.exit(1);
      },
    );
  });
try {
  const attempts =
    process.env.NODE_ENV === 'production' || process.env.FLASHLAB_API_PORT
      ? 1
      : config.server.portSearchLimit;
  let started = false;
  for (
    let offset = 0;
    offset < attempts && configuredPort + offset <= 65535;
    offset++
  ) {
    try {
      const address = await app.listen({ port: configuredPort + offset, host });
      console.log(`FlashLab: ${address}`);
      started = true;
      break;
    } catch (error) {
      if (!(
        error instanceof Error &&
        'code' in error &&
        error.code === 'EADDRINUSE'
      ))
        throw error;
    }
  }
  if (!started)
    throw new Error(
      'Cổng đang được sử dụng. Hãy chạy lại hoặc đổi cổng trong flashlab.config.json.',
    );
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
