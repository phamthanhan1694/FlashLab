import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { loadConfig, publicConfig } from '../../scripts/config.mjs';
const config = loadConfig();
const host = process.env.HOST ?? config.server.host;
const apiHost = ['0.0.0.0', '::'].includes(host) ? '127.0.0.1' : host;
const proxyHost = apiHost.includes(':') ? `[${apiHost}]` : apiHost;
export default defineConfig({
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  define: { __FLASHLAB_CONFIG__: JSON.stringify(publicConfig(config)) },
  server: {
    host,
    port: Number(process.env.FLASHLAB_WEB_PORT ?? config.server.webPort),
    strictPort: true,
    proxy: {
      '/api': `http://${proxyHost}:${process.env.FLASHLAB_API_PORT || process.env.PORT || config.server.apiPort}`,
    },
  },
});
