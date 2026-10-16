import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isAbsolute, resolve } from 'node:path';
import { createServer } from 'node:net';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
function integer(value, name, min, max) {
  if (!Number.isInteger(value) || value < min || value > max)
    throw new Error(`Cấu hình ${name} phải là số nguyên từ ${min} đến ${max}.`);
}
export function loadConfig() {
  const file = resolve(
    projectRoot,
    process.env.FLASHLAB_CONFIG ?? 'flashlab.config.json',
  );
  let config;
  try {
    config = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Không đọc được cấu hình ${file}: ${error.message}`);
  }
  const { server, storage, study, defaults } = config;
  if (!server || !storage || !study || !defaults)
    throw new Error('Cấu hình thiếu server, storage, study hoặc defaults.');
  if (typeof server.host !== 'string' || !server.host.trim())
    throw new Error('server.host không hợp lệ.');
  integer(server.apiPort, 'server.apiPort', 1024, 65535);
  integer(server.webPort, 'server.webPort', 1024, 65535);
  integer(server.portSearchLimit, 'server.portSearchLimit', 1, 100);
  if (server.apiPort === server.webPort)
    throw new Error('API và frontend phải dùng hai cổng khác nhau.');
  for (const key of ['directory', 'legacyDataFile'])
    if (typeof storage[key] !== 'string' || !storage[key].trim())
      throw new Error(`storage.${key} không hợp lệ.`);
  integer(study.autoAdvanceSeconds, 'study.autoAdvanceSeconds', 1, 60);
  integer(study.completionPercent, 'study.completionPercent', 1, 100);
  integer(study.historyPageSize, 'study.historyPageSize', 1, 100);
  integer(study.testQuestionLimit, 'study.testQuestionLimit', 1, 100);
  integer(study.matchPairLimit, 'study.matchPairLimit', 1, 30);
  if (!['system', 'light', 'dark'].includes(defaults.theme))
    throw new Error('defaults.theme không hợp lệ.');
  if (
    !defaults.audio ||
    typeof defaults.audio.music !== 'boolean' ||
    typeof defaults.audio.effects !== 'boolean'
  )
    throw new Error('defaults.audio không hợp lệ.');
  for (const key of ['volume', 'musicVolume'])
    if (
      typeof defaults.audio[key] !== 'number' ||
      !Number.isFinite(defaults.audio[key]) ||
      defaults.audio[key] < 0 ||
      defaults.audio[key] > 1
    )
      throw new Error(`defaults.audio.${key} phải từ 0 đến 1.`);
  return config;
}
export function storagePath(value) {
  const drive = /^([A-Za-z]):[\\/](.*)$/.exec(value);
  if (process.platform === 'linux' && drive)
    return `/mnt/${drive[1].toLowerCase()}/${drive[2].replaceAll('\\', '/')}`;
  return isAbsolute(value) ? value : resolve(projectRoot, value);
}
export function publicConfig(config) {
  return { study: config.study, defaults: config.defaults };
}
export async function findFreePort(start, host, limit, excluded = []) {
  integer(start, 'cổng bắt đầu', 1, 65535);
  integer(limit, 'số cổng dò', 1, 100);
  for (let port = start; port < Math.min(start + limit, 65536); port++) {
    if (excluded.includes(port)) continue;
    const available = await new Promise((resolvePort, reject) => {
      const probe = createServer();
      probe.once('error', (error) => {
        if (error.code === 'EADDRINUSE') resolvePort(false);
        else reject(error);
      });
      probe.listen({ port, host, exclusive: true }, () =>
        probe.close(() => resolvePort(true)),
      );
    });
    if (available) return port;
  }
  throw new Error(
    `Không có cổng trống từ ${start} đến ${Math.min(start + limit - 1, 65535)}. Hãy đổi cổng trong flashlab.config.json.`,
  );
}
