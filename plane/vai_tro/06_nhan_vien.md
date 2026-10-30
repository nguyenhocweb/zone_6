# ☕ VAI TRÒ: NHÂN VIÊN (`nhan_vien`)

---

## 1. MỤC TIÊU & ĐỊNH NGHĨA VAI TRÒ
- **Mã hệ thống:** `nhan_vien`
- **Tên hiển thị:** Nhân Viên (Staff - Pha Chế Barista & Phục Vụ Service)
- **Tài khoản mặc định:** `nhanvien@zonesix.vn` / `nhanvien@zone6.vn` (Mã NV: `Z6-NV01`) và các nhân viên theo từng cơ sở.
- **Phạm vi cơ sở (Store Scope):** Biên chế tại **1 cơ sở cố định** (`assigned_store_id`).
- **Mục tiêu cốt lõi:**
  - Lực lượng phục vụ trực tiếp tại cơ sở Zone Six được phân công, mang lại trải nghiệm tốt nhất cho khách hàng.
  - **Barista (Pha chế):** Đảm bảo chất lượng đồ uống theo chuẩn công thức, tốc độ ra món nhanh chóng, vệ sinh khu vực quầy bar tại cơ sở.
  - **Service (Phục vụ):** Niềm nở chào đón khách, phục vụ order chính xác, giữ không gian cơ sở luôn sạch sẽ gọn gàng.
  - Tuân thủ giờ giấc ca trực và quy định điểm danh nghiêm ngặt của Zone Six tại đúng chi nhánh làm việc.

---

## 2. TÁC ĐỘNG ĐẾN HỆ THỐNG VÀ CÁC VAI TRÒ KHÁC

### 2.1 Tác động đến Khâu Xếp Lịch Cơ Sở (Đầu vào của hệ thống)
- Việc nhân viên đăng ký ca tuần đầy đủ, đúng hạn tại cơ sở của mình là điều kiện tiên quyết để Phó ca làm lịch và AutoScheduler phân bổ ca công bằng, tránh thiếu hụt nhân sự vào giờ cao điểm của cơ sở.

### 2.2 Tác động đến Khâu Chấm Công & Điểm Danh Tại Cơ Sở
- Mỗi lần nhân viên đến đúng cơ sở thực hiện Check-in Camera + GPS sẽ sinh ra bản ghi điểm danh kèm bằng chứng ảnh số chìm (watermark tọa độ cơ sở).
- Bản ghi này là căn cứ để Trưởng ca cơ sở và Quản lý đối chiếu, tích xác nhận ca trực và tự động tính lương cuối tháng.

### 2.3 Ranh giới phân quyền & Ràng buộc bảo mật
1. **TRÊN BẢNG LỊCH TUẦN: CHỈ CÓ QUYỀN XEM (READ-ONLY):**
   - Chỉ xem bảng lịch của cơ sở mình.
   - Không được bấm sửa ô ca của bản thân hoặc người khác.
   - **Tuyệt đối không hiển thị dấu tích điểm danh (Check-in checkbox bị ẩn).** Nhân viên không thể tự tích chấm công cho mình trên bảng lịch.
2. **ẨN HOÀN TOÀN BẢNG LƯƠNG TỔNG:**
   - Nhân viên bị ẩn menu Bảng Lương (`/salary`) để bảo mật bí mật kinh doanh và thu nhập nội bộ của quán.
3. **CẤM TRUY CẬP CÁC PHÂN HỆ QUẢN TRỊ:**
   - Toàn bộ menu: Quản Lý Nhân Sự (`/staff`), Cấu Hình GPS (`/checkin-config`), Zalo Bot (`/zalo`), Quản Lý Cơ Sở (`/stores`) đều bị ẩn và chặn truy cập API.

---

## 3. DANH SÁCH CHỨC NĂNG VÀ HÀNH ĐỘNG CỤ THỂ

### 3.1 Đăng Ký Nguyện Vọng Ca Tuần Cơ Sở (Weekly Shift Registration)
- **Truy cập:** Route `/schedule/register`.
- **Thao tác:** Chọn các ca làm việc mong muốn cho 7 ngày trong tuần (Thứ 2 đến Chủ Nhật) theo các khung ca tại cơ sở của mình.
- **Ràng buộc:** Chỉ gửi được khi đợt đăng ký của cơ sở đang ở trạng thái **MỞ (OPEN)** do Quản lý hoặc Phó ca làm lịch kích hoạt.

