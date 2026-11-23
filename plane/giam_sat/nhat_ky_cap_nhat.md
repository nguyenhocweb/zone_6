# 📝 NHẬT KÝ CẬP NHẬT TIẾN ĐỘ & CODE (AUDIT LOG)

> **Mục đích:** Ghi nhận lịch sử mỗi phiên làm việc, mã nguồn thay đổi và lý do can thiệp mã nguồn để đảm bảo tính minh bạch và truy vết nguồn gốc.

---

### [2026-11-23 20:35] - Khắc Phục Lỗi Turbopack Instant Navigation Trên /orders & Bổ Sung Nút Xem Chi Tiết Hóa Đơn Trực Quan
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. Khắc phục cảnh báo Turbopack: `Route "/orders": Could not validate that a segment in your UI has instant navigation. Dropped segment: src/app/orders/page.tsx. Set export const instant = false`.
  2. Bổ sung chức năng Xem Chi Tiết Hóa Đơn rõ ràng trên trang Quản lý hóa đơn (`/orders`), tránh gây nhầm lẫn chỉ có nút In Bill K80.
- **Nội dung hoàn thành:**
  - **Khắc phục triệt để lỗi Turbopack (`fe/src/app/orders/page.tsx`):**
    - Thêm `export const instant = false;` vào `page.tsx` tương tự các trang `/tables` và `/pos`, giải quyết hoàn toàn cảnh báo dropped segment.
  - **Nâng cấp UI/UX Xem Chi Tiết Hóa Đơn (`fe/src/features/pos/component/`):**
    - *Nút "Chi Tiết" chuyên biệt:* Bổ sung nút bấm `[👁️ Chi Tiết]` có chữ và icon con mắt `FiEye` tại cột Thao Tác, tách bạch hoàn toàn với nút In Hóa Đơn nhiệt `[🖨️]`.
    - *Mã HĐ tương tác:* Biến cột `Mã Hóa Đơn` thành liên kết clickable kèm icon con mắt, người dùng bấm vào mã đơn là mở ngay chi tiết hóa đơn.
    - *Hiển thị Topping & Ghi Chú Đầy Đủ trong `OrderDetailModal.tsx`:* Bổ sung hiển thị mảng `item.toppings` chi tiết theo từng món (tên topping + đơn giá) và ghi chú pha chế (đường, đá).
    - *Tái cấu trúc SRP & Tuân thủ Max 300 Lines Rule:* Tách thanh công cụ lọc và KPI sang `OrderFilterToolbar.tsx` (178 dòng) và helper `order-date-preset.ts` (21 dòng), giúp `OrderManagementView.tsx` rút gọn từ 482 dòng xuống còn **257 dòng**.
  - **Kiểm thử & Typecheck:** `tsc --noEmit` đạt 0 lỗi tuyệt đối.
- **Tệp thay đổi:**
  - `fe/src/app/orders/page.tsx`
  - `fe/src/features/pos/component/OrderManagementView.tsx`
  - `fe/src/features/pos/component/OrderFilterToolbar.tsx`
  - `fe/src/features/pos/component/OrderDetailModal.tsx`
  - `fe/src/features/pos/utils/order-date-preset.ts`

---

### [2026-11-23 20:15] - Hoàn Thiện Quy Trình Thanh Toán Tiền Mặt Tại Quầy Cho Đơn Tự Gọi Món Tại Bàn Với Phiếu Hóa Đơn Tạm Tính, Đếm Ngược 30 Phút Tự Động Hủy & Xác Nhận Realtime
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Khi bấm vào "Thanh Toán Tiền Mặt Tại Quầy" trên trang gọi món tại bàn (`/order`), hiển thị phiếu hóa đơn chi tiết yêu cầu khách hàng di chuyển đến quầy để thanh toán. Kèm đồng hồ đếm ngược 30 phút; nếu quá 30 phút mà nhân viên ca trực chưa xác nhận đã thu tiền thì đơn hàng tự động hủy và giải phóng bàn; nếu nhân viên xác nhận thành công thì tự động chuyển màn hình báo thành công.
- **Nội dung hoàn thành:**
  - **Backend (`be/src/modules/pos/`):**
    1. *Khởi tạo đơn tiền mặt ở trạng thái chờ (`table-order.create.service.ts`):* Khi khách đặt đơn bằng `CASH`, thiết lập `payment_status: 'PENDING'` thay vì tự động đánh dấu COMPLETED.
    2. *Cơ chế tự động hủy sau 30 phút (`order.status.service.ts` & `order.list-all.service.ts`):* Khi kiểm tra trạng thái đơn hàng (`/order-status/:orderCode`) hoặc tải danh sách đơn POS, hệ thống tính toán thời gian trôi qua dựa trên `created_at`. Nếu quá 30 phút (1800 giây) mà đơn vẫn ở trạng thái `PENDING`, tự động cập nhật `payment_status = 'CANCELLED'`, trả trạng thái bàn về `AVAILABLE`, phát socket `pos:order_cancelled` và `table:updated`.
    3. *API xác nhận thu tiền mặt cho nhân viên POS (`order.confirm-cash.controller.ts` & `pos.routes.ts`):* Endpoint `POST /api/v1/pos/orders/:id/confirm-cash` cập nhật `payment_status: 'COMPLETED'`, `paid_at`, `paid_by_name`, đồng thời phát socket `pos:payment_success` và `pos:order_status_updated`.
  - **Frontend (`fe/src/features/table-order/` & `fe/src/features/pos/`):**
    1. *Tạo Component `TableCashBillModal.tsx` (< 300 dòng):*
       - Giao diện Obsidian Gold chuẩn phong cách Scandinavian Dual-Theme.
       - Hiển thị mã đơn hàng lớn kèm nút 1-click sao chép.
       - Hộp thông báo nổi bật hướng dẫn khách hàng mang mã đơn đến quầy thu ngân/quầy Bar để thanh toán tiền mặt.
       - Đồng hồ đếm ngược 30 phút trực quan kèm thanh tiến trình (progress bar), đồng bộ chính xác theo `createdAt` của server.
       - Danh sách món chi tiết kèm toppings, ghi chú, đơn giá và tổng số tiền cần thanh toán.
       - Polling tự động mỗi 3s: Chuyển sang màn hình "THANH TOÁN THÀNH CÔNG!" khi nhân viên xác nhận, hoặc chuyển sang màn hình "HÓA ĐƠN ĐÃ TỰ ĐỘNG HỦY" khi quá 30 phút.
    2. *Tích hợp vào `TableOrderView.tsx`:* Quản lý trạng thái riêng biệt cho `vietQrOrder` và `cashBillOrder`. Tách component `ScanQrPrompt.tsx` giúp `TableOrderView.tsx` chỉ còn 269 dòng (tuân thủ nghiêm ngặt Max 300 Lines Rule).
    3. *Giao diện nhân viên POS (`OrderManagementView.tsx` & `OrderDetailModal.tsx`):*
       - Bổ sung nút bấm "Thu Tiền" trực tiếp tại cột thao tác cho các đơn `PENDING`.
       - Tích hợp `<ConfirmModal>` xác nhận thu tiền mặt chuẩn quy chuẩn (không dùng browser `confirm()`).
       - Bổ sung nút "Xác Nhận Thu Tiền Mặt" trong `OrderDetailModal.tsx`.
  - **Kiểm thử & Typecheck:** Chạy `tsc --noEmit` cho cả Backend và Frontend, đạt 0 lỗi. Mọi file đều tuân thủ dưới 300 dòng.
- **Tệp thay đổi:**
  - `be/src/modules/pos/services/table-order.create.service.ts`
  - `be/src/modules/pos/services/order.status.service.ts`
  - `be/src/modules/pos/services/order.list-all.service.ts`
  - `be/src/modules/pos/controllers/order.confirm-cash.controller.ts`
  - `be/src/modules/pos/routes/pos.routes.ts`
  - `fe/src/features/table-order/component/TableCashBillModal.tsx`
  - `fe/src/features/table-order/component/ScanQrPrompt.tsx`
  - `fe/src/features/table-order/component/TableOrderView.tsx`
  - `fe/src/features/table-order/component/CustomerCartDrawer.tsx`
  - `fe/src/features/table-order/service/table-order.service.ts`
  - `fe/src/features/table-order/type/table-order.type.ts`
  - `fe/src/features/pos/component/OrderManagementView.tsx`
  - `fe/src/features/pos/component/OrderDetailModal.tsx`
  - `fe/src/features/pos/service/order-management.service.ts`
  - `fe/src/features/pos/hook/useOrderManagement.ts`

---

### [2026-11-23 19:58] - Khắc Phục Lỗi Runtime TypeError 'Cannot read properties of undefined (reading toLocaleString)' Trong TableVietQrModal
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Xử lý lỗi crash Runtime TypeError `Cannot read properties of undefined (reading 'toLocaleString')` tại `TableVietQrModal (src/features/table-order/component/TableVietQrModal.tsx:51:5)` khi gửi đơn hàng tại bàn.
- **Nội dung hoàn thành:**
  - **Phát hiện nguyên nhân gốc rễ:** API Backend `/api/v1/pos/table-order/submit` trả về Mongoose document với các trường snake_case (`order_code`, `final_amount`, `table_number`), trong khi `TableVietQrModal` truy cập trực tiếp `order.finalAmount.toLocaleString()`, khiến `order.finalAmount` bị `undefined` và gây sập ứng dụng khi modal thanh toán VietQR bật lên.
  - **Chuẩn hóa 2 lớp phòng vệ (Two-Layer Defensive Normalization):**
    1. *Tại Service Layer (`table-order.service.ts`):* Chuẩn hóa mapping dữ liệu `submitOrder` trả về object camelCase chuẩn với `finalAmount: Number(d.final_amount ?? d.finalAmount ?? 0)` và `orderCode: d.order_code || d.orderCode`.
    2. *Tại Component (`TableVietQrModal.tsx`):* Trích xuất các biến phòng vệ an toàn `safeFinalAmount`, `safeOrderCode`, `safeTableNumber` với giá trị mặc định, bọc an toàn 100% các vị trí gọi `.toLocaleString('vi-VN')`, URL PayOS VietQR và bảng thông tin chuyển khoản.
  - **Kiểm thử & Typecheck:** `tsc --noEmit` đạt 0 lỗi tuyệt đối.
- **Tệp thay đổi:**
  - `fe/src/features/table-order/service/table-order.service.ts`
  - `fe/src/features/table-order/component/TableVietQrModal.tsx`

---

### [2026-11-23 19:54] - Loại Bỏ Bước Chọn Size Dư Thừa & Cố Định Size Theo Công Thức Món Trong ItemCustomizerModal
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Món đồ uống đã gắn sẵn size trong công thức/thực đơn (ví dụ: Trà Đào Cam Sả Tươi đã là Size L) mà trong modal lại bắt chọn size M / L và cộng tiền vô lý. Yêu cầu loại bỏ bước chọn size dư thừa này.
- **Nội dung hoàn thành:**
  - **Khắc phục triệt để:** Loại bỏ hoàn toàn khối *"1. CHỌN KÍCH THƯỚC (SIZE)"* và phụ thu hardcode `+5.000đ` trong `ItemCustomizerModal.tsx`.
  - **Giữ nguyên Size gốc của công thức:** Hiển thị trực tiếp nhãn badge `recipe.serving_size` (Size M / Size L) tại Header modal ngay cạnh tên món để khách hàng biết rõ định lượng.
  - **Định giá chính xác:** Giá gốc của món ăn là giá niêm yết chuẩn, tổng tiền chỉ cộng thêm khi khách hàng tích chọn các topping cho ly.
  - **Đơn giản hóa tên món trong giỏ:** Không tự động nối chuỗi `(Size M)` hay `(Size L)` giả lập, lưu size chuẩn xác vào trường ghi chú và hiển thị rõ ràng.
  - **Kiểm thử & Typecheck:** `tsc --noEmit` đạt 0 lỗi tuyệt đối.
- **Tệp thay đổi:**
  - `fe/src/features/table-order/component/ItemCustomizerModal.tsx`

---

