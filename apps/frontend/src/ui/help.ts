import { partOptions } from '../core/parts-of-speech';
import { esc } from '../core/utils';
import { fetchRead } from '../core/http';
import { ico } from './icons';
import { mcpReferenceMarkup, studyRulesMarkup } from './docs-reference';
export const docsTopics = [
  ['start', 'Bắt đầu', 'house'],
  ['import', 'Nhập và xuất thẻ', 'upload'],
  ['backup', 'Sao lưu và lưu trữ', 'download'],
  ['study', 'Học và ôn tập', 'book'],
  ['writing', 'Bài viết và ghi chú', 'pen'],
  ['mcp', 'Kết nối AI qua MCP', 'plug'],
] as const;
let storageDirectory = '';
let storageRequest = 0;
export function helpLink(topic = 'import') {
  return `<a class="section-link help-link" data-help-link href="#/docs/${topic}">${ico('document', 16)} <span>Mở tài liệu trong Docs</span></a>`;
}
export async function initializeHelp() {
  const request = ++storageRequest;
  storageDirectory = '';
  document.querySelectorAll('[data-help-storage-path]').forEach((node) => {
    node.textContent = '—';
  });
  try {
    const response = await fetchRead('/api/storage');
    if (!response.ok) return;
    const storage = await response.json();
    if (request !== storageRequest || typeof storage.directory !== 'string')
      return;
    storageDirectory = storage.directory;
    document.querySelectorAll('[data-help-storage-path]').forEach((node) => {
      node.textContent = storageDirectory;
    });
  } catch {
    /* Instructions remain available offline. */
  }
}
export function importGuideMarkup(open = false) {
  return `<details id="guide-import" class="import-guide" tabindex="-1" ${open ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">${ico('upload', 22)}</span>Hướng dẫn nhập text, Excel, CSV</summary>
  <p>Một thẻ có một thuật ngữ và nhiều cặp nghĩa–từ loại. Mỗi nghĩa giữ từ loại riêng; chỉ thuật ngữ và nghĩa đầu tiên bắt buộc.</p>
  <h3>Nhập text, CSV, Excel theo 5 trường</h3>
  <p>Thứ tự: thuật ngữ, định nghĩa, cách đọc, ghi chú, ảnh minh họa. Chỉ thuật ngữ và định nghĩa bắt buộc. Giữ dấu phẩy cho trường để trống. Trong định nghĩa, mỗi cặp viết từ loại::nghĩa; dùng | để thêm nghĩa ngay trong cùng trường.</p>
  <pre data-user-content>book,n.::sách|v.::đặt chỗ,/bʊk/,Ví dụ,
hello,xin chào,,,
"red, blue","adj.::đỏ, xanh",,"Ghi chú có dấu phẩy",</pre>
  <p>CSV và Excel dùng 5 tiêu đề: front, definition, pronunciation, notes, image. Trong ô definition có thể dùng mảng JSON gồm các cặp meaning và partOfSpeech để giữ nghĩa chứa | hoặc ::. Ảnh là dữ liệu data:image/png;base64,... (hoặc jpeg, webp, gif), không phải đường dẫn file trên máy; có thể để trống và thêm ảnh trong biểu mẫu.</p>
  <pre data-user-content>front,definition,pronunciation,notes,image
book,n.::sách|v.::đặt chỗ,/bʊk/,Ví dụ,</pre>
  <p>Cách đọc thường là phiên âm dạng chữ. Để giữ cả ngôn ngữ đọc, dùng JSON trong ô pronunciation, ví dụ {"text":"/bʊk/","language":"en-GB"}. File xuất tự lưu thông tin này.</p>
  <p>Trong Excel, hàng đầu là tiêu đề cột; các hàng sau là thẻ. Mỗi ô chứa một giá trị, không cần tự bọc dấu nháy kép. FlashLab đọc trang tính đầu tiên của file .xlsx. File .xls cần lưu lại thành .xlsx.</p>
  <p>CSV và TXT dùng dấu phẩy, lưu UTF-8. Nội dung có dấu phẩy, dấu nháy kép hoặc xuống dòng phải bọc trong dấu nháy kép; một dấu nháy kép bên trong viết thành hai dấu nháy kép. TSV dùng Tab và phần mở rộng .tsv.</p>
  <h3>Xuất và nhập lại</h3>
  <p>Trong học phần, chọn Xuất thẻ → CSV, Text hoặc Excel. Cả ba định dạng xuất cùng 5 trường; toàn bộ nghĩa–từ loại nằm chung trong definition; giữ hàng tiêu đề khi sửa rồi nhập lại. Ngôn ngữ đọc ví dụ en-US, vi-VN, zh-CN, ja-JP hoặc ko-KR.</p>
  <p>Tệp thẻ dùng để trao đổi nội dung. Muốn giữ cả tiến độ và dấu đã nhớ, hãy xuất bản sao lưu SQLite trong Cài đặt.</p>
  <h3>Xử lý thẻ trùng</h3>
  <p>Nhập text, CSV, Excel và thêm từng thẻ thủ công đều dùng chung bảng so sánh thẻ trùng. Chọn Sửa trước khi nhập để sửa thuật ngữ, thêm hoặc xóa nghĩa, chọn từ loại riêng cho từng nghĩa, sửa cách đọc, ngôn ngữ đọc, ghi chú và ảnh. Sau đó chọn Tạo thẻ riêng, Ghi đè thẻ trùng hoặc Bổ sung vào thẻ trùng. Tạo thẻ riêng cần thuật ngữ không trùng. Ghi đè thay nội dung và đặt lại tiến độ. Bổ sung giữ nội dung và tiến độ cũ, chỉ thêm cặp nghĩa–từ loại chưa có và điền trường còn trống. Có thể sửa nhiều thẻ và chuyển trang mà không mất bản nháp; chỉ lưu sau khi bấm Xác nhận nhập.</p></details>`;
}

