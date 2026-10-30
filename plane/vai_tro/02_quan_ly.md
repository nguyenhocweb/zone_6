# 👔 VAI TRÒ: QUẢN LÝ QUÁN (`quan_ly`)

---

## 1. MỤC TIÊU & ĐỊNH NGHĨA VAI TRÒ
- **Mã hệ thống:** `quan_ly`
- **Tên hiển thị:** Quản Lý Quán (Store Manager / Cluster Manager)
- **Tài khoản mặc định:** `quanly@zonesix.vn` / `quanly@zone6.vn` (Mã NV: `Z6-QL01`)
- **Phạm vi quản lý cơ sở (Store Scope):**
  - Được Admin phân quyền quản lý **1 cơ sở** HOẶC **vài / nhiều cơ sở** cụ thể (danh sách `managed_store_ids`).
  - Nếu Admin phân cơ sở nào thì quản lý đúng các cơ sở đó. Tuyệt đối không được truy cập hay can thiệp vào các cơ sở khác ngoài danh sách được phân quyền.
- **Mục tiêu cốt lõi:**
  - Chịu trách nhiệm toàn diện về vận hành, chất lượng dịch vụ và nhân sự tại các cơ sở được phân công phụ trách.
  - Phê duyệt bảng xếp ca hàng tuần do Phó ca làm lịch đề xuất tại từng cơ sở.
  - Kiểm soát chi phí nhân công thông qua giám sát giờ công thực tế và Bảng lương tháng của các cơ sở mình quản lý.
  - Cấu hình vị trí địa lý (GPS Geofence) và quy định giờ giấc điểm danh của các cơ sở được phân công.

---

## 2. TÁC ĐỘNG ĐẾN HỆ THỐNG VÀ CÁC VAI TRÒ KHÁC

### 2.1 Tác động đến Trưởng ca
- Phân công nhiệm vụ cho Trưởng ca tại từng cơ sở thuộc quyền quản lý của mình.
- Kiểm tra tính trung thực trong việc điểm danh của Trưởng ca tại cơ sở đó.
- Đánh giá năng lực, điều chỉnh mức lương giờ và xét khen thưởng/kỷ luật cho Trưởng ca.
- *Lưu ý:* Quản lý chỉ thao tác với Trưởng ca thuộc các cơ sở mình quản lý.

### 2.2 Tác động đến Phó ca & Nhân viên
- Phê duyệt hoặc yêu cầu xếp lại lịch làm việc tuần từ Phó ca làm lịch của cơ sở tương ứng.
- Tạo mới tài khoản nhân viên (Trưởng ca, Phó ca, Nhân viên) và gán vào cơ sở mình phụ trách (tuân thủ nguyên tắc không tạo đồng cấp hoặc cấp trên).
- Tích điểm danh trực tiếp cho mọi nhân viên trong các cơ sở được phân công khi có phát sinh thực tế.
- Xem chi tiết giờ làm, mức lương và tổng thu nhập tháng của từng nhân viên tại các cơ sở mình phụ trách.

### 2.3 Ranh giới quyền hạn so với Admin Hệ Thống
- Không can thiệp vào tầng cấu hình Zalo Bot (toàn bộ module Zalo bị ẩn và chặn API).
- Không có quyền tạo cơ sở mới hoặc xóa cơ sở (chỉ Admin tối cao có quyền).
- Không thể tự nâng quyền cho chính mình lên `admin_he_thong` hoặc tạo thêm tài khoản `quan_ly` khác.
- Không thể tự mở rộng danh sách cơ sở mình quản lý (phải do Admin phân quyền).

### 2.4 Bộ Chuyển Đổi Cơ Sở Trong Phạm Vi Được Phân Quyền
- Nếu Quản lý phụ trách nhiều hơn 1 cơ sở: Header hiển thị Store Switcher với danh sách **chỉ bao gồm các cơ sở được phân quyền**.
- Nếu Quản lý chỉ phụ trách 1 cơ sở: Hệ thống tự động ghim cơ sở đó, không hiển thị cơ sở khác.

---

## 3. DANH SÁCH CHỨC NĂNG VÀ HÀNH ĐỘNG CỤ THỂ

