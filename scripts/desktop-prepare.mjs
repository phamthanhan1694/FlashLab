import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile, chmod, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const resourcesOnly = process.argv.includes('--resources-only');
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error(`${command} failed (${result.status}).`);
}
try {
  let triple;
  if (!resourcesOnly) {
    const rust = spawnSync('rustc', ['-vV'], { encoding: 'utf8' });
    triple = rust.stdout?.match(/^host: (.+)$/m)?.[1];
    if (rust.status !== 0 || !triple)
      throw Error(
        'Chưa có Rust. Cài Rust và yêu cầu hệ thống Tauri theo docs/tauri.md rồi mở lại terminal.',
      );
    const expected = `${process.arch === 'arm64' ? 'aarch64' : process.arch === 'x64' ? 'x86_64' : 'unsupported'}-${process.platform === 'win32' ? 'pc-windows-msvc' : process.platform === 'darwin' ? 'apple-darwin' : 'unknown-linux-gnu'}`;
    if (
      triple !== expected ||
      (process.env.TAURI_ENV_TARGET_TRIPLE &&
        process.env.TAURI_ENV_TARGET_TRIPLE !== triple)
    )
      throw Error(
        'Build trên đúng hệ điều hành/kiến trúc đích để Node sidecar khớp với Tauri. Không hỗ trợ cross-build sidecar.',
      );
  }
  const configFile = join(root, 'flashlab.config.example.json');
  const runtimeConfig = JSON.parse(await readFile(configFile, 'utf8'));
  // Desktop starts with a portable template, never the developer's storage path or .env.
  const resources = join(root, 'src-tauri/resources');
  await mkdir(resources, { recursive: true });
  await writeFile(
    join(resources, 'config.example.json'),
    JSON.stringify(runtimeConfig, null, 2) + '\n',
  );
  const npm = process.env.npm_execpath;
  const args = ['run', 'build', '-w', '@flashlab/shared'];
  if (npm) run(process.execPath, [npm, ...args]);
  else run(process.platform === 'win32' ? 'npm.cmd' : 'npm', args);
  // Vite normally uses web config; select the portable template for desktop builds only.
  const previous = process.env.FLASHLAB_CONFIG;
  process.env.FLASHLAB_CONFIG = configFile;
  try {
    const buildArgs = ['run', 'build', '-w', '@flashlab/frontend'];
    if (npm) run(process.execPath, [npm, ...buildArgs]);
    else run(process.platform === 'win32' ? 'npm.cmd' : 'npm', buildArgs);
  } finally {
    if (previous === undefined) delete process.env.FLASHLAB_CONFIG;
    else process.env.FLASHLAB_CONFIG = previous;
  }
  await rm(join(resources, 'frontend'), { recursive: true, force: true });
  await cp(join(root, 'apps/frontend/dist'), join(resources, 'frontend'), {
    recursive: true,
    force: true,
  });
  await build({
    entryPoints: [join(root, 'apps/backend/src/desktop/server.ts')],
    outfile: join(resources, 'backend.mjs'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    banner: {
      js: "import { createRequire as __flashlabCreateRequire } from 'node:module'; import { fileURLToPath as __flashlabFileURLToPath } from 'node:url'; import { dirname as __flashlabDirname } from 'node:path'; const require = __flashlabCreateRequire(import.meta.url); const __filename = __flashlabFileURLToPath(import.meta.url); const __dirname = __flashlabDirname(__filename);",
    },
    logLevel: 'info',
  });
  if (!resourcesOnly) {
    const binaries = join(root, 'src-tauri/binaries');
    await mkdir(binaries, { recursive: true });
    const destination = join(
      binaries,
      `flashlab-node-${triple}${process.platform === 'win32' ? '.exe' : ''}`,
    );
    await cp(process.execPath, destination);
    if (process.platform !== 'win32') await chmod(destination, 0o755);
  }
  console.log('FlashLab desktop resources prepared.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
