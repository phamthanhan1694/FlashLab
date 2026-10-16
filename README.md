# FlashLab

Ứng dụng flashcards với frontend và backend TypeScript, giữ giao diện tiếng Việt và 6 chế độ: Flashcards, Learn, Write, Test, Match, ôn tập SRS. Hỗ trợ hồ sơ người dùng không cần đăng nhập, quản lý học phần/thẻ, đánh dấu sao, thống kê, CSV, xuất ZIP và nhập thư mục người dùng.

## Yêu cầu

Khuyến nghị Node.js 24.21.0 LTS và npm đi kèm (đã ghim trong `.nvmrc` và `.node-version`). Phiên bản tối thiểu: Node.js 22.14. Với WSL, cài Node bên trong Linux; không dùng npm của Windows để chạy trong WSL.

## Nếu WSL gọi nhầm npm của Windows

Kiểm tra trong terminal WSL:

```bash
command -v node
command -v npm
node -p process.platform
```

Platform phải là `linux`; đường dẫn Node/npm không được trỏ tới `/mnt/c/`. Nếu log chứa `CMD.EXE`, `UNC paths are not supported`, `C:\Windows\package.json` hoặc lỗi workspace khi dùng npm Windows, cài Node.js bên trong WSL và ưu tiên thư mục `bin` của bản Linux trong PATH. Mở terminal WSL mới sau khi cập nhật PATH, rồi chạy `npm ci` lại từ gốc dự án. Không cần xóa lockfile để xử lý lỗi này.

## Chạy phát triển

Lần đầu lấy mã nguồn, sao chép cấu hình mẫu như bên dưới (PowerShell dùng `Copy-Item`). Nếu đã có `flashlab.config.json`, giữ nguyên file đó. Cấu hình riêng và `.env` không được đưa vào Git; cấu hình mẫu lưu dữ liệu tại `data/profiles`.

```bash
cp flashlab.config.example.json flashlab.config.json
npm ci
npm run dev
```

Mở URL **FlashLab frontend** in trong terminal. Trên Windows có thể chạy `start-flashcard.bat`: file này đọc cấu hình qua trình khởi động chung, chờ API qua proxy frontend sẵn sàng rồi mở trình duyệt tại cổng thực tế. Cổng ưu tiên là frontend **43891**, API **43871**, đọc từ `flashlab.config.json`. Trình khởi động dò cổng trống và truyền cổng API được chọn cho proxy Vite. Nếu cổng bị phần mềm khác chiếm, ứng dụng chọn cổng tiếp theo trong phạm vi cấu hình; không dừng hay chiếm cổng của phần mềm đó. Các workspace dùng chung một lockfile ở thư mục gốc. Trong chế độ dev, frontend và backend đọc trực tiếp mã nguồn shared; thay đổi schema vẫn được theo dõi mà không cần tiến trình biên dịch shared riêng. Bản production tiếp tục dùng shared/dist đã biên dịch.

Có thể sao chép riêng `start-flashcard.bat` đến `E:\Scripts` hoặc Desktop Windows rồi chạy trực tiếp. Khi thư mục chứa BAT không có project, nó tự khởi động project WSL hiện tại tại `\\wsl.localhost\Ubuntu\home\anpham\projects\FlashLab_HTML`, kể cả khi WSL chưa chạy; không cần thêm file đường dẫn. Muốn tạo shortcut trên Desktop: nhấp phải file BAT đã sao chép → **Send to → Desktop (create shortcut)**. Shortcut chỉ đến BAT trên Windows, còn BAT khởi động project WSL và mở trình duyệt.

Nếu chuyển project sang vị trí khác, có thể sửa `DEFAULT_PROJECT_DIR` ở đầu BAT, hoặc dùng `start-flashcard-path.txt` đặt cạnh BAT (một dòng đường dẫn; tham khảo `start-flashcard-path.example.txt`). Có thể truyền đường dẫn khi chạy: `start-flashcard.bat "E:\Projects\FlashLab_HTML"` hoặc đặt biến `FLASHLAB_PROJECT_DIR`. Thứ tự ưu tiên: tham số → biến môi trường → file đường dẫn → project cạnh BAT → địa chỉ WSL mặc định trong BAT. Project trên Windows chạy bằng Windows npm; project WSL chạy bằng Linux npm. Windows cần Node.js 22.14+; project WSL cần Node/npm cài bên trong Linux. Cổng và kho dữ liệu vẫn đọc từ `flashlab.config.json` trong project.

