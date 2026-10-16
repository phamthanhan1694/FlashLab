import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const cli = require.resolve('@tauri-apps/cli/tauri.js');
const [command = 'dev', ...args] = process.argv.slice(2);
const desktop = command === 'dev' || command === 'build';
// npm installs the Tauri CLI, but Rust/Cargo must be installed on the build machine.
if (desktop && !args.some((arg) => arg === '--help' || arg === '-h')) {
  for (const tool of ['cargo', 'rustc']) {
    const check = spawnSync(tool, ['--version'], { encoding: 'utf8' });
    if (check.status !== 0) {
      console.error(
        `Không chạy được ${tool} trong terminal hiện tại. npm ci không cài Rust/Cargo.`,
      );
      console.error(
        'Cài Rust stable (1.90+) tại https://rust-lang.org/tools/install/ rồi mở lại terminal.',
      );
      console.error(
        process.platform === 'win32'
          ? 'Trên Windows, kiểm tra PATH có %USERPROFILE%\\.cargo\\bin; dùng toolchain MSVC và Visual Studio Build Tools (Desktop development with C++).'
          : 'Trên Linux/WSL, sau khi cài Rust có thể nạp PATH bằng: source "$HOME/.cargo/env". Muốn tạo EXE Windows, chạy build trong terminal Windows.',
      );
      console.error(
        'Kiểm tra: cargo --version, rustc --version. Chi tiết: docs/tauri.md.',
      );
      process.exit(1);
    }
  }
}
const child = spawn(
  process.execPath,
  [
    cli,
    command,
    ...(desktop ? ['--config', 'src-tauri/tauri.desktop.conf.json'] : []),
    ...args,
  ],
  {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: process.env,
    stdio: 'inherit',
  },
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => child.kill(signal));
child.once('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.once('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
