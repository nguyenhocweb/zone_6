# 📚 BẢNG ĐẶC TẢ TOÀN BỘ CHỨC NĂNG HỆ THỐNG ZONE SIX SIGNATURE
### Kiến Trúc: Chuỗi Lounge & Cafe Đa Cơ Sở (Multi-Store Partitioning)
### Phân Quyền 7 Vai Trò: 6 Cấp Bậc Nhân Sự Nội Bộ & Khách Hàng (Vãng Lai Mua Nước)
### Tech Stack: Node.js (Express + TypeScript + Prisma/Mongoose) & Next.js 14+ (App Router + Socket.io + TailwindCSS)

---

## 🏛️ 1. MA TRẬN 7 VAI TRÒ TRONG HỆ THỐNG ZONE SIX

Hệ thống Zone Six phân định ranh giới nghiêm ngặt giữa **6 cấp bậc nhân sự nội bộ** và **Khách hàng vãng lai**:

| STT | Biểu Tượng | Tên Vai Trò | Mã Role Code | Phân Cấp | Phạm Vi Cơ Sở (Store Scope) | Mục Tiêu & Trách Nhiệm Chính |
| :---: | :---: | :--- | :--- | :---: | :--- | :--- |
| **1** | 👑 | **Admin Hệ Thống** | `admin_he_thong` | Level 1 (Tối cao) | Toàn chuỗi (Store Switcher) | Quản trị toàn hệ thống, tạo cơ sở mới, độc quyền cấu hình Zalo Bot, phân quyền nhân sự toàn chuỗi. |
| **2** | 👔 | **Quản Lý** | `quan_ly` | Level 2 (Cấp cao) | Các cơ sở được phân công (`assigned_stores`) | Điều hành nhiều chi nhánh, duyệt & gộp đơn thu mua PO, quản lý nhân sự, xem bảng lương toàn bộ cơ sở phụ trách. |
| **3** | 🎖️ | **Trưởng Ca** | `truong_ca` | Level 3 (Giám sát) | **ĐÚNG 1 CƠ SỞ DUY NHẤT** (`assigned_store_id`) | Điều hành ca trực tại quán, duyệt chấm công, tích điểm danh, kiểm kho, xem lương cơ sở mình (CẤM quản lý chéo). |
| **4** | 📋 | **Phó Ca Làm Lịch** | `pho_ca_lam_lich` | Level 4 (Nghiệp vụ) | Cố định 1 cơ sở biên chế | Auto xếp lịch tuần, cấu hình ca trực; **Ẩn tuyệt đối dấu tích điểm danh và ẩn hoàn toàn bảng lương**. |
| **5** | 📦 | **Phó Ca Vật Liệu** | `pho_ca_vat_lieu` | Level 4 (Nghiệp vụ) | Cố định 1 cơ sở biên chế | Quản lý kho, định mức nguyên liệu, lập đề xuất nhập hàng (PR), kiểm kê tồn kho; **Ẩn hoàn toàn bảng lương**. |
| **6** | ☕ | **Nhân Viên** | `nhan_vien` | Level 5 (Thực thi) | Cố định 1 cơ sở biên chế | Đăng ký ca tuần, điểm danh Camera GPS, xem công thức pha chế SOP, bán hàng POS Live Order trong ca trực. |
| **7** | 🥤 | **Khách Hàng (Vãng Lai)** | `khach_hang` / `guest` | Khách ngoại vi (Public) | Cơ sở đang ngồi uống nước | Khách vãng lai đến quán mua nước: xem Menu giá niêm yết, gọi món, quét **VietQR động** thanh toán và nhận hóa đơn. |

---

## 📊 2. BẢNG MA TRẬN PHÂN QUYỀN TOÀN BỘ CHỨC NĂNG (7 VAI TRÒ)

> **Quy ước ký hiệu phân quyền:**
> * `✅ Toàn Quyền`: Được phép Tạo, Đọc, Cập nhật, Xóa, Cấu hình (Full Control / CRUD).
> * `✍️ Thao Tác`: Được phép thao tác nghiệp vụ trong phạm vi ca trực / phân công.
> * `👁️ Chỉ Xem`: Được phép xem thông tin công khai nội bộ, không có quyền chỉnh sửa.
> * `🥤 Mua Nước`: Điểm chạm tương tác của Khách Hàng (Xem Menu, Gọi món, Quét VietQR, Nhận hóa đơn).
> * `❌ Bị Chặn`: Ẩn hoàn toàn trên giao diện và chặn triệt để tại Middleware Backend (Access Denied / 403 Forbidden).

