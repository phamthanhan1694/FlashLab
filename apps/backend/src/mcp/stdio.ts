import { parseArgs } from 'node:util';
import { isAbsolute } from 'node:path';
import {
  serveStdio,
  type StdioServerHandle,
} from '@modelcontextprotocol/server/stdio';
import { profileIdSchema } from '@flashlab/shared';
import { Profiles } from '../storage/profiles.js';
import { createMcpServer } from './server.js';

export type McpLaunch = { command: string; args: string[] };

export function parseMcpArguments(args: string[]) {
  const { values } = parseArgs({
    args,
    strict: true,
    options: {
      profile: { type: 'string' },
      'allow-writes': { type: 'boolean', default: false },
      'storage-dir': { type: 'string' },
      'legacy-file': { type: 'string' },
    },
  });
  if (!values.profile)
    throw Error(
      'MCP requires --profile. Copy the configuration from FlashLab Settings → MCP.',
    );
  for (const field of ['storage-dir', 'legacy-file'] as const) {
    const path = values[field];
    if (path !== undefined && !isAbsolute(path))
      throw Error(`--${field} must be an absolute path.`);
  }
  return {
    profileId: profileIdSchema.parse(values.profile),
    allowWrites: values['allow-writes'],
    storageDir: values['storage-dir'],
    dataFile: values['legacy-file'],
  };
}

export async function startMcpStdio(
  storage: { storageDir: string; dataFile: string },
  args: string[],
) {
  const options = parseMcpArguments(args);
  const profiles = new Profiles(
    options.dataFile ?? storage.dataFile,
    options.storageDir ?? storage.storageDir,
  );
  let handle: StdioServerHandle;
  const close = () => {
    void handle.close().finally(() => profiles.close());
  };
  try {
    // Fail before the handshake if the selected profile was deleted or is invalid.
    await profiles.read(options.profileId);
    handle = serveStdio(
      () => {
        const server = createMcpServer(profiles, options);
        server.server.onclose = () => profiles.close();
        return server;
      },
      {
        onerror: (error) =>
          process.stderr.write(`FlashLab MCP: ${error.message}\n`),
      },
    );
    process.once('SIGINT', close);
    process.once('SIGTERM', close);
    // Also close storage if the client disconnects before sending a handshake.
    process.stdin.once('end', () => profiles.close());
  } catch (error) {
    profiles.close();
    throw error;
  }
}
