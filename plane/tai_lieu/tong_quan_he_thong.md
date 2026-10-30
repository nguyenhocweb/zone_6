# ☕ TỔNG QUAN HỆ THỐNG QUẢN LÝ VẬN HÀNH CHUỖI ZONE SIX (MULTI-STORE)

---

## 1. BỐI CẢNH VẬN HÀNH CHUỖI ĐA CƠ SỞ
- **Thương hiệu:** Zone Six (Chuỗi Cafe & Đồ uống hiện đại tích hợp vận hành theo ca linh hoạt).
- **Mô hình chuỗi cơ sở (Multi-Store / Multi-Branch):** Hệ thống bao gồm **nhiều cơ sở (chi nhánh)** hoạt động đồng thời (Cơ sở 1, Cơ sở 2, Cơ sở 3...). Mỗi cơ sở có địa chỉ, tọa độ GPS thực tế, bán kính Geofence an toàn và định biên ca trực riêng biệt.
- **Quy mô nhân sự:** Đội ngũ nhân viên phân bổ theo từng cơ sở (Pha chế Barista, Phục vụ Service, Trưởng ca, Phó ca) dưới sự điều hành của Quản lý cơ sở và Ban Quản Trị Hệ Thống (Admin).
- **Mục tiêu hệ thống:** 
  - Quản trị tập trung toàn bộ chuỗi cơ sở trên một nền tảng thống nhất.
  - Phân quyền linh hoạt theo phạm vi cơ sở (Store Scope):
    - **Admin Hệ Thống:** Quản lý toàn bộ tất cả cơ sở hoặc phân quyền vài/nhiều cơ sở cho các tài khoản quản trị; độc quyền tạo cơ sở mới và cấu hình tham số chuỗi.
    - **Quản Lý Quán:** Quản lý 1 cơ sở hoặc vài/nhiều cơ sở được Admin phân công; điều hành lịch tuần, nhân sự, bảng lương và GPS của đúng các cơ sở đó.
    - **Trưởng Ca:** Gắn chặt và chỉ phụ trách tại **ĐÚNG 1 CƠ SỞ CỐ ĐỊNH**, không điều hành chéo cơ sở khác.
    - **Nhân viên / Phó ca:** Biên chế theo cơ sở, đăng ký và làm ca theo cơ sở.
  - Tự động hóa xếp lịch ma trận tuần cho từng cơ sở (AutoScheduler) tránh trùng ca, thiếu định biên.
  - Chấm công điểm danh thông minh chống gian lận thông qua Geofence GPS của đúng cơ sở làm việc kết hợp Camera khuôn mặt và Watermark.
  - Tự động hóa tính bảng lương theo từng cơ sở và tổng hợp toàn chuỗi.
  - Tự động hóa truyền thông nội bộ theo từng nhóm Zalo cơ sở qua Zalo Personal Bot.

---

## 2. KIẾN TRÚC VẬN HÀNH TỔNG THỂ THEO CƠ SỞ

Quy trình tuần tự hóa khép kín theo phạm vi từng cơ sở:
```text
[1. Admin thiết lập danh mục Cơ sở & Phân quyền quản lý Store Scope]
                               │
                               ▼
[2. Quản lý / Phó ca mở cổng đăng ký ca tuần của Cơ sở]
                               │
                               ▼
[3. Nhân viên đăng ký nguyện vọng ca tuần tại Cơ sở của mình]
                               │
                               ▼
[4. AutoScheduler gợi ý ma trận ca tuần theo từng Cơ sở]
                               │
                               ▼
[5. Quản lý cơ sở duyệt lịch & Bot Zalo bắn lịch vào nhóm Cơ sở]
                               │
                               ▼
[6. Hàng ngày: Nhân viên check-in Camera + GPS khớp Geofence Cơ sở đó]
                               │
                               ▼
[7. Trưởng ca tại Cơ sở xác nhận, tích điểm danh & xử lý phát sinh]
                               │
                               ▼
[8. Hệ thống tính lương theo Cơ sở, báo cáo Quản lý & Admin toàn chuỗi]
```

---

## 3. CÁC PHÂN HỆ CỐT LÕI
1. **Phân hệ Quản trị Chuỗi Cơ Sở (Store Management):** Danh mục cơ sở, mã chi nhánh, tọa độ GPS quán, bán kính Geofencing (30m - 500m), cấu hình ca và phân quyền quản lý cơ sở.
2. **Phân hệ Nhân sự (Staff Management):** Hồ sơ, phân bổ cơ sở làm việc, cấp bậc, vị trí (Barista/Service), phân cấp quản lý theo phạm vi cơ sở.
3. **Phân hệ Xếp ca & Lịch làm (Scheduling):** Đăng ký ca tuần theo cơ sở, ma trận lịch tuần phân tách theo `store_id`, thuật toán AutoScheduler tối ưu cho từng cơ sở.
4. **Phân hệ Điểm danh (Attendance):** Nhận diện cơ sở làm việc, đo khoảng cách Geofence tới tọa độ GPS của đúng cơ sở đó, đóng dấu chìm ảnh chụp camera.
5. **Phân hệ Tiền lương (Salary):** Bảng lương theo từng cơ sở và tổng hợp toàn chuỗi, lương giờ, thưởng/phạt, phụ cấp ca gãy/trách nhiệm, bảo mật thông tin.
6. **Phân hệ Bot Zalo (Automation):** Quản lý phiên Zalo Web, gửi tin nhắn theo nhóm Zalo của từng cơ sở, cảnh báo ca trống theo cơ sở.
7. **Phân hệ Vật tư & Kho (Materials):** Kiểm kê nguyên vật liệu, định mức tồn kho và đề xuất nhập hàng phân lập theo từng cơ sở (Phó ca vật liệu phụ trách cơ sở đó).
