import { partOptions } from '../core/parts-of-speech';
import { esc } from '../core/utils';
import { fetchRead } from '../core/http';
let storageDirectory = '';
let storageRequest = 0;
export function helpLink(topic = 'import') {
  return `<a class="section-link help-link" data-help-link href="#/home/guide/${topic}">Xem hướng dẫn tại Tổng quan →</a>`;
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
  return `<details id="guide-import" class="import-guide" tabindex="-1" ${open ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">📥</span>Hướng dẫn nhập text, Excel, CSV</summary>
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
  <p>Tệp thẻ dùng để trao đổi nội dung. Muốn giữ cả tiến độ và dấu đã nhớ, hãy xuất bản sao lưu ZIP trong Cài đặt.</p>
  <h3>Tương thích file cũ và từ trùng</h3>
  <p>File cũ có 2–6 trường hoặc cột definitions vẫn nhập được. JSON trong definitions giữ từng cặp meaning và partOfSpeech; nghĩa dạng chữ không có từ loại riêng sẽ dùng từ loại của nghĩa đầu tiên.</p>
  <pre data-user-content>front,back,partOfSpeech,definitions
book,sách,Noun,"[{""meaning"":""đặt chỗ"",""partOfSpeech"":""Verb""}]"</pre>
  <p>Nhập text, CSV, Excel và thêm từng thẻ thủ công đều dùng chung bảng so sánh thẻ trùng. Chọn Sửa trước khi nhập để sửa thuật ngữ, thêm hoặc xóa nghĩa, chọn từ loại riêng cho từng nghĩa, sửa cách đọc, ngôn ngữ đọc, ghi chú và ảnh. Sau đó chọn Tạo thẻ riêng, Ghi đè thẻ trùng hoặc Bổ sung vào thẻ trùng. Tạo thẻ riêng cần thuật ngữ không trùng. Ghi đè thay nội dung và đặt lại tiến độ. Bổ sung giữ nội dung và tiến độ cũ, chỉ thêm cặp nghĩa–từ loại chưa có và điền trường còn trống. Có thể sửa nhiều thẻ và chuyển trang mà không mất bản nháp; chỉ lưu sau khi bấm Xác nhận nhập.</p></details>`;
}

