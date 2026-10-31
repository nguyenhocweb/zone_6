# CHỨC NĂNG 14: QUẢN LÝ DANH SÁCH HÓA ĐƠN, IN LẠI BILL K80 & HỦY BILL (VOID)

## 📌 1. TỔNG QUAN NGHIỆP VỤ (BUSINESS OVERVIEW)
Chức năng cung cấp trung tâm kiểm soát toàn bộ dòng doanh thu và đơn hàng đã phát sinh trong chuỗi Zone Six:
1. **Theo dõi đa kênh (Multi-Channel Orders):**
   - Hóa đơn phát sinh từ quầy thu ngân (Staff POS).
   - Hóa đơn do khách tự quét mã QR tại bàn (Customer Table QR).
2. **Bộ lọc & Thống kê Tài chính thời gian thực:**
   - Tổng doanh thu thực thu, Tổng số hóa đơn, Số đơn hoàn thành, Số đơn đã hủy/hoàn tiền.
   - Lọc nhanh theo ngày: Hôm nay, Hôm qua, 7 ngày qua, Tháng này, hoặc tùy chọn ngày bắt đầu - kết thúc.
   - Lọc theo phương thức thanh toán: `VIETQR`, `CASH`, `CARD`.
   - Lọc theo trạng thái thanh toán: `COMPLETED`, `PENDING`, `CANCELLED`.
   - Tìm kiếm theo mã hóa đơn, tên khách hàng, số bàn.
3. **In lại hóa đơn K80 (Thermal Receipt Reprint):**
   - Xem trước định dạng hóa đơn chuẩn khổ giấy in nhiệt K80 (80mm).
   - Tối ưu hóa CSS `@media print` để gửi trực tiếp lệnh in tới máy in nhiệt tại quầy bar/quầy thu ngân mà không bị tràn trang.
4. **Hủy hóa đơn có kiểm toán (Void Order with Audit Trail):**
   - Phân quyền: Chỉ cấp Quản lý / Trưởng ca / Admin mới có thẩm quyền hủy hóa đơn.
   - Bắt buộc ghi nhận lý do hủy (Khách đổi ý, pha nhầm món, thu ngân nhập sai thông tin...).
   - Lưu vết người thực hiện hủy (`voided_by_id`, `voided_by_name`, `voided_at`, `void_reason`).

---

## 🏗️ 2. KIẾN TRÚC & MÃ NGUỒN LIÊN QUAN

### 2.1 Backend (Node.js Express + Prisma + MongoDB)
- **Services & Controllers:**
  - `be/src/modules/pos/services/order.list-all.service.ts` (Phân trang, lọc đa điều kiện, tính toán tổng doanh thu và tỷ lệ đơn)
  - `be/src/modules/pos/controllers/order.list-all.controller.ts`
  - `be/src/modules/pos/services/order.void.service.ts` (Kiểm tra điều kiện, ghi nhận lý do hủy bắt buộc, cập nhật trạng thái `CANCELLED`)
  - `be/src/modules/pos/controllers/order.void.controller.ts`
- **API Endpoints:**
  - `GET /api/v1/pos/orders/all` (Authenticated)
  - `POST /api/v1/pos/orders/:id/void` (Authenticated)

### 2.2 Frontend (Next.js 14 App Router)
- **Giao diện Quản Lý Hóa Đơn:**
  - `fe/src/app/orders/page.tsx`
  - `fe/src/features/pos/component/OrderManagementView.tsx` (KPI cards, bộ lọc thời gian & kênh bán, bảng dữ liệu phân trang)
  - `fe/src/features/pos/component/OrderDetailModal.tsx` (Xem chi tiết, in hóa đơn nhiệt K80)
  - `fe/src/features/pos/component/VoidOrderModal.tsx` (Dialog hủy bill bắt buộc lý do)
- **Hook & Service:**
  - `fe/src/features/pos/hook/useOrderManagement.ts`
  - `fe/src/features/pos/service/order-management.service.ts`

