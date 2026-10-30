# ⚙️ CN06: QUẢN LÝ DANH MỤC CƠ SỞ & CẤU HÌNH GPS CHECK-IN (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Quản trị danh mục chuỗi cơ sở (chi nhánh) Zone Six trên toàn hệ thống.
- Thiết lập và cập nhật tọa độ địa lý (GPS) chính xác, bán kính Geofence an toàn cho từng cơ sở độc lập.
- Thiết lập khung thời gian cho phép điểm danh trước và sau giờ bắt đầu ca theo từng cơ sở.
- Cung cấp công cụ phân quyền cơ sở quản lý (Store Scope Assignment) cho tài khoản Quản lý.
- Cung cấp công cụ mô phỏng trực quan và tiện ích kiểm tra khoảng cách thực tế ngay trên thiết bị tới từng cơ sở.

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP

| Vai Trò | Quản Lý Danh Mục Cơ Sở (Thêm/Sửa) | Phân Quyền Cơ Sở Cho User | Cập Nhật GPS & Khung Giờ | Quyền Test Khoảng Cách |
| :--- | :---: | :---: | :---: | :---: |
| `admin_he_thong` | ✅ Toàn quyền mọi cơ sở | ✅ Độc quyền Admin | ✅ Toàn quyền mọi cơ sở | ✅ Có |
| `quan_ly` | ❌ Không có quyền | ❌ Không có quyền | ✅ **Chỉ cơ sở được phân công** | ✅ Có (cơ sở của mình) |
| `truong_ca` | ❌ Bị ẩn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn |
| `pho_ca_lam_lich` | ❌ Bị ẩn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn |
| `pho_ca_vat_lieu` | ❌ Bị ẩn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn |
| `nhan_vien` | ❌ Bị ẩn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn |

- **Giao diện FE:**
  - Route Quản lý cơ sở: `/stores` (chỉ Admin).
  - Route Cấu hình GPS: `/checkin-config` (Admin & Quản lý).
  - Component: `CheckInConfigForm.tsx`, `DistanceTester.tsx`, `ShiftTimelineSimulator.tsx`, `StoreSelector.tsx`.
- **Tầng Backend BE:**
  - Route: `be/src/modules/scheduling/routes/store-config.routes.ts`, `be/src/modules/store/routes/store.routes.ts`
  - Model: `be/src/databases/prisma/schema/store_config.prisma` / `be/src/databases/mongoose/models/store-config.model.ts`

---

## 3. LOGIC NGHIỆP VỤ & CÁC THÔNG SỐ CẤU HÌNH

### 3.1 Quản Trị Danh Mục Chuỗi Cơ Sở (Store Management)
- Thông tin mỗi cơ sở bao gồm:
  - `store_id`: Định danh duy nhất.
  - `store_name`: Tên cơ sở (VD: "Zone Six - Cơ sở Cầu Giấy", "Zone Six - Cơ sở Đống Đa").
  - `store_code`: Mã cơ sở viết hoa ngắn gọn (`Z6-CG`, `Z6-DD`).
  - `address`: Địa chỉ đường phố cụ thể.
  - `is_active`: Trạng thái hoạt động (Đang mở cửa / Tạm dừng).
- **Phân quyền quản lý cơ sở (Admin độc quyền):**
  - Admin chọn tài khoản Quản lý và chọn danh sách các cơ sở được giao (`managed_store_ids`).
  - Tài khoản Quản lý chỉ được điều hành đúng các cơ sở có trong danh sách này.

### 3.2 Thiết lập Tọa độ GPS Từng Cơ Sở
- Bộ chọn cơ sở (Store Selector): Chọn cơ sở cần cấu hình thông số GPS.
- **Vĩ độ (`latitude`) & Kinh độ (`longitude`):** Tọa độ thực tế của cơ sở đã chọn.
- **Tính năng "Lấy vị trí hiện tại":** Bấm nút trên giao diện khi đang đứng tại cơ sở để trình duyệt tự động điền tọa độ chính xác.
- **Tiện ích Test khoảng cách thực tế (Distance Tester):** Đo khoảng cách từ thiết bị đến tọa độ của cơ sở đang chọn.

### 3.3 Bán Kính Quét Cho Phép (Geofence Radius) Theo Cơ Sở
- Các mốc lựa chọn cấu hình: **30m, 50m, 100m, 200m, 500m**.
- Mặc định khuyến nghị: **50m** (đảm bảo nhân viên đã đứng trong không gian cơ sở).

### 3.4 Khung Thời Gian Điểm Danh (Time Window)
- **Cho phép check-in trước giờ vào ca (`earlyCheckInMinutes`):** 10p, 15p, 30p, 45p, 60p, 90p (Mặc định: 30p).
- **Cho phép check-in sau giờ vào ca (`lateCheckInMinutes`):** 15p, 30p, 60p, 120p, 180p (Mặc định: 60p).
- **Thanh mô phỏng trực quan (Timeline ca làm việc):** Trực quan hóa dải màu xanh (khung giờ check-in hợp lệ).

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/stores` | Admin, Quản lý | Lấy danh sách cơ sở trong phạm vi quyền hạn |
| `POST` | `/api/v1/stores` | Admin | Tạo cơ sở mới trong chuỗi |
| `PUT` | `/api/v1/stores/:id` | Admin | Cập nhật thông tin cơ sở |
| `PUT` | `/api/v1/stores/:id/assign` | Admin | Phân quyền danh sách cơ sở cho Quản lý |
| `GET` | `/api/v1/scheduling/store-config?store_id=...` | Admin, Quản lý | Lấy cấu hình GPS & khung giờ của cơ sở |
| `PUT` | `/api/v1/scheduling/store-config` | Admin, Quản lý (cơ sở mình) | Cập nhật tọa độ GPS, bán kính quét & khung giờ |

