# Lưu trữ dữ liệu FlashLab

FlashLab dùng SQLite ở backend và IndexedDB ở trình duyệt. Cả bản web và desktop dùng chung lớp lưu trữ. SQLite được tích hợp trong Node.js, không cần dịch vụ database riêng hoặc cài module C++ khi đóng gói Windows.

## Dữ liệu chính

File `flashlab.sqlite` nằm trong thư mục được chọn bởi `storage.directory`/`STORAGE_DIR`. Cấu hình mẫu của bản web dùng `data/profiles` tương đối với gốc dự án. Desktop dùng `data/profiles` trong thư mục dữ liệu ứng dụng `com.flashlab.app` (Windows: `%APPDATA%\com.flashlab.app`). API `/api/storage` trả về thư mục, loại database và đường dẫn file thực tế.

- `profiles`: ID, tên và ngày tạo của mỗi hồ sơ; tên chuẩn hóa là duy nhất.
- `profile_states`: revision và tài liệu JSON chứa học phần, thẻ, tiến độ, lịch sử, cấu hình và ghi chú riêng của từng hồ sơ.
- `articles`: nội dung bài viết dùng chung, tác giả, chủ sở hữu và revision.
- `images`: tên, định dạng và dữ liệu nhị phân của ảnh bài viết/ghi chú.
- `metadata`: đánh dấu từng bước chuyển đổi dữ liệu cũ đã hoàn tất.
- `storage_revision`: theo dõi mọi thay đổi để chặn khôi phục một bản xem trước đã hết hiệu lực.

Ảnh cũ trong `blog/images` được nhập vào SQLite khi backend khởi động và giữ nguyên file gốc. Ảnh mới lưu trực tiếp vào database. Cấu hình runtime vẫn là `flashlab.config.json` cho bản web và `config.json` cho desktop.

Mỗi lần sửa dữ liệu chạy trong transaction `BEGIN IMMEDIATE`. Kiểm tra revision diễn ra trong cùng transaction, kể cả khi có hai kết nối. Xóa hồ sơ tự xóa trạng thái liên quan bằng foreign key. Database dùng WAL, `synchronous=FULL`, và đóng kết nối khi backend tắt bình thường. Đây là database cục bộ; không tự đồng bộ giữa các máy.

## Chuyển đổi từ JSON

Khi chưa có dấu chuyển đổi thành công, backend đọc danh sách hồ sơ và toàn bộ trạng thái cũ, kiểm tra schema/ID rồi nhập trong một transaction. Hỗ trợ cấu trúc `profiles.json` cùng `<ID>/state.json`, cũng như `state.json` và `state.json.profiles.json` của bản cũ. Việc chuyển thư mục lưu trữ từ vị trí `storage` mặc định cũng ưu tiên database hiện có thay cho JSON cũ.

File nguồn được giữ nguyên. Một hồ sơ hỏng làm toàn bộ lần nhập thất bại; sửa nguồn rồi khởi động/truy cập lại để thử tiếp. Sau khi đã nhập thành công, backend không đọc lại JSON để tránh phục hồi nhầm dữ liệu đã xóa. Bài viết từ `blog/index.json` được nhập riêng với cùng cơ chế transaction và giữ file gốc.

Thoát mọi phiên ứng dụng cũ trước khi dùng phiên bản mới để tránh tiếp tục ghi dữ liệu vào JSON cũ. Sau khi chuyển đổi, không chạy lại phiên bản chỉ hiểu JSON trên cùng kho dữ liệu; các file gốc chỉ là bản trước khi chuyển đổi.

## IndexedDB và hiệu năng

IndexedDB `flashlab`, object store `cache`, giữ trạng thái gần nhất và các thay đổi chờ đồng bộ theo ID hồ sơ. Ghi bất đồng bộ, giữ thứ tự, và bỏ qua những bản đệm đã bị thay thế trước khi đến lượt ghi. Không ghi lại toàn bộ dữ liệu học vào `localStorage`. Các tùy chọn nhỏ vẫn có thể dùng `localStorage`.

Dữ liệu trình duyệt cũ được chuyển khi đọc lần đầu. Chỉ xóa khóa cũ sau khi transaction IndexedDB hoàn tất. Nếu trình duyệt chặn lưu hoặc hết dung lượng, bản cũ được giữ lại và ứng dụng báo lỗi lưu đệm. Xung đột với backend giữ nguyên thay đổi chờ đồng bộ để người dùng quyết định; không tự ghi đè trạng thái khác.