## Kiểm tra và build

```bash
npm run typecheck
npm test
npm run build
npm run test:ui
npm run test:server
npm run test:config
npm start
```

Bản production ưu tiên http://127.0.0.1:43871, nếu bị chiếm sẽ thử cổng tiếp theo và in URL thực tế; backend phục vụ cả API và frontend đã build. `npm run format` định dạng mã; `npm run format:check` kiểm tra định dạng.

Không mở trực tiếp `index.html` bằng `file://` trong phiên bản này.

## Cấu trúc mã

- `apps/frontend`: Vite, TypeScript strict, HTML/CSS; giữ giao diện và logic các chế độ học. `src/core/` quản lý đồng bộ và tiện ích; `src/features/` chia theo học tập, người dùng và hoạt động; `src/ui/` chứa giao diện dùng chung; `src/types/` chứa kiểu trạng thái.
- `apps/backend`: Fastify, TypeScript strict; `src/http/app.ts` cấu hình HTTP, `src/storage/` xử lý dữ liệu, `src/server.ts` khởi chạy. Test tích hợp dùng HTTP injection của Fastify. `test:ui` chạy bundle production trong DOM mô phỏng; chưa thay thế kiểm tra hiển thị bằng trình duyệt thực.
- `packages/shared`: schema Zod và các kiểu dữ liệu suy ra từ schema, dùng ở cả frontend/backend.
- `apps/frontend/public/`: tài nguyên tĩnh gốc, gồm âm thanh và animation; Vite phục vụ trực tiếp khi dev và sao chép vào bản build.

## Giao diện và sao lưu

Màu nhận diện học phần hỗ trợ màu mẫu, bảng màu tùy chọn và mã HEX (3 hoặc 6 ký tự, có hoặc không có `#`). Màu tùy chọn được lưu cùng dữ liệu và bản sao lưu JSON. Trang Tổng quan đặt Học phần gần đây cạnh Phiên học gần đây, phân trang 5 mục/trang. Bấm vào phiên học để xem lại câu hỏi, đáp án và đánh giá đã lưu. Lưới lượt học dùng màu liên tục theo số lượt; tooltip ghi số lượt chính xác.

Chọn **Giao diện → Sáng / Tối / Hệ thống** ở thanh trên cùng. Ứng dụng lưu lựa chọn riêng cho người dùng đang chọn và đồng bộ lên máy chủ; chế độ Hệ thống đi theo thiết lập của thiết bị.

Mở **Cài đặt → Xuất thư mục ZIP** để sao lưu dữ liệu và cấu hình của người dùng đang chọn. Để khôi phục, giải nén ZIP rồi vào menu người dùng → **Nhập thư mục người dùng** và chọn thư mục vừa giải nén. Thư mục CSV cũng có thể được nhập để tạo người dùng và học phần. Ghi đè người dùng đã có cần xác nhận; hủy hoặc dữ liệu không hợp lệ không ghi đè dữ liệu hiện tại. Chỉ báo hoàn tất sau khi máy chủ đã lưu.

## Người dùng

Bấm tên/ảnh đại diện ở góc trên bên phải để **Thêm người dùng**, **Vào dùng** hoặc **Xóa**. Mỗi hồ sơ hiển thị tên và ID. ID được tạo tự động, không trùng và dùng làm tên thư mục; hồ sơ cũ mặc định giữ ID `default`, hồ sơ mới dùng UUID. Tên không được trùng (không phân biệt hoa/thường, khoảng trắng thừa và Unicode tương đương), tối đa 60 ký tự và 50 hồ sơ. Xóa cần xác nhận; luôn giữ ít nhất một hồ sơ. Khi xóa hồ sơ đang dùng, ứng dụng chuyển sang hồ sơ còn lại.

Mỗi hồ sơ có học phần, thẻ, lịch sử, tiến độ SRS, giao diện và âm thanh riêng. Hồ sơ mới bắt đầu trống, giao diện theo hệ thống và nhạc nền 100%. Dữ liệu cũ tự được sao chép sang thư mục của **Người dùng mặc định** và các hồ sơ đã có, giữ nguyên file cũ, cấu hình trình duyệt cũ được đưa vào hồ sơ này lần đầu. Ứng dụng nhớ hồ sơ vừa chọn; khi chuyển, dữ liệu chưa đồng bộ được giữ trong cache riêng của hồ sơ đó. Tạo/xóa người dùng cần kết nối backend. Đây là lựa chọn hồ sơ không có xác thực, đúng luồng không cần đăng nhập.

