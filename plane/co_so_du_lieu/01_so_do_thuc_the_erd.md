# 📐 SƠ ĐỒ QUAN HỆ THỰC THỂ (ERD) & CƠ CHẾ LIÊN KẾT ĐA CƠ SỞ

---

## 1. SƠ ĐỒ THỰC THỂ QUAN HỆ TỔNG THỂ (MERMAID ER DIAGRAM)

```mermaid
erDiagram
    STORE_CONFIG ||--o{ USER : "phân bổ nhân sự"
    STORE_CONFIG ||--o{ WEEKLY_SCHEDULE : "lịch tuần của cơ sở"
    STORE_CONFIG ||--o{ ATTENDANCE : "đối chiếu GPS cơ sở"
    STORE_CONFIG ||--o{ ZALO_CONFIG : "nhiều nhóm Zalo nghiệp vụ"
    STORE_CONFIG ||--o{ REGISTRATION_WINDOW : "mở cổng đăng ký theo cơ sở"

    USER ||--o{ SHIFT_REGISTRATION : "gửi nguyện vọng ca"
    USER ||--o{ SHIFT_ASSIGNMENT : "được xếp ca làm"
    USER ||--o{ ATTENDANCE : "chấm công selfie + GPS"

    WEEKLY_SCHEDULE ||--o{ SHIFT_ASSIGNMENT : "chứa các ca trực"
    SHIFT_ASSIGNMENT ||--o| ATTENDANCE : "xác thực đúng ca làm"

    REGISTRATION_WINDOW ||--o{ SHIFT_REGISTRATION : "thuộc đợt đăng ký"

    STORE_CONFIG {
        ObjectId _id PK
        string store_name UK
        string address
        float latitude
        float longitude
        int allowed_radius_meters
        int early_check_in_minutes
        int late_check_in_minutes
        boolean is_active
    }

    USER {
        ObjectId _id PK
        string user_code UK
        string name
        string email UK
        string password
        string role
        string position
        float hourly_rate
        string qr_code UK
        ObjectId assigned_store_id FK "Cố định 1 cơ sở (Trưởng ca/NV)"
        ObjectId[] assigned_stores "Nhiều cơ sở (Quản lý/Admin)"
        boolean is_active
    }

    WEEKLY_SCHEDULE {
        ObjectId _id PK
        ObjectId store_id FK
        string week_start_date
        string week_range
        string status
        array slots
        array workloads
    }

    SHIFT_ASSIGNMENT {
        ObjectId _id PK
        ObjectId schedule_id FK
        ObjectId user_id FK
        ObjectId store_id FK
        date work_date
        string shift_type
        string start_time
        string end_time
        float planned_hours
        string status
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId store_id FK
        ObjectId assignment_id FK
        date work_date
        datetime check_in_time
        datetime check_out_time
        string photo_url
        string address
        float latitude
        float longitude
        float distance_meters
        boolean is_geofence_valid
        boolean is_shift_valid
        string verification_status
    }

    SHIFT_REGISTRATION {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId store_id FK
        string week_start_date
        array preferred_shifts
    }

    REGISTRATION_WINDOW {
        ObjectId _id PK
        ObjectId store_id FK
        string week_start_date
        boolean is_open
        datetime close_at
    }

    ZALO_CONFIG {
        ObjectId _id PK
        ObjectId store_id FK
        string channel_type "CHECKIN | MATERIAL | SCHEDULE | GENERAL"
        string group_id
        string group_name
        string image_url
        string template_message
        boolean is_active
        datetime last_sent_at
    }
```

---

## 2. PHÂN TÍCH CÁC MỐI QUAN HỆ TRỌNG YẾU

