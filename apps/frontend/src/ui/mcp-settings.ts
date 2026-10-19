import type { Profile } from '@flashlab/shared';
import { notify } from './feedback';

type Connection = { command: string; args: string[] };
export function formatMcpConfiguration(connection: Connection, format: string) {
  if (format === 'toml') {
    // JSON basic strings/arrays are also valid TOML for these path and argument values.
    return `[mcp_servers.flashlab]\ncommand = ${JSON.stringify(connection.command)}\nargs = ${JSON.stringify(connection.args)}\n`;
  }
  return JSON.stringify({ mcpServers: { flashlab: connection } }, null, 2);
}

export function initializeMcpSettings(
  profile: Profile,
  flush: () => Promise<void>,
) {
  const section = document.getElementById('settings-mcp');
  if (!section) return;
  const generate = section.querySelector<HTMLButtonElement>(
    '[data-mcp-generate]',
  )!;
  const copy = section.querySelector<HTMLButtonElement>('[data-mcp-copy]')!;
  const writes = section.querySelector<HTMLSelectElement>('[data-mcp-access]')!;
  const format = section.querySelector<HTMLSelectElement>('[data-mcp-format]')!;
  const output =
    section.querySelector<HTMLTextAreaElement>('[data-mcp-config]')!;
  const status = section.querySelector<HTMLElement>('[data-mcp-status]')!;
  let connection: Connection | undefined;
  status.textContent = `Kết nối AI tới hồ sơ ${profile.name} trên máy chạy FlashLab.`;
  const clear = () => {
    connection = undefined;
    output.value = '';
    output.hidden = true;
    copy.hidden = true;
    status.textContent =
      'Tạo cấu hình mới rồi cập nhật trong ứng dụng AI và kết nối lại. Quyền của kết nối cũ chỉ thay đổi sau khi cập nhật cấu hình bên đó.';
  };
  writes.addEventListener('change', clear);
  format.addEventListener('change', () => {
    if (connection)
      output.value = formatMcpConfiguration(connection, format.value);
  });
  generate.addEventListener('click', async () => {
    generate.disabled = true;
    writes.disabled = true;
    status.textContent = 'Đang chuẩn bị cấu hình MCP…';
    try {
      await flush();
      const response = await fetch(
        `/api/profiles/${encodeURIComponent(profile.id)}/mcp-config?writes=${writes.value}`,
        { signal: AbortSignal.timeout(10000) },
      );
      if (!response.ok)
        throw Error(
          'Không lấy được cấu hình MCP. Kiểm tra kết nối tới FlashLab.',
        );
      const data = (await response.json()) as {
        mcpServers: { flashlab: Connection };
      };
      connection = data.mcpServers.flashlab;
      output.value = formatMcpConfiguration(connection, format.value);
      output.hidden = false;
      copy.hidden = false;
      status.textContent =
        'Dán cấu hình vào ứng dụng AI trên cùng máy rồi kết nối lại. Sau khi AI sửa dữ liệu, tải lại FlashLab để thấy thay đổi.';
    } catch (error) {
      clear();
      status.textContent =
        error instanceof Error ? error.message : 'Không tạo được cấu hình MCP.';
    } finally {
      generate.disabled = false;
      writes.disabled = false;
    }
  });
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      notify('Đã sao chép cấu hình MCP.');
    } catch {
      output.focus();
      output.select();
      status.textContent = 'Cấu hình đã được chọn. Nhấn Ctrl+C để sao chép.';
    }
  });
}
