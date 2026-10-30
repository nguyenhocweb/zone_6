# 📑 ĐẶC TẢ CHI TIẾT CÁC BẢNG DỮ LIỆU (COLLECTION SPECIFICATIONS)

Tài liệu này quy định chi tiết cấu trúc Schema, kiểu dữ liệu, ràng buộc và các chỉ mục (Indexes) của toàn bộ các bảng trong MongoDB Atlas (`zone_6`).

---

## 1. BẢNG `users` (Tài Khoản & Nhân Sự)

- **Collection:** `users`
- **Mục đích:** Quản lý thông tin đăng nhập, hồ sơ cá nhân, vai trò, mức lương theo giờ và cơ sở làm việc.

| Tên Trường (Field) | Kiểu Dữ Liệu | Ràng Buộc | Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | PK, Auto | Khóa chính của bản ghi |
| `user_code` | `String` | Unique, Uppercase, Index | Mã định danh nội bộ (VD: `Z6-ADMIN`, `Z6-QL01`, `Z6-TC01`, `Z6-NV01`) |
| `name` | `String` | Required, Trim | Họ và tên nhân viên |
| `email` | `String` | Unique, Lowercase, Index | Email đăng nhập hệ thống |
| `password` | `String` | Required | Mật khẩu tài khoản (Plain Text theo yêu cầu dự án không mã hóa) |
| `role` | `String` (Enum) | Index, Default: `nhan_vien` | 1 trong 6 vai trò: `admin_he_thong`, `quan_ly`, `truong_ca`, `pho_ca_lam_lich`, `pho_ca_vat_lieu`, `nhan_vien` |
| `position` | `String` | Default: `service` | Vị trí công việc: `barista`, `service`, `security`, `manager` |
| `hourly_rate` | `Float / Number` | Default: `18000`, Min: 0 | Mức thù lao theo giờ (VNĐ/giờ) phục vụ tính bảng lương |
| `phone` | `String` | Nullable | Số điện thoại liên hệ cá nhân |
| `qr_code` | `String` | Unique, Sparse, Index | Chuỗi mã hóa phục vụ hiển thị mã QR trên thẻ nhân viên số |
| `assigned_store_id` | `ObjectId` | Index, Nullable | **Cơ sở cố định:** Dành cho Trưởng ca và Nhân viên (**Đúng 1 cơ sở duy nhất**) |
| `assigned_stores` | `Array[ObjectId]` | Default: `[]` | **Danh sách cơ sở phụ trách:** Dành cho Quản lý hoặc Admin được phân quyền |
| `is_active` | `Boolean` | Default: `true`, Index | Trạng thái hoạt động của tài khoản |
| `created_at` | `DateTime` | Auto | Thời điểm tạo tài khoản |
| `updated_at` | `DateTime` | Auto | Thời điểm cập nhật cuối cùng |

---

## 2. BẢNG `store_configs` (Cơ Sở & Cấu Hình Định Vị GPS)

- **Collection:** `store_configs`
- **Mục đích:** Lưu trữ danh mục các chi nhánh quán Cafe Zone Six, tọa độ địa lý chuẩn và quy định chấm công.

| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc | Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | PK, Auto | Khóa chính của chi nhánh |
| `store_name` | `String` | Unique, Required | Tên chi nhánh (VD: `Zone Six - Chi Nhánh 1`, `Zone Six - Chi Nhánh 2`) |
| `address` | `String` | Required | Địa chỉ mặt bằng thực tế của chi nhánh |
| `latitude` | `Float / Number` | Required | Vĩ độ GPS chuẩn của quán (lấy từ cảm biến GPS hoặc Google Maps) |
| `longitude` | `Float / Number` | Required | Kinh độ GPS chuẩn của quán |
| `allowed_radius_meters` | `Int / Number` | Default: `50` | Bán kính quét cho phép check-in hợp lệ (30m - 100m) |
| `early_check_in_minutes` | `Int / Number` | Default: `30` | Số phút cho phép chụp ảnh check-in trước giờ bắt đầu ca |
| `late_check_in_minutes` | `Int / Number` | Default: `60` | Số phút tối đa cho phép đến trễ trước khi ca bị khóa điểm danh |
| `zalo_group_id` | `String` | Nullable | ID nhóm Zalo nội bộ của riêng chi nhánh này |
| `is_active` | `Boolean` | Default: `true` | Trạng thái hoạt động của cơ sở |

---