| Mã CN | Tên Chức Năng | Route URL | Admin (`admin`) | Quản Lý (`quan_ly`) | Trưởng Ca (`truong_ca`) | Phó Ca Lịch (`pho_ca_lich`) | Phó Ca Kho (`pho_ca_kho`) | Nhân Viên (`nhan_vien`) | Khách Hàng (Vãng Lai Mua Nước) | Phạm Vi Cơ Sở (Store Scoping) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **CN01** | **Xác Thực, Hồ Sơ & Thẻ Nhân Viên Số** | `/login`<br>`/profile` | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Quản lý thẻ | ✍️ Thẻ cá nhân | ✍️ Thẻ cá nhân | ✍️ Thẻ cá nhân | ❌ Bị chặn (Không có tài khoản nội bộ) | Theo tài khoản cá nhân & cơ sở biên chế |
| **CN02** | **Quản Lý Nhân Sự & Phân Cấp Đa Cơ Sở** | `/staff` | ✅ Toàn chuỗi | ✅ CS phụ trách | ✍️ Cấp dưới tại 1 CS | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn (Bảo mật nhân sự) | Phân cấp: Không gán đồng cấp hoặc lớn hơn |
| **CN03** | **Đăng Ký Nguyện Vọng Ca Tuần** | `/schedule/register` | ✅ Quản trị cổng | ✅ Quản trị cổng | ✅ Quản trị cổng | ✍️ Đăng ký ca | ✍️ Đăng ký ca | ✍️ Đăng ký ca | ❌ Bị chặn (Nghiệp vụ nội bộ) | Cổng mở/khóa theo từng chi nhánh |
| **CN04** | **Xếp Lịch Tuần & AutoScheduler Engine** | `/schedule` | ✅ Toàn chuỗi | ✅ CS phụ trách | ✅ 1 CS phụ trách | ✅ Xếp lịch ca | 👁️ Chỉ xem | 👁️ Chỉ xem | ❌ Bị chặn (Lịch trực nội bộ) | Phân vùng độc lập theo `store_id` |
| **CN04b**| **Cấu Hình Khung Giờ Ca & Định Biên** | `/shifts` | ✅ Toàn quyền | ✅ CS phụ trách | ✅ 1 CS phụ trách | ✅ Cấu hình ca | 👁️ Chỉ xem | 👁️ Chỉ xem | ❌ Bị chặn (Định biên nhân sự) | Cấu hình độc lập từng cơ sở |
| **CN05** | **Điểm Danh Camera Trực Tiếp + GPS** | `/checkin` | ✍️ Điểm danh | ✍️ Điểm danh | ✍️ Điểm danh | ✍️ Điểm danh | ✍️ Điểm danh | ✍️ Điểm danh | ❌ Bị chặn (Chấm công nhân viên) | Ràng buộc Geofence đúng cơ sở làm việc |
| **CN06** | **Quản Lý Chuỗi Chi Nhánh & GPS Check-in** | `/stores`<br>`/checkin-config` | ✅ Độc quyền | 👁️ Xem CS gán | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | 👁️ Xem địa chỉ/hotline quán công khai | Admin toàn chuỗi; Khách xem địa chỉ |
| **CN07** | **Tích Điểm Danh Trực Tiếp Trên Ô Lịch** | `/schedule` | ✅ Tích duyệt | ✅ Tích duyệt | ✅ Tích đúng 1 CS | ❌ ẨN DẤU TÍCH | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn (Duyệt công nội bộ) | Trưởng ca chỉ tích đúng 1 CS mình |
| **CN08** | **Trung Tâm Thông Báo Độc Lập 6 Vai Trò** | `/notifications` | ✅ Kênh Admin | ✅ Kênh Quản lý | ✅ Kênh Trưởng ca | ✍️ Kênh Phó lịch | ✍️ Kênh Phó kho | ✍️ Kênh Nhân viên | ❌ Bị chặn (Luồng tin nội bộ) | Tách riêng 6 collection MongoDB |
| **CN09** | **Quản Lý Bảng Lương Tháng & Bảo Mật Thu Nhập** | `/salary` | ✅ Toàn chuỗi | ✅ CS phụ trách | 👁️ 1 CS phụ trách | ❌ ẨN HOÀN TOÀN | ❌ ẨN HOÀN TOÀN | ❌ ẨN HOÀN TOÀN | ❌ Bị chặn (Bảo mật tài chính) | Ẩn SĐT, mã QR và mật khẩu cá nhân |
| **CN10** | **Zalo Bot Đa Kênh Tự Động Hóa Từng Cơ Sở** | `/zalo` | ✅ ĐỘC QUYỀN | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn (Bot vận hành nội bộ) | 4 kênh: Checkin, Kho, Lịch, Chung |
| **CN11** | **Quản Lý Kho 3 Bảng Vật Liệu & Tồn Kho Tối Thiểu**| `/materials` | ✅ Toàn chuỗi | ✅ CS phụ trách | ✅ 1 CS phụ trách | 👁️ Chỉ xem | ✍️ Quản lý kho | 👁️ Xem tồn kho | ❌ Bị chặn (Kho nguyên liệu quán) | 3 bảng: `packagings`, `ingredients`, `toppings` |
| **CN11a**| **Sổ Tay Công Thức Pha Chế (BOM & SOP) & Chọn Ly**| `/recipes` | ✅ Toàn quyền | ✅ Quản lý menu | ✅ Quản lý menu | 👁️ Xem công thức | ✍️ Xem & định mức | ✍️ Barista pha chế | 🥤 **XEM MENU & GIÁ NIÊM YẾT** (Ẩn bí mật BOM/SOP) | Món bán khách vs Bán thành phẩm nội bộ |
| **CN11b**| **Kiểm Kê Kho Thực Tế & Cấu Hình Chu Kỳ** | `/inventory-audit` | ✅ Toàn chuỗi | ✅ Duyệt phiếu | ✅ Duyệt phiếu | ❌ Bị chặn | ✍️ Lập & đếm kho | ✍️ Đếm kho khi giao | ❌ Bị chặn (Kiểm soát thất thoát) | Chế độ đếm lẻ + đếm thùng |
| **CN11c**| **Quản Lý Nhà Cung Cấp & Vật Liệu Cung Ứng** | `/procurement` | ✅ Độc quyền | ✅ Quản lý NCC | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn (Đối tác thương mại) | Hồ sơ nhà cung cấp chuỗi |
| **CN11d**| **Đơn Nhập Hàng PR & Thu Mua Gộp Đơn PO** | `/procurement` | ✅ Toàn chuỗi | ✅ Duyệt & gộp PO | ✍️ Lập PR cơ sở | ❌ Bị chặn | ✍️ Lập PR cơ sở | ❌ Bị chặn | ❌ Bị chặn (Chuỗi cung ứng) | Đề xuất thiếu hụt $\rightarrow$ Gộp PO hưởng chiết khấu |
| **CN12** | **Bán Hàng POS Live Order Đồng Bộ & VietQR** | `/pos` | 👁️ Giám sát ca | 👁️ Giám sát ca | ✍️ Bán hàng ca | ✍️ Bán hàng ca | ✍️ Bán hàng ca | ✍️ Bán hàng ca | 🥤 **GỌI MÓN & QUÉT VIETQR THANH TOÁN** | WebSocket `/pos` đồng bộ 3 nhân viên trong ca |