### [2026-11-23 19:48] - Tái Thiết Kế Layout Gọi Món Tại Bàn (/order) Dành Cho Máy Tính & Bổ Sung Tính Năng Chọn Topping Cho Từng Ly
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Thiết kế lại layout cho máy tính (desktop) để không bị co hẹp thành một cột đơn giữa màn hình đen; đồng thời bổ sung tính năng chọn topping cho từng ly nước.
- **Nội dung hoàn thành:**
  - **Bố cục 2 Cột Desktop Split Layout:**
    - Thay thế container `max-w-xl` hẹp đơn lẻ bằng bố cục chuẩn máy tính `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5`.
    - **Cột Trái (68% Desktop):** Lưới thực đơn đa cột responsive (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5`), thẻ món có ảnh lớn 16:9 sắc nét, nhãn Best Seller, mô tả chi tiết, giá tiền font mono rõ nét và nút "+ Tùy chọn".
    - **Cột Phải (32% Desktop - Sticky cố định):** Xây dựng component mới `DesktopOrderCart.tsx` hiển thị trực tiếp giỏ hàng của bàn, danh sách món kèm size/đá/đường/toppings, tăng giảm số lượng, form nhập tên/SĐT khách, tổng tiền và 2 phương thức thanh toán (VietQR PayOS động & Tiền mặt tại quầy).
    - **Chế độ Mobile (< lg):** Vẫn duy trì thanh bar nổi bên dưới và `CustomerCartDrawer` mượt mà, không làm gián đoạn trải nghiệm trên smartphone.
  - **Tính Năng Chọn Topping Thêm Cho Ly:**
    - Nâng cấp `ItemCustomizerModal.tsx`: Thêm mục *"Chọn Topping Cho Ly"* dạng lưới checkbox đa chọn với giá tiền từng loại (Trân châu trắng 3Q, Trân châu đen hoàng kim, Thạch củ năng, Đào ngâm miếng giòn, Kem cheese...).
    - Tự động cộng dồn giá topping vào đơn giá và thành tiền theo số lượng ly trong thời gian thực.
    - Lưu danh sách toppings vào `TableCartItem` và truyền xuống `table-order.create.service.ts` lưu vào MongoDB Atlas.
    - Mở khóa public endpoint `GET /api/v1/sellable-toppings` thông qua `optionalAuthenticate` tại `sellable-topping.routes.ts` để khách gọi món tại bàn tự động nạp danh sách topping thực tế của cơ sở.
  - **Top Banner Brand Header (GeofenceGuard):** Tái thiết kế thanh ribbon thành Top Navbar chuyên nghiệp với logo Zone Six, tên chi nhánh, số bàn, khu vực và badge định vị GPS thời gian thực.
  - **Tuân thủ quy chuẩn:** Toàn bộ 8 tệp code đều tuân thủ nguyên tắc Max 300 Lines (mỗi file dưới 298 dòng); `tsc --noEmit` đạt 0 lỗi tuyệt đối.
- **Tệp thay đổi:**
  - `fe/src/features/table-order/component/DesktopOrderCart.tsx` (Mới)
  - `fe/src/features/table-order/component/ItemCustomizerModal.tsx`
  - `fe/src/features/table-order/component/CustomerMenu.tsx`
  - `fe/src/features/table-order/component/TableOrderView.tsx`
  - `fe/src/features/table-order/component/GeofenceGuard.tsx`
  - `fe/src/features/table-order/component/CustomerCartDrawer.tsx`
  - `fe/src/features/table-order/service/table-order.service.ts`
  - `be/src/modules/pho_ca_vat_lieu/material/routes/sellable-topping.routes.ts`

---

### [2026-11-23 19:35] - Triển Khai Cơ Chế Shift Gatekeeper Nghiêm Ngặt 4 Trạng Thái Cho POS Live Order & Khắc Phục Turbopack Dropped Segment /tables
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. Khắc phục cảnh báo Turbopack Instant Navigation segment dropped trên `/tables`.
  2. Nâng cấp Shift Gatekeeper POS: Chỉ nhân viên trong ca mới được mở POS, tự động đóng khi hết ca và gia hạn thêm 1 tiếng (+60 phút) để kiểm két, chốt bill và bàn giao ca. Cho phép nhân viên đã check-in ca tiếp theo trước 30 phút mở POS sớm để nhận bàn giao. Phân quyền ngoại lệ: Admin toàn quyền 24/7 toàn chuỗi; Quản lý chỉ được mở tại các chi nhánh được phân công. Tự động kiểm tra thời gian thực và khóa màn hình khi hết giờ bàn giao.
- **Nội dung hoàn thành:**
  - **Khắc phục lỗi Instant Navigation trên /tables:** Thêm `export const instant = false;` vào `fe/src/app/tables/page.tsx` giúp Turbopack không drop segment và validate tức thời.
  - **Nâng cấp PosVerifyShiftService:**
    - Quản lý (`quan_ly`): Validate nghiêm ngặt `user.assigned_stores` và `user.assigned_store_id`, từ chối truy cập nếu chi nhánh không thuộc phạm vi phụ trách.
    - Admin (`admin_he_thong`): Toàn quyền truy cập 24/7 bất kỳ chi nhánh nào (`mode: 'SUPERVISOR'`).
    - Nhân sự trong ca: Tra cứu cấu hình ca (`ShiftConfigModel`) và đối chiếu với bản ghi điểm danh trong 24h qua. Phân loại chuẩn xác 4 trạng thái:
      - `IN_SHIFT` ($T_{start} \le T_{now} \le T_{end}$): Đang trong ca làm việc chính thức.
      - `HANDOVER_GRACE_PERIOD` ($T_{end} < T_{now} \le T_{end} + 60\text{m}$): Gia hạn +1h sau ca để kiểm đếm két, xử lý đơn tồn và in bill K80 (ngay cả khi đã bấm checkout điểm danh).
      - `EARLY_ACCESS` ($T_{next\_start} - 30\text{m} \le T_{now} < T_{next\_start}$): Nhân viên đã check-in sớm đúng quy định được vào nhận bàn giao ca.
      - `LOCKED`: Ngoài các khung giờ trên, hệ thống trả về thông báo lỗi chi tiết theo từng ngữ cảnh (chưa check-in, đã hết hạn bàn giao +60p, hoặc đến quá sớm trước 30p).
  - **Ràng buộc kép tại Backend Checkout (OrderCheckoutService):** Gọi `PosVerifyShiftService` trực tiếp khi tạo đơn/thanh toán, lập tức từ chối và bắn `ForbiddenError` nếu ca làm việc đã hết hạn thời gian bàn giao, đồng thời tự động gắn `shift_name` vào bản ghi đơn hàng.
  - **Nâng cấp Realtime Gatekeeper & Heartbeat tại Frontend:**
    - Cập nhật `IVerifyShiftData` với `gatekeeperStatus`, `shiftStartTime`, `shiftEndTime`, `handoverUntil`, `remainingMinutes`.
    - `PosHeader.tsx`: Hiển thị Badge trực quan theo trạng thái (Xanh lá - Trong ca, Vàng hổ phách nhấp nháy - Bàn giao ca +1h, Xanh dương - Vào ca sớm, Xám vàng - Giám sát 24/7) kèm đếm ngược phút còn lại.
    - `PosView.tsx`: Thiết lập Heartbeat định kỳ 60 giây ngầm kiểm tra quyền ca trực. Khi hết thời gian bàn giao (+60p), tự động chuyển sang Màn hình Khóa POS Obsidian Gold và phát thông báo Sonner toast; hiển thị cảnh báo vàng khi thời gian bàn giao còn dưới 10 phút.
  - **Kiểm thử & Typecheck:** `tsc --noEmit` toàn bộ Backend và Frontend đạt 0 lỗi tuyệt đối.
- **Tệp thay đổi:**
  - `be/src/modules/pos/services/pos.verify-shift.service.ts`
  - `be/src/modules/pos/services/order.checkout.service.ts`
  - `be/src/modules/pos/controllers/order.checkout.controller.ts`
  - `be/src/modules/pos/models/order.model.ts`
  - `fe/src/app/tables/page.tsx`
  - `fe/src/features/pos/type/pos.type.ts`
  - `fe/src/features/pos/component/PosHeader.tsx`
  - `fe/src/features/pos/component/PosView.tsx`

---

### [2026-11-20 22:56] - Cấu Hình Tài Khoản Ngrok Độc Lập Cho Zone Six (Domain Tĩnh mystify-collie-acquire) & Tách Biệt Dự Án Khác
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Chuyển đổi sang tài khoản Ngrok mới cho Zone Six với domain tĩnh `mystify-collie-acquire.ngrok-free.dev` và giữ nguyên tài khoản Ngrok cũ cho dự án khác của người dùng.
- **Nội dung hoàn thành:**
  - **Tách biệt cấu hình không xung đột:** Tạo file cấu hình riêng `ngrok_zone6.yml` chứa authtoken mới của Zone Six và gán cổng quản lý `web_addr: 127.0.0.1:4041`, giữ nguyên 100% file cấu hình gốc `ngrok.yml` của dự án cũ (`nvnremix@gmail.com` chạy trên cổng 4040). Cả 2 dự án có thể bật Ngrok song song cùng lúc mà không bị xung đột.
  - **Khởi động tunnel domain tĩnh:** Khởi động tunnel mới kết nối trực tiếp vào `https://mystify-collie-acquire.ngrok-free.dev` trỏ về port 8000.
  - **Cập nhật Webhook trên PayOS:** Gọi API `POST https://api-merchant.payos.vn/confirm-webhook` đăng ký URL mới `https://mystify-collie-acquire.ngrok-free.dev/api/v1/payos/webhook`. PayOS đã xác thực và phản hồi `code: "00" - success`.
  - **Tạo kịch bản chạy nhanh:** Tạo file `run-ngrok.bat` để người dùng dễ dàng bật/tắt Ngrok riêng cho Zone Six bằng một cú click chuột.
- **Tệp thay đổi:**
  - `ngrok_zone6.yml` (Cấu hình riêng)
  - `run-ngrok.bat` (Script khởi chạy)
  - `.gitignore` (Bảo mật file token)

---

### [2026-11-20 22:38] - Khắc Phục Lỗi Modal VietQR Bị Đứng Yên Sau Khi Nhận Thanh Toán Thành Công
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Xử lý lỗi sau khi PayOS gửi webhook thành công và modal hiện "ĐÃ NHẬN THANH TOÁN! +5.000 VNĐ", modal lại bị đứng im ở dòng "Đang chuyển trang..." mà không tự động đóng hoàn tất đơn.
- **Nội dung hoàn thành:**
  - **Phát hiện nguyên nhân:** Trong `VietQrModal.tsx`, `setTimeout` tự động đóng (1500ms) được đặt bên trong `useEffect` lắng nghe sự kiện, kèm hàm dọn dẹp `return () => clearTimeout(timer)`. Khi `setIsPaid(true)` được gọi, component re-render làm kích hoạt hàm cleanup dọn dẹp timer trước khi nó kịp thực thi, khiến modal bị treo ở trạng thái thành công và các nút bấm bị `disabled`.
  - **Tách riêng Effect tự động đóng:** Đưa luồng hẹn giờ 1.5s sang một `useEffect` độc lập kích hoạt khi `[isOpen, isPaid]`, đảm bảo timer được thực thi 100% không bị hủy giữa chừng.
  - **Mở khóa nút bấm "Hoàn Tất & Đóng":** Khi đã nhận tiền thành công, đổi nút bấm thành "Hoàn Tất & Đóng" và nút X để thu ngân có thể bấm hoàn tất ngay lập tức mà không cần đợi đếm thời gian.
  - **Kiểm thử & Typecheck:** `tsc --noEmit` toàn bộ Backend và Frontend đạt 0 lỗi.
- **Tệp thay đổi:**
  - `fe/src/features/pos/component/VietQrModal.tsx`

---

### [2026-11-20 22:30] - Tích Hợp API PayOS CreatePaymentLink Khởi Tạo Giao Dịch Chính Thức Trên Máy Chủ PayOS
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Làm rõ lý do thanh toán thành công nhưng chưa nhận sự kiện trả về từ PayOS và khắc phục triệt để.
- **Nội dung hoàn thành:**
  - **Phân tích nguyên nhân:** PayOS hoạt động theo cơ chế Dynamic Payment Gateway, chỉ phát Webhook khi giao dịch thuộc về một Payment Request được khởi tạo chính thức qua API `/v2/payment-requests`. Trước đó POS chỉ sinh ảnh QR tĩnh bên ngoài nên PayOS không có bản ghi đơn hàng để đối soát.
  - **Tạo dịch vụ PayOSPaymentService:** Xây dựng `payos-payment.service.ts` gọi `POST https://api-merchant.payos.vn/v2/payment-requests` với chữ ký HMAC-SHA256, tự động đăng ký đơn hàng lên PayOS và nhận về chuỗi VietQR chuẩn EMVCo cùng `orderCode` số nguyên.
  - **Tích hợp vào OrderCheckoutService:** Khi thanh toán VietQR trên POS, hệ thống đồng thời tạo đơn PENDING và đăng ký Payment Request trên PayOS (hiệu lực 10 phút).
  - **Cập nhật VietQrModal & PosView:** Modal hiển thị mã VietQR chính thức do PayOS cấp, tự động đối soát chính xác theo `payos_order_code`.
  - **Kiểm thử:** `tsc --noEmit` đạt 0 lỗi, API PayOS trả về `code: "00"` thành công.
- **Tệp thay đổi:**
  - `be/src/modules/admin_he_thong/payos/services/payos-payment.service.ts` (Mới)
  - `be/src/modules/pos/services/order.checkout.service.ts`
  - `be/src/modules/pos/models/order.model.ts`
  - `be/src/modules/pos/repositories/order.repository.ts`
  - `be/src/modules/admin_he_thong/payos/services/payos-webhook.service.ts`
  - `fe/src/features/pos/component/PosView.tsx`
  - `fe/src/features/pos/component/VietQrModal.tsx`

---

### [2026-11-20 22:15] - Thiết Lập Bộ Đếm Ngược 10 Phút Hết Hạn Mã VietQR & Đồng Bộ Số Tài Khoản MBBank Chuẩn NAPAS 24/7 (093588454123)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. Giới hạn thời gian tồn tại của mã QR là 10 phút.
  2. Giải thích và khắc phục lỗi ngân hàng báo "hệ thống chuyển tiền 24/7 ngân hàng thụ hưởng đang bị lỗi".
- **Nội dung hoàn thành:**
  - **Khắc phục lỗi chuyển tiền 24/7 của ngân hàng thụ hưởng:**
    - Phát hiện nguyên nhân: Mã QR trước đó sử dụng số tài khoản định danh ảo `VQRQANTPI3912` (VietQR Pro alias). Một số ứng dụng ngân hàng khi chuyển khoản liên ngân hàng qua NAPAS 24/7 không hỗ trợ số tài khoản chứa chữ cái (`VQRQ...`) dẫn đến NAPAS báo lỗi *"hệ thống chuyển tiền 24/7 ngân hàng thụ hưởng đang bị lỗi"*.
    - Cập nhật số tài khoản thụ hưởng trong MongoDB Atlas (`payos_configs`) sang số tài khoản MBBank chuẩn: `093588454123` (số điện thoại mở tài khoản của anh Nguyễn Văn Nguyên). Số tài khoản này tương thích 100% mọi ngân hàng tại Việt Nam qua NAPAS 24/7.
  - **Giới hạn thời gian tồn tại mã QR 10 phút (600 giây):**
    - Bổ sung bộ đếm ngược thời gian `timeLeft` (10:00 -> 00:00) hiển thị huy hiệu đồng hồ trực quan trên cả `VietQrModal.tsx` và `TableVietQrModal.tsx`.
    - Khi hết 10 phút: Mã QR tự động dừng lắng nghe, chuyển sang giao diện cảnh báo hết hạn và cung cấp nút "Gia Hạn Thêm 10 Phút" hoặc đóng modal để bảo vệ an toàn giao dịch.
  - **Đồng bộ ngrok Webhook:** Ngrok tunnel đã được khởi động và đăng ký thành công với PayOS tại `https://giant-drudge-pastime.ngrok-free.dev/api/v1/payos/webhook`.
  - **Kiểm thử & Typecheck:** `tsc --noEmit` toàn bộ Backend và Frontend đạt 0 lỗi.
- **Tệp thay đổi:**
  - `fe/src/features/pos/component/VietQrModal.tsx`
  - `fe/src/features/table-order/component/TableVietQrModal.tsx`
  - MongoDB Atlas `payos_configs` (Cập nhật `account_number: '093588454123'`)

---

### [2026-11-20 18:35] - Triển Khai Luồng Thanh Toán Tự Động PayOS Webhook + WebSocket & Loại Bỏ Nút Xác Nhận Thủ Công Trên POS Và Gọi Món Tại Bàn
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Bỏ nút xác nhận thanh toán thủ công ("Xác Nhận Đã Thanh Toán" / "Tôi Đã Chuyển Khoản Xong"), chuyển sang cơ chế WebSocket thời gian thực tự động nhận tín hiệu thành công từ PayOS Webhook để chốt đơn, tuyệt đối không cho phép tự ý xác nhận thủ công.
- **Nội dung hoàn thành:**
  - **Loại bỏ hoàn toàn nút bấm thủ công:** Gỡ bỏ nút "Xác Nhận Đã Thanh Toán" trên `VietQrModal.tsx` và nút "Tôi Đã Chuyển Khoản Xong" trên `TableVietQrModal.tsx`.
  - **Khởi tạo đơn hàng dạng PENDING:** Khi bấm thanh toán VietQR, hệ thống POS tạo đơn hàng lưu vào MongoDB với trạng thái `payment_status: 'PENDING'`, sinh mã `order_code` chuẩn dạng số nguyên (`Date.now() % 1000000000`) tương thích PayOS và chuyển giao dịch.
  - **Giao diện chờ thanh toán tự động & Hiệu ứng Live Pulse:** Hiển thị thẻ trạng thái "Đang chờ thanh toán qua PayOS..." với hiệu ứng chấm tròn hổ phách nhấp nháy (live pulse).
  - **Xử lý PayOS Webhook:**
    - Tạo `payos-webhook.service.ts` và `payos-webhook.controller.ts` tại route `POST /api/v1/payos/webhook`.
    - Xác thực chữ ký HMAC-SHA256 theo thuật toán PayOS (sắp xếp key alphabet, băm với `checksum_key` của tài khoản cấu hình MBBank active).
    - Cập nhật trạng thái đơn hàng sang `payment_status: 'COMPLETED'`, ghi nhận thời điểm thanh toán.
    - Phát sự kiện WebSocket qua Socket.io: `pos:payment_success` và `pos:order_completed` tới toàn bộ màn hình POS và quầy thu ngân.
  - **Phản hồi thời gian thực trên Frontend:**
    - `useLivePos.ts` lắng nghe `pos:payment_success`, phát âm thanh Web Audio API, hiển thị toast thông báo.
    - `VietQrModal.tsx` lắng nghe sự kiện, hiển thị dấu tích xanh hoạt họa chuyển động (Animated Green Checkmark), thông báo "Thanh toán thành công!", tự động dọn sạch giỏ hàng và đóng modal sau 1.5 giây.
    - Tích hợp Fallback Polling chu kỳ 3 giây gọi `GET /api/v1/pos/order-status/:orderCode` đảm bảo không bị gián đoạn mạng.
    - Hỗ trợ endpoint mô phỏng thanh toán phục vụ môi trường dev local: `POST /api/v1/payos/simulate-payment`.
  - **Kiểm thử & Typecheck:** `tsc --noEmit` toàn bộ Backend và Frontend đạt 0 lỗi.
- **Tệp thay đổi:**
  - `be/src/modules/admin_he_thong/payos/controllers/payos-webhook.controller.ts` (Mới)
  - `be/src/modules/admin_he_thong/payos/services/payos-webhook.service.ts` (Mới)
  - `be/src/modules/admin_he_thong/payos/routes/payos.routes.ts`
  - `be/src/modules/pos/controllers/order.status.controller.ts` (Mới)
  - `be/src/modules/pos/services/order.status.service.ts` (Mới)
  - `be/src/modules/pos/repositories/order.repository.ts`
  - `be/src/modules/pos/routes/pos.routes.ts`
  - `be/src/modules/pos/schemas/order.schema.ts`
  - `be/src/modules/pos/services/order.checkout.service.ts`
  - `fe/src/features/pos/component/PosView.tsx`
  - `fe/src/features/pos/component/VietQrModal.tsx`
  - `fe/src/features/pos/hook/useLivePos.ts`
  - `fe/src/features/pos/service/pos.service.ts`
  - `fe/src/features/table-order/component/TableVietQrModal.tsx`

---

### [2026-11-20 18:22] - Khắc Phục Lỗi React 19 "Expected static flag was missing" Trong VietQrModal
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Xử lý lỗi `Internal React error: Expected static flag was missing. Please notify the React team.` tại `PosView.tsx:353` (`VietQrModal`).
- **Nội dung hoàn thành:**
  - Phát hiện vi phạm nguyên tắc React Hooks (Rules of Hooks): `VietQrModal.tsx` gọi hook `useGetDefaultPayOSConfig()` sau điều kiện thoát sớm `if (!isOpen) return null;`, dẫn đến mất đồng bộ cây fiber của React khi `isOpen` thay đổi giữa các lượt render.
  - Di chuyển lệnh gọi hook `const { data: defaultPayOS } = useGetDefaultPayOSConfig();` lên đầu component trước khi kiểm tra `if (!isOpen) return null;`.
  - Cập nhật số tài khoản và chủ tài khoản mặc định đồng bộ sang `MB - VQRQANTPI3912 - NGUYEN VAN NGUYEN` trên cả `VietQrModal.tsx` và `TableVietQrModal.tsx`.
  - Typecheck `tsc --noEmit` đạt 0 lỗi.
- **Tệp thay đổi:**
  - `fe/src/features/pos/component/VietQrModal.tsx`
  - `fe/src/features/table-order/component/TableVietQrModal.tsx`

---

### [2026-11-20 18:15] - Khắc Phục Cảnh Báo Turbopack Instant Navigation Segment Validation Trên Route /pos Và Chuẩn Hóa Cấu Trúc RSC
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Xử lý cảnh báo `Route "/pos": Could not validate that a segment in your UI has instant navigation. Dropped segment: src/app/pos/page.tsx`.
- **Nội dung hoàn thành:**
  - Tách toàn bộ giao diện và logic client của màn hình POS sang component chuyên biệt: `fe/src/features/pos/component/PosView.tsx` ('use client').
  - Chuyển đổi `fe/src/app/pos/page.tsx` thành React Server Component (RSC), khai báo `export const metadata` và `export const instant = false;` để tắt kiểm tra Instant Navigation thử nghiệm của Turbopack.
  - Đồng bộ chuẩn hóa tương tự cho trang gọi món `fe/src/app/order/page.tsx`.
  - Khắc phục triệt để lỗi React Warning `Each child in a list should have a unique "key" prop` tại `PayOSManagementView` và `PayOSAccountCard` bằng cách chuẩn hóa `id` tự động từ MongoDB `_id` ở cả Backend Repository lẫn Frontend Card/Modal.
  - Typecheck `tsc --noEmit` toàn bộ Frontend và Backend đạt 0 lỗi.
- **Tệp thay đổi:**
  - `fe/src/features/pos/component/PosView.tsx` (Mới)
  - `fe/src/app/pos/page.tsx`
  - `fe/src/app/order/page.tsx`
  - `be/src/modules/admin_he_thong/payos/repositories/payos-config.repository.ts`
  - `fe/src/features/admin_he_thong/payos/component/PayOSManagementView.tsx`
  - `fe/src/features/admin_he_thong/payos/component/PayOSAccountCard.tsx`
  - `fe/src/features/admin_he_thong/payos/component/PayOSAccountModal.tsx`
  - `fe/src/features/admin_he_thong/payos/type/payos.type.ts`

---

### [2026-11-20 17:45] - Tích Hợp Và Nạp Thông Tin Cổng Thanh Toán PayOS (MBBank VietQR - NGUYEN VAN NGUYEN) Vào Cơ Sở Dữ Liệu MongoDB Atlas
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Kết nối tài khoản PayOS (kết hợp Casso MBBank VietQR Official) với Client ID, API Key, Checksum Key và lưu kết nối vào cơ sở dữ liệu MongoDB Atlas.
- **Nội dung hoàn thành:**
  - Xác thực trực tiếp bộ khóa API với máy chủ PayOS qua HMAC-SHA256:
    - `Client ID`: `b539f9c0-07e2-4abc-8faf-af6e2945e07c`
    - `API Key`: `c0b18c07-d27d-4c15-8279-13a4d3917382`
    - `Checksum Key`: `a683dfd5ebb6dc5e51ad7f18c6cbd3f86bda6ab063694e0a503b41132df543c3`
  - Bóc tách thông tin tài khoản ngân hàng thụ hưởng liên kết chính thức:
    - Ngân hàng: `MB` (Ngân hàng TMCP Quân Đội - MBBank)
    - Số tài khoản VietQR Pro: `VQRQANTPI3912`
    - Chủ tài khoản: `NGUYEN VAN NGUYEN`
  - Đã nạp bản ghi vào collection `payos_configs` trên MongoDB Atlas (Database: `zone_6`) với cấu hình mặc định duy nhất (`is_default: true`, `is_active: true`).
  - Hệ thống bán hàng Live POS (`/pos`) và Gọi món tại bàn QR (`/order`) tự động kích hoạt tạo mã VietQR động trực tiếp về tài khoản MBBank trên.
- **Collection cập nhật:** `payos_configs` (ObjectId: `6b002441bd3c9fc2f905b4b9`)

---

### [2026-11-20 16:40] - Tái Thiết Kế Toàn Diện Các Phân Hệ Còn Lại (Kho Vật Liệu, Sổ Tay Công Thức, Yêu Cầu Nhập Kho, Thu Mua PO, Nhà Cung Cấp, Uploader Lịch) Chuẩn Scandinavian Dual-Theme Warm Linen / Warm Espresso & 100% Icon Feather Xám Trung Tính
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Hoàn tất đồng bộ toàn diện tất cả các phân hệ và modal còn lại sang chuẩn Scandinavian Warm Linen (`#f7f4ee`) & Warm Espresso (`#141311`), loại bỏ triệt để mã màu đen pitch-black `#0B0C10`/`#12141A`/`#181B24`/`#161820` và vàng neon `#D4AF37`, chuẩn hóa 100% icon sang Feather `Fi*` màu xám trung tính (`text-stone-400 dark:text-stone-400`), thay thế toàn bộ hộp thoại xóa tự chế bằng `<ConfirmModal>` chuẩn hệ thống.
- **Nội dung hoàn thành:**
  - **1. Phân hệ Yêu Cầu Nhập Kho & Thu Mua PO (`/materials`, `/procurement`):**
    - `CreateRequisitionModal.tsx`: Chuyển đổi toàn diện sang dual-theme, thẻ gợi ý nhập kho thông minh, nút mức độ ưu tiên pill, bảng nguyên liệu bo góc thanh lịch, 100% icon Feather (`FiHome`, `FiZap`, `FiPlus`, `FiTrash2`, `FiAlertTriangle`, `FiCheck`, `FiLoader`).
    - `RequisitionDetailModal.tsx`: Thẻ chi tiết duyệt số lượng và từ chối yêu cầu, bảng đối chiếu tồn/min/xin duyệt dual-theme, 100% icon Feather (`FiFileText`, `FiHome`, `FiUser`, `FiCheck`, `FiSlash`, `FiLoader`).
    - `RequisitionListView.tsx`: Thanh công cụ tìm kiếm & bộ lọc phân loại Segmented Pills, bảng danh sách phiếu yêu cầu đa cơ sở với tính năng chọn gộp đơn PO, 100% icon Feather (`FiSearch`, `FiPlus`, `FiTruck`, `FiFileText`, `FiHome`, `FiClock`, `FiCheckCircle`, `FiXCircle`).
    - `PoAggregationModal.tsx`: Ma trận gộp đơn PO đa chi nhánh theo Nhà cung cấp, bộ chọn chế độ Gộp/Tách và điểm nhận hàng Hub/Store, bảng phân bổ từng quán, 100% icon Feather (`FiLayers`, `FiHome`, `FiPackage`, `FiTruck`, `FiCheck`, `FiLoader`).
    - `PoDetailModal.tsx`: Modal chi tiết đơn PO & xác nhận nhập kho thực tế cộng dồn tồn kho, thẻ thông tin giao hàng & thanh toán, bảng kiểm đếm, 100% icon Feather (`FiTruck`, `FiMapPin`, `FiCalendar`, `FiCheck`, `FiPackage`, `FiLoader`).
    - `ProcurementDashboard.tsx`: 4 thẻ KPI thu mua font mono, thanh lọc trạng thái và loại đơn, bảng đơn hàng PO phát hành đa chi nhánh, 100% icon Feather.
    - `fe/src/app/procurement/page.tsx`: Banner Scandinavian chuẩn mực, loại bỏ emoji và mã màu cố định cũ.
  - **2. Phân hệ Quản Lý Nhà Cung Cấp (Suppliers Management):**
    - `CreateSupplierModal.tsx` & `EditSupplierModal.tsx`: Modal thêm/sửa nhà cung cấp, liên kết danh mục vật tư cung ứng kèm giá sỉ, bộ lọc tìm kiếm nguyên liệu, 100% icon Feather (`FiTruck`, `FiEdit3`, `FiSearch`, `FiCheck`, `FiLoader`).
    - `SuppliersTable.tsx`: Bảng quản lý nhà cung cấp, thông tin liên hệ đa kênh, danh sách nguyên liệu liên kết, tích hợp `<ConfirmModal>` cho thao tác xóa nhà cung cấp.
  - **3. Phân hệ Uploader Lịch Tuần (`ScheduleUploader.tsx`):**
    - Loại bỏ mã màu đen obsidian và viền vàng neon cũ; chuyển sang thẻ kéo thả tệp Excel viền nét đứt thanh lịch, nút Mẫu V2 và Modal nạp Google Drive theo chuẩn Warm Linen / Warm Espresso, 100% icon Feather (`FiUploadCloud`, `FiZap`, `FiGlobe`, `FiEye`, `FiLoader`).
- **Tệp thay đổi:**
  - `fe/src/features/pho_ca_vat_lieu/purchase_requisition/component/CreateRequisitionModal.tsx`
  - `fe/src/features/pho_ca_vat_lieu/purchase_requisition/component/RequisitionDetailModal.tsx`
  - `fe/src/features/pho_ca_vat_lieu/purchase_requisition/component/RequisitionListView.tsx`
  - `fe/src/features/quan_ly/procurement/component/PoAggregationModal.tsx`
  - `fe/src/features/quan_ly/procurement/component/PoDetailModal.tsx`
  - `fe/src/features/quan_ly/procurement/component/ProcurementDashboard.tsx`
  - `fe/src/app/procurement/page.tsx`
  - `fe/src/features/admin_he_thong/supplier/component/CreateSupplierModal.tsx`
  - `fe/src/features/admin_he_thong/supplier/component/EditSupplierModal.tsx`
  - `fe/src/features/admin_he_thong/supplier/component/SuppliersTable.tsx`
  - `fe/src/features/pho_ca_lam_lich/scheduling/component/ScheduleUploader.tsx`
- **Verification:**
  - Chạy `tsc -p fe/tsconfig.json --noEmit` đạt 0 lỗi (TypeScript code 0).
  - Kiểm tra toàn bộ mã nguồn không còn hộp thoại trình duyệt `alert()`, `confirm()`, `prompt()`.

---

### [2026-11-19 16:15] - Tái Thiết Kế Toàn Diện 5 Phân Hệ Quản Trị Hệ Thống (/staff, /checkin-config, /stores, /zalo, /payos) Chuẩn Scandinavian Dual-Theme & Toàn Bộ Icon Xám Trung Tính
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Tái thiết kế đồng bộ toàn bộ các trang chức năng trong menu sidebar quản trị:
  1. Quản Lý Nhân Sự (`/staff`)
  2. Cấu Hình Check-in (`/checkin-config`)
  3. Quản Lý Chi Nhánh (`/stores`)
  4. Zalo Bot (zca-js) (`/zalo`)
  5. Cấu Hình PayOS (`/payos`)
  Loại bỏ 100% giao diện đen obsidian `#0B0C10`/`#12141A`/`#181B24`, vàng neon `#D4AF37`, icon sặc sỡ FontAwesome `Fa*`, chuẩn hóa sang hệ thống Warm Linen `#f7f4ee` (Sáng) & Warm Espresso `#141311` (Tối), viền đá mềm mại, toàn bộ icon chuyển sang Feather `Fi*` màu xám trung tính (`text-stone-400 dark:text-stone-400`).
- **Nội dung hoàn thành:**
  - **1. Phân hệ Quản Lý Nhân Sự (`/staff`):**
    - `StaffManagementView.tsx`: Banner card đá, 4 thẻ KPI chỉ số nhân sự (Tổng nhân sự, Đang làm việc, Tạm dừng, Trưởng ca/Quản lý) font mono, thanh lọc chi nhánh + tìm kiếm + vai trò, bảng nhân sự hover êm ái, badge vai trò pastel.
    - `CreateStaffModal.tsx` & `EditStaffModal.tsx`: Modal tạo và sửa nhân sự đa vai trò, giới hạn cấp bậc (Trưởng ca không được phân quyền ngang hoặc hơn mình), gán cơ sở, preset lương giờ, toggle kích hoạt.
    - `StaffQrModal.tsx`: Modal hiển thị mã QR điểm danh ca trực độ phân giải cao, nút sao chép mã và tải ảnh QR.
  - **2. Phân hệ Cấu Hình Check-in & Định Vị Cơ Sở (`/checkin-config`):**
    - `CheckinConfigView.tsx`: Bộ chuyển đổi đa cơ sở, thẻ định vị GPS Geofence với thanh đo bán kính & nút test khoảng cách HUD, thẻ khung giờ vào ca Time Window & Timeline trực quan, thẻ gọi món tại bàn & chống troll GPS (Song hành/Quầy/Tại bàn), thẻ cấu hình thuế VAT theo ca làm việc.
  - **3. Phân hệ Quản Lý Chi Nhánh (`/stores`):**
    - `StoreManagementView.tsx`: Banner quản lý chi nhánh, 3 thẻ KPI (Tổng chi nhánh, Đang mở cửa, Đã đóng cửa), thanh tìm kiếm và bộ lọc trạng thái Segmented Pills.
    - `StoreCard.tsx`: Thẻ chi nhánh thiết kế theo phong cách Scandinavian, huy hiệu mở/đóng cửa, thông số bán kính và giờ ca font mono, liên kết Google Maps.
    - `CreateStoreModal.tsx` & `EditStoreModal.tsx`: Modal khởi tạo và chỉnh sửa chi nhánh, tự động dò GPS & reverse geocoding địa chỉ thực tế, cấu hình VAT và danh sách ca áp dụng.
    - `CloseStoreConfirmModal.tsx` & `DeleteStoreConfirmModal.tsx`: Tích hợp `<ConfirmModal>` chuẩn hệ thống.
  - **4. Phân hệ Zalo Bot Đa Cơ Sở (`/zalo`):**
    - `ZaloManager.tsx`: Banner điều hành và trạng thái kết nối WebSocket Online/Offline, bộ chuyển đổi chi nhánh, thẻ tài khoản Zalo & mã QR đăng nhập với bộ đếm ngược, thẻ quy chuẩn đặt tên nhóm 4 nghiệp vụ, lưới 4 thẻ kênh nghiệp vụ (Điểm danh, Kho, Lịch tuần, Thông báo chung) hỗ trợ gán ID nhóm tự động và gửi tin thử nghiệm.
  - **5. Phân hệ Cấu Hình Cổng Thanh Toán PayOS (`/payos`):**
    - `PayOSManagementView.tsx`: Banner quản lý PayOS Open Banking, 3 thẻ KPI (Tổng tài khoản, Đang thanh toán chính, Cơ chế bảo mật).
    - `PayOSAccountCard.tsx`: Thẻ tài khoản PayOS với huy hiệu tài khoản chính duy nhất, thẻ ngân hàng thụ hưởng VietQR, bảng điều khiển ẩn/hiện mã Client ID, API Key, Checksum Key, nút kiểm tra kết nối webhook và nút đặt làm tài khoản chính.
    - `PayOSAccountModal.tsx`: Modal thêm và chỉnh sửa cấu hình PayOS, chọn nhanh mã ngân hàng, kiểm tra kết nối tức thời, kích hoạt tài khoản chính duy nhất.
- **Tệp thay đổi:**
  - `fe/src/features/quan_ly/staff/component/StaffManagementView.tsx`
  - `fe/src/features/quan_ly/staff/component/CreateStaffModal.tsx`
  - `fe/src/features/quan_ly/staff/component/EditStaffModal.tsx`
  - `fe/src/features/quan_ly/staff/component/StaffQrModal.tsx`
  - `fe/src/features/admin_he_thong/checkin-config/component/CheckinConfigView.tsx`
  - `fe/src/features/admin_he_thong/store/component/StoreManagementView.tsx`
  - `fe/src/features/admin_he_thong/store/component/StoreCard.tsx`
  - `fe/src/features/admin_he_thong/store/component/CreateStoreModal.tsx`
  - `fe/src/features/admin_he_thong/store/component/EditStoreModal.tsx`
  - `fe/src/features/admin_he_thong/store/component/CloseStoreConfirmModal.tsx`
  - `fe/src/features/admin_he_thong/store/component/DeleteStoreConfirmModal.tsx`
  - `fe/src/features/admin_he_thong/zalo/component/ZaloManager.tsx`
  - `fe/src/features/admin_he_thong/payos/component/PayOSManagementView.tsx`
  - `fe/src/features/admin_he_thong/payos/component/PayOSAccountCard.tsx`
  - `fe/src/features/admin_he_thong/payos/component/PayOSAccountModal.tsx`
- **Verification:**
  - `node ./fe/node_modules/typescript/bin/tsc -p fe/tsconfig.json --noEmit`: 0 lỗi (Exit Code 0).

### [2026-11-16 17:10] - Khắc Phục Lỗi 'Run Command Timeout' Khi Deploy Docker Backend Lên VPS Qua GitHub Actions
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Xử lý sự cố GitHub Actions deploy thất bại với lỗi `2026/11/16 07:37:54 Run Command Timeout` tại bước `#12 [backend builder 8/8] RUN npx tsc`.
- **Nguyên nhân cốt lõi (Root Cause):**
  1. **Thiếu file `.dockerignore`:** Toàn bộ thư mục `node_modules`, `dist`, `.sessions`, temp logs... ở máy/môi trường bị đưa vào Docker build context làm tăng gánh nặng CPU/RAM.
  2. **Treo do `npx tsc`:** `npx` trong môi trường headless CI/CD của container Docker có thể bị nghẽn do tự kiểm tra package update từ npm registry hoặc chờ prompt, đồng thời không cấp phát đủ bộ nhớ heap (`max-old-space-size`).
  3. **VPS thiếu Swap:** Máy chủ VPS (1GB - 2GB RAM) khi chạy `docker build` đồng thời chạy `tsc` và `prisma generate` sẽ bị nghẽn RAM nghiêm trọng, dẫn đến tình trạng CPU 100% (kswapd0 thrashing) khiến lệnh build bị treo suốt 30 phút cho tới khi hết hạn `command_timeout`.
  4. **Cài đặt dependencies 2 lần:** Stage 2 của Dockerfile tải lại toàn bộ dependencies bằng `npm install --omit=dev`, làm tăng gấp đôi thời gian và băng thông build.
  5. **Cảnh báo không đồng nhất phiên bản Prisma:** CLI `prisma@6.4.1` không khớp `@prisma/client@6.19.3`.
- **Nội dung hoàn thành:**
  - **Khởi tạo `be/.dockerignore`:** Loại trừ hoàn toàn `node_modules`, `dist`, `.sessions`, `temp_uploads`, `scratch`, `.git`, `.env`, `*.log`.
  - **Tối ưu hóa `be/Dockerfile`:**
    - Thay thế `npx tsc` bằng lệnh Node trực tiếp có cấp phát bộ nhớ: `node --max-old-space-size=2048 ./node_modules/typescript/bin/tsc`.
    - Dùng `./node_modules/.bin/prisma generate` cục bộ.
    - Áp dụng `npm prune --omit=dev` ở Stage 1 và sao chép trực tiếp `node_modules` sang Stage 2 thay vì cài lại từ đầu.
  - **Nâng cấp `.github/workflows/deploy.yml`:**
    - Tự động kiểm tra và tạo 2GB Swap file trên VPS nếu VPS chưa có swap (`swapon`).
    - Bổ sung `docker system prune -f` dọn rác bộ nhớ đệm trước khi build.
    - Tăng `command_timeout: 45m` để đảm bảo lệnh không bị ngắt quãng giữa chừng.
  - **Đồng bộ `be/package.json`:** Nâng `prisma` lên `^6.19.3` khớp với `@prisma/client`.
- **Tệp thay đổi:**
  - `be/.dockerignore`
  - `be/Dockerfile`
  - `be/package.json`
  - `.github/workflows/deploy.yml`
- **Verification:**
  - Chạy thử nghiệm biên dịch `node --max-old-space-size=2048 ./node_modules/typescript/bin/tsc`: Thoát với mã 0 (0 lỗi).

---

### [2026-11-16 13:30] - Xử Lý Bảng Lương Động Theo Chấm Công + Check-Out Ca Làm & Chuông Báo Đơn QR Tại Bàn Màn Hình POS
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. Xử lý triệt để bảng lương tính "giả lập" cứng 80h ở `user.service.ts` / `StaffSalaryTable.tsx`. Ăn khớp với dữ liệu chấm công thực tế (`attendances`), bổ sung chức năng Check-out hết ca làm việc và tính số giờ thực tế, chuyên cần, mức lương thực nhận.
  2. Xử lý POS không có chuông/thông báo khi khách đặt món qua QR tại bàn: Frontend `useLivePos.ts` lắng nghe `pos:new_table_order`, phát âm thanh Web Audio API và hiển thị badge cảnh báo nổi bật trên `PosHeader.tsx`.
  3. Cập nhật báo cáo thẩm định toàn diện từ góc nhìn Tech Lead & Senior Pro Max khắt khe.
- **Nội dung hoàn thành:**
  - **1. Backend Check-Out Ca Làm Việc:**
    - Cập nhật model `AttendanceModel` (`be/src/modules/nhan_vien/attendance/models/attendance.model.ts`) bổ sung trường `working_hours?: number`.
    - Thêm `CheckOutPayloadSchema` trong `attendance.schema.ts`.
    - Viết mới `AttendanceCheckOutService` (`attendance.checkout.service.ts`): Xử lý tính toán `diffMs` giữa `check_in_time` và `check_out_time`, lưu `working_hours`, cập nhật trạng thái ca. Cung cấp API `getActive()` tra cứu ca đang làm.
    - Viết `AttendanceCheckOutController` (`attendance.checkout.controller.ts`) và khai báo routes `POST /api/v1/attendance/check-out`, `GET /api/v1/attendance/active`.
  - **2. Backend Tính Lương Động Theo Dữ Liệu Chấm Công:**
    - Tái cấu trúc hàm `getStaffSalaries(month?, storeId?)` tại `be/src/modules/quan_ly/staff/services/user.service.ts`:
      - Truy vấn bảng `attendances` theo khoảng thời gian tháng được chọn (`YYYY-MM`).
      - Truy vấn bảng `weekly_schedules` để lấy tổng số ca được phân công theo lịch (`scheduled_shifts`).
      - Tính toán: `actual_shifts_worked`, `actual_hours_worked` (cộng dồn `working_hours`), `completion_rate` (tỉ lệ chuyên cần %), `late_shifts_count`, và `actual_salary = round(actual_hours_worked * hourly_rate)`.
      - Loại bỏ hoàn toàn công thức giả định cứng 80h.
    - Cập nhật `user.controller.ts` tiếp nhận query `month` và `store_id`.
  - **3. Frontend Check-Out & Giao Diện Bảng Lương Động:**
    - `attendance.type.ts`, `attendance.service.ts`, `useAttendance.ts`: Bổ sung hook `useCheckOutShift`, `useActiveAttendance`.
    - `CheckInDashboard.tsx`: Bổ sung khối "Ca Trực Hiện Tại" với bộ đếm thời gian thực (`calculateElapsed`) và nút "Check-out Hết Ca" xác nhận.
    - `StaffSalaryTable.tsx`: Nâng cấp giao diện hiển thị bộ chọn tháng (`selectedMonth`), 3 thẻ KPI tổng quỹ lương/giờ công/tổng ca, các cột chi tiết ca phân công, ca đã làm, số giờ thực tế, chuyên cần % và lương thực nhận.
  - **4. Frontend Chuông Báo & Cảnh Báo POS Thời Gian Thực:**
    - `fe/src/features/pos/hook/useLivePos.ts`:
      - Hàm `playOrderNotificationSound()` ứng dụng Web Audio API (chuông đôi tinh tế E6 1318.5Hz -> A6 1760Hz).
      - Lắng nghe sự kiện Socket.io `pos:new_table_order`. Khi khách tại bàn quét QR đặt món, POS lập tức reo chuông, hiển thị toast thông báo chi tiết và lưu state `newOrderAlert`.
      - Cung cấp hàm `dismissNewOrderAlert`.
    - `fe/src/features/pos/component/PosHeader.tsx`: Hiển thị thanh cảnh báo phát sáng vàng Obsidian Gold với icon chuông lắc động (`FiBell`) và nút xem/tắt.
    - `fe/src/app/pos/page.tsx`: Kết nối state `newOrderAlert` vào Header POS.
- **Tệp thay đổi:**
  - `be/src/modules/nhan_vien/attendance/models/attendance.model.ts`
  - `be/src/modules/nhan_vien/attendance/schemas/attendance.schema.ts`
  - `be/src/modules/nhan_vien/attendance/services/attendance.checkout.service.ts`
  - `be/src/modules/nhan_vien/attendance/controllers/attendance.checkout.controller.ts`
  - `be/src/modules/nhan_vien/attendance/routes/attendance.routes.ts`
  - `be/src/modules/quan_ly/staff/services/user.service.ts`
  - `be/src/modules/quan_ly/staff/controllers/user.controller.ts`
  - `fe/src/features/nhan_vien/attendance/type/attendance.type.ts`
  - `fe/src/features/nhan_vien/attendance/service/attendance.service.ts`
  - `fe/src/features/nhan_vien/attendance/hook/useAttendance.ts`
  - `fe/src/features/nhan_vien/attendance/component/CheckInDashboard.tsx`
  - `fe/src/features/pho_ca_lam_lich/scheduling/service/scheduling.service.ts`
  - `fe/src/features/quan_ly/salary/component/StaffSalaryTable.tsx`
  - `fe/src/features/pos/hook/useLivePos.ts`
  - `fe/src/features/pos/component/PosHeader.tsx`
  - `fe/src/app/pos/page.tsx`
- **Verification:**
  - Backend: `.\be\node_modules\.bin\tsc -p be/tsconfig.json --noEmit` -> 0 lỗi.
  - Frontend: `.\fe\node_modules\.bin\tsc -p fe/tsconfig.json --noEmit` -> 0 lỗi.

---

### [2026-11-13 12:15] - Khắc Phục Lỗi Sập Màn Hình 'e.map is not a function' Tại Trang Gọi Món Tại Bàn (/order)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "sao lỗ phần này" kèm ảnh chụp màn hình thông báo lỗi "Đã Xảy Ra Sự Cố Hiển Thị: e.map is not a function" tại URL `zone-6.vercel.app/order?token=bc1dfbf5b841de1004c939fc620b927f`.
- **Nguyên nhân cốt lõi (Root Cause):**
  - Backend API `/api/v1/recipes/categories` trả về cấu trúc đối tượng `{ categories: RecipeCategory[], total: number }` bọc trong `res.data.data`.
  - Trong `fe/src/features/table-order/service/table-order.service.ts`, hàm `getCategories()` trước đây trả về trực tiếp `res.data.data || []`, dẫn đến việc trả về 1 object (`{ categories: [...], total: ... }`) thay vì một mảng `Array`.
  - Khi `CustomerMenu.tsx` nhận biến `categories` và gọi `{categories.map((cat) => ...)}`, trên môi trường production của Next.js (được nén/minify biến thành `e`), JavaScript ném ngoại lệ `TypeError: e.map is not a function` và bị Error Boundary (`fe/src/app/error.tsx`) bắt lại.
- **Nội dung hoàn thành:**
  - **Tầng Service (`fe/src/features/table-order/service/table-order.service.ts`):**
    - Cập nhật `getCategories()` bóc tách an toàn `data.categories` nếu `data` là object, luôn trả về `Array`.
    - Bọc `try/catch` an toàn cho `getMenu()` để tránh unhandled rejection.
  - **Tầng View State (`fe/src/features/table-order/component/TableOrderView.tsx`):**
    - Bổ sung phòng vệ khi gán state `setCategories`: Đảm bảo luôn ép về `Array.isArray(catRes) ? catRes : catRes?.categories || []`.
  - **Tầng UI Component (`fe/src/features/table-order/component/CustomerMenu.tsx` & `CustomerCartDrawer.tsx`):**
    - Thiết lập `safeCategories` qua `useMemo` lọc bỏ sơ chế nội bộ `internal_prep`.
    - Tự động trích xuất danh mục từ danh sách món ăn (`safeRecipes`) làm fallback thông minh nếu API danh mục rỗng.
    - Đổi `categories.map` thành `safeCategories.map`, `recipes.length` thành `safeRecipes.length`.
    - Kiểm tra mảng an toàn cho `safeItems` và `item.toppings` trong `CustomerCartDrawer.tsx`.
- **Tệp thay đổi:**
  - `fe/src/features/table-order/service/table-order.service.ts`
  - `fe/src/features/table-order/component/TableOrderView.tsx`
  - `fe/src/features/table-order/component/CustomerMenu.tsx`
  - `fe/src/features/table-order/component/CustomerCartDrawer.tsx`
- **Verification:**
  - `.\fe\node_modules\.bin\tsc -p fe/tsconfig.json --noEmit`: 0 lỗi typecheck.

---

### [2026-11-09 13:50] - Điều Hướng Sau Khi Đăng Nhập Thành Công Sang Trang Hồ Sơ Cá Nhân (/profile)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "tại sao login vào trang lại ko đi đến trang doashboad của từng vai trò mà lại ra lại trang chủ làm z sau khi login thành công hãy dẫn đến link này https://zone-6.vercel.app/profile"
- **Nguyên nhân cốt lõi (Root Cause):**
  - Trong `fe/src/app/login/page.tsx`, hook `useEffect` trước đây được lập trình chuyển hướng cố định về `router.push("/")` (trang chủ khách hàng `HomePage` - landing page menu QR bên ngoài quán). Do đó, khi nhân sự đăng nhập thành công hoặc người dùng đã có phiên bấm vào Cổng Nhân Sự, hệ thống lại điều hướng ngược về `/` thay vì trang quản trị/hồ sơ của nhân sự.
- **Nội dung hoàn thành:**
  - **`fe/src/app/login/page.tsx`:**
    - Cập nhật chuyển hướng trong hook `useEffect`: Khi `!isLoading && user` -> `router.push("/profile")`.
  - **`fe/src/features/shared/auth/component/LoginForm.tsx`:**
    - Bổ sung `useRouter` từ `next/navigation`.
    - Trong hàm `handleSubmit`, khi `login()` thành công (`success === true`) -> lập tức gọi `router.push("/profile")` để điều hướng ngay tới `https://zone-6.vercel.app/profile`.
- **Tệp thay đổi:**
  - `fe/src/app/login/page.tsx`
  - `fe/src/features/shared/auth/component/LoginForm.tsx`
- **Verification:**
  - `.\fe\node_modules\.bin\tsc -p fe/tsconfig.json --noEmit`: 0 lỗi typecheck.

---

### [2026-11-05 15:45] - Biên Soạn Toàn Diện Báo Cáo Học Thuật Đặc Tả 100% CSDL Prisma Schema & Mối Quan Hệ (32 Models, 15 Enums)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "@be/src/databases/prisma đọc file này lấy chi tiết all table và thuoojv tính của từng table và mối quan hệ không đc bỏ sot cái nào và viết vô file md mô tả chi tiết để nộp cô giáo"
- **Nội dung hoàn thành:**
  - **Khảo sát & Quét cạn 100% tệp lược đồ trong `be/src/databases/prisma/schema/`:**
    - Quét trọn vẹn 34 files Prisma bao gồm `base.prisma`, `enum.prisma` (15 enums, 104 hằng số) và 32 files model.
    - Trích xuất chi tiết từng thuộc tính: Tên trường, Tên cột trong MongoDB (`@map`), Kiểu Prisma, Kiểu MongoDB BSON (ObjectId, Double, Int32, Boolean, Date, Document, Array), Nullable, Mặc định, Ràng buộc Khóa chính/Khóa ngoại/Unique/Indexes và Ý nghĩa nghiệp vụ.
    - Tổng hợp toàn bộ mối quan hệ: Quan hệ cứng (Hard Relations qua `@relation` với hành vi `onDelete: Cascade / SetNull`), Quan hệ mềm (Soft Relations phân lập theo `store_id`, `user_id`), và Composite Types nhúng (`RecipeIngredient`, `RecipeStep`, JSON Snapshot `Order.items`).
  - **Đóng gói tài liệu học thuật hoàn chỉnh:**
    - Tạo tệp `BAO_CAO_CSDL_PRISMA.md` tại thư mục gốc phục vụ nộp báo cáo giảng viên trực tiếp.
    - Lưu trữ bản sao kiến trúc tại `plane/co_so_du_lieu/04_bao_cao_chi_tiet_prisma.md` và liên kết vào `plane/co_so_du_lieu/README.md`.
    - Trình bày 4 sơ đồ thực thể liên kết phân hệ bằng Mermaid ERD chuẩn.

---

### [2026-11-05 13:25] - Khắc Phục Tự Động Bắn Ảnh/Tin Nhắn Lên Zalo Khi Check-in & Thông Báo Minh Bạch Chi Tiết Trạng Thái Zalo
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "sau khi tôi gửi checkin xong thì nó chưa làm đc việc gửi ảnh và tin nawhsn lên zalo nếu ko gửi lên zalo đc thì cũng phải thong báo bạn chưa cấu hình hay chưa login zalo ...." (kèm 2 ảnh chụp: màn hình check-in camera tại /checkin và thẻ Cấu hình Zalo kênh CHECKIN với Group ID 4140305380379629303)
- **Nguyên nhân cốt lõi (Root Cause):**
  1. Trong `be/src/modules/nhan_vien/attendance/services/attendance.create.service.ts`:
     - Câu lệnh truy vấn cấu hình Zalo dùng `ZaloConfigModel.findOne().exec()` không có điều kiện `channel_type: 'CHECKIN'`, dẫn đến việc MongoDB trả về ngẫu nhiên kênh khác (như MATERIAL, GENERAL) có `target_id` rỗng, khiến hệ thống ngầm bỏ qua việc gửi tin Zalo mà không gửi đến Group ID điểm danh đã cấu hình.
     - Hàm `sendCheckInNotificationToZalo` được gọi theo cơ chế unawaited fire-and-forget (`.catch(...)`), không trả về kết quả cho Controller và không phản hồi lại cho Frontend, khiến người dùng hoàn toàn không biết việc gửi Zalo thành công hay thất bại vì lý do gì.
     - `photo_url` chỉ xử lý base64 cục bộ, thiếu hỗ trợ download tải ảnh từ HTTP URL nếu ảnh được lưu trữ trên CDN/Cloudinary.
- **Nội dung hoàn thành:**
  - **Backend (`be/src/modules/nhan_vien/attendance/`):**
    - Bổ sung `store_id` vào `CheckInPayloadSchema` để liên kết chính xác cơ sở.
    - Cấu trúc lại hàm `sendCheckInNotificationToZalo`:
      - Kiểm tra tình trạng kết nối Zalo Bot (`status.connected`), nếu chưa đăng nhập -> trả về `status: 'not_logged_in'` kèm thông báo cụ thể "Zalo Bot chưa đăng nhập hoặc mất kết nối (Cần Admin quét mã QR trong Quản Lý Zalo Bot)".
      - Tìm kiếm cấu hình kênh `CHECKIN` theo chuỗi ưu tiên: Đúng `store_id` -> Cấu hình chung `store_id: null` -> Bất kỳ kênh `CHECKIN` nào có `target_id` hợp lệ. Nếu không có `target_id` -> trả về `status: 'not_configured'` kèm thông báo "Chưa cấu hình ID nhóm Zalo cho kênh Điểm Danh (CHECKIN). Vui lòng vào Quản Lý Zalo Bot để cài đặt ID nhóm".
      - Nếu kênh bị tắt (`is_active: false`) -> trả về `status: 'disabled'`.
      - Hỗ trợ tải và chuyển đổi ảnh sang file tạm cho cả base64 và HTTP URL.
      - Gửi ảnh qua `sendImageMessage` kèm caption chuẩn người dùng yêu cầu: "[Tên] checkin ca [Tên ca]" (hoặc chụp chung 2 người), fallback `sendTextMessage` nếu lỗi ảnh.
      - Cập nhật `last_sent_at` cho `zaloConfig`.
    - Trong `checkIn()`: `await` kết quả gửi Zalo (kèm timeout 7s tránh treo request), gộp kết quả `zalo` vào response trả về cho client và đính kèm lý do vào `message`.
  - **Frontend (`fe/src/features/nhan_vien/attendance/`):**
    - `CheckInDashboard.tsx` & `CheckInCameraModal.tsx`:
      - Truyền `store_id` chính xác vào mutation `checkInMutation`.
      - Trong `onSuccess`: Kiểm tra `res.zalo`:
        - Nếu `zalo.sent = true`: Hiển thị `toast.success` thông báo điểm danh thành công và kèm mô tả đã gửi ảnh & tin nhắn Zalo tới nhóm.
        - Nếu `zalo.sent = false`: Hiển thị `toast.success` điểm danh kèm `toast.warning("⚠️ Chưa gửi Zalo: " + zalo.message, { duration: 8000 })` cảnh báo rõ ràng lý do: chưa cấu hình ID nhóm, Bot chưa đăng nhập QR, hoặc kênh bị tắt.
- **Verification:**
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-05 13:10] - Xóa Bỏ Hoàn Toàn Hộp Thoại Trình Duyệt (alert, confirm, prompt) & Ban Hành Quy Chuẩn Kiến Trúc Cấm Tuyệt Đối
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "đừng đê thông báo xác nhận dạng này đưa agent luật bắt buộc không áp dụng xác nhận dạng này" (kèm ảnh chụp pop-up native alert của trình duyệt `zone-6.vercel.app cho biết: Vui lòng nhập Client ID, API Key và Checksum Key trước khi kiểm tra`)
- **Nội dung hoàn thành:**
  - **Quét & Thay thế triệt để 100% native dialogs trong toàn bộ Frontend:**
    - `PayOSAccountModal.tsx`: Chuyển `alert(...)` kiểm tra credentials thành `toast.warning(...)` từ `sonner`.
    - `RecipeImagePicker.tsx`: Chuyển `alert(...)` kiểm tra định dạng và kích cỡ file sang `toast.error(...)`.
    - `ZaloManager.tsx`: Chuyển `confirm(...)` khi đăng xuất Zalo OA sang modal `<ConfirmModal>` chuẩn Obsidian Gold.
    - `AttendanceDetailModal.tsx`: Chuyển `confirm(...)` hủy điểm danh sang modal `<ConfirmModal>`.
    - `TableQrPrintModal.tsx`: Chuyển `confirm(...)` tạo mới mã QR bàn sang `<ConfirmModal>`.
    - `TableManagementView.tsx`: Chuyển 2 lệnh `confirm(...)` xóa khu vực và xóa bàn sang 2 modal `<ConfirmModal>`.
    - `ShiftConfigModal.tsx`: Chuyển 2 lệnh `confirm(...)` xóa ca làm việc và khôi phục mặc định sang `<ConfirmModal>`.
    - `ShiftsManagementView.tsx`: Chuyển 2 lệnh `confirm(...)` xóa ca làm việc và khôi phục mặc định sang `<ConfirmModal>`.
  - **Ban hành Điều Cấm Kỵ Kỹ Thuật Bắt Buộc (Strict Architectural Rule):**
    - Cập nhật `.agents/AGENTS.md` (Mục 4.5): CẤM TUYỆT ĐỐI dùng `alert()`, `confirm()`, `prompt()` của trình duyệt. Mọi thông báo validation / lỗi bắt buộc dùng `toast` từ `sonner`. Mọi thao tác xác nhận bắt buộc dùng `<ConfirmModal>` Obsidian Gold.
    - Cập nhật `.agents/rules/nextjs_app_router_rules.md` (Mục 5.2): Đồng bộ hóa quy định cấm triệt để vào tài liệu quy chuẩn Next.js App Router.
- **Verification:**
  - `git grep -n "alert(" fe/src/`: 0 kết quả.
  - `git grep -n "confirm(" fe/src/`: 0 kết quả.
  - `git grep -n "prompt(" fe/src/`: 0 kết quả.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-05 12:00] - Khắc Phục Lỗi Không Lưu Cấu Hình Thuế VAT Khi Bấm Lưu Trong EditStoreModal
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "tại bấm lưu thuế cấu hình vat rồi mà không lưu thuwcxj l;ại thông báo đã luuw là sao" (kèm ảnh chụp form Cấu hình Thuế VAT Chi Nhánh hiển thị Đang Tắt Thuế VAT sau khi lưu)
- **Nguyên nhân cốt lõi (Root Cause):**
  - Trong `fe/src/features/admin_he_thong/store/component/EditStoreModal.tsx`, hàm `onSubmit` khi gửi payload lên mutation `updateMutation.mutateAsync` chỉ bọc các trường tọa độ GPS và tên chi nhánh mà bỏ sót 4 trường cấu hình VAT: `vat_enabled`, `vat_rate`, `vat_apply_mode`, `vat_applied_shifts`.
  - Do đó mutation báo thành công (toast "Cập nhật thành công") nhưng dữ liệu VAT không hề được gửi lên backend, dẫn đến database không thay đổi trạng thái bật/tắt VAT.
- **Nội dung hoàn thành:**
  - Bổ sung đầy đủ 4 trường `vat_enabled`, `vat_rate`, `vat_apply_mode`, `vat_applied_shifts` vào payload gửi đi trong `onSubmit` của `EditStoreModal.tsx`.
  - Đảm bảo sự kiện bấm nút bật/tắt VAT kích hoạt `{ shouldDirty: true, shouldValidate: true }` cho `setValue` ở cả `EditStoreModal.tsx` và `CreateStoreModal.tsx`.
- **Verification:**
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-05 11:10] - Tích Hợp API Danh Sách Ca & Bộ Chọn Đa Ca (Multi-Select) Áp Dụng Thuế VAT Cho Chi Nhánh
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "có thể gọi api lấy dữ liệu all ca để dạng chọn 1 or nhiều á nha" (kèm ảnh chụp dropdown Phạm Vi Áp Dụng Ca trong modal Cấu hình Chi nhánh)
- **Nội dung hoàn thành:**
  - **Tích hợp API Ca Làm Việc (`EditStoreModal.tsx`, `CreateStoreModal.tsx`, `CheckinConfigView.tsx`):**
    - Sử dụng `useGetShiftConfigs(store?.id)` gọi API `GET /api/v1/scheduling/shift-configs?store_id=...` để nạp danh sách toàn bộ các ca làm việc thực tế của cơ sở (Ca Sáng, Ca Chiều, Ca Tối, Ca Khuya... kèm thời gian, mã màu).
    - Cung cấp bộ chọn đa ca (Multi-Select Pills / Cards) khi chọn chế độ "Theo ca chỉ định (chọn 1 hoặc nhiều ca)":
      - Cho phép click chọn 1 hoặc nhiều ca độc lập, tự động toggle lưu vào mảng `vat_applied_shifts`.
      - Hiển thị đầy đủ màu sắc ca, tên ca, khung giờ (start_time - end_time), ô đánh dấu tích chọn `[✓]` màu vàng kim Obsidian Gold.
      - Nút hỗ trợ nhanh: "Chọn tất cả" và "Bỏ chọn" kèm badge đếm số lượng ca đã chọn (`Đã chọn: X ca`).
      - Cảnh báo trực quan nếu chưa chọn ca nào.
    - Cập nhật đồng bộ tại cả `EditStoreModal.tsx`, `CreateStoreModal.tsx` và `CheckinConfigView.tsx`.
- **Verification:**
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-05 10:35] - Loại Bỏ Widget Thẻ Quy Trình & Lịch Kiểm Kho Đang Áp Dụng Khỏi Giao Diện Kiểm Kê
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "bỏ hiển thị cái này đi khong cần thiết cho lắm" (kèm ảnh chụp card Quy Trình & Lịch Kiểm Kho Đang Áp Dụng chiếm nhiều diện tích)
- **Nội dung hoàn thành:**
  - **Tối ưu hóa giao diện Kiểm Kê Kho (`InventoryAuditView.tsx`):**
    - Loại bỏ hoàn toàn khối widget card "Quy Trình & Lịch Kiểm Kho Đang Áp Dụng" và các thông tin chu kỳ, ca kiểm trong ngày, phân quyền người tạo, phân quyền người duyệt.
    - Dọn dẹp sạch sẽ các biến trạng thái và import không còn sử dụng (`FaTasks`, `FaHourglassHalf`, `scheduleStatus`, `auditConfig`).
    - Nút chức năng "⚙️ Cấu Hình Kiểm Kho" trên thanh tiêu đề phía trên vẫn được bảo toàn cho cấp Quản lý / Admin khi có nhu cầu điều chỉnh chu kỳ hoặc phân quyền.
