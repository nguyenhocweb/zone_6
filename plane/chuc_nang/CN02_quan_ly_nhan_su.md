# 👥 CN02: QUẢN LÝ NHÂN SỰ & PHÂN BỔ CƠ SỞ ZONE SIX (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Quản lý tập trung toàn bộ danh sách nhân sự của chuỗi cơ sở Zone Six.
- Thực thi cơ chế phân cấp quản lý nghiêm ngặt kết hợp phạm vi cơ sở (Store Scope).
- Phân bổ nhân viên vào từng cơ sở làm việc cố định (`assigned_store_id`), hoặc phân quyền danh sách cơ sở phụ trách cho Quản lý (`managed_store_ids`).
- Tự động hóa quy trình cấp tài khoản nhân viên mới với mật khẩu ngẫu nhiên bảo mật gửi qua email.
- Điều chỉnh linh hoạt mức lương/giờ, vai trò và cơ sở làm việc.

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP

| Vai Trò | Quyền Xem Danh Sách | Quyền Thêm Mới | Quyền Sửa Lương / Vai Trò | Giới Hạn Cấp Bậc & Cơ Sở |
| :--- | :---: | :---: | :---: | :--- |
| `admin_he_thong` | ✅ Toàn chuỗi / Lọc cơ sở | ✅ Toàn quyền | ✅ Toàn quyền | Không giới hạn cấp bậc và cơ sở |
| `quan_ly` | ✅ Các cơ sở được phân công | ✅ Được phép | ✅ Được phép | Chỉ tạo/sửa cấp dưới (`<= truong_ca`) tại các cơ sở mình quản lý |
| `truong_ca` | ⚠️ **Chỉ cấp dưới tại ĐÚNG 1 cơ sở mình** | ⚠️ Được phép | ⚠️ Được phép | Chỉ tạo/sửa Phó ca & NV trong cùng cơ sở của mình |
| `pho_ca_lam_lich` | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | Ẩn menu, redirect về `/schedule` |
| `pho_ca_vat_lieu` | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | Ẩn menu, redirect về `/schedule` |
| `nhan_vien` | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | Ẩn menu, redirect về `/schedule` |

- **Giao diện FE:** Route `/staff`.
  - Component: `fe/src/features/staff/component/StaffListTable.tsx`, `CreateStaffModal.tsx`, `EditStaffModal.tsx`.
- **Tầng Backend BE:**
  - Route: `be/src/modules/user/routes/user.routes.ts`
  - Controllers: `get-users.controller.ts`, `create-user.controller.ts`, `update-user.controller.ts`, `delete-user.controller.ts`.

---

## 3. LOGIC NGHIỆP VỤ & RÀNG BUỘC CỐT LÕI

### 3.1 Bộ Lọc Phân Cấp & Phạm Vi Cơ Sở (Hierarchy & Store Scope Filter)
- Tại tầng Service `getUsersService`:
  - **Nếu là `admin_he_thong`:**
    - Nếu có query `store_id`: Lọc nhân sự theo cơ sở đó.
    - Nếu không có query: Lấy toàn bộ nhân sự toàn chuỗi (hoặc các cơ sở được phân quyền).
  - **Nếu là `quan_ly`:**
    - Tự động áp dụng bộ lọc `assigned_store_id: { $in: currentUser.managed_store_ids }`.
    - Quản lý chỉ nhìn thấy nhân sự thuộc các cơ sở mình được Admin phân công phụ trách.
  - **Nếu là `truong_ca` (RÀNG BUỘC CỨNG):**
    - Tự động áp dụng 2 điều kiện bắt buộc:
      1. Phân cấp: `role: { $in: ['pho_ca_lam_lich', 'pho_ca_vat_lieu', 'nhan_vien'] }`.
      2. Cơ sở: `assigned_store_id: currentUser.assigned_store_id`.
    - **Trưởng ca tuyệt đối không nhìn thấy nhân viên cơ sở khác**, và không nhìn thấy Quản lý hay Admin.

### 3.2 Quy tắc "Không Gán Đồng Cấp Hoặc Lớn Hơn"
- Khi tạo mới hoặc sửa nhân sự:
  - Cấm `quan_ly` chọn vai trò `admin_he_thong` hoặc `quan_ly`.
  - Cấm `truong_ca` chọn vai trò `admin_he_thong`, `quan_ly`, `truong_ca`.
  - Nếu vi phạm, Backend ném lỗi `ForbiddenError("Không có quyền gán vai trò ngang cấp hoặc cao hơn")`.

### 3.3 Phân Bổ Cơ Sở Khi Tạo Nhân Viên Mới
- **Admin tạo nhân sự:** Chọn vai trò, chọn cơ sở làm việc (`assigned_store_id`) từ danh sách tất cả cơ sở. Nếu tạo tài khoản `quan_ly`, tích chọn danh sách cơ sở quản lý (`managed_store_ids`).
- **Quản lý tạo nhân sự:** Dropdown cơ sở chỉ hiển thị các cơ sở mà Quản lý đó được phân quyền quản lý.
- **Trưởng ca tạo nhân sự:** Hệ thống tự động khóa cứng trường cơ sở vào **đúng cơ sở của Trưởng ca** (`assigned_store_id`). Trưởng ca không thể tạo nhân viên cho cơ sở khác.

### 3.4 Cơ chế Tạo Mật Khẩu Ngẫu Nhiên & Bảo Mật Tuyệt Đối
- Trong biểu mẫu Thêm Nhân Viên Mới:
  - **Không yêu cầu người quản lý nhập mật khẩu.**
  - Hệ thống tự động sinh chuỗi mật khẩu ngẫu nhiên độ an toàn cao (8 ký tự gồm chữ hoa, chữ thường, số, ký tự đặc biệt).
  - Mật khẩu được mã hóa và gửi thẳng qua dịch vụ thông báo/email đến nhân viên. Người tạo tài khoản không biết mật khẩu này để đảm bảo tính riêng tư.

### 3.5 Phân trang & Tinh gọn dữ liệu
- Bảng nhân sự hiển thị: Tên nhân viên, Cơ sở làm việc, Vị trí (Barista/Service), SĐT, Mức lương giờ và Ảnh QR. Hỗ trợ phân trang chuẩn: 5, 10, 20, 50 dòng/trang.

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/users` | Admin, Quản lý, Trưởng ca | Lấy danh sách nhân sự lọc theo phân cấp & phạm vi cơ sở |
| `POST` | `/api/v1/users` | Admin, Quản lý, Trưởng ca | Tạo tài khoản nhân viên mới (gán cơ sở, tự sinh pass) |
| `PUT` | `/api/v1/users/:id` | Admin, Quản lý, Trưởng ca | Cập nhật lương, vai trò, cơ sở làm việc |
| `DELETE` | `/api/v1/users/:id` | Admin, Quản lý | Xóa tài khoản nhân viên khỏi hệ thống |