---

## 🥤 3. BẢNG CHI TIẾT HÀNH TRÌNH KHÁCH HÀNG MUA NƯỚC (CUSTOMER JOURNEY)

Dưới đây là bảng đặc tả chi tiết cách **Khách Hàng Vãng Lai (Người mua nước)** tương tác với hệ thống Zone Six từ lúc vào quán đến khi thanh toán hoàn tất:

| Giai Đoạn | Hành Động Của Khách Hàng | Phân Hệ Hệ Thống Tiếp Nhận | Dữ Liệu Khách Nhìn Thấy | Dữ Liệu Bị Ẩn (Bảo Mật Nội Bộ) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Xem Menu Chọn Món** | - Khách đến quầy gọi món hoặc quét mã QR Menu tại bàn.<br>- Xem danh sách đồ uống, cà phê, trà trái cây, đá xay, topping. | Phân hệ Menu & Sổ Tay Công Thức ([`/recipes`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/recipes/page.tsx)) | - Tên món thương phẩm (`customer_product`).<br>- Ảnh đại diện sắc nét.<br>- Mô tả hương vị đồ uống.<br>- Chế độ nhiệt độ (Uống Lạnh / Uống Nóng).<br>- Giá tiền niêm yết (VNĐ) và giá Topping đi kèm. | ❌ **Ẩn tuyệt đối tỷ lệ định lượng BOM:** Không thấy số ml siro, số gram cốt trà, nhãn hiệu sữa.<br>❌ **Ẩn tuyệt đối quy trình Barista SOP:** Không thấy bí quyết các bước pha chế.<br>❌ **Ẩn món sơ chế nội bộ:** Không thấy syrup đường phèn, cốt trà ủ sắn. |
| **2. Đặt Món Tại Bàn / Quầy** | - Khách yêu cầu: *"Cho 1 Cà Phê Muối ít ngọt, 1 Trà Đào Cam Sả 50% đá thêm trân châu trắng, bàn số 4"*. | Phân hệ POS Live Order ([`/pos`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/pos/page.tsx)) | Khách đọc món cho nhân viên order; có thể nhìn thấy màn hình phụ hiển thị giỏ hàng: tên món, size, số lượng, giảm giá và tổng tiền. | ❌ Khách không được tự ý thao tác vào phần mềm POS của nhân viên.<br>❌ Hệ thống chỉ cho phép nhân viên **đã điểm danh GPS/Camera hợp lệ** mới được thêm/sửa giỏ hàng. |
| **3. Đồng Bộ Đa Thiết Bị Nội Bộ** | Nhân viên A bấm chọn món trên máy tính bảng thu ngân. | WebSocket Namespace `/pos` | Khách thấy nhân viên tiếp nhận đơn nhanh chóng, quầy Barista phía trong bắt đầu pha chế ngay mà không cần nhân viên chạy vào đưa giấy. | - 3 nhân viên trong ca (Thu ngân, Barista, Phục vụ) đồng bộ giỏ hàng trong **0.05 giây**.<br>- Huy hiệu hiển thị ai vừa thêm món. |
| **4. Thanh Toán Quét Mã VietQR** | Khách chọn thanh toán chuyển khoản ngân hàng / ví điện tử. | Modal VietQR Động ([`VietQrModal.tsx`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/pos/component/VietQrModal.tsx)) | - Màn hình hiện **Mã VietQR động chuẩn NAPAS 247**.<br>- Tên tài khoản: `ZONE SIX COFFEE & LOUNGE`.<br>- Số tiền: Khớp chính xác 100% đến từng đồng.<br>- Nội dung chuyển khoản: Mã đơn hàng tự động (Ví dụ: `Z6-CS1-20261031-0005`). | Khách mở App ngân hàng (Vietcombank, MB, Techcombank, MoMo...) quét mã là **tiền và nội dung tự động điền sẵn**, khách chỉ cần bấm Xác Nhận, không cần nhập tay tránh nhầm lẫn. |
| **5. Nhận Nước & Hóa Đơn** | Khách nhận đồ uống đúng định biên và nhận hóa đơn thanh toán. | Phân hệ Quản Lý Đơn Hàng ([`OrderHistoryModal.tsx`](file:///d:/DuAnCaNhan/zone_6/fe/src/features/pos/component/OrderHistoryModal.tsx)) | - Bill thanh toán in ra hoặc hiển thị trên màn hình gồm: Tên quán, Chi nhánh, Ngày giờ, Danh sách món, Mã hóa đơn duy nhất, Lời cảm ơn. | Hóa đơn được lưu vĩnh viễn vào collection `orders` trên MongoDB Atlas phục vụ báo cáo doanh thu cuối ngày. |

---

## 📑 4. BẢNG ĐẶC TẢ CHI TIẾT 17 CHỨC NĂNG HỆ THỐNG DẠNG TABLE

---

### CN01: Xác Thực, Hồ Sơ Nhân Sự & Thẻ Kỹ Thuật Số (Zone Six Staff ID Card)
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN01` |
| **Phân Hệ** | Quản Trị Danh Tánh, Phân Quyền & Bảo Mật Tài Khoản |
| **Route Frontend** | [`/login`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/login/page.tsx), [`/profile`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/profile/page.tsx) |
| **Quyền Hạn 6 Role** | Tất cả 6 vai trò nhân sự đều có tài khoản và thẻ số cá nhân riêng biệt. |
| **Quyền Khách Hàng** | ❌ **Không có tài khoản nội bộ**. Khách hàng chỉ truy cập được các trang giới thiệu hoặc quét QR Menu công khai. |
| **Chức Năng Chính** | 1. Đăng nhập hệ thống qua Email nhân sự và Mật khẩu, duy trì phiên an toàn bằng HTTP-Only Cookie và Bearer Token.<br>2. Thẻ Nhân Viên Số Zone Six Digital Staff ID Card với hiệu ứng 3D Metallic Gold, chip EMV mô phỏng, Logo vương miện, mã QR cá nhân, chức vụ, mức lương giờ và cơ sở biên chế.<br>3. Cập nhật Số điện thoại, Vị trí công tác và Đổi mật khẩu cá nhân. |
| **Bảo Mật & Ràng Buộc** | Mật khẩu xác thực chuẩn hóa; tự động đồng bộ thẻ số sang các phân hệ Điểm danh và Bán hàng POS. |
| **Mã Nguồn Chính** | `be/src/modules/shared/auth/`, `fe/src/app/login/`, `fe/src/app/profile/`, `fe/src/features/shared/auth/` |
| **Collection CSDL** | `users` |

---

### CN02: Quản Lý Nhân Sự & Phân Cấp Chuỗi Đa Cơ Sở
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN02` |
| **Phân Hệ** | Quản Trị Nguồn Nhân Lực (HRM) |
| **Route Frontend** | [`/staff`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/staff/page.tsx) |
| **Quyền Hạn 6 Role** | - `admin_he_thong`: Toàn quyền quản lý nhân sự toàn chuỗi, lọc theo Store Switcher.<br>- `quan_ly`: Quản lý nhân sự tại các chi nhánh được phân công.<br>- `truong_ca`: Chỉ xem và quản lý nhân sự cấp dưới trực thuộc **đúng 1 chi nhánh của mình**.<br>- `pho_ca_lam_lich`, `pho_ca_vat_lieu`, `nhan_vien`: ❌ Bị chặn truy cập. |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối** (Dữ liệu bảo mật nội bộ doanh nghiệp). |
| **Chức Năng Chính** | 1. Bảng danh sách nhân sự phân trang (5/10/20/50 dòng), lọc theo chi nhánh, vai trò, vị trí.<br>2. Thêm nhân viên mới (`CreateStaffModal`): Chọn chi nhánh biên chế, mức lương/giờ, vị trí; hệ thống tự động sinh mật khẩu ngẫu nhiên gửi email bảo mật.<br>3. Sửa thông tin nhân sự (`EditStaffModal`): Nâng hạ vai trò, sửa mức lương giờ. |
| **Bảo Mật & Ràng Buộc** | **Nguyên tắc bất khả xâm phạm:** CẤM tuyệt đối gán hoặc nâng quyền cho người khác ngang cấp hoặc cao hơn cấp của mình (`Không gán đồng cấp hoặc lớn hơn`). |
| **Mã Nguồn Chính** | `be/src/modules/quan_ly/staff/`, `fe/src/features/quan_ly/staff/` |
| **Collection CSDL** | `users`, `store_configs` |

---

### CN03: Đăng Ký Nguyện Vọng Ca Tuần & Cổng Đăng Ký Độc Lập
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN03` |
| **Phân Hệ** | Lập Lịch & Điều Phối Nhân Lực |
| **Route Frontend** | [`/schedule/register`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/schedule/register/page.tsx) |
| **Quyền Hạn 6 Role** | - Tất cả nhân viên đều có quyền đăng ký nguyện vọng ca làm việc của mình.<br>- Quản lý, Trưởng ca và Admin có quyền quản trị: Mở cổng, Khóa cổng hoặc Hẹn giờ đóng cổng. |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối** (Nghiệp vụ nội bộ quán). |
| **Chức Năng Chính** | 1. Bảng lưới tuần 7 ngày x 3 ca (Sáng, Chiều, Tối). Nhân viên tích chọn ca muốn đi làm hoặc báo bận.<br>2. Cổng đăng ký hoạt động độc lập theo từng chi nhánh (`store_id`).<br>3. Hẹn giờ tự động khóa cổng (ví dụ: 23:59 Chủ Nhật). Khi quá hạn cổng tự động khóa, nhân viên chỉ xem ở chế độ Read-only. |
| **Mã Nguồn Chính** | `be/src/modules/nhan_vien/shift-registration/`, `fe/src/features/nhan_vien/shift-registration/` |
| **Collection CSDL** | `shift_registrations`, `registration_windows` |

---

### CN04: Xếp Lịch Tuần Tự Động (AutoScheduler Engine) & Điều Phối Thủ Công
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN04` |
| **Phân Hệ** | Xếp Lịch & Tối Ưu Hóa Vận Hành |
| **Route Frontend** | [`/schedule`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/schedule/page.tsx) |
| **Quyền Hạn 6 Role** | - `admin_he_thong`, `quan_ly`, `truong_ca`, `pho_ca_lam_lich`: Được phép chạy AutoScheduler, kéo thả/thêm bớt nhân viên và xuất bản lịch.<br>- `pho_ca_vat_lieu`, `nhan_vien`: 👁️ Chỉ xem lịch đã công bố. |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối** (Lịch làm việc nội bộ). |
| **Chức Năng Chính** | 1. **Thuật toán AutoScheduler:** Tự động phân tích nguyện vọng ca của nhân viên, đối chiếu định biên tối thiểu, cân bằng số giờ công, không xếp trùng ca.<br>2. Bảng ma trận lịch tuần trực quan với thẻ màu theo vị trí chuyên môn.<br>3. Công bố lịch tuần: Tự động gửi thông báo đến nhân sự và kích hoạt Zalo Bot.<br>4. Xuất file Excel chuẩn văn phòng phục vụ in ấn tại quán. |
| **Mã Nguồn Chính** | `be/src/modules/pho_ca_lam_lich/scheduling/`, `fe/src/features/pho_ca_lam_lich/scheduling/` |
| **Collection CSDL** | `weekly_schedules`, `shift_configs` |

---

### CN04b: Cấu Hình Khung Giờ Ca Làm Việc & Định Biên Nhân Sự Tối Thiểu
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN04b` |
| **Phân Hệ** | Cấu Hình Vận Hành |
| **Route Frontend** | [`/shifts`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/shifts/page.tsx) (hoặc Modal từ `/schedule`) |
| **Quyền Hạn 6 Role** | Admin, Quản Lý, Trưởng Ca và Phó Ca Làm Lịch có quyền cấu hình ca. |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối**. |
| **Chức Năng Chính** | 1. Thiết lập giờ Bắt đầu và Kết thúc ca (Ca 1, Ca 2, Ca 3...).<br>2. Định biên nhân sự bắt buộc: Tổng nhân viên tối thiểu (`min_staff`), số pha chế quầy bar (`min_barista`), số phục vụ sảnh (`min_service`).<br>3. Cấu hình số giờ công quy đổi và màu sắc nhận diện thẻ ca.<br>4. Nút bấm 1-chạm khôi phục cấu hình chuẩn mặc định của Zone Six Signature. |
| **Mã Nguồn Chính** | `be/src/modules/pho_ca_lam_lich/shift-config/`, `fe/src/features/pho_ca_lam_lich/scheduling/component/ShiftConfigModal.tsx` |
| **Collection CSDL** | `shift_configs` |

---

### CN05: Điểm Danh Check-in Camera Trực Tiếp & Định Vị GPS Khớp Cơ Sở
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN05` |
| **Phân Hệ** | Chấm Công & Giám Sát Hiện Diện |
| **Route Frontend** | [`/checkin`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/checkin/page.tsx) |
| **Quyền Hạn 6 Role** | Tất cả 6 vai trò nhân sự khi đi làm ca trực đều phải thực hiện check-in. |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối** (Chấm công nhân viên). |
| **Chức Năng Chính** | 1. **Camera trực tiếp:** Bắt buộc bật camera chụp khuôn mặt tại quầy (loại bỏ hoàn toàn chọn file từ máy chống gian lận).<br>2. **Định vị GPS Geofence:** Quét tọa độ thiết bị, tính khoảng cách Haversine tới chi nhánh, từ chối nếu >50m.<br>3. **Canvas Watermark:** Ép dính chết thông tin vào pixel ảnh (Địa chỉ thực tế, Tọa độ GPS, Thời gian đến từng giây, Dấu xác thực đỏ).<br>4. Kiểm tra khung giờ: Chỉ cho phép check-in trước giờ ca N phút và sau ca M phút. |
| **Mã Nguồn Chính** | `be/src/modules/attendance/`, `fe/src/app/checkin/`, `fe/src/features/attendance/` |
| **Collection CSDL** | `attendances` |

---

### CN06: Quản Lý Chuỗi Chi Nhánh & Cấu Hình Bán Kính / Khung Giờ GPS
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN06` |
| **Phân Hệ** | Quản Trị Chuỗi Đa Chi Nhánh |
| **Route Frontend** | [`/stores`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/stores/page.tsx), [`/checkin-config`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/checkin-config/page.tsx) |
| **Quyền Hạn 6 Role** | `admin_he_thong` (Toàn quyền Tạo/Sửa/Đóng cửa/Xóa); `quan_ly` (Xem cơ sở phụ trách). Các vai trò khác bị chặn. |
| **Quyền Khách Hàng** | 👁️ **Xem thông tin công khai:** Tên quán, Địa chỉ, Số hotline liên hệ để tìm quán hoặc đặt bàn. Bị chặn trang quản trị. |
| **Chức Năng Chính** | 1. Dashboard quản trị cơ sở chuỗi, thống kê số quán mở/đóng.<br>2. Tạo chi nhánh với tính năng tự động điền địa chỉ từ tọa độ GPS (Reverse Geocoding).<br>3. Thiết lập bán kính cho phép chấm công (30m, 50m, 100m...) với bản đồ Leaflet thử nghiệm trực tiếp.<br>4. Cấu hình mốc thời gian cho phép điểm danh trước và sau giờ vào ca. |
| **Mã Nguồn Chính** | `be/src/modules/admin_he_thong/store/`, `be/src/modules/admin_he_thong/checkin-config/`, `fe/src/app/stores/` |
| **Collection CSDL** | `store_configs` |

---

### CN07: Tích Điểm Danh Trực Tiếp Trên Ô Lịch Tuần
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN07` |
| **Phân Hệ** | Chấm Công & Điểm Danh |
| **Route Frontend** | [`/schedule`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/schedule/page.tsx) |
| **Quyền Hạn 6 Role** | `admin_he_thong`, `quan_ly`, `truong_ca` (Chỉ tích ở đúng 1 cơ sở phụ trách). **Ẩn tuyệt đối nút tích với Phó Ca Làm Lịch.** |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối**. |
| **Chức Năng Chính** | 1. Tích chọn checkbox 1 chạm ngay trên thẻ tên nhân viên trong ô ca tuần để xác nhận có mặt thực tế.<br>2. Đồng bộ tức thì cờ `is_checked_in: true/false` vào CSDL MongoDB Atlas.<br>3. Quy tắc an toàn: Ẩn hoàn toàn nút tích với Phó ca làm lịch để chống tự duyệt công cho bản thân. |
| **Mã Nguồn Chính** | `be/src/modules/pho_ca_lam_lich/scheduling/controllers/toggle-slot-checkin.controller.ts`, `fe/src/features/pho_ca_lam_lich/scheduling/component/ShiftSlotCell.tsx` |
| **Collection CSDL** | `weekly_schedules` |

---

### CN08: Trung Tâm Thông Báo Độc Lập 6 Vai Trò
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN08` |
| **Phân Hệ** | Tương Tác & Cảnh Báo Vận Hành |
| **Route Frontend** | Toàn hệ thống (Nút Chuông trên Header) |
| **Quyền Hạn 6 Role** | Tất cả 6 vai trò nhân sự đều có trung tâm thông báo riêng với luồng dữ liệu độc lập. |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối** (Thông báo nội bộ doanh nghiệp). |
| **Chức Năng Chính** | 1. Phân lập 6 collection CSDL độc lập tương ứng với 6 vai trò.<br>2. 4 mức độ cảnh báo: Khẩn cấp (Đỏ), Cao (Cam), Trung bình (Vàng), Thấp (Xanh).<br>3. Modal căn giữa màn hình (Dead-Center Portal `z-[99999]`), khóa cuộn nền, hỗ trợ xem dạng Thẻ hoặc Bảng.<br>4. Đánh dấu đã đọc từng tin hoặc tất cả. |
| **Mã Nguồn Chính** | `be/src/modules/shared/notifications/`, `fe/src/features/shared/notifications/` |
| **Collection CSDL** | 6 collections `notifications_*` |

---

### CN09: Quản Lý Bảng Lương Tháng & Phân Tầng Bảo Mật Thu Nhập
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN09` |
| **Phân Hệ** | Kế Toán & Chi Phí Lương |
| **Route Frontend** | [`/salary`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/salary/page.tsx) |
| **Quyền Hạn 6 Role** | `admin_he_thong`, `quan_ly`, `truong_ca` (Chỉ xem cơ sở mình). **ẨN TUYỆT ĐỐI với Nhân Viên, Phó Ca Lịch, Phó Ca Vật Liệu.** |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối** (Bí mật kinh doanh nội bộ). |
| **Chức Năng Chính** | 1. Tự động tính lương: Số ca làm việc thực tế điểm danh hợp lệ x Mức lương cơ sở theo giờ (`hourly_rate`).<br>2. Lọc bảng lương theo từng tháng trong năm và theo từng chi nhánh.<br>3. **Bảo mật tuyệt đối:** Ẩn hoàn toàn SĐT cá nhân, mã QR và mật khẩu nhân sự trên bảng lương. Chặn menu và API với cấp Nhân viên và Phó ca. |
| **Mã Nguồn Chính** | `be/src/modules/quan_ly/salary/`, `fe/src/app/salary/`, `fe/src/features/quan_ly/salary/` |
| **Collection CSDL** | `users`, `weekly_schedules`, `attendances` |

---

### CN10: Trợ Lý Tự Động Hóa Zalo Bot Đa Kênh Từng Chi Nhánh
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN10` |
| **Phân Hệ** | Tự Động Hóa & Tích Hợp OTT Bot |
| **Route Frontend** | [`/zalo`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/zalo/page.tsx) |
| **Quyền Hạn 6 Role** | **ĐỘC QUYỀN DUY NHẤT ADMIN HỆ THỐNG (`admin_he_thong`)**. Các vai trò khác bị ẩn menu và chuyển hướng tức thì. |
| **Quyền Khách Hàng** | ❌ **Bị chặn trang quản trị**. Khách hàng chỉ có thể nhận tin nhắn thông báo đơn hàng hoặc CSKH qua Zalo cá nhân/OA nếu tích hợp. |
| **Chức Năng Chính** | 1. Quét QR kết nối tài khoản Zalo cá nhân qua thư viện `zca-js`, lưu phiên mã hóa AES-256-GCM trong Docker Volume.<br>2. Cấu hình 4 kênh nghiệp vụ độc lập từng chi nhánh: `CHECKIN` (điểm danh/đi trễ), `MATERIAL` (kho/cạn hàng), `SCHEDULE` (lịch tuần), `GENERAL` (trao đổi chung).<br>3. Tự động nạp danh sách Group từ Zalo, nút copy tên nhóm chuẩn và nút bắn tin thử nghiệm. |
| **Mã Nguồn Chính** | `be/src/modules/admin_he_thong/zalo/`, `fe/src/app/zalo/`, `fe/src/features/admin_he_thong/zalo/` |
| **Collection CSDL** | `zalo_configs` |

---

### CN11: Quản Lý Kho 3 Bảng Vật Liệu & Tồn Kho Tối Thiểu
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN11` |
| **Phân Hệ** | Quản Trị Kho Vận & Chuỗi Cung Ứng |
| **Route Frontend** | [`/materials`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/materials/page.tsx) |
| **Quyền Hạn 6 Role** | `pho_ca_vat_lieu`, `truong_ca`, `quan_ly`, `admin_he_thong`. (Nhân viên chỉ xem). |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối** (Kho nội bộ). |
| **Chức Năng Chính** | 1. Tách biệt vật lý 3 bảng CSDL: Bao bì (`packagings`), Nguyên liệu (`ingredients`), Topping (`toppings`).<br>2. Phân loại phạm vi sử dụng nguyên liệu (`usage_scope`: Món Bán Khách, Sơ Chế Nội Bộ, Cả Hai).<br>3. Cảnh báo tự động khi số lượng tồn kho $\le$ ngưỡng tối thiểu (`min_threshold`).<br>4. Nút bấm `+` / `-` điều chỉnh xuất nhập tồn kho nhanh ngay tại thẻ vật liệu. |
| **Mã Nguồn Chính** | `be/src/modules/pho_ca_vat_lieu/material/`, `fe/src/app/materials/`, `fe/src/features/pho_ca_vat_lieu/material/` |
| **Collection CSDL** | `packagings`, `ingredients`, `toppings` |

---

### CN11a: Sổ Tay Công Thức Pha Chế Bí Mật (BOM & SOP) & Chọn Ly Theo Nhiệt Độ
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN11a` |
| **Phân Hệ** | Quản Lý Menu & Bí Quyết Barista |
| **Route Frontend** | [`/recipes`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/recipes/page.tsx) |
| **Quyền Hạn 6 Role** | Tất cả nhân sự Zone 6 từ cấp Nhân Viên trở lên đều được xem công thức BOM/SOP để pha chế đúng chuẩn. |
| **Quyền Khách Hàng** | 🥤 **ĐIỂM CHẠM XEM MENU & GIÁ NIÊM YẾT:**<br>- Khách được xem danh sách món thương phẩm (`customer_product`), hình ảnh, mô tả vị ngon, giá niêm yết công khai.<br>- ❌ **Ẩn tuyệt đối công thức định lượng bí mật BOM** (ml/gram) và **quy trình Barista SOP**.<br>- ❌ Ẩn danh mục bán thành phẩm nội bộ (`internal_prep`). |
| **Chức Năng Chính** | 1. Phân loại 2 nhóm: Món bán khách vs Bán thành phẩm sơ chế nội bộ.<br>2. Cấu hình 3 chế độ nhiệt độ (Lạnh, Nóng, Cả Hai) và dropdown chọn Ly Lạnh / Ly Nóng riêng biệt lọc từ kho.<br>3. Quản lý danh mục món độc lập (`recipe_categories`) với tính năng tự động tạo mới (`findOrCreate`).<br>4. Tự động tính giá vốn COGS và biên lợi nhuận gộp (Gross Margin %). |
| **Mã Nguồn Chính** | `be/src/modules/pho_ca_vat_lieu/recipe/`, `fe/src/app/recipes/`, `fe/src/features/pho_ca_vat_lieu/recipe/` |
| **Collection CSDL** | `recipes`, `recipe_categories`, `sellable_toppings` |

---

### CN11b: Phân Hệ Kiểm Kê Kho Thực Tế & Cấu Hình Chu Kỳ
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN11b` |
| **Phân Hệ** | Kiểm Soát Thất Thoát Kho Vận |
| **Route Frontend** | [`/inventory-audit`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/inventory-audit/page.tsx) |
| **Quyền Hạn 6 Role** | Nhân viên được phân công kiểm kho; Trưởng ca, Quản lý, Admin duyệt phiếu và cấu hình chu kỳ. |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối**. |
| **Chức Năng Chính** | 1. Nhật ký đợt kiểm kê kho theo ngày, ghi nhận người kiểm, số lệch thực tế so với sổ sách, giá trị tiền chênh lệch.<br>2. Chế độ đếm kép: Đếm số lẻ hoặc nhập số lượng thùng hệ thống tự quy đổi.<br>3. Modal cấu hình: Phân quyền vai trò được tạo phiếu, ca bắt buộc kiểm trong ngày, tần suất chu kỳ (hàng ngày, 2-3 ngày/lần).<br>4. Tự động cập nhật số liệu tồn kho thực tế vào CSDL khi duyệt phiếu. |
| **Mã Nguồn Chính** | `be/src/modules/pho_ca_vat_lieu/inventory-audit/`, `fe/src/app/inventory-audit/`, `fe/src/features/pho_ca_vat_lieu/inventory-audit/` |
| **Collection CSDL** | `inventory_audits`, `inventory_audit_configs` |

---

### CN11c: Quản Lý Nhà Cung Cấp & Liên Kết Vật Liệu Cung Ứng
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN11c` |
| **Phân Hệ** | Quản Lý Đối Tác Cung Ứng Chuỗi |
| **Route Frontend** | [`/procurement`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/procurement/page.tsx) (Tab Nhà Cung Cấp) |
| **Quyền Hạn 6 Role** | **ĐỘC QUYỀN QUẢN LÝ VÀ ADMIN HỆ THỐNG**. Các vai trò khác không có quyền truy cập. |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối** (Đối tác kinh doanh). |
| **Chức Năng Chính** | 1. Hồ sơ nhà cung cấp: Tên đối tác, MST, Hotline, Người phụ trách, Địa chỉ kho, Đánh giá chất lượng (1-5 sao).<br>2. Danh mục vật liệu cung ứng: Gắn danh sách nguyên liệu, bao bì mà NCC này cung cấp cùng giá nhập dự kiến.<br>3. Theo dõi lịch sử hợp tác và tổng chi phí mua sắm theo từng NCC. |
| **Mã Nguồn Chính** | `be/src/modules/admin_he_thong/supplier/`, `fe/src/features/admin_he_thong/supplier/` |
| **Collection CSDL** | `suppliers` |

---

### CN11d: Yêu Cầu Nhập Kho (PR) & Trung Tâm Thu Mua Gộp Đơn PO Đa Cơ Sở
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN11d` |
| **Phân Hệ** | Mua Hàng Tập Trung & Tối Ưu Chi Phí Chuỗi |
| **Route Frontend** | [`/procurement`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/procurement/page.tsx) |
| **Quyền Hạn 6 Role** | Phó Ca Kho / Trưởng Ca (Lập PR cơ sở mình); Quản Lý & Admin (Duyệt, gộp PO và xuất hàng). |
| **Quyền Khách Hàng** | ❌ **Bị chặn tuyệt đối**. |
| **Chức Năng Chính** | 1. **Lập Phiếu PR:** Cơ sở đề xuất hàng cần nhập, có nút *"Tự động gợi ý từ tồn kho"* quét các mặt hàng dưới `min_threshold`.<br>2. **Gộp Đơn Thu Mua PO (PO Aggregation):** Quản lý gom nhiều phiếu PR từ các chi nhánh cùng gửi lên 1 Nhà cung cấp thành 1 Đơn PO lớn để đàm phán chiết khấu tối đa.<br>3. Chọn điểm giao hàng: Giao về Kho Tổng hoặc giao thẳng từng chi nhánh.<br>4. Xác nhận nhập kho: Kiểm đếm và bấm xác nhận, hệ thống tự động cộng dồn số lượng vào tồn kho thực tế cơ sở đó. |
| **Mã Nguồn Chính** | `be/src/modules/pho_ca_vat_lieu/purchase_requisition/`, `be/src/modules/quan_ly/purchase_order/`, `fe/src/features/quan_ly/procurement/` |
| **Collection CSDL** | `purchase_requisitions`, `purchase_orders` |

---

### CN12: Hệ Thống Bán Hàng POS Live Order Đồng Bộ Thời Gian Thực & Thanh Toán VietQR Động
| Thuộc Tính | Chi Tiết Đặc Tả Kỹ Thuật & Nghiệp Vụ |
| :--- | :--- |
| **Mã Chức Năng** | `CN12` |
| **Phân Hệ** | Bán Hàng & Thu Ngân Đa Thiết Bị (Point of Sale) |
| **Route Frontend** | [`/pos`](file:///d:/DuAnCaNhan/zone_6/fe/src/app/pos/page.tsx) |
| **Quyền Hạn 6 Role** | Nhân viên đang trong ca làm việc hợp lệ; Quản lý/Admin chế độ giám sát. |
| **Quyền Khách Hàng** | 🥤 **ĐIỂM CHẠM MUA NƯỚC & THANH TOÁN CHÍNH:**<br>1. **Gọi món:** Khách gọi đồ uống tại quầy hoặc tại bàn (yêu cầu ít ngọt, đá riêng, thêm thạch...).<br>2. **Xem tổng tiền:** Khách đối chiếu thông tin đơn hàng trên màn hình thanh toán.<br>3. **Quét VietQR động:** Màn hình hiện mã VietQR chuẩn Napas 247 khớp chính xác số tiền và mã hóa đơn, khách quét chuyển khoản tức thì không cần nhập số tiền.<br>4. **Nhận hóa đơn:** Nhận phiếu thanh toán chứa mã đơn duy nhất `Z6-<STORE_CODE>-<YYYYMMDD>-<SEQ>`. |
| **Chức Năng Chính** | 1. **Shift Gatekeeper:** Kiểm tra nhân viên có ca trực và đã điểm danh Camera + GPS chưa; chặn và chuyển hướng nếu vi phạm.<br>2. **Đồng bộ giỏ hàng ca trực qua WebSocket:** 3 nhân viên trong ca cùng mở POS trên nhiều thiết bị (iPad, điện thoại, máy tính) thấy giỏ hàng nhảy tức thì trong **0.05 giây**.<br>3. **Khóa giỏ hàng thông minh (Cart Lock):** Tạm khóa giỏ khi có người đang nhập thông tin tính tiền tránh thao tác trùng.<br>4. **Sinh mã VietQR động:** Tự động tạo mã QR chứa số tài khoản quán, số tiền và nội dung chuyển khoản.<br>5. **Lưu hóa đơn vĩnh viễn:** Lưu đơn vào collection `orders` và làm sạch giỏ hàng cho lượt khách tiếp theo. |
| **Mã Nguồn Chính** | `be/src/modules/pos/`, `fe/src/app/pos/`, `fe/src/features/pos/` (`PosHeader.tsx`, `MenuCatalog.tsx`, `LiveCart.tsx`, `VietQrModal.tsx`, `OrderHistoryModal.tsx`, `useLivePos.ts`) |
| **Collection CSDL** | `pos_sessions`, `orders` |

---

## 🏗️ 5. BẢNG TỔNG HỢP CÔNG NGHỆ & HẠ TẦNG DỰ ÁN

| Thành Phần Hệ Thống | Công Nghệ / Thư Viện Sử Dụng | Mục Đích Kỹ Thuật & Triển Khai |
| :--- | :--- | :--- |
| **Backend Framework** | Node.js (TypeScript, Express.js) | Chạy bên trong Docker Container `zone6-backend` (Cổng 8000 nội bộ), bọc `asyncHandler` và kiến trúc Granular SRP. |
| **Frontend Framework** | Next.js 16.4.3 (App Router, React 19, TypeScript) | Triển khai trên **Vercel** ([`https://zone-6.vercel.app`](https://zone-6.vercel.app)), giao diện Obsidian Carbon & Luxury Gold. |
| **Real-time Engine** | Socket.io v4.8 (WebSocket + HTTP Long-polling) | Namespace `/pos` phục vụ đồng bộ đơn hàng POS tức thì và điều khiển Zalo Bot. |
| **Cơ Sở Dữ Liệu** | MongoDB Atlas Cloud (Database: `zone_6`) | Quản lý schema bằng **Prisma ORM Multi-File** và mô hình hóa bằng **Mongoose ODM**. |
| **Reverse Proxy & Web Server** | Nginx Alpine | Chạy bên trong Docker Container `zone6-nginx`, cổng 80 ngoài internet VPS `160.191.243.53`, cấu hình WebSocket bền bỉ 24h. |
| **Bảo Mật & Điểm Danh** | JWT (Cookie HTTP-Only & Bearer) + HTML5 Canvas Geofence | Phân quyền 7 vai trò, ép dính Watermark địa chỉ và GPS bán kính 50m chống gian lận. |
| **Cổng Thanh Toán Số** | VietQR API (Napas 247) | Sinh mã QR động tự điền số tiền và nội dung đơn hàng cho khách vãng lai. |
| **Tự Động Hóa OTT** | Thư viện `zca-js` (Zalo Personal Bot) | Mã hóa phiên bằng AES-256-GCM, phân luồng 4 kênh chuyên biệt từng chi nhánh. |

---

> **Kết luận:** Hệ thống Zone Six Signature là giải pháp khép kín kết nối trọn vẹn từ **Khách Hàng Mua Nước (Xem Menu, Đặt nước, Quét VietQR)** đến **Bộ Máy Vận Hành Nội Bộ (Nhân sự, Xếp ca, Điểm danh GPS, Kiểm kho, Thu mua, Bán hàng POS và Quản trị chuỗi)**. Mọi chức năng đều được chuẩn hóa bằng bảng biểu, phân rã kỹ thuật và hoạt động thực tế trên CSDL MongoDB Atlas.
