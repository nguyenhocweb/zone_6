# CHỨC NĂNG 13: SƠ ĐỒ BÀN & KHÁCH TỰ GỌI MÓN BẰNG MÃ QR ĐỊNH VỊ GPS GEOFENCE (ANTI-TROLL)

## 📌 1. TỔNG QUAN NGHIỆP VỤ (BUSINESS OVERVIEW)
Chức năng cho phép mỗi bàn trong hệ thống quán Zone Six (theo từng khu vực như Tầng 1, Tầng 2, Sân Vườn, Phòng VIP) sở hữu một mã QR độc bản được ký mật mã bảo mật (`qr_token`).

Khi khách hàng ngồi tại bàn và quét mã QR:
1. **Bắt buộc định vị GPS Geofence (Anti-Troll Guard):** Trình duyệt yêu cầu cấp quyền vị trí GPS chính xác. Hệ thống tính toán khoảng cách Haversine từ điện thoại khách đến tọa độ quán.
   - Nếu khách ở xa quán (vượt quá bán kính cho phép, ví dụ $> 30\text{m}$) hoặc cố tình mở QR từ xa ở nhà để gọi troll $\rightarrow$ Màn hình lập tức bị khóa (`GeofenceGuard`) kèm thông báo khoảng cách thực tế và từ chối nhận đơn.
   - Nếu khách ngồi thực tế trong quán $\rightarrow$ Hệ thống tự động xác thực và mở khóa giao diện thực đơn (Customer Menu).
2. **Thực đơn điện tử thông minh (Smart Mobile Menu):**
   - Danh mục món, tìm kiếm nhanh, hình ảnh minh họa sắc nét.
   - Tùy chỉnh khẩu vị: Chọn Size (M / L), Mức đường (0% - 100%), Mức đá (Nóng, 0% - 100%), Topping và Ghi chú pha chế.
3. **Thanh toán linh hoạt tại bàn:**
   - **VietQR Động:** Tạo mã QR ngân hàng động gắn kèm số tiền và nội dung đơn tự động. Khách quét chuyển khoản ngay tại bàn.
   - **Tiền mặt:** Đơn gửi tới quầy Bar, nhân viên mang nước ra bàn và thu tiền.
4. **Cấu hình Quản trị (Admin System):**
   - Lựa chọn chế độ gọi món: `HYBRID` (Song hành), `STAFF_ONLY` (Chỉ quầy thu ngân), `CUSTOMER_SELF_ORDER` (Khách tự gọi tại bàn).
   - Tùy chỉnh bán kính Geofence chống troll (15m, 25m, 30m, 50m, 75m) và bật/tắt chế độ GPS nghiêm ngặt.

---

## 🏗️ 2. KIẾN TRÚC & MÃ NGUỒN LIÊN QUAN

### 2.1 Backend (Node.js Express + Prisma + MongoDB)
- **Database Schema:**
  - `be/src/databases/prisma/schema/table.prisma`: Model `Table` (`table_number`, `zone_name`, `capacity`, `status`, `qr_token`, `store_id`).
  - `be/src/databases/prisma/schema/store_config.prisma`: Bổ sung `orderingMode`, `tableGeofenceRadiusMeters`, `isTableGeofenceStrict`.
  - `be/src/databases/prisma/schema/order.prisma`: Bổ sung `tableId`, `orderSource`, `customerLat`, `customerLng`, `distanceMeters`.
- **Mongoose Models & Schemas:**
  - `be/src/modules/admin_he_thong/table/models/table.model.ts`
  - `be/src/modules/admin_he_thong/table/schemas/table.schema.ts`
- **Repositories & Services:**
  - `be/src/modules/admin_he_thong/table/repositories/table.repository.ts`
  - `be/src/modules/admin_he_thong/table/services/table.create.service.ts` (Tạo HMAC QR Token an toàn)
  - `be/src/modules/admin_he_thong/table/services/table.get.service.ts`
  - `be/src/modules/admin_he_thong/table/services/table.update.service.ts`
  - `be/src/modules/admin_he_thong/table/services/table.delete.service.ts`
  - `be/src/modules/pos/services/table-order.verify.service.ts` (Xác thực GPS Haversine và chính sách quán)
  - `be/src/modules/pos/services/table-order.create.service.ts` (Tạo đơn tại bàn, cập nhật bàn `OCCUPIED`, broadcast WebSocket `pos:new_table_order`)
- **API Endpoints:**
  - `GET /api/v1/pos/table-order/verify?token=...&lat=...&lng=...` (Public)
  - `POST /api/v1/pos/table-order/submit` (Public)
  - `GET /api/v1/tables`, `POST /api/v1/tables`, `PUT /api/v1/tables/:id`, `DELETE /api/v1/tables/:id` (Authenticated)

### 2.2 Frontend (Next.js 14 App Router)
- **Giao diện Khách Quét QR Bàn:**
  - `fe/src/app/order/page.tsx`
  - `fe/src/features/table-order/component/TableOrderView.tsx`
  - `fe/src/features/table-order/component/GeofenceGuard.tsx` (Khóa chống troll GPS)
  - `fe/src/features/table-order/component/CustomerMenu.tsx` (Thực đơn điện tử)
  - `fe/src/features/table-order/component/ItemCustomizerModal.tsx` (Tùy chọn đường/đá/size/topping)
  - `fe/src/features/table-order/component/CustomerCartDrawer.tsx` (Giỏ hàng nổi & thanh toán)
  - `fe/src/features/table-order/component/TableVietQrModal.tsx` (Mã VietQR động tại bàn)
- **Giao diện Quản Lý Bàn & Xuất QR In Mica:**
  - `fe/src/app/tables/page.tsx`
  - `fe/src/features/admin_he_thong/table/component/TableManagementView.tsx`
  - `fe/src/features/admin_he_thong/table/component/TableQrPrintModal.tsx` (Standee mica card, tải ảnh PNG, sao chép link, đổi token mới)
  - `fe/src/features/admin_he_thong/table/component/TableFormModal.tsx`
- **Giao diện Cấu Hình Quản Trị:**
  - `fe/src/features/admin_he_thong/checkin-config/component/CheckinConfigView.tsx` (Cấu hình Ordering Mode & Bán kính Geofence Bàn)