`GET /api/storage` trả thư mục lưu trữ đang dùng. `POST /api/profiles/:id/import` nhận `{ confirmed: true, revision, backup }`, kiểm tra ID và revision trước khi ghi đè; hồ sơ mới dùng `revision: null`. `GET /api/profiles` trả danh sách hồ sơ; `POST /api/profiles` nhận `{ name }`; `DELETE /api/profiles/:id` xóa hồ sơ. `GET/PUT /api/profiles/:id/state` đọc/ghi dữ liệu và cấu hình riêng, có revision chống ghi đè. `/api/state` giữ tương thích với hồ sơ mặc định; hồ sơ đã xóa trả 404 và không tự tạo lại khi tab cũ cố lưu.

## API và dữ liệu

`GET /api/health` kiểm tra tiến trình. `GET /api/state` trả `{ revision, data }`; `data` là `null` nếu máy chủ chưa được khởi tạo. `PUT /api/state` nhận `{ revision, data }`; trả bản mới cùng revision tăng lên. Dữ liệu sai trả 400, revision cũ trả 409, body quá 20 MB trả 413.

Thư mục lưu trữ mặc định là `data/storage/`, cấu hình bằng `storage.directory` trong `flashlab.config.json`. Danh sách người dùng nằm trong `profiles.json`; mỗi người có thư mục `<ID>/` chứa `user.json` (tên, ID) và `state.json` (ID, revision, học phần, tiến độ, cấu hình). Mỗi học phần còn có một file CSV trong `<ID>/materials/`, kèm `index.json` ánh xạ tên học phần, ID và tên file. CSV mã hóa UTF-8 có BOM, cột `front,back`, giữ dấu tiếng Việt, dấu phẩy, dấu nháy và xuống dòng trong nội dung. Backend tự cập nhật khi thêm/sửa/xóa thẻ, nhập CSV hoặc khôi phục thư mục người dùng; tự tạo cho dữ liệu cũ khi tải danh sách người dùng. File CSV sinh ra theo ID để tránh trùng tên; xóa học phần sẽ xóa CSV tương ứng. JSON là nguồn dữ liệu chính; chỉnh CSV bên ngoài cần nhập lại qua giao diện để áp dụng. Sao lưu toàn bộ thư mục lưu trữ để giữ đủ các hồ sơ. Lần đầu chuyển sang cấu trúc mới, backend sao chép từ `DATA_FILE` và các file hồ sơ cũ, không xóa bản gốc. Khi chọn ổ mới còn trống, backend ưu tiên sao chép từ thư mục `data/storage/` hiện có trước khi tìm dữ liệu legacy. Các lần ghi được xếp hàng và thay file bằng rename nguyên tử; file lỗi không bị tự ghi đè bằng dữ liệu rỗng. Giải pháp dùng một tiến trình backend, không chạy nhiều replica cùng ghi vào file.

Frontend lưu cache trong localStorage. Mất kết nối thì thay đổi được giữ tạm và thử lại; trạng thái trên giao diện cho biết khi nào đã đồng bộ. Khi revision xung đột, app dừng ghi máy chủ; xuất JSON để giữ bản đang mở, sau đó chọn **Tải bản máy chủ**. Nút này cũng tải JSON dự phòng trước khi thay dữ liệu. Có thể nhập lại JSON có chủ ý sau khi tải bản mới. Không có tự động gộp thay đổi từ nhiều tab. Nên sao lưu JSON thường xuyên và sao lưu file dữ liệu máy chủ.

Nếu dùng bản HTML cũ bằng `file://`, hãy **Sao lưu dữ liệu** ở bản cũ rồi **Nhập sao lưu** ở bản mới. Trình duyệt tách localStorage theo origin nên ứng dụng tại localhost không thể tự đọc dữ liệu đã lưu khi mở file trực tiếp. Dữ liệu legacy `flashlab.html.v2` sẽ được đọc nếu nằm cùng origin; cache mới dùng khóa riêng.

## Cấu hình

Cấu hình chính nằm trong **`flashlab.config.json`**, không cần sửa mã nguồn:

