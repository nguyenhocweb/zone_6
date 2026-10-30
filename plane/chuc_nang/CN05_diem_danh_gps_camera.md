# 📸 CN05: ĐIỂM DANH CHECK-IN GPS & CAMERA THỰC TẾ KHỚP CƠ SỞ (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Loại bỏ hoàn toàn tình trạng điểm danh hộ, gian lận chấm công hoặc check-in từ xa giữa các chi nhánh.
- Bắt buộc nhân viên có mặt thể lý tại đúng cơ sở Zone Six nơi mình có lịch phân ca trực.
- Tự động tạo bằng chứng pháp lý minh bạch với ảnh chụp thời gian thực được nhúng dấu chìm số kèm tên và tọa độ cơ sở không thể tẩy xóa.

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP
- **Đối tượng sử dụng:** Tất cả 6 vai trò (`admin_he_thong`, `quan_ly`, `truong_ca`, `pho_ca_lam_lich`, `pho_ca_vat_lieu`, `nhan_vien`). Bất kỳ ai có ca trực đều phải thực hiện quy trình này.
- **Quyền xem chi tiết bằng chứng điểm danh:**
  - `admin_he_thong`: Xem được bằng chứng điểm danh của tất cả nhân sự toàn chuỗi hoặc theo từng cơ sở.
  - `quan_ly`: Xem được bằng chứng điểm danh của nhân sự thuộc các cơ sở mình quản lý.
  - `truong_ca`: **Chỉ xem được bằng chứng điểm danh của nhân sự thuộc ĐÚNG 1 CƠ SỞ CỦA MÌNH**.
  - Các vai trò khác: Chỉ xem được lịch sử điểm danh của chính mình.
- **Giao diện FE:**
  - Component: `fe/src/features/scheduling/component/CheckInCameraModal.tsx`, `AttendanceDetailModal.tsx`.
- **Tầng Backend BE:**
  - Route: `be/src/modules/attendance/routes/attendance.routes.ts`
  - Controllers: `check-in.controller.ts`, `get-attendance.controller.ts`
  - Model: `be/src/databases/mongoose/models/attendance.model.ts` (trường `store_id`).

---

## 3. LOGIC NGHIỆP VỤ & RÀNG BUỘC KỸ THUẬT

### 3.1 Bắt buộc Camera Trực Tiếp (Hardware Enforced Camera)
- **Khóa hoàn toàn input chọn file:** Hệ thống không dùng thẻ `<input type="file">`.
- Bắt buộc khởi tạo luồng video trực tiếp từ thiết bị thông qua Web API `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })`.
- Người dùng chỉ có thể bấm nút "Chụp Ảnh Xác Thực" khi hình ảnh trực tiếp từ camera hiển thị trên màn hình.

### 3.2 Đóng Dấu Chìm Vĩnh Viễn Trên Pixel Ảnh (Burn-in Canvas Watermark)
- Khi người dùng bấm chụp, hình ảnh từ `<video>` được vẽ lên `<canvas>` ẩn.
- Hệ thống lập tức ghi đè (Burn-in) trực tiếp lên các pixel ảnh một dải thông tin xác thực màu Obsidian Gold cao cấp:
  1. **Địa chỉ thực tế:** Tên đường phố, phường/xã, quận/huyện lấy từ Reverse Geocoding vị trí GPS hiện tại.
  2. **Mốc thời gian chính xác:** `DD/MM/YYYY HH:mm:ss` (chính xác đến từng giây).
  3. **Tọa độ & Khoảng cách:** Vĩ độ, kinh độ và khoảng cách mét tính đến **cơ sở Zone Six tương ứng ca trực**.
  4. **Con dấu điện tử:** Dòng chữ đóng dấu `ZONE 6 - [TÊN CƠ SỞ] - XÁC THỰC CAMERA & GPS`.
- Ảnh sau khi đóng dấu mới được chuyển thành Base64/Blob và upload lên Cloudinary/S3/Server.

### 3.3 Hai Lớp Ràng Buộc Kiểm Tra (Dual-Gate Validation) Theo Cơ Sở
1. **Kiểm tra Khoảng cách Geofence với đúng cơ sở:**
   - Hệ thống tra cứu cơ sở của ca trực (`shift.store_id`) để lấy tọa độ GPS chuẩn và `geofence_radius_meters` của cơ sở đó (cấu hình tại CN06).
   - Khoảng cách từ tọa độ nhân viên đến tọa độ cơ sở phải $\le$ `allowedRadiusMeters` (mặc định 50m).
   - Nếu nhân viên đứng tại cơ sở A nhưng có ca tại cơ sở B, hệ thống sẽ từ chối điểm danh vì quá xa cơ sở B.
2. **Kiểm tra Khung giờ ca (Thời gian thực tế):**
   - Thời gian điểm danh phải nằm trong khoảng:
     $$\text{Giờ bắt đầu ca} - \text{Phút cho phép trước ca} \le \text{Thời gian thực} \le \text{Giờ bắt đầu ca} + \text{Phút cho phép sau ca}$$

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/attendance/check-in` | Tất cả vai trò | Gửi dữ liệu điểm danh (Ảnh đóng dấu, GPS, ca trực, storeId) |
| `GET` | `/api/v1/attendance/my` | Tất cả vai trò | Lấy lịch sử điểm danh của bản thân |
| `GET` | `/api/v1/attendance/:id` | Admin, Quản lý, Trưởng ca | Xem chi tiết bằng chứng điểm danh (theo phân quyền cơ sở) |
| `GET` | `/api/v1/attendance/shift/:shiftId`| Admin, Quản lý, Trưởng ca | Lấy danh sách điểm danh của ca trực |

