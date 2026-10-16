# FlashLab

Ứng dụng học từ vựng và flashcard, có giao diện tiếng Việt/tiếng Anh, học phần, lớp học, hồ sơ người dùng, ghi chú cá nhân và bài viết Markdown. Hỗ trợ Thẻ ghi nhớ, Trắc nghiệm, Viết, Kiểm tra, Ghép cặp và Ôn tập cách quãng.

FlashLab có bản web dùng backend Node.js và phần tích hợp desktop Tauri 2 dùng chung mã nguồn. Bản desktop được thiết kế tự khởi động backend và lưu dữ liệu trên máy, không cần mở máy chủ riêng.

## Cài trên máy khác

**Người dùng Windows nhận bộ cài sau khi dự án đã được build:**

- **`*-setup.exe`**: bộ cài NSIS, phù hợp để chia sẻ cho người dùng thông thường.
- **`*.msi`**: bộ cài Windows Installer, một lựa chọn khác để cài cùng ứng dụng. Chỉ cần một trong hai bộ cài.

Bộ cài desktop mang theo Node runtime, backend, giao diện, hình ảnh và âm thanh. Máy nhận không cần cài Node.js, npm, Rust, Visual Studio hoặc tải mã nguồn. Cài xong, mở **FlashLab** từ Start Menu hoặc shortcut do bộ cài tạo.

