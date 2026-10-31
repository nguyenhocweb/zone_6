# 📋 DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP HỆ THỐNG ZONE SIX (PRODUCTION RESET)

> **Trạng thái Database:** Đã dọn dẹp sạch toàn bộ dữ liệu mẫu (Reset ngày 01/11/2026).  
> **Cơ sở dữ liệu:** MongoDB Atlas (Database: `zone_6`)  
> **Tài khoản đang hoạt động:** Hiện tại duy nhất **01 TÀI KHOẢN ADMIN TỐI CAO** tồn tại trên Database để đưa vào vận hành thực tế.

---

## 👑 1. TÀI KHOẢN QUẢN TRỊ DUY NHẤT ĐANG HOẠT ĐỘNG (ACTIVE)

| STT | Mã NV | Họ và Tên | Vai Trò (Role) | Email Đăng Nhập | Mật Khẩu | Quyền Hạn |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **1** | `Z6-ADMIN` | **Admin Hệ Thống** | `admin_he_thong` | `admin@zonesix.vn`<br>`admin@zone6.vn` | `admin123` | 👑 **Toàn quyền tối cao** (Quản trị chi nhánh, phân quyền nhân sự, cài đặt Zalo Bot, cấu hình GPS) |

---

## 🚀 2. HƯỚNG DẪN KHỞI TẠO DỮ LIỆU THỰC TẾ CHO QUÁN

Vì hệ thống đã xóa sạch toàn bộ dữ liệu nhân sự và lịch mẫu thử nghiệm, Admin sẽ khởi tạo dữ liệu thực tế theo trình tự 3 bước sau:

### Bước 1: Đăng nhập hệ thống
* Mở trình duyệt truy cập: **https://zone-six.vercel.app/login** (hoặc `http://localhost:3000/login`)
* **Email:** `admin@zonesix.vn`
* **Mật khẩu:** `admin123`

### Bước 2: Tạo Chi Nhánh Quán
* Vào menu **Quản Lý Chi Nhánh** (`/stores`) $\rightarrow$ Bấm **+ Thêm Chi Nhánh Mới**.
* Nhập Tên quán, Mã cơ sở (ví dụ: `Z6-CS01`), Địa chỉ và bấm nút **"Lấy GPS hiện tại"** để hệ thống lưu tọa độ chính xác của quán.

### Bước 3: Tạo Tài Khoản Cho Nhân Sự Quán
* Vào menu **Quản Lý Nhân Sự** (`/staff`) $\rightarrow$ Bấm **+ Thêm Nhân Viên Mới**.
* Nhập Họ tên, Email, Số điện thoại và chọn vai trò:
  - **Quản lý (`quan_ly`):** Phụ trách cơ sở.
  - **Trưởng ca (`truong_ca`):** Giám sát ca trực tại đúng cơ sở đó.
  - **Phó ca làm lịch (`pho_ca_lam_lich`):** Chuyên trách xếp lịch làm việc.
  - **Phó ca vật liệu (`pho_ca_vat_lieu`):** Chuyên trách quản lý kho bãi & kiểm kê.
  - **Nhân viên (`nhan_vien`):** Nhân viên pha chế, phục vụ, thu ngân.
* Hệ thống sẽ **tự động sinh mật khẩu ngẫu nhiên**, gửi email thật đến nhân viên đó, và hiển thị Pop-up để Admin sao chép gửi nhanh qua Zalo.

---

## 🛡️ 3. BẢNG TRA CỨU PHÂN QUYỀN 6 VAI TRÒ CHUẨN ZONE SIX

| Tính Năng / Nghiệp Vụ | Admin (`admin_he_thong`) | Quản Lý (`quan_ly`) | Trưởng Ca (`truong_ca`) | Phó Ca Làm Lịch (`pho_ca_lam_lich`) | Phó Ca Vật Liệu (`pho_ca_vat_lieu`) | Nhân Viên (`nhan_vien`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Đăng ký ca làm tuần (Tab Đăng ký)** | ✅ Mọi vai trò | ✅ Mọi vai trò | ✅ Mọi vai trò | ✅ Mọi vai trò | ✅ Mọi vai trò | ✅ Mọi vai trò |
| **Tự động xếp lịch (Auto-scheduler)** | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ❌ Bị chặn | ❌ Bị chặn |
| **Chỉnh sửa / Đổi nhân sự trong ô ca** | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ❌ Chỉ xem | ❌ Chỉ xem |
| **Tích Điểm Danh (Check-in) trực tiếp** | ✅ **Được tích** | ✅ **Được tích** | ✅ **Được tích** | ❌ **Ẩn dấu tích** | ❌ Chỉ xem | ❌ Chỉ xem |
| **Xem Bảng Lương Tháng** | ✅ **Hiển thị** | ✅ **Hiển thị** | ✅ **Hiển thị** | ❌ **Ẩn hoàn toàn** | ❌ **Ẩn hoàn toàn** | ❌ **Ẩn hoàn toàn** |
| **Bán hàng POS Quầy Live Order** | ✅ Xem & Giám sát | ✅ Xem & Giám sát | ✅ Khi có ca | ❌ Không có ca | ❌ Không có ca | ✅ Khi có ca |
| **Kiểm kê kho thực tế (/inventory-audit)** | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Duyệt/Sửa tồn | ❌ Không có | ✅ Lập & Duyệt | ✅ Kiểm đếm |
| **Lập Yêu Cầu Nhập Kho (PR)** | ✅ Toàn quyền | ✅ Duyệt & Gộp PO | ✅ Lập PR cơ sở | ❌ Không có | ✅ Lập PR cơ sở | ❌ Không có |
| **Quản lý Chi Nhánh (`/stores`)** | ✅ **Độc quyền** | ❌ Chỉ xem CS mình | ❌ Không có | ❌ Không có | ❌ Không có | ❌ Không có |
| **Cấu hình Zalo Bot (`/zalo`)** | ✅ **Độc quyền** | ❌ **Ẩn & Chặn** | ❌ **Ẩn & Chặn** | ❌ **Ẩn & Chặn** | ❌ **Ẩn & Chặn** | ❌ **Ẩn & Chặn** |

---

> 💡 **Ghi chú:** Nếu muốn nạp lại bộ dữ liệu 21 nhân viên và lịch mẫu để demo kiểm thử, bạn có thể chạy lệnh:
> ```bash
> npm --prefix be run db:seed
> ```
