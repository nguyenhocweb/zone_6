# 📋 CN12: HỆ THỐNG POS LIVE ORDER ĐỒNG BỘ THỜI GIAN THỰC & RÀNG BUỘC THEO CA TRỰC (REAL-TIME SHIFT-LOCKED POS)

---

## 1. MỤC TIÊU NGHIỆP VỤ (BUSINESS OBJECTIVES)
- **Đồng bộ đa thiết bị tức thời (Collaborative Real-time Ordering):** Cho phép tất cả nhân viên trong cùng một ca làm việc tại cùng một chi nhánh (ví dụ: 3 nhân viên gồm quầy bar, phục vụ bàn, thu ngân) mở màn hình POS trên các thiết bị khác nhau (iPad, điện thoại, máy POS) và cùng nhìn thấy giỏ hàng cập nhật thời gian thực (< 100ms) khi bất kỳ ai thêm/sửa/xóa món.
- **Ràng buộc an ninh ca trực (Shift Gatekeeper):** Chỉ nhân viên **được xếp ca hôm nay** VÀ **đã thực hiện điểm danh Check-in hợp lệ qua GPS + Camera** tại đúng chi nhánh mới được phép truy cập và thao tác trên POS. Những nhân viên không cùng ca, chưa check-in hoặc khác chi nhánh bị từ chối truy cập tuyệt đối.
- **Thanh toán VietQR động (Dynamic VietQR Engine):** Sinh mã QR ngân hàng chuẩn NAPAS 247 chính xác số tiền và mã hóa đơn để khách quét thanh toán, hỗ trợ xác nhận thanh toán tức thì và làm sạch giỏ hàng trên mọi máy.

---

## 2. PHÂN QUYỀN TRUY CẬP (ACCESS CONTROL & SHIFT GUARD)
- **Nhân viên ca trực (`nhan_vien`, `truong_ca`, `pho_ca_vat_lieu`, `pho_ca_lam_lich`):**
  - Bắt buộc thỏa mãn đồng thời 3 điều kiện:
    1. Giờ hiện tại nằm trong khung giờ ca trực (`shift_config`).
    2. Có tên trong danh sách phân ca ngày hôm nay của chi nhánh (`weekly_schedules` -> `shift_assignments`).
    3. Đã điểm danh Check-in GPS/Camera thành công (`attendances.status === 'VALID'` và chưa Check-out).
- **Quản lý (`quan_ly`) & Admin (`admin_he_thong`):**
  - Quyền Giám sát viên (Supervisor Mode): Có thể chọn xem và can thiệp phiên POS của bất kỳ cơ sở nào thuộc quyền quản lý mà không cần điểm danh ca.

---

## 3. CÁC LUỒNG HOẠT ĐỘNG CHÍNH (KEY WORKFLOWS)

### 3.1. Luồng Khởi Tạo & Gia Nhập Phiên (Join Session)
1. Nhân viên truy cập `/pos`.
2. Frontend gửi request xác thực ca trực `/api/v1/pos/verify-shift`.
3. Nếu hợp lệ:
   - Backend cấp quyền và trả về thông tin ca trực + phiên giỏ hàng hiện tại (`current_cart`).
   - Client thiết lập kết nối WebSocket và gia nhập phòng: `store_<storeId>_shift_<shiftId>`.
4. Nếu không hợp lệ:
   - Trả về lỗi `403 Forbidden` kèm lý do cụ thể (Chưa đến giờ ca / Chưa điểm danh / Khác cơ sở).

### 3.2. Luồng Gọi Món & Đồng Bộ Giỏ Hàng (Live Cart Sync)
1. Nhân viên A bấm chọn `1 Trà đào dầm` + `Thạch đào` (Ghi chú: "Ít đường").
2. Client A gửi socket event: `cart:add_item`.
3. Server cập nhật giỏ hàng trong database/cache và broadcast event `cart:updated` cho toàn bộ nhân viên B và C trong phòng.
4. Màn hình B và C cập nhật thêm món, hiển thị badge: *"Nhân viên A vừa thêm"*.

### 3.3. Luồng Khóa Đơn & Thanh Toán (Lock & Pay)
1. Khách gọi tính tiền: Nhân viên B bấm **"Thanh toán"**.
2. Client B gửi socket event `order:lock_payment`.
3. Server khóa giỏ hàng không cho thêm món mới; broadcast trạng thái `order:locked_by_user` đến A và C.
4. Màn hình B mở Modal mã **VietQR** động (chính xác số tiền và mã đơn).
5. Khách quét mã xong, B bấm **"Xác nhận đã thanh toán"**:
   - Lưu hóa đơn vĩnh viễn vào CSDL (`orders`).
   - Bắn event `order:completed` đến toàn bộ phòng.
   - Giỏ hàng của A, B, C tự động làm sạch và mở khóa sẵn sàng đón lượt khách mới.

---

## 4. DANH SÁCH API ENDPOINTS (REST & WEBSOCKET)

### REST APIs:
- `GET  /api/v1/pos/session/current`: Lấy thông tin ca trực hiện tại và giỏ hàng đang active.
- `POST /api/v1/pos/verify-shift`: Kiểm tra điều kiện ca trực và điểm danh của người dùng.
- `POST /api/v1/pos/orders/checkout`: Xác nhận thanh toán hóa đơn (tiền mặt / VietQR) và lưu lịch sử.
- `GET  /api/v1/pos/orders/history`: Xem lịch sử hóa đơn trong ca của chi nhánh.

### WebSocket Events:
- `pos:join`: Tham gia phòng ca trực.
- `cart:update`: Bắn cập nhật giỏ hàng (thêm/bớt/sửa món/topping).
- `cart:lock`: Tạm khóa đơn để thanh toán.
- `cart:unlock`: Mở khóa đơn nếu khách muốn gọi thêm.
- `cart:clear`: Làm sạch giỏ hàng khi hoàn tất đơn.
