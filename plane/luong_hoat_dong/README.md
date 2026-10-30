# 🔄 BẢN ĐỒ CÁC LUỒNG HOẠT ĐỘNG NGHIỆP VỤ (MULTI-STORE WORKFLOWS)

> **Quy chuẩn bắt buộc:** Mọi tính năng trong chuỗi Zone Six phải tuân thủ đúng thứ tự các bước trong luồng hoạt động tương ứng tại đây. Khi refactor hoặc bổ sung middleware/API, bắt buộc kiểm tra xem luồng có bị đứt gãy hoặc vi phạm phạm vi cơ sở (Store Scope) không.

---

## 1. TỔNG QUAN DANH SÁCH LUỒNG NGHIỆP VỤ

| Mã Luồng | Tên Luồng Nghiệp Vụ | Điểm Bắt Đầu (Trigger) | Điểm Kết Thúc (Result) | File Mô Tả Chi Tiết |
| :---: | :--- | :--- | :--- | :--- |
| **L01** | Xác Thực & Phân Quyền Store Scope | Người dùng nhập email & mật khẩu | Nạp Cookie JWT & Store Scope, lọc Menu | [luong_01_xac_thuc_va_phan_quyen.md](./luong_01_xac_thuc_va_phan_quyen.md) |
| **L02** | Chu Kỳ Xếp Lịch Tuần Theo Cơ Sở | Mở cổng đăng ký cơ sở tuần mới | Lịch cơ sở được duyệt & Xuất Excel | [luong_02_chu_ky_xep_lich_tuan.md](./luong_02_chu_ky_xep_lich_tuan.md) |
| **L03** | Điểm Danh Check-in GPS & Camera Khớp Cơ Sở | Nhân viên đến cơ sở bật Camera | Bản ghi điểm danh khớp Geofence cơ sở | [luong_03_checkin_gps_va_camera.md](./luong_03_checkin_gps_va_camera.md) |
| **L04** | Tích Điểm Danh Trực Tiếp Trên Ô Ca | Trưởng ca/Quản lý nhấp ô ca cơ sở | Trưởng ca chỉ tích ở ĐÚNG 1 cơ sở mình | [luong_04_tich_checkin_truc_tiep.md](./luong_04_tich_checkin_truc_tiep.md) |
| **L05** | Phân Bổ Nhân Sự Vào Cơ Sở & Cấp Pass | Quản lý/Trưởng ca thêm nhân sự | Tài khoản tạo mới gán cơ sở & Gửi email | [luong_05_quan_ly_va_them_nhan_su.md](./luong_05_quan_ly_va_them_nhan_su.md) |
| **L06** | Bắn & Tiếp Nhận Thông Báo Role & Cơ Sở | Sự kiện hệ thống phát sinh tại cơ sở | Lưu vào Collection Role kèm store_id | [luong_06_trung_tam_thong_bao.md](./luong_06_trung_tam_thong_bao.md) |
| **L07** | Quản Lý Cơ Sở, Cấu Hình GPS & Test Geofence | Admin/Quản lý vào trang cấu hình | Danh mục cơ sở cập nhật & Test GPS xong | [luong_07_cau_hinh_va_kiem_tra_gps.md](./luong_07_cau_hinh_va_kiem_tra_gps.md) |
| **L08** | Tính Giờ Công & Hiển Thị Bảng Lương Cơ Sở | Quản lý/Trưởng ca mở bảng lương | Bảng lương lọc theo cơ sở, bảo mật thông tin | [luong_08_xem_va_tinh_bang_luong.md](./luong_08_xem_va_tinh_bang_luong.md) |
| **L09** | Đăng Nhập & Gửi Tin Zalo Bot Theo Cơ Sở | Admin quét mã QR đăng nhập | Zalo Bot gửi tin vào Group Zalo của cơ sở | [luong_09_zalo_bot_gui_thong_bao.md](./luong_09_zalo_bot_gui_thong_bao.md) |

---

## 2. NGUYÊN TẮC THIẾT KẾ LUỒNG (WORKFLOW CONSTITUTION)
1. **Frontend-Backend Contract:** Mọi request đều đi qua lớp Schema Validation Zod ở cả hai đầu và đính kèm `store_id` khi thao tác trên dữ liệu cơ sở.
2. **Kiểm Soát Phạm Vi Cơ Sở (Store Scope Enforcement):** Backend middleware `verifyStoreScope` bắt buộc xác thực người dùng có thẩm quyền trên cơ sở đó trước khi xử lý (Đặc biệt: Trưởng ca bị chặn nếu thao tác ngoài `assigned_store_id`).
3. **Nguyên tắc Optimistic Update:** Các thao tác tương tác thường xuyên (như tích điểm danh trên bảng ca) cập nhật giao diện ngay lập tức cho người dùng, sau đó rollback nếu có lỗi.
4. **Cơ chế Fail-Safe & Audit Log:** Mọi hành động làm thay đổi dữ liệu cốt lõi (sửa lịch, tích check-in, đổi lương) đều ghi nhận dấu vết người thực hiện, cơ sở và thời gian cập nhật.