- `server`: địa chỉ bind, cổng API/frontend và số cổng được phép dò (`portSearchLimit`). Cổng ưu tiên là 43871/43891; không thể bảo đảm một cổng luôn trống, nên ứng dụng kiểm tra khi khởi động và chỉ bind cổng còn trống.
- `storage`: thư mục lưu trữ và file legacy dùng khi chuyển đổi. Đường dẫn tương đối tính từ gốc dự án, không phụ thuộc thư mục đang chạy lệnh.
- `study`: số giây tự chuyển câu, ngưỡng hoàn thành tốt, số phiên mỗi trang, số câu Test và số cặp Match.
- `defaults`: giao diện và âm thanh mặc định cho hồ sơ mới; cấu hình riêng đã lưu của từng người được giữ nguyên.

Ví dụ muốn lưu ở **ổ E, thư mục data**, đổi riêng giá trị này trong phần `storage`:

```json
"directory": "E:/data"
```

Windows dùng trực tiếp `E:/data`; trên WSL/Linux ứng dụng chuyển sang `/mnt/e/data`. Cũng có thể nhập trực tiếp `/mnt/e/data` hoặc đường dẫn ổ đã gắn khác. Đây là ổ trên máy chạy backend. Khi chuyển từ kho mặc định sang kho mới trống, ứng dụng sao chép dữ liệu hiện tại và giữ nguyên bản gốc. Khi chuyển giữa hai kho tùy chọn, dừng backend và sao chép toàn bộ kho hiện tại sang đích trước khi đổi đường dẫn; không tự gộp một kho đích đã có dữ liệu.

Sau khi sửa file cấu hình, khởi động lại ứng dụng. Backend cung cấp cấu hình học qua `/api/config` nên thay thiết lập học không cần build lại frontend. Có thể dùng `FLASHLAB_CONFIG` trong `.env` để chỉ định một file JSON khác. Các biến `.env` cũ `HOST`, `PORT`, `DATA_FILE`, `STORAGE_DIR` vẫn được ưu tiên nếu đã khai báo; xóa chúng để dùng hoàn toàn file JSON. `DATA_FILE` chỉ là nguồn legacy, không phải kho mới. Khởi động dev bằng `npm run dev` ở gốc dự án để API và frontend nhận cùng cặp cổng được dò.

Thuật ngữ phải duy nhất trong từng học phần khi thêm, sửa hoặc nhập CSV/JSON; không phân biệt chữ hoa/thường, khoảng trắng thừa và cách mã hóa Unicode tương đương. Các học phần khác nhau được dùng cùng thuật ngữ. File nhập có thuật ngữ trùng sẽ bị từ chối toàn bộ và hiện lý do. Dữ liệu cũ vẫn đọc được; nếu đã có thẻ trùng, cần sửa hoặc xóa các thẻ trùng trước khi lưu lên máy chủ.

Âm thanh học tập nằm trong `apps/frontend/public/sounds/`: nhạc nền `background.wav` trên mọi trang và chế độ học, `test-background.wav` cho Test, hiệu ứng `correct.mp3`, `incorrect.mp3`, `completed.mp3`, `keep-trying.mp3`, `flip.wav`, `swipe.wav`. Menu **Âm thanh** cho phép bật/tắt riêng nhạc và hiệu ứng, chỉnh riêng âm lượng nhạc nền (mặc định 100%) và hiệu ứng, lưu lựa chọn riêng trong hồ sơ và đồng bộ lên máy chủ. Nhạc bắt đầu sau thao tác đầu tiên, lặp trên mọi trang và tạm dừng khi ẩn tab; kết thúc Test chuyển về nhạc nền chung. Hoàn thành từ 80% phát âm thanh chúc mừng, dưới mức này phát âm thanh động viên.

Luyện tập giữ thanh thời gian và tự chuyển sau 5 giây (đổi tại `study.autoAdvanceSeconds`); có thể chuyển ngay bằng nút phía trên đáp án. Chế độ Kiểm tra không tự chuyển câu, có đồng hồ và lưới điều hướng 4 cột bên trái, giữ đáp án khi quay lại và chỉ chấm khi nộp bài; chi tiết đáp án được thu gọn. Match tính tỉ lệ số lượt ghép đúng trên tổng lượt thử (kể cả sai). Hiệu ứng chuyển flashcard hỗ trợ tùy chọn giảm chuyển động của hệ thống.

