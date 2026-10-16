# Prompt tạo thẻ FlashLab

Sao chép khối dưới đây vào AI, thay các phần trong dấu […] rồi gửi. Nếu có tài liệu nguồn, đính kèm cùng prompt. Mẫu dùng chung cho TXT, CSV và Excel; các ví dụ ở cuối đã được kiểm tra bằng bộ nhập của FlashLab.

```text
Bạn tạo dữ liệu thẻ học để nhập trực tiếp vào FlashLab. Hãy thực hiện yêu cầu sau và tuân thủ định dạng bên dưới.

YÊU CẦU CỦA TÔI
- Chủ đề hoặc tài liệu nguồn: [điền chủ đề, danh sách từ hoặc dùng tài liệu đính kèm]
- Số thẻ: [ví dụ 30]
- Ngôn ngữ thuật ngữ: [ví dụ tiếng Anh]
- Ngôn ngữ định nghĩa và ghi chú: [ví dụ tiếng Việt]
- Trình độ: [ví dụ B1]
- Định dạng đầu ra: [CSV / TXT / Excel .xlsx]
- Ngôn ngữ đọc: [ví dụ en-GB; để trống nếu không cần]
- Phạm vi nghĩa: [chỉ nghĩa trong tài liệu / các nghĩa thông dụng]

CẤU TRÚC BẮT BUỘC
Đúng 5 cột theo thứ tự, hàng đầu ghi nguyên văn:
front,definition,pronunciation,notes,image

1. front — Thuật ngữ. Bắt buộc, tối đa 4.000 ký tự.
2. definition — Toàn bộ định nghĩa và từ loại của thuật ngữ, chung một ô. Bắt buộc.
   Luôn dùng mảng JSON hợp lệ, ví dụ:
   [{"meaning":"sách","partOfSpeech":"n."},{"meaning":"đặt chỗ","partOfSpeech":"v."}]
   Mỗi đối tượng là một cặp nghĩa–từ loại riêng. Từ có nhiều nghĩa cùng từ loại vẫn dùng nhiều đối tượng.
   Tối đa 20 nghĩa mỗi thẻ; mỗi meaning không rỗng và tối đa 4.000 ký tự.
   Không tạo cột từ loại riêng, cột nghĩa phụ hay cột back2. Không tách các nghĩa của cùng thuật ngữ thành nhiều dòng.
   Với nội dung không có từ loại, ví dụ câu hỏi toán học, dùng partOfSpeech là chuỗi rỗng.
3. pronunciation — Cách đọc. Có thể bỏ trống.
   Nếu chỉ cần phiên âm, ghi chuỗi phiên âm, ví dụ /bʊk/.
   Nếu có ngôn ngữ đọc, dùng JSON: {"text":"/bʊk/","language":"en-GB"}.
   text tối đa 500 ký tự. language chỉ chọn trong:
   en-US, en-GB, zh-CN, zh-TW, ja-JP, ko-KR, vi-VN, fr-FR, de-DE, es-ES.
   Tiếng Anh dùng IPA; tiếng Trung có thể dùng pinyin có dấu thanh; tiếng Nhật có thể dùng kana; tiếng Hàn có thể dùng cách đọc Hangul. Không tự bịa phiên âm khi không chắc.
4. notes — Ghi chú hoặc ví dụ ngắn, tối đa 4.000 ký tự. Có thể bỏ trống.
   Đặt giải thích, mẹo nhớ và ví dụ ở đây; không thêm chúng vào đáp án nếu người học chỉ cần trả lời nghĩa.
5. image — Ảnh minh họa. Mặc định để trống.
   Chỉ điền khi tôi cung cấp dữ liệu ảnh hợp lệ dạng data:image/png;base64,... hoặc jpeg, webp, gif.
   Không điền URL, đường dẫn máy tính, Markdown ảnh, mô tả ảnh hay dữ liệu base64 tự bịa.

TỪ LOẠI
Dùng các viết tắt thống nhất của FlashLab:
n. = danh từ; pron. = đại từ; v. = động từ; adj. = tính từ;
adv. = trạng từ; prep. = giới từ; conj. = liên từ; interj. = thán từ;
det. = từ hạn định; art. = mạo từ; aux. = trợ động từ;
mod. = động từ khuyết thiếu; num. = số từ; part. = tiểu từ;
predet. = từ tiền hạn định; quant. = từ chỉ lượng;
interrog. = từ nghi vấn; rel. = từ quan hệ; exclam. = từ cảm thán;
disc. = từ/cụm từ đánh dấu diễn ngôn; inf. = dấu hiệu động từ nguyên mẫu;
neg. = từ phủ định; exist. = từ chỉ sự tồn tại.
Chọn từ loại theo từng nghĩa cụ thể. Nếu không xác định được, để chuỗi rỗng.

QUY TẮC XUẤT
- Một dòng dữ liệu là một thẻ. Thuật ngữ không trùng nhau sau khi bỏ khoảng trắng đầu/cuối và so sánh không phân biệt hoa/thường.
- Chỉ front và definition bắt buộc; vẫn phải giữ đủ 5 cột khi các ô khác để trống.
- CSV hoặc TXT: dùng dấu phẩy, UTF-8, có hàng tiêu đề. Bọc TẤT CẢ ô dữ liệu bằng dấu nháy kép. Mọi dấu nháy kép bên trong ô phải viết thành hai dấu nháy kép.
- JSON phải hợp lệ trước khi mã hóa thành ô CSV. Không dùng dấu nháy đơn thay dấu nháy kép. Không escape JSON theo kiểu JavaScript bên ngoài ô CSV.
- Excel: tạo file .xlsx thật nếu có công cụ. Trang tính đầu chứa đúng 5 cột; hàng đầu là tiêu đề. Mỗi giá trị nằm trong một ô dạng văn bản, không công thức, không gộp ô. Ô JSON dùng JSON bình thường, không nhân đôi dấu nháy như CSV.
- Nếu không tạo được .xlsx thật, nói ngắn gọn và cung cấp CSV đúng chuẩn để tôi lưu hoặc mở bằng Excel; không đổi đuôi CSV thành .xlsx.
- Ưu tiên đính kèm file tải được. Nếu chỉ xuất nội dung CSV/TXT, trả đúng một khối mã chứa toàn bộ dữ liệu; không thêm bảng Markdown, số thứ tự, dấu “...” hay giải thích bên trong dữ liệu. Khi lưu file, bỏ các dấu hàng rào khối mã.
- Không thêm cột ID, tiến độ, cấp độ, sao hoặc số thứ tự.

TỰ KIỂM TRA TRƯỚC KHI TRẢ KẾT QUẢ
- Đúng 5 cột ở mọi dòng sau khi đọc CSV, không đếm dấu phẩy bằng mắt vì JSON cũng có dấu phẩy.
- definition đọc được bằng JSON, có 1–20 đối tượng và mỗi đối tượng có meaning cùng partOfSpeech dạng chuỗi.
- pronunciation nếu là JSON phải có text dạng chuỗi và language nằm trong danh sách được hỗ trợ.
- Không có thuật ngữ hoặc nghĩa rỗng, không có thuật ngữ trùng, không có ảnh giả.
- Nghĩa, từ loại, phiên âm và ví dụ khớp nhau; không thêm thông tin không được tài liệu hỗ trợ khi tôi yêu cầu chỉ dùng tài liệu nguồn.
- Nếu có công cụ chạy mã, dùng bộ đọc CSV/JSON và mở lại .xlsx để kiểm tra thực tế trước khi giao file.
```