### 3.2 Check-in Điểm Danh Bằng Camera Thực Tế & Định Vị GPS Khớp Cơ Sở
- **Truy cập:** Nút Check-in tại trang Lịch hoặc Dashboard.
- **Bắt buộc chụp ảnh trực tiếp từ Camera:** Khóa chọn file từ máy, bắt buộc bật Camera thiết bị.
- **Đóng dấu chìm vĩnh viễn (Canvas Watermark):**
  - Địa chỉ đường phố thực tế từ GPS (Reverse Geocoding).
  - Tọa độ GPS chính xác và khoảng cách mét tính đến cơ sở Zone Six tương ứng với ca trực.
  - Thời gian chụp chính xác đến từng giây.
  - Con dấu điện tử "ZONE 6 - [TÊN CƠ SỞ] - XÁC THỰC CAMERA & GPS".
- **Kiểm tra hợp lệ:** Khoảng cách phải nằm trong bán kính Geofence của **đúng cơ sở làm việc** (mặc định 50m) và trong khung thời gian cho phép của ca trực.

### 3.3 Xem Lịch Làm Việc Tuần Tại Cơ Sở (View Shift Schedule)
- **Truy cập:** Route `/schedule`.
- **Thao tác:** Xem danh sách ca đã được xếp chính thức tại cơ sở mình, biết trước ngày giờ ca làm, vị trí phụ trách (Barista hoặc Service) và đồng đội cùng ca.

### 3.4 Quản Lý Hồ Sơ Cá Nhân & Thẻ Nhân Viên Số (Profile & Digital ID)
- **Truy cập:** Route `/profile`.
- **Thẻ Nhân Viên Số (Digital Staff ID Card):** Hiển thị thẻ 3D Obsidian Gold, tên cơ sở làm việc, ảnh đại diện, vị trí công việc, mức lương giờ và mã QR định danh cá nhân.
- **Cập nhật thông tin:** Cập nhật số điện thoại cá nhân và đổi mật khẩu tài khoản.

### 3.5 Trung Tâm Thông Báo (Notifications)
- **Modal Thông Báo:** Nhận thông báo mở đăng ký ca, nhắc nhở ca trực sắp diễn ra tại cơ sở. Dữ liệu lưu trong collection `notifications_nhan_vien`.

---

## 4. BẢNG PHÂN QUYỀN VÀ GIỚI HẠN GIAO DIỆN

| Thành Phần Giao Diện | Trạng Thái Hiển Thị | Quyền Thao Tác |
| :--- | :---: | :--- |
| Header: **Store Switcher** | ❌ **Không có** | Gắn cố định vào 1 cơ sở biên chế |
| Sidebar Menu: **Đăng Ký Ca (/schedule/register)** | ✅ Hiển thị | Đăng ký nguyện vọng cơ sở khi cổng mở |
| Sidebar Menu: **Xếp Lịch (/schedule)** | ✅ Hiển thị | **Chỉ xem (Read-only)** lịch cơ sở mình |
| Bảng Lịch Tuần: **Dấu tích Check-in**| ❌ **ẨN HOÀN TOÀN** | Không có quyền điểm danh |
| Bảng Lịch Tuần: **Nút Auto Xếp Lịch**| ❌ **ẨN HOÀN TOÀN** | Bị vô hiệu hóa / Ẩn |
| Bảng Lịch Tuần: **Nút Xuất Excel** | ❌ **ẨN HOÀN TOÀN** | Bị ẩn |
| Sidebar Menu: **Hồ Sơ Cá Nhân (/profile)** | ✅ Hiển thị | Xem thẻ số, đổi mật khẩu cá nhân |
| Sidebar Menu: **Bảng Lương (/salary)** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
| Sidebar Menu: **Nhân Sự (/staff)** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
| Sidebar Menu: **Cấu Hình GPS (/checkin-config)**| ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
| Sidebar Menu: **Zalo Bot (/zalo)** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |

