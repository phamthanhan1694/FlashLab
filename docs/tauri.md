# FlashLab Tauri 2

Bản desktop độc lập đóng gói giao diện, backend và Node runtime trong bộ cài. Người dùng cuối không cần Node hoặc mở terminal để chạy backend. Đóng cửa sổ ứng dụng sẽ dừng backend riêng của ứng dụng. Mở lại app khi đang chạy sẽ đưa cửa sổ hiện có lên trước, tránh tạo hai backend cùng ghi một kho dữ liệu. Nếu app bị dừng đột ngột, backend cũng nhận tín hiệu đóng qua stdin.

## Cấu trúc

- `apps/frontend/src/`, `apps/frontend/public/`, `apps/frontend/vite.config.ts`: giao diện và tài nguyên web dùng chung.
- `apps/backend/src/desktop/server.ts`: backend dành cho ứng dụng desktop.
- `src-tauri/src/`: vòng đời cửa sổ, khởi động và dừng backend.
- `src-tauri/bootstrap/`: màn hình chờ và thông báo lỗi khởi động.
- `src-tauri/tauri.conf.json`: cấu hình Tauri chung.
- `src-tauri/tauri.desktop.conf.json`: cấu hình đóng gói Node sidecar và tài nguyên desktop.
- `src-tauri/icons/`: icon ứng dụng, sinh từ favicon FlashLab.
- `src-tauri/resources/`, `src-tauri/binaries/`, `src-tauri/target/`, `src-tauri/gen/`: đầu ra sinh tự động, không commit.

Giữ cấu trúc workspace hiện tại để bản web và desktop dùng cùng mã nguồn, không tạo bản sao `src/` và `public/` ở gốc.

## Chia sẻ cho máy Windows khác

Sau khi build thành công, gửi bộ cài `*-setup.exe` trong `src-tauri/target/release/bundle/nsis/`. Người nhận chạy bộ cài, rồi mở FlashLab từ Start Menu; không cần Node, Rust hoặc mã nguồn. Không gửi riêng file chạy chính `target/release/flashlab.exe` vì còn thiếu backend/Node sidecar và tài nguyên.

Lần mở đầu tiên trên máy chưa có cấu hình, FlashLab hỏi **Chọn thư mục**, **Dùng mặc định** hoặc **Đóng**. Chọn thư mục mở cửa sổ chọn thư mục của hệ điều hành; database `flashlab.sqlite` và các bản dự phòng được lưu trực tiếp trong thư mục đó. Dùng mặc định lưu trong thư mục dữ liệu ứng dụng của tài khoản đang đăng nhập. Hủy cửa sổ chọn thư mục quay về câu hỏi; chọn Đóng thoát mà chưa tạo cấu hình hoặc database.

Ứng dụng kiểm tra quyền ghi và file database hiện có trước khi lưu lựa chọn. Nếu thư mục không dùng được, ứng dụng báo lỗi để chọn lại. Lựa chọn nằm trong `config.json` riêng của máy và được nhớ cho lần mở sau; bản cập nhật giữ cấu hình hiện có và tiếp tục dùng kho cũ. Chọn thư mục đã chứa database FlashLab cho phép dùng lại dữ liệu ở đó. Khôi phục bản sao lưu `.sqlite` vẫn thực hiện trong Cài đặt sau khi mở ứng dụng.

MSI là lựa chọn bộ cài khác, tạo bằng `npm run desktop:build -- --bundles msi` trên Windows. Kết quả nằm ở `src-tauri/target/release/bundle/msi/`. Chỉ cần cài EXE hoặc MSI, không cần cả hai. Workflow Windows hiện chỉ tạo EXE qua NSIS và cung cấp artifact, không tự đăng GitHub Release.

