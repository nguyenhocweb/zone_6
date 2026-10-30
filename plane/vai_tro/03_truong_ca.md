# ⏱️ VAI TRÒ: TRƯỞNG CA (`truong_ca`)

---

## 1. MỤC TIÊU & ĐỊNH NGHĨA VAI TRÒ
- **Mã hệ thống:** `truong_ca`
- **Tên hiển thị:** Trưởng Ca (Shift Leader)
- **Tài khoản mặc định:** `truongca@zonesix.vn` / `truongca@zone6.vn` (Mã NV: `Z6-TC01`)
- **Phạm vi quản lý cơ sở (Store Scope) - RÀNG BUỘC CỨNG (STRICT 1-STORE CONSTRAINT):**
  - **CHỈ LÀM VIỆC & PHỤ TRÁCH TẠI ĐÚNG 1 CƠ SỞ DUY NHẤT** (`assigned_store_id`).
  - Không quản lý đa cơ sở, không có quyền chuyển đổi cơ sở (không có Store Switcher).
  - Toàn bộ quyền hạn và dữ liệu hiển thị (Lịch ca, Điểm danh, Nhân sự cấp dưới, Bảng lương) chỉ diễn ra và giới hạn tuyệt đối trong phạm vi **1 cơ sở được gắn cố định**.
- **Mục tiêu cốt lõi:**
  - Chỉ huy trực tiếp hiện trường ca trực tại cơ sở Zone Six được phân công (Barista & Service).
  - Kiểm soát quân số có mặt tại cơ sở: Kiểm tra và tích điểm danh (Direct Check-in) trên bảng ca của cơ sở đó.
  - Xử lý các tình huống phát sinh trong ca tại cơ sở: Nhân viên vắng đột xuất, khách đông cần tăng cường, đổi ca gấp trong cơ sở.
  - Phối hợp với Phó ca làm lịch của cơ sở để tối ưu ma trận ca tuần.

---

## 2. TÁC ĐỘNG ĐẾN HỆ THỐNG VÀ CÁC VAI TRÒ KHÁC

### 2.1 Tác động đến Nhân viên & Phó ca tại cơ sở
- **Quyền lực điểm danh thực tế tại cơ sở:** Là người trực tiếp tại quán bấm tích điểm danh trên bảng lịch ca của cơ sở để công nhận ca làm cho nhân sự cơ sở đó.
- **Giám sát cấp dưới tại cơ sở:** Xem danh sách hồ sơ nhân sự cấp dưới (`pho_ca_lam_lich`, `pho_ca_vat_lieu`, `nhan_vien`) **thuộc cùng cơ sở**.
- **Phân cấp tạo tài khoản:** Chỉ được tạo tài khoản nhân sự cấp dưới cho cơ sở của mình. Tài khoản mới tự động được gán vào cùng `store_id` với Trưởng ca.
- **Điều chỉnh ca đột xuất:** Có quyền can thiệp vào bảng lịch ca của cơ sở để hoán đổi người trong ô ca khi có nhân viên báo ốm hoặc bận đột xuất.

### 2.2 Ranh giới đối với Quản lý, Admin & Các cơ sở khác (Điều cấm kỵ)
- **CẤM CAN THIỆP CƠ SỞ KHÁC:** Tuyệt đối không được xem lịch, không được tích điểm danh, không được xem nhân sự hay bảng lương của các cơ sở khác trong chuỗi Zone Six.
- **Không có Store Switcher:** Giao diện Trưởng ca không có bộ chọn cơ sở, hệ thống tự động khóa chặt với cơ sở được phân công.
- **Không xem được cấp trên:** Tại trang Quản Lý Nhân Sự, danh sách đã lọc bỏ hoàn toàn các tài khoản Quản lý (`quan_ly`) và Admin (`admin_he_thong`).
- **Không có quyền cấu hình GPS quán:** Menu Cấu hình Check-in bị ẩn/chặn.
- **Không có quyền Zalo Bot:** Menu Zalo bị ẩn hoàn toàn, chặn URL và API.

---

## 3. DANH SÁCH CHỨC NĂNG VÀ HÀNH ĐỘNG CỤ THỂ