API vẫn trao đổi toàn bộ trạng thái của một hồ sơ và cần parse/kiểm tra dữ liệu trên giao diện. Đổi storage giảm ghi đồng bộ, nhưng không đảm bảo giải quyết mọi nguyên nhân khựng khi hồ sơ quá lớn.

## Sao lưu bằng một file SQLite

Trong Cài đặt:

- **Sao lưu hồ sơ (.sqlite)**: hồ sơ được chọn, toàn bộ trạng thái học, bài viết do hồ sơ đó sở hữu và ảnh được tham chiếu. Không chứa trạng thái của hồ sơ khác.
- **Sao lưu toàn bộ (.sqlite)**: mọi hồ sơ, trạng thái, toàn bộ bài viết và toàn bộ ảnh lưu trong database, kể cả ảnh chưa được tham chiếu.
- **Khôi phục từ database**: chọn file `.sqlite` hoặc `.db`, xem phạm vi rồi xác nhận. Cũng có thể mở chức năng này trong menu người dùng.

Bản sao giữ ID/tên/ngày tạo hồ sơ; học phần và lớp học; tất cả nghĩa, từ loại, cách đọc, ngôn ngữ và ảnh nhúng của thẻ; tiến độ SRS, dấu sao/đã nhớ/tạm dừng; lịch sử và kết quả từng câu kể cả khi học phần đã xóa; cấu hình avatar, giao diện, ngôn ngữ, âm thanh, học tập; ghi chú cá nhân và metadata bài viết. Địa chỉ ảnh trên Internet được giữ nguyên dưới dạng URL, không tự tải nội dung từ dịch vụ ngoài.

Xuất dùng `VACUUM INTO` để lấy một snapshot nhất quán của database đang chạy, gồm dữ liệu trong WAL. File tải xuống là SQLite độc lập, không cần file ảnh, ZIP hay JSON đi kèm. Bản hồ sơ được VACUUM lần nữa sau khi lọc để loại nội dung của người khác khỏi các trang trống. Giới hạn file xuất/nhập hiện tại là **100 MB**; vượt giới hạn sẽ báo lỗi, không cắt bớt dữ liệu.

Nhập kiểm tra định dạng, cấu trúc, toàn bộ schema, ID và ảnh tham chiếu trước khi thay đổi. Thiếu ảnh hoặc có trường mới mà phiên bản hiện tại không hiểu thì từ chối, không âm thầm bỏ thông tin. Hash của file và revision toàn kho phải khớp bản xem trước. Nếu dữ liệu vừa thay đổi, người dùng phải xem và xác nhận lại.

Khôi phục toàn bộ thay dữ liệu hiện tại trong một transaction. Khôi phục một hồ sơ thay hồ sơ cùng ID và bài viết do hồ sơ đó sở hữu, giữ nguyên hồ sơ khác; xung đột tên, ID bài viết của người khác hoặc ảnh cùng ID nhưng khác nội dung sẽ bị từ chối. Revision nội bộ được tăng để các trang cũ không ghi đè dữ liệu vừa khôi phục. Lỗi trong transaction sẽ rollback toàn bộ.

Trước khi khôi phục, ứng dụng tự lưu snapshot toàn kho vào `restore-backups/before-restore-*.sqlite` trong thư mục lưu trữ. Có thể nhập file này để quay lại dữ liệu trước đó. Các bản dự phòng được giữ đến khi người dùng chủ động xóa.

Cổng, đường dẫn lưu trữ và `.env` thuộc cấu hình của từng máy; không ghi đè chúng khi nhập database từ máy khác. Thư mục/ZIP JSON cũ vẫn có thể nhập để tương thích; API `/api/profiles/:id/export` cũ vẫn cung cấp ZIP cho công cụ cũ. Giao diện mặc định dùng SQLite.

Nếu sao chép thủ công database thay vì xuất qua giao diện, dừng backend và sao chép cả thư mục lưu trữ (gồm WAL/SHM nếu còn) để bảo toàn bản cũ và dự phòng. Không chép riêng file `.sqlite` đang được ghi.
