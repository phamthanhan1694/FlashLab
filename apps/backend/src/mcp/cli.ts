import { loadConfig, storagePath } from '../../../../scripts/config.mjs';
import { parseMcpArguments, startMcpStdio } from './stdio.js';

try {
  const args = process.argv.slice(2);
  const options = parseMcpArguments(args);
  // Generated configurations pin the actual storage paths and ignore unrelated .env files.
  const config =
    options.storageDir && options.dataFile ? undefined : loadConfig();
  await startMcpStdio(
    {
      storageDir: options.storageDir ?? storagePath(config!.storage.directory),
      dataFile: options.dataFile ?? storagePath(config!.storage.legacyDataFile),
    },
    args,
  );
} catch (error) {
  process.stderr.write(
    `FlashLab MCP: ${error instanceof Error ? error.message : 'Startup failed.'}\n`,
  );
  process.exitCode = 1;
}
