# 📖 TÀI LIỆU ĐẶC TẢ TOÀN DIỆN CHỨC NĂNG HỆ THỐNG ZONE SIX THEO TỪNG VAI TRÒ
### (Role-Based Business Analysis Specification - BA Pro Max Edition)
* **Hệ thống:** Zone Six - Chuỗi Lounge, Cafe Scheduler & Zalo Automation Bot
* **Kiến trúc:** Role-based Multi-Store Architecture (Phân lập dữ liệu đa chi nhánh)
* **Tech Stack:** Node.js Express (TypeScript + Prisma/Mongoose) & Next.js 14+ (App Router + React Query v5 + TailwindCSS)
* **Phiên bản tài liệu:** `2.0.0 (Production-Ready)` | **Cập nhật:** 04/11/2026

---

## 📑 MỤC LỤC

1. [Phần 1: Ma Trận Phân Quyền Tổng Thể 6 Vai Trò](#phần-1-ma-trận-phân-quyền-tổng-thể-6-vai-trò)
2. [Phần 2: Đặc Tả Chi Tiết Chức Năng Theo Từng Vai Trò](#phần-2-đặc-tả-chi-tiết-chức-năng-theo-từng-vai-trò)
   - [2.1 Vai Trò 1: Admin Hệ Thống (admin_he_thong)](#21-vai-trò-1-admin-hệ-thống-admin_he_thong)
   - [2.2 Vai Trò 2: Quản Lý Cửa Hàng / Chuỗi (quan_ly)](#22-vai-trò-2-quản-lý-cửa-hàng--chuỗi-quan_ly)
   - [2.3 Vai Trò 3: Trưởng Ca Vận Hành Cơ Sở (truong_ca)](#23-vai-trò-3-trưởng-ca-vận-hành-cơ-sở-truong_ca)
   - [2.4 Vai Trò 4: Phó Ca Làm Lịch (pho_ca_lam_lich)](#24-vai-trò-4-phó-ca-làm-lịch-pho_ca_lam_lich)
   - [2.5 Vai Trò 5: Phó Ca Vật Liệu (pho_ca_vat_lieu)](#25-vai-trò-5-phó-ca-vật-liệu-pho_ca_vat_lieu)
   - [2.6 Vai Trò 6: Nhân Viên (nhan_vien)](#26-vai-trò-6-nhân-viên-nhan_vien)
3. [Phần 3: Bảng Đối Soát Quyền Thao Tác CRUD Nhanh](#phần-3-bảng-đối-soát-quyền-thao-tác-crud-nhanh)
4. [Phần 4: Các Nguyên Tắc Phân Ly Trách Nhiệm & Rào Cản Bảo Mật Cốt Lõi](#phần-4-các-nguyên-tắc-phân-ly-trách-nhiệm--rào-cản-bảo-mật-cốt-lõi)

---

# PHẦN 1: MA TRẬN PHÂN QUYỀN TỔNG THỂ 6 VAI TRÒ

| STT | Tên Phân Hệ & Chức Năng | Route Frontend | API Backend Chính | Admin Hệ Thống | Quản Lý | Trưởng Ca | Phó Ca Làm Lịch | Phó Ca Vật Liệu | Nhân Viên |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **01** | **Xác Thực, Hồ Sơ & Thẻ Số** | `/login`, `/profile` | `/api/v1/auth/*` | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền |
| **02** | **Xếp Lịch Tuần & AutoScheduler** | `/schedule` | `/api/v1/scheduling/*` | ✅ Toàn quyền | ✅ CS phân công | ✅ Đúng 1 CS | ✅ Đúng 1 CS | 👁️ Chỉ xem | 👁️ Chỉ xem |
| **03** | **Tích Điểm Danh Trên Ô Ca** | `/schedule` | `/api/v1/scheduling/toggle-checkin` | ✅ Toàn quyền | ✅ CS phân công | ✅ Đúng 1 CS | ❌ **Ẩn dấu tích** | ❌ Bị ẩn | ❌ Bị ẩn |
| **04** | **Đăng Ký Ca Tuần** | `/schedule/register` | `/api/v1/scheduling/register` | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền |
| **05** | **Cấu Hình Ca & Định Biên** | `/shifts` | `/api/v1/scheduling/shift-configs` | ✅ Toàn quyền | ✅ CS phân công | ✅ Đúng 1 CS | ✅ Đúng 1 CS | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** |
| **06** | **Điểm Danh Camera + GPS** | `/checkin` | `/api/v1/attendance/*` | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền |
| **07** | **Bán Hàng POS Live Order** | `/pos` | `/api/v1/pos/*` | 👁️ Giám sát | 👁️ Giám sát | ✅ Trực ca | ✅ Trực ca | ✅ Trực ca | ✅ Trực ca |
| **08** | **Sơ Đồ Bàn & QR Standee** | `/tables` | `/api/v1/tables/*` | ✅ Toàn quyền | ✅ CS phân công | ✅ Đúng 1 CS | ✅ Đúng 1 CS | 👁️ Đổi trạng thái | 👁️ Đổi trạng thái |
| **09** | **Quản Lý Hóa Đơn & Bill K80** | `/orders` | `/api/v1/pos/orders/*` | ✅ Toàn quyền | ✅ CS phân công | ✅ Đúng 1 CS | 👁️ Xem & In | 👁️ Xem & In | 👁️ Xem & In |
| **10** | **Kho Vật Liệu (Bao Bì, NL, Top)**| `/materials` | `/api/v1/materials/*` | ✅ Toàn quyền | ✅ CS phân công | 👁️ Xem & Lập PR| 👁️ Xem tồn kho | ✅ Kho cơ sở | 👁️ Xem tồn kho |
| **11** | **Công Thức Pha Chế (BOM/SOP)**| `/recipes` | `/api/v1/recipes/*` | ✅ Toàn quyền | ✅ CS phân công | 👁️ Xem SOP | 👁️ Xem SOP | 👁️ Xem SOP | 👁️ Xem SOP |
| **12** | **Kiểm Kê Kho Thực Tế** | `/inventory-audit` | `/api/v1/inventory-audits/*` | ✅ Toàn quyền | ✅ CS phân công | ✅ Duyệt/Đồng bộ| 👁️ Xem lịch sử | ✅ Tạo & Duyệt | ✅ Đếm & Gửi |
| **13** | **Nhà Cung Cấp & Nguồn Hàng** | `/materials` (tab NCC)| `/api/v1/suppliers/*` | ✅ Toàn quyền | ✅ Toàn quyền | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** |
| **14** | **Thu Mua PO & Yêu Cầu PR** | `/procurement` | `/api/v1/purchase-*` | ✅ Duyệt/Gộp PO | ✅ Duyệt/Gộp PO | ✅ Lập PR quán | ❌ Bị ẩn | ✅ Lập PR kho | ❌ Bị ẩn |
| **15** | **Bảng Lương Tháng** | `/salary` | `/api/v1/salary/*` | ✅ Toàn chuỗi | ✅ CS phân công | ✅ Đúng 1 CS | ❌ **Ẩn hoàn toàn** | ❌ **Ẩn hoàn toàn** | ❌ **Ẩn hoàn toàn** |
| **16** | **Quản Lý Nhân Sự & Phân Cấp**| `/staff` | `/api/v1/users/*` | ✅ Toàn quyền | ✅ CS phân công | ⚠️ Cấp dưới CS | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** |
| **17** | **Cấu Hình Check-in & GPS** | `/checkin-config` | `/api/v1/store-configs/*` | ✅ Toàn quyền | ✅ CS phân công | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** |
| **18** | **Quản Lý Chuỗi Cơ Sở** | `/stores` | `/api/v1/stores/*` | ✅ **Độc quyền** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** |
| **19** | **Trung Tâm Điều Hành Zalo Bot**| `/zalo` | `/api/v1/zalo/*` | ✅ **Độc quyền** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** | ❌ **Bị ẩn & chặn** |
| **20** | **Trung Tâm Thông Báo (6 DB)** | Modal / Header | `/api/v1/notifications/*`| ✅ Admin DB | ✅ Quản lý DB | ✅ Trưởng ca DB | ✅ Phó ca lịch DB | ✅ Phó ca VT DB | ✅ Nhân viên DB |

---

# PHẦN 2: ĐẶC TẢ CHI TIẾT CHỨC NĂNG THEO TỪNG VAI TRÒ

---

## 2.1 VAI TRÒ 1: ADMIN HỆ THỐNG (`admin_he_thong`)
* **Vị thế:** Quản trị viên tối cao (Super Admin).
* **Phạm vi cơ sở (Store Scope):** Toàn bộ tất cả chi nhánh trong chuỗi hệ thống (sử dụng **Store Switcher** chuyển đổi tức thời).

---

### 1. Phân Hệ Quản Trị Chuỗi Chi Nhánh / Cơ Sở (`/stores`) — [ĐỘC QUYỀN ADMIN]
* **Mô tả:** Khởi tạo, giám sát và cấu hình tọa độ cho toàn bộ chuỗi cửa hàng Zone Six.
* **👁️ Xem (Read):**
  - Xem Dashboard thống kê: Tổng số chi nhánh, chi nhánh đang hoạt động, chi nhánh tạm đóng cửa.
  - Xem danh sách thẻ chi nhánh (Store Cards): Tên quán, Mã cơ sở (`store_code`), Hotline, Địa chỉ thực tế, Tọa độ GPS (`latitude`, `longitude`).
* **➕ Tạo mới (Create):**
  - Mở `CreateStoreModal`: Nhập Mã chi nhánh, Tên chi nhánh, Số điện thoại.
  - Tích hợp Reverse-Geocoding đa tầng: Lấy tọa độ GPS tự động từ thiết bị hoặc gõ tọa độ để tự động giải mã ra tên đường/phường/quận.
* **✏️ Cập nhật (Update):**
  - Mở `EditStoreModal`: Chỉnh sửa tên cơ sở, số điện thoại, điều chỉnh vị trí GPS.
  - Tạm đóng cửa / Mở cửa lại chi nhánh tức thời qua `CloseStoreConfirmModal`.
* **🗑️ Xóa (Delete):**
  - Xóa vĩnh viễn chi nhánh qua `DeleteStoreConfirmModal`. Ràng buộc: Chỉ xóa được khi chi nhánh không có dữ liệu nhân sự và lịch sử đơn hàng.
* **🔍 Lọc / Tìm kiếm (Filter/Search):**
  - Tìm kiếm thời gian thực theo Tên chi nhánh, Mã chi nhánh, Lọc theo trạng thái Hoạt động / Đóng cửa.

---

### 2. Phân Hệ Trung Tâm Điều Hành Zalo Automation Bot (`/zalo`) — [ĐỘC QUYỀN ADMIN]
* **Mô tả:** Kết nối tài khoản Zalo cá nhân của quán qua thư viện `zca-js`, thiết lập định tuyến tin nhắn tự động theo từng cơ sở.
* **👁️ Xem (Read):**
  - Trạng thái phiên bot (Đang chạy / Chưa đăng nhập), thông tin tài khoản Zalo điều hành.
  - Danh sách nhóm Zalo thực tế trong danh bạ bot đã quét được.
  - Cấu hình 4 kênh nghiệp vụ của từng chi nhánh: `CHECKIN` (Điểm danh), `MATERIAL` (Kho vật liệu), `SCHEDULE` (Lịch tuần), `GENERAL` (Tin chung).
* **➕ Tạo mới / Kết nối (Create):**
  - Bấm `Quét Mã QR Đăng Nhập` để sinh mã QR đăng nhập Zalo cá nhân.
* **✏️ Cập nhật (Update):**
  - Gán Group ID nhận tin cho 4 kênh nghiệp vụ của từng chi nhánh.
  - Tùy chỉnh mẫu tin nhắn tự động (Template) có biến nội suy `{ten_nhan_vien}`, `{ca_lam}`, `{thoi_gian}`.
  - Bật/tắt trạng thái tự động gửi tin cho từng nghiệp vụ.
* **⚡ Nghiệp vụ đặc thù:**
  - Nút `Bắn Tin Thử Nghiệm`: Gửi tin nhắn mẫu kèm ảnh thử nghiệm vào nhóm Zalo thực tế để kiểm tra kết nối.
  - Nút `Sao chép tên nhóm quy chuẩn`: `[Z6 - {Mã CS}] {Icon} {TÊN NGHIỆP VỤ}`.

---

### 3. Phân Hệ Quản Lý Sơ Đồ Bàn & QR Code Standee Mica (`/tables`)
* **Mô tả:** Phân chia sơ đồ mặt bằng các tầng/khu vực và phát hành mã QR Standee mica cho khách tự gọi món.
* **👁️ Xem (Read):**
  - Cột Trái: Danh sách các Tầng/Khu vực kèm số lượng bàn của từng tầng.
  - Cột Phải:
    - Khi chọn `Tất Cả Tầng`: Nhóm bàn theo từng tầng (Khối Tầng 1, Khối Tầng 2...), có Header tầng và lưới bàn tương ứng.
    - Khi chọn tầng cụ thể: Chỉ hiển thị bàn của tầng đó.
  - Thẻ bàn tinh gọn: Tên bàn (`Bàn 01`), số chỗ ngồi (`4 chỗ`), màu nền và viền thể hiện trạng thái: 🟢 Trống, 🟠 Có Khách, 🔵 Đã Đặt, 🔴 Bảo Trì.
* **➕ Tạo mới (Create):**
  - Tạo tầng mới: Nút `+ Thêm Tầng` ở cột trái (nhập tên tầng: Tầng 3, VIP, Sân Thượng...).
  - Tạo bàn mới: Nút `+ Thêm Bàn` (nhập số bàn, chọn tầng, số lượng ghế ngồi).
* **✏️ Cập nhật (Update):**
  - Bấm vào thẻ bàn mở `TableDetailModal`: Chuyển nhanh trạng thái 1-chạm (Trống $\rightarrow$ Có Khách $\rightarrow$ Đã Đặt $\rightarrow$ Bảo Trì).
  - Mở `TableFormModal`: Đổi tên bàn, đổi tầng trực thuộc, đổi sức chứa.
* **🗑️ Xóa (Delete):**
  - Xóa tầng: Chỉ xóa được khi tầng không có bàn nào.
  - Xóa bàn: Xóa bàn kèm hộp thoại xác nhận an toàn.
* **⚡ Nghiệp vụ đặc thù:**
  - Mở `TableQrPrintModal`: Xem trước Standee mica chuẩn khổ A5/A6, in trực tiếp hoặc tải ảnh PNG độ nét cao.
  - Sao chép liên kết gọi món tại bàn (`/order?token=...`).

---

### 4. Phân Hệ Nhà Cung Cấp & Nguồn Hàng (`/materials` $\rightarrow$ Tab Nhà Cung Cấp) — [ĐỘC QUYỀN ADMIN & QUẢN LÝ]
* **Mô tả:** Quản lý danh bạ đối tác cung ứng bao bì, hạt cà phê, sữa, siro và giá nhập cho toàn chuỗi.
* **👁️ Xem (Read):** Danh sách NCC, Hotline, Địa chỉ, Danh mục mặt hàng cung ứng và đơn giá nhập thỏa thuận.
* **➕ Tạo mới (Create):** Thêm Nhà Cung Cấp mới qua `CreateSupplierModal`, gán danh mục vật liệu cung cấp.
* **✏️ Cập nhật (Update):** Sửa thông tin NCC, điều chỉnh đơn giá nhập qua `EditSupplierModal`.
* **🗑️ Xóa (Delete):** Xóa nhà cung cấp khi ngừng hợp tác.
* **🔍 Lọc / Tìm kiếm (Filter/Search):** Tìm kiếm theo tên NCC, số điện thoại, tên nguyên vật liệu cung ứng.

---

### 5. Phân Hệ Trung Tâm Thu Mua PO Đa Cơ Sở (`/procurement`)
* **Mô tả:** Tổng hợp các phiếu yêu cầu (PR) từ các quán thành đơn hàng mua lớn (PO) để đàm phán giá sỉ.
* **👁️ Xem (Read):** Danh sách các phiếu PR từ mọi chi nhánh, Dashboard đơn thu mua PO, cảnh báo tồn kho toàn chuỗi.
* **➕ Tạo mới / Gộp đơn (Create):** Kích hoạt Wizard gộp đơn `PoAggregationModal`: Gom nhiều yêu cầu PR cùng NCC thành 1 đơn PO lớn; Chọn giao về Kho Tổng hoặc giao thẳng từng chi nhánh.
* **✏️ Cập nhật / Phê duyệt (Update):** Phê duyệt đơn PO, phát hành đơn gửi NCC, xác nhận nhập hàng thực tế vào kho (`apply_to_stock`).
* **🗑️ Xóa (Delete):** Hủy đơn PO khi NCC báo hết hàng.

---

### 6. Phân Hệ Quản Lý Nhân Sự & Phân Cấp (`/staff`)
* **Mô tả:** Quản lý thông tin, mức lương và điều chuyển nhân sự toàn hệ thống.
* **👁️ Xem (Read):**
  - Danh sách toàn bộ nhân sự chuỗi: Họ tên, SĐT, Mức lương/h, Vai trò, Chi nhánh công tác.
  - **Quy tắc bảo mật bắt buộc:** Tự động ẩn chính tài khoản của mình và ẩn các tài khoản đồng cấp (`admin_he_thong` khác).
* **➕ Tạo mới (Create):**
  - Thêm tài khoản nhân sự từ Quản lý trở xuống (`CreateStaffModal`).
  - Hệ thống tự sinh mật khẩu ngẫu nhiên bảo mật, tự động gửi qua Gmail SMTP thật và hiển thị Pop-up sao chép mật khẩu.
* **✏️ Cập nhật (Update):**
  - Sửa mức lương giờ, sửa chức vụ, điều chuyển cơ sở làm việc (`EditStaffModal`). Không thể gán quyền Admin cho người khác.
* **🔍 Lọc / Tìm kiếm (Filter/Search):** Lọc theo chi nhánh (Store Switcher), lọc theo chức vụ, tìm kiếm theo Tên hoặc Số điện thoại.

---

### 7. Phân Hệ Bảng Lương Tháng (`/salary`)
* **Mô tả:** Tra cứu và quyết toán công lương toàn hệ thống.
* **👁️ Xem (Read):** Bảng tổng hợp công lương nhân sự toàn chuỗi theo tháng: Họ tên, Vị trí, Tổng giờ làm việc, Lương theo giờ, Tổng thực nhận. (Bảo mật: Ẩn tuyệt đối mật khẩu và mã QR cá nhân).
* **🔍 Lọc (Filter):** Lọc theo tháng/năm, lọc theo từng chi nhánh bằng Store Switcher.

---

### 8. Phân Hệ Cấu Hình Check-in & Định Vị Quán (`/checkin-config`)
* **Mô tả:** Thiết lập hàng rào địa lý GPS Geofence và chế độ vận hành gọi món.
* **👁️ Xem & ✏️ Cập nhật (Read/Update):**
  - Nhập tọa độ GPS tâm quán (Lat/Lng) hoặc bấm nút `Lấy GPS Hiện Tại` của thiết bị.
  - Kéo thanh trượt bán kính Geofence cho phép điểm danh (30m, 50m, 100m, 200m...).
  - Thiết lập khung giờ cho phép check-in trước/sau ca.
  - Cấu hình chế độ gọi món bàn: `Chỉ Nhân Viên Gọi Món` / `Khách Tự Quét QR Đặt Món` / `Chế Độ Lai (Hybrid)`.

---

## 2.2 VAI TRÒ 2: QUẢN LÝ CỬA HÀNG / CHUỖI (`quan_ly`)
* **Vị thế:** Điều hành kinh doanh tại 1 hoặc nhiều chi nhánh được phân công (`assigned_stores`).
* **Phạm vi cơ sở (Store Scope):** Có bộ chuyển đổi cơ sở (**Store Switcher**) để chọn chuyển đổi giữa các quán mình phụ trách.

---

### 1. Phân Hệ Xếp Lịch Tuần & AutoScheduler (`/schedule`)
* **👁️ Xem (Read):** Xem ma trận lịch làm việc 7 ngày của các cơ sở được phân công.
* **➕ Tạo / Mở đợt đăng ký (Create):**
  - Mở/Khóa cổng đăng ký ca tuần cho nhân viên cơ sở.
  - Kích hoạt thuật toán tự động xếp lịch `AutoSchedulerEngine` cho quán mình phụ trách.
* **✏️ Cập nhật (Update):**
  - Kéo thả / click đổi nhân viên trong từng ô ca làm việc.
  - **Toàn quyền tích điểm danh trực tiếp trên ô ca** để chấm công cho nhân sự tại cơ sở được phân công.
* **⚡ Nghiệp vụ đặc thù:** Xuất file Excel bảng lịch tuần chuẩn Zone Six trình ban giám đốc.

---

### 2. Phân Hệ Cấu Hình Ca Làm Việc & Định Biên (`/shifts`)
* **👁️ Xem (Read):** Danh sách các ca làm việc của cơ sở phụ trách (Ca Sáng, Chiều, Tối, Khuya), số giờ công và định biên nhân sự.
* **➕ Tạo mới (Create):** Thêm khung ca làm việc mới cho quán.
* **✏️ Cập nhật (Update):**
  - Chỉnh sửa giờ bắt đầu / kết thúc ca, định biên số lượng Barista tối thiểu, Phục vụ tối thiểu.
  - Đổi màu nhận diện ca, bật/tắt ca, khôi phục 4 ca mặc định chuẩn.
* **🗑️ Xóa (Delete):** Xóa ca làm việc không còn sử dụng.

---

### 3. Phân Hệ Duyệt Yêu Cầu Nhập Kho & Đơn Thu Mua PO (`/procurement` & `/materials`)
* **👁️ Xem (Read):** Toàn bộ phiếu PR do Phó ca vật liệu và Trưởng ca gửi lên từ các quán mình quản lý.
* **✏️ Phê duyệt / Cập nhật (Update):**
  - Duyệt chấp thuận hoặc từ chối phiếu PR kèm ghi chú.
  - Gom các phiếu PR thành đơn PO gửi Nhà cung cấp; Xác nhận nhập hàng thực tế vào kho chi nhánh.

---

### 4. Phân Hệ Quản Lý Nhân Sự Cơ Sở (`/staff`)
* **👁️ Xem (Read):** Danh sách nhân viên và trưởng ca trực thuộc các cơ sở mình quản lý. (Ẩn Admin và Quản lý khác).
* **➕ Tạo mới (Create):** Tạo tài khoản Trưởng ca, Phó ca, Nhân viên cho các cơ sở mình phụ trách.
* **✏️ Cập nhật (Update):** Sửa mức lương giờ, đổi vai trò (chỉ được phân quyền tối đa đến cấp Trưởng ca).

---

### 5. Phân Hệ Bảng Lương Tháng Cơ Sở (`/salary`)
* **👁️ Xem (Read):** Xem bảng tính lương của toàn bộ nhân viên thuộc các cơ sở mình phụ trách theo từng tháng.
* **🔍 Lọc (Filter):** Lọc theo tháng và lọc giữa các chi nhánh được phân công.

---

### 6. Các Phân Hệ Khác Của Quản Lý:
* **POS Bán Hàng (`/pos`):** Chế độ giám sát bán hàng trực tiếp của ca trực.
* **Sơ Đồ Bàn (`/tables`):** Toàn quyền quản lý tầng, bàn, đổi trạng thái bàn và in QR Standee của các cơ sở được giao.
* **Quản Lý Hóa Đơn (`/orders`):** Xem lịch sử hóa đơn, in lại bill K80, duyệt hủy bill (Void Order).
* **Bị Chặn / Ẩn Hoàn Toàn:** ❌ Quản Lý Chi Nhánh (`/stores`) và ❌ Zalo Bot (`/zalo`).

---

## 2.3 VAI TRÒ 3: TRƯỞNG CA VẬN HÀNH CƠ SỞ (`truong_ca`)
* **Vị thế:** Chỉ huy vận hành trực tiếp tại cửa hàng.
* **Phạm vi cơ sở (Store Scope):** **RÀNG BUỘC CỨNG TẠI ĐÚNG 1 CƠ SỞ CỐ ĐỊNH** (`assigned_store_id`). Không có Store Switcher, không quản lý chéo sang cơ sở khác.

---

### 1. Phân Hệ Xếp Lịch & Điểm Danh Ca Trực (`/schedule`) — [TRỌNG TÂM]
* **👁️ Xem (Read):** Xem bảng lịch tuần của **đúng 1 cơ sở mình làm việc**.
* **➕ Kích hoạt / Mở cổng (Create):** Mở/khóa cổng đăng ký ca tuần; Kích hoạt AutoScheduler chạy xếp lịch ca cho quán.
* **✏️ Cập nhật & Điểm danh (Update):**
  - Đổi ca, gán nhân sự trực tiếp trên bảng lịch.
  - **Toàn quyền tích trực tiếp vào ô ca (Check-in Checkbox)** để xác nhận có mặt cho nhân sự trong ca trực.
* **⚡ Nghiệp vụ đặc thù:** Tải file Excel lịch tuần cơ sở.

---

### 2. Phân Hệ Cấu Hình Khung Giờ Ca Làm (`/shifts`)
* **👁️ Xem (Read):** Xem khung giờ các ca và định biên nhân sự của cơ sở mình.
* **✏️ Cập nhật (Update):** Điều chỉnh định biên số người tối thiểu cho từng ca của quán.

---

### 3. Phân Hệ Quản Lý Nhân Sự Cấp Dưới Tại Quán (`/staff`)
* **👁️ Xem (Read):** Chỉ xem danh sách nhân sự cấp dưới (**Phó ca làm lịch, Phó ca vật liệu, Nhân viên**) trong đúng cơ sở của mình.
* **➕ Tạo mới (Create):** Thêm tài khoản nhân viên mới cho quán.
* **✏️ Cập nhật (Update):** Sửa thông tin và mức lương giờ cho nhân sự cấp dưới trong quán. (Không sửa được tài khoản Quản lý/Admin).

---

### 4. Phân Hệ Bảng Lương Tháng Tại Quán (`/salary`)
* **👁️ Xem (Read):** Xem bảng tính lương của nhân sự tại **đúng cơ sở mình phụ trách** để giải đáp công lương cho nhân viên. Không xem được lương cơ sở khác.

---

### 5. Phân Hệ Bán Hàng POS & Hóa Đơn (`/pos`, `/orders`, `/tables`)
* **POS Bán Hàng (`/pos`):** Mở ca bán hàng, tạo order, áp dụng topping, thanh toán VietQR, chốt ca cuối ngày.
* **Sơ Đồ Bàn (`/tables`):** Thêm bàn, đổi trạng thái bàn, in mã Standee mica của quán.
* **Hóa Đơn (`/orders`):** Tra cứu bill, in lại hóa đơn K80, thực hiện hủy bill sai sót có nhập lý do bắt buộc.

---

### 6. Phân Hệ Kiểm Kê & Đề Xuất Vật Tư (`/inventory-audit`, `/materials`)
* **Kiểm kê kho:** Xem số liệu đếm kho thực tế của nhân viên, thực hiện **chỉnh sửa và đồng bộ tồn kho thực tế** (`apply_to_stock`).
* **Yêu cầu vật tư:** Lập phiếu yêu cầu nhập hàng (PR) gửi Quản lý duyệt.

---

## 2.4 VAI TRÒ 4: PHÓ CA LÀM LỊCH (`pho_ca_lam_lich`)
* **Vị thế:** Trợ lý chuyên trách xếp lịch làm việc cho 1 cơ sở cố định.
* **Phạm vi cơ sở (Store Scope):** Cố định tại 1 chi nhánh được phân công.
* **Nguyên tắc phân ly trách nhiệm cốt lõi:** **TUYỆT ĐỐI KHÔNG ĐƯỢC TÍCH ĐIỂM DANH VÀ ẨN HOÀN TOÀN BẢNG LƯƠNG.**

---

### 1. Phân Hệ Xếp Lịch Tuần Cơ Sở (`/schedule`) — [CHUYÊN TRÁCH]
* **👁️ Xem (Read):** Xem ma trận lịch tuần 7 ngày của cơ sở mình.
* **➕ Tạo mới / Mở cổng (Create):**
  - Mở cổng cho nhân viên đăng ký nguyện vọng tuần mới; Hẹn giờ tự động khóa cổng.
  - Kích hoạt thuật toán tự động xếp ca `AutoSchedulerEngine` (đáp ứng định biên Barista + Service, công bằng giờ làm).
* **✏️ Cập nhật (Update):** Nhấp vào từng ô ca để xếp nhân viên, thay đổi người làm, thêm ca gãy.
* **⚡ Xuất bản (Export):** Xuất file Excel bảng lịch làm việc hoàn chỉnh.
* **🚫 Rào cản bắt buộc:** ❌ **DẤU TÍCH ĐIỂM DANH TRÊN Ô CA BỊ ẨN HOÀN TOÀN.** Không thể tự xác nhận ca làm việc để ngăn chặn rủi ro tự chấm công gian lận.

---

### 2. Phân Hệ Cấu Hình Ca Làm Việc & Định Biên (`/shifts`)
* **👁️ Xem & ✏️ Cập nhật (Read/Update):** Cấu hình giờ bắt đầu, kết thúc, số lượng nhân viên tối thiểu cho từng ca của quán.

---

### 3. Hoạt Động Trực Ca & Cá Nhân:
* **Đăng ký ca (`/schedule/register`):** Gửi nguyện vọng ca trực của chính mình.
* **Điểm danh (`/checkin`):** Tự chụp ảnh Camera kèm Watermark GPS khi vào ca trực.
* **Bán hàng POS (`/pos`):** Tham gia bán hàng khi được phân công vào ca.
* **Sơ đồ bàn (`/tables`):** Xem bàn, đổi trạng thái bàn, in mã Standee mica.
* **Sổ tay món (`/recipes`):** Xem quy trình công thức pha chế (SOP).
* **Hồ sơ cá nhân (`/profile`):** Xem thẻ nhân viên số 3D, đổi mật khẩu.
* **🚫 Bị Ẩn & Chặn Hoàn Toàn:** ❌ Bảng Lương (`/salary`), ❌ Nhân Sự (`/staff`), ❌ GPS (`/checkin-config`), ❌ Chi Nhánh (`/stores`), ❌ Zalo Bot (`/zalo`).

---

## 2.5 VAI TRÒ 5: PHÓ CA VẬT LIỆU (`pho_ca_vat_lieu`)
* **Vị thế:** Trợ lý chuyên trách kho nguyên vật liệu, kiểm kê và đề xuất nhập hàng cho 1 cơ sở cố định.
* **Phạm vi cơ sở (Store Scope):** Cố định tại 1 chi nhánh được phân công.

---

### 1. Phân Hệ Quản Lý Kho & Vật Liệu Cơ Sở (`/materials`) — [CHUYÊN TRÁCH]
* **👁️ Xem (Read):**
  - Xem danh mục bao bì (ly, nắp, túi), nguyên liệu (trà, cà phê, sữa), topping; Xem tồn kho thực tế; Xem cảnh báo tồn kho tối thiểu.
* **➕ Tạo mới (Create):** Thêm vật tư mới vào kho cơ sở, chọn phân loại (Bao Bì, Nguyên Liệu, Topping) và phạm vi sử dụng.
* **✏️ Cập nhật (Update):** Xuất/nhập kho nhanh (nút +/- tồn kho); Cập nhật giá vốn COGS, quy cách đóng gói, dung tích ly.
* **🗑️ Xóa (Delete):** Xóa vật tư khi quán không còn sử dụng.
* **🔍 Lọc (Filter):** Lọc theo nhóm vật liệu, lọc các mặt hàng chạm ngưỡng an toàn.

---

### 2. Phân Hệ Yêu Cầu Nhập Kho Chi Nhánh (PR) (`/materials` $\rightarrow$ Tab Yêu Cầu Nhập Kho)
* **👁️ Xem (Read):** Danh sách các phiếu đề xuất nhập hàng của cơ sở và trạng thái phê duyệt.
* **➕ Tạo mới (Create):** Bấm `+ Lập Phiếu Yêu Cầu`, chọn nguyên liệu và số lượng cần nhập; Sử dụng nút **"⚡ Nạp Hàng Chạm Ngưỡng An Toàn"** để tự động điền các vật tư sắp hết.
* **✏️ Cập nhật / Hủy (Update/Delete):** Chỉnh sửa số lượng hoặc hủy phiếu khi Quản lý chưa duyệt.

---

### 3. Phân Hệ Kiểm Kê Kho Thực Tế Chi Nhánh (`/inventory-audit`)
* **👁️ Xem (Read):** Lịch trình kiểm kho, nhật ký người kiểm theo ngày, danh sách phiếu kiểm đếm của quán.
* **➕ Tạo phiếu kiểm (Create):** Thực hiện kiểm đếm kho, hỗ trợ chế độ **Đếm lẻ** và **Đếm nhiều Thùng/Lốc/Bao** (+10, +50, +100).
* **✏️ Cập nhật & Đồng bộ (Update):** Kiểm tra đối chiếu số liệu đếm thực tế và bấm **"Đồng bộ vào Tồn Kho Thực Tế"** (`apply_to_stock`).

---

### 4. Hoạt Động Trực Ca & Cá Nhân:
* **POS Bán Hàng (`/pos`):** Thực hiện bán hàng trong ca trực.
* **Sơ Đồ Bàn (`/tables`):** Xem bàn và cập nhật trạng thái bàn.
* **Lịch Tuần (`/schedule`):** Chế độ **Chỉ xem (Read-only)**; Ẩn hoàn toàn dấu tích điểm danh.
* **Đăng ký ca (`/schedule/register`):** Đăng ký ca làm việc cá nhân.
* **Điểm danh (`/checkin`):** Tự chụp ảnh Camera + GPS khi vào ca.
* **🚫 Bị Ẩn & Chặn Hoàn Toàn:** ❌ Cấu hình ca (`/shifts`), ❌ Bảng Lương (`/salary`), ❌ Nhân Sự (`/staff`), ❌ GPS (`/checkin-config`), ❌ Chi Nhánh (`/stores`), ❌ Zalo Bot (`/zalo`).

---

## 2.6 VAI TRÒ 6: NHÂN VIÊN (`nhan_vien`)
* **Vị thế:** Lực lượng phục vụ trực tiếp tại 1 chi nhánh biên chế (Pha chế Barista, Phục vụ Service, Thu ngân).
* **Phạm vi cơ sở (Store Scope):** Cố định tại 1 chi nhánh duy nhất, không có Store Switcher.

---

### 1. Phân Hệ Đăng Ký Nguyện Vọng Ca Tuần (`/schedule/register`)
* **👁️ Xem (Read):** Xem biểu mẫu đăng ký các ngày trong tuần (Thứ 2 $\rightarrow$ Chủ Nhật).
* **➕ Thao tác (Create):** Chọn các ca mong muốn làm việc trong tuần và bấm gửi phiếu đăng ký khi cổng đang mở.

---

### 2. Phân Hệ Xem Lịch Làm Việc Tuần (`/schedule`)
* **👁️ Xem (Read):** Xem bảng lịch ca chính thức của quán để biết giờ làm, vị trí phụ trách (Barista/Service) và đồng đội cùng ca.
* **🚫 Ràng buộc:** **Chỉ xem (Read-only)**; Ẩn nút Auto Xếp Lịch; Ẩn nút xuất Excel; **Ẩn hoàn toàn dấu tích điểm danh** (không thể tự chấm công cho bản thân).

---

### 3. Phân Hệ Điểm Danh Camera Thực Tế & Định Vị GPS (`/checkin`)
* **👁️ Xem (Read):** Thông tin ca trực hiện tại, khoảng cách GPS tính đến cơ sở làm việc.
* **⚡ Thao tác điểm danh (Action):**
  - Mở Camera chụp ảnh selfie thực tế trực tiếp từ thiết bị (chặn chọn ảnh từ thư viện máy).
  - Đóng dấu chìm vĩnh viễn (Canvas Watermark): Tọa độ GPS, Khoảng cách mét tới quán, Địa chỉ thực tế, Mốc thời gian chính xác đến từng giây.
  - Ràng buộc: Bắt buộc vị trí thiết bị nằm trong bán kính Geofence của quán (50m) và trong khung giờ cho phép của ca trực.

---

### 4. Phân Hệ Bán Hàng POS Live Order Tại Quầy (`/pos`)
* **Điều kiện mở:** Bắt buộc đã điểm danh hợp lệ vào ca trực tại cơ sở (`Shift Gatekeeper`).
* **⚡ Thao tác bán hàng (Action):**
  - Chọn món theo danh mục, chọn Size (M/L), độ Đường / Đá, thêm Topping bán kèm.
  - Bấm thanh toán tạo mã VietQR động theo đơn hàng để khách chuyển khoản.
  - In hóa đơn tạm tính và bill thanh toán K80.
  - Chuyển trạng thái đơn sang Pha chế hoặc Hoàn tất.

---

### 5. Phân Hệ Sơ Đồ Bàn & QR Code Gọi Món (`/tables`)
* **👁️ Xem (Read):** Xem danh sách bàn được nhóm theo từng tầng (Tầng 1, Tầng 2...), nhận diện trạng thái bàn qua màu nền và viền thẻ bàn.
* **✏️ Cập nhật trạng thái (Update):** Bấm vào bàn mở `TableDetailModal`, chuyển nhanh trạng thái bàn phục vụ khách: 🟢 Trống $\rightarrow$ 🟠 Có Khách $\rightarrow$ 🔵 Đã Đặt $\rightarrow$ 🔴 Bảo Trì.
* **⚡ Xem mã QR:** Mở xem trước mã QR Standee mica của bàn cho khách quét tự đặt món.
* **🚫 Ràng buộc:** Không có quyền tạo/xóa bàn hoặc tạo/xóa tầng.

---

### 6. Phân Hệ Sổ Tay Công Thức Pha Chế Bí Mật (SOP) (`/recipes`)
* **👁️ Xem (Read):** Tra cứu tỷ lệ định lượng BOM (ml/gram), quy trình các bước thao tác Barista và mẹo pha chế đồ uống chuẩn Zone Six.
* **🚫 Ràng buộc:** Chỉ xem học công thức, không có quyền tạo/sửa/xóa món.

---

### 7. Phân Hệ Thực Hiện Kiểm Kê Đếm Kho (`/inventory-audit`)
* **➕ Thao tác (Create):** Thực hiện kiểm đếm kho theo ca được giao, nhập số lượng đếm thực tế (hỗ trợ đếm lẻ và đếm theo thùng/lốc) và bấm gửi phiếu kiểm kho lên cho cấp trên phê duyệt.

---

### 8. Phân Hệ Hồ Sơ Cá Nhân & Thẻ Số 3D (`/profile`)
* **👁️ Xem (Read):** Xem Thẻ nhân viên kỹ thuật số 3D Obsidian Gold hiển thị họ tên, cơ sở biên chế, mức lương/h, chức danh và mã QR định danh.
* **✏️ Cập nhật (Update):** Cập nhật số điện thoại cá nhân và đổi mật khẩu tài khoản.

---

### 9. 🚫 Danh Sách Các Chức Năng Bị Ẩn & Chặn Hoàn Toàn Đối Với Cấp Nhân Viên:
1. ❌ **Cấu Hình Ca Làm Việc & Định Biên (`/shifts`):** Ẩn menu Sidebar, chặn trực tiếp URL bằng màn hình Access Denied.
2. ❌ **Bảng Lương Tháng (`/salary`):** Ẩn menu Sidebar, chặn API backend mã lỗi 403 Forbidden.
3. ❌ **Quản Lý Nhân Sự (`/staff`):** Ẩn menu Sidebar, chặn URL & API.
4. ❌ **Cấu Hình Check-in GPS Quán (`/checkin-config`):** Ẩn menu Sidebar, chặn URL & API.
5. ❌ **Quản Lý Chuỗi Cơ Sở (`/stores`):** Ẩn menu Sidebar, chặn URL & API.
6. ❌ **Trung Tâm Điều Hành Zalo Bot (`/zalo`):** Ẩn menu Sidebar, chặn URL & API.
7. ❌ **Bộ Chuyển Đổi Chi Nhánh (Store Switcher):** Khóa cứng vào 1 cơ sở biên chế, không thể xem cơ sở khác.

---

# PHẦN 3: BẢNG ĐỐI SOÁT QUYỀN THAO TÁC CRUD NHANH

| Phân Hệ Chức Năng | Xem (Read) | Tạo Mới (Create) | Cập Nhật (Update) | Xóa (Delete) | Lọc / Tìm Kiếm (Filter) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Quản lý Chi Nhánh** | Admin | Admin | Admin | Admin | Admin |
| **Zalo Bot cá nhân** | Admin | Admin | Admin | Admin | Admin |
| **Cấu hình GPS quán** | Admin, Quản lý | Admin, Quản lý | Admin, Quản lý | Admin | Admin, Quản lý |
| **Nhân sự & Phân cấp** | Admin, Quản lý, Trưởng ca | Admin, Quản lý, Trưởng ca | Admin, Quản lý, Trưởng ca | Admin, Quản lý | Admin, Quản lý, Trưởng ca |
| **Bảng lương tháng** | Admin, Quản lý, Trưởng ca | Hệ thống tự tính | Hệ thống tự tính | ❌ Không xóa | Admin, Quản lý, Trưởng ca |
| **Cấu hình ca làm việc**| Admin, QL, TC, Phó ca lịch | Admin, QL, TC, Phó ca lịch | Admin, QL, TC, Phó ca lịch | Admin, QL, TC, Phó ca lịch | Admin, QL, TC, Phó ca lịch |
| **Xếp lịch tuần** | Tất cả 6 vai trò | Admin, QL, TC, Phó ca lịch | Admin, QL, TC, Phó ca lịch | Admin, QL, TC, Phó ca lịch | Tất cả 6 vai trò |
| **Tích điểm danh ca** | Tất cả 6 vai trò | Admin, Quản lý, Trưởng ca | Admin, Quản lý, Trưởng ca | Admin, Quản lý, Trưởng ca | Tất cả 6 vai trò |
| **Đăng ký ca làm** | Tất cả 6 vai trò | Tất cả 6 vai trò | Tất cả 6 vai trò | Người tạo | Tất cả 6 vai trò |
| **Điểm danh Camera GPS**| Tất cả 6 vai trò | Tất cả 6 vai trò | ❌ Bất biến | ❌ Không xóa | Admin, QL, Trưởng ca |
| **Bán hàng POS Live** | Tất cả có ca trực | Nhân sự trong ca | Nhân sự trong ca | Trưởng ca, QL, Admin (Void) | Tất cả có ca trực |
| **Sơ đồ Bàn & Tầng** | Tất cả 6 vai trò | Admin, QL, Trưởng ca | Tất cả 6 vai trò (Trạng thái) | Admin, QL, Trưởng ca | Tất cả 6 vai trò |
| **Hóa đơn & Bill K80** | Tất cả 6 vai trò | Thu ngân, Nhân viên | Trưởng ca, QL, Admin (Hủy bill) | ❌ Không xóa vật lý | Tất cả 6 vai trò |
| **Kho & Vật liệu** | Tất cả 6 vai trò | Admin, QL, Phó ca vật liệu | Admin, QL, Phó ca vật liệu | Admin, QL, Phó ca vật liệu | Tất cả 6 vai trò |
| **Công thức món (BOM)**| Tất cả 6 vai trò | Admin, Quản lý | Admin, Quản lý | Admin, Quản lý | Tất cả 6 vai trò |
| **Kiểm kê kho thực tế**| Tất cả 6 vai trò | Tất cả 6 vai trò (Đếm kho) | Admin, QL, TC, Phó ca VL (Đồng bộ)| Admin, Quản lý | Tất cả 6 vai trò |
| **Nhà cung cấp** | Admin, Quản lý | Admin, Quản lý | Admin, Quản lý | Admin, Quản lý | Admin, Quản lý |
| **Thu mua PO & PR** | Admin, QL, TC, Phó ca VL | TC, Phó ca VL (PR) | Admin, Quản lý (Duyệt/Gộp PO)| Admin, Quản lý | Admin, QL, TC, Phó ca VL |

---

# PHẦN 4: CÁC NGUYÊN TẮC PHÂN LY TRÁCH NHIỆM & RÀO CẢN BẢO MẬT CỐT LÕI

1. **Nguyên Tắc Phân Ly Trách Nhiệm Điểm Danh (Separation of Duties):**
   - Người xếp lịch (`pho_ca_lam_lich`) tuyệt đối không đồng thời là người xác nhận chấm công. Dấu tích checkbox điểm danh trên bảng lịch tuần bị ẩn 100% đối với vai trò này nhằm triệt tiêu rủi ro gian lận giờ công.
2. **Nguyên Tắc Ràng Buộc Cứng 1 Cơ Sở (Strict 1-Store Policy):**
   - Trưởng Ca, Phó Ca và Nhân Viên bị khóa cứng vào 1 cơ sở biên chế duy nhất (`assigned_store_id`), tuyệt đối không có thanh chọn cơ sở (Store Switcher) và không thể xem hoặc can thiệp chéo sang dữ liệu của chi nhánh khác.
3. **Nguyên Tắc Bí Mật Bảng Lương:**
   - Quỹ lương và thu nhập nhân sự là bí mật kinh doanh nhạy cảm. Chỉ có **Admin**, **Quản Lý** và **Trưởng Ca** (tại cơ sở mình) mới có quyền truy cập. Các vai trò Phó Ca và Nhân Viên bị ẩn toàn bộ menu và chặn API Backend với mã lỗi `403 Forbidden`.
4. **Nguyên Tắc Phân Cấp Nhân Sự "Không Gán Đồng Cấp Hoặc Vượt Cấp":**
   - Tài khoản thực hiện tạo hoặc sửa nhân sự không thể gán chức vụ bằng hoặc cao hơn chức vụ hiện tại của mình.
   - Bảng nhân sự luôn tự động ẩn chính tài khoản đang đăng nhập và ẩn toàn bộ tài khoản đồng cấp nhằm bảo vệ tính tôn ti trật tự và an toàn thông tin quản trị.
5. **Nguyên Tắc Điểm Danh Chống Gian Lận (Anti-Spoofing Check-in):**
   - Bắt buộc chụp ảnh trực tiếp từ Camera thiết bị (loại bỏ chọn ảnh từ bộ sưu tập).
   - Đóng dấu chìm vĩnh viễn (Canvas Watermark) tọa độ GPS, khoảng cách mét tới quán, địa chỉ đường phố thực tế và thời gian thực chính xác đến từng giây.
   - Bắt buộc vị trí thiết bị nằm trong bán kính Geofence của đúng cơ sở có ca trực.

