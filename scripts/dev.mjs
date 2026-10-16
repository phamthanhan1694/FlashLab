import { probeDevReadiness } from './readiness.mjs';
import { spawn } from 'node:child_process';
import { loadConfig, findFreePort, projectRoot } from './config.mjs';

try {
  const config = loadConfig();
  const host = process.env.HOST ?? config.server.host;
  const apiPort = await findFreePort(
    Number(process.env.PORT || config.server.apiPort),
    host,
    config.server.portSearchLimit,
  );
  const webPort = await findFreePort(
    config.server.webPort,
    host,
    config.server.portSearchLimit,
    [apiPort],
  );
  console.log(
    `FlashLab API: http://${host}:${apiPort}\nFlashLab frontend: http://${host}:${webPort}`,
  );
  const browserHost = ['0.0.0.0', '::'].includes(host) ? '127.0.0.1' : host;
  const browserUrl = `http://${browserHost.includes(':') ? `[${browserHost}]` : browserHost}:${webPort}/`;
  const apiUrl = `http://${browserHost.includes(':') ? `[${browserHost}]` : browserHost}:${apiPort}/`;
  let stopped = false;
  let browserTimer;
  if (process.argv.includes('--open')) {
    const deadline = Date.now() + 60_000;
    const openWhenReady = async () => {
      if (stopped) return;
      try {
        const readiness = await probeDevReadiness(apiUrl, browserUrl);
        if (stopped) return;
        if (!readiness.ready) throw new Error(readiness.message);
        let browser;
        if (process.platform === 'win32') {
          browser = spawn('cmd.exe', ['/c', 'start', '', browserUrl], {
            stdio: 'ignore',
          });
        } else if (process.env.WSL_DISTRO_NAME) {
          browser = spawn('explorer.exe', [browserUrl], { stdio: 'ignore' });
        } else {
          browser = spawn(
            process.platform === 'darwin' ? 'open' : 'xdg-open',
            [browserUrl],
            { stdio: 'ignore' },
          );
        }
        browser.on('error', () =>
          console.log(`Mở trình duyệt tại ${browserUrl}`),
        );
      } catch (error) {
        if (stopped) return;
        if (Date.now() < deadline)
          browserTimer = setTimeout(openWhenReady, 500);
        else
          console.error(
            `FlashLab chưa sẵn sàng sau 60 giây: ${error.message}. Kiểm tra lỗi [api]/[web] ở phía trên; trình duyệt chưa được mở.`,
          );
      }
    };
    browserTimer = setTimeout(openWhenReady, 500);
  }
  const args = ['run', 'dev:services'];
  const env = {
    ...process.env,
    FLASHLAB_API_PORT: String(apiPort),
    FLASHLAB_WEB_PORT: String(webPort),
    HOST: host,
  };
  const child = process.env.npm_execpath
    ? spawn(process.execPath, [process.env.npm_execpath, ...args], {
        cwd: projectRoot,
        env,
        stdio: 'inherit',
      })
    : spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
        cwd: projectRoot,
        env,
        stdio: 'inherit',
      });
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () => child.kill(signal));
  child.on('error', (error) => {
    stopped = true;
    clearTimeout(browserTimer);
    console.error(error.message);
    process.exitCode = 1;
  });
  child.on('exit', (code) => {
    stopped = true;
    clearTimeout(browserTimer);
    process.exitCode = code ?? 1;
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