### 2.1 Quan Hệ Giữa Cơ Sở (`store_configs`) và Nhân Sự (`users`)
- **Đối với Trưởng ca (`truong_ca`) & Nhân viên (`nhan_vien`):**
  - **Quan hệ 1 - N nghiêm ngặt (Strict Single Store):** Mỗi nhân viên hoặc trưởng ca bắt buộc có trường `assigned_store_id` trỏ về đúng 1 `StoreConfig._id`.
  - Không tồn tại khái niệm trưởng ca làm việc tại 2 cơ sở cùng lúc.
- **Đối với Quản lý (`quan_ly`):**
  - **Quan hệ N - N (Store Scoping):** Sử dụng trường `assigned_stores: [ObjectId]`. Quản lý được phân công giám sát 1 cơ sở hoặc một danh sách nhiều cơ sở.
- **Đối với Admin hệ thống (`admin_he_thong`):**
  - Quyền Super Admin toàn chuỗi: Nếu `assigned_stores` rỗng hoặc mang cờ `'ALL'`, Admin có quyền điều hành toàn bộ mọi cơ sở trong bảng `store_configs`. Nếu được phân quyền danh sách cụ thể thì giới hạn trong các cơ sở đó.

### 2.2 Quan Hệ Giữa Cơ Sở và Lịch Tuần (`weekly_schedules`)
- Mỗi bản ghi lịch tuần đại diện cho ma trận phân ca của **đúng 1 cơ sở trong 1 tuần cụ thể**.
- Compound Index: `{ store_id: 1, week_start_date: 1 }` đảm bảo mỗi cơ sở chỉ có duy nhất 1 bảng lịch cho mỗi tuần làm việc.
- Trưởng ca của cơ sở nào chỉ được đọc và tinh chỉnh bảng lịch có `store_id == currentUser.assigned_store_id`.

### 2.3 Quan Hệ Giữa Điểm Danh (`attendances`) và Ca Trực (`shift_assignments`)
- Khi nhân viên bấm check-in:
  - Hệ thống ghi nhận `user_id`, `store_id` của ca trực, `latitude`, `longitude` chụp từ thiết bị.
  - Đối chiếu khoảng cách Haversine với tọa độ chuẩn `(latitude, longitude)` trong `store_configs` của đúng cơ sở đó.
  - Lưu kết quả `distance_meters` và `is_geofence_valid = (distance_meters <= allowed_radius_meters)`.
  - Cờ `is_checked_in: true` trên ô ca của `weekly_schedules` được đồng bộ tức thời để phục vụ tính công minh bạch.

### 2.4 Quan Hệ Đa Nhóm Zalo Theo Nghiệp Vụ (`zalo_configs`)
- **Mô hình 1 Cơ Sở - Nhiều Nhóm Zalo Nghiệp Vụ:**
  - Nhằm chống spam và phân luồng thông tin chuẩn xác, 1 cơ sở (`store_id`) được liên kết với **nhiều nhóm Zalo** khác nhau phân loại theo trường `channel_type`:
    1. `channel_type = 'CHECKIN'`: Nhóm chuyên nhận thông báo điểm danh, ảnh selfie xác thực, nhắc nhở ca trực, cảnh báo nhân viên đi trễ hoặc vắng ca.
    2. `channel_type = 'MATERIAL'`: Nhóm chuyên nhận thông báo kho, cảnh báo nguyên vật liệu cạn kiệt (hết đá, hết sữa, hết siro) và đề xuất nhập hàng từ Phó ca vật liệu.
    3. `channel_type = 'SCHEDULE'`: Nhóm chuyên nhận thông báo chu kỳ tuần: mở cổng đăng ký ca, nhắc nhở nộp nguyện vọng và tự động bắn ảnh chụp bảng lịch tuần chính thức khi được duyệt.
    4. `channel_type = 'GENERAL'`: Nhóm trao đổi chung, phổ biến nội quy hoặc thông báo khẩn cấp toàn chi nhánh.
  - **Compound Unique Index:** `{ store_id: 1, channel_type: 1 }` đảm bảo mỗi cơ sở chỉ có duy nhất 1 nhóm Zalo phụ trách cho 1 loại nghiệp vụ.