Windows cần WebView2 để hiển thị giao diện. Với cấu hình Tauri mặc định hiện tại, bộ cài tải và cài WebView2 nếu máy chưa có; bước này cần Internet. Khi các thành phần đã được cài đầy đủ, bản desktop dùng dữ liệu tại máy và có thể học offline. Xem [tùy chọn bộ cài Windows và WebView2 của Tauri](https://v2.tauri.app/distribute/windows-installer/).

**Không gửi riêng `src-tauri/target/release/flashlab.exe`**: file chạy chính còn cần Node sidecar và thư mục tài nguyên đi kèm. Hãy gửi bộ cài trong thư mục `bundle`, hoặc một gói portable đã được chuẩn bị đầy đủ; dự án hiện chưa có quy trình tạo gói portable riêng.

**Trạng thái hiện tại:** đã có mã Tauri và quy trình build; chưa có bộ cài EXE/MSI được tạo và kiểm thử native trong môi trường phát triển hiện tại vì thiếu Rust/Cargo và thư viện WebView Linux. Tải ZIP mã nguồn từ GitHub không tương đương tải bộ cài. Phần bên dưới hướng dẫn tạo bộ cài trên Windows hoặc GitHub Actions.

Android độc lập/offline chưa được triển khai. Chi tiết phạm vi mobile có trong [hướng dẫn Tauri](docs/tauri.md#android).

## Build bộ cài Windows

Chạy trên **Windows**, bằng Node.js và Rust của Windows. Build trong WSL tạo ứng dụng Linux; script đóng gói Node hiện không hỗ trợ cross-build giữa các hệ điều hành/kiến trúc.

Máy build cần:

- Node.js 24.21.0 và npm đi kèm được khuyến nghị; tối thiểu Node.js 22.14.
- Rust stable 1.90 trở lên, toolchain MSVC.
- Visual Studio Build Tools với **Desktop development with C++** và WebView2.

Cài công cụ theo [hướng dẫn yêu cầu hệ thống Tauri](https://v2.tauri.app/start/prerequisites/). Rust/Cargo được cài bằng [rustup](https://rust-lang.org/tools/install/), không được cài bởi `npm ci`. Sau khi cài, đóng terminal cũ và mở PowerShell mới để nhận PATH, kiểm tra `cargo --version` và `rustc --version`, rồi chạy tại gốc dự án:

```powershell
npm ci
npm run desktop:build -- --bundles nsis
```

Bộ cài EXE nằm trong:

```text
src-tauri/target/release/bundle/nsis/
```

Để tạo MSI:

```powershell
npm run desktop:build -- --bundles msi
```

Bộ cài MSI nằm trong `src-tauri/target/release/bundle/msi/`. Lệnh `npm run desktop:build` không chỉ định loại sẽ dùng `targets: "all"` của Tauri. Xem [hướng dẫn Windows Installer](https://v2.tauri.app/distribute/windows-installer/) nếu máy build thiếu công cụ cần cho MSI.

Để chạy thử desktop từ mã nguồn:

```sh
npm run desktop:dev
```

Lệnh tự chuẩn bị shared/frontend/backend và Node sidecar. Bản desktop dev dùng giao diện đã build; sửa giao diện/backend thì chạy lại lệnh để build lại. Không cần chạy `npm run dev` hoặc `npm start` trước.

### Build bằng GitHub Actions

Sau khi đưa các file Tauri và workflow lên kho GitHub:

1. Vào **Actions → Build desktop → Run workflow**.
2. Chờ job Windows build và kiểm tra backend đóng gói thành công.
3. Tải artifact **FlashLab-Windows**, giải nén để lấy bộ cài `-setup.exe`.
4. Chia sẻ bộ cài đó, hoặc tự đính kèm vào GitHub Release khi muốn phát hành.

Workflow hiện tạo EXE qua NSIS; không tạo MSI và không tự xuất bản GitHub Release. Xem [.github/workflows/desktop.yml](.github/workflows/desktop.yml).

## Dữ liệu, cấu hình và sao lưu

Mỗi hồ sơ người dùng có học phần, tiến độ, lịch sử, ghi chú, giao diện và âm thanh riêng. Việc chọn hồ sơ không phải đăng nhập bằng mật khẩu.

**Desktop:** cấu hình nằm ở `config.json` trong thư mục dữ liệu ứng dụng của Tauri cho `com.flashlab.app`; hồ sơ mặc định lưu tại `data/profiles` tương đối với thư mục đó. Desktop không đọc `.env` hoặc `flashlab.config.json` riêng của bản web. Vị trí phụ thuộc hệ điều hành, không cố định vào ổ đĩa của người phát triển.

**Web:** sao chép `flashlab.config.example.json` thành `flashlab.config.json` ở lần chạy đầu. Cấu hình mẫu lưu hồ sơ tại `data/profiles`, tương đối với gốc dự án. Có thể chọn kho khác bằng `storage.directory` hoặc biến `STORAGE_DIR` trong `.env`.

Trong ứng dụng, vào **Tổng quan → Hướng dẫn → Sao lưu và lưu trữ** để xem đường dẫn thực tế đang dùng.

Để chuyển dữ liệu sang máy khác hoặc từ web sang desktop:

1. Vào **Cài đặt → Xuất thư mục ZIP** trên bản đang dùng.
2. Chép ZIP sang máy đích và giải nén.
3. Mở menu người dùng → **Nhập thư mục người dùng**, chọn thư mục hồ sơ vừa giải nén.

ZIP hồ sơ giữ học phần, tiến độ, cấu hình và ghi chú cá nhân. Bài viết dùng chung cần sao lưu riêng thư mục `blog` trong kho dữ liệu. Bộ cài không mang theo dữ liệu cá nhân của máy build và không tự đồng bộ dữ liệu giữa các máy.

## Chạy bản web từ mã nguồn

Bản web cần Node.js và npm trên máy chạy backend. Người truy cập qua trình duyệt không cần Rust hoặc Tauri.

Chạy các lệnh sau ở gốc dự án. Nếu đã có `flashlab.config.json`, giữ nguyên cấu hình đó và bỏ qua bước sao chép.

Linux/macOS/WSL:

```sh
cp flashlab.config.example.json flashlab.config.json
npm ci
npm run dev
```

PowerShell:

```powershell
Copy-Item flashlab.config.example.json flashlab.config.json
npm ci
npm run dev
```

Mở URL **FlashLab frontend** in trong terminal. Cổng ưu tiên của cấu hình mẫu là frontend **43891**, API **43871**; chế độ dev tìm cổng trống khi cổng ưu tiên bị chiếm. Frontend dùng proxy `/api` tới đúng backend.

Chạy bản web production:

```sh
npm run build
npm start
```

Backend phục vụ cả API và frontend đã build trên cùng một cổng. Production dùng cổng đã cấu hình; nếu cổng bận thì báo lỗi. Không mở trực tiếp `index.html` bằng `file://`.

`.env.example` là mẫu cho biến môi trường; sao chép thành `.env` nếu cần ghi đè cấu hình. `.env`, `flashlab.config.json`, dữ liệu, `node_modules` và các thư mục build được Git bỏ qua. Xem [hướng dẫn production](docs/production.md).

### Script khởi động và WSL

`./start-flashcard.sh` và `start-flashcard.bat` dùng để khởi động bản web từ mã nguồn, không phải bộ cài desktop. BAT có địa chỉ WSL dự phòng theo máy phát triển; trên máy khác nên chạy ở thư mục dự án hoặc chỉ định đường dẫn bằng tham số, `FLASHLAB_PROJECT_DIR` hay `start-flashcard-path.txt`.

Trong WSL, dùng Node/npm Linux. Kiểm tra bằng `command -v node`, `command -v npm` và `node -p process.platform`; platform phải là `linux`. Nếu gặp lỗi `CMD.EXE`, UNC hoặc đường dẫn `/mnt/c/.../npm`, sửa PATH để dùng Node/npm Linux rồi chạy lại `npm ci`.

## Thẻ từ vựng và nhập/xuất

Thẻ có năm trường trao đổi: **thuật ngữ, định nghĩa, cách đọc, ghi chú, ảnh**. Thuật ngữ và định nghĩa bắt buộc. Mỗi nghĩa có từ loại riêng; một thuật ngữ có thể chứa nhiều cặp nghĩa–từ loại.

Text/CSV dùng năm cột:

```csv
front,definition,pronunciation,notes,image
book,n.::sách|v.::đặt chỗ,/bʊk/,Ví dụ về từ nhiều nghĩa,
hello,xin chào,,,
```

Excel `.xlsx` dùng cùng năm cột; nhập trang tính đầu tiên. Trường chứa dấu phẩy, dấu nháy hoặc xuống dòng phải được trích dẫn đúng chuẩn CSV. Xuất thẻ dùng để trao đổi nội dung; muốn giữ tiến độ thì dùng bản sao lưu ZIP.

Nhập text, CSV, Excel và thêm từng thẻ thủ công đều dùng chung bảng so sánh thẻ trùng. Có thể bỏ qua, ghi đè, bổ sung hoặc **Sửa trước khi nhập**. Phần sửa cho phép chỉnh đầy đủ nội dung, thêm/xóa nghĩa, chọn từ loại riêng và giữ bản nháp khi chuyển trang. Ghi đè đặt lại tiến độ; bổ sung giữ tiến độ, thêm cặp nghĩa–từ loại chưa có và điền trường còn trống.

Hướng dẫn đầy đủ và danh sách từ loại có tại **Tổng quan → Hướng dẫn**. Dùng [prompt tạo thẻ FlashLab](docs/prompt-tao-the-flashlab.md) để yêu cầu AI sinh text, CSV hoặc Excel đúng định dạng.

## Các chức năng chính

- Quản lý học phần, lớp học; tìm kiếm từ vựng, kéo thả sắp xếp và chọn kích thước ô hiển thị.
- Thẻ ghi nhớ có lật thẻ, nghe đọc, đánh dấu sao, đã nhớ/chưa nhớ và sửa ngay khi học.
- Trắc nghiệm, Viết, Kiểm tra hỗ trợ từ nhiều nghĩa; Kiểm tra có chọn nhiều đáp án, điền nhiều nghĩa và xác nhận từng câu trước khi nộp.
- Theo dõi thời gian học, lịch sử phiên, lưới hoạt động và tiến độ thành thạo từng thẻ. Lên cấp cần tích lũy lượt đúng và đủ dạng học; trả lời sai bị trừ tiến độ. Xem quy tắc cụ thể trong Hướng dẫn của ứng dụng.
- Ôn tập cách quãng, lịch đến hạn, tạm dừng thẻ và cấu hình khoảng cách ôn.
- Giọng đọc theo ngôn ngữ/giọng có trên thiết bị, có điều chỉnh tốc độ trong Cài đặt.
- Bài viết và ghi chú Markdown có tô màu mã nguồn, Mermaid và PlantUML. Ghi chú nằm trong hồ sơ; bài viết được chia sẻ giữa các hồ sơ của cùng kho dữ liệu.

## Cấu trúc dự án

- `apps/frontend/src/`: giao diện, logic học tập, hồ sơ, ghi chú và bài viết.
- `apps/frontend/public/`: tài nguyên gốc, hình ảnh, âm thanh và animation.
- `apps/frontend/vite.config.ts`: cấu hình Vite và proxy API cho bản web.
- `apps/backend/src/`: HTTP API và lưu trữ; `desktop/server.ts` là entry point dành cho desktop.
- `packages/shared/src/`: schema, kiểu dữ liệu, CSV và quy tắc thành thạo dùng chung.
- `src-tauri/`: mã Rust, cấu hình cửa sổ, icon và đóng gói desktop/mobile.
- `scripts/`: khởi động, build và kiểm tra tích hợp.
- `docs/`: hướng dẫn Tauri, production và prompt tạo thẻ.

Tauri dùng lại workspace hiện có, không tạo thêm một bản sao `src/` hoặc `public/` ở gốc. `apps/*/dist`, `src-tauri/resources`, `src-tauri/binaries`, `src-tauri/target` và `src-tauri/gen` là đầu ra sinh tự động; không sửa trực tiếp hoặc commit.

## Kiểm tra dành cho người phát triển

Các kiểm tra bản web cần cấu hình web như hướng dẫn ở trên:

```sh
npm run typecheck
npm test
npm run build
npm run test:ui
npm run test:server
npm run test:config
npm run format:check
```

Kiểm tra riêng backend desktop đã đóng gói, dùng dữ liệu tạm:

```sh
npm run desktop:prepare -- --resources-only
npm run test:desktop
```

Các kiểm tra frontend trong DOM mô phỏng và backend đóng gói không thay thế kiểm tra cửa sổ Tauri, bộ cài và giọng đọc trên thiết bị thực. Xem [docs/tauri.md](docs/tauri.md) cho quy trình desktop chi tiết.