### 3.1 Quản lý Nhân sự & Phân cấp (Staff Management)
- **Xem danh sách nhân sự:** Route `/staff`. Xem toàn bộ nhân viên và Trưởng ca trong các cơ sở mình quản lý.
- **Thêm nhân sự mới:** Nhập tên, email, vị trí làm việc, mức lương giờ và **chọn cơ sở làm việc** (trong danh sách cơ sở mình phụ trách).
  - *Ràng buộc phân cấp:* Chỉ được chọn vai trò cấp dưới (`truong_ca`, `pho_ca_lam_lich`, `pho_ca_vat_lieu`, `nhan_vien`). Tuyệt đối không được chọn `admin_he_thong` hay `quan_ly`.
  - *Cơ chế mật khẩu:* Hệ thống tự động sinh mật khẩu ngẫu nhiên bảo mật và gửi về email người nhận.
- **Chỉnh sửa nhân viên:** Điều chỉnh mức lương giờ và vai trò nhân viên thuộc cơ sở của mình.

### 3.2 Xếp Lịch & Điều Phối Ca Tuần (Scheduling)
- **Đăng ký ca làm cá nhân:** Tham gia đăng ký ca tại route `/schedule/register`.
- **Mở/Khóa cổng đăng ký ca tuần:** Kích hoạt theo từng cơ sở mình quản lý.
- **Chạy AutoScheduler:** Kích hoạt thuật toán tự động phân bổ ca tuần theo cơ sở.
- **Chỉnh sửa bảng lịch:** Thêm, xóa, đổi nhân viên trong từng ô ca làm việc của cơ sở.
- **Tích Điểm Danh (Direct Check-in):** Nhấp chuột trực tiếp vào ô ca trên bảng lịch tuần của cơ sở mình phụ trách để đánh dấu hoàn thành ca làm.
- **Xuất file Excel:** Tải file bảng lịch tuần hoàn chỉnh của cơ sở đang chọn.

### 3.3 Cấu Hình Điểm Danh Cơ Sở Được Phân Công (Store Check-in Config)
- **Truy cập:** Route `/checkin-config`.
- **Thiết lập tọa độ GPS cơ sở:** Chọn cơ sở trong danh sách phụ trách, nhập kinh/vĩ độ hoặc lấy vị trí GPS từ thiết bị khi đứng tại cơ sở.
- **Bán kính Geofence:** Thiết lập bán kính an toàn cho phép check-in cho từng cơ sở (30m - 500m).
- **Khung giờ check-in:** Cấu hình thời gian cho phép chụp ảnh check-in trước/sau giờ ca của cơ sở đó.
- **Công cụ kiểm tra:** Test trực tiếp khoảng cách giữa thiết bị và tọa độ cơ sở đã chọn.

### 3.4 Giám Sát & Bảng Lương (Payroll)
- **Truy cập:** Route `/salary`.
- **Xem bảng lương theo cơ sở:** Xem chi tiết bảng lương của từng cơ sở mình quản lý, hoặc tổng hợp các cơ sở mình phụ trách.
- *Nguyên tắc bảo mật:* Ẩn số điện thoại, mật khẩu, mã QR cá nhân để đảm bảo an toàn thông tin nội bộ.

---

## 4. BẢNG PHÂN QUYỀN VÀ GIỚI HẠN GIAO DIỆN

| Thành Phần Giao Diện | Trạng Thái Hiển Thị | Quyền Thao Tác |
| :--- | :---: | :--- |
| Header: **Store Switcher** | ✅ Hiển thị | Chỉ chọn được các cơ sở mình được Admin phân công |
| Sidebar Menu: **Zalo Bot** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 Forbidden |
| Sidebar Menu: **Quản Lý Cơ Sở (/stores)** | ❌ **Ẩn hoàn toàn** | Không có quyền thêm/xóa cơ sở hệ thống |
| Sidebar Menu: **Cấu Hình Check-in** | ✅ Hiển thị | Toàn quyền thiết lập GPS & khung giờ cơ sở mình quản lý |
| Sidebar Menu: **Quản Lý Nhân Sự** | ✅ Hiển thị | Xem, thêm/sửa cấp dưới tại các cơ sở mình quản lý |
| Sidebar Menu: **Bảng Lương Tháng** | ✅ Hiển thị | Xem bảng lương của các cơ sở mình phụ trách |
| Bảng Lịch Tuần: **Dấu tích Check-in**| ✅ Hiển thị | Bấm tích / bỏ tích trực tiếp tại cơ sở mình quản lý |
| Bảng Lịch Tuần: **Nút Auto Xếp Lịch**| ✅ Hiển thị | Chạy thuật toán xếp tự động theo cơ sở |
| Bảng Lịch Tuần: **Nút Xuất Excel** | ✅ Hiển thị | Xuất file Excel bảng ca theo cơ sở |