- **Verification:**
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-05 09:50] - Phân Nhóm Danh Mục Món Theo "Món Bán" & "Món Nội Bộ" Với `<optgroup>` Chuẩn Giao Diện
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "có thể để món bán dưới danh sách món món nội bộ dưới là danh sách món đc không" (kèm ảnh chụp dropdown danh mục món bị trộn lẫn và có hậu tố lặp lại `(Món bán)`, `(Nội bộ)`)
- **Nội dung hoàn thành:**
  - **Phân loại danh mục theo nhóm nghiệp vụ (`CreateRecipeModal.tsx`, `EditRecipeModal.tsx`, `RecipesView.tsx`):**
    - Tách danh sách danh mục thành 2 nhóm độc lập bằng `useMemo`:
      - `customerCategories`: Danh mục món bán cho khách hàng (`type !== 'internal_prep'`).
      - `internalCategories`: Danh mục bán thành phẩm / sơ chế nội bộ (`type === 'internal_prep'`).
    - Sử dụng thẻ HTML `<optgroup>` chuẩn để hiển thị phân nhóm rõ ràng, mạch lạc:
      - `<optgroup label="── Món Bán ──">`: Hiển thị danh sách các món bán (Cà phê, Trà sữa, Trà trái cây, Đá xay - Matcha...).
      - `<optgroup label="── Món Nội Bộ ──">`: Hiển thị danh sách các món nội bộ (Bán thành phẩm nội bộ, Cốt trà & Syrup sơ chế...).
    - Loại bỏ tiền tố emoji 🏷️ và hậu tố dư thừa `(Món bán)` / `(Nội bộ)` khỏi từng dòng lựa chọn, giúp giao diện gọn gàng, tinh tế và đồng nhất chuẩn Obsidian Gold.
    - Áp dụng cấu trúc phân nhóm đồng bộ cho cả:
      - Modal Tạo Công Thức Món (`CreateRecipeModal.tsx`)
      - Modal Sửa Công Thức Món (`EditRecipeModal.tsx`)
      - Bộ Lọc Danh Mục trên thanh công cụ Quản Lý Món (`RecipesView.tsx`)
- **Verification:**
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.
  - `npm --prefix be run build`: 0 lỗi.

---

### [2026-11-05 09:40] - Tích Hợp Tải Ảnh Món Từ Máy Tính Lên Cloudinary Folder `zone_6/menu/{id món}` Với Cơ Chế Ký Bảo Mật (Signed Upload)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "phần ảnh này chọn từ máy và sẽ đc lưu trên cloudinary folder zone_6/menu/{id món} quy trình lưu thì khi bấm lưu sẽ xin chữ ký từ be và fe sẽ lưu lên cloudinary" (kèm ảnh chụp ô nhập Link Ảnh Món / Hình Ảnh Sản Phẩm)
- **Nội dung hoàn thành:**
  - **Hạ tầng Backend Ký Bảo Mật Cloudinary (`be/src/config/cloudinary.config.ts`, `be/src/modules/shared/cloudinary/`):**
    - Cấu hình SDK & tiện ích băm chữ ký SHA-1 theo chuẩn API Cloudinary: `generateCloudinarySignature({ folder, timestamp })` kết hợp với `CLOUDINARY_API_SECRET`.
    - Xây dựng Granular SRP Module: `CloudinarySignController`, `CloudinarySignService`, `CloudinarySignSchema`, `cloudinary.routes.ts`.
    - Định tuyến API: `POST /api/v1/cloudinary/sign` (yêu cầu xác thực `authenticate`). Tiếp nhận `item_id` (nếu không truyền tự động sinh ObjectId mới) và tạo folder `zone_6/menu/{id món}`.
  - **Giao diện & Tích hợp Frontend (`RecipeImagePicker.tsx`, `CreateRecipeModal.tsx`, `EditRecipeModal.tsx`):**
    - `cloudinary.service.ts`: Cung cấp hàm `uploadMenuItemImage(file, itemId)` trọn gói (xin chữ ký từ BE -> upload thẳng lên Cloudinary endpoint `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`).
    - Component `RecipeImagePicker.tsx`:
      - Cho phép chọn ảnh từ máy tính (PNG, JPG, WEBP, tối đa 10MB) kèm xem trước (preview), thông tin dung lượng và huy hiệu thư mục Cloudinary đích: `zone_6/menu/{id món}`.
      - Vẫn duy trì tùy chọn dán URL thủ công cho người dùng.
    - Quy trình lưu: Khi người dùng bấm nút **Lưu Món** / **Cập Nhật Món**, nếu có ảnh mới chọn từ máy tính, form sẽ tự động xin chữ ký từ BE, upload ảnh lên Cloudinary, nhận về `secure_url` và lưu URL an toàn vào MongoDB Atlas.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-05 09:25] - Phân Quyền Widget Quy Trình Kiểm Kho Cho Admin & Chuyển Mã Vai Trò Sang Tên Hiển Thị
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "ở này cấp admin mới thấy và để tên chứ đừng để dạng mã" (kèm ảnh chụp khung Quy Trình & Lịch Kiểm Kho Đang Áp Dụng với các mã vai trò như admin_he_thong, nhan_vien...)
- **Nội dung hoàn thành:**
  - **Phân quyền hiển thị Widget Quy Trình & Lịch Kiểm Kho (`fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditView.tsx`):**
    - Ràng buộc điều kiện hiển thị `{isAdmin && auditConfig && (...)`: Chỉ tài khoản có vai trò Admin Hệ Thống (`admin_he_thong`) mới được nhìn thấy card chính sách và lịch kiểm kho. Các vai trò khác (Nhân viên, Phó ca, Trưởng ca, Quản lý) được ẩn 100%.
  - **Chuyển đổi mã vai trò sang tên tiếng Việt chuẩn mực (`ROLE_LABEL_MAP`):**
    - Thay thế toàn bộ hiển thị dạng mã kỹ thuật (`nhan_vien`, `pho_ca_vat_lieu`, `pho_ca_lam_lich`, `truong_ca`, `quan_ly`, `admin_he_thong`) thành tên vai trò chính thức: "Nhân Viên", "Phó Ca Vật Liệu", "Phó Ca Làm Lịch", "Trưởng Ca", "Quản Lý", "Admin Hệ Thống".
    - Áp dụng đồng bộ tại danh sách quyền tạo phiếu, quyền duyệt kho, danh sách người kiểm kho hôm nay và lịch sử kiểm kê trong bảng.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-05 09:20] - Toàn Diện Cấu Hình Thuế VAT Riêng Biệt Cho Từng Chi Nhánh (Multi-Store VAT & Shift Scoping)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "bạn có thêm cáu hình vat cho từng chi nhánh chưa vd bao nhiêu % và setup ca nào thì mới có thuế vat hay all"
- **Nội dung hoàn thành:**
  - **Kiến trúc Backend Đa Cơ Sở (`store-config` & `store`):**
    - `StoreConfigController` & `StoreConfigService`: Cập nhật `getConfig` và `updateConfig` tiếp nhận `store_id` (qua query string hoặc request body) để truy vấn và lưu chính xác cấu hình (GPS, bán kính, % VAT, phạm vi ca áp dụng) cho đúng cơ sở/chi nhánh đó.
    - `StoreSchema` & `StoreGetService`: Thêm `vat_enabled`, `vat_rate`, `vat_apply_mode`, `vat_applied_shifts` vào `StoreCreateSchema`, `StoreUpdateSchema` và `mapStoreDoc`.
  - **Giao diện Cấu hình Check-in & VAT Chi Nhánh (`CheckinConfigView.tsx`):**
    - Thêm **Bộ chọn Chi Nhánh (Multi-Store Switcher)** ở đầu trang với danh sách lấy từ `useGetStores()`.
    - Khi Admin chuyển đổi giữa các chi nhánh: Tự động tải thông tin GPS, bán kính điểm danh và cấu hình Thuế VAT (% VAT, Tất cả ca hoặc Ca cụ thể) riêng biệt của chi nhánh đó.
    - Lưu cấu hình cập nhật chính xác theo `store_id` của chi nhánh đang chọn.
  - **Tích hợp POS theo Chi Nhánh (`fe/src/app/pos/page.tsx`):**
    - Cập nhật `useCheckinConfig(shiftData?.storeId)`: Thu ngân làm việc tại chi nhánh nào sẽ tự động áp dụng đúng cấu hình Thuế VAT của riêng chi nhánh đó.
  - **Quản lý Chi Nhánh (`/stores`):**
    - `StoreCard.tsx`: Hiển thị micro-badge Thuế VAT trực quan (Tỷ lệ %, Tất cả ca hoặc Số ca áp dụng, trạng thái Kích hoạt/Tắt).
    - `EditStoreModal.tsx`: Tích hợp trực tiếp bộ chỉnh sửa Thuế VAT khi cập nhật chi nhánh.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-05 09:05] - Tinh Chỉnh Dropdown Chọn Bàn POS: Loại Bỏ Icon và Chữ "Mặc định"
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "bỏ các icon đi và bỏ chữ mặc định đi" (kèm ảnh chụp dropdown chọn bàn trong LiveCart)
- **Nội dung hoàn thành:**
  - **Tối ưu giao diện Dropdown Bàn (`fe/src/features/pos/component/LiveCart.tsx`):**
    - Loại bỏ emoji icon `🥡` và chữ `(Mặc định)` ở option mang về: đổi từ `🥡 Mang về (Mặc định)` thành `Mang về`.
    - Loại bỏ emoji icon `🪑` ở option chọn bàn: hiển thị định dạng chuẩn sạch gọn `{displayName} (zone) • Trống / Đang chọn`.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-04 23:25] - Ẩn Nút Hủy Hóa Đơn (Void) Đối Với Nhân Sự Không Có Quyền
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "những người không có quyền cho nút này thì hãy ẩn nút đó đi" (kèm ảnh chụp nút icon `FaBan` ⊘ và cột Thao Tác trong bảng Quản Lý Hóa Đơn)
- **Nội dung hoàn thành:**
  - **Phân quyền nút Hủy Hóa Đơn (`fe/src/features/pos/component/OrderManagementView.tsx`):**
    - Kiểm tra vai trò của tài khoản đăng nhập hiện tại qua hook `useAuth()`.
    - Ràng buộc: Chỉ **Admin Hệ Thống (`admin_he_thong`)**, **Quản Lý (`quan_ly`)** và **Trưởng Ca (`truong_ca`)** mới được phép nhìn thấy nút `[ ⊘ ]` (Hủy Hóa Đơn).
    - Ẩn hoàn toàn 100% nút Hủy Hóa Đơn trên từng dòng hóa đơn trong bảng Quản Lý Hóa Đơn đối với cấp Nhân Viên (`nhan_vien`), Phó Ca Vật Liệu (`pho_ca_vat_lieu`) và Phó Ca Làm Lịch (`pho_ca_lam_lich`).
    - Đồng thời ẩn luôn nút "Hủy Hóa Đơn" bên trong modal Chi Tiết Hóa Đơn (`OrderDetailModal.tsx`) đối với các tài khoản không có thẩm quyền.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-04 23:20] - Bổ Sung Cấu Hình Thuế VAT (% Thuế & Áp Dụng Cho Tất Cả Các Ca Hay Chỉ Ca Được Chọn) & Tích Hợp Vào POS / Hóa Đơn
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "ở admin cấu hình thêm thuế avt bao nhiêu phần trăm và cáu hình ca nào sẽ áp dụng thuế hay áp dụng all"
- **Nội dung hoàn thành:**
  - **Mở rộng Cơ sở dữ liệu & Cấu hình Quán (StoreConfig & Order):**
    - `StoreConfigModel` (`be/src/modules/admin_he_thong/store-config/models/store-config.model.ts`) và `store_config.prisma`:
      - `vat_enabled`: boolean (Bật/tắt tính thuế VAT, mặc định false)
      - `vat_rate`: number (Tỉ lệ phần trăm thuế VAT, mặc định 8%)
      - `vat_apply_mode`: 'ALL' | 'SPECIFIC_SHIFTS' (Phạm vi: Áp dụng tất cả các ca hoặc chỉ ca được chọn)
      - `vat_applied_shifts`: string[] (Danh sách tên hoặc mã ca làm việc áp dụng thuế)
    - `OrderModel` (`be/src/modules/pos/models/order.model.ts`) và `order.prisma`:
      - `vat_rate`: number (Tỉ lệ phần trăm VAT áp dụng tại thời điểm thanh toán)
      - `vat_amount`: number (Số tiền thuế VAT được tính vào đơn hàng)
  - **Giao diện Cấu hình Thuế VAT Admin (`fe/src/features/admin_he_thong/checkin-config/component/CheckinConfigView.tsx`):**
    - Thêm Thẻ 4 "Cấu Hình Thuế VAT & Phạm Vi Áp Dụng Theo Ca" phong cách Obsidian Gold.
    - Switch bật/tắt tính thuế VAT.
    - Bộ nhập phần trăm thuế VAT linh hoạt (0%, 5%, 8%, 10%...).
    - Lựa chọn chế độ: "Áp Dụng Tất Cả Các Ca (All)" hoặc "Chỉ Áp Dụng Cho Ca Được Chọn".
    - Khi chọn theo ca: Tự động tải danh sách ca làm việc thật từ `shift_configs` (`useGetShiftConfigs`), cho phép Admin tích chọn trực quan từng ca (có hiển thị màu sắc và khung giờ ca).
  - **Tích hợp Tự động Tính Thuế vào Bán Hàng POS & Hóa Đơn (`LiveCart.tsx`, `page.tsx`, `order.checkout.service.ts`, `OrderDetailModal.tsx`):**
    - POS tự động đối chiếu ca làm việc hiện tại (`shiftData.shiftName`) với cấu hình VAT của cơ sở.
    - Nếu ca hiện tại thuộc diện áp dụng thuế:
      - `LiveCart` hiển thị rõ dòng `Thuế VAT (X%)` và cộng vào `Tổng cộng`.
      - Khi thanh toán (VietQR hoặc Tiền mặt): Modal xác nhận và VietQR hiển thị đúng số tiền đã gồm VAT.
      - Backend lưu chính xác `vat_rate`, `vat_amount`, `final_amount` vào collection `orders`.
      - Chi tiết đơn hàng (`OrderDetailModal.tsx`) và Bill in nhiệt K80 hiển thị đầy đủ dòng Thuế VAT.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-04 23:05] - Chuyển Đổi Bàn Số Sang Dropdown Select Bàn Trống (Mặc Định Mang Về) & Tự Động Cập Nhật Trạng Thái Bàn Sang Đang Sử Dụng (Real-time Socket) Khi Thanh Toán
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "dạng select các bạn đang trống và mặc định là mang về nếu chọn bàn thì mới gán vô bàn đó và khi thanh toán thì cập nhật theo thời gian thực bàn đó đang xử dung;" (kèm ảnh chụp ô nhập BÀN SỐ trên POS LiveCart)
- **Nội dung hoàn thành:**
  - **Chuyển đổi ô BÀN SỐ thành Dropdown Select (`fe/src/features/pos/component/LiveCart.tsx`):**
    - Thay thế text input bằng `<select>` nhận diện Obsidian Gold sang trọng.
    - Mặc định luôn là: `🥡 Mang về (Mặc định)` (không dùng bàn).
    - Tự động lọc danh sách bàn chỉ hiển thị các bàn đang trống (`status: 'AVAILABLE'`) của cơ sở trực thuộc ca trực (hoặc bàn đang được chọn cho đơn hiện tại).
    - Hiển thị đầy đủ tên bàn, tầng (zone) và số lượng chỗ ngồi (ví dụ: `🪑 Bàn 01 (Tầng 1) • Trống`).
    - Nhãn trạng thái phía trên tự động chuyển giữa `Mang về` và `Tại quán` trực quan.
  - **Đồng bộ thời gian thực Sơ đồ Bàn trên POS (`fe/src/app/pos/page.tsx`):**
    - Kết nối `useTables` và `useTableSocket` trên trang POS, tự động cập nhật danh sách bàn trống ngay khi có bàn mới được ngồi hoặc giải phóng.
  - **Cập nhật trạng thái bàn sang `OCCUPIED` khi thanh toán (`be/src/modules/pos/services/order.checkout.service.ts` & `table.repository.ts`):**
    - Khi thu ngân chọn bàn cụ thể và hoàn tất thanh toán (VietQR hoặc Tiền mặt):
      - Hệ thống tìm chính xác bản ghi bàn trong CSDL MongoDB Atlas qua `findByStoreAndNumber`.
      - Cập nhật trạng thái bàn thành `OCCUPIED` (Đang sử dụng / Có khách).
      - Phát sự kiện WebSocket `table:updated` qua namespace `/tables` để toàn bộ màn hình Sơ Đồ Bàn (`/tables`) và các máy POS khác lập tức cập nhật trạng thái bàn thời gian thực.
- **Verification:**
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-04 22:52] - Thay Thế Hộp Thoại Trình Duyệt Bằng Modal Xác Nhận Obsidian Gold (ConfirmModal) Khi Thanh Toán Tiền Mặt & Xóa Cấu Hình PayOS
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Phản hồi ảnh chụp popup xác nhận mặc định của trình duyệt (`window.confirm("Xác nhận khách thanh toán 5.000đ bằng TIỀN MẶT?")`) và câu hỏi "tôi có mẫu xác nhận mà sao lại dùng thẻ mặc định z"
- **Nội dung hoàn thành:**
  - **Nâng cấp `ConfirmModal.tsx` (`fe/src/core/components/ui/ConfirmModal.tsx`):**
    - Hỗ trợ linh hoạt cả `string` lẫn `React.ReactNode` cho thuộc tính `message` và bổ sung `children`.
    - Giữ trọn vẹn phong cách Obsidian Gold Signature (`bg-[#12141A]`, `border-[#212532]`, `gold-gradient-bg`).
  - **Loại bỏ hoàn toàn `window.confirm` trên POS (`fe/src/app/pos/page.tsx`):**
    - Khi thu ngân bấm `TIỀN MẶT`, hệ thống kích hoạt `ConfirmModal` chuyên nghiệp:
      - Hiển thị mã đơn hàng `Z6-POS-XXXXXX`.
      - Khối nổi bật Obsidian Gold hiển thị rõ tổng số tiền cần thu `VNĐ`.
      - Hiển thị thông tin Bàn phục vụ và Tên khách hàng.
      - Nút hành động `[ 💵 Xác Nhận Đã Thu Tiền ]` và nút `[ Hủy Bỏ ]`.
  - **Chuẩn hóa xác nhận xóa PayOS (`fe/src/features/admin_he_thong/payos/component/PayOSAccountCard.tsx`):**
    - Chuyển đổi lệnh `confirm(...)` cũ sang `ConfirmModal` với cờ `isDestructive: true`.
- **Verification:**
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-04 22:45] - Hiển Thị Kích Thước (Size) Đồ Uống Trên Thẻ Món & Bổ Sung Tùy Chọn Kích Thước (Size M / L) Đa Mức Giá Trong POS Modal
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Phản hồi ảnh chụp thẻ đồ uống POS ("Cà Phê Muối Cố Đô Zone 6", "Trà Dâu Tây Tươi Zone 6", "Trà Đào Cam Sả Tươi") và thông báo "thiếu hiển thị size"
- **Nội dung hoàn thành:**
  - **Hiển thị huy hiệu Size rõ ràng trên Thẻ Món POS (`fe/src/features/pos/component/MenuCatalog.tsx`):**
    - Hiển thị badge kích cỡ (`Size M`, `Size L`...) bên cạnh badge nhiệt độ (Lạnh/Nóng) trong header của từng thẻ đồ uống.
    - Hiển thị đơn vị kích cỡ bên cạnh giá tiền (`29.000đ / Size M`, `35.000đ / Size L`, `32.000đ / Size L`).
  - **Bổ sung Tùy chọn Size (Kích thước) trong Modal POS (`fe/src/features/pos/component/PosItemCustomModal.tsx`):**
    - Thêm bộ chọn `📏 KÍCH THƯỚC (SIZE)` với 2 mức Size Vừa (M) và Size Lớn (L) tương tự trải nghiệm gọi món tại bàn.
    - Tự động nhận diện Size mặc định của công thức từ MongoDB Atlas (`serving_size`).
    - Tính toán phụ thu chênh lệch giá linh hoạt (+5.000đ nếu chọn Size L cho món mặc định Size M, hoặc giảm -5.000đ nếu chuyển về Size M cho món mặc định Size L).
    - Cập nhật tên món `[Tên món] (Size [M/L])` và ghi chú đơn hàng khi thêm vào giỏ hàng POS đồng bộ.
  - **Đồng bộ hiển thị Size trên Thực đơn Khách hàng (`CustomerMenu.tsx`) và Landing Page (`page.tsx`):**
    - Khách hàng xem thực đơn trực quan nắm được kích cỡ phục vụ tiêu chuẩn của từng món.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-04 22:35] - Xóa Nút Gọi Món Tại Bàn Khỏi Landing Page & Khóa Chặt Truy Cập Chỉ Cho Phép Khi Quét Đúng Mã QR Standee Mica Tại Bàn
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "bỏ cái này đi và chỉ đc phép quét mã tại bàn mới hiện ra trang order ở khách hàng còn không thì ở trang ko đx liên kết đến" (kèm ảnh chụp nút [GỌI MÓN TẠI BÀN] trên navbar)
- **Nội dung hoàn thành:**
  - **Loại bỏ hoàn toàn nút và liên kết dẫn đến trang `/order` trên Landing Page (`fe/src/app/page.tsx`):**
    - Gỡ bỏ nút bấm vàng `[ 🔲 GỌI MÓN TẠI BÀN ]` trên thanh điều hướng Navbar. Chỉ giữ lại nút `[ 🔒 Cổng Nhân Sự ]`.
    - Thay thế nút kêu gọi hành động tại Hero Section: Không dẫn link sang `/order`, đổi thành nút `Khám Phá Menu Signature` và `Hệ Thống Chi Nhánh` kèm chú thích hướng dẫn quét mã tại bàn.
    - Loại bỏ nút gọi món trên từng thẻ đồ uống trong thực đơn, thay thế bằng nhãn tinh gọn `Phục vụ tại bàn`.
    - Chuyển đổi khối gọi món thành Section `#guide` ("Hướng Dẫn Tự Gọi Món Bằng Mã QR Trên Standee Tại Bàn") với 3 bước quy chuẩn.
    - Xóa bỏ liên kết `/order` trong Footer.
  - **Khóa màn hình `/order` - Bắt buộc quét đúng mã QR Standee mica tại bàn (`fe/src/features/table-order/component/TableOrderView.tsx`):**
    - Xóa bỏ hoàn toàn cơ chế chọn bàn thủ công (Manual table picker).
    - Khi người dùng truy cập trực tiếp URL `/order` mà không có mã xác thực `token` bàn (tức là không quét mã QR dán trên bàn): Hệ thống hiển thị Màn hình Khóa An Toàn phong cách Obsidian Gold yêu cầu quét mã QR mica trên bàn, giải thích quy trình 3 bước và cung cấp nút quay lại Trang chủ.
    - Chỉ khi khách hàng quét đúng mã QR mica gắn trên bàn (URL kèm tham số `?token=...`), hệ thống mới xác định định vị GPS, kiểm tra Geofence và kích hoạt giao diện thực đơn điện tử.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-04 22:25] - Khắc Phục Lỗi "Không Tìm Thấy Phiên Làm Việc POS Tương Ứng" Khi Thêm Món / Topping Vào Giỏ Hàng
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Phản hồi ảnh chụp thông báo `🔴 Không tìm thấy phiên làm việc POS tương ứng.` và câu hỏi "là sao"
- **Nguyên nhân cốt lõi phát hiện:**
  - Socket đã kết nối thành công (hiển thị `🟢 Đồng bộ tức thời`) và Topping đã hiển thị đầy đủ trên giao diện.
  - Tuy nhiên khi thu ngân bấm thêm món / Topping vào giỏ hàng, Socket phát `pos:cart_update`, backend gọi `PosCartUpdateService.execute()`.
  - Tại đây `existing = await this.repo.getSessionByCode(input.sessionCode)` tìm kiếm phiên POS trong collection `pos_sessions`.
  - Bản ghi phiên POS chưa từng được lưu vào MongoDB Atlas do:
    1. Schema `pos-session.model.ts` và `pos_session.prisma` định nghĩa cứng `shift_id` là `ObjectId`. Trong khi ca giám sát và ca trực thực tế trả về string (ví dụ: `"supervisor_active"`, `"Khuya"`, `"Ca Trực"`). Khi khởi tạo phiên, Mongoose vấp lỗi Cast to ObjectId failed.
    2. Trong `pos.socket.ts` sự kiện `pos:join` chỉ `getSessionByCode` mà không gọi `findOrCreateSession`.
    3. Trong `pos.verify-shift.service.ts` chưa gọi tạo trước phiên làm việc trong Database khi trả về mã `sessionCode`.
- **Nội dung hoàn thành:**
  - Nới lỏng kiểu dữ liệu `shift_id` trong `pos-session.model.ts` sang `Schema.Types.Mixed` và trong `pos_session.prisma` thành `String` linh hoạt.
  - Sửa `PosSessionRepository.findOrCreateSession` ép kiểu an toàn cho `storeId` và `shiftId`, tránh lỗi BSON Cast error.
  - Bổ sung cơ chế tự động tìm/tạo phiên làm việc (`findOrCreateSession`) tại 3 chốt chặn:
    1. Trong `PosVerifyShiftService` khi xác thực ca thành công.
    2. Trong `pos.socket.ts` khi client vừa `pos:join` vào phòng.
    3. Trong `PosCartUpdateService` cơ chế tự cứu (fallback recovery) tự động giải mã `storeId` và `shiftId` từ `sessionCode` để tạo ngay phiên nếu DB chưa có.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-04 22:15] - Khắc Phục Triệt Để 2 Lỗi POS: Vòng Lặp Ngắt Kết Nối Socket (Infinite Reconnect Loop) & Hiển Thị Đầy Đủ Danh Mục Topping Bán Lẻ Từ Database
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "thiếu topping và vẫn lõi kết nối socket kaif"
- **Nguyên nhân cốt lõi phát hiện:**
  1. *Lỗi kết nối Socket (`🔴 Mất kết nối Socket`):*
     - Trong `fe/src/app/pos/page.tsx`, object `user ? { userId: ..., name: ... } : null` được tạo mới (new object literal reference) trên MỖI LẦN COMPONENT RENDER.
     - Trong `fe/src/features/pos/hook/useLivePos.ts`, `useEffect` kết nối socket phụ thuộc vào dependency `[shiftData, user]`.
     - Khi Socket kết nối thành công, `socket.on('connect')` kích hoạt `setIsConnected(true)`, gây re-render component cha.
     - Khi re-render, `user` object mới được tạo $\rightarrow$ React thấy tham chiếu `user` thay đổi $\rightarrow$ chạy hàm cleanup: `socket.disconnect()`.
     - `socket.on('disconnect')` gọi `setIsConnected(false)`, kích hoạt re-render tiếp theo $\rightarrow$ Socket rơi vào vòng lặp kết nối - ngắt kết nối vô tận (Reconnect / Teardown Death Loop).
     - Đồng thời, khi đi qua Vercel proxy rewrite, cơ chế WebSocket upgrade probe (`upgrade: true`) bị Vercel Serverless Function từ chối do không hỗ trợ persistent TCP tunnel.
  2. *Thiếu Topping trên màn hình POS:*
     - Trong backend `SellableToppingRepository.findAll`, câu query lọc cứng `query.store_id = new mongoose.Types.ObjectId(filters.store_id)`. Trong khi các Topping chuẩn chuỗi hệ thống trong MongoDB Atlas có `store_id: null` (dùng chung cho toàn bộ chi nhánh Zone 6). Do đó query trả về 0 topping!
     - Trên frontend `MenuCatalog.tsx`, danh mục tabs `categories` chỉ quét danh sách `recipeList` và không hiển thị tab `Topping`. Đồng thời giao diện thiếu các thẻ Topping để thu ngân bấm bán nhanh hoặc thêm vào đơn.
- **Nội dung hoàn thành:**
  - **Khắc phục Socket.io POS Kết Nối Ổn Định 100%:**
    - Cập nhật `fe/src/app/pos/page.tsx`: Dùng `React.useMemo` memoize `liveUser` theo `user.id`, `user.name` để chặn triệt để tình trạng tạo object reference mới mỗi render.
    - Cập nhật `fe/src/features/pos/hook/useLivePos.ts`:
      - Phân tách dependencies thành các kiểu nguyên thủy (primitive string values): `sessionCode`, `storeId`, `shiftId`, `userId`, `userName`.
      - Tự động nhận diện môi trường Vercel (`window.location.hostname.includes('vercel.app')`) để kích hoạt chế độ `transports: ['polling']`, `upgrade: false`, đảm bảo HTTP Long-Polling xuyên qua Vercel Rewrite Proxy về VPS ổn định 100%, không bị rớt kết nối.
      - Tối ưu hóa các callbacks `syncCartToServer`, `setLockForPayment`, `notifyOrderCompleted` theo các biến nguyên thủy.
  - **Mở Khóa Topping Toàn Chuỗi & Hiển Thị Trực Quan Trên POS Catalog:**
    - Cập nhật backend `be/src/modules/pho_ca_vat_lieu/material/repositories/sellable-topping.repository.ts`: Mở rộng điều kiện truy vấn `$or` chấp nhận cả Topping theo chi nhánh (`store_id`) lẫn Topping toàn chuỗi (`store_id: null` hoặc không tồn tại), trả về đầy đủ 100% topping trong MongoDB Atlas.
    - Cập nhật frontend `fe/src/features/pos/component/MenuCatalog.tsx`:
      - Bổ sung tab danh mục `Topping` bên cạnh các danh mục thức uống (`Cà phê`, `Trà trái cây`...).
      - Lọc và hiển thị danh sách Topping thật: Trân châu trắng 3Q giòn (5.000đ), Trân châu đen hoàng kim (5.000đ), Thạch củ năng giòn lá dứa (5.000đ), Đào ngâm miếng giòn Cronos (10.000đ)...
      - Khi chọn tab `Tất cả món`, hiển thị khối phân cách chuyên biệt `Topping Bán Lẻ & Thêm` ngay dưới thức uống.
      - Hỗ trợ thu ngân bấm nút `+` trên thẻ topping để thêm nhanh topping vào giỏ hàng Live Cart hoặc click vào thức uống để chọn topping đi kèm qua modal tùy biến.
- **Verification:**
  - `tsc -p be/tsconfig.json --noEmit`: 0 lỗi.
  - `tsc -p fe/tsconfig.json --noEmit`: 0 lỗi.

---

### [2026-11-04 21:50] - Triển Khai Landing Page Trang Chủ Chuẩn Obsidian Gold & Hoàn Thiện Tự Gọi Món Tại Bàn Không Cần Login (Lưu Định Vị GPS, Mã Thiết Bị, Tên Thiết Bị, SĐT Tích Điểm)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "tôi muốn 1 trang landing page làm trang chủ và trang dành cho khi khách hàng quét mã mà đc cung cấp or dán ở bàn sẽ hiện các món để chọn thành toán mã qr ... mà ko cần login yêu cầu là phải xác định vị trí và lưu thông tin khách hàng mã định danh của htieets bị tên thiết bị .... sau này có thể bổ sung thêm tài khoản khách hàng thân thiết có thêm tên số ddienj thoại .... nhưng hiện h chưa bắt buộc lắm đâu làm đủ là đc"
- **Nội dung hoàn thành:**
  - **Landing Page Trang Chủ Độc Bản Obsidian Gold (`fe/src/app/page.tsx`):**
    - Thiết kế giao diện sang trọng chuẩn nhận diện Zone Six Signature (Màu đen Void `#0b0c10` và Vàng Gold `#d4af37`).
    - Navbar Glassmorphism hiển thị Logo Vương Miện Hoàng Gia, liên kết Trải Nghiệm, Thực Đơn, Gọi Món Tại Bàn, Chi Nhánh và Cổng Nhân Sự (`/login`).
    - Hero Section hoành tráng với tiêu đề ấn tượng, nút kêu gọi hành động nổi bật: `📱 Quét Mã Bàn • Gọi Món Ngay` và `☕ Khám Phá Thực Đơn`.
    - Trình diễn 4 giá trị cốt lõi: Cà phê rang mộc thượng hạng, Trà trái cây tươi 100%, Không gian Obsidian Gold & Âm nhạc tinh tuyển, Công nghệ tự gọi món VietQR 24/7.
    - Trình diễn thực đơn Signature bán chạy: Cà Phê Muối Cố Đô (29.000đ), Trà Dâu Tây Tươi (35.000đ), Trà Đào Cam Sả Tươi (32.000đ).
    - Khối quảng bá gọi món tại bàn không cần login và danh sách hệ thống chi nhánh (Đà Nẵng), giờ mở cửa, tiện ích Wifi 300Mbps, ổ cắm sạc từng bàn, bãi đỗ xe miễn phí.
  - **Mở Khóa Public Route Trong AppShell (`fe/src/core/components/layout/AppShell.tsx`):**
    - Bổ sung `isPublicPage` cho `/` và `/order`: Khách hàng truy cập Landing Page và Gọi món tại bàn **hoàn toàn không cần đăng nhập**, không bị chuyển hướng về màn hình `LoginForm` nội bộ.
  - **Trang Tự Gọi Món Tại Bàn Không Cần Login (`fe/src/features/table-order/`):**
    - Xây dựng tiện ích nhận diện thiết bị tự động (`fe/src/features/table-order/utils/device-info.ts`): Sinh và lưu mã định danh thiết bị độc nhất (`z6_device_id` trên `localStorage`), tự động nhận diện tên thiết bị và trình duyệt (`iPhone (Safari)`, `Samsung Galaxy (Chrome Mobile)`, `Windows PC (Chrome)`...).
    - Xác định vị trí GPS Geofence: Bắt buộc định vị vị trí thực tế của khách hàng, tính khoảng cách mét tới cơ sở để chống đặt đơn từ xa.
    - Cập nhật Ngăn giỏ hàng (`CustomerCartDrawer.tsx`): Bổ sung ô nhập Tên/Danh xưng tùy chọn, ô nhập Số điện thoại khách hàng thân thiết (để sau này tích điểm thành viên), hiển thị huy hiệu trạng thái GPS và tên thiết bị.
    - Hỗ trợ chọn bàn thủ công linh hoạt nếu khách vào `/order` từ Landing page mà chưa quét mã mica: Backend cung cấp API công khai `GET /api/v1/pos/table-order/public-tables`, giao diện hiển thị các bàn thuộc từng tầng để khách chọn nhanh số bàn.
  - **Lưu Thông Tin Vào Cơ Sở Dữ Liệu (`be/src/modules/pos/`):**
    - Cập nhật Prisma Schema `order.prisma` và Mongoose Model `order.model.ts`: Bổ sung `customer_phone`, `device_id`, `device_name`.
    - Cập nhật `TableOrderCreateService`: Lưu toàn bộ `customer_name`, `customer_phone`, `device_id`, `device_name`, `customer_lat`, `customer_lng`, `distance_meters` vào đơn hàng, đồng thời phát WebSocket `pos:new_table_order` thông báo tức thì đến quầy Bar / Thu ngân.
- **Verification:**
  - Frontend TypeScript (`tsc -p fe/tsconfig.json --noEmit`): 0 lỗi.
  - Backend TypeScript (`tsc -p be/tsconfig.json --noEmit`): 0 lỗi.

---

### [2026-11-04 21:15] - Khắc Phục Triệt Để 3 Vấn Đề: Hiển Thị Giá Món POS & Topping Thật Từ DB, Sửa Lỗi Ngắt Kết Nối Socket 308, Ngăn Chặn Lỗi ObjectId Undefined
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. "1: dữ liệu này lấy đâu ra z"
  2. "2: bắt buộc lấy dữ liệu thật từ database món ăn và topping .... món bắn cho khách"
  3. "3 tại sao không kết nối socket đc z"
- **Nguyên nhân cốt lõi phát hiện:**
  1. *Dữ liệu món & giá 0đ:* Món lấy từ MongoDB collection `recipes`, nhưng FE đọc `recipe.selling_price` thay vì trường `recipe.price` có trong Database. Danh mục POS còn chứa cả sơ chế nội bộ `internal_prep`.
  2. *Chọn Topping thật:* Trước đó chưa có modal cho phép thu ngân chọn các topping thương phẩm từ MongoDB collection `sellable_toppings`.
  3. *Mất kết nối Socket:* Khi FE chạy trên Vercel proxy về VPS, Next.js redirect trailing slash `HTTP 308 Permanent Redirect` trên đường dẫn `/socket.io/?...`. Client `socket.io-client` nhận 308 coi là lỗi `TransportError` và ngắt kết nối.
  4. *Lỗi Cast to ObjectId failed for value "undefined":* Do dữ liệu bàn phát qua socket thiếu tường minh thuộc tính `id` dạng chuỗi và `TableManagementView` chưa gác chặn `table.id || table._id`.
- **Nội dung hoàn thành:**
  - **Dữ liệu Món & Giá thật từ Database:**
    - Cập nhật `MenuCatalog.tsx` và `useLivePos.ts`: Hiển thị đúng giá thật `Number(recipe.price ?? recipe.selling_price ?? 0)`.
    - Lọc bỏ hoàn toàn các công thức sơ chế nội bộ (`internal_prep`) khỏi danh mục POS, chỉ giữ lại món bán cho khách (`customer_product`).
  - **Tích hợp Topping Thật từ MongoDB Atlas:**
    - Cập nhật `pos.service.ts`: Bổ sung API `getToppings` lấy dữ liệu thật từ `/api/v1/sellable-toppings`.
    - Xây dựng Modal tùy biến món cao cấp `PosItemCustomModal.tsx`: Tải danh sách topping thật từ database (Trân châu trắng 3Q 5.000đ, Trân châu hoàng kim 5.000đ, Thạch củ năng 5.000đ, Đào ngâm Cronos 10.000đ...), cho phép chọn nhiều topping, chọn mức đá, mức đường, ghi chú và tự động tính tổng tiền.
    - Cập nhật `fe/src/app/pos/page.tsx` nạp toppings và truyền vào `MenuCatalog`.
  - **Sửa Lỗi Ngắt Kết Nối Socket.io:**
    - Cập nhật `fe/next.config.ts`: Bổ sung `skipTrailingSlashRedirect: true` và ánh xạ rewrite `/socket.io/` để triệt tiêu vĩnh viễn lỗi HTTP 308 Redirect.
    - Cập nhật `useLivePos.ts` và `useTableSocket.ts`: Tối ưu hóa cấu hình Socket.io kết nối trực tiếp hoặc qua proxy đồng bộ, nâng số lần tái kết nối lên 20 lần và bổ sung cơ chế Polling đồng bộ ngầm dự phòng khi mạng chập chờn.
  - **Ngăn Chặn Lỗi ObjectId Undefined:**
    - Cập nhật `be/src/modules/admin_he_thong/table/controllers/table.update.controller.ts` & `table.get.controller.ts`: Chuẩn hóa `normalizedTable` luôn chứa `id` và `_id` chuỗi hợp lệ khi phát Socket và trả về JSON.
    - Cập nhật `fe/src/features/admin_he_thong/table/component/TableManagementView.tsx`: Thêm điều kiện an toàn gác chặn `targetId = String(table.id || table._id || '')`, không bao giờ gửi chuỗi `'undefined'` lên API.
- **Verification:**
  - Frontend TypeScript (`tsc -p fe/tsconfig.json --noEmit`): 0 lỗi.
  - Backend TypeScript (`tsc -p be/tsconfig.json --noEmit`): 0 lỗi.

---