Mỗi lượt học/luyện tập hoàn thành với toàn bộ câu trả lời đúng (100%) phát một lần animation `apps/frontend/public/assets/animations/confetti_on_transparent_background.lottie` trên màn hình kết quả. Hiệu ứng không chặn nút thao tác, tự dọn khi phát xong hoặc rời màn hình, và tôn trọng tùy chọn giảm chuyển động của hệ điều hành. Trình phát và WebAssembly được đóng gói cùng ứng dụng, không cần tải từ CDN.

Trong **Cài đặt** (biểu tượng bánh răng), bấm **Xuất thư mục ZIP** để tải thư mục chứa học phần CSV, tiến độ và cấu hình. Để nhập lại, giải nén ZIP rồi chọn **Nhập thư mục người dùng**, chọn thư mục ID chứa `user.json` và `state.json`. Nếu ID đã tồn tại, ứng dụng yêu cầu xác nhận trước khi ghi đè. Các file JSON bên trong thư mục là dữ liệu nội bộ; giao diện không còn nút sao lưu JSON riêng.

Flashcards cho phép tích Đã nhớ (thẻ mới mặc định Chưa nhớ), đánh dấu sao và lưu trạng thái theo người dùng. Kết quả phiên học hiển thị số từ đã nhớ, chưa nhớ và tỷ lệ đã nhớ; quay lại đổi lựa chọn không tăng số thẻ. Có thể chọn theo thứ tự hoặc ngẫu nhiên cho từng chế độ; thẻ ghi nhớ mặc định theo thứ tự, các chế độ khác mặc định ngẫu nhiên. Danh sách thẻ trong học phần chia 20 thẻ mỗi trang.

Có thể chọn một thư mục CSV bất kỳ bằng **Nhập thư mục người dùng**: tên thư mục là tên người dùng mới, mỗi CSV (kể cả trong thư mục con) tạo một học phần; thẻ mới mặc định chưa nhớ và chưa đánh sao.

Cài đặt gộp giao diện Sáng/Tối/Hệ thống bằng biểu tượng, xuất thư mục ZIP và bộ trộn âm thanh. Âm lượng chung điều khiển toàn bộ 8 loại: nhạc nền, nhạc kiểm tra, trả lời đúng/sai, hoàn thành, cần cố gắng, lật thẻ và chuyển thẻ. Mở **Âm lượng từng loại** để chỉnh âm lượng, tắt tiếng hoặc nghe thử từng loại. Các thay đổi tự lưu theo người dùng.

Trong Cài đặt, chọn **VN / EN** để đổi ngôn ngữ giao diện theo người dùng; nội dung thẻ, học phần và tên người dùng giữ nguyên. Giao diện tiếng Việt dùng Thẻ ghi nhớ, Luyện tập, Viết, Kiểm tra, Ghép cặp và Ôn tập SRS.

Khi chọn mỗi chế độ (hoặc học lại), ứng dụng mở hộp thoại nổi trên trang hiện tại để hỏi thứ tự, số câu/số cặp và loại câu hỏi nếu là Kiểm tra. Số câu mặc định luôn là toàn bộ thẻ phù hợp đang có; ô nhập giới hạn từ 1 đến số thẻ đó. Thứ tự và loại câu hỏi được ghi nhớ theo người dùng, còn số câu trở về tối đa ở mỗi phiên mới. Chế độ Kiểm tra có lưới 4 cột (16 câu thành 4×4); có thể nhảy trực tiếp giữa các câu và nộp bài từ bất kỳ câu nào.

Tổng quan có lưới hoạt động theo năm dương lịch, chọn từ năm tạo tài khoản đến năm hiện tại, một ô mỗi ngày; năm mức màu tương ứng 0, 1–4, 5–9, 10–19 và từ 20 lượt học. Rê chuột hoặc dùng bàn phím vào ô để xem ngày và số lượt cụ thể.

Thanh bên có nút thu gọn/mở rộng; kéo mép phải để đổi độ rộng trong khoảng 200–360 px. Có thể dùng phím mũi tên, Home/End khi lấy nét vào mép kéo. Bố cục được nhớ riêng theo người dùng; trên điện thoại vẫn dùng menu sổ ra/vào.

Mục **Lớp học** cho phép tạo lớp, đổi tên/mô tả, chọn hoặc bỏ học phần khỏi lớp. Một học phần có thể nằm trong nhiều lớp. Xóa lớp chỉ xóa nhóm, giữ nguyên học phần và tiến độ. Dữ liệu lớp học được lưu theo người dùng và nằm trong ZIP xuất ra. Khi xóa học phần, ứng dụng cũng xóa liên kết của học phần đó trong các lớp.

