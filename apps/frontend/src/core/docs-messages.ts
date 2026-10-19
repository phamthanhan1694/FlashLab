/** Documentation UI copy. Code samples and the user's data are never translated. */
export const docsMessages: Record<string, string> = {
  'Bắt đầu': 'Getting started',
  'Nhập và xuất thẻ': 'Import and export cards',
  'Sao lưu và lưu trữ': 'Backup and storage',
  'Mở tài liệu trong Docs': 'Open documentation in Docs',
  'Mở tài liệu trong Docs →': 'Open documentation in Docs →',
  'Hướng dẫn kết nối MCP →': 'MCP connection guide →',
  'Mục lục tài liệu': 'Documentation contents',
  'Tài liệu sử dụng FlashLab: học tập, quản lý dữ liệu và kết nối AI.':
    'Learn how to study, manage your data and connect AI with FlashLab.',
  'Chọn hoặc tạo hồ sơ. Học phần, tiến độ và cài đặt được lưu riêng cho mỗi người.':
    'Select or create a profile. Study sets, progress and settings are stored separately for each person.',
  'Tạo học phần trong Thư viện, rồi thêm thẻ thủ công hoặc nhập text, CSV, Excel.':
    'Create a study set in the Library, then add cards manually or import text, CSV or Excel.',
  'Chọn chế độ học phù hợp. FlashLab tự lưu thay đổi và tiến độ học.':
    'Choose a study mode. FlashLab automatically saves your changes and learning progress.',
  'Trước khi chuyển máy, sao lưu database SQLite trong Cài đặt rồi khôi phục trên máy mới.':
    'Before moving to another computer, back up the SQLite database in Settings and restore it on the new computer.',
  'Lần đầu mở bản desktop, bạn có thể chọn thư mục dữ liệu. Vị trí hiện tại nằm trong mục Sao lưu và lưu trữ bên dưới.':
    'On the first desktop launch, you can choose a data folder. The current location is shown under Backup and storage below.',
  'MCP cho phép Claude Desktop, Codex và ứng dụng AI tương thích đọc, tìm kiếm và quản lý thẻ trong FlashLab trên cùng máy.':
    'MCP lets Claude Desktop, Codex and compatible AI apps read, search and manage FlashLab cards on the same computer.',
  'Kết nối từng bước': 'Connection steps',
  'Mở FlashLab và chọn đúng hồ sơ muốn cho AI truy cập.':
    'Open FlashLab and select the profile you want the AI to access.',
  'Vào Cài đặt → Kết nối AI qua MCP. Chọn Chỉ đọc hoặc Đọc và sửa thẻ, học phần.':
    'Go to Settings → Connect AI via MCP. Choose Read only or Read and edit cards and study sets.',
  'Chọn Claude Desktop / JSON hoặc Codex / TOML, rồi tạo và sao chép cấu hình kết nối.':
    'Choose Claude Desktop / JSON or Codex / TOML, then generate and copy the connection configuration.',
  'Dán cấu hình vào ứng dụng AI trên cùng máy, giữ lại các MCP server khác nếu đã có. Khởi động lại kết nối MCP.':
    'Paste the configuration into the AI app on the same computer, keeping any existing MCP servers. Restart the MCP connection.',
  'Trong Claude Desktop, mở Settings → Developer → Edit Config. Gộp mục flashlab từ cấu hình JSON vào mcpServers hiện có, lưu file và khởi động lại Claude Desktop.':
    'In Claude Desktop, open Settings → Developer → Edit Config. Merge the flashlab entry from the JSON configuration into the existing mcpServers object, save the file and restart Claude Desktop.',
  'Chọn định dạng TOML trong FlashLab. Thêm hoặc cập nhật mục mcp_servers.flashlab trong file cấu hình Codex, sau đó khởi động lại kết nối.':
    'Choose the TOML format in FlashLab. Add or update mcp_servers.flashlab in the Codex configuration file, then restart the connection.',
  'Quyền và phạm vi truy cập': 'Permissions and scope',
  'Mỗi kết nối chỉ truy cập hồ sơ được chọn. Chỉ đọc là mặc định; quyền đọc và sửa cho phép tạo, sửa, xóa thẻ và học phần.':
    'Each connection can access only the selected profile. Read only is the default; read and edit permission allows creating, editing and deleting cards and study sets.',
  'Để đổi hoặc thu hồi quyền, cập nhật hoặc xóa cấu hình FlashLab trong ứng dụng AI rồi ngắt và kết nối lại. Đổi lựa chọn trong FlashLab chỉ tạo cấu hình mới.':
    'To change or revoke access, update or remove the FlashLab configuration in the AI app, then disconnect and reconnect. Changing the selection in FlashLab only generates a new configuration.',
  'AI sửa nội dung thẻ sẽ giữ tiến độ học. Nếu dữ liệu vừa thay đổi, AI phải đọc lại trước khi sửa tiếp. Sau khi AI sửa, tải lại FlashLab để thấy thay đổi.':
    'AI edits to card content preserve learning progress. If the data has changed, the AI must read it again before editing. Refresh FlashLab after AI edits to see the changes.',
  'MCP chạy cục bộ qua stdio, không cung cấp URL truy cập từ đám mây. Bản desktop dùng Node đi kèm bộ cài và không cần mở cửa sổ FlashLab để AI kết nối.':
    'MCP runs locally over stdio and does not provide a URL for cloud access. The desktop version uses its bundled Node runtime; the FlashLab window does not need to remain open for AI connections.',
  'Ứng dụng AI có thể gửi nội dung thẻ đã đọc cho nhà cung cấp mô hình theo cấu hình của ứng dụng đó.':
    'The AI app may send card content it reads to its model provider according to that app’s configuration.',
  'Ví dụ yêu cầu AI': 'Example AI requests',
  'Tìm các thẻ có nghĩa ngân hàng trong FlashLab.':
    'Find FlashLab cards about banking.',
  'Đọc học phần đang chọn và hỏi tôi từng từ một.':
    'Read the selected study set and quiz me one word at a time.',
  'Thêm 20 từ về du lịch, có phiên âm và ví dụ.':
    'Add 20 travel words with pronunciation and examples.',
  'Sửa chính tả và giải thích nghĩa, giữ nguyên tiến độ học.':
    'Fix spelling and explain meanings while preserving my learning progress.',
  'Các công cụ MCP': 'MCP tools',
  'Công cụ đọc': 'Read tools',
  'Công cụ sửa dữ liệu': 'Write tools',
  'Khi không kết nối được': 'Connection troubleshooting',
  'Nếu chuyển nơi cài đặt hoặc thư mục dữ liệu, tạo lại cấu hình từ FlashLab. Kiểm tra hồ sơ còn tồn tại và dùng bản cài có hỗ trợ MCP.':
    'If you move the installation or data folder, generate a new configuration in FlashLab. Check that the profile still exists and that your installation supports MCP.',
  'Nếu chỉ thấy công cụ đọc, tạo cấu hình có quyền đọc và sửa rồi cập nhật trong ứng dụng AI. Nếu dữ liệu xung đột, đọc lại trước khi thử sửa.':
    'If only read tools appear, generate a configuration with read and edit permission and update it in the AI app. If there is a data conflict, read the data again before editing.',
  'Lệnh stdio chạy bằng tay sẽ chờ yêu cầu từ MCP client. Không dùng thông báo stdout của npm làm kênh kết nối; dùng đúng command và args do FlashLab tạo.':
    'A stdio command run manually waits for MCP client requests. Use the exact command and args generated by FlashLab; npm messages on stdout can break the connection.',
  'Hướng dẫn MCP cho Claude Desktop': 'MCP guide for Claude Desktop',
};
