import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  Window,
  type HTMLButtonElement as HappyButton,
  type HTMLSelectElement as HappySelect,
  type HTMLTextAreaElement as HappyTextarea,
} from 'happy-dom';
import { initializeMcpSettings } from '../src/ui/mcp-settings';

test('MCP settings scope connections to the active profile, default to read-only, preserve paths and invalidate old permissions', async (t) => {
  const window = new Window({ url: 'http://localhost/' });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: window.document,
  });
  t.after(async () => {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else Reflect.deleteProperty(globalThis, 'document');
    await window.happyDOM.abort();
  });
  const html = await readFile(
    new URL('../index.html', import.meta.url),
    'utf8',
  );
  window.document.body.innerHTML = html.replace(
    /<script[^>]*>[\s\S]*?<\/script>/g,
    '',
  );
  const generate = window.document.querySelector<HappyButton>(
    '[data-mcp-generate]',
  )!;
  const access =
    window.document.querySelector<HappySelect>('[data-mcp-access]')!;
  const format =
    window.document.querySelector<HappySelect>('[data-mcp-format]')!;
  const output =
    window.document.querySelector<HappyTextarea>('[data-mcp-config]')!;
  const copy = window.document.querySelector<HappyButton>('[data-mcp-copy]')!;
  const connection = {
    command: 'C:\\Program Files\\FlashLab\\flashlab-node.exe',
    args: ['D:\\Thư mục \\"quoted\\"\\backend.mjs', '--profile', 'default'],
  };
  const events: string[] = [];
  const fetch = t.mock.method(globalThis, 'fetch', async (url: unknown) => {
    events.push(String(url));
    return Response.json({ mcpServers: { flashlab: connection } });
  });
  initializeMcpSettings(
    { id: 'default', name: 'Learner', created: 1 },
    async () => {
      events.push('flush');
    },
  );
  assert.equal(access.value, 'false');
  assert.equal(output.hidden, true);
  const waitFor = async (condition: () => boolean) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (condition()) return;
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    assert.fail('MCP settings did not finish updating');
  };
  generate.click();
  await waitFor(() => !generate.disabled);
  assert.deepEqual(events, [
    'flush',
    '/api/profiles/default/mcp-config?writes=false',
  ]);
  assert.deepEqual(JSON.parse(output.value).mcpServers.flashlab, connection);
  assert.equal(copy.hidden, false);
  format.value = 'toml';
  format.dispatchEvent(new window.Event('change'));
  assert.ok(output.value.startsWith('[mcp_servers.flashlab]\n'));
  assert.ok(
    output.value.includes(`command = ${JSON.stringify(connection.command)}`),
  );
  access.value = 'true';
  access.dispatchEvent(new window.Event('change'));
  assert.equal(output.hidden, true);
  assert.equal(copy.hidden, true);
  assert.equal(output.value, '');
  generate.click();
  await waitFor(() => !generate.disabled);
  assert.equal(events.at(-1), '/api/profiles/default/mcp-config?writes=true');
  fetch.mock.mockImplementation(async () => new Response('', { status: 503 }));
  generate.click();
  await waitFor(() => !generate.disabled);
  assert.equal(output.hidden, true);
  assert.match(
    window.document.querySelector('[data-mcp-status]')!.textContent,
    /Không lấy được/,
  );
});
