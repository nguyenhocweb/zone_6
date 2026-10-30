# 👑 VAI TRÒ: ADMIN HỆ THỐNG (`admin_he_thong`)

---

## 1. MỤC TIÊU & ĐỊNH NGHĨA VAI TRÒ
- **Mã hệ thống:** `admin_he_thong`
- **Tên hiển thị:** Admin Hệ Thống (Super Administrator / Branch Admin)
- **Tài khoản mặc định:** `admin@zonesix.vn` / `admin@zone6.vn` (Mã NV: `Z6-ADMIN`)
- **Phạm vi quản lý cơ sở (Store Scope):**
  - **Admin tối cao (Super Admin):** Quản lý **TOÀN BỘ CƠ SỞ** trên toàn chuỗi Zone Six.
  - **Admin chi nhánh (khi được phân công):** Quản lý **vài cơ sở hoặc nhiều cơ sở cụ thể** nếu Admin tối cao phân quyền cơ sở nào thì quản lý đúng các cơ sở đó.
- **Mục tiêu cốt lõi:**
  - Nắm giữ toàn bộ quyền kiểm soát cao nhất của hệ thống chuỗi Zone Six đa cơ sở.
  - Quản trị danh mục cơ sở (Thêm/Sửa/Kích hoạt cơ sở) và phân quyền cơ sở phụ trách cho Quản lý và nhân sự.
  - Cấu hình tham số vận hành từng cơ sở (GPS cơ sở, bán kính geofence, khung giờ check-in).
  - Vận hành và giám sát kênh tự động hóa Zalo Personal Bot theo từng nhóm cơ sở.
  - Can thiệp khẩn cấp vào mọi dữ liệu ca làm, điểm danh, bảng lương theo cơ sở khi có sai sót vận hành.

---

## 2. TÁC ĐỘNG ĐẾN HỆ THỐNG VÀ CÁC VAI TRÒ KHÁC

### 2.1 Quyền Phân Bổ Cơ Sở Cho Quản Lý & Trưởng Ca
- **Độc quyền phân quyền cơ sở:** Admin chỉ định rõ tài khoản Quản lý (`quan_ly`) phụ trách 1 cơ sở hay vài / nhiều cơ sở cụ thể (`managed_store_ids`).
- **Gán Trưởng ca vào 1 cơ sở duy nhất:** Admin chỉ định Trưởng ca (`truong_ca`) làm việc cố định tại **đúng 1 cơ sở** (`assigned_store_id`), tuyệt đối không gán đa cơ sở cho Trưởng ca.
- Tạo mới, chỉnh sửa mức lương, cập nhật vai trò và điều chuyển nhân sự giữa các cơ sở.
- Xem được tất cả ca làm việc, lịch sử điểm danh, báo cáo công và bảng lương theo từng cơ sở hoặc toàn chuỗi.

### 2.2 Tác động đến Phó ca & Nhân viên
- Can thiệp trực tiếp vào lịch làm việc của bất kỳ cơ sở nào trong phạm vi quản trị: Thêm/bớt/đổi ca cho nhân viên.
- Tích điểm danh hoặc hủy điểm danh trực tiếp cho mọi nhân sự trên bảng lịch tuần của từng cơ sở.
- Cấu hình Zalo Bot gửi thông báo lịch trực đến nhóm Zalo của từng cơ sở và tin nhắn cá nhân nhân viên.

### 2.3 Bộ Chuyển Đổi Cơ Sở (Store Switcher) Trên Giao Diện
- Admin sở hữu dropdown chọn cơ sở (Store Switcher) trên thanh Topbar/Header:
  - Lựa chọn: "Tất cả cơ sở" (Tổng hợp toàn chuỗi) hoặc chọn đích danh "Cơ sở 1", "Cơ sở 2"...
  - Khi chọn cơ sở nào, toàn bộ dữ liệu (Lịch tuần, Nhân sự, Bảng lương, Điểm danh, Kho) tự động lọc theo cơ sở đó.

---

## 3. DANH SÁCH CHỨC NĂNG VÀ HÀNH ĐỘNG CỤ THỂ

### 3.1 Quản Trị Danh Mục Cơ Sở (Độc quyền Admin)
- **Truy cập:** Route `/stores` hoặc `/checkin-config`.
- **Thêm cơ sở mới:** Nhập tên cơ sở (VD: "Zone Six - Cơ sở Cầu Giấy"), mã cơ sở (`Z6-CG`), địa chỉ, tọa độ GPS (Vĩ độ, Kinh độ), bán kính Geofence, số điện thoại chi nhánh.
- **Phân quyền cơ sở cho tài khoản:** Chọn tài khoản Quản lý và tích chọn danh sách cơ sở mà Quản lý đó được phép điều hành.
- **Kích hoạt / Tạm dừng cơ sở:** Bật/tắt trạng thái hoạt động của cơ sở trong chuỗi.

