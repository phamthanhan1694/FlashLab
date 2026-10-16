# FlashLab production

Chạy tại thư mục gốc bằng Node.js 22.14 trở lên:

```sh
cp flashlab.config.example.json flashlab.config.json
npm ci
npm run build
npm start
```

`npm start` tải `.env`, đặt chế độ production và chạy backend phục vụ API lẫn frontend đã build trên cùng một cổng. Production dùng đúng cổng đã cấu hình; nếu cổng bận, ứng dụng báo lỗi để tránh âm thầm chạy trên cổng khác. Chạy `npm run dev` để phát triển với Vite.

## Mã nguồn và tài nguyên

- `apps/frontend/src/main.ts`: điểm ghép ứng dụng và điều hướng.
- `apps/frontend/src/core/`: đồng bộ, CSV, cấu hình, ngôn ngữ và tiện ích.
- `apps/frontend/src/features/study/`, `profiles/`, `activity/`: chức năng theo từng phần.
- `apps/frontend/src/ui/`: giao diện và stylesheet dùng chung.
- `apps/frontend/src/data/`, `types/`: dữ liệu mẫu và kiểu trạng thái.
- `apps/frontend/public/`: tài nguyên tĩnh gốc; sửa/thêm âm thanh tại `sounds/`, animation tại `assets/animations/`.
- `apps/frontend/dist/`: đầu ra build, phục vụ ở production. Không sửa trực tiếp vì build sẽ tạo lại.
- `apps/backend/src/http/`: cấu hình HTTP và các endpoint.
- `apps/backend/src/storage/`: lưu trữ, người dùng, sao lưu.
- `apps/backend/src/server.ts`: khởi tạo và dừng máy chủ.
- `packages/shared/src/`: schema, kiểu dữ liệu và danh mục avatar dùng chung.

Avatar là vector SVG được dựng từ mã nguồn trong `features/profiles/`; chúng không phải ảnh tải ngoài. Tên `assests` đã được đổi thành `assets`. Vite chép tài nguyên trong `public` vào `dist`, đồng thời đưa JavaScript/CSS đã đóng gói vào `dist/assets`.

## Cấu hình và dữ liệu

Chỉ sao chép `flashlab.config.example.json` khi chưa có cấu hình riêng. `flashlab.config.json` được Git bỏ qua để giữ đường dẫn và lựa chọn riêng của từng máy.

`.env` chỉ trỏ tới `flashlab.config.json` theo mặc định, giữ nguyên thư mục lưu trữ đã chọn. Có thể bật các biến `HOST`, `PORT`, `STORAGE_DIR`, `DATA_FILE` trong `.env`. Đường dẫn tương đối tính từ gốc dự án; đường dẫn ổ Windows vẫn dùng được trên WSL qua cơ chế chuyển `/mnt/<ổ>/`.

Dữ liệu người dùng nằm tại `storage.directory` hoặc `STORAGE_DIR`, tách khỏi các thư mục `dist`. Không đặt dữ liệu vào `public`. `.env` được bỏ qua khi quản lý phiên bản; `.env.example` chỉ chứa ví dụ không có bí mật. Sau khi đổi cấu hình hoặc mã backend, khởi động lại ứng dụng.

`npm run build` dọn riêng các thư mục đầu ra sinh tự động trước khi build; tài nguyên gốc và dữ liệu người dùng không bị xóa.

## Kiểm tra

```sh
npm run typecheck
npm test
npm run test:ui
npm run test:server
```

Kiểm tra server dùng thư mục dữ liệu tạm và xác minh bản build cùng âm thanh/animation. Kiểm tra UI chạy bundle production trong DOM mô phỏng.