Thống kê được gộp vào **Tổng quan**: chỉ số tổng, lịch hoạt động, tiến độ theo học phần và phiên học gần đây nằm trên một trang. Đường dẫn Thống kê cũ tự chuyển về Tổng quan. Trang **Ôn tập đến hạn** liệt kê thuật ngữ, định nghĩa, trạng thái chưa học/đến hạn và học phần của từng thẻ; danh sách chia 20 thẻ mỗi trang.

Bộ trộn âm thanh có nút phát/dừng nhạc nền và nghe thử/dừng riêng từng âm thanh. Dừng nghe thử không tạo thêm âm thanh hoặc tự phát lại nhạc nền; cần bấm phát để tiếp tục. Tắt tiếng và đổi âm lượng không đóng bảng Cài đặt. Trong cửa sổ quản lý lớp, có thể tìm học phần theo tên/mô tả; học phần đã chọn vẫn được giữ khi lọc tìm kiếm.

Hộp thoại chọn cách học chỉ chuyển sang trang học khi bấm **Bắt đầu**. Bấm **Hủy**, nút đóng, ngoài hộp thoại hoặc Escape để giữ nguyên trang phía sau.

**Thành thạo (mastered)** được tính khi thẻ đạt cấp SRS từ 3 trở lên: ít nhất ba lượt được chấm đúng liên tiếp; một lượt sai đặt lại cấp về 0. Tích Đã nhớ một lần chưa đủ thành thạo. **Phiên học gần đây** có bộ lọc Từ ngày/Đến ngày, tính cả hai ngày biên theo múi giờ trình duyệt; để trống một đầu để lọc một phía, hoặc xóa bộ lọc để xem tất cả. Các câu trắc nghiệm hiện chỉ chọn một đáp án đúng, được ghi rõ **Single choice / Chọn một đáp án**.

## Chạy production

Xem [hướng dẫn production](docs/production.md). File `.env` ở gốc đã được tạo; các biến ghi đè lưu trữ mặc định đang để chú thích để giữ vị trí dữ liệu hiện tại.

## Avatar và ôn tập

Bộ chọn avatar có tìm kiếm theo tên Việt/Anh và phân trang 5 mục/trang. Danh mục đã gộp các giống bị lặp trong danh sách, gồm 148 động vật và lựa chọn chữ cái. Avatar lưu trong cấu hình riêng của người dùng.

Ôn tất cả thẻ đến hạn có cùng trạng thái Đã nhớ/Chưa nhớ, dấu sao, loa, phiên âm và chú thích như flashcard thường. Đánh giá được giữ khi quay lại thẻ; lịch ôn và kết quả phiên được cập nhật khi hoàn thành hoặc rời phiên. Phím 1/2 đánh giá, 3 nghe, Space lật, mũi tên chuyển thẻ.

### Từ vựng và blog

- Thêm/sửa thẻ: chọn từ loại và tải ảnh PNG/JPEG/WebP/GIF tối đa 500 KB. Từ loại, ảnh được giữ trong đồng bộ và bản sao lưu JSON.
- Nhập text: mỗi dòng gồm 5 trường phân cách bằng dấu phẩy: `book,quyển sách,Noun,/bʊk/,Đồ dùng học tập`. Chỉ thuật ngữ và định nghĩa bắt buộc; ví dụ để trống ba trường sau: `hello,xin chào,,,`. Trường chứa dấu phẩy hoặc xuống dòng phải đặt trong dấu nháy kép. Nút **Hướng dẫn nhập** mở mục **Hướng dẫn** tại **Tổng quan**, có ví dụ text, Excel, CSV và TSV.
- Nhập Excel `.xlsx` (trang tính đầu tiên), CSV hoặc TSV: các cột **từ vựng, nghĩa, từ loại, phiên âm, chú thích**. Hai cột đầu bắt buộc; ba cột sau có thể để trống. Có thể có hoặc không có hàng tiêu đề. Dữ liệu thiếu từ/nghĩa hoặc trùng từ sẽ báo lỗi và không nhập một phần. File Excel `.xls` cũ cần lưu lại thành `.xlsx`.
- Bài kiểm tra hiển thị toàn bộ câu hỏi để cuộn; bấm số câu để tới câu tương ứng. Mỗi câu cần trả lời và bấm **Xác nhận**; có thể **Bỏ xác nhận** để xem lại. Sửa đáp án tự bỏ xác nhận. Chỉ nộp được khi tất cả câu đã được xác nhận; nộp thiếu sẽ báo các câu cần hoàn thành.
- Blog ở thanh điều hướng: viết hoặc nhập file `.md`, xem trước, đăng, sửa và tải Markdown. Bài viết lưu chung trong `storage/blog/`, gồm file `.md` và danh mục `index.json`, độc lập với hồ sơ học tập. Mọi người dùng cùng máy chủ đều xem được; chỉ hồ sơ sở hữu bài viết được sửa/xóa. Tên người đăng lấy từ hồ sơ trên máy chủ. Quyền hiện dựa trên hồ sơ đang chọn (ứng dụng chưa có đăng nhập mật khẩu); bài cũ không có ID chủ sở hữu được giữ ở chế độ chỉ đọc. Sao lưu blog bằng cách sao chép cả thư mục này.