export function renderHelpCenter() {
  const topic = docsTopic();
  return `<section id="docs-page" class="docs-page"><header class="page-heading docs-heading"><span class="docs-mark">${ico('document', 28)}</span><div><h1>Docs</h1><p class="lead">Tài liệu sử dụng FlashLab: học tập, quản lý dữ liệu và kết nối AI.</p></div></header>
    <nav class="docs-toc" aria-label="Mục lục tài liệu">${docsTopics.map(([id, title, icon]) => `<a href="#/docs/${id}" ${topic === id || (!topic && id === 'start') ? 'aria-current="location"' : ''}>${ico(icon, 18)}<span>${title}</span></a>`).join('')}</nav>
    <div class="table-panel home-guide docs-content">
    <details id="guide-start" class="import-guide" tabindex="-1" ${!topic || topic === 'start' ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">${ico('house', 22)}</span>Bắt đầu</summary><ol><li>Chọn hoặc tạo hồ sơ. Học phần, tiến độ và cài đặt được lưu riêng cho mỗi người.</li><li>Tạo học phần trong Thư viện, rồi thêm thẻ thủ công hoặc nhập text, CSV, Excel.</li><li>Chọn chế độ học phù hợp. FlashLab tự lưu thay đổi và tiến độ học.</li><li>Trước khi chuyển máy, sao lưu database SQLite trong Cài đặt rồi khôi phục trên máy mới.</li></ol><p>Lần đầu mở bản desktop, bạn có thể chọn thư mục dữ liệu. Vị trí hiện tại nằm trong mục Sao lưu và lưu trữ bên dưới.</p></details>
    ${importGuideMarkup(topic === 'import')}
    <details id="guide-backup" class="import-guide" tabindex="-1" ${topic === 'backup' ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">${ico('download', 22)}</span>Hướng dẫn sao lưu và lưu trữ</summary><p>Mỗi hồ sơ có dữ liệu riêng. Trong Cài đặt, chọn Sao lưu hồ sơ để giữ dữ liệu của một người, hoặc Sao lưu toàn bộ để giữ mọi hồ sơ, bài viết và ảnh dùng chung trong một file .sqlite.</p><h3>Sao lưu và khôi phục</h3><p>Chọn Khôi phục từ database trong Cài đặt hoặc menu người dùng rồi chọn file .sqlite. Kiểm tra phạm vi trước khi xác nhận. Khôi phục toàn bộ thay dữ liệu hiện tại; khôi phục một hồ sơ giữ lại các hồ sơ khác. Bản sao trước khi khôi phục được tự lưu trong restore-backups.</p><h3>Lưu trữ dữ liệu</h3><p>Thư mục lưu trữ: <code data-help-storage-path data-user-content>${esc(storageDirectory || '—')}</code></p><p>SQLite giữ hồ sơ, thẻ nhiều nghĩa, ảnh, lớp học, tiến độ, lịch sử và kết quả từng câu, cấu hình, ghi chú và bài viết. File JSON và ảnh cũ được giữ nguyên sau khi chuyển đổi.</p><p>Không cần giải nén hoặc ghép file JSON. Nhập thư mục CSV và bản sao lưu cũ vẫn được hỗ trợ. Cổng dịch vụ và đường dẫn lưu trữ của máy hiện tại không thay đổi khi khôi phục database.</p></details>
    <details id="guide-study" class="import-guide" tabindex="-1" ${topic === 'study' || topic === 'parts' ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">${ico('book', 22)}</span>Học và ôn tập</summary><p>Trong Thêm hoặc Sửa thẻ, dùng Thêm định nghĩa để lưu các nghĩa khác. Phần Viết chấp nhận một nghĩa bất kỳ; trắc nghiệm chỉ đưa một nghĩa đúng vào lựa chọn. Các nghĩa vẫn thuộc cùng một thẻ và cùng cấp ghi nhớ.</p><p>Nút dấu cộng tạo học phần, lớp học, thẻ, bài viết hoặc ghi chú mới. Rê chuột lên nút để xem tên chức năng.</p>${studyRulesMarkup()}<details id="guide-parts" class="parts-guide" tabindex="-1"><summary>Từ loại và viết tắt tiếng Anh</summary><p>FlashLab dùng thống nhất các viết tắt dưới đây cho từng nghĩa của từ.</p><ul>${partOptions.map(([, label]) => `<li>${esc(label)}</li>`).join('')}</ul></details><h3>Cấp độ và mức thành thạo</h3><p>Để lên cấp 1–6, cần lần lượt 3, 5, 8, 12, 18, 25 điểm tiến độ tại mỗi cấp. Trả lời đúng cộng 1 điểm. Trả lời sai trừ 1 điểm và trừ 1 lượt ở dạng bài vừa làm, tối thiểu 0; sai trong Kiểm tra cũng trừ 1 lượt Kiểm tra. Khi tiến độ đã bằng 0 mà tiếp tục sai, thẻ giảm 1 cấp, tối thiểu cấp 0. Tiến độ bắt đầu lại sau mỗi lần đổi cấp; khi còn 0 điểm, các lượt theo dạng bài cũng được xóa. Câu sai được hẹn ôn lại theo thời gian thử lại trong Cài đặt. Từ cấp 3 được tính là thành thạo.</p><p>Lên cấp 3 cần Trắc nghiệm, Viết và Kiểm tra. Lên cấp 4–6 cần đủ Thẻ ghi nhớ (hoặc Ôn tập), Trắc nghiệm, Viết, Ghép thẻ và Kiểm tra tại cấp hiện tại. Cấp 3–6 cần lần lượt ít nhất 1, 1, 2, 3 lượt đúng trong Kiểm tra. Chỉ lặp lại một dạng sẽ không đủ lên cấp cao.</p><p>Khi bắt đầu Kiểm tra, có thể bật chọn nhiều đáp án và điền nhiều nghĩa. Câu nhiều lựa chọn cần chọn đủ các nghĩa đúng và không chọn nghĩa sai. Câu điền nhiều có nút + thêm ô, mỗi ô một nghĩa khác nhau. Bật tùy chọn thì giao diện giữ đúng chế độ đã chọn, kể cả bài một câu hoặc từ chỉ có một nghĩa. Từ chỉ có một nghĩa vẫn chỉ cần một đáp án. Bỏ các tùy chọn này để chỉ cần trả lời một nghĩa. Kết quả câu điền hiển thị mọi nghĩa hợp lệ.</p></details>
    <details id="guide-writing" class="import-guide" tabindex="-1" ${topic === 'writing' ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">${ico('pen', 22)}</span>Bài viết và ghi chú</summary><p>Bài viết dùng chung cho mọi người trên máy chủ này.</p><p>Ghi chú lưu riêng theo người dùng, đi kèm bản sao lưu hồ sơ.</p><p>Dùng thanh định dạng hoặc nhập Markdown. Chọn ngôn ngữ khi chèn khối mã: cpp hoặc c++ cho C++, markdown hoặc md cho Markdown; text là văn bản thuần. Có thể nhập hoặc tải file .md.</p></details>
    ${mcpGuideMarkup(topic === 'mcp')}
  </div></section>`;
}
function docsTopic() {
  return location.hash.split(/\/(?:docs|guide)\//)[1]?.split('/')[0];
}
function mcpGuideMarkup(open: boolean) {
  return `<details id="guide-mcp" class="import-guide" tabindex="-1" ${open ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">${ico('plug', 22)}</span>Kết nối AI qua MCP</summary>
    <p>MCP cho phép Claude Desktop, Codex và ứng dụng AI tương thích đọc, tìm kiếm và quản lý thẻ trong FlashLab trên cùng máy.</p>
    <h3>Kết nối từng bước</h3><ol><li>Mở FlashLab và chọn đúng hồ sơ muốn cho AI truy cập.</li><li>Vào Cài đặt → Kết nối AI qua MCP. Chọn Chỉ đọc hoặc Đọc và sửa thẻ, học phần.</li><li>Chọn Claude Desktop / JSON hoặc Codex / TOML, rồi tạo và sao chép cấu hình kết nối.</li><li>Dán cấu hình vào ứng dụng AI trên cùng máy, giữ lại các MCP server khác nếu đã có. Khởi động lại kết nối MCP.</li></ol>
    <h3>Claude Desktop</h3><p>Trong Claude Desktop, mở Settings → Developer → Edit Config. Gộp mục flashlab từ cấu hình JSON vào mcpServers hiện có, lưu file và khởi động lại Claude Desktop.</p>
    <h3>Codex</h3><p>Chọn định dạng TOML trong FlashLab. Thêm hoặc cập nhật mục mcp_servers.flashlab trong file cấu hình Codex, sau đó khởi động lại kết nối.</p><pre data-user-content>~/.codex/config.toml</pre>
    <h3>Quyền và phạm vi truy cập</h3><p>Mỗi kết nối chỉ truy cập hồ sơ được chọn. Chỉ đọc là mặc định; quyền đọc và sửa cho phép tạo, sửa, xóa thẻ và học phần.</p><p>Để đổi hoặc thu hồi quyền, cập nhật hoặc xóa cấu hình FlashLab trong ứng dụng AI rồi ngắt và kết nối lại. Đổi lựa chọn trong FlashLab chỉ tạo cấu hình mới.</p><p>AI sửa nội dung thẻ sẽ giữ tiến độ học. Nếu dữ liệu vừa thay đổi, AI phải đọc lại trước khi sửa tiếp. Sau khi AI sửa, tải lại FlashLab để thấy thay đổi.</p><p>MCP chạy cục bộ qua stdio, không cung cấp URL truy cập từ đám mây. Bản desktop dùng Node đi kèm bộ cài và không cần mở cửa sổ FlashLab để AI kết nối.</p><p>Ứng dụng AI có thể gửi nội dung thẻ đã đọc cho nhà cung cấp mô hình theo cấu hình của ứng dụng đó.</p>
    <h3>Ví dụ yêu cầu AI</h3><ul><li>Tìm các thẻ có nghĩa ngân hàng trong FlashLab.</li><li>Đọc học phần đang chọn và hỏi tôi từng từ một.</li><li>Thêm 20 từ về du lịch, có phiên âm và ví dụ.</li><li>Sửa chính tả và giải thích nghĩa, giữ nguyên tiến độ học.</li></ul>
    <h3>Các công cụ MCP</h3><p>Công cụ đọc</p><pre data-user-content>get_profile · list_decks · get_deck
list_cards · search_cards · get_card</pre><p>Công cụ sửa dữ liệu</p><pre data-user-content>create_deck · update_deck · delete_deck
add_cards · update_card · delete_cards</pre>${mcpReferenceMarkup()}
    <h3>Khi không kết nối được</h3><p>Nếu chuyển nơi cài đặt hoặc thư mục dữ liệu, tạo lại cấu hình từ FlashLab. Kiểm tra hồ sơ còn tồn tại và dùng bản cài có hỗ trợ MCP.</p><p>Nếu chỉ thấy công cụ đọc, tạo cấu hình có quyền đọc và sửa rồi cập nhật trong ứng dụng AI. Nếu dữ liệu xung đột, đọc lại trước khi thử sửa.</p><p>Lệnh stdio chạy bằng tay sẽ chờ yêu cầu từ MCP client. Không dùng thông báo stdout của npm làm kênh kết nối; dùng đúng command và args do FlashLab tạo.</p>
    <div class="docs-references"><a class="section-link" href="https://modelcontextprotocol.io/docs/develop/connect-local-servers" target="_blank" rel="noopener">Hướng dẫn MCP cho Claude Desktop ${ico('arrow', 14)}</a><a class="section-link" href="https://developers.openai.com/codex/mcp" target="_blank" rel="noopener">OpenAI Docs: MCP ${ico('arrow', 14)}</a></div></details>`;
}
export function focusHelpTopic() {
  const topic = docsTopic();
  if (
    !topic ||
    !['start', 'import', 'backup', 'study', 'writing', 'parts', 'mcp'].includes(
      topic,
    )
  )
    return;
  if (topic === 'parts') {
    const parent = document.getElementById(
      'guide-study',
    ) as HTMLDetailsElement | null;
    if (parent) parent.open = true;
  }
  let target = document.getElementById(
    `guide-${topic}`,
  ) as HTMLDetailsElement | null;
  if (!target) return;
  target.open = true;
  if (topic === 'mcp') {
    const name = location.hash.split('/')[3];
    const tool = name ? document.getElementById('mcp-tool-' + name) : null;
    if (tool?.tagName === 'DETAILS' && target.contains(tool)) {
      (tool as HTMLDetailsElement).open = true;
      target = tool as HTMLDetailsElement;
    }
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
}