### 3.1 Nhóm Điểm Danh Hiện Trường Tại Cơ Sở (Trọng Tâm Nghiệp Vụ)
- **Tích Điểm Danh Trực Tiếp Trên Ô Ca (Direct Check-in):** Nhấp chuột trực tiếp vào ô ca trên bảng lịch tuần của **đúng cơ sở mình phụ trách** để xác nhận nhân viên có mặt làm việc (chuyển trạng thái xanh kèm dấu tích).
- **Tự Check-in Cá Nhân:** Chụp ảnh Camera trực tiếp tại cơ sở với con dấu Watermark (Địa chỉ GPS cơ sở + Thời gian thực). Hệ thống tự đối chiếu với Geofence của đúng cơ sở mình.
- **Xem Chi Tiết Điểm Danh:** Bấm vào ca để xem ảnh chụp bằng chứng, khoảng cách GPS và địa chỉ thực tế khi check-in của nhân viên tại cơ sở.

### 3.2 Nhóm Xếp Lịch & Ca Làm Việc Tại Cơ Sở
- **Đăng ký ca làm tuần:** Tham gia đăng ký ca cá nhân tại cơ sở mình.
- **Tự động xếp lịch (AutoScheduler):** Chạy thuật toán xếp lịch tự động hỗ trợ cơ sở khi cần.
- **Chỉnh sửa ca trực cơ sở:** Thay đổi nhân sự trong ô ca của cơ sở để đảm bảo đủ người cho ca trực.
- **Mở/Khóa đăng ký ca cơ sở:** Đóng mở cổng đăng ký tuần của cơ sở.
- **Xuất bảng lịch Excel:** Tải file Excel lịch tuần của cơ sở mình.

### 3.3 Nhóm Quản Lý Nhân Sự Cấp Dưới Tại Cơ Sở
- **Truy cập:** Route `/staff`.
- **Xem danh sách nhân sự cấp dưới tại cơ sở:** Chỉ xem danh sách Phó ca và Nhân viên thuộc cơ sở của mình.
- **Thêm nhân viên mới cho cơ sở:** Tạo tài khoản nhân sự cấp dưới, tự động gắn vào cơ sở hiện tại, mật khẩu tự sinh ngẫu nhiên gửi về email.
- **Sửa thông tin nhân viên:** Cập nhật vị trí, mức lương cho cấp dưới trong cơ sở.

### 3.4 Nhóm Bảng Lương Cơ Sở (Payroll)
- **Truy cập:** Route `/salary`.
- **Xem bảng lương cơ sở:** Được quyền xem bảng lương của nhân sự **thuộc cơ sở mình** để theo dõi tổng giờ công và mức thu nhập ca trực (tuân thủ bảo mật ẩn sđt/qr). Không xem được lương nhân sự cơ sở khác.

---

## 4. BẢNG PHÂN QUYỀN VÀ GIỚI HẠN GIAO DIỆN

| Thành Phần Giao Diện | Trạng Thái Hiển Thị | Quyền Thao Tác |
| :--- | :---: | :--- |
| Header: **Store Switcher** | ❌ **Không có** | Gắn chặt vào ĐÚNG 1 cơ sở cố định |
| Sidebar Menu: **Zalo Bot** | ❌ **Ẩn hoàn toàn** | Bị chặn URL & API 403 Forbidden |
| Sidebar Menu: **Cấu Hình Check-in** | ❌ **Ẩn hoàn toàn** | Chỉ dành riêng cho Quản lý & Admin |
| Sidebar Menu: **Quản Lý Cơ Sở** | ❌ **Ẩn hoàn toàn** | Không có quyền quản trị cơ sở |
| Sidebar Menu: **Quản Lý Nhân Sự** | ✅ Hiển thị | Chỉ xem và thao tác trên cấp dưới tại cơ sở mình |
| Sidebar Menu: **Bảng Lương Tháng** | ✅ Hiển thị | Chỉ xem bảng lương nhân sự tại cơ sở mình |
| Bảng Lịch Tuần: **Dấu tích Check-in**| ✅ Hiển thị | Bấm tích / bỏ tích điểm danh trực tiếp cho cơ sở mình |
| Bảng Lịch Tuần: **Nút Auto Xếp Lịch**| ✅ Hiển thị | Chạy thuật toán xếp tự động cho cơ sở mình |
| Bảng Lịch Tuần: **Nút Xuất Excel** | ✅ Hiển thị | Tải file Excel lịch tuần của cơ sở mình |

