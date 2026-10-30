# 🤖 CN10: ZALO PERSONAL BOT TỰ ĐỘNG HÓA ĐA CƠ SỞ & ĐA KÊNH NGHIỆP VỤ

---

## 1. MỤC TIÊU TÍNH NĂNG
- Tự động hóa truyền thông nội bộ giữa hệ thống quản lý Zone Six và các nhóm Zalo chuyên biệt của từng cơ sở.
- **Phân luồng thông tin chuyên sâu (Chống spam nhóm chung):** Trong cùng 1 cơ sở, hệ thống chia tách thông báo đến các nhóm Zalo riêng biệt theo từng nghiệp vụ:
  1. **Nhóm Điểm Danh (`CHECKIN`):** Thông báo check-in thành công, ảnh selfie có dấu chìm canvas, cảnh báo đi trễ, vắng ca.
  2. **Nhóm Nguyên Vật Liệu (`MATERIAL`):** Thông báo cảnh báo nguyên liệu cạn kiệt, đề xuất nhập kho từ Phó ca vật liệu.
  3. **Nhóm Lịch Tuần (`SCHEDULE`):** Thông báo mở cổng đăng ký ca, nhắc nhở nộp nguyện vọng và tự động gửi ảnh chụp bảng lịch tuần khi được duyệt.
  4. **Nhóm Trao Đổi Chung (`GENERAL`):** Phổ biến nội quy, trao đổi nội bộ chi nhánh.

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP (ĐỘC QUYỀN ADMIN)

| Vai Trò | Menu Sidebar | Truy Cập Route `/zalo` | Quyền Gọi API `/api/v1/zalo/*` |
| :--- | :---: | :---: | :---: |
| `admin_he_thong` | ✅ **Hiển thị** | ✅ Cho phép toàn quyền | ✅ Toàn quyền cấu hình mọi cơ sở & mọi kênh |
| `quan_ly` | ❌ **Ẩn hoàn toàn** | ❌ Chuyển hướng `/schedule` | ❌ **403 Forbidden** |
| `truong_ca` | ❌ **Ẩn hoàn toàn** | ❌ Chuyển hướng `/schedule` | ❌ **403 Forbidden** |
| `pho_ca_lam_lich` | ❌ **Ẩn hoàn toàn** | ❌ Chuyển hướng `/schedule` | ❌ **403 Forbidden** |
| `pho_ca_vat_lieu` | ❌ **Ẩn hoàn toàn** | ❌ Chuyển hướng `/schedule` | ❌ **403 Forbidden** |
| `nhan_vien` | ❌ **Ẩn hoàn toàn** | ❌ Chuyển hướng `/schedule` | ❌ **403 Forbidden** |

- **Giao diện FE:** Route `/zalo`.
  - Component: `fe/src/features/zalo/component/ZaloManager.tsx`, `ZaloConfigForm.tsx`, `ZaloQrLogin.tsx`.
- **Tầng Backend BE:**
  - Route: `be/src/modules/zalo/routes/zalo.routes.ts`
  - Engine: `be/src/modules/zalo/services/zalo-client.service.ts` (thư viện `zca-js`)
  - Session Store: Mã hóa AES-256-GCM lưu trữ trên MongoDB Atlas.
  - Model: `be/src/databases/mongoose/models/zalo-config.model.ts` (collection `zalo_configs` gắn với `store_id` và `channel_type`).

---

## 3. LOGIC NGHIỆP VỤ & RÀNG BUỘC KỸ THUẬT

### 3.1 Cơ Chế Đăng Nhập & Phiên Hoạt Động (Session Persistence)
- Sử dụng thư viện `zca-js` tương tác trực tiếp với giao diện Zalo Web. Hệ thống chỉ duy trì **1 phiên tài khoản Zalo Bot duy nhất** của Admin để gửi tin nhắn đến các nhóm khác nhau của mọi cơ sở trong toàn chuỗi.
- Admin quét mã QR sinh ra từ backend để xác thực đăng nhập tài khoản Zalo cá nhân.
- Cookie và thông tin phiên Zalo được mã hóa bằng thuật toán **AES-256-GCM** với khóa bí mật hệ thống và lưu trữ an toàn vào database MongoDB Atlas.
- Hệ thống hỗ trợ cơ chế tự động khôi phục phiên (Auto Reconnect) khi backend khởi động lại.