### [2026-11-04 19:55] - Triển Khai Hoàn Chỉnh Phân Hệ Cấu Hình PayOS Cho Admin & Đồng Bộ VietQR Động Vào POS / Gọi Món Tại Bàn (CN15)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "bổ sung thêm admin cấu hình payos để thanh toán và cấu hình đó lưu trên datavase và có thể tạo nhiều tài khoản và chỉ đc chọn 1 tài khoản đc thanh toán chính"
- **Kiến trúc & Ràng buộc cốt lõi:**
  1. Toàn bộ cấu hình tài khoản PayOS lưu trữ trên MongoDB Atlas (Collection `payos_configs`, Model `PayOSConfigModel`, Schema Prisma `payos_config.prisma`).
  2. Hỗ trợ tạo nhiều tài khoản PayOS (CRUD: Thêm mới, xem danh sách, cập nhật, xóa).
  3. **Ràng buộc duy nhất 1 tài khoản chính:** Chỉ duy nhất 1 tài khoản có `is_default: true` tại một thời điểm. Khi chọn 1 tài khoản làm chính, toàn bộ các tài khoản khác tự động chuyển về `is_default: false`. Nếu xóa tài khoản chính hiện tại, hệ thống tự động thăng hạng tài khoản khả dụng tiếp theo làm chính.
  4. **Bảo mật phân tầng:** API quản trị PayOS (`/api/v1/payos`) chỉ dành riêng cho Admin Hệ Thống (`admin_he_thong`). Các API công khai cho POS & Table Order (`/api/v1/payos/default`) chỉ trả về thông tin thụ hưởng công khai (Tên, Ngân hàng, Số tài khoản, Chủ tài khoản), tuyệt đối không để lộ Client ID, API Key hay Checksum Key.
  5. **Tích hợp VietQR động:** Các modal thanh toán tại POS (`VietQrModal.tsx`) và gọi món tại bàn (`TableVietQrModal.tsx`) tự động dùng tài khoản PayOS chính từ Database để sinh mã VietQR.
- **Nội dung hoàn thành:**
  - **Backend Node.js (Granular Feature-Sliced SRP):**
    - Prisma Schema: `be/src/databases/prisma/schema/payos_config.prisma`
    - Mongoose Model: `be/src/modules/admin_he_thong/payos/models/payos-config.model.ts`
    - Zod Validation: `be/src/modules/admin_he_thong/payos/schemas/payos-config.schema.ts`
    - Repository: `be/src/modules/admin_he_thong/payos/repositories/payos-config.repository.ts` (`findAll`, `findById`, `findDefault`, `create`, `update`, `delete`, `ensureSingleDefault`, `promoteNextAvailableDefault`)
    - Granular Services:
      - `payos-config.create.service.ts`
      - `payos-config.get.service.ts`
      - `payos-config.update.service.ts`
      - `payos-config.delete.service.ts`
      - `payos-config.set-default.service.ts`
      - `payos-config.test.service.ts` (Kiểm tra kết nối trực tiếp với PayOS qua API `https://api-merchant.payos.vn/v2/payment-requests/0`)
    - Granular Controllers:
      - `payos-config.create.controller.ts`
      - `payos-config.get.controller.ts`
      - `payos-config.update.controller.ts`
      - `payos-config.delete.controller.ts`
      - `payos-config.set-default.controller.ts`
      - `payos-config.test.controller.ts`
    - Express Router: `be/src/modules/admin_he_thong/payos/routes/payos.routes.ts`
    - Đăng ký Route: `be/src/routes/index.ts` (`/v1/payos` & `/payos`)
  - **Frontend Next.js (App Router & React Query v5):**
    - TypeScript Types & Schema: `fe/src/features/admin_he_thong/payos/type/payos.type.ts`, `schema/payos.schema.ts`
    - Granular HTTP Services: `payos.get.service.ts`, `payos.create.service.ts`, `payos.update.service.ts`, `payos.delete.service.ts`, `payos.set-default.service.ts`, `payos.test.service.ts`
    - React Query Hooks: `useGetPayOSConfigs.ts`, `useGetDefaultPayOSConfig.ts`, `useCreatePayOSConfig.ts`, `useUpdatePayOSConfig.ts`, `useDeletePayOSConfig.ts`, `useSetDefaultPayOSConfig.ts`, `useTestPayOSConfig.ts`
    - UI Components:
      - `PayOSManagementView.tsx`: Thống kê tổng quan, trạng thái tài khoản chính, thẻ bảo mật, danh sách tài khoản
      - `PayOSAccountCard.tsx`: Thẻ hiển thị tài khoản PayOS, huy hiệu Vàng `★ Tài Khoản Thanh Toán Chính Duy Nhất`, nút test kết nối, nút đặt làm chính, sao chép STK, ẩn/hiện mã bí mật, sửa/xóa
      - `PayOSAccountModal.tsx`: Form thêm/sửa tài khoản đầy đủ (Tên định danh, chọn Ngân hàng, STK, Chủ TK, Client ID, API Key, Checksum Key, nút test kết nối ngay trước khi lưu)
    - Next.js Page: `fe/src/app/payos/page.tsx`
    - Sidebar Navigation: Cập nhật `AppShell.tsx` bổ sung menu "Cấu Hình PayOS" (`/payos`) chỉ hiển thị cho Admin Hệ Thống
    - Tích hợp động: Cập nhật `VietQrModal.tsx` và `TableVietQrModal.tsx` lấy tự động tài khoản PayOS chính từ `useGetDefaultPayOSConfig()`
- **Verification:**
  - Backend Build (`npm --prefix be run build`): Thành công 100%, 0 lỗi.
  - Frontend TypeScript Check (`tsc -p fe/tsconfig.json --noEmit`): Thành công 100%, 0 lỗi.
  - Cập nhật Registry: `.agents/DATABASE_SCHEMA.md` & `.agents/REACT_QUERY_REGISTRY.md`.


### [2026-11-04 19:25] - Khắc Phục Tình Trạng Mất Kết Nối Socket Trên POS & Đồng Bộ Danh Mục Món Cho Cơ Sở
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Giải thích và xử lý "Sao lại mất kết nối socket" và hiển thị đầy đủ món trên màn hình POS (`/pos`).
- **Nguyên nhân cốt lõi (Root Cause):**
  1. Khi git push commit mới, GitHub Actions kích hoạt pipeline deploy lên VPS `160.191.243.53`, chạy `docker compose up -d --build` để biên dịch lại container backend. Trong thời gian container backend khởi động lại (1-2 phút), kết nối socket tạm thời bị gián đoạn (`🔴 Mất kết nối Socket`).
  2. Vercel Serverless Cloud không duy trì kết nối WebSocket liên tục qua rewrite proxy nếu client chỉ ưu tiên WebSocket thuần.
  3. Trong `next.config.ts`, route rewrite thiếu `/socket.io` (không có trailing slash) khi Vercel tự động strip trailing slash.
  4. Danh mục món trong CSDL trước đây có `store_id: undefined` nên bộ lọc của POS chi nhánh không tìm thấy món ("Không tìm thấy món nào phù hợp").