## Ví dụ CSV hoặc TXT

Lưu nội dung khối sau vào file `.csv` hoặc `.txt` bằng UTF-8. Có thể nhập bằng chức năng Nhập file hoặc dán vào Nhập text.

```csv
front,definition,pronunciation,notes,image
"book","[{""meaning"":""sách"",""partOfSpeech"":""n.""},{""meaning"":""đặt chỗ"",""partOfSpeech"":""v.""}]","{""text"":""/bʊk/"",""language"":""en-GB""}","I read a book. / Please book a room.",""
"hello","[{""meaning"":""xin chào"",""partOfSpeech"":""interj.""}]","/həˈləʊ/","Lời chào thông dụng.",""
```

Trong Excel, cùng một ô definition dùng JSON bình thường như sau, không nhân đôi dấu nháy:

```json
[
  { "meaning": "sách", "partOfSpeech": "n." },
  { "meaning": "đặt chỗ", "partOfSpeech": "v." }
]
```

Bản ngắn để dùng sau khi đã gửi prompt đầy đủ:

```text
Tạo [30] thẻ về [chủ đề] cho FlashLab theo quy tắc đã thống nhất. Xuất [CSV/TXT/.xlsx] với đúng 5 cột front,definition,pronunciation,notes,image. Gom mọi nghĩa và từ loại của mỗi thuật ngữ trong một mảng JSON ở definition. Dùng [tiếng Việt] cho nghĩa, [en-GB] cho ngôn ngữ đọc; image để trống. Kiểm tra cấu trúc và từ trùng trước khi trả file.
```