## 3. BẢNG `weekly_schedules` (Bảng Lịch Tuần Theo Cơ Sở)

- **Collection:** `weekly_schedules`
- **Mục đích:** Ma trận phân ca tuần tổng thể của từng cơ sở, quản lý các ô ca (slots) và tải công việc (workloads).

| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc | Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | PK, Auto | Khóa chính bảng lịch |
| `store_id` | `ObjectId` | Required, Index | Cơ sở sở hữu bảng lịch này |
| `week_start_date` | `String` | Required, Index | Ngày Thứ Hai đầu tuần (Định dạng: `YYYY-MM-DD`, VD: `2026-10-19`) |
| `week_range` | `String` | Required | Chuỗi hiển thị khoảng ngày (VD: `19/10/2026 – 25/10/2026`) |
| `status` | `String` (Enum) | Default: `published` | Trạng thái: `draft` (bản nháp đang chỉnh) hoặc `published` (đã duyệt) |
| `slots` | `Array[Object]` | Embedded | Danh sách toàn bộ các ô ca trong tuần: `{ day, shift, role, staff_name, is_checked_in, ... }` |
| `workloads` | `Array[Object]` | Embedded | Thống kê số ca mục tiêu và số ca được giao của từng nhân viên |
| `first_created_at` | `DateTime` | Auto | Thời điểm tạo lịch lần đầu (dùng đối soát quy tắc tạo trước 24h) |
| `created_by_name` | `String` | Nullable | Tên người tạo / duyệt lịch |

---

## 4. BẢNG `shift_assignments` (Chi Tiết Ca Làm Việc Phân Bổ)

- **Collection:** `shift_assignments`
- **Mục đích:** Lưu trữ từng ca làm riêng biệt của từng nhân viên trong từng ngày để tiện truy vấn lịch cá nhân và tính công.

| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc | Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | PK, Auto | Khóa chính của ca trực |
| `schedule_id` | `ObjectId` | FK, Required | Liên kết tới bảng lịch tuần `weekly_schedules` |
| `user_id` | `ObjectId` | FK, Required | Nhân viên được phân ca |
| `store_id` | `ObjectId` | FK, Required | Cơ sở diễn ra ca làm việc |
| `work_date` | `Date` | Required, Index | Ngày diễn ra ca làm việc |
| `shift_type` | `String` (Enum) | Required | Loại ca: `MORNING` (07:00-12:30), `AFTERNOON` (12:30-18:00), `NIGHT` (18:00-23:00) |
| `start_time` | `String` | Required | Giờ bắt đầu (VD: `"07:00"`) |
| `end_time` | `String` | Required | Giờ kết thúc (VD: `"12:30"`) |
| `planned_hours` | `Float / Number` | Default: `5.5` | Số giờ làm lý thuyết của ca |
| `status` | `String` (Enum) | Default: `ASSIGNED` | Trạng thái ca: `ASSIGNED`, `CONFIRMED`, `CANCELLED`, `SWAPPED` |

---

## 5. BẢNG `attendances` (Chấm Công Check-in, GPS & Ảnh Thực Tế)

- **Collection:** `attendances`
- **Mục đích:** Lưu trữ bằng chứng điểm danh thực tế phục vụ minh bạch chấm công và tính lương.

| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc | Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | PK, Auto | Khóa chính bản ghi chấm công |
| `user_id` | `ObjectId` | FK, Required, Index | Nhân viên thực hiện check-in |
| `store_id` | `ObjectId` | FK, Required, Index | Cơ sở được chấm công |
| `assignment_id` | `ObjectId` | FK, Nullable | Ca trực tương ứng trong `shift_assignments` |
| `work_date` | `Date` | Required, Index | Ngày làm việc |
| `check_in_time` | `DateTime` | Required | Thời điểm chụp ảnh check-in thực tế |
| `check_out_time` | `DateTime` | Nullable | Thời điểm kết thúc ca |
| `photo_url` | `String` | Required | Đường dẫn ảnh chụp camera trực tiếp kèm dấu chìm vĩnh viễn |
| `address` | `String` | Default: `""` | Tên đường phố thực tế từ Reverse Geocoding GPS |
| `latitude` | `Float` | Required | Tọa độ vĩ độ thực tế lúc chụp |
| `longitude` | `Float` | Required | Tọa độ kinh độ thực tế lúc chụp |
| `distance_meters` | `Float` | Required | Khoảng cách đường chim bay (Haversine) tới cơ sở |
| `is_geofence_valid` | `Boolean` | Required | `true` nếu `distance_meters <= allowed_radius_meters` |
| `is_shift_valid` | `Boolean` | Required | `true` nếu ca trùng khớp lịch làm |
| `verification_status` | `String` (Enum) | Index | Trạng thái: `VALID`, `WRONG_SHIFT`, `OUT_OF_RANGE`, `LATE`, `MANUAL_APPROVED` |
| `actual_hours` | `Float` | Default: `0` | Tổng số giờ làm thực tế được ghi nhận |
| `hourly_rate_snapshot` | `Float` | Required | Mức lương/giờ đóng băng tại thời điểm làm ca |
| `earned_amount` | `Float` | Default: `0` | Tiền công ca làm: `actual_hours * hourly_rate_snapshot` |