Theo cấu hình Tauri mặc định, nếu máy nhận chưa có WebView2 thì bộ cài tải và cài thành phần này; cần Internet cho bước đó. Sau khi cài đầy đủ, chức năng học desktop dùng được offline. Muốn bộ cài cài đặt hoàn toàn offline cần cấu hình thêm chế độ `offlineInstaller` cho WebView2; hiện chưa bật. Xem [tài liệu bộ cài Windows](https://v2.tauri.app/distribute/windows-installer/).

Tải ZIP mã nguồn không tạo sẵn EXE/MSI; cần build bộ cài hoặc tải artifact từ workflow Build desktop đã chạy thành công.

## Cài công cụ build

Cần Node.js 22.14+ và Rust stable (1.90 trở lên) trên **máy phát triển**. Rust/Cargo, thư viện WebView và công cụ C++ phải được cài theo [yêu cầu chính thức của Tauri](https://v2.tauri.app/start/prerequisites/).

- Windows: Visual Studio Build Tools với **Desktop development with C++**, Rust toolchain MSVC, WebView2. Build Windows bằng terminal Windows với Node và Rust Windows; build trong WSL tạo ứng dụng Linux.
- Ubuntu/Debian: Rust và các gói `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libxdo-dev`, `libssl-dev`, `librsvg2-dev`, `libayatana-appindicator3-dev` theo phiên bản hệ điều hành.
- macOS: Xcode Command Line Tools và Rust.

Kiểm tra môi trường:

```sh
npm ci
npm run tauri -- info
```

### Lỗi không tìm thấy Cargo

Nếu thấy `cargo metadata ... No such file or directory (os error 2)`, tiến trình build không tìm thấy Cargo trong PATH hoặc chưa có Rust toolchain. `npm ci` chỉ cài các gói npm, không cài Rust/Cargo.

- **Windows:** cài [Rust qua rustup](https://rust-lang.org/tools/install/) với toolchain MSVC và Visual Studio Build Tools có **Desktop development with C++**. Đóng terminal cũ, mở PowerShell mới, rồi kiểm tra `cargo --version` và `rustc --version`. Nếu đã cài mà vẫn không thấy lệnh, kiểm tra PATH có `%USERPROFILE%\.cargo\bin`.
- **Linux/WSL:** cài Rust theo hướng dẫn rustup rồi mở lại terminal, hoặc nạp môi trường bằng `source "$HOME/.cargo/env"`. Cần cài thêm thư viện hệ thống của Tauri cho Linux. Muốn tạo bộ cài Windows với quy trình FlashLab hiện tại thì chuyển sang terminal Windows và dùng Node/Rust Windows.

Khi cả Cargo và rustc chạy được, thử lại `npm run desktop:build -- --bundles nsis` trên Windows. Trình khởi động FlashLab kiểm tra hai lệnh này trước khi gọi Tauri và báo cách xử lý nếu thiếu. Thông báo `npm fund` hoặc cảnh báo audit mức thấp không phải nguyên nhân của lỗi không tìm thấy Cargo.

## Chạy desktop

```sh
npm run desktop:dev
```

Lệnh chuẩn bị build shared/frontend, bundle backend, sao chép Node đúng hệ điều hành và mở Tauri. Không cần chạy `npm run dev` hoặc `npm start` trước đó. Bản desktop dev dùng giao diện đã build; sau khi sửa frontend/backend, chạy lại lệnh để build lại.

```sh
npm run desktop:build
```

Bộ cài nằm trong `src-tauri/target/release/bundle/`. Build trên đúng hệ điều hành và kiến trúc đích để Node runtime đi kèm khớp với Tauri. Script từ chối cross-build không tương thích thay vì đóng gói nhầm executable. Trên Windows có thể chọn bộ cài NSIS:

```sh
npm run desktop:build -- --bundles nsis
```

Việc đóng gói Node sidecar dựa trên [hướng dẫn Tauri](https://v2.tauri.app/learn/sidecar-nodejs/). Node được mang theo nên bộ cài lớn hơn ứng dụng chỉ có giao diện.

## Dữ liệu và cấu hình

Desktop dùng `app_data_dir` của Tauri cho `com.flashlab.app`:

- Windows: thư mục dữ liệu ứng dụng trong `%APPDATA%`.
- Linux: dưới `$XDG_DATA_HOME`, mặc định `~/.local/share`.
- macOS: dưới `~/Library/Application Support`.

Sau khi chọn nơi lưu ở lần đầu chạy, ứng dụng tạo `config.json` từ cấu hình mẫu bên trong thư mục này. Lựa chọn mặc định lưu hồ sơ tại `data/profiles` **tương đối với thư mục cấu hình desktop**; thư mục tự chọn được ghi bằng đường dẫn tuyệt đối. Có thể sửa `storage.directory` để dùng kho khác; thoát app và sao lưu trước khi sửa, vì đổi đường dẫn không tự chuyển dữ liệu từ kho cũ. Đường dẫn thực tế cũng có trong Hướng dẫn → Sao lưu và lưu trữ trong ứng dụng.

Desktop không đọc `.env` hoặc `flashlab.config.json` riêng của bản web và không tự nhập/chỉnh sửa kho web hiện tại. Để chuyển dữ liệu, chọn Sao lưu hồ sơ hoặc Sao lưu toàn bộ trong Cài đặt của bản web, rồi chọn Khôi phục từ database ở bản desktop và mở file `.sqlite`. Không cần giải nén hoặc ghép file ảnh.

Dữ liệu chính nằm trong `flashlab.sqlite` ở thư mục lưu trữ đã cấu hình. Node sidecar cung cấp SQLite có sẵn trong Node.js; không cần cài thêm database trên máy nhận. JSON cũ được tự nhập và giữ nguyên bản gốc. Trình duyệt/WebView dùng IndexedDB cho dữ liệu chờ đồng bộ. Xem [lưu trữ và sao lưu](storage.md).

Backend chỉ bind `127.0.0.1`, ưu tiên cổng API trong cấu hình desktop và dò cổng kế tiếp khi cổng bị chiếm. Ứng dụng chỉ mở cửa sổ học sau khi backend báo sẵn sàng; backend lỗi sẽ hiện thông báo trên màn hình khởi động. Trang học chạy cùng origin với API nên giữ nguyên đồng bộ, CSV/Excel, ảnh và âm thanh. Các trang HTTP không được cấp quyền gọi lệnh native; không mở quyền shell/file cho JavaScript.

Nếu desktop không khởi động, màn hình chờ hiển thị lỗi backend và đường dẫn `startup.log` trong thư mục dữ liệu ứng dụng. Log ghi đường dẫn runtime/tài nguyên và lỗi từ Node; không xóa database để thử sửa lỗi khởi động. Trên Windows, launcher chuẩn hóa đường dẫn `\\?\` do Tauri trả về trước khi truyền cho Node, tránh lỗi `EISDIR ... lstat 'E:'` trước khi backend đọc cấu hình.

## Kiểm tra backend đóng gói

Không cần Rust để kiểm tra riêng phần tài nguyên/backend:

```sh
npm run desktop:prepare -- --resources-only
npm run test:desktop
```

Trên Windows, sau khi chuẩn bị tài nguyên và Node sidecar bằng `npm run desktop:prepare`, chạy `cargo test --release --manifest-path src-tauri/Cargo.toml packaged_backend_starts_from_verbatim_windows_paths` để kiểm tra launcher Rust khởi động backend từ đường dẫn Windows có tiền tố `\\?\`, khoảng trắng và Unicode.

Test dùng dữ liệu tạm, kiểm tra phục vụ giao diện/âm thanh, cổng bị chiếm, lưu hồ sơ qua khởi động lại, tạo cấu hình lần đầu và tự dừng khi stdin của tiến trình cha đóng. Đây chưa phải kiểm tra cửa sổ WebView hoặc bộ cài native.

Workflow `Build desktop` có thể chạy thủ công trên GitHub Actions để build bộ cài Windows; không tự phát hành ứng dụng.

## Android

Đã có entry point mobile của Tauri và lệnh `android:init`, `android:dev`, `android:build`. **Bản Android độc lập/offline chưa được triển khai**: Node sidecar ở trên chỉ hỗ trợ desktop. Muốn Android độc lập cần chuyển phần lưu trữ/API sang Rust hoặc một backend native trên điện thoại.

Hiện entry point Android chỉ hỗ trợ kết nối tới máy chủ FlashLab HTTPS đã được triển khai; đây là chế độ online riêng, không phải bản desktop độc lập. Cần Android Studio/SDK/NDK/JDK theo tài liệu Tauri và biến `FLASHLAB_MOBILE_URL` khi build:

```sh
export FLASHLAB_MOBILE_URL=https://flashlab.example.com
npm run android:init
npm run android:dev
```

PowerShell dùng `$env:FLASHLAB_MOBILE_URL = 'https://flashlab.example.com'`. Không cấp quyền native cho website trên máy chủ này. Chưa đặt URL thì ứng dụng mobile báo rõ cấu hình thiếu.
