# 📖 TÀI LIỆU ĐẶC TẢ CHI TIẾT TOÀN BỘ CHỨC NĂNG HỆ THỐNG ZONE SIX
### Kiến Trúc: Chuỗi Lounge & Cafe Đa Cơ Sở (Multi-Store Architecture)
### Tech Stack: Node.js (Express + TypeScript + Prisma/Mongoose) & Next.js 14+ (App Router + React Query v5 + TailwindCSS)
### Cập nhật: 31/10/2026 | Phiên bản: 1.0.0 Production-Ready

---

## 📑 MỤC LỤC DANH MỤC CHỨC NĂNG

1. [CN01: Xác Thực, Hồ Sơ Nhân Sự & Thẻ Kỹ Thuật Số (Digital Staff ID Card)](#cn01-xác-thực-hồ-sơ-nhân-sự--thẻ-kỹ-thuật-số)
2. [CN02: Quản Lý Nhân Sự & Phân Cấp Đa Cơ Sở](#cn02-quản-lý-nhân-sự--phân-cấp-đa-cơ-sở)
3. [CN03: Đăng Ký Nguyện Vọng Ca Tuần & Cổng Đăng Ký Độc Lập Cơ Sở](#cn03-đăng-ký-nguyện-vọng-ca-tuần--cổng-đăng-ký-độc-lập-cơ-sở)
4. [CN04: Xếp Lịch Tuần & Thuật Toán AutoScheduler Tự Động Hóa](#cn04-xếp-lịch-tuần--thuật-toán-autoscheduler-tự-động-hóa)
5. [CN04b: Cấu Hình Ca Làm Việc & Định Biên Nhân Sự Tối Thiểu](#cn04b-cấu-hình-ca-làm-việc--định-biên-nhân-sự-tối-thiểu)
6. [CN05: Điểm Danh Check-in Camera Trực Tiếp & Định Vị GPS Khớp Cơ Sở](#cn05-điểm-danh-check-in-camera-trực-tiếp--định-vị-gps-khớp-cơ-sở)
7. [CN06: Quản Lý Danh Mục Chi Nhánh & Cấu Hình Bán Kính / Khung Giờ GPS](#cn06-quản-lý-danh-mục-chi-nhánh--cấu-hình-bán-kính--khung-giờ-gps)
8. [CN07: Tích Điểm Danh Trực Tiếp Trên Ô Lịch Tuần (Grid Slot Check-in)](#cn07-tích-điểm-danh-trực-tiếp-trên-ô-lịch-tuần)
9. [CN08: Trung Tâm Thông Báo Độc Lập 6 Vai Trò (Multi-Role Notification Center)](#cn08-trung-tâm-thông-báo-độc-lập-6-vai-trò)
10. [CN09: Quản Lý Bảng Lương Tháng & Phân Tầng Bảo Mật Thu Nhập](#cn09-quản-lý-bảng-lương-tháng--phân-tầng-bảo-mật-thu-nhập)
11. [CN10: Trợ Lý Tự Động Hóa Zalo Bot Đa Kênh Nghiệp Vụ Từng Chi Nhánh](#cn10-trợ-lý-tự-động-hóa-zalo-bot-đa-kênh-nghiệp-vụ-từng-chi-nhánh)
12. [CN11: Quản Lý Kho 3 Bảng Vật Liệu & Định Mức Tồn Kho Tối Thiểu](#cn11-quản-lý-kho-3-bảng-vật-liệu--định-mức-tồn-kho-tối-thiểu)
13. [CN11a: Sổ Tay Công Thức Pha Chế Bí Mật (BOM & SOP Recipes) & Chọn Ly Theo Nhiệt Độ](#cn11a-sổ-tay-công-thức-pha-chế-bí-mật--chọn-ly-theo-nhiệt-độ)
14. [CN11b: Phân Hệ Kiểm Kê Kho Thực Tế & Cấu Hình Ca/Chu Kỳ/Phân Quyền](#cn11b-phân-hệ-kiểm-kê-kho-thực-tế--cấu-hình-cachu-kỳphân-quyền)
15. [CN11c: Quản Lý Nhà Cung Cấp & Liên Kết Vật Liệu Cung Ứng](#cn11c-quản-lý-nhà-cung-cấp--liên-kết-vật-liệu-cung-ứng)
16. [CN11d: Yêu Cầu Nhập Kho (PR) & Trung Tâm Thu Mua Gộp Đơn PO Đa Cơ Sở](#cn11d-yêu-cầu-nhập-kho-pr--trung-tâm-thu-mua-gộp-đơn-po-đa-cơ-sở)
17. [CN12: Hệ Thống Bán Hàng POS Live Order Đồng Bộ Thời Gian Thực & Thanh Toán VietQR](#cn12-hệ-thống-bán-hàng-pos-live-order-đồng-bộ-thời-gian-thực--thanh-toán-vietqr)

---

## 🏛️ BẢNG MA TRẬN 6 VAI TRÒ & PHẠM VI TRUY CẬP (ROLE MATRIX)

| Mã Role | Tên Vai Trò | Cấp Bậc | Phạm Vi Cơ Sở (Store Scope) | Đặc Quyền / Giới Hạn Cốt Lõi |
| :--- | :--- | :---: | :--- | :--- |
| `admin_he_thong` | **Admin Hệ Thống** | Cao nhất (Level 1) | Toàn chuỗi hoặc chọn qua **Store Switcher** | Độc quyền Zalo Bot, Quản lý chuỗi chi nhánh, Quản lý nhà cung cấp, Toàn quyền cấu hình |
| `quan_ly` | **Quản Lý** | Cấp cao (Level 2) | Danh sách cơ sở được phân công (`assigned_stores`) | Duyệt & gộp PO thu mua, xem lương toàn bộ, phân ca nhân sự, quản lý kho đa cơ sở |
| `truong_ca` | **Trưởng Ca** | Giám sát (Level 3) | **CỐ ĐỊNH DUY NHẤT 1 CƠ SỞ** (`assigned_store_id`) | Tuyệt đối không có Switcher, chỉ tích điểm danh & xem lương đúng cơ sở mình phụ trách |
| `pho_ca_lam_lich`| **Phó Ca Làm Lịch** | Nghiệp vụ (Level 4) | Cố định 1 cơ sở biên chế | Auto xếp lịch tuần, cấu hình ca; **ẨN dấu tích điểm danh và ẨN bảng lương** |
| `pho_ca_vat_lieu`| **Phó Ca Vật Liệu** | Nghiệp vụ (Level 4) | Cố định 1 cơ sở biên chế | Quản lý kho, lập PR nhập hàng, kiểm kê kho, xem công thức; **ẨN bảng lương** |
| `nhan_vien` | **Nhân Viên** | Thực thi (Level 5) | Cố định 1 cơ sở biên chế | Đăng ký ca, điểm danh camera GPS, xem lịch, bán hàng POS; **ẨN bảng lương** |

---

## 🔍 CHI TIẾT TỪNG CHỨC NĂNG HỆ THỐNG

---

### CN01: Xác Thực, Hồ Sơ Nhân Sự & Thẻ Kỹ Thuật Số
* **Phân hệ:** Quản Trị Danh Tánh & Tài Khoản Cá Nhân
* **Route Frontend:** `/login`, `/profile`
* **Vai trò áp dụng:** Tất cả 6 vai trò.
* **Mô tả chức năng:**
  - **Cơ chế Đăng nhập:** Đăng nhập an toàn bằng Email nhân sự và Mật khẩu. Hỗ trợ duy trì phiên bằng **HTTP-only Cookie** và Bearer Token trong `localStorage` với cơ chế Silent Refresh qua Refresh Token.
  - **Trang Hồ sơ cá nhân (`/profile`):** Trang riêng biệt (Dedicated Page) chia làm 2 phân vùng:
    1. **Thẻ Nhân Viên Số (Zone 6 Digital Staff ID Card):** Thiết kế mô phỏng thẻ nhân sự cao cấp với hiệu ứng 3D Shimmer, chip kim loại vàng Luxury Gold, mã QR cá nhân, thông tin chức vụ, chi nhánh trực thuộc và mức lương giờ hiện tại.
    2. **Biểu Mẫu Cập Nhật Thông Tin:** Cho phép nhân sự tự cập nhật Số điện thoại, Vị trí chuyên môn và Đổi mật khẩu cá nhân.
* **Quy tắc bảo mật:** Mật khẩu khi lưu vào CSDL tuân thủ chính sách cấu hình hệ thống, hỗ trợ đồng bộ tức thời với MongoDB Atlas qua `PUT /api/v1/auth/me`.
* **Mã nguồn:** `be/src/modules/shared/auth/`, `fe/src/app/login/`, `fe/src/app/profile/`, `fe/src/features/shared/auth/`.
* **Collection Database:** `users`.

---

### CN02: Quản Lý Nhân Sự & Phân Cấp Đa Cơ Sở
* **Phân hệ:** Quản Lý Nhân Sự (HRM)
* **Route Frontend:** `/staff`
* **Vai trò áp dụng:** `admin_he_thong`, `quan_ly`, `truong_ca`.
* **Mô tả chức năng:**
  - **Phân cấp xem dữ liệu:** 
    - Quản lý/Admin xem được toàn bộ nhân sự các chi nhánh mình quản lý.
    - Trưởng Ca chỉ xem được nhân sự cấp dưới trực thuộc **đúng chi nhánh mình phụ trách** (Phó ca làm lịch, Phó ca vật liệu, Nhân viên).
  - **Thêm nhân sự mới (`CreateStaffModal`):** Cho phép nhập Họ tên, Email, SĐT, Vị trí (Barista, Thu ngân, Phục vụ, Tạp vụ), Mức lương/giờ, gắn Chi nhánh trực thuộc và gán Vai trò.
  - **Cơ chế bảo mật mật khẩu cấp mới:** Hệ thống tự động sinh ngẫu nhiên mật khẩu bảo mật (8 ký tự gồm chữ hoa, chữ thường, số và ký tự đặc biệt) và gửi thông báo, người tạo tài khoản không thấy mật khẩu này.
  - **Chỉnh sửa nhân sự (`EditStaffModal`):** Điều chỉnh mức lương giờ, vai trò, chi nhánh trực thuộc.
  - **Nguyên tắc phân quyền bất khả xâm phạm:** CẤM tuyệt đối gán vai trò đồng cấp hoặc lớn hơn cấp của mình (Ví dụ: Trưởng ca không được tạo hoặc phong người khác làm Trưởng ca hay Quản lý).
  - **Tiện ích:** Phân trang linh hoạt (5/10/20/50 dòng), lọc theo chi nhánh và tìm kiếm nhanh theo tên.
* **Mã nguồn:** `be/src/modules/quan_ly/staff/`, `fe/src/features/quan_ly/staff/`.
* **Collection Database:** `users`, `store_configs`.

---

### CN03: Đăng Ký Nguyện Vọng Ca Tuần & Cổng Đăng Ký Độc Lập Cơ Sở
* **Phân hệ:** Lập Lịch Vận Hành
* **Route Frontend:** `/schedule/register`
* **Vai trò áp dụng:** Mọi vai trò đều được đăng ký ca; Quản Lý / Trưởng Ca / Admin quản trị cổng.
* **Mô tả chức năng:**
  - **Ma trận chọn ca:** Hiển thị lưới tuần (Thứ 2 $\rightarrow$ Chủ Nhật) với các ca: Ca Sáng, Ca Chiều, Ca Tối. Nhân viên chỉ cần click để chọn/bỏ chọn nguyện vọng đi làm hoặc báo bận.
  - **Cổng đăng ký theo chi nhánh (Registration Window):** Mỗi chi nhánh mở/khóa cổng độc lập nhau.
  - **Hẹn giờ đóng cổng tự động:** Hỗ trợ thiết lập thời gian tự động khóa cổng (ví dụ: 23:59 Thứ 6 hàng tuần). Khi quá hạn, nhân viên không thể chỉnh sửa, chỉ xem ở chế độ Read-only.
  - **Chỉ số tổng hợp:** Tự động tính tổng số ca nhân viên đã chọn trong tuần để tránh đăng ký thiếu hoặc vượt định mức.
* **Mã nguồn:** `be/src/modules/nhan_vien/shift-registration/`, `fe/src/features/nhan_vien/shift-registration/`.
* **Collection Database:** `shift_registrations`, `registration_windows`.

---

### CN04: Xếp Lịch Tuần & Thuật Toán AutoScheduler Tự Động Hóa
* **Phân hệ:** Lập Lịch Vận Hành
* **Route Frontend:** `/schedule`
* **Vai trò áp dụng:** `admin_he_thong`, `quan_ly`, `truong_ca`, `pho_ca_lam_lich` (Nhân viên & Phó ca vật liệu chỉ xem).
* **Mô tả chức năng:**
  - **Giao diện ma trận lịch tuần:** Lưới 7 ngày x 3 ca hiển thị trực quan toàn bộ nhân sự được xếp trong ca, phân loại thẻ màu theo vị trí (Barista: Nâu hổ phách, Phục vụ: Xanh ngọc, v.v.).
  - **Thuật toán AutoScheduler Engine:** Phân tích nguyện vọng đăng ký ca của toàn bộ nhân viên, tự động xếp vào ca thỏa mãn:
    1. Đảm bảo đủ định biên nhân sự tối thiểu (`min_staff`, `min_barista`, `min_service`).
    2. Ưu tiên người đăng ký ca trước, cân bằng số giờ làm việc công bằng giữa các nhân viên.
    3. Tuyệt đối không xếp trùng ca, không vi phạm ca cấm hoặc ca bận.
  - **Chỉnh sửa thủ công kéo thả/click:** Cho phép người xếp lịch thêm, xóa, đổi nhân viên trong từng ô ca trực tiếp.
  - **Xuất bản lịch (Publish):** Khi duyệt xong, bấm "Xuất bản lịch", hệ thống gửi thông báo tự động đến nhân sự toàn cơ sở và kích hoạt đồng bộ Zalo Bot.
  - **Xuất file Excel:** Xuất file bảng lịch tuần chuẩn định dạng ExcelJS văn phòng để in ấn dán tại quầy bar.
* **Mã nguồn:** `be/src/modules/pho_ca_lam_lich/scheduling/`, `fe/src/features/pho_ca_lam_lich/scheduling/`.
* **Collection Database:** `weekly_schedules`, `shift_configs`.

---

### CN04b: Cấu Hình Ca Làm Việc & Định Biên Nhân Sự Tối Thiểu
* **Phân hệ:** Cấu Hình Lập Lịch
* **Route Frontend:** `/shifts` (và Modal từ `/schedule`)
* **Vai trò áp dụng:** `admin_he_thong`, `quan_ly`, `truong_ca`, `pho_ca_lam_lich`.
* **Mô tả chức năng:**
  - **Tùy biến khung giờ:** Thiết lập thời gian Bắt đầu và Kết thúc của từng ca (ví dụ: Ca 1: 06:30 - 14:30, Ca 2: 14:30 - 22:30, Ca 3: 18:00 - 23:00).
  - **Cấu hình định biên tối thiểu (Staff Quotas):**
    - `min_staff`: Tổng số lượng nhân viên tối thiểu bắt buộc trong ca.
    - `min_barista`: Số lượng pha chế tối thiểu phải có trong quầy bar.
    - `min_service`: Số lượng nhân viên phục vụ tối thiểu ngoài sảnh.
  - **Hệ số công:** Thiết lập số giờ công quy đổi của từng ca phục vụ tính lương.
  - **Màu sắc nhận diện:** Chọn mã màu riêng biệt cho từng ca giúp ma trận lịch trực quan.
  - **Khôi phục mặc định:** Cung cấp nút Reset về cấu hình chuẩn ban đầu của Zone Six Signature chỉ với 1 click.
* **Mã nguồn:** `be/src/databases/prisma/schema/shift_config.prisma`, `be/src/modules/pho_ca_lam_lich/shift-config/`, `fe/src/features/pho_ca_lam_lich/scheduling/component/ShiftConfigModal.tsx`.
* **Collection Database:** `shift_configs`.

---

### CN05: Điểm Danh Check-in Camera Trực Tiếp & Định Vị GPS Khớp Cơ Sở
* **Phân hệ:** Chấm Công & Điểm Danh
* **Route Frontend:** `/checkin`
* **Vai trò áp dụng:** Tất cả 6 vai trò khi đi làm ca trực.
* **Mô tả chức năng:**
  - **Chụp ảnh trực tiếp từ Camera:** CẤM TUYỆT ĐỐI việc chọn ảnh từ thư viện thiết bị nhằm chống gian lận chấm công hộ. Bắt buộc kích hoạt camera chụp khuôn mặt trực tiếp tại quầy.
  - **Định vị GPS Geofence:** Lấy tọa độ kinh/vĩ độ thiết bị, tính khoảng cách theo thuật toán Haversine tới chi nhánh làm việc. Nếu vượt bán kính cho phép (ví dụ: >50m), hệ thống từ chối chấm công.
  - **Đóng dấu chìm vĩnh viễn (Burn-in Canvas Watermark):** Trước khi ảnh được gửi lên máy chủ, trình duyệt dùng HTML5 Canvas ép dính vĩnh viễn các thông tin vào pixel ảnh:
    1. Địa chỉ thực tế từ OpenStreetMap / Nominatim.
    2. Tọa độ GPS chính xác và khoảng cách đến quán (mét).
    3. Thời gian thực tế chính xác đến từng giây.
    4. Con dấu xác thực đỏ *"ZONE 6 SIGNATURE - VERIFIED CAMERA & GPS"*.
  - **Kiểm tra khung giờ:** Ràng buộc chỉ cho phép check-in trước giờ vào ca N phút và trễ không quá M phút theo cấu hình.
* **Mã nguồn:** `be/src/modules/attendance/`, `fe/src/app/checkin/`, `fe/src/features/attendance/`.
* **Collection Database:** `attendances`.

---

### CN06: Quản Lý Danh Mục Chi Nhánh & Cấu Hình Bán Kính / Khung Giờ GPS
* **Phân hệ:** Quản Trị Chuỗi Đa Chi Nhánh
* **Route Frontend:** `/stores`, `/checkin-config`
* **Vai trò áp dụng:** `admin_he_thong` (Toàn quyền Tạo/Sửa/Đóng Cửa/Xóa); `quan_ly` (Xem cơ sở phụ trách).
* **Mô tả chức năng:**
  - **Quản lý danh sách chi nhánh (`/stores`):** Thống kê tổng số cơ sở, đang hoạt động, tạm đóng cửa. Thẻ thông tin chi nhánh gồm Mã cơ sở, Tên cơ sở, Hotline, Địa chỉ.
  - **Tạo & Sửa cơ sở với Geocoding tự động:** Nhập vĩ độ/kinh độ có nút *"Lấy GPS hiện tại"* và *"Cập nhật địa chỉ từ tọa độ"* (Reverse-geocoding tự động điền địa chỉ đường phố chính xác).
  - **Cấu hình GPS & Điểm danh (`/checkin-config`):**
    - Thiết lập bán kính cho phép check-in (30m, 50m, 100m, 200m...).
    - Công cụ kiểm tra khoảng cách thực tế ngay trên thiết bị bằng bản đồ tương tác Leaflet.
    - Cấu hình khung thời gian cho phép điểm danh trước ca (15p, 30p, 45p...) và sau ca (30p, 60p, 120p...).
* **Mã nguồn:** `be/src/modules/admin_he_thong/store/`, `be/src/modules/admin_he_thong/checkin-config/`, `fe/src/app/stores/`, `fe/src/app/checkin-config/`.
* **Collection Database:** `store_configs`.

---

### CN07: Tích Điểm Danh Trực Tiếp Trên Ô Lịch Tuần
* **Phân hệ:** Chấm Công & Điểm Danh
* **Route Frontend:** `/schedule`
* **Vai trò áp dụng:** `admin_he_thong`, `quan_ly`, `truong_ca` (**Ẩn hoàn toàn với Phó Ca Làm Lịch**).
* **Mô tả chức năng:**
  - **Tích điểm danh nhanh 1 chạm:** Quản lý hoặc Trưởng ca có thể bấm trực tiếp vào biểu tượng checkbox trên thẻ tên nhân viên trong ô ca tuần để xác nhận có mặt thực tế.
  - **Đồng bộ thời gian thực:** Cập nhật ngay lập tức trường `is_checked_in: true/false` vào mảng `slots` của `weekly_schedules` trên MongoDB Atlas.
  - **Nguyên tắc bảo vệ Trưởng ca:** Trưởng Ca chỉ có quyền tích điểm danh trên đúng chi nhánh được phân công biên chế của mình, không được tích cơ sở khác.
  - **Quy tắc Phó ca làm lịch:** Dù Phó ca làm lịch có quyền xếp ca và kéo thả nhân sự, giao diện **ẨN HOÀN TOÀN** nút tích điểm danh nhằm chống tiêu cực tự duyệt công cho bản thân.
* **Mã nguồn:** `be/src/modules/pho_ca_lam_lich/scheduling/controllers/toggle-slot-checkin.controller.ts`, `fe/src/features/pho_ca_lam_lich/scheduling/component/ShiftSlotCell.tsx`.
* **Collection Database:** `weekly_schedules`.

---

### CN08: Trung Tâm Thông Báo Độc Lập 6 Vai Trò
* **Phân hệ:** Tương Tác & Cảnh Báo Vận Hành
* **Route Frontend:** Toàn hệ thống (Nút Chuông Thông Báo trên Header AppShell)
* **Vai trò áp dụng:** Tất cả 6 vai trò (Mỗi vai trò có luồng tin nhắn và phân loại riêng).
* **Mô tả chức năng:**
  - **Kiến trúc phân lập 6 Table Database:** Dữ liệu thông báo được lưu trữ tại 6 collections độc lập trong MongoDB Atlas:
    `notifications_admin`, `notifications_quan_ly`, `notifications_truong_ca`, `notifications_pho_ca_lam_lich`, `notifications_pho_ca_vat_lieu`, `notifications_nhan_vien`.
  - **4 cấp độ ưu tiên:** Khẩn cấp (Urgent - Đỏ), Cao (High - Cam), Trung bình (Medium - Vàng), Thấp (Low - Xanh dương).
  - **2 chế độ xem:** Dạng Thẻ (Card View) hoặc Dạng Bảng (Table View).
  - **Modal căn giữa tuyệt đối (Dead-Center Portal):** Hiển thị qua React Portal trực tiếp tại `document.body` với `z-index: 99999`, khóa cuộn nền (body scroll-lock), hỗ trợ đóng bằng phím ESC.
  - **Đánh dấu đã đọc & Xóa:** Hỗ trợ đọc từng tin hoặc đánh dấu đọc tất cả.
* **Mã nguồn:** `be/src/databases/prisma/schema/notification_*.prisma`, `be/src/modules/shared/notifications/`, `fe/src/features/shared/notifications/`.
* **Collection Database:** 6 collections thông báo độc lập.

---

### CN09: Quản Lý Bảng Lương Tháng & Phân Tầng Bảo Mật Thu Nhập
* **Phân hệ:** Kế Toán & Quản Trị Chi Phí Lương
* **Route Frontend:** `/salary`
* **Vai trò áp dụng:** `admin_he_thong`, `quan_ly`, `truong_ca` (**ẨN TUYỆT ĐỐI với Nhân Viên, Phó Ca Làm Lịch, Phó Ca Vật Liệu**).
* **Mô tả chức năng:**
  - **Tính lương tự động theo công thực tế:** Tổng hợp số ca làm việc thực tế đã điểm danh hợp lệ của từng nhân sự trong tháng nhân với mức lương cơ sở theo giờ (`hourly_rate`).
  - **Bảo mật thông tin tối thượng:**
    - Tuyệt đối ẩn menu `/salary` và chặn truy cập API lương với cấp Nhân Viên và 2 Phó Ca.
    - Bảng lương hiển thị đầy đủ: Họ tên, Vị trí chuyên môn, Mức lương giờ, Tổng số ca/giờ công, Tổng thực nhận.
    - **ẨN HOÀN TOÀN** Mật khẩu, Số điện thoại cá nhân và Mã QR tài khoản cá nhân trên bảng lương công cộng.
  - **Bộ lọc tháng & cơ sở:** Hỗ trợ lọc xem bảng lương theo từng tháng trong năm và lọc theo từng chi nhánh. Trưởng Ca chỉ được xem bảng lương của nhân sự tại đúng cơ sở mình.
* **Mã nguồn:** `be/src/modules/quan_ly/salary/`, `fe/src/app/salary/`, `fe/src/features/quan_ly/salary/`.
* **Collection Database:** `users`, `weekly_schedules`, `attendances`.

---

### CN10: Trợ Lý Tự Động Hóa Zalo Bot Đa Kênh Nghiệp Vụ Từng Chi Nhánh
* **Phân hệ:** Tự Động Hóa & Tích Hợp OTT Bot
* **Route Frontend:** `/zalo`
* **Vai trò áp dụng:** **ĐỘC QUYỀN DUY NHẤT ADMIN HỆ THỐNG (`admin_he_thong`)**. Các vai trò khác bị ẩn menu và chặn chuyển hướng tức thì.
* **Mô tả chức năng:**
  - **Kết nối Zalo cá nhân qua thư viện `zca-js`:** Quét mã QR trực tiếp trên màn hình để đăng nhập phiên Zalo Bot của quán.
  - **Lưu phiên mã hóa AES-256-GCM:** Giữ lại phiên đăng nhập trong Docker Volume (`zalo_sessions`) ngay cả khi khởi động lại server hoặc container.
  - **Cấu hình Đa Kênh Nghiệp Vụ Từng Cơ Sở:** Mỗi chi nhánh hỗ trợ cấu hình 4 nhóm Zalo độc lập qua compound index `{ store_id, channel_type }`:
    1. **CHECKIN:** Báo cáo nhân viên điểm danh thành công, đi trễ, kèm ảnh watermark.
    2. **MATERIAL:** Cảnh báo kho cạn hàng, nguyên vật liệu chạm ngưỡng tối thiểu, phiếu nhập kho.
    3. **SCHEDULE:** Thông báo mở cổng đăng ký ca tuần, lịch tuần mới được duyệt.
    4. **GENERAL:** Thông báo chung toàn chi nhánh.
  - **Tiện ích:** Tự động nạp danh sách Group từ tài khoản Zalo, nút sao chép tên nhóm quy chuẩn `[Z6 - {Mã CS}] {Icon} {TÊN NHÓM}`, nút gửi tin nhắn thử nghiệm từng kênh.
* **Mã nguồn:** `be/src/modules/admin_he_thong/zalo/`, `fe/src/app/zalo/`, `fe/src/features/admin_he_thong/zalo/`.
* **Collection Database:** `zalo_configs`.

---

### CN11: Quản Lý Kho 3 Bảng Vật Liệu & Định Mức Tồn Kho Tối Thiểu
* **Phân hệ:** Quản Trị Kho Vận & Chuỗi Cung Ứng
* **Route Frontend:** `/materials`
* **Vai trò áp dụng:** `pho_ca_vat_lieu`, `truong_ca`, `quan_ly`, `admin_he_thong`.
* **Mô tả chức năng:**
  - **Phân tách vật lý 3 bảng CSDL độc lập:**
    1. **Bao Bì (`packagings`):** Ly nhựa 500ml/700ml, nắp cầu, nắp tim, ống hút bọc màng, túi chữ T, túi 2 ly. Cấu hình chế độ nhiệt độ ly (Lạnh, Nóng, Cả Hai).
    2. **Nguyên Liệu Pha Chế (`ingredients`):** Trà đen, trà lài, siro đào, sốt caramel, sữa đặc, sữa tươi. Phân loại phạm vi sử dụng (`usage_scope`: Món Bán Khách, Sơ Chế Nội Bộ, Cả Hai).
    3. **Topping (`toppings`):** Trân châu đen, thạch phô mai, pudding trứng, kem cheese.
  - **Định mức cảnh báo tồn kho tối thiểu (`min_threshold`):** Khi số lượng thực tế $\le$ ngưỡng tối thiểu, hệ thống tự động đổi màu cảnh báo Đỏ/Cam và phát thông báo khẩn cấp.
  - **Tồn kho nhanh:** Nút bấm `+` / `-` điều chỉnh trực tiếp số lượng tồn kho ngay tại thẻ vật liệu hoặc bảng kiểm kê.
* **Mã nguồn:** `be/src/modules/pho_ca_vat_lieu/material/`, `fe/src/app/materials/`, `fe/src/features/pho_ca_vat_lieu/material/`.
* **Collection Database:** `packagings`, `ingredients`, `toppings`.

---

### CN11a: Sổ Tay Công Thức Pha Chế Bí Mật (BOM & SOP) & Chọn Ly Theo Nhiệt Độ
* **Phân hệ:** Quản Lý Menu & Bí Quyết Barista
* **Route Frontend:** `/recipes`
* **Vai trò áp dụng:** `nhan_vien`, `pho_ca_vat_lieu`, `truong_ca`, `quan_ly`, `admin_he_thong`.
* **Mô tả chức năng:**
  - **Phân loại 2 nhóm công thức rõ ràng:**
    1. **Bán Thành Phẩm Nội Bộ (`internal_prep`):** Nấu syrup đường phèn, ủ trà cốt đậm vị, làm sốt macchiato kem mặn (chỉ nhân viên nội bộ thấy).
    2. **Món Thương Phẩm Bán Khách (`customer_product`):** Trà sen vàng macchiato, cà phê muối Zone Six, trà đào cam sả.
  - **Bảo mật tuyệt đối tỷ lệ định lượng:** Công thức định lượng thành phần (BOM - Bill of Materials tính theo ml/gram) và các bước thao tác (SOP - Standard Operating Procedure) được ẩn với khách vãng lai, chỉ nhân viên có tài khoản đăng nhập mới xem được.
  - **Cấu hình 3 Chế độ Nhiệt độ & Dropdown chọn Ly riêng biệt:**
    - Lựa chọn: Chỉ phục vụ Lạnh, Chỉ phục vụ Nóng, Cả Hai (Lạnh & Nóng).
    - Dropdown chọn Ly Lạnh (`cold_cup_id`) và Ly Nóng (`hot_cup_id`) tự động lọc danh sách ly từ kho bao bì, có nút 1-chạm đưa ly đã chọn vào bảng định lượng BOM.
  - **Danh mục món độc lập (`recipe_categories`):** Bảng CSDL riêng với tính năng tự động tạo mới (`findOrCreate`) khi người dùng gõ tên danh mục mới.
  - **Tự động tính giá vốn COGS:** Tính tổng chi phí nguyên liệu và bao bì cấu thành nên món, đối chiếu với giá bán để hiển thị biên lợi nhuận gộp (Gross Margin %).
* **Mã nguồn:** `be/src/modules/pho_ca_vat_lieu/recipe/`, `fe/src/app/recipes/`, `fe/src/features/pho_ca_vat_lieu/recipe/`.
* **Collection Database:** `recipes`, `recipe_categories`, `sellable_toppings`.

---

### CN11b: Phân Hệ Kiểm Kê Kho Thực Tế & Cấu Hình Ca/Chu Kỳ/Phân Quyền
* **Phân hệ:** Kiểm Soát Thất Thoát Kho Vận
* **Route Frontend:** `/inventory-audit`
* **Vai trò áp dụng:** Tất cả nhân sự được cấu hình quyền tạo/duyệt phiếu kiểm kho.
* **Mô tả chức năng:**
  - **Nhật ký kiểm kho theo ngày:** Hiển thị danh sách các đợt kiểm kê với thông tin người kiểm, ngày giờ kiểm, số lượng lệch thực tế so với sổ sách, tổng giá trị chênh lệch tiền.
  - **Chế độ đếm kép (Đếm lẻ + Đếm thùng):** Hỗ trợ nhân viên đếm theo số lượng lẻ hoặc nhập số lượng thùng (ví dụ: 5 thùng + 3 gói) hệ thống tự động quy đổi số lẻ theo hệ số thùng.
  - **Modal Cấu Hình Kiểm Kho (`InventoryAuditConfigModal`):**
    - Cấu hình vai trò được phép tạo phiếu kiểm (Nhân viên, Phó ca, Trưởng ca).
    - Cấu hình ca bắt buộc phải kiểm kê trong ngày (ví dụ: Ca 3 trước khi đóng cửa).
    - Cấu hình tần suất chu kỳ: Hàng ngày, 2 ngày/lần, 3 ngày/lần, Hàng tuần.
  - **Đồng bộ số liệu vào kho:** Khi Trưởng ca hoặc Quản lý duyệt phiếu, số liệu kiểm kê thực tế sẽ tự động ghi đè cập nhật vào tồn kho hiện tại của quán.
* **Mã nguồn:** `be/src/modules/pho_ca_vat_lieu/inventory-audit/`, `fe/src/app/inventory-audit/`, `fe/src/features/pho_ca_vat_lieu/inventory-audit/`.
* **Collection Database:** `inventory_audits`, `inventory_audit_configs`.

---

### CN11c: Quản Lý Nhà Cung Cấp & Liên Kết Vật Liệu Cung Ứng
* **Phân hệ:** Quản Lý Nhà Cung Cấp & Đối Tác
* **Route Frontend:** `/procurement` (Tab Nhà Cung Cấp)
* **Vai trò áp dụng:** **ĐỘC QUYỀN QUẢN LÝ & ADMIN HỆ THỐNG**.
* **Mô tả chức năng:**
  - **Hồ sơ nhà cung cấp:** Tên công ty/đơn vị, Mã NCC, Mã số thuế, Người liên hệ, Hotline, Email, Địa chỉ kho giao hàng, Đánh giá chất lượng (1-5 sao).
  - **Danh mục vật liệu cung ứng:** Gắn danh sách các nguyên vật liệu hoặc bao bì mà đơn vị này có khả năng cung ứng cùng giá nhập dự kiến.
  - **Theo dõi lịch sử đơn hàng:** Thống kê tổng số tiền đã đặt mua và đánh giá độ tin cậy giao hàng đúng hạn.
* **Mã nguồn:** `be/src/modules/admin_he_thong/supplier/`, `fe/src/features/admin_he_thong/supplier/`.
* **Collection Database:** `suppliers`.

---

### CN11d: Yêu Cầu Nhập Kho (PR) & Trung Tâm Thu Mua Gộp Đơn PO Đa Cơ Sở
* **Phân hệ:** Thu Mua Tập Trung & Tối Ưu Chi Phí Chuỗi
* **Route Frontend:** `/procurement`
* **Vai trò áp dụng:** Phó Ca Vật Liệu / Trưởng Ca (Lập PR cơ sở mình); Quản Lý & Admin (Duyệt, gộp đơn PO lớn).
* **Mô tả chức năng:**
  - **Lập phiếu yêu cầu PR (`CreateRequisitionModal`):** Phó ca vật liệu hoặc Trưởng ca lập danh sách hàng cần nhập tại cơ sở. Có nút *"Tự động gợi ý từ tồn kho"* quét các mặt hàng dưới `min_threshold` để điền nhanh số lượng thiếu hụt.
  - **Trung tâm thu mua gộp đơn PO (`PoAggregationModal`):**
    - Quản lý xem toàn bộ phiếu PR từ tất cả chi nhánh.
    - Tính năng **Gộp đơn thông minh (PO Aggregation):** Chọn các phiếu PR của nhiều chi nhánh gửi lên cùng 1 Nhà cung cấp, gộp thành 1 Đơn Thu Mua lớn (Purchase Order) để đàm phán chiết khấu số lượng lớn với nhà cung cấp.
    - Chọn điểm giao hàng: Giao về **Kho Tổng Trung Tâm** hoặc **Giao Thẳng Từng Chi Nhánh**.
  - **Xác nhận nhập kho & Tự động cộng tồn kho:** Khi hàng về đến nơi, người nhận kiểm đếm bấm "Xác nhận nhập kho", số lượng sẽ tự động cộng dồn vào tồn kho thực tế của chi nhánh tương ứng.
* **Mã nguồn:** `be/src/modules/pho_ca_vat_lieu/purchase_requisition/`, `be/src/modules/quan_ly/purchase_order/`, `fe/src/features/quan_ly/procurement/`.
* **Collection Database:** `purchase_requisitions`, `purchase_orders`.

---

### CN12: Hệ Thống Bán Hàng POS Live Order Đồng Bộ Thời Gian Thực & Thanh Toán VietQR
* **Phân hệ:** Bán Hàng & Thu Ngân Đa Thiết Bị (POS Point of Sale)
* **Route Frontend:** `/pos`
* **Vai trò áp dụng:** Tất cả nhân sự trong ca làm việc hợp lệ; Quản lý/Admin giám sát.
* **Mô tả chức năng:**
  - **Rào chắn ca trực bảo mật (Shift Gatekeeper):**
    - Khi truy cập `/pos`, hệ thống tự động kiểm tra nhân viên có ca trực hiện tại không và đã **Chụp ảnh điểm danh Camera + GPS hợp lệ chưa**.
    - Nếu chưa điểm danh hoặc không có ca, hệ thống chặn truy cập và tự động chuyển hướng sang `/checkin`.
  - **Đồng bộ giỏ hàng thời gian thực qua WebSocket (Socket.io Namespace `/pos`):**
    - Ví dụ ca trực có 3 nhân viên (1 Thu ngân, 1 Barista, 1 Phục vụ bàn): Cả 3 người cùng mở giao diện POS.
    - Khi Nhân viên A bấm thêm "Trà Sữa Zone Six", giỏ hàng trên máy của Nhân viên B và C **nhảy thêm món ngay lập tức trong 0.05 giây** kèm huy hiệu *"Thêm bởi: Nguyễn Văn A"*.
    - Hỗ trợ đổi số lượng, ghi chú (ít đường, 50% đá), nhập số bàn và đổi tên khách.
  - **Cơ chế Khóa giỏ hàng tạm thời (Locking):** Khi một nhân viên đang nhập thông tin thanh toán, giỏ hàng tự động hiển thị trạng thái đang thao tác để tránh 2 người cùng bấm tính tiền trùng nhau.
  - **Tạo mã thanh toán VietQR động chuẩn NAPAS 247:**
    - Khách chọn chuyển khoản: Hệ thống sinh mã QR động ngân hàng chuẩn VietQR (`img.vietqr.io`) chứa chính xác: Số tài khoản, Ngân hàng, Số tiền khớp từng đồng và Nội dung chuyển khoản là Mã Đơn Hàng duy nhất. Khách chỉ cần quét là thanh toán không cần nhập số tiền.
  - **Lưu trữ hóa đơn vĩnh viễn:** Tạo mã đơn dạng quy chuẩn `Z6-<STORE_CODE>-<DATE>-<SEQ>` (ví dụ: `Z6-CS1-20261030-0001`), lưu đầy đủ vào collection `orders` và tự động làm sạch giỏ hàng ca trực sẵn sàng cho bàn tiếp theo.
* **Mã nguồn:** `be/src/modules/pos/`, `fe/src/app/pos/`, `fe/src/features/pos/`.
* **Collection Database:** `pos_sessions`, `orders`.

---

## 📊 BẢNG TỔNG KẾT ROUTE FRONTEND & QUYỀN TRUY CẬP

| STT | Route URL | Tên Phân Hệ | Quyền Truy Cập (Roles) | Icon |
| :---: | :--- | :--- | :--- | :---: |
| 1 | `/login` | Đăng Nhập Hệ Thống | Công khai (Public) | 🔑 |
| 2 | `/profile` | Hồ Sơ Cá Nhân & Thẻ Số ID Card | Mọi vai trò đã đăng nhập | 🪪 |
| 3 | `/staff` | Quản Lý Nhân Sự & Phân Quyền | Admin, Quản Lý, Trưởng Ca (Cấp dưới) | 👥 |
| 4 | `/schedule` | Lịch Làm Việc Tuần & AutoScheduler | Mọi vai trò (Nhân viên chỉ xem; Quản lý/Admin/Trưởng ca/Phó ca lịch chỉnh sửa) | 📅 |
| 5 | `/schedule/register` | Đăng Ký Nguyện Vọng Ca Tuần | Mọi vai trò | 📝 |
| 6 | `/shifts` | Cấu Hình Ca & Định Biên | Admin, Quản Lý, Trưởng Ca, Phó Ca Lịch | ⚙️ |
| 7 | `/checkin` | Điểm Danh Camera Trực Tiếp + GPS | Mọi vai trò có ca làm | 📸 |
| 8 | `/checkin-config` | Cấu Hình GPS & Bán Kính Điểm Danh | Admin Hệ Thống, Quản Lý | 📍 |
| 9 | `/stores` | Quản Lý Danh Mục Chuỗi Chi Nhánh | Admin Hệ Thống, Quản Lý | 🏬 |
| 10 | `/notifications` | Trung Tâm Thông Báo Độc Lập | Mọi vai trò (Tách riêng 6 collection) | 🔔 |
| 11 | `/salary` | Bảng Lương Tháng Nhân Sự | Admin, Quản Lý, Trưởng Ca | 💰 |
| 12 | `/zalo` | Trợ Lý Zalo Bot Đa Kênh Tự Động | **Duy nhất Admin Hệ Thống** | 🤖 |
| 13 | `/materials` | Quản Lý Kho 3 Bảng Vật Liệu | Phó Ca Vật Liệu, Trưởng Ca, Quản Lý, Admin | 📦 |
| 14 | `/recipes` | Sổ Tay Công Thức Pha Chế Bí Mật | Mọi vai trò nhân sự Zone 6 | 📖 |
| 15 | `/inventory-audit` | Kiểm Kê Kho Thực Tế & Lịch Sử | Phó Ca Vật Liệu, Trưởng Ca, Quản Lý, Admin | 📋 |
| 16 | `/procurement` | Đơn Nhập Hàng PR & Gộp Thu Mua PO | Phó Ca Vật Liệu, Trưởng Ca, Quản Lý, Admin | 🛒 |
| 17 | `/pos` | Bán Hàng Live POS & VietQR | Nhân sự đang trong ca trực hợp lệ | 📱 |

---

> **Cam kết:** Toàn bộ 17 chức năng trên đều đã được phát triển theo đúng chuẩn kiến trúc **Role-based Feature-Sliced Architecture**, phân rã CRUD Granular SRP và hoạt động thực tế trên cơ sở dữ liệu MongoDB Atlas.