---

## 6. HỆ THỐNG 6 BẢNG THÔNG BÁO THEO ROLE (`notifications_*`)

Gồm: `notifications_truong_ca`, `notifications_quan_ly`, `notifications_admin`, `notifications_pho_ca_lam_lich`, `notifications_pho_ca_vat_lieu`, `notifications_nhan_vien`.

| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc | Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | PK, Auto | Khóa chính thông báo |
| `code` | `String` | Unique, Index | Mã định danh thông báo duy nhất (VD: `NOTIF-20261022-001`) |
| `store_id` | `ObjectId` | Index, Nullable | Cơ sở phát sinh thông báo (Null nếu toàn chuỗi) |
| `type` | `String` (Enum) | Index | Loại thông báo: `UNCHECKED_EXPIRED_SHIFT`, `EMPTY_SLOT_1_DAY`, `SCHEDULE_DEADLINE`... |
| `severity` | `String` (Enum) | Index | Mức độ cảnh báo: `low`, `medium`, `high`, `urgent` |
| `title` | `String` | Required | Tiêu đề thông báo ngắn gọn |
| `message` | `String` | Required | Nội dung chi tiết thông báo |
| `target_role` | `String` | Index | Vai trò đích tiếp nhận thông báo |
| `user_id` | `String` | Nullable, Index | Nhân sự liên quan đến sự kiện |
| `is_read` | `Boolean` | Default: `false`, Index | Trạng thái đã đọc hay chưa (ảnh hưởng tới Badge số đỏ) |
| `created_at` | `DateTime` | Auto | Thời điểm phát sinh thông báo |

---

## 7. BẢNG `zalo_configs` (Cấu Hình Đa Nhóm Zalo Theo Nghiệp Vụ)

- **Collection:** `zalo_configs`
- **Mục đích:** Cấu hình các kênh nhóm Zalo Bot chuyên biệt (Check-in, Nguyên liệu, Lịch tuần, Trao đổi chung) cho từng cơ sở, chống spam thông tin và phân luồng thông báo chính xác.
- **Chỉ mục Compound:** `{ store_id: 1, channel_type: 1 }` (Unique).

| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc | Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | PK, Auto | Khóa chính bản ghi cấu hình |
| `store_id` | `ObjectId` | FK, Required, Index | Cơ sở sở hữu nhóm Zalo này |
| `channel_type` | `String` (Enum) | Required, Index | Loại nhóm nghiệp vụ: `CHECKIN`, `MATERIAL`, `SCHEDULE`, `GENERAL` |
| `group_id` | `String` | Required | Thread ID / Group ID của nhóm Zalo tương ứng |
| `group_name` | `String` | Required | Tên nhóm Zalo gợi nhớ (VD: *"Zone 6 Q1 - Điểm Danh & Check-in"*) |
| `conversation_type` | `String` | Default: `'group'` | Loại hội thoại: `'group'` (Nhóm) hoặc `'user'` (Cá nhân) |
| `image_url` | `String` | Nullable | Link ảnh mẫu hoặc ảnh bảng lịch/logo gửi kèm tin |
| `template_message` | `String` | Required | Mẫu tin nhắn định dạng riêng cho từng kênh |
| `is_active` | `Boolean` | Default: `true` | Bật / Tắt kích hoạt tự động gửi tin vào nhóm này |
| `last_sent_at` | `DateTime` | Nullable | Thời điểm bắn tin tự động gần nhất vào nhóm |
| `created_at` | `DateTime` | Auto | Thời điểm tạo cấu hình |
| `updated_at` | `DateTime` | Auto | Thời điểm cập nhật cuối cùng |