### Quản lý ôn tập cách quãng

Trong **Cần ôn hôm nay**, phần **Lịch ôn & quản lý thẻ** cho phép:

- Xem số thẻ theo ngày trong 14, 30 hoặc 90 ngày; chọn ngày để xem từ vựng, nghĩa, học phần, cấp và ngày giờ ôn. Ngày hôm nay bao gồm cả thẻ quá hạn và chưa học. **Cần ôn ngay** chỉ liệt kê thẻ chưa có lịch hoặc đã tới hạn, còn lịch ngày hôm nay bao gồm cả những thẻ sẽ tới hạn vào cuối ngày.
- Lọc học phần; xem toàn bộ thẻ hoặc thẻ tạm dừng; chỉnh cấp ghi nhớ và hạn ôn từng thẻ mà không thay đổi số lượt đúng/sai. Thẻ tạm dừng không xuất hiện trong hàng đợi ôn và dự báo; tiếp tục ôn giữ lại hạn ôn hiện có.
- Cấu hình 6 khoảng cách ôn theo ngày (số nguyên tăng dần), cùng thời gian học lại khi sai theo phút. Mặc định: 1, 3, 7, 14, 30, 60 ngày; sai học lại sau 5 phút.
- Cấu hình được đồng bộ và sao lưu riêng theo người dùng. Mặc định giữ nguyên hạn ôn đã có và dùng cấu hình mới ở lượt học sau. Chọn **Tính lại lịch** để tính ngày ôn từ lần học gần nhất cho các thẻ đã học, gồm cả lịch chỉnh thủ công; bỏ qua thẻ chưa học và thẻ tạm dừng.

Lịch sắp tới là dự kiến dựa trên hạn hiện tại. Kết quả các lượt học tiếp theo sẽ cập nhật lại lịch.

### Bài viết và ghi chú Markdown

- Trang **Bài viết** (Blog ở bản tiếng Anh) hiển thị danh sách thu gọn gồm tiêu đề, tác giả, ngày cập nhật và tóm tắt. Bấm tiêu đề hoặc **Đọc bài viết** để mở toàn bài. Có tìm kiếm và phân trang; từng bài có đường dẫn riêng `#/blog/<id>`.
- Bộ render hỗ trợ CommonMark/GitHub Flavored Markdown: bảng (kể cả căn lề), tiêu đề, in đậm/in nghiêng/gạch ngang, danh sách lồng nhau, checklist, trích dẫn, liên kết thường/tham chiếu, ảnh, mã nội dòng, khối mã và đường phân cách. Bảng rộng và khối mã có thể cuộn ngang. HTML được lọc trước khi hiển thị.
- Soạn hoặc sửa trực tiếp Markdown; nhập file `.md` tối đa 200 KB. Thanh công cụ có thể ẩn/hiện, hỗ trợ định dạng vùng chọn, chèn liên kết/ảnh theo URL hoặc tải ảnh PNG/JPEG/WebP/GIF từ máy (tối đa 2 MB mỗi ảnh), tạo bảng theo số dòng/cột và hoàn tác/làm lại. Ctrl/Cmd+B và Ctrl/Cmd+I áp dụng in đậm/in nghiêng cho vùng chọn.
- Ảnh tải lên được lưu trong `storage/blog/images/` và dùng URL chung cho mọi người trên cùng máy chủ. Markdown hỗ trợ `![Mô tả](URL)` và đường dẫn tương đối tới ảnh có sẵn trên máy chủ; nhập file `.md` không tự tải theo các file ảnh nằm cạnh nó.
- Chuyển giữa **Soạn thảo**, **Chia đôi** và **Xem trước**; bản xem trước cập nhật khi gõ. Đăng/lưu xong sẽ mở bài ở trang chi tiết. Nội dung vẫn được lưu bằng Markdown và có thể tải xuống dưới dạng `.md`.