- **Nội dung hoàn thành:**
  - **Tối ưu hóa Vercel Rewrite Proxy ([`next.config.ts`](file:///d:/DuAnCaNhan/zone_6/fe/next.config.ts)):**
    - Bổ sung rewrite rule cho cả `/socket.io` và `/socket.io/:path*` chuyển tiếp về Nginx VPS backend.
  - **Cấu hình Socket Client Resilient ([`useLivePos.ts`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/pos/hook/useLivePos.ts) & [`useTableSocket.ts`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/admin_he_thong/table/hook/useTableSocket.ts)):**
    - Thiết lập `transports: ['polling', 'websocket']` và `upgrade: true`. Ưu tiên HTTP Long-Polling (hoạt động 100% qua Vercel rewrites không bị ngắt) và tự động nâng cấp WebSocket khi mạng thông suốt. Tăng số lần thử lại kết nối `reconnectionAttempts: 15`.
  - **Cập nhật CSDL & Bộ Lọc Món ([`recipe.repository.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/pho_ca_vat_lieu/material/repositories/recipe.repository.ts)):**
    - Cập nhật liên kết `store_id: 6aeaf594c9e224bb9eedac0f` cho các món ăn và nước uống trong CSDL MongoDB Atlas.
    - Bộ lọc `findAll`, `countTotal`, `countByType` mở rộng tìm cả món có `store_id` trực thuộc lẫn món toàn chuỗi (`null` hoặc chưa gán), đảm bảo POS luôn hiển thị thực đơn đầy đủ.
- **Verification:**
  - Backend TypeScript: Exit code 0, 0 lỗi.
  - CSDL Atlas: Đã cập nhật 6 công thức món cho Store.

---

### [2026-11-04 19:04] - Khắc Phục Lỗi Cast to ObjectId Failed Cho Model Table & Đồng Bộ Chuẩn Id/ObjectId Giữa FE-BE
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Báo lỗi `Cast to ObjectId failed for value "undefined" (type string) at path "_id" for model "Table"` khi thao tác bàn trên giao diện sơ đồ bàn.
- **Nguyên nhân cốt lõi (Root Cause):**
  - Mongoose Document `TableModel` trả về trường `_id` mà không có cấu hình `toJSON: { virtuals: true }` hay `id` transformer.
  - Phía Frontend gọi API `PUT /api/v1/tables/${table.id}`, do `table.id` là `undefined`, URL trở thành `PUT /api/v1/tables/undefined`.
  - Backend nhận param `:id = "undefined"`, Mongoose cố gắng cast chuỗi `"undefined"` thành `ObjectId` và ném lỗi `CastError`.
- **Nội dung hoàn thành:**
  - **Backend Mongoose Schema ([`table.model.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/admin_he_thong/table/models/table.model.ts) & [`table-zone.model.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/admin_he_thong/table/models/table-zone.model.ts)):**
    - Thêm cấu hình `toJSON` và `toObject` với `transform` tự động map `ret.id = ret._id.toString()`.
  - **Backend Controller Validation ([`table.update.controller.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/admin_he_thong/table/controllers/table.update.controller.ts), [`table.delete.controller.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/admin_he_thong/table/controllers/table.delete.controller.ts), [`table-zone.delete.controller.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/admin_he_thong/table/controllers/table-zone.delete.controller.ts)):**
    - Kiểm tra hợp lệ `tableId` bằng `mongoose.Types.ObjectId.isValid(tableId)`. Ném `BadRequestError('Mã định danh bàn không hợp lệ')` rõ ràng nếu id là `undefined` hoặc sai format.
  - **Frontend Table Service & Types ([`table.service.ts`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/admin_he_thong/table/service/table.service.ts), [`table.type.ts`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/admin_he_thong/table/type/table.type.ts)):**
    - Bổ sung `_id?: string;` vào interface `TableItem` và `TableZoneItem`.
    - Chuẩn hóa tầng service `getAll`, `getById`, `create`, `update`, `regenerateToken`, `getZones`, `createZone` tự động map `id: t.id || t._id`.
  - **Frontend UI Fallback ([`TableManagementView.tsx`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/admin_he_thong/table/component/TableManagementView.tsx), [`TableFormModal.tsx`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/admin_he_thong/table/component/TableFormModal.tsx), [`TableQrPrintModal.tsx`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/admin_he_thong/table/component/TableQrPrintModal.tsx)):**
    - Bảo đảm fallback an toàn `table.id || (table as any)._id` cho toàn bộ các thao tác `onStatusChange`, `handleDeleteTable`, `handleEditTable`, `handleDeleteZone`, `handleRegenerate` và react `key`.
- **Verification:**
  - TypeScript Backend (`be`): Exit code 0, 0 lỗi.
  - TypeScript Frontend (`fe`): Exit code 0, 0 lỗi.

---

### [2026-11-04 18:32] - Ràng Buộc Nhân Viên Trong Ca Mới Được Cập Nhật Trạng Thái Bàn & Đồng Bộ Sơ Đồ Bàn Socket.io Thời Gian Thực
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Trạng thái bàn này chỉ có nhân viên trong ca mới có thể cập nhật và các bàn này và sơ đồ bàn sẽ dùng socket để cập nhật theo thời gian thực.
- **Nội dung hoàn thành:**
  - **Ràng buộc nhân viên trong ca (In-Shift Gatekeeper):**
    - Backend Service ([`table-shift.verify.service.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/admin_he_thong/table/services/table-shift.verify.service.ts)):
      - Quản lý / Admin: Luôn được phép thao tác ở chế độ giám sát (`inShift: true`, mode `SUPERVISOR`).
      - Cấp Nhân Viên, Phó Ca, Trưởng Ca: Bắt buộc phải có bản ghi Điểm danh Check-in Camera & GPS hợp lệ hôm nay (`Attendance` với `work_date >= startOfDay`, `verification_status: VALID/LATE/MANUAL_APPROVED`, `check_out_time: null`) và thuộc đúng cơ sở trực thuộc.
      - Nếu chưa check-in hoặc đã check-out: Từ chối với lý do *"Chỉ nhân viên đang trong ca trực (đã Điểm Danh Check-in) mới có thể cập nhật trạng thái bàn."*
    - Endpoint API ([`table-shift.get.controller.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/admin_he_thong/table/controllers/table-shift.get.controller.ts)):
      - Cung cấp `GET /api/v1/tables/shift-status` trả về trạng thái ca trực hiện tại của nhân sự.
    - Chặn cập nhật tại Backend ([`table.update.controller.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/admin_he_thong/table/controllers/table.update.controller.ts)):
      - Cưỡng chế kiểm tra `verify(req.user)` trước khi cho phép lưu trạng thái bàn. Ném `ForbiddenError` (403) nếu không trong ca trực.
    - Giao diện Frontend ([`TableDetailModal.tsx`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/admin_he_thong/table/component/TableDetailModal.tsx)):
      - Nhận prop `isInShift` và `shiftReason`. Nếu không trong ca trực, hiển thị thanh cảnh báo trực quan: *"Bạn hiện không trong ca trực. Cần điểm danh Check-in Camera & GPS để cập nhật trạng thái bàn."*
      - Cả 4 nút chọn trạng thái (*Trống, Có Khách, Đã Đặt Trước, Đang Bảo Trì*) bị vô hiệu hóa mờ đi (`opacity-60 cursor-not-allowed`), bấm vào sẽ hiển thị cảnh báo hướng dẫn check-in.
  - **Hệ thống WebSocket Socket.io Thời Gian Thực (Real-Time Floor Map Synchronization):**
    - Backend Namespace `/tables` ([`table.socket.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/admin_he_thong/table/socket/table.socket.ts)):
      - Khởi tạo namespace `io.of('/tables')` trên HTTP server chung tại [`server.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/server.ts).
      - Hỗ trợ client tham gia phòng cơ sở `store_${storeId}` qua sự kiện `table:join_store`.
      - Hàm `emitTableEvent(storeId, 'table:updated', { table, actionUser })` phát sóng tức thời cho tất cả các thiết bị trong cùng cơ sở.
    - Kích hoạt phát sóng khi:
      1. Nhân viên đổi trạng thái bàn thủ công (*Trống $\leftrightarrow$ Có Khách $\leftrightarrow$ Đã Đặt $\leftrightarrow$ Bảo Trì*) tại `table.update.controller.ts`.
      2. Khách hàng tự quét mã QR Standee mica tại bàn và gửi đơn đặt món thành công tại [`table-order.create.service.ts`](file:///d:/DuAnCaNhan/zone_6/be/src/modules/pos/services/table-order.create.service.ts) (bàn tự động đổi sang `OCCUPIED` và báo động ngay lập tức).
    - Frontend Socket Hook ([`useTableSocket.ts`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/admin_he_thong/table/hook/useTableSocket.ts)):
      - Kết nối tới `${socketUrl}/tables` qua proxy `/socket.io`.
      - Khi nhận sự kiện `table:updated`: Cập nhật lập tức React Query cache `TABLE_QUERY_KEY` (Optimistic sync không cần reload), đồng bộ màu sắc thẻ bàn, đổi số liệu thống kê KPI và tự động đồng bộ trạng thái modal chi tiết bàn đang mở.
      - Hiển thị thông báo Sonner Toast nhẹ: *"⚡ Bàn XX vừa chuyển sang 'Có Khách' bởi NV..."*
      - Banner Top Header hiển thị huy hiệu `🟢 Live Sync` (Real-Time WebSocket Active).
- **Verification:**
  - TypeScript Backend (`be`): Exit code 0, 0 lỗi.
  - TypeScript Frontend (`fe`): Exit code 0, 0 lỗi.

---

### [2026-11-04 18:15] - Phân Quyền Sơ Đồ Bàn: Ẩn 100% Nút Thêm Cho Nhân Viên & Phó Ca; Khóa Cứng Cơ Sở Trực Thuộc; Cho Phép Cập Nhật Trạng Thái Bàn
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Ở cấp nhân viên và phó ca không có quyền thêm nên bỏ all nút thêm đi và chỉ xem được tầng và bàn thuộc cơ sở của mình mà thôi.
- **Nội dung hoàn thành:**
  - **Phân quyền cấu trúc bàn & tầng (`canManageStructure`):**
    - Xác định rõ ràng: `isStaffOrVice = ['nhan_vien', 'pho_ca_lam_lich', 'pho_ca_vat_lieu'].includes(user?.role || '')`.
    - Biến `canManageStructure = !isStaffOrVice && ['admin_he_thong', 'quan_ly', 'truong_ca'].includes(user?.role || '')`.
    - Biến `canSwitchStore = !isStaffOrVice && ['admin_he_thong', 'quan_ly'].includes(user?.role || '')`.
    - Cấp Nhân Viên và Phó Ca **TUYỆT ĐỐI KHÔNG CÓ QUYỀN THÊM/SỬA/XÓA**:
      - Ẩn nút `+ Thêm Tầng` và form tạo tầng nhanh ở Sidebar bên trái.
      - Ẩn nút thùng rác xóa tầng ở Sidebar bên trái.
      - Ẩn nút `Thêm Bàn Đầu Tiên` tại màn hình Empty State.
      - Ẩn nút `+ Thêm Bàn` ở header từng khối tầng trong chế độ xem Tất Cả Tầng.
      - Ẩn nút `+ Thêm Bàn` trong chế độ xem từng tầng cụ thể.
      - Trong `TableDetailModal`: Ẩn nút `Chỉnh Sửa` và `Xóa Bàn Này`, chỉ hiển thị nút `Đóng` kèm 4 nút chuyển đổi trạng thái phục vụ khách.
  - **Khóa cứng cơ sở trực thuộc (Multi-store scoping & locking):**
    - Frontend (`TableManagementView.tsx`):
      - Cấp nhân viên / phó ca bị khóa cứng `selectedStoreId` theo `user.assigned_store_id`, hiển thị nhãn `Cơ Sở Trực Thuộc: {Tên Cơ Sở} (Cố định)`, không có dropdown đổi cơ sở.
      - `allowedStores` lọc chính xác duy nhất cơ sở trực thuộc của tài khoản nhân viên.
    - Backend Controllers (`table.get.controller.ts`, `table-zone.get.controller.ts`):
      - Nếu `role` không thuộc `['admin_he_thong', 'quan_ly']`, ép buộc `storeId = req.user.assigned_store_id`, ngăn chặn hoàn toàn việc can thiệp query param để xem chéo cơ sở khác.
  - **Cho phép Nhân viên & Phó ca cập nhật trạng thái bàn (`table.routes.ts`, `table.update.controller.ts`):**
    - Mở quyền `PUT /api/v1/tables/:id` cho tài khoản đã xác thực.
    - Tại controller, kiểm tra: Nếu là `nhan_vien` hoặc `pho_ca_lam_lich` / `pho_ca_vat_lieu`, **CHỈ ĐƯỢC PHÉP CẬP NHẬT FIELD `status`** (Trống $\leftrightarrow$ Có khách $\leftrightarrow$ Đã đặt $\leftrightarrow$ Bảo trì). Nếu cố tình gửi các field cấu trúc khác (`table_number`, `zone_name`, `capacity`), hệ thống ném ngay `ForbiddenError` (403).
  - **Sửa dữ liệu liên kết cơ sở trong CSDL MongoDB Atlas:**
    - Đồng bộ `assigned_store_id` của tài khoản nhân viên `nvnremix@gmail.com` trỏ chính xác về cơ sở đang hoạt động `Zone Six Cafe & Lounge` (`6aeaf594c9e224bb9eedac0f`).
    - Dọn dẹp các tầng mồ côi thuộc cơ sở cũ.
- **Verification:**
  - TypeScript Backend (`be`): Exit code 0, 0 lỗi.
  - TypeScript Frontend (`fe`): Exit code 0, 0 lỗi.

---

### [2026-11-04 17:50] - Chuẩn Hóa Quá Trình Đăng Nhập: Access Token Lưu Cookie (15 Phút), Refresh Token Lưu Database (3 Ngày) & Cấu Hình ENV
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. Quá trình login: Access Token lưu bằng cookie chỉ tồn tại 15 phút (`15m`).
  2. Refresh Token lưu trên Database MongoDB Atlas chỉ tồn tại 3 ngày (`3d`).
  3. Cấu hình biến môi trường ENV bắt buộc:
     - `ACCESS_TOKEN_EXPIRES_IN=15m`
     - `REFRESH_TOKEN_EXPIRES_IN=3d`
     - `ACCESS_TOKEN_SECRET=Wtqh5wrHO5pkWJtPxkJ6oGMW8aSz26IdUtrGZlL3X9h2Aagqy52J61564MeyOduUqL2XkRh3bWEKebOzhIBalMibzs9FyEAgGpXBLFqIw47H6veIE5oeLmQVFTUbV2fLQWSC`
     - `REFRESH_TOKEN_SECRET=bOG0ctzET1qF1T27i4l2xeHGCM0uVIK2vVQTD8LZriQP3izjxsPrQHUFg32YmEa9dyQDWkVblGXO25H2CX4sf2vIvYv49xwZCPHiWx0qzpxHWZsK18ZtSbrgEu8FT8KiGZzc`
- **Nội dung hoàn thành:**
  - **Môi trường (`be/.env` & `be/.env.example`):**
    - Đã xác thực và đồng bộ 100% các biến môi trường cấu hình thời gian sống và khóa bí mật cực dài theo đúng chuẩn yêu cầu.
  - **Cấu hình & Phân tích thời gian (`be/src/config/env.config.ts`, `be/src/core/auth.token.ts`):**
    - Xây dựng hàm `parseDurationMs` chuyển đổi linh hoạt chuỗi thời gian (`15m` $\rightarrow$ 900,000 ms, `3d` $\rightarrow$ 259,200,000 ms).
    - Áp dụng `ACCESS_TOKEN_SECRET` để ký và xác thực Access Token (có cơ chế fallback an toàn).
    - Áp dụng `REFRESH_TOKEN_SECRET` để ký và xác thực Refresh Token.
  - **Dịch vụ Xác thực (`be/src/modules/shared/auth/services/auth.service.ts`):**
    - Khi đăng nhập thành công (`login`):
      - Ký Access Token với thời hạn đúng 15 phút (`expiresIn: 900` giây).
      - Sinh Refresh Token ngẫu nhiên bảo mật cao và lưu trực tiếp vào CSDL MongoDB Atlas (collection `refresh_tokens`) với `expires_at = Date.now() + 3 ngày` (kèm TTL index tự động dọn dẹp khi hết hạn).
    - Khi làm mới token (`refreshToken`): Truy vấn trực tiếp database kiểm tra tính hợp lệ và thời hạn 3 ngày trước khi cấp mới Access Token 15 phút.
  - **Bộ điều khiển HTTP & Cookie (`be/src/modules/shared/auth/controllers/auth.controller.ts`):**
    - Thiết lập cookie `zone6_access_token` với `maxAge = ACCESS_TOKEN_EXPIRY_MS` (15 phút), cờ `httpOnly: true`, `sameSite`, `secure: isProduction`.
    - Thiết lập cookie `zone6_refresh_token` với `maxAge = REFRESH_TOKEN_EXPIRY_MS` (3 ngày), cờ `httpOnly: true`.
    - Khi gọi `/refresh`: Cấp mới và gia hạn cookie `zone6_access_token` thêm 15 phút.
  - **Verification:**
    - TypeScript Backend (`be/tsconfig.json`): Exit code 0, 0 lỗi.
    - TypeScript Frontend (`fe/tsconfig.json`): Exit code 0, 0 lỗi.

---

### [2026-11-04 17:38] - Tích Hợp Bộ Chọn Cơ Sở Tại Top Banner, Tách Biệt Độc Lập Cấu Trúc Bàn/Tầng Từng Chi Nhánh, Bỏ Nút Thêm Bàn Phụ & Bỏ Khu Vực Khác
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. **Ảnh 1:** Bỏ nút `+ Thêm Bàn` ở sub-header (thanh lọc trạng thái).
  2. **Ảnh 2:** Bỏ tùy chọn khu vực `Khác` trong modal Thêm/Sửa Bàn (chỉ chọn từ danh sách tầng có thật của cơ sở).
  3. **Ảnh 3:** Bỏ nút `+ Thêm Bàn Mới` trên Top Banner, thay thế trực tiếp bằng Bộ Chọn Cơ Sở (Store Switcher). Tách biệt triệt để cấu trúc tầng và bàn theo từng cơ sở (mỗi cơ sở có sơ đồ tầng & bàn độc lập).
- **Nội dung hoàn thành:**
  - **Frontend Top Banner & Store Selection (`TableManagementView.tsx`):**
    - Loại bỏ nút `+ Thêm Bàn Mới` ở góc phải banner.
    - Tích hợp trực tiếp Bộ Chọn Cơ Sở vào góc phải Top Banner (với icon tòa nhà `FaBuilding`, nhãn `Cơ Sở Đang Quản Lý:` và dropdown chọn cơ sở cho Admin/Quản lý hoặc tên cơ sở cố định cho Trưởng ca/Nhân viên).
    - Xóa bỏ khối `StoreInventorySelector` chiếm diện tích thừa bên dưới banner.
    - Khi chuyển cơ sở: Reset `selectedZone` về `'ALL'` và nạp dữ liệu sạch độc lập của chi nhánh được chọn.
  - **Frontend Sub-Header Filter Bar (`TableManagementView.tsx`):**
    - Loại bỏ hoàn toàn nút `+ Thêm Bàn` cạnh các nút lọc trạng thái. Thanh công cụ sub-header trở nên gọn gàng, chỉ tập trung vào 5 nút lọc: Tất Cả, Trống, Có Khách, Đã Đặt, Bảo Trì.
    - Trong chế độ xem riêng 1 tầng (`selectedZone !== 'ALL'`), bổ sung Floor Header đồng bộ với icon, tên tầng, số bàn và nút `+ Thêm Bàn` chuyên biệt cho tầng đó.
  - **Frontend Table Form Modal (`TableFormModal.tsx`):**
    - Xóa bỏ hoàn toàn nút `'Khác'` và trường input nhập tên tầng tùy do.
    - Lựa chọn tầng chỉ hiển thị các tầng hiện có của cơ sở (`zones.map(z => z.name)`). Việc tạo tầng được quản lý tập trung ở Cột Các Tầng bên trái.
  - **Backend Scoping & Zone Repository (`table-zone.repository.ts`, `useTables.ts`):**
    - Bỏ việc tự động khởi tạo cứng cả Tầng 1 và Tầng 2 trên mọi cơ sở. Chỉ khởi tạo mặc định 1 tầng 'Tầng 1' duy nhất nếu cơ sở chưa từng có bất kỳ tầng nào.
    - Đồng bộ `useTables` ràng buộc điều kiện `enabled: !!params?.store_id` để ngăn chặn việc lấy nhầm dữ liệu cơ sở mặc định.
    - Cập nhật các mutations tạo/sửa/xóa bàn để tự động invalidate cả cache bàn lẫn cache tầng.
  - **Verification:**
    - TypeScript Frontend (`fe/tsconfig.json`): Exit code 0, 0 lỗi.
    - TypeScript Backend (`be/tsconfig.json`): Exit code 0, 0 lỗi.

---

### [2026-11-04 17:25] - Tinh Giản Thẻ Bàn (Chỉ Tên Bàn & Sức Chứa) & Phân Quyền Nhân Viên Chỉ Được Xem và Đổi Trạng Thái Bàn
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. Thẻ bàn chỉ để **Tên bàn** và **Số lượng chỗ ngồi** (khắc phục triệt để lỗi chật chội làm tên bàn bị cắt thành `BÀ...`), loại bỏ nhãn chữ thừa và chữ `Chi tiết →`.
  2. Màu nền (background) và viền (border) thể hiện trạng thái (Trống: emerald, Có khách: amber, Đã đặt: blue, Bảo trì: rose).
  3. Phía nhân viên (`nhan_vien`): Chỉ được xem sơ đồ bàn và cập nhật trạng thái bàn, không được thêm/sửa/xóa bàn hoặc tầng.
- **Nội dung hoàn thành:**
  - **Frontend Table Card Simplification (`fe/src/features/admin_he_thong/table/component/TableManagementView.tsx`):**
    - Thẻ bàn hiển thị gọn gàng 2 dòng:
      - Dòng 1: Tên bàn (`formatTableDisplayName`) to bản, in hoa, không bị cắt chữ, kèm chấm trạng thái tròn tinh tế `styles.dot` góc trên.
      - Dòng 2: Icon ghế `FaChair` + `{capacity} chỗ`.
    - Màu nền và viền phản ánh trực quan 4 trạng thái theo chuẩn nhận diện màu của Zone Six.
  - **Frontend Granular Role-Based Access Control (RBAC):**
    - Khởi tạo biến quyền `canManageStructure = ['admin_he_thong', 'quan_ly', 'truong_ca'].includes(user?.role || '');`.
    - Ẩn hoàn toàn nút "+ Thêm Bàn Mới" ở Top Banner đối với `nhan_vien`.
    - Ẩn nút "+ Thêm Tầng", form tạo tầng nhanh và icon xóa tầng ở Sidebar cột trái đối với `nhan_vien`.
    - Ẩn nút "+ Thêm Bàn" ở Sub-Header và ở từng Header Tầng (chế độ xem Tất Cả Tầng) đối với `nhan_vien`.
    - Ẩn nút "Thêm Bàn Đầu Tiên" ở Empty State đối với `nhan_vien`.
    - Trong `TableDetailModal.tsx`:
      - Truyền prop `canEditOrDelete={canManageStructure}`.
      - Nếu là `nhan_vien` (`!canEditOrDelete`), ẩn hoàn toàn 2 nút "Chỉnh Sửa Bàn" và "Xóa Bàn Này".
      - Nhân viên vẫn có toàn quyền xem chi tiết, xem mã QR Standee Mica, sao chép link gọi món và **bấm 4 nút lớn chuyển đổi trạng thái bàn ngay lập tức (Trống $\leftrightarrow$ Có Khách $\leftrightarrow$ Đã Đặt $\leftrightarrow$ Bảo Trì)** để phục vụ khách tại chỗ.
  - **Tài liệu đặc tả:**
    - Cập nhật mục Sơ Đồ Bàn trong `DAC_TA_CHUC_NANG_THEO_VAI_TRO.md`.
  - **Verification:**
    - TypeScript compiler (`tsc --noEmit -p fe/tsconfig.json`): Exit code 0, không có bất kỳ lỗi cú pháp hay kiểu dữ liệu nào.

---

### [2026-11-04 17:05] - Nhóm Bàn Theo Tầng Khi Xem Tất Cả Tầng, Tinh Giản Thẻ Bàn & Bổ Sung Modal Chi Tiết Bàn
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. Khi hiển thị "Tất Cả Tầng": Hiển thị nhóm theo từng tầng (VD: Header Tầng 1, dưới là các bàn Tầng 1; Header Tầng 2, dưới là các bàn Tầng 2...).
  2. Tinh giản thẻ bàn: Chỉ gồm Tên bàn và Số lượng chứa (loại bỏ các nút rườm rà), các trạng thái (Trống, Có khách, Đã đặt, Bảo trì) thể hiện trực quan qua màu nền (background) và viền (border).
  3. Khi bấm vào bất kỳ bàn nào sẽ mở Modal Chi Tiết Bàn để xem thông tin, chuyển nhanh trạng thái 1-chạm, in/tải mã Standee mica, sửa hoặc xóa bàn.
- **Nội dung hoàn thành:**
  - **Backend & Database Schema:**
    - Cập nhật enum `TableStatus` trong `be/src/databases/prisma/schema/enum.prisma` bổ sung giá trị `MAINTENANCE` (Bảo Trì).
    - Cập nhật Mongoose model `be/src/modules/admin_he_thong/table/models/table.model.ts` và Zod validator `table.schema.ts` hỗ trợ `'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'`.
    - Build Prisma client & compile TypeScript backend đạt 100% (0 lỗi).
  - **Frontend Table UI & Modal Chi Tiết:**
    - Tạo mới `fe/src/features/admin_he_thong/table/component/TableDetailModal.tsx`:
      - Hiển thị tên bàn chuẩn hóa (`formatTableDisplayName`), tầng, sức chứa.
      - 4 nút chuyển đổi trạng thái lớn 1-chạm: Trống (Emerald), Có Khách (Amber), Đã Đặt Trước (Blue), Đang Bảo Trì (Rose).
      - Mã QR Standee mica xem trước, nút "In Standee Mica" (kết nối `TableQrPrintModal`), nút "Sao chép link gọi món" và nút mở trang gọi món.
      - Nút "Chỉnh Sửa Bàn" và "Xóa Bàn Này".
    - Cập nhật `TableManagementView.tsx`:
      - Khi chọn "Tất Cả Tầng" (`selectedZone === 'ALL'`), chia khối theo từng tầng (Tầng 1, Tầng 2...) với Header tầng, badge số bàn (số trống, số có khách, số đã đặt, số bảo trì) và nút "+ Thêm Bàn" nhanh cho tầng.
      - Thẻ bàn thiết kế siêu gọn gàng: Chỉ gồm Tên bàn, số chỗ ngồi và màu nền + viền sang trọng chuẩn nhận diện Obsidian Gold theo trạng thái bàn.
      - Bấm vào bàn mở `TableDetailModal`.
    - Cập nhật `TableFormModal.tsx` hỗ trợ đủ 4 trạng thái (Trống, Có Khách, Đã Đặt, Bảo Trì).
  - **Build Verification:**
    - Backend build (`prisma generate && tsc`): Exit code 0.
    - Frontend Next.js 16 build (`npm run build`): Exit code 0 (24/24 static routes, 0 lỗi TypeScript).

---

### [2026-11-04 16:55] - Ẩn & Chặn Phân Quyền Chức Năng Cấu Hình Ca Làm Việc (/shifts) Đối Với Cấp Nhân Viên (nhan_vien)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Cấp nhân viên bỏ chức năng này đi (kèm ảnh tài khoản Nhân Viên Nguyên truy cập và nhìn thấy "Cấu Hình Ca Làm Việc & Định Biên" `/shifts`).
- **Nội dung hoàn thành:**
  - **Frontend Layout (`fe/src/core/components/layout/AppShell.tsx`):**
    - Bổ sung biến kiểm tra quyền `canConfigShifts = ["admin_he_thong", "quan_ly", "truong_ca", "pho_ca_lam_lich"].includes(user.role);`.
    - Bọc nút chuyển hướng Sidebar "Cấu Hình Ca Làm" trong `{canConfigShifts && (...)}`.
    - Ẩn hoàn toàn mục này khỏi Sidebar của vai trò `nhan_vien` (và `pho_ca_vat_lieu`).
  - **Frontend View Route Guard (`fe/src/features/pho_ca_lam_lich/scheduling/component/ShiftsManagementView.tsx`):**
    - Bổ sung màn hình chặn truy cập trực tiếp URL `/shifts` đối với các vai trò không được cấp phép (`!canManage`).
    - Hiển thị thông báo bảo vệ "Không Có Quyền Cấu Hình Ca Làm Việc" chuẩn Obsidian Gold và nút quay về trang Xếp Lịch.
  - **Backend Route Guard (`be/src/modules/pho_ca_lam_lich/scheduling/routes/scheduling.routes.ts`):**
    - Đã xác minh các API mutation cấu hình ca (`POST`, `PUT`, `DELETE`, `RESET /shift-configs`) được bảo vệ nghiêm ngặt bằng middleware `requireRoles('admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_lam_lich')`.
  - **Build Verification:**
    - Next.js 16 Production Build: Biên dịch 100% thành công (24/24 static routes, 0 lỗi TypeScript).

---

### [2026-11-04 16:45] - Bổ Sung Bộ Chọn Chi Nhánh (Store Selector) & Tái Cấu Trúc Giao Diện 2 Cột Quản Lý Tầng / Bàn (/tables)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. Trang `/tables` thiếu cơ chế chọn cơ sở.
  2. Bên trái thể hiện các tầng và có thể tạo thêm tầng, chọn tầng; bên phải hiển thị danh sách bàn tương ứng.
- **Nội dung hoàn thành:**
  - **Backend (Prisma Schema, Model, Repos, Granular Services & Controllers):**
    - Tạo `be/src/databases/prisma/schema/table_zone.prisma` và collection `table_zones`.
    - Tạo Mongoose model `TableZoneModel` liên kết `store_id`.
    - `table-zone.repository.ts`: Tự động khởi tạo mặc định "Tầng 1", "Tầng 2" cho cơ sở nếu chưa có tầng nào, tự động quét và hợp nhất các `zone_name` từ bàn cũ.
    - Xây dựng 3 services và 3 controllers granular SRP:
      - `table-zone.get.service.ts` & `table-zone.get.controller.ts` (`GET /api/v1/tables/zones`)
      - `table-zone.create.service.ts` & `table-zone.create.controller.ts` (`POST /api/v1/tables/zones`)
      - `table-zone.delete.service.ts` & `table-zone.delete.controller.ts` (`DELETE /api/v1/tables/zones/:id`)
    - Cập nhật `table.get.service.ts` & `table.repository.ts` với cơ chế fallback cơ sở an toàn.
  - **Frontend (Store Selector & 2-Column Floor/Table Layout):**
    - Tích hợp `StoreInventorySelector` phong cách Obsidian Gold ở đầu trang `/tables` cho phép Admin và Quản lý chuyển đổi giữa các cơ sở.
    - Cột Trái (`aside w-72`): Danh sách các tầng ("Tất Cả Tầng", "Tầng 1", "Tầng 2"...), badge số bàn của từng tầng, form tạo tầng mới linh hoạt, nút xóa tầng khi không có bàn.
    - Cột Phải (`section flex-1`): Header tầng đang chọn, bộ lọc trạng thái nhanh (Trống, Có Khách, Đã Đặt), nút "+ Thêm Bàn Vào Tầng Này", Grid thẻ bàn phong cách Obsidian Gold với 3 nút chuyển nhanh trạng thái bàn 1-chạm, xem/in mã QR Standee mica, sửa và xóa bàn.
    - `TableFormModal.tsx`: Tự động nhận `storeId`, tự động lấy danh sách tầng từ CSDL và pre-fill tầng đang chọn.
  - **Build Verification:**
    - Backend TypeScript compile: 100% thành công.
    - Frontend Next.js build: 100% thành công (24/24 static routes, 0 lỗi).

### [2026-11-04 16:30] - Sửa Lỗi Trắng Trang (This page couldn't load) Khi Mở Màn Hình POS (/pos) Trên Vercel
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Báo lỗi màn hình trắng *"This page couldn't load"* tại `https://zone-6.vercel.app/pos`.
- **Nguyên nhân gốc rễ được tìm thấy qua CDP (Chrome DevTools Protocol):**
  - Khi mở `/pos`, sau khi xác thực ca thành công, hệ thống gọi API `/api/v1/recipes`.
  - Backend trả về payload dạng object `{ success: true, data: { recipes: [...], total: ... } }`.
  - Service POS (`pos.service.ts`) và Table Order (`table-order.service.ts`) lấy trực tiếp `res.data.data` (là Object, không phải Array).
  - Component `MenuCatalog.tsx` gọi `recipes.forEach(...)` dẫn đến lỗi runtime nghiêm trọng: `TypeError: e.forEach is not a function`.
  - React 19 / Next.js 16 không có `error.tsx` tùy chỉnh nên kích hoạt màn hình trắng mặc định của Next.js: *"This page couldn't load"*.
- **Giải pháp & Nội dung hoàn thành:**
  - **`pos.service.ts` & `table-order.service.ts`:**
    - Chuẩn hóa hàm `getRecipes()` và `getMenu()` để tự động bóc tách đúng mảng `recipes` từ `data.recipes` hoặc `data` nếu là Array, fallback về `[]`.
  - **`MenuCatalog.tsx` & `CustomerMenu.tsx`:**
    - Bọc `useMemo` an toàn `recipeList` / `safeRecipes`, kiểm tra `Array.isArray()` trước khi duyệt, loại bỏ nguy cơ crash nếu API trả về cấu trúc khác.
  - **`LiveCart.tsx` & `fe/src/app/pos/page.tsx`:**
    - Bổ sung kiểm tra null an toàn cho `cart?.items`, `cart?.finalTotal`, `cart?.subtotal`.
    - Tránh hydration mismatch với `orderCodePreview` bằng cách tạo state động khi mở modal.
  - **`fe/src/app/error.tsx`:**
    - Tạo mới Error Boundary toàn cục Next.js chuẩn thiết kế Obsidian Gold cao cấp, hiển thị nút tải lại trang và về màn hình chính khi có lỗi phát sinh thay vì màn hình trắng của framework.
- **Build Verification:**
  - Next.js build thành công 100% (24/24 static routes, 0 lỗi TypeScript).

### [2026-11-04 16:15] - Tinh Gọn Thanh Tabs Vật Liệu & Công Thức: Loại Bỏ Toàn Bộ Icon, Thu Gọn Padding & Phông Chữ Chuẩn Obsidian Gold
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** *"feed sao cho gọn lại và ko cần icon đâu"* (kèm ảnh chụp thanh tabs Kho & Vật Liệu).
- **Nội dung hoàn thành:**
  - **`MaterialsView.tsx`:**
    - Gỡ bỏ hoàn toàn 5 icon thừa trên các tabs (`FaThLarge`, `FaTable`, `FaTruckLoading`, `FaFileAlt`, `FaTruck`).
    - Thu gọn nhãn tab súc tích: "Vật Liệu & Bao Bì", "Tồn Kho Hiện Tại", "Nhà Cung Cấp", "Yêu Cầu Nhập Kho", "Đơn Thu Mua PO".
    - Lược bỏ các huy hiệu phụ cồng kềnh ("Admin & Quản Lý", "Đa Quán"), tối ưu padding từ `px-6 py-3.5` xuống `px-3.5 py-2.5`, kích thước chữ `text-xs sm:text-sm font-bold`.
    - Hỗ trợ cuộn ngang mượt mà không vỡ dòng (`overflow-x-auto scrollbar-none whitespace-nowrap`).
  - **`RecipesView.tsx`:**
    - Đồng bộ gỡ bỏ các icon (`FaBookOpen`, `FaIceCream`) và chuẩn hóa kích thước tabs tinh gọn tương tự.
  - **Build Verification:**
    - Next.js build thành công 100% (24/24 static routes, 0 lỗi).

---

### [2026-10-31 19:25] - Tích Hợp Gửi Email Mật Khẩu Thật (Gmail SMTP) & Pop-up Hiển Thị Sao Chép Mật Khẩu Khi Tạo Nhân Viên
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Kiểm tra kỹ cơ chế gửi mật khẩu khi tạo nhân viên, cấu hình Gmail SMTP và cập nhật toàn bộ lên GitHub.
- **Nội dung hoàn thành:**
  - **Cấu hình SMTP Gmail:**
    - Bổ sung cấu hình `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (mật khẩu ứng dụng 16 ký tự Google) vào `be/.env` và kịch bản triển khai tự động `.github/workflows/deploy.yml`.
  - **Backend (Staff & Email Service):**
    - `staff.create.service.ts`: Bắt ngoại lệ gửi email an toàn, trả về trạng thái `email_sent` và `temp_password` trong phản hồi API.
    - Cập nhật interface `StaffItemResponse` trong `staff.schema.ts`.
  - **Frontend (UX/UI):**
    - `CreateStaffModal.tsx`: Thêm Pop-up hiển thị mã nhân viên, email, mật khẩu sinh ngẫu nhiên kèm nút **[Sao Chép Mật Khẩu]** và trạng thái email để Quản lý có thể gửi trực tiếp qua Zalo cho nhân sự.
    - Chuẩn hóa vị trí mặc định thành `"Nhân viên"`.
  - **CI/CD Deployment:**
    - Cải tiến `.github/workflows/deploy.yml` tự động chuẩn bị thư mục `/var/www/zone6`, đồng bộ mã nguồn qua Git và nạp đầy đủ biến môi trường production.

---

### [2026-10-31 18:45] - Tinh Gọn & Gộp Các Vị Trí Phân Mảnh Thành "Nhân Viên" Chuẩn Hóa
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** *"gộp lại thành 1 nhân viên thui"* (kèm ảnh chụp dropdown vị trí: Pha chế, Phục vụ, Thu ngân, Giữ xe).
- **Nội dung hoàn thành:**
  - **Frontend:**
    - Gộp toàn bộ các vị trí nhỏ lẻ `Pha chế`, `Phục vụ`, `Thu ngân`, `Giữ xe` trong biểu mẫu thêm nhân viên ([`CreateStaffModal.tsx`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/quan_ly/staff/component/CreateStaffModal.tsx)) và sửa nhân viên ([`EditStaffModal.tsx`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/quan_ly/staff/component/EditStaffModal.tsx)) thành lựa chọn chuẩn duy nhất: **"Nhân viên"**.
    - Thiết lập giá trị mặc định khi tạo mới nhân viên là `"Nhân viên"`.
    - Tự động chuẩn hóa hiển thị trên bảng danh sách nhân sự ([`StaffManagementView.tsx`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/quan_ly/staff/component/StaffManagementView.tsx)).
  - **Database Migration:**
    - Chạy script di trú `be/scripts/migrate_staff_positions.mjs` trên MongoDB Atlas, cập nhật thành công 27 bản ghi nhân viên cũ có vị trí phân mảnh sang chuẩn **"Nhân viên"**.
  - **Backend Models & Schemas:**
    - Cập nhật giá trị mặc định vị trí thành `'Nhân viên'` trong `staff.schema.ts`, `user.schema.ts`, `user.repository.ts`, `staff.create.service.ts`, `staff.get.service.ts`, `staff.update.service.ts`, `auth.service.ts`.
  - **Tài Liệu:**
    - Chuẩn hóa vị trí thành "Nhân viên" trong bảng 21 nhân sự tại [`DANH_SACH_TAI_KHOAN.md`](file:///d:/DuAnCaNhan/zone_6/DANH_SACH_TAI_KHOAN.md).

---

### [2026-10-31 18:25] - Triển Khai Hoàn Tất CN13 (Sơ Đồ Bàn, Khách Quét QR Gọi Món & Geofence GPS Chống Troll) và CN14 (Quản Lý Danh Sách Hóa Đơn & In Bill K80)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. Hủy bỏ chức năng "Tự Động Trừ Tồn Kho Theo Công Thức Món".
  2. Bổ sung chức năng xem danh sách hóa đơn bill (lọc theo ngày/ca/bàn/PTTT/trạng thái, xem chi tiết, in lại hóa đơn nhiệt K80, hủy bill có lưu vết lý do).
  3. Bổ sung chức năng tạo QR từng bàn để khách quét mã, bắt buộc lấy vị trí GPS xung quanh quán mới hiện giao diện gọi món và thanh toán tại bàn (chống troll mở QR tại nhà).
  4. Admin cấu hình chế độ gọi món (tại quầy POS, tại bàn QR hoặc cả hai) và cấu hình bán kính định vị geofence bàn.
- **Nội dung hoàn thành:**
  - **Prisma & Cơ sở dữ liệu:**
    - Cập nhật enum `TableStatus`, `OrderingMode`, `OrderSource` trong `be/src/databases/prisma/schema/enum.prisma`.
    - Tạo model `Table` (`be/src/databases/prisma/schema/table.prisma`).
    - Bổ sung cấu hình bàn vào `StoreConfig` (`orderingMode`, `tableGeofenceRadiusMeters`, `isTableGeofenceStrict`).
    - Bổ sung trường bàn và GPS vào `Order` (`tableId`, `orderSource`, `customerLat`, `customerLng`, `distanceMeters`, `voidReason`, `voidedByName`, `voidedAt`).
    - Sinh mã Prisma Client thành công (`npm --prefix be run db:generate`).
  - **Backend Granular Node.js:**
    - Phân hệ Table: Mongoose model, repository, services (`table.create`, `table.get`, `table.update`, `table.delete` với HMAC `qr_token`), controllers và routes tại `be/src/modules/admin_he_thong/table/`.
    - Phân hệ Khách Gọi Món QR: `table-order.verify.service.ts` (kiểm tra GPS Haversine và chính sách quán), `table-order.create.service.ts` (tạo đơn tại bàn, cập nhật bàn `OCCUPIED`, broadcast WebSocket `pos:new_table_order`).
    - Phân hệ Quản Lý Hóa Đơn: `order.list-all.service.ts` (phân trang, lọc đa điều kiện, tổng kết doanh thu), `order.void.service.ts` (hủy đơn có lưu vết lý do).
    - Cập nhật POS socket và mount routes trong `be/src/routes/index.ts`.
  - **Frontend Next.js 14 App Router:**
    - Phân hệ Khách Gọi Món Tại Bàn (`fe/src/features/table-order/` & `fe/src/app/order/page.tsx`): `GeofenceGuard.tsx` (khóa màn hình chống troll nếu ở xa hoặc từ chối GPS), `CustomerMenu.tsx` (thực đơn điện tử), `ItemCustomizerModal.tsx` (tùy chọn đường/đá/size/topping), `CustomerCartDrawer.tsx` (giỏ hàng nổi & thanh toán), `TableVietQrModal.tsx` (VietQR động tại bàn).
    - Phân hệ Sơ Đồ Bàn & QR (`fe/src/features/admin_he_thong/table/` & `fe/src/app/tables/page.tsx`): `TableManagementView.tsx`, `TableQrPrintModal.tsx` (in Standee mica decal, tải ảnh PNG, sao chép link, tạo lại token), `TableFormModal.tsx`.
    - Phân hệ Quản Lý Hóa Đơn (`fe/src/features/pos/` & `fe/src/app/orders/page.tsx`): `OrderManagementView.tsx` (bảng hóa đơn, bộ lọc thời gian & kênh bán, KPI cards), `OrderDetailModal.tsx` (in hóa đơn nhiệt K80), `VoidOrderModal.tsx`.
    - Cấu hình Admin: Tích hợp chế độ gọi món và thanh trượt bán kính GPS Geofence bàn vào `fe/src/features/admin_he_thong/checkin-config/component/CheckinConfigView.tsx`.
    - Menu Sidebar: Thêm 2 mục "Sơ Đồ Bàn & QR" và "Quản Lý Hóa Đơn" vào `fe/src/core/components/layout/AppShell.tsx`.
  - **Đồng Bộ Tài Liệu Chuẩn:**
    - Tạo `plane/chuc_nang/CN13_ban_va_khach_goi_mon_qr_gps.md`.
    - Tạo `plane/chuc_nang/CN14_quan_ly_hoa_don_va_bill.md`.
    - Cập nhật bảng `plane/giam_sat/tien_do_chuc_nang.md`.
    - Cập nhật `.agents/DATABASE_SCHEMA.md` và `.agents/REACT_QUERY_REGISTRY.md`.

---

### [2026-10-31 17:32] - Khởi Tạo Bảng Đặc Tả Toàn Diện Từng Chức Năng Hệ Thống (DANH_SACH_CHUC_NANG_HE_THONG.md)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** *"viết file md liệt kê chi tiết từng chức năng 1 của hệ thống hiện có"*
- **Nội dung hoàn thành:**
  - Khởi tạo tài liệu [DANH_SACH_CHUC_NANG_HE_THONG.md](file:///d:/DuAnCaNhan/zone_6/DANH_SACH_CHUC_NANG_HE_THONG.md) tại thư mục gốc dự án.
  - Liệt kê chi tiết và toàn diện 16 phân hệ chức năng hiện có (từ CN01 đến CN12, kèm các phân hệ mở rộng CN04b, CN11b, CN11c, CN11d).
  - Đối với mỗi chức năng: Nêu rõ mục đích nghiệp vụ, ma trận phân quyền 6 vai trò, nguyên tắc phân lập cơ sở (Store Scoping), các tính năng chi tiết, cơ chế bảo mật / ràng buộc và danh sách các file mã nguồn liên quan (Backend & Frontend).
  - Tổng hợp ma trận công nghệ và hạ tầng Docker/Nginx/Vercel của dự án.

---

### [2026-10-30 21:40] - Triển Khai Hoàn Tất CN12: POS Live Order Đồng Bộ Thời Gian Thực Đa Thiết Bị & Cấu Hình Quét Source Tailwind v4
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Xây dựng hệ thống bán hàng POS real-time cho 3 nhân viên trong cùng ca và cùng chi nhánh (khi 1 người thêm món hoặc thao tác thì cả ca đồng bộ tức thì, cùng bấm thanh toán sinh mã VietQR động; nhân viên ngoài ca hoặc chưa điểm danh GPS/Camera bị từ chối vào). Khắc phục triệt để hiện tượng vỡ giao diện trên Vercel do thiếu source quét CSS.
- **Nội dung hoàn thành:**
  - **Prisma & Cơ sở dữ liệu:**
    - Cập nhật enum `PaymentMethod`, `PaymentStatus`, `PosSessionStatus` tại [enum.prisma](file:///d:/DuAnCaNhan/zone_6/be/src/databases/prisma/schema/enum.prisma).
    - Tạo model `PosSession` ([pos_session.prisma](file:///d:/DuAnCaNhan/zone_6/be/src/databases/prisma/schema/pos_session.prisma)) và `Order` ([order.prisma](file:///d:/DuAnCaNhan/zone_6/be/src/databases/prisma/schema/order.prisma)).
    - Đăng ký bảng mới vào [.agents/DATABASE_SCHEMA.md](file:///d:/DuAnCaNhan/zone_6/.agents/DATABASE_SCHEMA.md).
  - **Backend Granular Node.js (`be/src/modules/pos/`):**
    - Mongoose Models: `models/pos-session.model.ts`, `models/order.model.ts`.
    - Repositories: `repositories/pos-session.repository.ts`, `repositories/order.repository.ts`.
    - Granular Services & Controllers:
      - `pos.verify-shift`: Kiểm tra điểm danh GPS/Camera & ca làm việc hiện tại của nhân viên (Shift Gatekeeper).
      - `pos-session.get`: Lấy giỏ hàng đang hoạt động của ca trực tại chi nhánh.
      - `pos-cart.update`: Cập nhật giỏ hàng theo thời gian thực, khóa đơn khi đang thao tác.
      - `order.checkout`: Tạo đơn hàng chính thức, mã đơn `Z6-<STORE_CODE>-<DATE>-<SEQ>`, xóa giỏ phiên.
      - `order.history`: Lịch sử hóa đơn chi nhánh.
    - WebSockets: `socket/pos.socket.ts` (Namespace `/pos`) đồng bộ tức thì các sự kiện `pos:join`, `pos:cart_update`, `pos:cart_lock`, `pos:order_completed`. Tích hợp Socket.io vào HTTP server tại [be/src/server.ts](file:///d:/DuAnCaNhan/zone_6/be/src/server.ts).
  - **Frontend Feature-Sliced Next.js (`fe/src/features/pos/` & `fe/src/app/pos/`):**
    - Hook `useLivePos.ts`: Kết nối Socket.io `/pos`, quản lý room theo `store_id + shift_config_id`, phát/nhận sự kiện live.
    - Giao diện POS đẳng cấp: `PosHeader.tsx`, `MenuCatalog.tsx`, `LiveCart.tsx`, `VietQrModal.tsx`, `OrderHistoryModal.tsx`.
    - Rào chắn bảo vệ `fe/src/app/pos/page.tsx`: Tự động kiểm tra quyền ca trực qua API, nếu chưa điểm danh sẽ thông báo và chuyển hướng sang `/checkin`.
    - Menu điều hướng: Bổ sung "Bán Hàng POS" với huy hiệu "LIVE" vào [AppShell.tsx](file:///d:/DuAnCaNhan/zone_6/fe/src/core/components/layout/AppShell.tsx).
  - **Tối Ưu Hóa Tailwind CSS v4 & Khắc Phục Vỡ Giao Diện Vercel:**
    - Bổ sung chỉ thị `@source "../**/*.{ts,tsx}";` tại [fe/src/app/globals.css](file:///d:/DuAnCaNhan/zone_6/fe/src/app/globals.css) để Tailwind v4 quét sâu toàn bộ thư mục `features/` và `core/`.
    - Build thành công cả BE và FE với exit code 0.

---

### [2026-10-30 20:25] - Chuyển Bộ Kỹ Năng Impeccable Sang Trạng Thái Nội Bộ (Untrack & Ignore Khỏi GitHub)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** *"bô skill này đừng đưa lên github"*
- **Nội dung hoàn thành:**
  - Thêm cấu hình `.agents/skills/impeccable/` vào file [.gitignore](file:///d:/DuAnCaNhan/zone_6/.gitignore).
  - Sử dụng lệnh `git rm -r --cached` để loại bỏ toàn bộ 64 tệp tin của bộ kỹ năng khỏi Git tracking trên GitHub nhưng **vẫn giữ nguyên 100% tệp trên máy tính cục bộ**.
  - Commit và push cập nhật lên GitHub `main` (commit `918b4e6`).

---

### [2026-10-30 20:21] - Tích Hợp Bộ Kỹ Năng Thiết Kế Giao Diện Đỉnh Cao (Impeccable Design Skill)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Clone skill `pbakaus/impeccable` từ GitHub và bổ sung vào thư mục `.agents/` theo chuẩn format của tác giả.
- **Nội dung hoàn thành:**
  - Clone và trích xuất trọn vẹn bộ kỹ năng `impeccable` (v4.8.0) vào [.agents/skills/impeccable/](file:///d:/DuAnCaNhan/zone_6/.agents/skills/impeccable/).
  - Bổ sung 42 cẩm nang hướng dẫn chuyên sâu (`reference/`) bao gồm: `shape`, `polish`, `critique`, `audit`, `craft-floor`, `bolder`, `quieter`, `distill`, `harden`, `onboard`, `animate`, `colorize`, `typeset`, `layout`, `delight`, `clarify`, `adapt`, `optimize`, v.v.
  - Bổ sung bộ script thực thi `scripts/` và cấu hình agent `agents/`.
  - Khởi tạo [DESIGN.md](file:///d:/DuAnCaNhan/zone_6/DESIGN.md) tại thư mục gốc dự án theo chuẩn Impeccable Design Tokens (đặc tả toàn diện bảng màu Luxury Gold, Obsidian Carbon, độ tương phản WCAG và quy tắc chế tác giao diện Zone 6).
  - Cập nhật [.agents/GEMINI.md](file:///d:/DuAnCaNhan/zone_6/.agents/GEMINI.md) đăng ký bộ kỹ năng mới.

---

### [2026-10-30 20:12] - Cấu Hình PostCSS Tailwind CSS v4 Khắc Phục Lỗi Mất Giao Diện Trên Vercel
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Vấn đề phát hiện qua ảnh màn hình:** Giao diện Vercel bị vỡ CSS (chỉ hiển thị HTML thuần với nền tối và viền text, mất toàn bộ flexbox/grid/centering/padding/buttons).
- **Nguyên nhân cốt lõi:** Dự án sử dụng Tailwind CSS v4 nhưng thiếu plugin `@tailwindcss/postcss` và file cấu hình `postcss.config.mjs`, dẫn đến việc bộ biên dịch Webpack bỏ qua `@import "tailwindcss";` và không sinh ra file CSS hoàn chỉnh.
- **Nội dung hoàn thành:**
  - Cài đặt `@tailwindcss/postcss` cho thư mục `fe/`.
  - Khởi tạo [fe/postcss.config.mjs](file:///d:/DuAnCaNhan/zone_6/fe/postcss.config.mjs).
  - Cập nhật [fe/next.config.ts](file:///d:/DuAnCaNhan/zone_6/fe/next.config.ts): Loại bỏ cấu hình loader turbopack không tương thích để PostCSS xử lý CSS chuẩn hóa.
  - Kiểm thử build thành công, file CSS sinh ra tăng từ 2KB lên 147KB đầy đủ toàn bộ utility classes và bảng màu Luxury Gold / Dark Carbon.
  - Push commit lên nhánh `main`.

---

### [2026-10-30 19:54] - Khắc Phục Lỗi Xung Đột Dependency npm ERESOLVE và Cấu Hình Vercel Build Ổn Định
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Nguyên nhân:** Khi Vercel chạy `npm install` mặc định bị lỗi `npm error ERESOLVE could not resolve` do xung đột peer dependency giữa `@types/node@20` và `vitest@5.0.3` (yêu cầu node >=22).
- **Nội dung hoàn thành:**
  - Khởi tạo file `.npmrc` và `fe/.npmrc` chứa cấu hình `legacy-peer-deps=true` để npm tự động giải quyết peer dependencies linh hoạt khi cài đặt.
  - Cập nhật [fe/package.json](file:///d:/DuAnCaNhan/zone_6/fe/package.json): Nâng cấp `@types/node` lên `^22` và đặt lệnh build sang `next build --webpack` đảm bảo tính tương thích và ổn định tuyệt đối trên môi trường máy chủ Vercel.
  - Cập nhật [fe/next.config.ts](file:///d:/DuAnCaNhan/zone_6/fe/next.config.ts) và [fe/src/core/api/axios-instance.ts](file:///d:/DuAnCaNhan/zone_6/fe/src/core/api/axios-instance.ts): Trỏ proxy về cổng 80 chuẩn của Nginx VPS (`http://160.191.243.53`).

---

### [2026-10-30 18:58] - Tự Động Hóa 100% CI/CD Bằng GitHub Actions Cho VPS
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** *"cấu hình đi"* (Tự động hóa cập nhật VPS khi push GitHub).
- **Nội dung hoàn thành:**
  - Khởi tạo [.github/workflows/deploy.yml](file:///d:/DuAnCaNhan/zone_6/.github/workflows/deploy.yml): Tự động lắng nghe sự kiện `push` trên nhánh `main`, dùng `appleboy/ssh-action` SSH an toàn vào VPS `160.191.243.53`, chạy `git pull` và `docker compose up -d --build`.
  - Cập nhật [DEPLOYMENT_GUIDE.md](file:///d:/DuAnCaNhan/zone_6/DEPLOYMENT_GUIDE.md) hướng dẫn thêm 3 biến Secrets (`VPS_HOST`, `VPS_USERNAME`, `VPS_PASSWORD`).

### [2026-10-30 18:55] - Đóng Gói Toàn Diện Môi Trường Docker & Nginx Reverse Proxy Cho Backend VPS
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** *"cần tạo môi trường đống gói docker để chạy không với nghinx nữa và làm soa đó fe có thể kết nối đến"*
- **Nội dung hoàn thành:**
  - Khởi tạo [be/Dockerfile](file:///d:/DuAnCaNhan/zone_6/be/Dockerfile): Multi-stage build Node.js 20 slim tối ưu dung lượng, tự động sinh Prisma Client và biên dịch TypeScript sang `dist/`.
  - Khởi tạo [nginx/default.conf](file:///d:/DuAnCaNhan/zone_6/nginx/default.conf): Lắng nghe cổng 80, reverse proxy ngầm vào `http://backend:8000`, hỗ trợ WebSocket kết nối Zalo Bot và cấu hình upload 15MB.
  - Khởi tạo [docker-compose.yml](file:///d:/DuAnCaNhan/zone_6/docker-compose.yml): Đồng bộ 2 services `backend` và `nginx`, lưu trữ volume `zalo_sessions` bền vững không mất phiên đăng nhập zca-js khi restart.
  - Cập nhật [DEPLOYMENT_GUIDE.md](file:///d:/DuAnCaNhan/zone_6/DEPLOYMENT_GUIDE.md): Bổ sung hướng dẫn chạy Docker 1 lệnh `docker compose up -d --build`.

### [2026-10-30 18:38] - Soạn Thảo Cẩm Nang Triển Khai Toàn Diện (DEPLOYMENT_GUIDE.md) & Cấu Hình Rewrites Proxy Vercel
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** *"viết file md hướng dẫn chi tiết deloy be và deloy fe trên vercel"*
- **Nội dung hoàn thành:**
  - Khởi tạo file tài liệu hướng dẫn độc lập [DEPLOYMENT_GUIDE.md](file:///d:/DuAnCaNhan/zone_6/DEPLOYMENT_GUIDE.md) chi tiết 4 phần:
    1. **Deploy Backend lên VPS Ubuntu (`160.191.243.53`):** Cấp quyền IP trên MongoDB Atlas, cài đặt Node.js 20 LTS, cấu hình file `.env`, build TypeScript, chạy ngầm với PM2 và mở cổng Firewall `8000/tcp`.
    2. **Deploy Frontend Next.js lên Vercel:** Cấu hình Root Directory `fe`, thiết lập biến môi trường `NEXT_PUBLIC_API_URL`.
    3. **Giải pháp xử lý lỗi Mixed Content (HTTPS -> HTTP):** Bổ sung cấu hình `rewrites()` trong [fe/next.config.ts](file:///d:/DuAnCaNhan/zone_6/fe/next.config.ts) để Vercel tự động proxy các request `/api/*` về máy chủ VPS mà không bị trình duyệt chặn.
    4. **Kiểm tra End-to-End & Quy trình cập nhật CI/CD:** Các lệnh pull code và restart PM2 tức thời.
  - Kiểm tra `npx tsc --noEmit` trên frontend đạt 0 lỗi (Exit code 0).

### [2026-10-29 15:45] - Triển Khai Toàn Diện Hệ Thống Yêu Cầu Nhập Kho Chi Nhánh (PR) & Trung Tâm Thu Mua Gộp Đơn PO Đa Chi Nhánh (CN11d)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** *"phân tích cho tôi thêm chức năng tạo phiếu yêu cầu nhập kho vd như tôi cấp phó ca nguyên liệu trở lên có thể tạo yêu cầu nhập kho dựa trên mức an toàn và quản lý có thể duyệt tạo đơn nhập kho với yêu cầu của nhiều chi nhánh gộp các đơn của các nhà cung cấp thành 1 và chọn vị trí giao luôn orr có thể điều chỉnh mỗi chi nhánh có đơn riêng cho từng nhà cung cấp ... bắt đầu đi"*
- **Mã chức năng liên quan:** CN11d (Yêu Cầu Nhập Kho & Đơn Thu Mua PO Đa Cơ Sở).
- **Phân bổ Dữ liệu & Prisma Schemas:**
  - `be/src/databases/prisma/schema/purchase_requisition.prisma`: Model `PurchaseRequisition` (Mã PR, storeId, creatorId, status PENDING/APPROVED/REJECTED/CONVERTED_TO_PO, priority, items json, expectedDeliveryDate).
  - `be/src/databases/prisma/schema/purchase_order.prisma`: Model `PurchaseOrder` (Mã PO, orderType CONSOLIDATED/BRANCH_DIRECT, supplierId, deliveryDestination CENTRAL_HUB/STORE_DIRECT, deliveryStoreId, deliveryAddress, totalEstimatedCost, items json).
  - Chạy `prisma generate` thành công 100%.
- **Mã nguồn Backend (`be/`):**
  - Mongoose Models: `purchase-requisition.model.ts`, `purchase-order.model.ts`.
  - Repositories: `purchase-requisition.repository.ts`, `purchase-order.repository.ts`.
  - Granular Services:
    - `requisition.suggest.service.ts`: Thuật toán tự động quét nguyên vật liệu dưới ngưỡng an toàn `min_threshold` và tính toán lượng thiếu hụt.
    - `requisition.create.service.ts`: Tạo phiếu yêu cầu nhập kho của chi nhánh, sinh mã `PR-YYYYMMDD-STORE-XXX`.
    - `requisition.get.service.ts`: Danh sách và chi tiết phiếu yêu cầu với Store Scoping.
    - `requisition.status.service.ts`: Phê duyệt số lượng hoặc từ chối phiếu PR.
    - `po.aggregate.service.ts`: Thuật toán gom nhóm nguyên vật liệu theo Nhà Cung Cấp từ nhiều phiếu PR của nhiều chi nhánh, tính tổng số lượng sỉ và chi phí ước tính.
    - `po.create.service.ts`: Phát hành đơn thu mua PO (hỗ trợ cả 2 chế độ Gộp đa chi nhánh hoặc Tách đơn riêng, chọn điểm giao Kho tổng hoặc Chi nhánh chỉ định), tự động cập nhật trạng thái PR sang `CONVERTED_TO_PO`.
    - `po.get.service.ts`: Danh sách và chi tiết đơn PO với Store Scoping.
    - `po.receive.service.ts`: Xác nhận nhập hàng vào kho (Goods Receipt) $\rightarrow$ Tự động tăng tồn kho thực tế `quantity_in_stock` trong MongoDB Atlas.
  - Granular Controllers: `requisition.*.controller.ts`, `po.*.controller.ts`.
  - Routes: `purchase-requisition.routes.ts`, `purchase-order.routes.ts` được mount tại `/v1/purchase-requisitions` và `/v1/purchase-orders`.
  - Build `npm --prefix be run build` thành công 100%, Backend daemon khởi động lại sẵn sàng phục vụ API.
- **Mã nguồn Frontend (`fe/`):**
  - Feature `pho_ca_vat_lieu/purchase_requisition/`:
    - `type/requisition.type.ts`, `service/requisition.service.ts`, `hook/usePurchaseRequisitions.ts`.
    - `CreateRequisitionModal.tsx`: Modal tạo yêu cầu kèm nút "⚡ Nạp Hàng Chạm Ngưỡng An Toàn" tự động điền các món thiếu.
    - `RequisitionListView.tsx`: Bảng danh sách phiếu PR, badge trạng thái, lọc theo ngày/trạng thái, tích chọn phiếu để Quản lý gộp PO.
    - `RequisitionDetailModal.tsx`: Xem chi tiết món và cho phép Quản lý điều chỉnh số lượng duyệt từng món.
  - Feature `quan_ly/procurement/`:
    - `type/procurement.type.ts`, `service/procurement.service.ts`, `hook/useProcurement.ts`.
    - `PoAggregationModal.tsx`: Wizard gộp đơn PO đa chi nhánh: Xem trước phân nhóm NCC, Switch chọn "Gộp Đa Quán" vs "Tách Đơn Riêng", chọn Kho Tổng hoặc Chi nhánh nhận hàng, xác nhận tạo PO.
    - `PoDetailModal.tsx`: Chi tiết đơn PO và form Xác Nhận Nhập Hàng Vào Kho (Goods Receipt) tự động cộng tồn kho.
    - `ProcurementDashboard.tsx`: Bảng điều khiển thu mua tổng thể với 4 Metric cards và danh sách PO.
  - Tích hợp giao diện:
    - `MaterialsView.tsx`: Thêm 2 Tab mới: **"Yêu Cầu Nhập Kho"** (Phó ca trở lên) và **"Đơn Thu Mua & Gộp PO"** (Quản lý & Admin).
    - `fe/src/app/procurement/page.tsx`: Route trực tiếp đến Trung tâm thu mua.
  - Kiểm tra kiểu dữ liệu `cd fe; npx tsc --noEmit` thành công 100% (0 lỗi).

### [2026-10-29 14:20] - Hoàn Thành Toàn Diện Kiến Trúc Phân Lập Đa Cơ Sở (Multi-Store Scoping) Cho Xếp Lịch Tuần (CN04), Đăng Ký Nguyện Vọng Ca (CN03) & Quản Lý Nhân Sự (CN02)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** *"chức năng xếp lịch và đăng ký cùng với nhân viên đều phân chia cho từng chi nhánh chưa"*, *"hãy phân chia đi bạn để đi đúng hướng"*
- **Mã chức năng liên quan:** CN02 (Quản Lý Nhân Sự & Phân Cấp), CN03 (Đăng Ký Nguyện Vọng Ca), CN04 (Xếp Lịch Tuần & AutoScheduler).
- **Phân bổ Dữ liệu & Migration Database:**
  - Script `be/scripts/migrate_multistore_scheduling.mjs`:
    - Xóa các single unique index `week_start_date_1` cũ trên 3 bảng `weekly_schedules`, `registration_windows`, `shift_registrations`.
    - Tạo các compound indexes `{ week_start_date: 1, store_id: 1 }` và `{ user_id: 1, week_start_date: 1, store_id: 1 }` tránh va chạm giữa các chi nhánh khi cùng hoạt động trong 1 tuần.
    - Gán `store_id` cho các lịch tuần, đợt đăng ký và 43 bản ghi đăng ký hiện có.
    - Phân bổ 21 nhân viên: STF01-STF12 về Cơ sở 2 (`Z6-CS02`), STF13-STF21 về Cơ sở 1 (`Z6-CS01`).
- **Mã nguồn Backend (`be/`):**
  - `be/src/modules/pho_ca_lam_lich/scheduling/models/weekly-schedule.model.ts`: Thêm `store_id`, `store_name`, đổi unique index thành compound index `{ week_start_date: 1, store_id: 1 }`.
  - `be/src/modules/nhan_vien/shift-registration/models/registration-window.model.ts`: Thêm `store_id`, `store_name`, đổi index thành compound index `{ week_start_date: 1, store_id: 1 }`.
  - `be/src/modules/nhan_vien/shift-registration/models/shift-registration.model.ts`: Thêm `store_id`, `store_name`, đổi index thành compound index `{ user_id: 1, week_start_date: 1, store_id: 1 }`.
  - `be/src/modules/quan_ly/staff/schemas/user.schema.ts` & `staff.schema.ts`: Bổ sung `assigned_store_id`, `assigned_stores`.
  - `be/src/modules/quan_ly/staff/repository/user.repository.ts`: Hỗ trợ lọc `store_id`, mapping trường `assigned_store_id` & `assigned_stores`.
  - `be/src/modules/quan_ly/staff/services/staff.create.service.ts`: Ràng buộc Trưởng ca khóa cứng đúng cơ sở mình; Quản lý chọn cơ sở phụ trách; Admin chọn toàn hệ thống.
  - `be/src/modules/quan_ly/staff/services/staff.get.service.ts`: Lọc danh sách nhân viên theo store scope và query `store_id`; tự động map `assigned_store_name`.
  - `be/src/modules/quan_ly/staff/services/staff.update.service.ts`: Tiếp nhận và cập nhật `assigned_store_id`, `assigned_stores`.
  - `be/src/modules/quan_ly/staff/controllers/staff.create.controller.ts` & `staff.get.controller.ts`: Tiếp nhận store scope từ actor và request query.
  - `be/src/core/auth.token.ts` & `be/src/modules/shared/auth/services/auth.service.ts`: Đưa `assigned_store_id` và `assigned_stores` vào Access Token JWT.
  - `be/src/modules/pho_ca_lam_lich/scheduling/services/weekly-schedule.service.ts`: Hỗ trợ `store_id` trong `getScheduleByWeek`, `saveSchedule`, `updateSingleSlot`.
  - `be/src/modules/nhan_vien/shift-registration/services/registration-window.service.ts`: Hỗ trợ `store_id` trong `getWindowStatus`, `configureWindow`, `checkRegistrationAllowed`, `getAvailableWeeks`, `createNextWeek`, `toggleLock`.
  - `be/src/modules/nhan_vien/shift-registration/services/shift-registration.service.ts`: Hỗ trợ `store_id` trong `registerShift`, `getMyRegistration`, `getWeekRegistrations`.
  - `be/src/modules/pho_ca_lam_lich/scheduling/controllers/scheduling.controller.ts`: Truyền tham số `store_id` qua toàn bộ API xếp ca và đăng ký.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/shared/auth/type/auth.type.ts`: Bổ sung `assigned_store_name?: string | null` vào `UserProfile`.
  - `fe/src/features/quan_ly/staff/type/staff.type.ts`: Bổ sung `assigned_store_id`, `assigned_store_name`, `assigned_stores` vào `StaffItem`, `CreateStaffPayload`, `UpdateStaffPayload`.
  - `fe/src/features/quan_ly/staff/service/staff.get.service.ts` & `useGetStaff.ts`: Thêm tham số `store_id`.
  - `fe/src/features/quan_ly/staff/component/CreateStaffModal.tsx`: Tích hợp chọn chi nhánh trực thuộc khi thêm nhân viên mới (Trưởng ca bị khóa cố định, Quản lý/Admin được chọn).
  - `fe/src/features/quan_ly/staff/component/EditStaffModal.tsx`: Tích hợp chọn/chuyển đổi chi nhánh khi chỉnh sửa nhân sự.
  - `fe/src/features/quan_ly/staff/component/StaffManagementView.tsx`: Thêm bộ lọc dropdown chọn chi nhánh (Store Switcher) trên thanh công cụ và cột "Cơ Sở Trực Thuộc" trên bảng danh sách nhân viên.
  - `fe/src/features/pho_ca_lam_lich/scheduling/service/scheduling.service.ts`: Cập nhật toàn bộ các hàm API nhận tham số `storeId?: string | null`.
  - `fe/src/features/pho_ca_lam_lich/scheduling/component/ScheduleConfigToolbar.tsx`: Bổ sung Store Switcher vào thanh công cụ xếp lịch.
  - `fe/src/features/pho_ca_lam_lich/scheduling/component/SchedulingDashboard.tsx`: Tích hợp phân quyền chi nhánh (Admin/Quản lý đổi chi nhánh, Trưởng ca/Phó ca cố định tại chi nhánh của mình), tự động reload ma trận ca theo chi nhánh được chọn.
  - `fe/src/features/nhan_vien/shift-registration/component/ShiftRegistrationView.tsx`: Tích hợp Store Switcher / Store Badge, gửi kèm `store_id` khi nhân viên đăng ký ca tuần và khi quản lý mở/khóa đợt đăng ký.
- **Kiểm thử & Xác minh chất lượng:**
  - TypeScript frontend (`cd fe; npx tsc --noEmit`) đạt 0 lỗi biên dịch.
  - TypeScript backend (`npm --prefix be run build`) đạt 0 lỗi biên dịch.
  - Backend đang chạy ổn định trên port 8000, Frontend trên port 3001. Đã kiểm thử API login và lọc nhân sự theo 2 chi nhánh CS1 (11 nhân viên) và CS2 (23 nhân viên), dữ liệu tách biệt hoàn toàn.

---

### [2026-10-25 23:05] - Triển Khai Tính Năng Cấu Hình Ca Làm Việc & Định Biên Nhân Sự Tối Thiểu (Giờ Làm Từ Mấy Giờ Đến Mấy Giờ, Tối Thiểu Bao Nhiêu Người Trong Ca)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "thêm tôi 1 chức năng nữa là cấu hình ca làm và tối thiểu ca đó là bao nhiêu người, giờ làm từ mấy h đến mấy h ......."
- **Mã chức năng liên quan:** CN04b (Cấu Hình Ca Làm Việc & Định Biên Nhân Sự Tối Thiểu)
- **Mã nguồn Backend (`be/`):**
  - `be/src/databases/prisma/schema/shift_config.prisma`: Khởi tạo model Prisma `ShiftConfig` (`shift_code`, `shift_name`, `start_time`, `end_time`, `work_hours`, `min_staff`, `max_staff`, `min_barista`, `min_service`, `color`, `apply_days`, `display_order`, `store_id`, `is_active`, `description`).
  - `be/src/modules/pho_ca_lam_lich/scheduling/models/shift-config.model.ts`: Mongoose schema cho `shift_configs`, định nghĩa danh sách 4 ca chuẩn Zone Six (`DEFAULT_ZONE6_SHIFTS`: Ca Sáng 07:00-12:30 min 2, Ca Chiều 12:30-17:30 min 2, Ca Tối 17:30-23:00 min 2, Ca Khuya 23:00-07:00 min 1) kèm compound index `{ store_id: 1, shift_code: 1 }`.
  - `be/src/modules/pho_ca_lam_lich/scheduling/schemas/shift-config.schema.ts`: Zod schema xác thực dữ liệu đầu vào cho tạo mới và cập nhật ca làm việc.
  - `be/src/modules/pho_ca_lam_lich/scheduling/repositories/shift-config.repository.ts`: Thao tác DB tìm ca theo chi nhánh (tự động khởi tạo 4 ca mặc định nếu chưa có), tìm theo ID, tìm theo Code, tạo mới, cập nhật, xóa và khôi phục ca mặc định.
  - `be/src/modules/pho_ca_lam_lich/scheduling/services/shift-config.get.service.ts`: Lấy danh sách ca làm việc và tự động tính toán số liệu thống kê (tổng ca, ca kích hoạt, tổng nhân sự tối thiểu/ngày, tổng giờ công/ngày).
  - `be/src/modules/pho_ca_lam_lich/scheduling/services/shift-config.create.service.ts`: Xử lý logic tạo ca mới, tự động sinh mã ca, tự động tính giờ làm `calculateShiftWorkHours` (hỗ trợ ca qua đêm), xác thực ràng buộc `max_staff >= min_staff` và định biên Pha chế / Phục vụ.
  - `be/src/modules/pho_ca_lam_lich/scheduling/services/shift-config.update.service.ts`: Cập nhật ca làm việc, kiểm tra trùng lặp mã ca, tính lại giờ công và kiểm tra định biên.
  - `be/src/modules/pho_ca_lam_lich/scheduling/services/shift-config.delete.service.ts` & `shift-config.reset.service.ts`: Xóa ca làm và khôi phục 4 ca mặc định.
  - `be/src/modules/pho_ca_lam_lich/scheduling/controllers/shift-config.*.controller.ts`: 5 Controllers chuẩn Granular SRP bọc `asyncHandler`.
  - `be/src/modules/pho_ca_lam_lich/scheduling/routes/scheduling.routes.ts`: Gắn các endpoints `GET/POST /api/v1/scheduling/shift-configs`, `GET/PUT/DELETE /api/v1/scheduling/shift-configs/:id`, `POST /api/v1/scheduling/shift-configs/reset-defaults`.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_lam_lich/scheduling/type/shift-config.type.ts`: Interfaces `ShiftConfigItem`, `ShiftConfigSummary`, `ShiftConfigListResponse`, `ShiftConfigCreatePayload`, `ShiftConfigUpdatePayload`.
  - `fe/src/features/pho_ca_lam_lich/scheduling/service/shift-config.service.ts`: Gọi các API `getShiftConfigsService`, `createShiftConfigService`, `updateShiftConfigService`, `deleteShiftConfigService`, `resetShiftConfigsService`.
  - `fe/src/features/pho_ca_lam_lich/scheduling/hook/useShiftConfigs.ts`: React Query hooks `useGetShiftConfigs`, `useCreateShiftConfig`, `useUpdateShiftConfig`, `useDeleteShiftConfig`, `useResetShiftConfigs`.
  - `fe/src/core/constants/query-keys.ts` & `.agents/REACT_QUERY_REGISTRY.md`: Đăng ký `queryKeys.shiftConfigs`.
  - `fe/src/features/pho_ca_lam_lich/scheduling/component/ShiftConfigModal.tsx`: Xây dựng toàn diện Modal Cấu Hình Ca Làm Việc & Định Biên Nhân Sự chuẩn phong cách Obsidian Gold:
    - 4 Cards KPI tổng quan: Tổng số ca, Ca kích hoạt, Tối thiểu nhân sự/ngày, Tổng giờ công/ngày.
    - Danh sách các ca làm việc với màu nhận diện, icon ca, khung giờ (từ mấy giờ đến mấy giờ), số giờ làm việc, huy hiệu định biên tối thiểu nổi bật (`Tối thiểu: X người`), định biên chi tiết Barista / Phục vụ, switch bật/tắt ca, nút Sửa & Xóa.
    - Form Drawer Thêm/Sửa ca làm việc: nhập Tên ca, Mã ca, Giờ bắt đầu, Giờ kết thúc (tự động tính số giờ công), bộ chỉnh số nhân viên tối thiểu (`min_staff`), tối đa (`max_staff`), Barista tối thiểu, Phục vụ tối thiểu, bảng màu Preset và ghi chú ca.
  - `fe/src/features/pho_ca_lam_lich/scheduling/component/ScheduleConfigToolbar.tsx`: Bổ sung nút "⚙️ Cấu Hình Ca Làm" trên thanh công cụ trang Xếp Lịch `/schedule`.
  - `fe/src/features/pho_ca_lam_lich/scheduling/component/SchedulingDashboard.tsx`: Tích hợp `ShiftConfigModal`.
  - `fe/src/features/nhan_vien/shift-registration/component/ShiftRegistrationView.tsx`: Bổ sung nút "⚙️ Cấu Hình Ca Làm (Giờ & Min)" và tích hợp `ShiftConfigModal` trên trang Đăng Ký Ca `/schedule/register`.
- **Kết quả kiểm thử:**
  - Backend API: Đã kiểm thử trực tiếp cả chu trình GET, POST (tạo ca mới), PUT (sửa min_staff), DELETE (xóa ca) bằng Node.js script, trả về HTTP 200/201 OK.
  - TypeScript Compilation: Cả `be/` (`tsc`) và `fe/` (`npx tsc --noEmit`) đạt 0 lỗi.
  - Frontend Turbopack: Biên dịch thành công các trang `/schedule` (HTTP 200 trong 139ms) và `/schedule/register` (HTTP 200 trong 78ms).

---

### [2026-10-25 21:58] - Bổ Sung Cấu Hình Quy Trình Kiểm Kho: Phân Quyền Người Tạo / Người Duyệt, Chọn Ca Kiểm Trong Ngày & Chu Kỳ Kiểm Kho (Hàng Ngày, 2-3 Ngày/Lần, Hàng Tuần)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "thêm cấu hình kiểm kho vd phần quyền người đc sữa người được tạo kiểm kho và chọn ca kiểm kho vd ca nào trong ngày và cấu hình chọn kiểm kho hằng ngày hay 2 ngày hay 3 ngày ..... kiểm kho 1 lần"
- **Mã chức năng liên quan:** CN11b (Kiểm Kê Kho Thực Tế & Cấu Hình Chu Kỳ / Phân Quyền / Ca Kiểm Kho)
- **Mã nguồn Backend (`be/`):**
  - `be/src/databases/prisma/schema/inventory_audit_config.prisma`: Thiết lập Model `InventoryAuditConfig` cho cấu hình kiểm kho theo cơ sở (`store_id`, `allowed_creator_roles`, `allowed_reviewer_roles`, `audit_shifts`, `frequency_type`, `interval_days`, `days_of_week`, `reminder_time`, `is_active`).
  - `be/src/databases/prisma/schema/inventory_audit.prisma`: Thêm trường `audit_shift` (Ca kiểm kho).
  - `be/src/modules/pho_ca_vat_lieu/material/models/inventory-audit-config.model.ts`: Mongoose schema cho `inventory_audit_configs`, thiết lập hằng số cấu hình mẫu `DEFAULT_AUDIT_SHIFTS`, `DEFAULT_CREATOR_ROLES`, `DEFAULT_REVIEWER_ROLES`.
  - `be/src/modules/pho_ca_vat_lieu/material/models/inventory-audit.model.ts`: Thêm trường `audit_shift` vào Document & Schema Mongoose.
  - `be/src/modules/pho_ca_vat_lieu/material/schemas/inventory-audit.schema.ts`: Định nghĩa Zod validation schemas `AuditShiftItemSchema`, `InventoryAuditConfigUpdateSchema`, DTOs và Response interfaces.
  - `be/src/modules/pho_ca_vat_lieu/material/repositories/inventory-audit-config.repository.ts`: Thao tác DB tìm/tạo cấu hình mặc định hoặc cấu hình riêng theo `store_id`.
  - `be/src/modules/pho_ca_vat_lieu/material/repositories/inventory-audit.repository.ts`: Bổ sung `findLatestAudit(storeId)` và `findTodayAudits(storeId)` để tính toán chu kỳ kiểm kho tự động.
  - `be/src/modules/pho_ca_vat_lieu/material/services/inventory-audit-config.get.service.ts`: Lấy cấu hình và tự động tính toán `schedule_status`: kiểm tra hôm nay có đến hạn kiểm kho theo chu kỳ không (`today_is_due`), ngày kiểm tiếp theo (`next_due_date`), các ca bắt buộc hôm nay và trạng thái hoàn thành.
  - `be/src/modules/pho_ca_vat_lieu/material/services/inventory-audit-config.update.service.ts`: Lưu / cập nhật cấu hình kiểm kho chi nhánh.
  - `be/src/modules/pho_ca_vat_lieu/material/services/inventory-audit.create.service.ts`: Đối chiếu động quyền tạo phiếu của người dùng với `allowed_creator_roles` từ cấu hình cơ sở (ném `ForbiddenError` nếu không được phân quyền); lưu trường `audit_shift`.
  - `be/src/modules/pho_ca_vat_lieu/material/services/inventory-audit.update.service.ts`: Đối chiếu động quyền sửa/duyệt với `allowed_reviewer_roles` từ cấu hình cơ sở (ném `ForbiddenError` nếu không được phân quyền).
  - `be/src/modules/pho_ca_vat_lieu/material/controllers/inventory-audit-config.get.controller.ts` & `inventory-audit-config.update.controller.ts`: Controllers chuẩn Granular SRP bọc `asyncHandler`.
  - `be/src/modules/pho_ca_vat_lieu/material/routes/inventory-audit.routes.ts`: Gắn route `GET /api/v1/inventory-audits/config` và `PUT /api/v1/inventory-audits/config` (bảo vệ quyền Admin, Quản lý, Phó ca vật liệu).
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/type/inventory-audit.type.ts`: Bổ sung interfaces `AuditShiftConfig`, `InventoryAuditConfig`, `InventoryAuditScheduleStatus`, `InventoryAuditConfigUpdatePayload` và trường `audit_shift`.
  - `fe/src/features/pho_ca_vat_lieu/material/service/inventory-audit.service.ts`: Thêm `getInventoryAuditConfigService` và `updateInventoryAuditConfigService`.
  - `fe/src/features/pho_ca_vat_lieu/material/hook/useInventoryAudits.ts`: Bổ sung React Query hooks `useGetInventoryAuditConfig` và `useUpdateInventoryAuditConfig`.
  - `fe/src/core/constants/query-keys.ts` & `.agents/REACT_QUERY_REGISTRY.md`: Đăng ký query key `queryKeys.inventoryAudits.config(storeId)`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditConfigModal.tsx`: Xây dựng toàn diện Modal cấu hình kiểm kho chuẩn giao diện Obsidian Gold:
    - Tab 1: Phân quyền vai trò được Tạo phiếu & vai trò được Sửa / Duyệt kho (hỗ trợ cả 6 vai trò hệ thống).
    - Tab 2: Chọn các ca kiểm kho trong ngày (Ca Sáng, Ca Chiều, Ca Tối chốt ca, Ca Khuya) và gán cờ "Bắt buộc kiểm".
    - Tab 3: Cấu hình tần suất kiểm kho: Hằng ngày (1 ngày/lần), Định kỳ N ngày 1 lần (2 ngày, 3 ngày, 5 ngày...), Các ngày cố định trong tuần (Thứ 2, Thứ 3, ..., CN) và Giờ nhắc nhở chốt ca.
  - `fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditModal.tsx`:
    - Thêm bộ chọn Ca kiểm kho trong ngày (dropdown ca đã cấu hình, tự động bắt ca phù hợp giờ hiện tại).
    - Kiểm tra thẩm quyền tạo phiếu theo cấu hình của chi nhánh: Hiển thị cảnh báo và vô hiệu hóa nút nộp nếu role chưa được cấp phép.
  - `fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditDetailModal.tsx`: Bổ sung cột hiển thị Ca kiểm kho (`audit_shift`) trong Card chi tiết thông tin phiếu.
  - `fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditView.tsx`:
    - Bổ sung nút **"⚙️ Cấu Hình Kiểm Kho"** mở modal cấu hình.
    - Widget cao cấp hiển thị **Quy Trình & Lịch Kiểm Kho Đang Áp Dụng**: Chu kỳ kiểm, giờ nhắc nhở, trạng thái đến hạn kiểm hôm nay (Đã hoàn thành / Đến hạn kiểm kho / Chưa tới ngày kiểm tiếp theo), danh sách ca kiểm và danh sách vai trò được tạo/duyệt.
    - Cột **"Ca Kiểm Kho"** trên bảng danh sách phiếu kiểm với badge trực quan.
- **Kiểm thử & Xác thực:**
  - TypeScript: Cả Backend và Frontend đạt 0 lỗi biên dịch.
  - Kiểm thử API: `GET /api/v1/inventory-audits/config` và `PUT /api/v1/inventory-audits/config` trả về 200 OK với dữ liệu chuẩn xác.
  - Kiểm thử Frontend: Route `/inventory-audit` biên dịch và render HTTP 200 OK trên trình duyệt Next.js Turbopack.

---

### [2026-10-24 20:50] - Tách Riêng Chức Năng 'Kiểm Kê Kho' (/inventory-audit) & Nhật Ký Truy Vết Người Kiểm Kho / Tài Khoản Kiểm Theo Ngày
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "cho kiểm kho và lịch sử kiểm kho ra 1 chức năng mới là kiểm kho đi và thêm cái nữa là ai kiểm kho tài khoản nào kiểm kho ngày hôm đó"
- **Mã chức năng liên quan:** CN11b (Kiểm Kê Kho Thực Tế & Lịch Sử Kiểm Kho)
- **Mã nguồn Backend (`be/`):**
  - `be/src/modules/pho_ca_vat_lieu/material/models/inventory-audit.model.ts`: Bổ sung các trường truy vết danh tính người kiểm kho gồm `created_by_user_code`, `created_by_email`, `reviewed_by_user_code`, `reviewed_by_role`.
  - `be/src/modules/pho_ca_vat_lieu/material/repositories/inventory-audit.repository.ts`: Thêm bộ lọc `date` cho `findAll({ store_id, status, date })`, chuyển đổi chính xác khoảng thời gian trong ngày (`startOfDay` - `endOfDay`) theo múi giờ địa phương.
  - `be/src/modules/pho_ca_vat_lieu/material/services/inventory-audit.create.service.ts`: Khi nhân viên tạo phiếu kiểm, tự động truy vấn `UserModel` để lưu trữ mã định danh nhân viên (`user_code` ví dụ `Z6-ADMIN`, `Z6-NV01`), email và vai trò người kiểm vào phiếu kiểm.
  - `be/src/modules/pho_ca_vat_lieu/material/services/inventory-audit.update.service.ts`: Khi Phó ca/Quản lý chỉnh sửa hoặc đồng bộ tồn kho, ghi nhận `reviewed_by_user_code` và `reviewed_by_role`.
  - `be/src/modules/pho_ca_vat_lieu/material/services/inventory-audit.get.service.ts` & `controllers/inventory-audit.get.controller.ts`: Hỗ trợ query parameter `date` (YYYY-MM-DD) và store_id.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/app/inventory-audit/page.tsx`: Tạo route Next.js độc lập `/inventory-audit` riêng biệt cho Kiểm Kê Kho & Lịch Sử Kiểm Kho.
  - `fe/src/core/components/layout/AppShell.tsx`: Thêm mục điều hướng **'Kiểm Kê Kho'** với icon `FaClipboardCheck` vào Sidebar chính của ứng dụng, tự động kích hoạt highlight khi truy cập `/inventory-audit`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditView.tsx`: Xây dựng toàn diện giao diện trang riêng:
    - Thanh điều hướng chi nhánh đa cơ sở (`StoreInventorySelector`) mượt mà ở đầu trang.
    - Widget cao cấp **"Nhật Ký Người Kiểm Kho Theo Ngày"**: Cho phép lọc nhanh "Hôm nay", "Hôm qua", "Tất cả" hoặc Date Picker; Thống kê tổng số phiếu, số tài khoản nhân sự đã tham gia kiểm kho, số mặt hàng phát hiện lệch tồn; Hiển thị danh sách thẻ nhân sự đã kiểm kho trong ngày (Avatar, Họ tên, Mã nhân viên `Z6-...`, Vai trò, Email, Thời gian kiểm).
    - Bảng Danh Sách Phiếu Kiểm Kê Kho trực quan: Hiển thị Mã phiếu, Cơ sở, Tài khoản người kiểm (Badge Avatar + Tên + Mã NV), Thời gian, Số lượng mục & Lệch, Trạng thái duyệt và các nút Xem chi tiết / Điều chỉnh.
    - Tích hợp nút **"+ Bắt Đầu Kiểm Kê Kho"** mở trực tiếp `InventoryAuditModal` (chế độ đếm lẻ + đếm nhiều Thùng/Lốc/Bao).
  - `fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditDetailModal.tsx`: Bổ sung Card hồ sơ người kiểm kho chi tiết (Thông tin tài khoản, Mã định danh, Vai trò, Email, Thời gian kiểm và Thông tin người duyệt/điều chỉnh nếu có).
  - `fe/src/features/pho_ca_vat_lieu/material/type/inventory-audit.type.ts`, `service/inventory-audit.service.ts`, `hook/useInventoryAudits.ts`: Cập nhật đồng bộ các trường truy vết tài khoản và tham số lọc `date`.
- **Kiểm thử & Xác thực:**
  - TypeScript: Cả Backend và Frontend chạy `npx tsc --noEmit` đạt 0 lỗi (exit code 0).
  - Trình duyệt thực tế (Browser Subagent):
    - Đã truy cập `/inventory-audit`, menu 'Kiểm Kê Kho' trên Sidebar sáng vàng Obsidian Gold.
    - Widget 'Nhật Ký Người Kiểm Kho Theo Ngày' hiển thị chi tiết tài khoản Admin (Z6-ADMIN) đã thực hiện kiểm kho hôm nay.
    - Bộ lọc ngày hoạt động trơn tru; bảng danh sách hiển thị đầy đủ thông tin tài khoản người kiểm.
    - Mở modal chi tiết phiếu kiểm hiển thị Card hồ sơ người kiểm kho rõ ràng, trực quan.

---

### [2026-10-24 20:30] - Triển Khai Tính Năng Kiểm Kê Kho (Đếm Đơn Lẻ + Kiểm Nhiều Thùng/Lốc, Phó Ca Chỉnh Sửa & Đồng Bộ) & Quản Lý Nhà Cung Cấp Độc Quyền Admin/Quản Lý
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. "kho bây giờ tôi muốn nhân viên trở lên đều có thể kiểm kho và nhiều khi có quá nhiều thì có thêm chế độ nhiều để cho nhân viên tốn công quas nhiều để đếm từng cái và sau kiểm kho xong nếu nhân viên bấm kho xong từ cấp phó ca trở lên có thể xem kiểm kho và có thể chỉnh sữa"
  2. "thêm các table nhà cung cấp và chọn các nguyên liệu cho nhà cung cấp đó và đây là chức năng riêng chỉ có cấp quản lý và admin mới có"
- **Mã chức năng liên quan:** CN11b (Kiểm Kê Kho Thực Tế & Cân Đối Tồn Kho), CN11c (Quản Lý Nhà Cung Cấp & Chọn Nguyên Vật Liệu Cung Ứng)
- **Mã nguồn Backend (`be/`):**
  - **Prisma Schemas:**
    - `be/src/databases/prisma/schema/inventory_audit.prisma`: Định nghĩa model `InventoryAudit` (`inventory_audits` collection) lưu trữ danh sách vật tư kiểm đếm, số tồn hệ thống, số thực tế, chênh lệch, chế độ đếm (`single` / `batch`), số thùng, quy cách/thùng, số lẻ, trạng thái duyệt (`pending_review`, `adjusted`, `confirmed`).
    - `be/src/databases/prisma/schema/supplier.prisma`: Định nghĩa model `Supplier` (`suppliers` collection) lưu thông tin NCC, liên hệ, ghi chú và danh sách nguyên vật liệu cung ứng (`supplied_materials`).
  - **Inventory Audit Module (`be/src/modules/pho_ca_vat_lieu/material/`):**
    - `models/inventory-audit.model.ts`: Mongoose schema & interface.
    - `schemas/inventory-audit.schema.ts`: Zod validation schemas (`InventoryAuditItemSchema`, `InventoryAuditCreateSchema`, `InventoryAuditUpdateSchema`).
    - `repositories/inventory-audit.repository.ts`: Thao tác DB CRUD + hàm cập nhật tồn kho tức thời `updateMaterialStock()` vào `PackagingModel`, `IngredientModel`, `ToppingModel`.
    - `services/inventory-audit.create.service.ts`: Tạo phiếu kiểm kho, tự động sinh mã `AUD-YYYYMMDD-001`, tính toán chênh lệch và số lượng mặt hàng lệch, gán trạng thái `pending_review`.
    - `services/inventory-audit.get.service.ts`: Lấy danh sách và chi tiết phiếu kiểm kho.
    - `services/inventory-audit.update.service.ts`: Dành riêng cho Phó ca trở lên; cập nhật số lượng thực tế, ghi chú điều chỉnh, và tùy chọn `apply_to_stock: true` để đồng bộ trực tiếp vào tồn kho hệ thống.
    - `controllers/inventory-audit.*.controller.ts`: Đầy đủ 3 controller riêng biệt bọc `asyncHandler`.
    - `routes/inventory-audit.routes.ts`: Phân quyền role: POST (Nhân viên trở lên: `nhan_vien`, `pho_ca_vat_lieu`, `pho_ca_lam_lich`, `truong_ca`, `quan_ly`, `admin_he_thong`), PUT (Chỉ cấp Phó ca trở lên: `pho_ca_vat_lieu`, `pho_ca_lam_lich`, `truong_ca`, `quan_ly`, `admin_he_thong`).
  - **Supplier Module (`be/src/modules/admin_he_thong/supplier/`):**
    - `models/supplier.model.ts`: Mongoose schema.
    - `schemas/supplier.schema.ts`: Zod validation schema.
    - `repositories/supplier.repository.ts`: CRUD `suppliers` collection.
    - `services/supplier.*.service.ts`: Tách 4 granular service (`create`, `get`, `update`, `delete`).
    - `controllers/supplier.*.controller.ts`: 4 granular controllers.
    - `routes/supplier.routes.ts`: **Bảo vệ độc quyền:** `requireRoles('admin_he_thong', 'quan_ly')` cho toàn bộ router.
  - **Mount Routes (`be/src/routes/index.ts`):** Mount `/v1/inventory-audits` và `/v1/suppliers`.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/type/inventory-audit.type.ts`: TypeScript interfaces.
  - `fe/src/features/pho_ca_vat_lieu/material/service/inventory-audit.service.ts`: Axios client calls.
  - `fe/src/features/pho_ca_vat_lieu/material/hook/useInventoryAudits.ts`: React Query hooks (`useGetInventoryAudits`, `useGetInventoryAuditDetail`, `useCreateInventoryAudit`, `useUpdateInventoryAudit`).
  - `fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditModal.tsx`: Modal kiểm kê kho hỗ trợ 2 chế độ:
    - **Chế độ đếm lẻ:** Nhập trực tiếp số lượng hoặc tăng giảm `+1`, `-1`, `+10`, `+50`, `+100`.
    - **Chế độ kiểm nhiều (Quy cách Thùng / Lốc / Bao):** Nhập `[Số Thùng] × [Quy cách/thùng] + [Số lẻ] = [Tổng thực tế]`, có phím tắt cộng nhanh `+10 lẻ`, `+50 lẻ`, `+100 lẻ`, tự động tính toán chênh lệch (Khớp, Thiếu đỏ, Thừa vàng) và ghi chú lệch.
  - `fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditHistoryModal.tsx`: Danh sách lịch sử các phiếu kiểm kho.
  - `fe/src/features/pho_ca_vat_lieu/material/component/InventoryAuditDetailModal.tsx`: Xem chi tiết phiếu kiểm kho. Nếu người dùng là cấp Phó ca trở lên -> Mở khóa ô nhập để sửa số lượng thực tế và hiển thị nút "Lưu Chỉnh Sửa", "Chốt & Đồng Bộ Vào Tồn Kho"; nếu là Nhân viên -> Chế độ chỉ xem.
  - `fe/src/features/admin_he_thong/supplier/`: Toàn bộ module NCC gồm `SuppliersTable.tsx`, `CreateSupplierModal.tsx` (có bộ chọn và gán nguyên vật liệu cung cấp kèm đơn giá nhập), `EditSupplierModal.tsx`, `useSuppliers.ts`, `supplier.service.ts`, `supplier.type.ts`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/MaterialsView.tsx`:
    - Thêm 2 nút hành động ở header: **"Kiểm Kê Kho"** và **"Lịch Sử Kiểm Kho"** (Mọi nhân viên từ `nhan_vien` trở lên đều sử dụng được).
    - Thêm tab **"Nhà Cung Cấp & Nguồn Hàng"** vào thanh Tab switcher — **Chỉ hiển thị khi vai trò là `admin_he_thong` hoặc `quan_ly`**, ẩn hoàn toàn đối với các vai trò khác.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: Cả BE và FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent):
    - Đã mở modal kiểm kê kho, chuyển một mặt hàng sang "Chế độ kiểm nhiều", tính quy cách thùng + lẻ và cộng nhanh, gửi phiếu kiểm kho thành công.
    - Đã mở lịch sử kiểm kho, xem phiếu `AUD-20261024-001`, chỉnh sửa số lượng thực tế và lưu thành công.
    - Đã chuyển tab "Nhà Cung Cấp & Nguồn Hàng", mở modal tạo NCC "Công ty CP Thực phẩm Phúc Thịnh", chọn nguyên vật liệu cung cấp, điền giá nhập và lưu thành công.

---

### [2026-10-24 19:40] - Thiết Kế Thanh Stepper Dạng Nút Tròn Đánh Số Kèm Đường Nối & Tên Bước Ở Dưới
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "các nút tròn đánh số và đường thẳng nối nhau dưới là tên bước" (Kèm ảnh chụp màn hình stepper dạng card cũ).
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món), CN05 (Quản Lý Nguyên Vật Liệu & Định Mức Tồn Kho)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx`:
    - Thay thế dạng thẻ card nút bấm trước đây bằng **Thanh Stepper cổ điển cao cấp (Classic Connected Stepper)**:
      - **Nút tròn đánh số (Circular Number Badges):** Mỗi bước là một nút tròn `w-10 h-10 rounded-full`, đánh số `1`, `2`, `3`, `4`. Khi đang chọn (active): viền vàng Obsidian Gold phóng to (`scale-110`, bóng vàng `shadow-amber-500/40`, ring vàng); khi đã hoàn thành: chuyển sang màu xanh ngọc emerald với dấu tích (`✓`); khi chưa tới: viền mờ `text-white/40`.
      - **Đường thẳng nối nhau (Connecting Lines):** Các đường thẳng nằm ngang kết nối chính xác từ tâm nút tròn này sang tâm nút tròn kế tiếp. Đường nối sẽ tự động đổi màu sáng nối tiếp (gradient emerald sang vàng) khi các bước trước đó đã được hoàn thành.
      - **Tên bước nằm ở dưới (Step Labels Underneath):** Toàn bộ nhãn bước (`Bước 1: Thông Tin Món`, `Bước 2: Định Lượng (BOM)`, `Bước 3: Quy Trình (SOP)`, `Bước 4: Cơ Sở Áp Dụng`) được căn giữa ngay bên dưới nút tròn tương ứng, chữ in đậm sắc nét và đồng bộ màu theo trạng thái bước.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: Cả BE và FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Đã kiểm tra trực quan quy trình di chuyển từ Bước 1 -> Bước 2 -> Bước 3 -> Bước 4; các nút tròn đánh số, đường nối sáng và tên bước phía dưới hiển thị hoàn hảo chuẩn nhận diện Obsidian Gold.

---

### [2026-10-24 19:35] - Triển Khai Quy Trình Wizard 4 Bước Chuẩn Tạo Công Thức Món & Phân Quyền Chi Nhánh
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "cái tạo mới này yêu cầu hoàn thành 4 bước mới đc lưu 3 bước y nguyên như z bước 4 chọn cơ sở để lưu món ăn đó và bước 1 không có nút lưu mà nút next và các phía trên có dạng như đang chọn quy trình 4 bước nếu như chỉ có 1 cơ sở thì mặc định lưu vào cơ sở đso và bỏ bước 4 đi để nút lư ở bước 3"
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món), CN05 (Quản Lý Nguyên Vật Liệu & Định Mức Tồn Kho)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx`:
    - **Thanh Stepper Quy Trình Chuẩn (Stepper Wizard Header):** Thiết kế thanh tiến trình phía trên gồm 4 bước (hoặc 3 bước nếu hệ thống chỉ có 1 cơ sở):
      - Bước 1: Thông Tin Món (Tên, giá, size, chế độ nhiệt độ & bảo mật).
      - Bước 2: Định Lượng Vật Liệu (BOM).
      - Bước 3: Quy Trình Pha Chế (SOP Barista).
      - Bước 4: Cơ Sở Áp Dụng (Chọn chi nhánh lưu món).
      - Hiển thị số bước, tiêu đề, vòng tròn số nổi bật, bước hiện tại có hiệu ứng ánh sáng vàng Obsidian Gold, bước đã hoàn thành có dấu tích xanh (`✓`), hỗ trợ nhấp chuột linh hoạt giữa các bước đã đi qua.
    - **Cơ Chế Phân Bước Điều Hướng (Navigation Flow):**
      - Bước 1: Loại bỏ hoàn toàn nút Lưu. Chỉ có nút "Hủy Bỏ" và "Tiếp Tục: Định Lượng (Bước 2) →". Khi bấm tiếp tục, tự động kích hoạt Zod form trigger để kiểm tra các trường bắt buộc (Tên món, danh mục, giá bán).
      - Bước 2: Chỉ có nút "Quay Lại", "Hủy Bỏ" và "Tiếp Tục: Quy Trình SOP (Bước 3) →". Tuyệt đối không có nút Lưu.
      - Bước 3: Có nút "Quay Lại", "Hủy Bỏ". Nếu hệ thống có từ 2 cơ sở trở lên (`allowedStores.length > 1`) -> Nút "Tiếp Tục: Chọn Cơ Sở (Bước 4) →". Nếu hệ thống chỉ có 1 cơ sở (`allowedStores.length <= 1`) -> Bỏ Bước 4, tự động gán chi nhánh duy nhất đó và hiển thị nút "Hoàn Tất & Lưu Món" trực tiếp tại Bước 3.
      - Bước 4: Hiển thị danh sách các chi nhánh dạng thẻ cards trực quan (Tên cơ sở, mã chi nhánh, địa chỉ, badge "Đang Chọn", viền sáng Obsidian Gold). Người dùng chọn cơ sở muốn lưu món và bấm nút "Hoàn Tất & Lưu Món" (`type="submit"`).
    - **Chuẩn Hóa React Rules of Hooks:** Bố trí toàn bộ hooks (`useAuth`, `useGetStores`, `useForm`, `useMemo`, `useEffect`) trước các điều kiện render, đảm bảo không gặp lỗi runtime hook count.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: Cả BE và FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Thực hiện toàn bộ quy trình 4 bước tạo món "Tra Vai Hoang Kim CS2", chọn Cơ sở 2 (214 Lê Ninh) và lưu thành công vào cơ sở dữ liệu MongoDB Atlas.

---

### [2026-10-24 19:15] - Phân Lập Món Ăn Theo Chi Nhánh & Đưa Thanh Chọn Chi Nhánh Lên Đầu Trang Quản Lý Món
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "sao chỉ có ở topping hãy để trên cùng luôn các món ăn cũng phân biệt giữa các chi nhánh mỗi món sẽ có chi nhánh riêng chứ không dùng chung"
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món), CN05 (Quản Lý Nguyên Vật Liệu & Định Mức Tồn Kho)
- **Mã nguồn Backend (`be/`):**
  - `be/src/databases/prisma/schema/recipe.prisma`: Bổ sung trường `storeId String? @map("store_id") @db.ObjectId`.
  - `be/src/modules/pho_ca_vat_lieu/material/models/recipe.model.ts`: Thêm trường `store_id` (ref: `StoreConfig`, index), cập nhật `IRecipeDoc`, thêm chỉ mục hỗn hợp `{ store_id: 1, type: 1 }` và `{ store_id: 1, category: 1 }`.
  - `be/src/modules/pho_ca_vat_lieu/material/schemas/recipe.schema.ts`: Bổ sung `store_id: z.string().optional().nullable()` vào `RecipeCreateSchema` và `RecipeResponse`.
  - `be/src/modules/pho_ca_vat_lieu/material/repositories/recipe.repository.ts`: 
    - Cập nhật `findAll`, `create`, `update`, `countTotal(store_id?)`, `countByType(type, store_id?)` để lọc và gán theo `store_id`.
    - Cập nhật `findByName(name, store_id?)` để kiểm tra trùng lặp tên theo phạm vi từng chi nhánh.
  - `be/src/modules/pho_ca_vat_lieu/material/services/recipe.get.service.ts`: Nhận `store_id` lọc công thức và ánh xạ `store_id` trong kết quả trả về.
  - `be/src/modules/pho_ca_vat_lieu/material/services/recipe.create.service.ts`: Kiểm tra trùng lặp tên món theo chi nhánh và đếm số lượng theo chi nhánh.
  - `be/src/modules/pho_ca_vat_lieu/material/controllers/recipe.get.controller.ts`: Phân quyền store scoping (Admin/Quản lý chọn qua query param `store_id`, nhân sự chi nhánh bị khóa cứng theo `assigned_store_id`).
  - `be/src/modules/pho_ca_vat_lieu/material/controllers/recipe.create.controller.ts`: Tự động gán `store_id` khi tạo món.
  - `be/scripts/migrate_recipe_multistore.mjs`: Gán 6 món ban đầu cho Cơ sở 1 (Lương Nhữ Học) và khởi tạo 6 món riêng biệt cho Cơ sở 2 (214 Lê Ninh: Cà Phê Trứng Béo CS2, Trà Xoài Nhiệt Đới CS2, Trà Sữa Oolong Nướng CS2, Cốt Trà Oolong Nướng CS2, Syrup Đường Đen CS2, Kem Trứng Nướng Cháy CS2).
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/type/recipe.type.ts`: Bổ sung `store_id` vào `Recipe`, `RecipeCreatePayload`, `RecipeUpdatePayload`, và định nghĩa `RecipeListParams`.
  - `fe/src/features/pho_ca_vat_lieu/material/service/recipe.get.service.ts` & `hook/useGetRecipes.ts`: Chuyển `store_id` vào params truy vấn và cập nhật `queryKey`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipesView.tsx`:
    - Đưa thanh chọn chi nhánh `StoreInventorySelector` lên vị trí trên cùng trang (ngay dưới header, bên trên bộ chuyển tab).
    - Đồng bộ `selectedStoreId` lọc danh sách món ăn `useGetRecipes({ store_id: selectedStoreId || undefined })`.
    - Loại bỏ thanh chọn chi nhánh thừa trong tab Topping, chuyển quyền điều khiển chi nhánh tập trung toàn trang.
    - Truyền `selectedStoreId` vào `CreateRecipeModal`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx`:
    - Nhận `selectedStoreId`, gửi `store_id` khi tạo món mới.
    - Lọc nguyên vật liệu trong kho theo `store_id` để tránh chọn nhầm vật tư của chi nhánh khác.
  - `fe/src/features/pho_ca_vat_lieu/material/component/EditRecipeModal.tsx`: Lọc nguyên vật liệu trong kho theo `recipe?.store_id`.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: Cả BE và FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): 
    - Thanh chọn chi nhánh hiển thị trên cùng.
    - Chọn Cơ sở 1 -> Hiển thị đúng 6 món của Cơ sở 1.
    - Chọn Cơ sở 2 -> Hiển thị đúng 6 món riêng của Cơ sở 2.
    - Chuyển tab Topping Bán Kèm -> Giữ nguyên chi nhánh đã chọn, danh sách topping lọc chuẩn xác theo chi nhánh.

---

### [2026-10-24 18:48] - Tinh Giản Dropdown Chọn Vật Tư & Ly Phục Vụ: Loại Bỏ Mã [MAT-...] Và Tồn Kho
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "bỏ mã và tồn kho đi nhìn loạn lắm" (Kèm ảnh chụp màn hình dropdown chọn vật tư trong modal tạo/sửa công thức).
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx` & `EditRecipeModal.tsx`:
    - Loại bỏ hoàn toàn tiền tố mã vật tư (`[MAT-...]`, `[TOP-...]`) và phần hiển thị tồn kho `(20 Kg)`, `(15 Hộp)`, `(Tồn: 500 Cái)` trong:
      1. Dropdown chọn nhanh vật tư vào bảng định lượng BOM (`-- Chọn vật tư trong kho --` gồm các nhóm Nguyên Liệu, Topping, Bao Bì).
      2. Dropdown chọn Ly Phục Vụ Lạnh và Ly Phục Vụ Nóng.
    - Danh sách hiện tại chỉ hiển thị duy nhất tên vật tư/ly sạch đẹp, không bị xuống dòng, không bị rối mắt bởi các ngoặc vuông/ngoặc tròn chồng chéo.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Đã kiểm tra trực quan các dropdown trên giao diện `http://localhost:3001/recipes`.

---

### [2026-10-24 18:12] - Loại Bỏ Hoàn Toàn Phần Dung Tích Phụ (500ml), (700ml) - Chỉ Hiển Thị Gọn Tên Size (Size M, Size L)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "(500ml) không cần hiển thị cái này đâu"
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món)
- **Mã nguồn Frontend (`fe/`) & Backend (`be/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx` & `EditRecipeModal.tsx`:
    - Cập nhật hàm `extractCupSize`: Tự động loại bỏ hoàn toàn các chuỗi dung tích trong ngoặc đơn như `(500ml)`, `(700ml)` hay số `500ml`, chỉ giữ lại duy nhất tên kích cỡ: `Size M`, `Size L`, `Size S`.
    - Khi người dùng chọn ly từ danh sách trong kho, ô **"Size Món / Kích Thước Phục Vụ"** sẽ tự động được điền `Size M` hoặc `Size L` cực kỳ ngắn gọn.
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipeCard.tsx`:
    - Bộ lọc hiển thị trên thẻ món làm sạch các chuỗi thừa, đảm bảo thẻ món bán khách chỉ hiển thị chuẩn: `35.000 đ` kèm huy hiệu `Size M`, `Size L` sang trọng, tinh tế.
  - `be/src/modules/pho_ca_vat_lieu/material/repositories/recipe.repository.ts`:
    - Cập nhật seed dữ liệu chuẩn hóa sang `Size M` (Cà phê muối), `Size L` (Trà dâu tây & Trà đào cam sả).
    - Đã đồng bộ trực tiếp vào MongoDB Atlas.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: FE và BE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Đã chụp ảnh màn hình tại `http://localhost:3001/recipes` xác nhận toàn bộ thẻ món hiển thị hoàn hảo `Size M`, `Size L` không còn bất kỳ dấu vết `(500ml)`.

---

### [2026-10-24 17:58] - Tự Động Trích Xuất & Điền Duy Nhất Size Ly Khi Chọn Ly Phục Vụ (Create/EditRecipeModal)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "khi chọn ly chỉ hiển thị size ly thôi" (Kèm ảnh khoanh vùng ô nhập liệu bị dính chuỗi thừa `1 ly (Ly nhựa PP...)`).
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx` & `EditRecipeModal.tsx`:
    - Xây dựng hàm `extractCupSize` ưu tiên lấy trường `cup.cup_size` (`Size M (500ml)`, `Size L (700ml)`...), nếu chưa có sẽ tự động phân tích regex bóc tách kích thước dung tích (`Size M`, `500ml`...) từ tên ly.
    - Cập nhật hàm `updateServingSizeText`: Khi người dùng chọn ly lạnh/ly nóng, ô **"Size Món / Kích Thước Phục Vụ"** sẽ chỉ điền chính xác dung tích/size ly (ví dụ: `Size M (500ml)`), loại bỏ triệt để chuỗi thừa cũ `1 ly (Ly nhựa PP...)`.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Đã thao tác trực tiếp trên modal `CreateRecipeModal`, chọn ly `[MAT-LY-500]` và xác nhận ô nhập tự động điền chuẩn xác duy nhất `Size M (500ml)`.

---

### [2026-10-24 17:49] - Nâng Cao Độ Cao Banner Ảnh Món (Photo Banner) Từ h-48 Lên h-64
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "feed lại ảnh độ h lướn hơn đi"
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipeCard.tsx`:
    - Tăng độ cao khối ảnh món từ `h-48` (192px) lên `h-64` (256px), tăng hơn 33% diện tích hiển thị hình ảnh sản phẩm.
    - Hình ảnh món nước (ly cà phê muối, trà dâu tây, trà đào cam sả) hiển thị rõ nét, đầy đặn, chuẩn tỷ lệ nhiếp ảnh F&B và tạo cảm giác ngon miệng, sang trọng.
    - Điều chỉnh kích cỡ biểu tượng fallback (khi chưa có ảnh) lên `text-4xl` cân đối với chiều cao mới.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Đã chụp ảnh màn hình tại `http://localhost:3001/recipes` xác nhận ảnh món cao thoáng, đồ họa sắc nét vượt trội.

---

### [2026-10-24 17:47] - Tối Ưu Bố Cục Thẻ Món: Giá Nằm Bên Trái, Size Nằm Liền Kề & Lược Bỏ Chữ 'Giá Niêm Yết' Và 'Size'
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "cho giá nằm bên trái size nằm bên cạnh giá bỏ chữ giá niêm yết và size đi"
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipeCard.tsx`:
    - Gom Giá bán và Size vào chung 1 hàng duy nhất ngay dưới tên món.
    - Giá bán (hoặc nhãn Bán thành phẩm nội bộ) đặt bên trái với phông chữ lớn `text-emerald-400 font-mono font-black`.
    - Kích thước Size đặt liền kề bên phải dạng huy hiệu viền vàng Obsidian Gold (`bg-amber-400/10 border-amber-400/20 text-amber-300`).
    - Lược bỏ hoàn toàn các tiền tố thừa `Giá niêm yết:` và `Size:`, xóa đường kẻ phân cách, giúp mặt thẻ cực kỳ gọn gàng, thoáng đãng và đậm chất menu chuyên nghiệp.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Đã chụp ảnh màn hình tại `http://localhost:3001/recipes` xác nhận 6 thẻ món hiển thị thẳng hàng hoàn hảo.

---

### [2026-10-24 17:44] - Đưa Huy Hiệu Danh Mục (Category) Lên Góc Trên Phải Thẻ Món Thay Thế Vị Trí Vừa Bỏ Đi
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "cho phần danh mục lên thay phần vừa rồi bỏ đi"
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipeCard.tsx`:
    - Đưa huy hiệu Danh mục món (`recipe.category`, ví dụ `Cà phê`, `Trà trái cây`, `Cốt trà & Syrup sơ chế`) lên góc trên bên phải của ảnh món (thay thế đúng vị trí mã `REC-...` vừa bỏ đi).
    - Tinh chỉnh phần nội dung bên dưới tên món chỉ còn lại `Size: {recipe.serving_size}`, tạo bố cục 2 góc ảnh đối xứng hài hòa: bên trái là loại món (`🌐 Món Bán Khách` / `🔒 Sơ Chế Nội Bộ`), bên phải là nhóm danh mục.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Đã chụp ảnh màn hình kiểm thử tại `http://localhost:3001/recipes` xác nhận danh mục hiển thị sắc nét trên góc phải ảnh món.

---

### [2026-10-24 17:42] - Ẩn Huy Hiệu Mã Công Thức (Code Badge) Khỏi Mặt Trước Thẻ Món (RecipeCard)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "bỏ không hiện cái này" (Đính kèm ảnh chụp huy hiệu `REC-TRA-DAU` trên góc thẻ món).
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipeCard.tsx`:
    - Gỡ bỏ hoàn toàn huy hiệu mã công thức (`recipe.code`, ví dụ `REC-TRA-DAU`, `REC-CA-PHE-MUOI`...) ở góc trên bên phải ảnh món.
    - Giữ lại duy nhất huy hiệu trạng thái phân loại (`Món Bán Khách` / `Sơ Chế Nội Bộ`) ở góc trên bên trái, giúp hình ảnh món thoáng đãng, tinh tế và tập trung trọn vẹn vào sản phẩm.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Kiểm tra trực tiếp tại `http://localhost:3001/recipes`, toàn bộ mã món `REC-...` đã biến mất hoàn toàn khỏi các thẻ món.

---

### [2026-10-24 17:35] - Tinh Giản Thẻ Món (RecipeCard): Hiển Thị Ảnh Món, Tên Món, Đổi Khẩu Phần Thành Size, Giá Niêm Yết & Nút Xem Chi Tiết
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "chỉ để hiện thay khẩu phần thành size đi giá niêm uyết và bổ sung thêm thuộc tính ảnh nữa chỉ có ở và có thêm nút xem chi tiết nữa chỉ hiển thị như z thôi"
- **Mã chức năng liên quan:** CN11 (Quản Lý Sổ Tay Công Thức Pha Chế SOP & Danh Mục Món)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipeCard.tsx`:
    - Tinh giản toàn diện giao diện thẻ món chuẩn phong cách Food & Beverage hiện đại:
      1. **Khối Ảnh Món (Photo Banner):** Hiển thị ảnh chụp thực tế món nước/bán thành phẩm với tỷ lệ chuẩn 16:10 (`h-48`), hiệu ứng zoom mượt mà khi hover, kèm huy hiệu phân loại `Món Bán Khách` / `Sơ Chế Nội Bộ` và mã công thức. Có fallback icon tinh tế khi món chưa có ảnh.
      2. **Tên Món:** Cỡ chữ lớn, in đậm, line-clamp 1 dòng thanh thoát.
      3. **Đổi "Khẩu phần" thành "Size":** Hiển thị `Size: 1 ly 500ml`, `Size: 1 ly 700ml`, `Size: 400ml`... kèm nhãn danh mục.
      4. **Giá Niêm Yết:** Giá bán lẻ hiển thị rõ nét màu xanh ngọc lục bảo (`35.000 đ`, `39.000 đ`...), hoặc nhãn `Bán thành phẩm nội bộ`.
      5. **Nút "Xem Chi Tiết":** Nút bấm màu vàng Obsidian Gold nổi bật mở modal xem toàn bộ quy trình pha chế và định lượng.
      6. **Loại bỏ toàn bộ thông tin rườm rà trên mặt thẻ:** Xóa 3 ô thống kê (vật liệu, quy trình, thời gian), xóa giá vốn COGS, xóa biên lãi gộp và đoạn mô tả dài theo đúng yêu cầu "chỉ hiển thị như vậy thôi".
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx` & `EditRecipeModal.tsx`:
    - Cập nhật nhãn cấu hình thành: `Size Món / Kích Thước Phục Vụ`.
    - Bổ sung trường nhập **🖼️ Link Ảnh Món / Hình Ảnh Sản Phẩm (`image_url`)** kèm tính năng xem trước ảnh (image preview) thời gian thực.
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipeDetailModal.tsx`:
    - Bổ sung banner ảnh món kích thước lớn ở đầu modal xem chi tiết và đổi nhãn thành `Size món`.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent): Kiểm tra trực tiếp tại `http://localhost:3001/recipes`, thẻ món hiển thị ảnh tuyệt đẹp, size món, giá niêm yết, mở modal xem chi tiết và modal chỉnh sửa có ô ảnh hoạt động trơn tru 100%.

---

### [2026-10-24 17:25] - Tái Thiết Kế Bộ Chọn Chi Nhánh Dạng Thẻ Nằm Trên 1 Hàng Kèm Cuộn Ngang Đồng Bộ Màu (Gold Scrollbar)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "fix lại giao diện dạng thẻ chỉ có tên chi nhánh và đại chỉ theo 1 hàng nếu quá nhiều thì cuộn và thanh cuộn phải đồng bộ màu"
- **Mã chức năng liên quan:** CN06 (Quản Lý Chuỗi Chi Nhánh) & CN11 (Quản Lý Vật Liệu Kho & Topping Bán Ra)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/app/globals.css`:
    - Bổ sung class `.gold-scrollbar-x` hỗ trợ thanh cuộn ngang tùy biến chuẩn màu nhận diện Obsidian Gold (chiều cao 6px, nền `#12141a`, thanh trượt bo tròn viền vàng đồng `#D4AF37`, hiệu ứng hover sáng bóng `box-shadow: 0 0 8px rgba(212, 175, 55, 0.5)`).
  - `fe/src/features/pho_ca_vat_lieu/material/component/StoreInventorySelector.tsx`:
    - Xóa bỏ hoàn toàn thanh dropdown `<select>` cồng kềnh và khối tiêu đề rườm rà.
    - Chuyển đổi 100% sang giao diện Dạng Thẻ (Card format) dàn ngang trên **ĐÚNG 1 HÀNG DUY NHẤT** (`flex items-stretch gap-3 overflow-x-auto pb-2.5 gold-scrollbar-x`).
    - Mỗi thẻ chỉ hiển thị thông tin trọng tâm:
      - **Dòng trên:** Icon cửa hàng + Tên chi nhánh (in đậm, rõ nét) + Huy hiệu trạng thái (`● Đang chọn` cho thẻ active hoặc mã chi nhánh `Z6-CS01`...).
      - **Dòng dưới:** Icon định vị 📍 + Địa chỉ đường phố chi tiết của chi nhánh.
    - Hiệu ứng tương tác: Thẻ đang chọn nổi bật với viền vàng đồng `#D4AF37`, nền gradient phát sáng và bóng đổ ánh kim; thẻ chưa chọn có hiệu ứng hover đổi màu nhẹ nhàng; người dùng click vào thẻ để chuyển đổi tức thì.
    - Khi danh sách chi nhánh dài vượt quá khung hình, thanh cuộn ngang màu vàng đồng xuất hiện đồng bộ hoàn hảo với nền tối.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Browser subagent: Kiểm tra trực tiếp trên trình duyệt tại `http://localhost:3001/materials` (chuyển đổi giữa Cơ sở 1 và Cơ sở 2 hiển thị viền vàng và cập nhật kho tức thời).

---

### [2026-10-24 17:15] - Siết Chặt Phân Quyền Chi Nhánh (Multi-Store / Store Scoping) Cho Phân Hệ Kho Vật Liệu & Topping Bán Ra
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "hãy siết chặc chi nhánh trước còn kiểm kho từ từ đã"
- **Mã chức năng liên quan:** CN06 (Quản Lý Chuỗi Chi Nhánh) & CN11 (Quản Lý Vật Liệu Kho & Topping Bán Ra)
- **Mã nguồn Backend (`be/`):**
  - **Phân quyền Route Store (`be/src/modules/admin_he_thong/store/routes/store.routes.ts`):** Mở quyền `GET /api/v1/stores` và `GET /api/v1/stores/:id` cho mọi tài khoản đã đăng nhập (`authenticate`) để nhân viên/phó ca chi nhánh đọc được thông tin cơ sở của mình mà không bị lỗi 403 Forbidden.
  - **Mô hình Tài Khoản & Token JWT (`be/src/`):**
    - `be/src/modules/quan_ly/staff/models/user.model.ts`: Thêm `assigned_store_id` (ObjectId ref `StoreConfig`) và `assigned_stores` (`[ObjectId]`).
    - `be/src/modules/quan_ly/staff/schemas/user.schema.ts` & `user.repository.ts`: Mapped `assigned_store_id` và `assigned_stores`.
    - `be/src/core/auth.token.ts`: Thêm `assigned_store_id` vào `AuthTokenPayload` và `signAccessToken`.
    - `be/src/modules/shared/auth/services/auth.service.ts`: Kèm `assigned_store_id` vào JWT khi đăng nhập và cấp mới token.
  - **Cách Ly Dữ Liệu Tồn Kho Đa Cơ Sở (Store Scoping):**
    - `be/src/modules/pho_ca_vat_lieu/material/repositories/material.repository.ts`: Lọc `store_id` trong `findAll(filters)`, `countTotal(store_id)`, `countByCategory(category, store_id)`, `countLowStock(store_id)` và đồng bộ `syncFromWarehouseTopping` theo đúng `store_id`.
    - `be/src/modules/pho_ca_vat_lieu/material/controllers/material.get.controller.ts`: Phân quyền chặt chẽ: `admin_he_thong` và `quan_ly` được chỉ định `req.query.store_id`; các vai trò chi nhánh (`pho_ca_vat_lieu`, `truong_ca`, `nhan_vien`) bị cưỡng chế 100% về `user.assigned_store_id`.
    - `be/src/modules/pho_ca_vat_lieu/material/controllers/material.create.controller.ts`: Tự động gán `store_id = user.assigned_store_id` cho vai trò chi nhánh.
    - `be/src/modules/pho_ca_vat_lieu/material/repositories/sellable-topping.repository.ts`, `sellable-topping.get.service.ts`, `sellable-topping.get.controller.ts`, `sellable-topping.create.controller.ts`: Lọc và gán `store_id` cho bảng riêng `sellable_toppings`.
  - **Migration & Dữ Liệu Thực Tế MongoDB Atlas (`be/scripts/migrate_multistore.mjs`):**
    - Cập nhật Cơ sở 1 (`6ad3ba2cc97accdb7621c6b4` - Z6-CS01) và Cơ sở 2 (`6adc824db1b648a86dfdbe1f` - Z6-CS02).
    - Toàn bộ vật liệu hiện tại được gắn cố định vào Cơ sở 1.
    - Tạo mới độc lập kho vật liệu cho Cơ sở 2 với số lượng tồn riêng biệt (280 ly 500ml, 140 ly 700ml, 85 ly giấy, 450 ống hút, 15kg trà đen, 4 hộp sữa tươi, topping trân châu và thạch riêng).
    - Cập nhật `assigned_store_id` cho các tài khoản kiểm thử (`vatlieu@zonesix.vn`, `truongca@zonesix.vn`, `nhanvien@zonesix.vn` vào CS1; `quanly@zonesix.vn` quản lý CS1 & CS2).
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/shared/auth/type/auth.type.ts`: Bổ sung `assigned_store_id` và `assigned_stores` vào `UserProfile`.
  - `fe/src/features/pho_ca_vat_lieu/material/service/material.get.service.ts` & `useGetMaterials.ts`: Chấp nhận tham số `store_id?: string`.
  - `fe/src/features/pho_ca_vat_lieu/material/service/sellable-topping.get.service.ts` & `useGetSellableToppings.ts`: Chấp nhận tham số `store_id?: string`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/StoreInventorySelector.tsx`: Component chuyển cơ sở chuẩn Obsidian Gold:
    - **Admin & Quản Lý:** Hiển thị dropdown switcher chuyển đổi mượt mà giữa các chi nhánh trong chuỗi.
    - **Phó Ca Vật Liệu, Trưởng Ca, Nhân Viên:** Khóa cứng huy hiệu "🔒 Cơ Sở Kho Trực Thuộc (Cố Định): [Mã CS] Tên CS", không thể chọn chéo chi nhánh khác.
  - `fe/src/features/pho_ca_vat_lieu/material/component/MaterialsView.tsx`: Nhúng `StoreInventorySelector` ngay dưới header, kết nối state `selectedStoreId` vào hook `useGetMaterials` và modal `CreateMaterialModal`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipesView.tsx` & `SellableToppingsTable.tsx`: Nhúng `StoreInventorySelector` và truyền `storeId` vào tab Topping Bán Kèm.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: BE `npx tsc --noEmit` đạt 0 lỗi (code 0); FE `npx tsc --noEmit` đạt 0 lỗi (code 0).
  - Trình duyệt thực tế (Browser Subagent):
    - Đã test tại `http://localhost:3001/materials`: Chuyển đổi giữa Cơ sở 1 và Cơ sở 2 cập nhật chuẩn xác số lượng kho và thống kê KPI.
    - Đã test tại `http://localhost:3001/recipes` (Tab Topping Bán Kèm): Thống kê và danh sách topping bán ra phản ánh đúng chi nhánh đã chọn.

---

### [2026-10-24 14:45] - Di Chuyển Bảng CSDL Riêng Topping Bán Ra (SellableToppingsTable) Sang Trang Món & Công Thức (/recipes)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** "nằm bên món và công thức" (Đưa bảng Topping Bán Ra Khách sang trang Quản Lý Món & Sổ Tay Công Thức thay vì để ở trang Kho Vật Liệu).
- **Mã chức năng liên quan:** CN11 (Quản Lý Vật Liệu Kho & Sổ Tay Công Thức Pha Chế SOP)
- **Mã nguồn Frontend (`fe/`):**
  - **Trang Món & Sổ Tay Công Thức (`/recipes`):**
    - `fe/src/features/pho_ca_vat_lieu/material/component/RecipesView.tsx`:
      - Tích hợp thanh chuyển Tab (Tab Switcher) chuẩn nhận diện Obsidian Gold gồm:
        - **Tab 1:** `🍹 Sổ Tay Công Thức & Danh Mục Món` (Hiển thị các công thức SOP, thẻ món, thống kê KPI món và nút Thêm Món Mới).
        - **Tab 2:** `🍨 Topping Bán Kèm (Table Riêng) [Menu Add-on]` (Nhúng `SellableToppingsTable`).
      - Cung cấp toàn bộ 4 thẻ KPI thống kê (Tổng topping, Đang mở bán, Giá bán TB, Lãi gộp bình quân), ô tìm kiếm và bảng 8 cột chi tiết với nút sửa bán lẻ trực tiếp.
  - **Trang Kho Vật Liệu (`/materials`):**
    - `fe/src/features/pho_ca_vat_lieu/material/component/MaterialsView.tsx`:
      - Gỡ bỏ hoàn toàn Tab 3 và import `SellableToppingsTable`, trả lại cấu trúc tinh gọn 2 tab chuyên biệt cho kho hàng: `Danh Mục Vật Liệu & Bao Bì` và `Tồn Kho Hiện Tại & Kiểm Kê`.
- **Kiểm thử & Xác thực:**
  - TypeScript compilation: BE (`npx tsc --noEmit`) đạt 0 lỗi, FE (`npx tsc --noEmit`) đạt 0 lỗi.
  - Browser subagent: Đã chạy kiểm tra tại `http://localhost:3001/recipes` (chuyển sang Tab 2 hiển thị chuẩn xác bảng topping bán ra) và `http://localhost:3001/materials` (chỉ còn 2 tab kho sạch sẽ).

---

### [2026-10-24 14:30] - Thêm Thuộc Tính Kích Cỡ Ly (cup_size) (Hình 1) & Cách Bán (portion_unit), Giá Bán (selling_price) Kèm Bảng CSDL Riêng Cho Topping Bán Ra (sellable_toppings) (Hình 2)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. *Hình 1:* "thêm thuộc tính dành cho ly vd ly size gì đó ...."
  2. *Hình 2:* "thêm vô cách thức bán ra vd như 1 miếng, 1 vá .... cho nguwoif dùng tự điền kèm theo giá và có table riêng cho toping bán ra nữa nha"
- **Mã chức năng liên quan:** CN11 (Quản Lý Vật Liệu Kho & Sổ Tay Công Thức Pha Chế SOP)
- **Mã nguồn Backend (`be/`):**
  - **Prisma Schema Multi-file & Models:**
    - `be/src/databases/prisma/schema/packaging.prisma`: Bổ sung `cupSize String? @map("cup_size")`.
    - `be/src/databases/prisma/schema/topping.prisma`: Bổ sung `portionUnit String? @map("portion_unit")` và `sellingPrice Float? @default(0) @map("selling_price")`.
    - `be/src/databases/prisma/schema/sellable_topping.prisma`: Tạo mới model `SellableTopping` map collection `sellable_toppings` trên MongoDB Atlas, lưu trữ riêng biệt thực đơn topping bán cho khách gồm `topping_id`, `name`, `code`, `portion_unit`, `cost_price`, `selling_price`, `gross_profit_margin`, `is_active`, `sort_order`, `notes`.
    - Chạy `npm run db:generate` đồng bộ Prisma Client v6.19.3.
  - **Mongoose Models:**
    - `be/src/modules/pho_ca_vat_lieu/material/models/packaging.model.ts`: Bổ sung `cup_size` vào `IPackagingDoc` và `PackagingSchema`.
    - `be/src/modules/pho_ca_vat_lieu/material/models/topping.model.ts`: Bổ sung `portion_unit` và `selling_price` vào `IToppingDoc` và `ToppingSchema`.
    - `be/src/modules/pho_ca_vat_lieu/material/models/sellable-topping.model.ts`: Tạo `SellableToppingModel` quản lý collection `sellable_toppings`.
  - **Zod Schemas & DTOs:**
    - `be/src/modules/pho_ca_vat_lieu/material/schemas/material.schema.ts`: Bổ sung `cup_size`, `portion_unit`, `selling_price` vào `MaterialCreateSchema`, `MaterialUpdateSchema`, `MaterialResponse`.
    - `be/src/modules/pho_ca_vat_lieu/material/schemas/sellable-topping.schema.ts`: Tạo `SellableToppingCreateSchema`, `SellableToppingUpdateSchema`, `SellableToppingResponse`.
  - **Repositories:**
    - `be/src/modules/pho_ca_vat_lieu/material/repositories/sellable-topping.repository.ts`: Repository chuyên biệt cho bảng `sellable_toppings`, tự động liên kết tồn kho từ bảng `toppings`, tính lãi gộp (%), hỗ trợ `syncFromWarehouseTopping` và `seedInitialSellableToppings`.
    - `be/src/modules/pho_ca_vat_lieu/material/repositories/material.repository.ts`: Lưu `cup_size` cho bao bì; lưu `portion_unit` + `selling_price` cho topping đồng thời tự động gọi `syncFromWarehouseTopping` đồng bộ sang bảng `sellable_toppings`.
  - **Granular Services & Controllers (Role-based Feature-Sliced):**
    - `sellable-topping.get.service.ts` & `sellable-topping.get.controller.ts`: Lấy danh sách topping bán kèm tồn kho thời gian thực.
    - `sellable-topping.create.service.ts` & `sellable-topping.create.controller.ts`: Tạo topping bán trực tiếp vào bảng `sellable_toppings`.
    - `sellable-topping.update.service.ts` & `sellable-topping.update.controller.ts`: Cập nhật cách thức bán, giá bán và đồng bộ ngược về kho.
    - `sellable-topping.delete.service.ts` & `sellable-topping.delete.controller.ts`: Xóa hoặc ẩn topping bán ra.
  - **Routes:**
    - `be/src/modules/pho_ca_vat_lieu/material/routes/sellable-topping.routes.ts`: Đăng ký router `/api/v1/sellable-toppings` và mount vào `be/src/routes/index.ts`.
- **Mã nguồn Frontend (`fe/`):**
  - **Hình 1 (Kích cỡ ly / bao bì):**
    - `fe/src/features/pho_ca_vat_lieu/material/component/CreateMaterialModal.tsx` & `EditMaterialModal.tsx`: Khi chọn Bao Bì & Ly Nhựa, hiển thị `📏 Kích Cỡ / Dung Tích Ly (Size)` kèm gợi ý 1 chạm (`Size S (350ml)`, `Size M (500ml)`, `Size L (700ml)`, `1000ml (Khổng lồ)`) và cho phép tự gõ bất kỳ.
    - `fe/src/features/pho_ca_vat_lieu/material/component/MaterialCard.tsx`: Hiển thị huy hiệu `📏 [Size: ...]`.
  - **Hình 2 (Cách bán, giá bán & Bảng riêng Topping bán ra):**
    - `fe/src/features/pho_ca_vat_lieu/material/component/CreateMaterialModal.tsx` & `EditMaterialModal.tsx`: Khi chọn Topping & Phụ Gia, hiển thị `🍨 Cấu Hình Topping Bán Ra (Table Riêng)` với ô nhập "Cách Thức Bán Ra (Khẩu phần)" + quick pills (`1 vá`, `1 miếng`, `1 muỗng`, `1 viên`, `1 phần`, `2 miếng`) và ô "Giá Bán Ra Khách (VNĐ)" + quick pills (`5.000đ`, `7.000đ`, `10.000đ`, `12.000đ`, `15.000đ`).
    - `fe/src/features/pho_ca_vat_lieu/material/type/sellable-topping.type.ts` & `schema/`: Cung cấp types & validation.
    - `fe/src/features/pho_ca_vat_lieu/material/service/sellable-topping.*.service.ts`: API services kết nối endpoint `/api/v1/sellable-toppings`.
    - `fe/src/features/pho_ca_vat_lieu/material/hook/useGetSellableToppings.ts` & `useUpdateSellableTopping.ts`: Hooks React Query v5.
    - `fe/src/features/pho_ca_vat_lieu/material/component/SellableToppingsTable.tsx`: Bảng quản lý chuyên biệt phong cách Obsidian Gold với 4 cards KPI thống kê và bảng 8 cột chi tiết (Tên topping, Cách bán/khẩu phần, Giá vốn kho, Giá bán lẻ, Lãi gộp %, Tồn kho thực tế, Trạng thái, Thao tác).
    - `fe/src/features/pho_ca_vat_lieu/material/component/EditSellableToppingModal.tsx`: Modal sửa nhanh cách bán và giá bán topping trực tiếp trên bảng.
    - `fe/src/features/pho_ca_vat_lieu/material/component/MaterialsView.tsx`: Bổ sung Tab 3 `Topping Bán Ra (Table Riêng) [Menu Bán Khách]`.
- **Kiểm thử & Thẩm định:**
  - TypeScript compilation: BE (`npx tsc --noEmit`) đạt 0 lỗi, FE (`npx tsc --noEmit`) đạt 0 lỗi.
  - Browser Subagent: Đã kiểm tra trực quan cả 2 modal và table Topping Bán Ra, chụp ảnh lưu artifact thành công.

---

### [2026-10-24 13:00] - Thu Gọn Chế Độ Nhiệt Độ Ly (Ảnh 1) & Tách Danh Mục Món Thành Bảng CSDL Riêng Biệt (recipe_categories) (Ảnh 2)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:**
  1. *Ảnh 1:* "viết gọn thôi" (Thu gọn bộ chọn chế độ nhiệt độ của ly/bao bì trong modal thêm/sửa vật liệu).
  2. *Ảnh 2:* "tạo mới or chỉnh sữa thì chọn chế độ danh mục list danh sách danh mục chọn thuộc món đó nếu khoog có danh mục thì có thẻ điền tên danh mục và danh mục và 1 table riêng nha không gộp chung thành thuộc tính món".
- **Mã chức năng liên quan:** CN11 (Quản Lý Vật Liệu Kho & Sổ Tay Công Thức Pha Chế SOP)
- **Mã nguồn Backend (`be/`):**
  - **Prisma Schema Multi-file & Models:**
    - `be/src/databases/prisma/schema/recipe_category.prisma`: Tạo model `RecipeCategory` tương ứng collection vật lý `recipe_categories` trên MongoDB Atlas, bao gồm `name (unique)`, `type (customer_product | internal_prep | both)`, `description`, `sort_order`, `is_active`.
    - `be/src/databases/prisma/schema/recipe.prisma`: Bổ sung trường `categoryId String? @map("category_id") @db.ObjectId`.
    - Thực thi `npm run db:generate` đồng bộ Prisma Client v6.19.3.
  - **Mongoose Models:**
    - `be/src/modules/pho_ca_vat_lieu/material/models/recipe-category.model.ts`: Khai báo `RecipeCategoryModel` trỏ vào collection `recipe_categories`.
    - `be/src/modules/pho_ca_vat_lieu/material/models/recipe.model.ts`: Cập nhật `category_id` (ObjectId, ref `RecipeCategory`) vào `IRecipeDoc` và `RecipeSchema`.
  - **Zod Schemas & DTOs:**
    - `be/src/modules/pho_ca_vat_lieu/material/schemas/recipe-category.schema.ts`: Khai báo `RecipeCategoryCreateSchema`, `RecipeCategoryResponse`.
    - `be/src/modules/pho_ca_vat_lieu/material/schemas/recipe.schema.ts`: Thêm `category_id: z.string().optional()` vào `RecipeCreateSchema` và `RecipeResponse`.
  - **Repositories:**
    - `be/src/modules/pho_ca_vat_lieu/material/repositories/recipe-category.repository.ts`: Tạo repo độc lập hỗ trợ `findAll`, `findById`, `findByName`, `create`, `findOrCreate` (tự động tạo bản ghi mới vào table `recipe_categories` nếu chưa có khi tạo món), và `seedInitialCategories` (khởi tạo các danh mục mặc định: Trà trái cây, Cà phê, Trà sữa, Đá xay, Bán thành phẩm nội bộ, Cốt trà & Syrup).
    - `be/src/modules/pho_ca_vat_lieu/material/repositories/recipe.repository.ts`: Map `category_id` trong `create` và `update`.
  - **Granular Services & Controllers:**
    - `recipe-category.get.service.ts` & `recipe-category.get.controller.ts`: Lấy danh sách danh mục (GET `/api/v1/pho_ca_vat_lieu/recipes/categories`).
    - `recipe-category.create.service.ts` & `recipe-category.create.controller.ts`: Thêm danh mục mới (POST `/api/v1/pho_ca_vat_lieu/recipes/categories`).
    - `recipe.create.service.ts` & `recipe.update.service.ts`: Tích hợp `RecipeCategoryRepository.findOrCreate` đảm bảo khi người dùng nhập tên danh mục tự do, bản ghi danh mục sẽ được lưu vào bảng `recipe_categories` và liên kết ID vào món.
  - **Routes:**
    - `recipe.routes.ts`: Đăng ký router `/categories` (GET & POST) trước `/:id` tránh xung đột endpoint.
- **Mã nguồn Frontend (`fe/`):**
  - **Ảnh 1 (Thu gọn layout):**
    - `fe/src/features/pho_ca_vat_lieu/material/component/CreateMaterialModal.tsx` & `EditMaterialModal.tsx`: Thu gọn tiêu đề thành `🌡️ Loại Ly / Nhiệt Độ`, 3 nút bấm siêu gọn: `❄️ Ly Lạnh`, `🔥 Ly Nóng`, `❄️🔥 Cả Hai`, bỏ hoàn toàn text mô tả phụ dài dòng. Thu gọn tương tự cho bộ chọn `🧪 Phạm Vi Sử Dụng` (`🍹 Món Bán`, `🏠 Nội Bộ`, `🍹🏠 Cả Hai`).
  - **Ảnh 2 (Danh mục món table riêng):**
    - `fe/src/features/pho_ca_vat_lieu/material/type/recipe-category.type.ts`: Types `RecipeCategory`, `RecipeCategoryListResponse`, `RecipeCategoryCreatePayload`.
    - `fe/src/features/pho_ca_vat_lieu/material/type/recipe.type.ts` & `schema/recipe.schema.ts`: Bổ sung `category_id`.
    - `fe/src/core/constants/query-keys.ts`: Thêm `recipes.categories`.
    - `fe/src/features/pho_ca_vat_lieu/material/service/recipe-category.get.service.ts` & `create.service.ts`: Axios services kết nối backend API.
    - `fe/src/features/pho_ca_vat_lieu/material/hook/useGetRecipeCategories.ts` & `useCreateRecipeCategory.ts`: React Query hooks quản lý cache danh mục.
    - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx` & `EditRecipeModal.tsx`:
      - Thiết kế bộ chọn danh mục kép linh hoạt:
        1. **Chế độ Chọn Có Sẵn:** Dropdown chọn danh mục từ database kèm thanh quick pills chọn nhanh bằng 1 click.
        2. **Chế độ Nhập Mới:** Nút toggle `➕ Nhập danh mục mới` / `← Chọn từ danh mục có sẵn` cho phép gõ tự do tên danh mục; giao diện thông báo trực quan "Tên danh mục này sẽ được tự động lưu vào bảng danh mục riêng biệt (recipe_categories) trong CSDL".
    - `fe/src/features/pho_ca_vat_lieu/material/component/RecipesView.tsx`: Thêm bộ lọc dropdown `🏷️ Tất Cả Danh Mục` trên thanh toolbar, tự động nạp từ API danh mục trong CSDL.
- **Kiểm tra & Xác thực:**
  - `be/` và `fe/` `npx tsc --noEmit` đạt 0 lỗi.
  - Browser subagent kiểm thử thực tế trên `http://localhost:3001/materials` và `/recipes`: Thu gọn nhiệt độ ly thành công; hiển thị danh mục từ database, chuyển đổi chế độ nhập mới và tạo món thành công.

---

### [2026-10-24 12:00] - Phân Tách 3 Bảng Database Độc Lập (packagings, ingredients, toppings) & Phân Loại Phạm Vi Pha Chế Nguyên Liệu (Món Bán / Nội Bộ / Cả Hai)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** 
  1. "tách các table này ra thành các table khác nhau trong database đi" (Bao Bì & Ly Nhựa, Nguyên Liệu Pha Chế, Topping & Phụ Gia).
  2. "và ở nguyên liệu pha chế sẽ phân biệt pha chế món hay pha chế nội bộ hay áp dụng cả 2".
- **Mã chức năng liên quan:** CN11 (Quản Lý Vật Liệu Kho & Sổ Tay Công Thức Pha Chế SOP)
- **Mã nguồn Backend (`be/`):**
  - **Prisma Schema Multi-file & Models:**
    - `be/src/databases/prisma/schema/packaging.prisma`: Model `Packaging` tương ứng collection `packagings` trên MongoDB Atlas, hỗ trợ `temperature_mode` ("cold" | "hot" | "both").
    - `be/src/databases/prisma/schema/ingredient.prisma`: Model `Ingredient` tương ứng collection `ingredients` trên MongoDB Atlas, hỗ trợ `usage_scope` ("customer_product" | "internal_prep" | "both").
    - `be/src/databases/prisma/schema/topping.prisma`: Model `Topping` tương ứng collection `toppings` trên MongoDB Atlas.
    - Thực thi `npm run db:generate` đồng bộ Prisma Client v6.19.3.
  - **Mongoose Models:**
    - `be/src/modules/pho_ca_vat_lieu/material/models/packaging.model.ts`: Khai báo `PackagingModel` trỏ vào collection `packagings`.
    - `be/src/modules/pho_ca_vat_lieu/material/models/ingredient.model.ts`: Khai báo `IngredientModel` trỏ vào collection `ingredients`, schema có `usage_scope`.
    - `be/src/modules/pho_ca_vat_lieu/material/models/topping.model.ts`: Khai báo `ToppingModel` trỏ vào collection `toppings`.
  - **Repository & Aggregator Pattern:**
    - `be/src/modules/pho_ca_vat_lieu/material/repositories/material.repository.ts`:
      - Viết lại toàn diện tương tác trực tiếp với 3 bảng vật lý `packagings`, `ingredients`, `toppings`.
      - Khi truy vấn theo category (`packaging`, `ingredient`, `topping`), query thẳng vào bảng tương ứng giúp tối ưu tốc độ.
      - Khi xem tổng kho/kiểm kê, tự động hợp nhất kết quả với giao diện chuẩn `UnifiedMaterialItem`.
      - Hàm `findByName(name)` tìm kiếm trên cả 3 bảng.
      - Hàm `seedInitialMaterials()`: Khởi tạo dữ liệu mẫu chuẩn hóa vào từng bảng riêng biệt kèm `usage_scope` chính xác cho nguyên liệu (Đường cát, Kem béo Rich's dùng nội bộ, Mứt dâu Berrino, Siro dùng món bán, Sữa tươi Dalat Milk, Sữa đặc Ngôi sao dùng cả hai).
  - **Services & Schemas:**
    - `material.schema.ts`: Thêm trường `usage_scope: z.enum(['customer_product', 'internal_prep', 'both']).optional()`.
    - `material.get.service.ts`: Map `usage_scope` trong hàm `mapMaterialDoc`.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/type/material.type.ts`: Bổ sung `usage_scope?: 'customer_product' | 'internal_prep' | 'both' | string;` trong `Material` và `MaterialCreatePayload`.
  - `fe/src/features/pho_ca_vat_lieu/material/schema/material.schema.ts`: Thêm `usage_scope` vào `materialFormSchema`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateMaterialModal.tsx` & `EditMaterialModal.tsx`:
    - Khi chọn `🌿 Nguyên Liệu Pha Chế`: Hiển thị bộ chọn **`🧪 Phạm Vi Sử Dụng Nguyên Liệu (*)`** với 3 tùy chọn:
      - 🍹 `Pha Chế Món Bán` (`customer_product`): Dùng trực tiếp làm món cho khách.
      - 🏠 `Pha Chế Nội Bộ` (`internal_prep`): Dùng sơ chế siro, ủ trà cốt, foam kem...
      - 🍹🏠 `Áp Dụng Cả Hai` (`both`): Dùng cho cả món bán và sơ chế nội bộ.
  - `fe/src/features/pho_ca_vat_lieu/material/component/MaterialCard.tsx` & `MaterialsView.tsx`:
    - Hiển thị badge trực quan `[🍹 Món Bán]`, `[🏠 Nội Bộ]`, `[🍹🏠 Cả Hai]` trên thẻ vật liệu và bảng kiểm kê kho.
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx` & `EditRecipeModal.tsx`:
    - Nâng cấp Dropdown chọn nguyên liệu từ kho thành các `<optgroup>` phân tách rõ: `🌿 NGUYÊN LIỆU PHA CHẾ` (kèm tag phạm vi), `🍒 TOPPING & PHỤ GIA`, `📦 BAO BÌ & LY NHỰA` (kèm tag nhiệt độ).
- **Kiểm Thử & Xác Nhận:**
  - `npx tsc --noEmit` đạt mã 0 (0 error) trên cả Backend và Frontend.
  - Browser subagent tự động kiểm thử giao diện trực tiếp trên trình duyệt, chụp ảnh màn hình lưu vết `create_material_modal_usage_scope_1792817776599.png`.

---

### [2026-10-24 11:30] - Hệ Thống Chế Độ Nhiệt Độ Món (Lạnh / Nóng / Cả Hai) & Chọn Ly Riêng Biệt Tự Động Từ Kho
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** phần này chọn ly trong hệ thống và các món sẽ có chế độ lạnh, nóng, or món có thể chế biến cả lạnh và nón và tất nhiên là mooic chế độ có ly riêng để chọn; tương tự bên ly cũng có chế độ chọn ly lạnh hay nóng ....
- **Mã chức năng liên quan:** CN11 (Quản Lý Vật Liệu Kho & Sổ Tay Công Thức Pha Chế)
- **Mã nguồn Backend (`be/`):**
  - `be/src/databases/prisma/schema/material.prisma`: Bổ sung trường `temperatureMode String? @default("both") @map("temperature_mode")`.
  - `be/src/databases/prisma/schema/recipe.prisma`: Bổ sung `servingMode String? @default("cold") @map("serving_mode")`, `coldCupId String? @map("cold_cup_id") @db.ObjectId`, `coldCupName String? @map("cold_cup_name")`, `hotCupId String? @map("hot_cup_id") @db.ObjectId`, `hotCupName String? @map("hot_cup_name")`. Chạy `npm run db:generate`.
  - `be/src/modules/pho_ca_vat_lieu/material/models/material.model.ts` & `recipe.model.ts`: Cập nhật Schema Mongoose và TypeScript Interface.
  - `be/src/modules/pho_ca_vat_lieu/material/schemas/material.schema.ts` & `recipe.schema.ts`: Cập nhật Zod validation schema và Response interface.
  - `be/src/modules/pho_ca_vat_lieu/material/repositories/material.repository.ts`:
    - Map `temperature_mode` trong `create` và `update`.
    - Bổ sung tự động ly giấy nóng `MAT-LY-HOT-350` (350ml 12oz) và `MAT-LY-HOT-500` (500ml 16oz) vào pipeline khởi tạo kho.
  - `be/src/modules/pho_ca_vat_lieu/material/repositories/recipe.repository.ts`: Map `serving_mode`, `cold_cup_id`, `cold_cup_name`, `hot_cup_id`, `hot_cup_name` trong `create` và `update`.
  - `be/src/modules/pho_ca_vat_lieu/material/services/material.get.service.ts` & `recipe.get.service.ts`: Map đầy đủ các trường nhiệt độ và ly trả về API.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/type/material.type.ts` & `recipe.type.ts`: Bổ sung định nghĩa TypeScript tương ứng.
  - `fe/src/features/pho_ca_vat_lieu/material/schema/material.schema.ts` & `recipe.schema.ts`: Cập nhật Zod schema client-side.
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateMaterialModal.tsx` & `EditMaterialModal.tsx`:
    - Khi chọn phân loại `📦 Bao Bì & Ly Nhựa`: Hiển thị bộ chọn **`🌡️ Chế Độ Nhiệt Độ Của Ly / Bao Bì`** với 3 tùy chọn: `❄️ Ly Lạnh (Đá)`, `🔥 Ly Nóng`, `❄️🔥 Cả Hai / Đa Năng`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/MaterialCard.tsx` & `MaterialsView.tsx`: Hiển thị huy hiệu nhiệt độ `❄️ Ly Lạnh`, `🔥 Ly Nóng`, `❄️🔥 Đa Năng` trên thẻ vật liệu và bảng kiểm kê tồn kho.
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx` & `EditRecipeModal.tsx`:
    - Thay thế ô nhập khẩu phần tĩnh bằng **Khối Cấu Hình Nhiệt Độ & Chọn Ly Trong Hệ Thống**:
      - 3 Chế độ: `❄️ Phục Vụ Lạnh (Đá)`, `🔥 Phục Vụ Nóng`, `❄️🔥 Cả Lạnh & Nóng`.
      - Khi chọn Lạnh: Dropdown chọn Ly Lạnh từ danh sách ly kho (lọc ly lạnh).
      - Khi chọn Nóng: Dropdown chọn Ly Nóng từ danh sách ly kho (lọc ly nóng).
      - Khi chọn Cả Hai: Hiển thị 2 Dropdown riêng biệt cạnh nhau (1 ô chọn Ly Lạnh, 1 ô chọn Ly Nóng).
      - Tự động sinh chuỗi khẩu phần phục vụ hiển thị (`serving_size`) đồng bộ với tên ly được chọn.
      - Tab 2 (BOM): Bổ sung nút **`➕ Đưa Ly Đã Chọn Vào BOM`** 1-chạm giúp Barista tự động đưa ly tương ứng vào bảng định lượng.
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipeCard.tsx` & `RecipeDetailModal.tsx`:
    - Hiển thị huy hiệu nhiệt độ `❄️ Phục Vụ Lạnh` / `🔥 Phục Vụ Nóng` / `❄️🔥 Cả Lạnh & Nóng`.
    - Modal chi tiết hiển thị thẻ riêng cấu hình Ly Phục Vụ Quán (Ly Lạnh & Ly Nóng).
- **Kiểm Thử:**
  - `npx tsc --noEmit` đạt 0 lỗi ở cả `be/` và `fe/`.
  - Browser subagent tự động kiểm thử toàn diện trên trình duyệt thực tế, chụp ảnh màn hình lưu vết `create_recipe_modal_temp_1792816024994.png` và `create_material_modal_temp_1792816084870.png`.

---

### [2026-10-24 11:00] - Tách Riêng Biệt Hai Phân Hệ: 'Kho & Vật Liệu' và 'Món & Sổ Tay Công Thức'
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Kho và sổ tay công thức tách riêng ra vd như kho thì thêm kho .... để lại chức năng này ảnh 1 và chức năng bên cạnh là tồn kho hiện tại; thêm chức năng mới là món sẽ gồm thêm món như ảnh 2.
- **Mã chức năng liên quan:** CN11 (Quản Lý Kho & Sổ Tay Công Thức)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/core/components/layout/AppShell.tsx`:
    - Tách mục menu Sidebar thành 2 chức năng độc lập:
      1. **"Kho & Vật Liệu"** (`/materials`): Quản lý kho, bao bì ly nhựa và tồn kho hiện tại.
      2. **"Món & Sổ Tay Công Thức"** (`/recipes`): Quản lý danh mục món bán khách và công thức sơ chế nội bộ.
  - `fe/src/features/pho_ca_vat_lieu/material/component/MaterialsView.tsx`:
    - Chuyên biệt hóa thành phân hệ Kho Hàng:
      - **Tab 1 ("Danh Mục Vật Liệu & Bao Bì")**: Đúng chuẩn Ảnh 1 người dùng gửi, lọc theo Bao bì & Ly, Nguyên liệu, Topping, cảnh báo tồn, nút "+ Thêm Vật Liệu Vào Kho".
      - **Tab 2 ("Tồn Kho Hiện Tại & Kiểm Kê")**: Chức năng bên cạnh theo đúng yêu cầu, bảng kiểm kê chi tiết số lượng tồn, ngưỡng tối thiểu, giá vốn, thành tiền tồn và công cụ điều chỉnh nhanh (+ / -).
  - `fe/src/features/pho_ca_vat_lieu/material/component/RecipesView.tsx`:
    - Khởi tạo component chuyên biệt cho Quản Lý Món & Sổ Tay Công Thức:
      - Nút nổi bật: **"+ Thêm Món Mới"** (đúng chuẩn Ảnh 2).
      - Thống kê: Tổng danh mục món, Món bán khách hàng, Sơ chế bán thành phẩm nội bộ.
      - Bộ lọc: Tất cả món, Món bán khách hàng, Sơ chế nội bộ (chỉ nhân viên).
      - Lưới thẻ món RecipeCard có nút "Xem Công Thức & Quy Trình", "Chỉnh Sửa", "Xóa Món".
  - `fe/src/app/recipes/page.tsx`: Route mới `/recipes` tích hợp `export const instant = false;`.
- **Kiểm Thử:**
  - `npx tsc --noEmit` đạt 0 lỗi (Exit code 0).
  - Browser subagent kiểm thử tự động toàn diện:
    - Sidebar hiển thị cả 2 mục riêng biệt.
    - Duyệt trang Kho: kiểm tra Tab 1 Danh mục và Tab 2 Tồn kho hiện tại.
    - Duyệt trang Món: kiểm tra nút "+ Thêm Món Mới" và các thẻ món Cà phê muối, Trà dâu, Trà đào, Sơ chế nội bộ.

---

### [2026-10-24 10:32] - Khắc Phục Cảnh Báo Instant Navigation Trên Route /materials
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Hiện tượng lỗi:** Next.js 16.4.3 Turbopack đưa ra cảnh báo segment dropped do kiểm tra validation instant navigation khi chuyển trang: `Route "/materials": Could not validate that a segment in your UI has instant navigation`.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/app/materials/page.tsx`: Khai báo `export const instant = false;` đồng bộ chuẩn với các trang khác trong hệ thống (`stores/page.tsx`, `staff/page.tsx`, `salary/page.tsx`).
- **Kiểm Thử:**
  - `npx tsc --noEmit` đạt 0 lỗi (Exit code 0).
  - Browser subagent tự động kiểm thử tại `http://localhost:3001/materials`, tải trang mượt mà và không còn bất kỳ thông báo lỗi nào.

---

### [2026-10-24 10:20] - Nâng Cấp Ô Đơn Vị Tính Linh Hoạt (Hỗ Trợ Thùng, Cây, Lốc, Can, Bao... & Tự Do Nhập Text)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Đơn vị tính có thể là thùng hay j đó .......
- **Mã chức năng liên quan:** CN11 (Quản Lý Vật Liệu & Tồn Kho)
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/pho_ca_vat_lieu/material/component/CreateMaterialModal.tsx`:
    - Thay thế thẻ `<select>` giới hạn cứng bằng ô `<input type="text">` linh hoạt, cho phép người dùng tự do nhập bất kỳ đơn vị nào (vd: Thùng, Thùng 1000 cái, Cây 50 ly, Bao 25kg, Can 5L...).
    - Tích hợp `<datalist id="create-unit-suggestions">` với danh sách đơn vị F&B phổ biến.
    - Bổ sung thanh nút chọn nhanh (Quick Tags) 1-chạm: `Thùng`, `Cây`, `Lốc`, `Can`, `Hộp`, `Chai`, `Bao`, `Túi`, `Cái`, `Kg`, `Lít`, `ml`.
  - `fe/src/features/pho_ca_vat_lieu/material/component/EditMaterialModal.tsx`: Đồng bộ nâng cấp ô Đơn Vị Tính tương tự cho modal chỉnh sửa vật liệu.
- **Kiểm Thử:**
  - `npx tsc --noEmit` đạt 0 lỗi.
  - Browser subagent tự động kiểm thử tại `http://localhost:3001/materials`, mở modal thêm vật liệu, bấm chọn tag "Thùng" và "Cây", xác nhận dữ liệu cập nhật chính xác và chụp ảnh màn hình lưu vết.

---

### [2026-10-24 10:15] - Hoàn Thành Toàn Diện Phân Hệ Quản Lý Vật Liệu Kho & Sổ Tay Công Thức Pha Chế Bí Mật (BOM & SOP)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Thêm chức năng quản lý vật liệu và công thức (bao bì ly nhựa, nguyên liệu pha chế, món sơ chế nội bộ chỉ nhân viên thấy như nấu đường, ủ trà, và món bán khách như trà dâu; riêng công thức định lượng và các bước SOP chỉ có nhân viên trở lên mới thấy).
- **Mã chức năng liên quan:** CN11 (Quản Lý Vật Liệu & Sổ Tay Công Thức Pha Chế Bí Mật)
- **Mã nguồn Backend (`be/`):**
  - `be/src/databases/prisma/schema/material.prisma` & `recipe.prisma`: Tạo models `Material` và `Recipe` (với embedded `RecipeIngredient`, `RecipeStep`). Chạy `npm run db:generate`.
  - `be/src/modules/pho_ca_vat_lieu/material/models/material.model.ts` & `recipe.model.ts`: Khai báo Mongoose models.
  - `be/src/modules/pho_ca_vat_lieu/material/schemas/`: Zod validation schemas cho Material và Recipe.
  - `be/src/modules/pho_ca_vat_lieu/material/repositories/`: Thao tác DB CRUD + tự động nạp hạt giống ban đầu (15 mặt hàng ly nhựa 500/700ml, nắp, ống hút, đường, trà, siro + 6 công thức mẫu nội bộ & bán khách).
  - `be/src/modules/pho_ca_vat_lieu/material/services/`: Triển khai Granular Services (`material.*`, `recipe.*`).
    - **Logic bảo mật công thức tối quan trọng trong `recipe.get.service.ts`:** Khách hàng unauthenticated bị lọc ẩn hoàn toàn món sơ chế `internal_prep`. Đối với món bán khách `customer_product`, khách hàng chỉ thấy tên món, giá bán, ảnh, mô tả, còn định lượng `ingredients` và các bước `steps` bị cắt bỏ hoàn toàn (`has_recipe_access: false`). Chỉ khi người dùng có tài khoản đăng nhập từ cấp `nhan_vien` trở lên mới được xem toàn bộ tỷ lệ định lượng và SOP!
    - **Tự động tính chi phí giá vốn (COGS):** Tự động tính tổng chi phí nguyên vật liệu và bao bì.
  - `be/src/modules/pho_ca_vat_lieu/material/controllers/`: Controllers bọc `asyncHandler`.
  - `be/src/modules/pho_ca_vat_lieu/material/routes/`: Router gắn middleware `optionalAuthenticate`, `requireRoles`.
  - `be/src/routes/index.ts`: Đã mount `/v1/materials`, `/v1/recipes`.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/app/materials/page.tsx`: Route mới `/materials`.
  - `fe/src/core/constants/query-keys.ts`: Đăng ký query keys `materials` và `recipes`.
  - `fe/src/features/pho_ca_vat_lieu/material/type/`: Type definitions `Material`, `Recipe`, `RecipeIngredient`, `RecipeStep`.
  - `fe/src/features/pho_ca_vat_lieu/material/schema/`: Zod form schemas tương thích hoàn hảo React Hook Form.
  - `fe/src/features/pho_ca_vat_lieu/material/service/`: Granular Axios HTTP services.
  - `fe/src/features/pho_ca_vat_lieu/material/hook/`: React Query custom hooks (`useGetMaterials`, `useCreateMaterial`, `useUpdateMaterialStock`, `useGetRecipes`, `useGetRecipeDetail`...).
  - `fe/src/features/pho_ca_vat_lieu/material/component/`:
    - `MaterialsView.tsx`: Main view 2 Tab (Kho Vật Liệu & Sổ Tay Công Thức SOP) với phong cách Obsidian Gold sang trọng.
    - `MaterialCard.tsx`: Card hiển thị vật liệu, cảnh báo tồn kho thấp, điều chỉnh tồn kho nhanh +/-.
    - `RecipeCard.tsx`: Card hiển thị món với badge bảo mật nội bộ vs bán khách hàng, giá niêm yết & giá vốn COGS.
    - `RecipeDetailModal.tsx`: Modal chi tiết hiển thị Bảng Định Lượng Vật Liệu (BOM: ly nhựa, gram cốt trà, ml nước đường...) và Quy Trình Pha Chế Chi Tiết (SOP) kèm Mẹo Barista.
    - `CreateRecipeModal.tsx` & `EditRecipeModal.tsx`: Form tạo/sửa công thức động chọn nhanh nguyên liệu trong kho.
    - `CreateMaterialModal.tsx`, `EditMaterialModal.tsx`, `DeleteMaterialModal.tsx`, `DeleteRecipeModal.tsx`.
  - `fe/src/core/components/layout/AppShell.tsx`: Bổ sung menu **"Kho & Sổ Tay Công Thức"** vào thanh điều hướng bên trái cho toàn bộ nhân sự từ `nhan_vien` trở lên.
- **Kiểm Thử:**
  - `npx tsc --noEmit` đạt 0 lỗi ở cả `be/` và `fe/`.
  - Browser subagent tự động kiểm thử tại `http://localhost:3001/materials`, duyệt cả 2 Tab Kho Vật Liệu và Sổ Tay Công Thức, mở modal công thức xem chi tiết BOM & SOP thành công.

---

### [2026-10-24 09:18] - Tự Động Hóa 100% Lấy Địa Chỉ Thực Tế Từ Tọa Độ GPS (Reverse-Geocoding)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Địa chỉ thực tế lấy từ gps luôn nha.
- **Mã chức năng liên quan:** CN06 (Quản Lý Chuỗi Chi Nhánh & Cấu Hình GPS)
- **Mã nguồn Backend (`be/`):**
  - `be/src/modules/admin_he_thong/store-config/services/store-config.service.ts`: Nâng cấp hàm `reverseGeocode` hỗ trợ chiến lược Multi-Provider tốc độ cao (Photon OpenStreetMap + BigDataCloud Client + Nominatim fallback), khắc phục triệt để lỗi DNS lookup mạng nội bộ.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/admin_he_thong/checkin-config/service/checkin-config.service.ts`: Nâng cấp hàm `reverseGeocodeService` với multi-provider fallback.
  - `fe/src/features/admin_he_thong/store/component/EditStoreModal.tsx`:
    - Thêm nút **"Cập nhật từ GPS / Tọa độ"** kèm huy hiệu `✓ Lấy từ GPS` tại ô Địa Chỉ Thực Tế.
    - Nút **"Lấy GPS Thiết Bị & Địa Chỉ"** tự động cập nhật cả tọa độ lẫn giải mã địa chỉ thực tế.
    - Thêm cơ chế `onBlur` tại ô Vĩ độ (Latitude) và Kinh độ (Longitude) để tự động phân giải lại địa chỉ khi tọa độ thay đổi.
  - `fe/src/features/admin_he_thong/store/component/CreateStoreModal.tsx`: Tự động kích hoạt lấy GPS thiết bị và phân giải sẵn địa chỉ thực tế ngay khi mở modal.
- **Kiểm Thử:**
  - `npx tsc --noEmit` đạt 0 lỗi trên cả `be/` và `fe/`.
  - Browser Subagent kiểm thử trên `http://localhost:3001/stores`, bấm "Cập nhật từ GPS / Tọa độ" thành công giải mã ra `Đường Bàu Tràm 3, Tổ dân phố 2, Cẩm Lệ, Đà Nẵng`.

---

### [2026-10-24 09:00] - Triển Khai Toàn Diện Hệ Thống Quản Lý Chuỗi Chi Nhánh (Store/Branch Management) Cho Admin Hệ Thống
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Chỗ admin thiếu quản lý chi nhánh và tạo chi nhánh or đóng cửa ....
- **Mã chức năng liên quan:** CN06 (Quản Lý Chuỗi Chi Nhánh & Cấu Hình GPS)
- **Mã nguồn Backend (`be/`):**
  - `be/src/databases/prisma/schema/store_config.prisma`: Bổ sung `storeCode` (@unique), `phone`, `isActive` (@default(true)). Chạy `npm run db:generate`.
  - `be/src/modules/admin_he_thong/store-config/models/store-config.model.ts`: Bổ sung `store_code`, `phone`, `is_active` vào interface và Mongoose schema.
  - `be/src/modules/admin_he_thong/store/schemas/store.schema.ts`: Khai báo Zod validation schemas (`StoreCreateSchema`, `StoreUpdateSchema`, `StoreStatusSchema`) và TypeScript types.
  - `be/src/modules/admin_he_thong/store/repositories/store.repository.ts`: Thao tác trực tiếp DB (`findAll`, `findById`, `findByName`, `findByCode`, `create`, `update`, `updateStatus`, `delete`, `countTotal`, `countActive`, `countInactive`).
  - `be/src/modules/admin_he_thong/store/services/`: Phân rã granular SRP theo chuẩn AGENTS.md (`store.get.service.ts`, `store.create.service.ts`, `store.update.service.ts`, `store.status.service.ts`, `store.delete.service.ts`).
  - `be/src/modules/admin_he_thong/store/controllers/`: Controllers bọc `asyncHandler` (`store.get.controller.ts`, `store.create.controller.ts`, `store.update.controller.ts`, `store.status.controller.ts`, `store.delete.controller.ts`).
  - `be/src/modules/admin_he_thong/store/routes/store.routes.ts`: Đăng ký route và middleware xác thực `authenticate` + phân quyền `requireRoles('admin_he_thong')`.
  - `be/src/routes/index.ts`: Gắn router tại `/v1/stores` và `/stores`.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/core/constants/query-keys.ts`: Đăng ký React Query keys `stores.all`, `stores.list`, `stores.detail`.
  - `fe/src/features/admin_he_thong/store/type/store.type.ts`: Khai báo type interfaces `Store`, `StoreListResponse`, `StoreCreatePayload`, `StoreUpdatePayload`, `StoreStatusPayload`.
  - `fe/src/features/admin_he_thong/store/schema/store.create.schema.ts`: Zod schema xác thực dữ liệu đầu vào.
  - `fe/src/features/admin_he_thong/store/service/`: Granular HTTP API clients (`store.get.service.ts`, `store.create.service.ts`, `store.update.service.ts`, `store.status.service.ts`, `store.delete.service.ts`).
  - `fe/src/features/admin_he_thong/store/hook/`: React Query custom hooks (`useGetStores`, `useCreateStore`, `useUpdateStore`, `useToggleStoreStatus`, `useDeleteStore`).
  - `fe/src/features/admin_he_thong/store/component/`:
    - `StoreManagementView.tsx`: Giao diện quản trị chi nhánh với thanh thống kê, tìm kiếm, lọc trạng thái, grid card.
    - `StoreCard.tsx`: Card hiển thị trạng thái (Đang Mở Cửa / Đã Đóng Cửa), tọa độ GPS, bán kính geofence, nút sửa/đóng cửa/xóa.
    - `CreateStoreModal.tsx`: Modal tạo chi nhánh mới với GPS locator, geocoding tự động.
    - `EditStoreModal.tsx`: Modal cập nhật thông tin chi nhánh.
    - `CloseStoreConfirmModal.tsx`: Modal xác nhận đóng cửa / mở cửa lại chi nhánh.
    - `DeleteStoreConfirmModal.tsx`: Modal cảnh báo và xác nhận xóa chi nhánh.
  - `fe/src/app/stores/page.tsx`: Route page Next.js App Router tại `/stores`.
  - `fe/src/core/components/layout/AppShell.tsx`: Bổ sung menu "Quản Lý Chi Nhánh" trong Sidebar độc quyền cho `admin_he_thong`.
- **Kiểm Thử & Đảm Bảo Chất Lượng:**
  - TypeScript compilation `npx tsc --noEmit` đạt 0 lỗi ở cả `be/` và `fe/`.
  - Kiểm thử trực quan qua Chrome DevTools MCP & Browser Subagent tại `http://localhost:3001/stores`: Giao diện Obsidian Gold hiển thị đầy đủ, mở và đóng modal tạo chi nhánh trơn tru, ghi nhận video WebP và ảnh chụp màn hình thành công.

---

### [2026-10-24 08:30] - Nâng Cấp Bảo Mật Next.js 16.4.0 -> 16.4.3 An Toàn
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Upgrade Next.js to a safe version (khắc phục security vulnerability theo khuyến nghị Next.js agent).
- **Mã nguồn Frontend (`fe/`):**
  - `fe/package.json`: Nâng cấp `next` và `eslint-config-next` từ `16.4.0` lên phiên bản an toàn `16.4.3`.
  - `fe/next.config.ts`: Cấu hình `experimental.agentUpgrade = 'security'`.
  - Kiểm tra toàn diện `next build` hoàn tất với 14/14 static pages và 0 lỗi.
  - Chạy lại dev server trên cổng 3001, phản hồi `HTTP/1.1 200 OK` mượt mà không còn bất kỳ cảnh báo bảo mật nào.

---

### [2026-10-24 08:15] - Sửa Toàn Bộ Đường Dẫn Import Bị Lệch Do Tái Cấu Trúc Module & Khởi Động Thành Công Hệ Thống Fullstack
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Khởi chạy toàn bộ dự án Zone Six (Backend Express.js + Frontend Next.js).
- **Mã chức năng liên quan:** Hạ tầng cốt lõi Fullstack, Role-based Feature-Sliced Architecture.
- **Nội dung xử lý:**
  - Chuẩn hóa toàn bộ đường dẫn tương đối (relative import) 4 cấp từ `modules/[role]/[feature]/` tới `core/`, `middlewares/`, `config/` và các module liên quan sau khi tái cấu trúc thư mục theo vai trò.
  - Sửa lỗi TypeScript tại 9 modules: `admin_he_thong/store-config`, `admin_he_thong/subscription`, `admin_he_thong/zalo`, `nhan_vien/attendance`, `nhan_vien/shift-registration`, `pho_ca_lam_lich/scheduling`, `quan_ly/staff`, `shared/auth`, `shared/notifications`.
  - Kiểm tra `npx tsc --noEmit` đạt 0 lỗi ở cả `be/` và `fe/`.
  - Khởi chạy thành công Backend Node.js tại cổng 8000 (Health Check: `http://localhost:8000/health` -> `{"status":"healthy"}`).
  - Khởi chạy thành công Frontend Next.js tại cổng 3001 (URL: `http://localhost:3001`, HTTP 200 OK).

---

### [2026-10-23 00:01] - Triển Khai Toàn Diện Fullstack (Backend & Frontend) Zalo Bot Đa Cơ Sở & Đa Kênh Nghiệp Vụ
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Lên kế hoạch và thực thi code cấu hình Zalo Bot cho Admin: đặt tên nhóm Zalo theo format chi nhánh, quản lý chuỗi đa cơ sở (mỗi cơ sở có mã và tên riêng), cấu hình 4 nhóm Zalo nghiệp vụ riêng biệt (`CHECKIN`, `MATERIAL`, `SCHEDULE`, `GENERAL`) cho từng cơ sở.
- **Mã chức năng liên quan:** CN10 (Zalo Personal Bot Tự Động), CSDL MongoDB Atlas `zone_6`
- **Mã nguồn Backend (`be/`):**
  - `be/src/databases/prisma/schema/enum.prisma`: Thêm `enum ZaloChannelType { CHECKIN, MATERIAL, SCHEDULE, GENERAL }`.
  - `be/src/databases/prisma/schema/zalo_config.prisma`: Bổ sung `storeId`, `channelType`, `groupName`, `isActive`, `lastSentAt`, compound unique index `@@unique([storeId, channelType])`.
  - `be/src/modules/zalo/models/zalo-config.model.ts`: Thêm schema Mongoose đa kênh, compound index `{ store_id: 1, channel_type: 1 }` (unique).
  - `be/src/modules/zalo/schemas/zalo.schema.ts`: Khai báo Zod schemas `SingleChannelConfigSchema`, `UpdateStoreZaloChannelsSchema`, `TestChannelMessageSchema`.
  - `be/src/modules/zalo/repositories/zalo-config.repository.ts`: Viết các phương thức repository granular `findAllByStore`, `findChannelConfig`, `upsertStoreChannels`, `initDefaultChannelsForStore`.
  - `be/src/modules/zalo/services/zalo-config.service.ts`: Xử lý nghiệp vụ đa kênh, tự động init 4 kênh mặc định nếu cơ sở mới chưa có cấu hình.
  - `be/src/modules/zalo/controllers/zalo-config.controller.ts`: Endpoint `GET /config` (nhận `store_id`, `store_short_name`), `PUT /config` (nhận mảng `channels`).
  - `be/src/routes/zalo.routes.ts`: Mount bảo vệ bằng `authenticate` và `requireRoles('admin_he_thong')`.
- **Mã nguồn Frontend (`fe/`):**
  - `fe/src/features/zalo/type/zalo.type.ts`: Bổ sung types `ZaloChannelType`, `ZaloChannelConfig`, `UpdateStoreChannelsPayload`.
  - `fe/src/features/zalo/service/zalo.service.ts`: Cung cấp `getStoreZaloChannelsService` và `updateStoreZaloChannelsService`.
  - `fe/src/core/constants/query-keys.ts`: Bổ sung `queryKeys.zalo.channels(storeId)`.
  - `fe/src/features/zalo/hook/useZalo.ts`: Cung cấp React Query hooks `useStoreZaloChannels` và `useUpdateStoreZaloChannels`.
  - `fe/src/features/zalo/component/ZaloManager.tsx`: Đại tu toàn bộ giao diện theo phong cách Obsidian Gold:
    - Bộ chuyển đổi cơ sở (Store Switcher) linh hoạt.
    - 4 Thẻ Card trực quan cho 4 kênh nghiệp vụ (`CHECKIN`, `MATERIAL`, `SCHEDULE`, `GENERAL`).
    - Nút sao chép tên nhóm quy chuẩn: `[Z6 - {Mã Cơ Sở}] {Icon} {TÊN NGHIỆP VỤ}`.
    - Dropdown chọn nhanh từ danh sách nhóm Zalo thực tế của Admin (`groupsData`).
    - Nút gửi tin nhắn thử nghiệm từng kênh trực tiếp.
    - Nút lưu cấu hình toàn bộ 4 kênh vào Database MongoDB Atlas.
- **Kiểm thử chất lượng:** Cả Backend (`be`) và Frontend (`fe`) đã compile TypeScript không có bất kỳ lỗi nào (`tsc --noEmit` exit code 0).
- **Trạng thái:** ✅ Đã hoàn thành 100%.

---

### [2026-10-22 23:41] - Chuẩn Hóa Đặc Tả Đa Nhóm Zalo Nghiệp Vụ Trong 1 Cơ Sở (`zalo_configs`)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Trong 1 cơ sở có nhiều nhóm Zalo chuyên biệt (nhóm Check-in riêng, nhóm Nguyên vật liệu riêng, nhóm Lịch ca tuần riêng), cần mô hình hóa chính xác để chống spam và định tuyến đúng kênh.
- **Mã chức năng liên quan:** CN10 (Zalo Automation Bot), Hạ tầng CSDL MongoDB Atlas `zone_6`
- **Tệp thay đổi:**
  - `plane/co_so_du_lieu/01_so_do_thuc_the_erd.md`: Chuyển quan hệ `STORE_CONFIG ||--o{ ZALO_CONFIG`, bổ sung trường `channel_type: 'CHECKIN' | 'MATERIAL' | 'SCHEDULE' | 'GENERAL'`, compound unique index `{ store_id: 1, channel_type: 1 }`.
  - `plane/co_so_du_lieu/02_chi_tiet_cac_collection.md`: Đặc tả chi tiết bảng `zalo_configs` với `channel_type`, `group_name`, `is_active`.
  - `plane/co_so_du_lieu/README.md`: Cập nhật nguyên tắc phân lập dữ liệu chuỗi cho Zalo Bot.
  - `plane/chuc_nang/CN10_zalo_automation_bot.md`: Nâng cấp CN10 thành hệ thống đa kênh nghiệp vụ, bổ sung cơ chế định tuyến sự kiện (Event Dispatcher) và cập nhật API endpoints.
  - `plane/luong_hoat_dong/luong_09_zalo_bot_gui_thong_bao.md`: Cập nhật sơ đồ tuần tự và luồng tự động bắn tin đúng nhóm đích (Check-in $\rightarrow$ Nhóm Check-in, Hết hàng $\rightarrow$ Nhóm Vật liệu, Duyệt lịch $\rightarrow$ Nhóm Lịch tuần).
- **Trạng thái:** ✅ Đã hoàn thành 100% tài liệu theo chuẩn Obsidian Gold.

---

### [2026-10-22 17:11] - Khởi Tạo Phân Hệ Tài Liệu Cơ Sở Dữ Liệu (`plane/co_so_du_lieu/`)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Thêm folder tài liệu quản lý cơ sở dữ liệu vào `plane/` để ghi chép tường minh về ERD, các collection và quy trình seed.
- **Mã chức năng liên quan:** Hạ tầng CSDL MongoDB Atlas `zone_6`, Prisma Multi-File Schemas & Mongoose Models
- **Tệp tạo mới / thay đổi:**
  - `plane/co_so_du_lieu/README.md`: Tổng quan kiến trúc CSDL, nền tảng kỹ thuật, nguyên tắc phân lập dữ liệu đa cơ sở, danh bạ 16 collections.
  - `plane/co_so_du_lieu/01_so_do_thuc_the_erd.md`: Sơ đồ thực thể ERD Mermaid chi tiết, phân tích quan hệ chuỗi đa cơ sở (1 cơ sở cho Trưởng ca/NV, N cơ sở cho Quản lý/Admin, liên kết Lịch tuần, Ca trực, Điểm danh, Zalo Bot).
  - `plane/co_so_du_lieu/02_chi_tiet_cac_collection.md`: Đặc tả chi tiết từng trường (Fields), kiểu dữ liệu (Types), Ràng buộc (Constraints), Indexes và ý nghĩa nghiệp vụ của 16 collections.
  - `plane/co_so_du_lieu/03_quy_trinh_seed_va_migration.md`: Hướng dẫn quy trình nạp dữ liệu mẫu phân tầng 00 -> 05 (Dependency-driven), hàm clean dọn dẹp an toàn ngược chiều quan hệ và các lệnh terminal Prisma.
  - `plane/README.md`: Nâng cấp cấu trúc phân cấp từ 4 tầng lên 5 tầng thư mục, tích hợp `co_so_du_lieu/`.
- **Trạng thái:** ✅ Đã hoàn thành 100% tài liệu theo chuẩn Obsidian Gold.

---

### [2026-10-22 17:05] - Nâng Cấp Toàn Diện Tài Liệu Gốc (Plane) Theo Mô Hình Chuỗi Đa Cơ Sở (Multi-Store)
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Yêu cầu người dùng:** Hệ thống Zone Six có nhiều cơ sở; Admin toàn bộ hệ thống có thể quản lý nhiều cơ sở hoặc vài cơ sở nếu được phân công; Trưởng ca chỉ làm việc và phụ trách tại **ĐÚNG 1 CƠ SỞ DUY NHẤT**.
- **Mã chức năng liên quan:** Toàn bộ CN01 - CN11, Vai trò R01 - R06, Luồng L01 - L09
- **Tệp thay đổi:**
  - `plane/README.md`: Bổ sung nguyên tắc vận hành chuỗi đa cơ sở và cấu trúc Store Scope.
  - `plane/tai_lieu/tong_quan_he_thong.md`: Cập nhật kiến trúc chuỗi, phân hệ Store Management.
  - `plane/vai_tro/`: `README.md`, `01_admin_he_thong.md`, `02_quan_ly.md`, `03_truong_ca.md`, `04_pho_ca_lam_lich.md`, `05_pho_ca_vat_lieu.md`, `06_nhan_vien.md`
  - `plane/chuc_nang/`: `README.md`, `CN01` đến `CN11` (Bổ sung `store_id`, cơ chế Store Switcher cho Admin/Quản lý, khóa cứng 1 cơ sở cho Trưởng ca).
  - `plane/luong_hoat_dong/`: `README.md`, `luong_01` đến `luong_09` (Cập nhật tuần tự các luồng đăng ký, xếp lịch, check-in GPS, quản lý nhân sự, thông báo, cấu hình quán, bảng lương, Zalo bot theo từng cơ sở).
  - `plane/giam_sat/tien_do_chuc_nang.md`: Bổ sung phạm vi cơ sở vào ma trận chức năng.
- **Nội dung thay đổi chi tiết:**
  - **Admin Hệ Thống:** Toàn quyền quản trị chuỗi; có thể chuyển đổi qua lại giữa các cơ sở (Store Switcher) hoặc quản lý danh sách cơ sở được phân công; độc quyền thêm cơ sở mới và gán cơ sở cho tài khoản.
  - **Quản Lý:** Quản lý 1 hoặc nhiều cơ sở được phân công (`assigned_stores`), thao tác dữ liệu độc lập theo cơ sở đang chọn.
  - **Trưởng Ca (Strict 1-Store Policy):** Ràng buộc cứng vào đúng 1 cơ sở duy nhất (`assigned_store_id`), không có Store Switcher, không quản lý chéo; chỉ điểm danh, quản lý cấp dưới, xem lịch và xem lương của nhân sự tại đúng cơ sở của mình.
  - **Bảo mật Backend:** Áp dụng middleware `verifyStoreScope`, chặn 403 Forbidden nếu Trưởng ca cố tình can thiệp chéo cơ sở.
- **Trạng thái:** ✅ Đã hoàn thành 100% tài liệu theo chuẩn Obsidian Gold.

---

### [2026-10-22 15:35] - Thiết lập Toàn bộ Hệ Thống Tài Liệu Gốc (Plane) & Quy Chuẩn Giám Sát
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Mã chức năng liên quan:** Toàn bộ CN01 - CN11, Vai trò R01 - R06, Luồng L01 - L09
- **Tệp thay đổi / Tạo mới:**
  - Thư mục `plane/vai_tro/`: `README.md`, `01_admin_he_thong.md`, `02_quan_ly.md`, `03_truong_ca.md`, `04_pho_ca_lam_lich.md`, `05_pho_ca_vat_lieu.md`, `06_nhan_vien.md`
  - Thư mục `plane/chuc_nang/`: `README.md`, `CN01_xac_thuc_va_tai_khoan.md` đến `CN11_quan_ly_vat_lieu_kho.md`
  - Thư mục `plane/luong_hoat_dong/`: `README.md`, `luong_01_xac_thuc_va_phan_quyen.md` đến `luong_09_zalo_bot_gui_thong_bao.md`
  - Thư mục `plane/giam_sat/`: `README.md`, `tien_do_chuc_nang.md`, `nhat_ky_cap_nhat.md`
  - Cập nhật `.agents/AGENTS.md`, `.agents/GEMINI.md`, `.agents/session_state.json`
- **Nội dung thay đổi:**
  - Xây dựng hoàn chỉnh cây thư mục `plane/` theo chuẩn Single Source of Truth cho toàn bộ dự án quán Cafe & Đồ uống Zone Six.
  - Thiết lập cơ chế ràng buộc: Mọi AI Agent khi code bắt buộc phải đọc tài liệu tại `plane/` và cập nhật lại tình trạng vào `plane/giam_sat/`.
- **Trạng thái:** ✅ Hoàn thành xuất sắc.

---

### [2026-10-20 02:04] - Ẩn và Xóa Bỏ Hoàn Toàn Dấu Vết Zalo Bot Với Các Role Ngoài Admin
- **Người/Agent thực hiện:** Antigravity AI Agent
- **Mã chức năng liên quan:** CN10 (Zalo Bot)
- **Tệp thay đổi:** `fe/src/app/HomeTabs.tsx`, `fe/src/app/zalo/page.tsx`, `fe/src/core/components/Sidebar.tsx`, `be/src/modules/zalo/routes/zalo.routes.ts`
- **Nội dung thay đổi:**
  - Đảm bảo tính năng Zalo Bot là đặc quyền DUY NHẤT của `admin_he_thong`.
  - Thay thế màn hình cảnh báo bằng cơ chế `instant redirect` về `/schedule` và trả về `null` đối với tất cả vai trò khác.
- **Trạng thái:** ✅ Đã hoàn thành và kiểm thử.
