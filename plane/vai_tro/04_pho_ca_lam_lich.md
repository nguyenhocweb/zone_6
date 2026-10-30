# 📅 VAI TRÒ: PHÓ CA LÀM LỊCH (`pho_ca_lam_lich`)

---

## 1. MỤC TIÊU & ĐỊNH NGHĨA VAI TRÒ
- **Mã hệ thống:** `pho_ca_lam_lich`
- **Tên hiển thị:** Phó Ca Làm Lịch (Scheduling Deputy / Assistant)
- **Tài khoản mặc định:** `lamlich@zonesix.vn` / `lamlich@zone6.vn` (Mã NV: `Z6-PCL01`)
- **Phạm vi cơ sở (Store Scope):** Gắn với **1 cơ sở cố định** (`assigned_store_id`), chuyên trách xếp lịch cho cơ sở đó.
- **Mục tiêu cốt lõi:**
  - Chuyên trách nghiệp vụ xếp lịch tuần cho nhân sự thuộc cơ sở Zone Six được phân công.
  - Thu thập, tổng hợp nguyện vọng đăng ký ca tuần từ nhân viên tại cơ sở.
  - Vận hành thuật toán AutoSchedulerEngine để tối ưu ma trận ca của cơ sở: Đủ định biên ca (Barista + Service), cân bằng số giờ công giữa các nhân viên, hạn chế ca gãy quá tải.
  - Xuất bảng lịch Excel hoàn chỉnh của cơ sở để trình Quản lý phê duyệt.

---

## 2. TÁC ĐỘNG ĐẾN HỆ THỐNG VÀ CÁC VAI TRÒ KHÁC

### 2.1 Tác động đến Nhân sự tại cơ sở
- **Mở/Khóa cổng đăng ký cơ sở:** Quyết định thời điểm mở đợt đăng ký ca và thời điểm chốt sổ tuần mới của cơ sở.
- **Phân bổ ca trực cơ sở:** Trực tiếp quyết định ai làm ca sáng, chiều, tối hoặc full ngày sau khi chạy tự động và tinh chỉnh thủ công.
- **Cân đối khối lượng công việc:** Đảm bảo công bằng trong việc chia giờ làm giữa các nhân viên trong cơ sở.

### 2.2 Ranh giới nghiệp vụ & Các điều cấm kỵ (Quy định nghiêm ngặt)
1. **TUYỆT ĐỐI KHÔNG ĐƯỢC TÍCH ĐIỂM DANH (CHECK-IN):**
   - Trên giao diện bảng lịch tuần (`WeeklyScheduleTable`), **dấu tích điểm danh (Check-in Checkbox) bị ẨN HOÀN TOÀN** đối với vai trò `pho_ca_lam_lich`.
   - *Lý do kiến trúc:* Phân ly trách nhiệm (Separation of Concerns). Người xếp lịch không được đồng thời là người chấm công để ngăn ngừa rủi ro gian lận hoặc tự xác nhận ca cho bản thân.
2. **ẨN HOÀN TOÀN BẢNG LƯƠNG:**
   - Menu Bảng Lương (`/salary`) bị ẩn 100% trên Sidebar.
   - Truy cập URL trực tiếp bị chuyển hướng về `/schedule`.
   - API Backend `/api/v1/salary` chặn với mã lỗi `403 Forbidden`.
3. **KHÔNG CÓ QUYỀN QUẢN LÝ NHÂN SỰ & ZALO BOT & GPS QUÁN:**
   - Bị ẩn và chặn toàn bộ các module: `/staff`, `/zalo`, `/checkin-config`, `/stores`.
4. **KHÔNG THAO TÁC CƠ SỞ KHÁC:** Chỉ xếp lịch cho cơ sở được phân công, không can thiệp lịch cơ sở khác.

---

## 3. DANH SÁCH CHỨC NĂNG VÀ HÀNH ĐỘNG CỤ THỂ

### 3.1 Nhóm Chuyên Trách: Xếp Lịch Tuần Cơ Sở (Scheduling Engine)
- **Mở / Đóng cổng đăng ký ca tuần của cơ sở:** Kích hoạt hoặc khóa biểu mẫu đăng ký nguyện vọng của nhân viên cơ sở.
- **Kích hoạt Tự động xếp lịch (AutoScheduler):**
  - Chạy engine thuật toán tối ưu xếp ca tự động cho cơ sở.
  - Tự động kiểm tra ràng buộc: Ưu tiên nguyện vọng, tránh trùng ca, đảm bảo định biên tối thiểu cho ca sáng/chiều/tối.
- **Chỉnh sửa ma trận ca trực cơ sở:**
  - Nhấp vào từng ô ca để thay đổi nhân viên, xóa nhân viên khỏi ca hoặc thêm nhân viên tăng cường trong cơ sở.
- **Xuất file Excel:** Tải file Excel lịch làm chuẩn của cơ sở mình.

### 3.2 Nhóm Hoạt Động Cá Nhân
- **Đăng ký ca làm cá nhân:** Gửi nguyện vọng ca trực của chính mình tại route `/schedule/register` của cơ sở.
- **Tự Check-in Điểm Danh Cá Nhân:** Chụp ảnh Camera trực tiếp tại cơ sở với Watermark GPS và thời gian khi đến lượt mình làm ca.
- **Hồ Sơ Cá Nhân & Thẻ Nhân Viên Số:** Xem thẻ nhân viên số 3D, mã QR và thông tin cơ sở tại `/profile`.
- **Trung Tâm Thông Báo:** Nhận các cảnh báo xếp ca, nhắc việc trong modal thông báo riêng (collection `notifications_pho_ca_lam_lich`).

---

## 4. BẢNG PHÂN QUYỀN VÀ GIỚI HẠN GIAO DIỆN

| Thành Phần Giao Diện | Trạng Thái Hiển Thị | Quyền Thao Tác |
| :--- | :---: | :--- |
| Header: **Store Switcher** | ❌ **Không có** | Gắn cố định vào 1 cơ sở |
| Sidebar Menu: **Xếp Lịch (/schedule)** | ✅ Hiển thị | Toàn quyền thao tác xếp ca cho cơ sở mình |
| Sidebar Menu: **Đăng Ký Ca (/schedule/register)** | ✅ Hiển thị | Gửi nguyện vọng ca cá nhân |
| Bảng Lịch Tuần: **Dấu tích Check-in**| ❌ **ẨN HOÀN TOÀN** | Không có quyền điểm danh |
| Bảng Lịch Tuần: **Nút Auto Xếp Lịch**| ✅ Hiển thị | Toàn quyền chạy thuật toán cho cơ sở |
| Bảng Lịch Tuần: **Nút Mở/Khóa Đăng Ký**| ✅ Hiển thị | Toàn quyền mở/khóa cho cơ sở |
| Bảng Lịch Tuần: **Nút Xuất Excel** | ✅ Hiển thị | Tải file Excel lịch tuần cơ sở |
| Sidebar Menu: **Bảng Lương (/salary)** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
| Sidebar Menu: **Nhân Sự (/staff)** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
| Sidebar Menu: **Cấu Hình GPS (/checkin-config)**| ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
| Sidebar Menu: **Zalo Bot (/zalo)** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