### 3.2 Lưu Trữ Cấu Hình Đa Kênh Nhóm Theo Cơ Sở & Nghiệp Vụ
- Hệ thống lưu trữ các thông số kênh truyền thông phân tách theo bộ đôi `{ store_id, channel_type }` vào collection `zalo_configs`:
  - **Cơ sở liên kết (`store_id`):** Chọn chi nhánh áp dụng.
  - **Kênh nghiệp vụ (`channel_type`):** 1 trong 4 loại: `CHECKIN`, `MATERIAL`, `SCHEDULE`, `GENERAL`.
  - **ID Nhóm Zalo (`group_id`):** Thread ID / Group ID của nhóm Zalo tương ứng với nghiệp vụ đó.
  - **Tên Nhóm Gợi Nhớ (`group_name`):** Tên nhóm để Admin dễ quản lý (VD: *"Zone 6 Q1 - Điểm Danh"*).
  - **URL Hình Ảnh Mặc Định (`image_url`):** Link ảnh bảng lịch của cơ sở hoặc logo quán.
  - **Mẫu Tin Nhắn (`template_message`):** Chuỗi định dạng tin nhắn riêng của từng kênh kèm các biến thay thế `{co_so}`, `{tuan}`, `{ngay}`, `{nhan_vien}`, `{gio_vao}`.
  - **Trạng thái (`is_active`):** Cho phép bật/tắt nhận tin cho từng kênh cụ thể.
- Giao diện Admin cung cấp Store Switcher để chọn cơ sở, sau đó hiển thị 3 - 4 khối cài đặt tương ứng với các kênh nghiệp vụ để Admin dán Group ID và lưu cấu hình.

### 3.3 Cơ Chế Định Tuyến Sự Kiện Tự Động (Auto Event Routing)
- Khi một sự kiện phát sinh trong hệ thống:
  - Sự kiện điểm danh trễ $\rightarrow$ Tìm config `{ store_id, channel_type: 'CHECKIN' }` $\rightarrow$ Bắn tin vào Nhóm Điểm Danh.
  - Sự kiện cảnh báo hết nguyên vật liệu $\rightarrow$ Tìm config `{ store_id, channel_type: 'MATERIAL' }` $\rightarrow$ Bắn tin vào Nhóm Nguyên Liệu.
  - Sự kiện duyệt lịch tuần mới $\rightarrow$ Tìm config `{ store_id, channel_type: 'SCHEDULE' }` $\rightarrow$ Bắn ảnh bảng lịch vào Nhóm Lịch Tuần.

### 3.4 Cơ Chế Bảo Vệ Nghiêm Ngặt "Zero-Trace"
- Đối với tất cả vai trò không phải Admin (`admin_he_thong`):
  - Sidebar và tab điều hướng loại bỏ 100% mục Zalo Bot.
  - Khi cố tình nhập URL `/zalo`, component trả về `null` và kích hoạt hiệu ứng chuyển hướng tức thì (`instant redirect`) về `/schedule`.
  - Không hiển thị bất kỳ màn hình cảnh báo hay dấu vết nào về tính năng này đối với nhân viên và quản lý.

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/zalo/qr` | **Admin Hệ Thống** | Lấy mã QR Base64 để quét đăng nhập Zalo |
| `GET` | `/api/v1/zalo/status` | **Admin Hệ Thống** | Kiểm tra trạng thái kết nối phiên Zalo Web |
| `GET` | `/api/v1/zalo/config?store_id=...` | **Admin Hệ Thống** | Lấy danh sách cấu hình các kênh nhóm Zalo theo cơ sở |
| `PUT` | `/api/v1/zalo/config` | **Admin Hệ Thống** | Cập nhật cấu hình kênh nhóm Zalo (kèm `store_id` & `channel_type`) |
| `POST` | `/api/v1/zalo/send` | **Admin Hệ Thống** | Bắn tin nhắn thử nghiệm hoặc tin nhắn sự kiện theo đúng nhóm kênh |
| `POST` | `/api/v1/zalo/logout` | **Admin Hệ Thống** | Đăng xuất phiên Zalo và hủy session DB |


