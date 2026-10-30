# 📝 CN03: ĐĂNG KÝ NGUYỆN VỌNG CA TUẦN THEO CƠ SỞ (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Cho phép nhân viên chuỗi Zone Six chủ động gửi nguyện vọng ca làm việc cho tuần kế tiếp tại cơ sở làm việc của mình.
- Thu thập dữ liệu đầu vào chuẩn xác theo từng cơ sở để hệ thống AutoScheduler và Phó ca làm lịch phân bổ ca công bằng.
- Kiểm soát quy trình xếp lịch theo chu kỳ tuần thông qua việc Mở và Khóa cổng đăng ký của từng cơ sở đúng hạn.

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP

| Nghiệp Vụ | `admin_he_thong` | `quan_ly` | `truong_ca` | `pho_ca_lam_lich` | `pho_ca_vat_lieu` | `nhan_vien` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gửi nguyện vọng ca tuần** | ✅ Có quyền | ✅ Có quyền | ✅ Có quyền | ✅ Có quyền | ✅ Có quyền | ✅ Có quyền |
| **Mở / Đóng cổng đăng ký** | ✅ Mọi cơ sở | ✅ Cơ sở phân công | ✅ **Chỉ cơ sở mình** | ✅ **Chỉ cơ sở mình** | ❌ Bị chặn | ❌ Bị chặn |
| **Xem nguyện vọng người khác** | ✅ Toàn chuỗi | ✅ Cơ sở phân công | ✅ **Chỉ cơ sở mình** | ✅ **Chỉ cơ sở mình** | ❌ Chỉ xem mình | ❌ Chỉ xem mình |

- **Giao diện FE:** Route `/schedule/register`.
  - Component: `fe/src/features/scheduling/component/ShiftRegistrationForm.tsx`.
- **Tầng Backend BE:**
  - Route: `be/src/modules/scheduling/routes/registration.routes.ts`
  - Controllers: `register-shift.controller.ts`, `get-registrations.controller.ts`, `toggle-registration-status.controller.ts`.

---

## 3. LOGIC NGHIỆP VỤ & RÀNG BUỘC CỐT LÕI

### 3.1 Quy tắc Đăng ký ca làm theo cơ sở
- **Mọi vai trò đều được đăng ký:** Nhân viên gửi nguyện vọng gắn trực tiếp với cơ sở mình làm việc (`store_id = user.assigned_store_id`).
- **Khung ca trong ngày tại cơ sở:**
  - **Ca Sáng (Shift 1):** 07:00 - 12:30
  - **Ca Chiều (Shift 2):** 12:30 - 18:00
  - **Ca Tối (Shift 3):** 18:00 - 23:00
  - **Ca Full (Full-day):** Đăng ký toàn bộ các ca trong ngày.
- **Chu kỳ đăng ký:** 7 ngày trong tuần từ Thứ Hai đến Chủ Nhật.

### 3.2 Cơ chế Kiểm soát Cổng Đăng ký Theo Cơ Sở (Store-Scoped Open/Lock Gate)
- Đợt mở đăng ký ca được lưu riêng cho từng cơ sở (hoặc theo tuần của từng cơ sở):
  - **Admin:** Mở/khóa cổng đăng ký cho bất kỳ cơ sở nào.
  - **Quản lý:** Mở/khóa cổng đăng ký của các cơ sở mình phụ trách.
  - **Trưởng ca / Phó ca lịch:** Chỉ được mở/khóa cổng đăng ký của **ĐÚNG 1 CƠ SỞ MÌNH**.
- Khi cổng cơ sở ở trạng thái **MỞ (OPEN)**: Nhân viên thuộc cơ sở đó có thể chọn ca và gửi đăng ký.
- Khi cổng cơ sở ở trạng thái **KHÓA (LOCKED)**:
  - Form đăng ký của cơ sở đó chuyển sang chế độ Read-only.
  - Vô hiệu hóa nút gửi, hiển thị cảnh báo: *"Cổng đăng ký ca tuần của cơ sở đã đóng để tiến hành xếp lịch."*

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/scheduling/registrations/status?store_id=...` | Tất cả vai trò | Lấy trạng thái cổng đăng ký theo cơ sở |
| `PUT` | `/api/v1/scheduling/registrations/status` | Admin, Quản lý, Trưởng ca, Phó ca lịch | Đóng hoặc mở cổng đăng ký ca theo cơ sở |
| `POST` | `/api/v1/scheduling/registrations` | Tất cả vai trò | Gửi hoặc cập nhật nguyện vọng ca theo cơ sở |
| `GET` | `/api/v1/scheduling/registrations/my` | Tất cả vai trò | Lấy nguyện vọng ca cá nhân đã đăng ký |
| `GET` | `/api/v1/scheduling/registrations?store_id=...` | Admin, Quản lý, Trưởng ca, Phó ca lịch | Lấy danh sách đăng ký nhân viên theo phạm vi cơ sở |