### 3.2 Nhóm Quản trị Zalo Bot (Độc quyền Admin)
- **Truy cập Menu Zalo Bot:** Route `/zalo`.
- **Đăng nhập Zalo cá nhân qua QR Code:** Quét mã QR zca-js để duy trì phiên liên tục.
- **Cấu hình kênh nhận tin theo cơ sở:** Phân tách nhóm Zalo nhận tin theo từng cơ sở (mỗi cơ sở 1 nhóm chat nội bộ).
- **Gửi thông báo lịch tuần tự động:** Bắn tin lịch tuần theo từng nhóm cơ sở.

### 3.3 Nhóm Cấu hình GPS Từng Cơ Sở & Điểm danh
- **Cấu hình GPS từng Cơ Sở:** Route `/checkin-config` với bộ chọn cơ sở cần cấu hình.
- **Thiết lập tọa độ:** Nhập vĩ độ (`lat`), kinh độ (`lng`) hoặc bấm "Lấy vị trí hiện tại" khi đứng tại cơ sở đó.
- **Bán kính Geofence:** Cấu hình bán kính cho phép (30m, 50m, 100m, 200m, 500m) cho từng cơ sở.
- **Test khoảng cách thực tế:** Kiểm tra trực tiếp khoảng cách từ thiết bị đến cơ sở đang chọn.

### 3.4 Nhóm Quản lý Nhân sự & Phân Bổ Cơ Sở
- **Xem danh sách toàn bộ nhân sự:** Lọc theo từng cơ sở hoặc xem toàn chuỗi.
- **Tạo nhân viên mới:** Chọn vai trò, phân bổ vào cơ sở làm việc cụ thể (`assigned_store_id`), nhập lương giờ. Hệ thống tự sinh mật khẩu ngẫu nhiên và gửi về email.
- **Điều chuyển cơ sở:** Thay đổi cơ sở làm việc cho nhân viên khi có nhu cầu luân chuyển giữa các chi nhánh.

### 3.5 Nhóm Xếp Lịch & Điểm Danh Đa Cơ Sở
- **Xếp lịch tuần theo cơ sở:** Chọn cơ sở trên Store Switcher để xem và duyệt ma trận ca tuần của cơ sở đó.
- **Chạy AutoScheduler:** Kích hoạt thuật toán tự động xếp lịch tuần riêng cho từng cơ sở.
- **Tích Điểm Danh (Direct Check-in):** Nhấp trực tiếp vào ô ca trên bảng lịch của bất kỳ cơ sở nào để tích xanh (Đã check-in) hoặc bỏ tích.
- **Xuất Excel:** Xuất file bảng lịch tuần chuẩn hóa theo từng cơ sở.

### 3.6 Nhóm Bảng Lương & Thù Lao Đa Cơ Sở
- **Xem toàn bộ bảng lương tháng:** Route `/salary`.
- Lọc xem chi phí lương của từng cơ sở cụ thể hoặc tổng chi phí lương toàn chuỗi Zone Six.

---

## 4. BẢNG PHÂN QUYỀN VÀ GIỚI HẠN GIAO DIỆN

| Thành Phần Giao Diện | Trạng Thái Hiển Thị | Quyền Thao Tác |
| :--- | :---: | :--- |
| Header: **Store Switcher** | ✅ Hiển thị | Chọn "Tất cả" hoặc từng cơ sở trong phạm vi quản trị |
| Sidebar Menu: **Quản Lý Cơ Sở (/stores)** | ✅ Hiển thị | Toàn quyền Thêm / Sửa / Phân quyền cơ sở |
| Sidebar Menu: **Zalo Bot (/zalo)** | ✅ Hiển thị | Toàn quyền cấu hình, QR, gửi tin theo nhóm cơ sở |
| Sidebar Menu: **Cấu Hình Check-in (/checkin-config)**| ✅ Hiển thị | Cập nhật GPS, bán kính, khung giờ từng cơ sở |
| Sidebar Menu: **Quản Lý Nhân Sự (/staff)** | ✅ Hiển thị | Xem toàn bộ, thêm/sửa, phân bổ cơ sở cho nhân viên |
| Sidebar Menu: **Bảng Lương Tháng (/salary)** | ✅ Hiển thị | Xem lương theo từng cơ sở hoặc toàn chuỗi |
| Bảng Lịch Tuần: **Dấu tích Check-in** | ✅ Hiển thị | Bấm tích / bỏ tích trực tiếp cho mọi cơ sở |
| Bảng Lịch Tuần: **Nút Auto Xếp Lịch** | ✅ Hiển thị | Chạy thuật toán xếp tự động theo cơ sở |
| Bảng Lịch Tuần: **Nút Xuất Excel** | ✅ Hiển thị | Tải file Excel lịch tuần theo cơ sở |

