# 📦 VAI TRÒ: PHÓ CA VẬT LIỆU (`pho_ca_vat_lieu`)

---

## 1. MỤC TIÊU & ĐỊNH NGHĨA VAI TRÒ
- **Mã hệ thống:** `pho_ca_vat_lieu`
- **Tên hiển thị:** Phó Ca Vật Liệu (Inventory & Materials Deputy)
- **Tài khoản mặc định:** `vatlieu@zonesix.vn` / `vatlieu@zone6.vn` (Mã NV: `Z6-PCVL01`)
- **Phạm vi cơ sở (Store Scope):** Gắn với **1 cơ sở cố định** (`assigned_store_id`), chịu trách nhiệm kho nguyên vật liệu của đúng cơ sở đó.
- **Mục tiêu cốt lõi:**
  - Chịu trách nhiệm quản lý kho nguyên vật liệu pha chế của cơ sở Zone Six được phân công: Hạt cà phê, sữa, siro, trà, đá, bao bì, ly cốc và hóa phẩm vệ sinh.
  - Kiểm kê định kỳ tồn kho thực tế tại cơ sở, đối chiếu định mức tiêu hao với số lượng ly bán ra.
  - Lập đề xuất nhập hàng kịp thời gửi Quản lý cơ sở phê duyệt để cơ sở không bao giờ bị đứt gãy nguồn nguyên liệu.
  - Trực tiếp tham gia ca làm việc tại cơ sở (Barista / Service) theo sự phân công của lịch tuần.

---

## 2. TÁC ĐỘNG ĐẾN HỆ THỐNG VÀ CÁC VAI TRÒ KHÁC

### 2.1 Tác động đến Quản lý & Vận hành tại cơ sở
- **Báo cáo tồn kho cơ sở:** Cung cấp số liệu chính xác để Quản lý cơ sở quyết định ngân sách mua hàng và kiểm soát giá vốn (COGS) tại chi nhánh.
- **Cảnh báo ngưỡng an toàn:** Báo động ngay khi nguyên liệu quan trọng tại cơ sở chạm mức tồn tối thiểu.

### 2.2 Tác động đến Đội ngũ Pha chế (Barista) tại cơ sở
- Giám sát việc tuân thủ công thức và định lượng nguyên liệu chuẩn tại quầy bar cơ sở.
- Đảm bảo quầy bar luôn có sẵn dụng cụ và vật tư đầy đủ trước mỗi ca.

### 2.3 Ranh giới phân quyền trên Hệ thống (Ràng buộc nghiêm ngặt)
1. **TRÊN BẢNG LỊCH TUẦN: CHỈ CÓ QUYỀN XEM (READ-ONLY):**
   - Ẩn toàn bộ nút thao tác: Tự động xếp lịch, Tải lên lịch, Mở/khóa đăng ký.
   - Vô hiệu hóa nhấp chuột vào các ô ca làm việc (không sửa được ca của người khác).
   - **Tuyệt đối không có dấu tích điểm danh (Check-in checkbox bị ẩn).**
2. **ẨN HOÀN TOÀN BẢNG LƯƠNG:**
   - Không được quyền truy cập vào thông tin lương và thu nhập của cơ sở hay toàn chuỗi.
3. **KHÔNG CÓ QUYỀN QUẢN LÝ NHÂN SỰ & CẤU HÌNH GPS & ZALO BOT & QUẢN LÝ CƠ SỞ:**
   - Tất cả các module quản trị nâng cao đều bị ẩn trên giao diện và chặn ở tầng API backend.

---

## 3. DANH SÁCH CHỨC NĂNG VÀ HÀNH ĐỘNG CỤ THỂ

### 3.1 Quản Lý Vật Liệu & Kho Hàng Cơ Sở (Nghiệp vụ cốt lõi)
- **Kiểm kê nguyên vật liệu cơ sở:** Nhập số lượng thực tế trong kho của cơ sở, kiểm tra hạn sử dụng.
- **Đề xuất mua sắm:** Tạo danh sách hàng cần nhập gửi Quản lý cơ sở duyệt.
- **Theo dõi định mức tồn kho:** Giám sát danh mục nguyên liệu dưới ngưỡng an toàn tại cơ sở.

### 3.2 Hoạt Động Ca Trực Cá Nhân
- **Đăng ký ca làm cá nhân:** Vào tab Đăng Ký Ca Làm (`/schedule/register`) để gửi ca mong muốn mỗi tuần tại cơ sở của mình.
- **Xem Lịch Đã Xếp (Chế độ Read-only):** Xem lịch làm việc của cơ sở để biết giờ vào ca của mình.
- **Tự Check-in Điểm Danh:** Chụp ảnh Camera trực tiếp tại cơ sở với Watermark GPS và mốc thời gian thực khi vào ca.
- **Xem Hồ Sơ & Thẻ Nhân Viên Số:** Truy cập `/profile` để xem thông tin cá nhân và tên cơ sở.
- **Trung Tâm Thông Báo:** Nhận thông báo trong modal riêng (collection `notifications_pho_ca_vat_lieu`).

---

## 4. BẢNG PHÂN QUYỀN VÀ GIỚI HẠN GIAO DIỆN

| Thành Phần Giao Diện | Trạng Thái Hiển Thị | Quyền Thao Tác |
| :--- | :---: | :--- |
| Header: **Store Switcher** | ❌ **Không có** | Gắn cố định vào 1 cơ sở |
| Sidebar Menu: **Xếp Lịch (/schedule)** | ✅ Hiển thị | **Chỉ xem (Read-only)** lịch cơ sở mình |
| Bảng Lịch Tuần: **Dấu tích Check-in**| ❌ **ẨN HOÀN TOÀN** | Không có quyền điểm danh |
| Bảng Lịch Tuần: **Nút Auto Xếp Lịch**| ❌ **ẨN HOÀN TOÀN** | Bị vô hiệu hóa / Ẩn |
| Bảng Lịch Tuần: **Nút Xuất Excel** | ❌ **ẨN HOÀN TOÀN** | Bị ẩn |
| Sidebar Menu: **Đăng Ký Ca (/schedule/register)** | ✅ Hiển thị | Toàn quyền gửi nguyện vọng ca cơ sở |
| Sidebar Menu: **Bảng Lương (/salary)** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
| Sidebar Menu: **Nhân Sự (/staff)** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
| Sidebar Menu: **Cấu Hình GPS (/checkin-config)**| ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |
| Sidebar Menu: **Zalo Bot (/zalo)** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 |

