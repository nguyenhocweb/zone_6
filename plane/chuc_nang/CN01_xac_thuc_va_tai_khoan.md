# 🔑 CN01: XÁC THỰC, HỒ SƠ & THẺ NHÂN VIÊN SỐ (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Cung cấp cơ chế đăng nhập an toàn, tiện lợi cho toàn bộ nhân viên và cấp quản lý của chuỗi Zone Six.
- Quản lý phiên làm việc thông qua JSON Web Token (JWT) lưu tại HttpOnly Cookie và Refresh Token lưu tại MongoDB Atlas.
- **Nạp thông tin phạm vi cơ sở (Store Scope) vào phiên:** Nhận diện người dùng thuộc cơ sở nào, hoặc được quyền quản lý những cơ sở nào.
- Cung cấp Trang Hồ Sơ Cá Nhân chuyên biệt (`/profile`) tích hợp **Thẻ Nhân Viên Số 3D (Zone 6 Digital Staff ID Card)** hiển thị tên cơ sở làm việc và biểu mẫu cập nhật thông tin cá nhân.

---

## 2. PHẠM VI & PHÂN QUYỀN
- **Đối tượng sử dụng:** Tất cả 6 vai trò (`admin_he_thong`, `quan_ly`, `truong_ca`, `pho_ca_lam_lich`, `pho_ca_vat_lieu`, `nhan_vien`).
- **Giao diện FE:**
  - Trang Đăng nhập: `/login`
  - Trang Hồ Sơ Riêng: `/profile`
  - Component: `fe/src/features/auth/component/ZoneSixIdCard.tsx`, `fe/src/features/auth/component/ProfileForm.tsx`
- **Tầng Backend BE:**
  - Route: `be/src/modules/user/routes/auth.routes.ts`
  - Controllers: `login.controller.ts`, `refresh.controller.ts`, `me.controller.ts`, `logout.controller.ts`
  - Model: `be/src/databases/mongoose/models/user.model.ts`

---

## 3. LOGIC NGHIỆP VỤ & RÀNG BUỘC CỐT LÕI

### 3.1 Cơ chế Đăng nhập linh hoạt (Flexible Login)
- **Hỗ trợ 2 tên miền email:** Hệ thống chấp nhận cả đuôi `@zonesix.vn` và `@zone6.vn` (ví dụ: `quanly@zonesix.vn` hoặc `quanly@zone6.vn` đều quy về cùng một tài khoản).
- **Mật khẩu linh hoạt:** Người dùng có thể đăng nhập bằng mật khẩu riêng hoặc mật khẩu hệ thống dự phòng `zone6@2026`.
- **Cơ chế Token & Nạp Phạm Vi Cơ Sở (Store Scope):**
  - `accessToken`: Hạn 15 phút, ký bằng thuật toán HS256, chứa:
    - `userId`: ID tài khoản.
    - `role`: Vai trò người dùng.
    - `email`: Địa chỉ email.
    - `store_scope`:
      - Với `admin_he_thong`: `'ALL'` (quản lý toàn chuỗi) HOẶC danh sách ID các cơ sở được phân quyền `['store_1', 'store_2', ...]`.
      - Với `quan_ly`: Danh sách ID các cơ sở được Admin phân công `['store_1', 'store_2', ...]`.
      - Với `truong_ca`: **Đúng 1 ID cơ sở duy nhất** `'store_1'` (Ràng buộc cứng, không bao giờ là mảng nhiều cơ sở).
      - Với `pho_ca_lam_lich`, `pho_ca_vat_lieu`, `nhan_vien`: Đúng 1 ID cơ sở biên chế `'store_1'`.
  - `refreshToken`: Hạn 7 ngày, lưu vào database MongoDB Atlas (`users.refreshToken`).

### 3.2 Trang Hồ Sơ Cá Nhân Riêng Biệt (Dedicated Profile Page `/profile`)
- **Thiết kế chuyên biệt chia 2 cột:**
  - **Cột Trái (Thẻ Nhân Viên Số):** Thẻ 3D obsidian gold cao cấp, huy hiệu vai trò, chip kim loại vàng 3D, **Tên cơ sở làm việc chính**, mã QR cá nhân dùng để nhận diện nhanh, hiển thị mức lương/giờ cá nhân.
  - **Cột Phải (Form Cập Nhật):** Cho phép người dùng cập nhật Họ tên, Số điện thoại cá nhân và Đổi mật khẩu đăng nhập mới.
- **Đồng bộ thời gian thực:** Khi cập nhật thành công, tự động làm mới `useQuery(['auth', 'me'])` và cập nhật thông tin hiển thị trên Sidebar Header.

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập tài khoản, trả về User Info kèm Store Scope & Cookie Token |
| `POST` | `/api/v1/auth/refresh` | Public (Cookie) | Làm mới Access Token khi hết hạn |
| `GET` | `/api/v1/auth/me` | Authenticated | Lấy thông tin tài khoản hiện tại, thẻ số và phạm vi cơ sở |
| `PUT` | `/api/v1/auth/me` | Authenticated | Cập nhật thông tin cá nhân & đổi mật khẩu |
| `POST` | `/api/v1/auth/logout` | Authenticated | Đăng xuất và vô hiệu hóa Refresh Token |

---

## 5. DỮ LIỆU ĐẦU VÀO & SCHEMA VALIDATION

```typescript
// Zod Schema cập nhật profile
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự").optional(),
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự").optional(),
});
```