export function renderHelpCenter() {
  const topic = location.hash.split('/guide/')[1];
  return `<section id="home-guide" class="table-panel home-guide"><div class="section-heading"><h2>Hướng dẫn</h2><span>Tra cứu khi cần</span></div>
    ${importGuideMarkup(topic === 'import')}
    <details id="guide-backup" class="import-guide" tabindex="-1" ${topic === 'backup' ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">🤖</span>Hướng dẫn sao lưu và lưu trữ</summary><p>ID được tạo tự động và không trùng. Mỗi người dùng có dữ liệu riêng. Xuất ZIP trong Cài đặt trước khi xóa nếu muốn giữ bản sao. Chọn thư mục CSV để tạo người dùng theo tên thư mục (mỗi CSV là một học phần), hoặc thư mục đã giải nén từ ZIP để khôi phục cả tiến độ.</p><h3>Sao lưu và khôi phục</h3><p>Vào Cài đặt → Xuất thư mục ZIP. Để khôi phục, giải nén ZIP, mở menu người dùng → Nhập thư mục người dùng rồi chọn thư mục vừa giải nén. Ghi chú cá nhân nằm trong bản sao lưu hồ sơ; bài viết dùng chung cần sao lưu riêng thư mục blog.</p><h3>Lưu trữ dữ liệu</h3><p>Thư mục lưu trữ: <code data-help-storage-path data-user-content>${esc(storageDirectory || '—')}</code></p><p>CSV của mỗi người nằm trong thư mục ID → materials; index.json liệt kê tên học phần tương ứng.</p><p>state.json giữ học phần, tiến độ, cấu hình và ghi chú. CSV trong materials được sinh từ dữ liệu này; muốn áp dụng thay đổi CSV bên ngoài, cần nhập lại qua giao diện.</p></details>
    <details id="guide-study" class="import-guide" tabindex="-1" ${topic === 'study' || topic === 'parts' ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">🦉</span>Học và ôn tập</summary><p>Mỗi nghĩa đi kèm một từ loại riêng. Khi học, chỉ cần trả lời đúng một nghĩa bất kỳ.</p><p>Trong Thêm hoặc Sửa thẻ, dùng Thêm định nghĩa để lưu các nghĩa khác. Phần Viết chấp nhận một nghĩa bất kỳ; trắc nghiệm chỉ đưa một nghĩa đúng vào lựa chọn. Các nghĩa vẫn thuộc cùng một thẻ và cùng cấp ghi nhớ.</p><p>Nút dấu cộng tạo học phần, lớp học, thẻ, bài viết hoặc ghi chú mới. Rê chuột lên nút để xem tên chức năng.</p><details id="guide-parts" class="parts-guide" tabindex="-1"><summary>Từ loại và viết tắt tiếng Anh</summary><p>FlashLab dùng thống nhất các viết tắt dưới đây cho từng nghĩa của từ.</p><ul>${partOptions.map(([, label]) => `<li>${esc(label)}</li>`).join('')}</ul></details><h3>Cấp độ và mức thành thạo</h3><p>Để lên cấp 1–6, cần lần lượt 3, 5, 8, 12, 18, 25 điểm tiến độ tại mỗi cấp. Trả lời đúng cộng 1 điểm. Trả lời sai trừ 1 điểm và trừ 1 lượt ở dạng bài vừa làm, tối thiểu 0; sai trong Kiểm tra cũng trừ 1 lượt Kiểm tra. Khi tiến độ đã bằng 0 mà tiếp tục sai, thẻ giảm 1 cấp, tối thiểu cấp 0. Tiến độ bắt đầu lại sau mỗi lần đổi cấp; khi còn 0 điểm, các lượt theo dạng bài cũng được xóa. Câu sai được hẹn ôn lại theo thời gian thử lại trong Cài đặt. Từ cấp 3 được tính là thành thạo.</p><p>Lên cấp 3 cần Trắc nghiệm, Viết và Kiểm tra. Lên cấp 4–6 cần đủ Thẻ ghi nhớ (hoặc Ôn tập), Trắc nghiệm, Viết, Ghép thẻ và Kiểm tra tại cấp hiện tại. Cấp 3–6 cần lần lượt ít nhất 1, 1, 2, 3 lượt đúng trong Kiểm tra. Chỉ lặp lại một dạng sẽ không đủ lên cấp cao.</p><p>Khi bắt đầu Kiểm tra, có thể bật chọn nhiều đáp án và điền nhiều nghĩa. Câu nhiều lựa chọn cần chọn đủ các nghĩa đúng và không chọn nghĩa sai. Câu điền nhiều có nút + thêm ô, mỗi ô một nghĩa khác nhau. Bật tùy chọn thì giao diện giữ đúng chế độ đã chọn, kể cả bài một câu hoặc từ chỉ có một nghĩa. Từ chỉ có một nghĩa vẫn chỉ cần một đáp án. Bỏ các tùy chọn này để chỉ cần trả lời một nghĩa. Kết quả câu điền hiển thị mọi nghĩa hợp lệ.</p><p>Trong Kiểm tra, nhập hoặc chọn đáp án rồi bấm Xác nhận. Sửa đáp án sẽ bỏ xác nhận. Chỉ nộp bài sau khi đã xác nhận các câu.</p></details>
    <details id="guide-writing" class="import-guide" tabindex="-1" ${topic === 'writing' ? 'open' : ''}><summary><span class="guide-icon" aria-hidden="true">🦊</span>Bài viết và ghi chú</summary><p>Bài viết dùng chung cho mọi người trên máy chủ này.</p><p>Ghi chú lưu riêng theo người dùng, đi kèm bản sao lưu hồ sơ.</p><p>Dùng thanh định dạng hoặc nhập Markdown. Chọn ngôn ngữ khi chèn khối mã: cpp hoặc c++ cho C++, markdown hoặc md cho Markdown; text là văn bản thuần. Có thể nhập hoặc tải file .md.</p></details>
  </section>`;
}
export function focusHelpTopic() {
  const topic = location.hash.split('/guide/')[1];
  if (!['import', 'backup', 'study', 'writing', 'parts'].includes(topic))
    return;
  if (topic === 'parts') {
    const parent = document.getElementById(
      'guide-study',
    ) as HTMLDetailsElement | null;
    if (parent) parent.open = true;
  }
  const target = document.getElementById(
    `guide-${topic}`,
  ) as HTMLDetailsElement | null;
  if (!target) return;
  target.open = true;
  target.focus({ preventScroll: true });
  target.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
}