### Sơ đồ và mã nguồn trong blog

- Khối mã có ngôn ngữ (ví dụ `javascript`, `python`, `json`) được tô màu cú pháp; khối không ghi ngôn ngữ sẽ thử nhận diện tự động. `text`/`plaintext` giữ dạng văn bản.
- Khối `mermaid` được vẽ bằng Mermaid; khối `plantuml`, `puml` hoặc `uml` được vẽ bằng bộ PlantUML chính thức đóng gói cùng ứng dụng. Có nút chèn mẫu trong thanh công cụ. Mã nguồn sơ đồ luôn còn trong mục **Mã sơ đồ** để xem/copy và sửa trong Markdown.
- Bộ vẽ tải khi cần và chạy trên trình duyệt; không gửi nội dung bài viết/sơ đồ tới máy chủ render bên ngoài. PlantUML dùng nội dung trực tiếp và theme đóng gói; `!include`/thư viện sơ đồ bên ngoài chưa được hỗ trợ. Lỗi cú pháp hiện tại vị trí sơ đồ, kèm nguồn để sửa.
- Bài viết có ID chủ sở hữu bất biến. API đăng/sửa/xóa yêu cầu hồ sơ hiện tại qua `X-FlashLab-Profile`; tác giả được lấy từ danh sách hồ sơ, không lấy tên do trình duyệt tự nhập. Sửa/xóa kiểm tra chủ sở hữu và phiên bản để tránh ghi đè thay đổi đồng thời.
- Có thể xóa từng bản ghi trong **Phiên học gần đây**, từ nút thùng rác hoặc cửa sổ chi tiết; giữ nguyên tiến độ thẻ, lịch ôn và thống kê hoạt động.

### Ghi chú cá nhân

Mục **Ghi chú** trên thanh điều hướng dùng cùng trình soạn thảo Markdown với bài viết: định dạng, bảng, mã nguồn, sơ đồ, xem trước, nhập và tải file `.md`. Ghi chú lưu trong trường `notes` của dữ liệu người dùng (`<ID>/state.json`), không đăng vào bài viết dùng chung, được đồng bộ và bao gồm trong bản sao lưu ZIP hồ sơ. Mỗi hồ sơ có danh sách riêng, tìm kiếm và phân trang 5 mục. Ảnh từ máy trong ghi chú được nhúng trực tiếp (tối đa 100 KB mỗi ảnh), không tải vào thư mục ảnh công khai của bài viết. Giới hạn 500 ghi chú, 200.000 ký tự mỗi ghi chú và 5.000.000 ký tự tổng nội dung.

Khối mã `c++`/`cpp`, `c#`/`csharp`, `md`/`markdown` giữ đúng nhãn ngôn ngữ. Khối `text`/`plaintext` giữ văn bản thuần. Chọn ngôn ngữ ngay khi chèn khối mã; chỉ các khối không có nhãn mới tự nhận diện. File từ vựng và file Markdown được nhập ở hai mục riêng.

Mục **Hướng dẫn** tại Tổng quan gom hướng dẫn nhập dữ liệu, sao lưu/lưu trữ, học/ôn tập và viết Markdown. Liên kết trợ giúp ở các biểu mẫu, Cài đặt và menu người dùng mở trực tiếp phần tương ứng; các nút tạo mới hiển thị dấu cộng tròn với tên chức năng trong tooltip.

Mỗi thẻ có định nghĩa chính (`back`) và tối đa 19 định nghĩa khác (`definitions`). Thêm từng nghĩa riêng trong form thẻ; trả lời đúng một nghĩa đã lưu là đủ. Trắc nghiệm chọn một nghĩa đúng và loại các nghĩa còn lại khỏi đáp án nhiễu; Ghép cặp dùng một nghĩa cho mỗi thuật ngữ. Xuất CSV có cột `definitions` dạng mảng JSON để giữ các nghĩa khi nhập lại. Thanh điều hướng chỉ hiện icon với tên trong tooltip; thông báo thành công tự đóng sau 4 giây, lỗi sau 6 giây.
