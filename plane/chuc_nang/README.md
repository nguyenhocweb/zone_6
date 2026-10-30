# 🧩 DANH MỤC & CHI TIẾT TỪNG CHỨC NĂNG HỆ THỐNG ZONE SIX (MULTI-STORE)

> **Quy chuẩn bắt buộc:** Mỗi chức năng được đánh mã `CNxx`. Bất kỳ khi nào lập trình viên/AI thêm code, sửa logic hoặc thay đổi API endpoint, bắt buộc phải đối chiếu và cập nhật tài liệu tương ứng tại đây.

---

## 1. BẢNG TỔNG QUAN DANH MỤC CHỨC NĂNG

| Mã CN | Tên Chức Năng | Phân Hệ | Quyền Truy Cập (Roles) | Phạm Vi Cơ Sở (Store Scope) | File Tài Liệu Chi Tiết |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **CN01** | Xác Thực, Hồ Sơ & Thẻ Nhân Viên Số | Tài khoản | Tất cả (Mọi vai trò) | Đính kèm `store_scope` trong session/token | [CN01_xac_thuc_va_tai_khoan.md](./CN01_xac_thuc_va_tai_khoan.md) |
| **CN02** | Quản Lý Nhân Sự & Phân Bổ Cơ Sở | Nhân sự | Admin, Quản Lý, Trưởng Ca (Cấp dưới) | Phân bổ nhân viên vào cơ sở; lọc theo cơ sở | [CN02_quan_ly_nhan_su.md](./CN02_quan_ly_nhan_su.md) |
| **CN03** | Đăng Ký Nguyện Vọng Ca Tuần | Xếp ca | Mọi vai trò (Đăng ký) / Quản trị (Mở-Khóa)| Đăng ký theo từng cơ sở cụ thể | [CN03_dang_ky_ca_tuan.md](./CN03_dang_ky_ca_tuan.md) |
| **CN04** | Xếp Lịch Tuần & AutoScheduler Đa Cơ Sở| Xếp ca | Admin, Quản Lý, Trưởng Ca, Phó Ca Lịch | Ma trận ca phân tách theo từng cơ sở | [CN04_xep_lich_va_auto_scheduler.md](./CN04_xep_lich_va_auto_scheduler.md) |
| **CN05** | Điểm Danh Check-in GPS & Camera Khớp Cơ Sở| Điểm danh | Tất cả (Chụp ảnh + Watermark) | Đối chiếu Geofence GPS đúng cơ sở làm ca | [CN05_diem_danh_gps_camera.md](./CN05_diem_danh_gps_camera.md) |
| **CN06** | Quản Lý Danh Mục Cơ Sở & GPS Check-in | Quản trị chuỗi| Admin (Toàn chuỗi), Quản Lý (Cơ sở phân công)| Thiết lập GPS & Geofence riêng từng cơ sở | [CN06_cau_hinh_checkin_va_quan.md](./CN06_cau_hinh_checkin_va_quan.md) |
| **CN07** | Tích Điểm Danh Trực Tiếp Trên Ô Ca | Điểm danh | Admin, Quản Lý, Trưởng Ca (Ẩn Phó Ca Lịch)| Trưởng ca chỉ tích ở ĐÚNG 1 cơ sở mình phụ trách | [CN07_tich_diem_danh_truc_tiep.md](./CN07_tich_diem_danh_truc_tiep.md) |
| **CN08** | Trung Tâm Thông Báo Phân Luồng Role & Cơ Sở| Tương tác | Tất cả (6 Collection riêng cho từng Role) | Gắn ngữ cảnh cơ sở trong cảnh báo | [CN08_trung_tam_thong_bao.md](./CN08_trung_tam_thong_bao.md) |
| **CN09** | Quản Lý Bảng Lương & Chi Trả Đa Cơ Sở | Lương bổng | Admin, Quản Lý, Trưởng Ca (Ẩn Nhân Viên) | Lọc lương theo cơ sở; Trưởng ca chỉ xem cơ sở mình | [CN09_quan_ly_bang_luong.md](./CN09_quan_ly_bang_luong.md) |
| **CN10** | Zalo Personal Bot Tự Động Hóa | Tự động hóa | **Duy nhất Admin Hệ Thống** | Gửi tin nhắn theo nhóm Zalo từng cơ sở | [CN10_zalo_automation_bot.md](./CN10_zalo_automation_bot.md) |
| **CN11** | Quản Lý Vật Liệu & Tồn Kho Từng Cơ Sở | Vật liệu | Phó Ca Vật Liệu, Quản Lý | Quản lý kho phân lập theo từng cơ sở | [CN11_quan_ly_vat_lieu_kho.md](./CN11_quan_ly_vat_lieu_kho.md) |

---

## 2. NGUYÊN TẮC QUẢN TRỊ TÍNH NĂNG ĐA CƠ SỞ
1. **Kiểm soát phạm vi cơ sở (Store Scoping Principle):**
   - **Admin toàn chuỗi:** Truy cập tất cả cơ sở hoặc vài/nhiều cơ sở được phân quyền; chuyển đổi qua Store Switcher.
   - **Quản lý:** Chỉ truy cập các cơ sở trong danh sách được Admin phân công (`managed_store_ids`).
   - **Trưởng ca (BẮT BUỘC):** Chỉ làm việc và phụ trách tại **ĐÚNG 1 CƠ SỞ DUY NHẤT** (`assigned_store_id`).
   - Mọi API truy vấn dữ liệu vận hành đều phải kiểm tra và lọc theo `store_id`.
2. **Phân quyền đa tầng (Defense in Depth):**
   - Tầng UI: Ẩn/hiện component dựa trên `user.role` và `store_scope`.
   - Tầng Route Next.js: Kiểm tra phiên tại middleware hoặc redirect tức thì nếu truy cập trái phép.
   - Tầng Backend Express: Middleware `authenticateToken`, `authorizeRole` và `verifyStoreScope` bắt buộc kiểm tra JWT và quyền trên cơ sở.
3. **Bảo mật dữ liệu nhạy cảm:**
   - Mật khẩu không bao giờ được gửi về phía Client trong các API danh sách.
   - Bảng lương chỉ hiển thị các trường công khai nội bộ: Tên, Vị trí, Mức lương/Giờ, Tổng giờ, Tổng lương. Ẩn hoàn toàn SĐT cá nhân và mã QR.
4. **Tính toàn vẹn của dữ liệu điểm danh:**
   - Ảnh chụp check-in bắt buộc từ Camera trực tiếp, không nhận upload file có sẵn.
   - Watermark nhúng cứng vào pixel ảnh bằng HTML5 Canvas kèm địa chỉ và tọa độ của đúng cơ sở trước khi gửi lên máy chủ.

