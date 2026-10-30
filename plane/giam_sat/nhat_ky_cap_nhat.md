# 📝 NHẬT KÝ CẬP NHẬT TIẾN ĐỘ & CODE (AUDIT LOG)

> **Mục đích:** Ghi nhận lịch sử mỗi phiên làm việc, mã nguồn thay đổi và lý do can thiệp mã nguồn để đảm bảo tính minh bạch và truy vết nguồn gốc.

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
