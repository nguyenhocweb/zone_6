# 🤖 LUỒNG 09: KẾT NỐI PHIÊN ZALO WEB, LƯU CẤU HÌNH & TỰ ĐỘNG GỬI TIN ĐA KÊNH NGHIỆP VỤ

---

## 1. SƠ ĐỒ TUẦN TỰ KẾT NỐI & ĐỊNH TUYẾN TIN NHẮN ZALO BOT

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Hệ Thống
    participant FE as Next.js (/zalo)
    participant API as Zalo API (Backend)
    participant ZCA as zca-js Service (Zalo Engine)
    participant ZaloServer as Máy chủ Zalo Web
    participant DB as MongoDB Atlas (zalo_configs & sessions)

    Admin->>FE: Truy cập /zalo (Độc quyền admin_he_thong)
    FE->>API: GET /api/v1/zalo/status (Kiểm tra phiên)
    alt Chưa có phiên
        API-->>FE: Trạng thái: Chưa kết nối
        FE->>API: GET /api/v1/zalo/qr
        API->>ZCA: Khởi tạo luồng quét QR đăng nhập
        ZCA->>ZaloServer: Xin mã QR xác thực phiên
        ZaloServer-->>ZCA: Trả về QR Code Image
        ZCA-->>API: Trả về QR Base64
        API-->>FE: Hiển thị mã QR lên giao diện ZaloQrLogin
        Admin->>FE: Dùng App Zalo trên điện thoại quét mã QR
        FE->>ZaloServer: Xác nhận đăng nhập từ điện thoại
        ZaloServer-->>ZCA: Đăng nhập thành công & cấp Session Cookies
        ZCA->>ZCA: Mã hóa Session bằng AES-256-GCM
        ZCA->>DB: Lưu Session mã hóa an toàn vào MongoDB Atlas
        FE-->>Admin: Báo xanh: "Đã kết nối Zalo Bot thành công"
    end

    Admin->>FE: Chọn cơ sở & Cấu hình 3 Nhóm Zalo riêng: Check-in, Nguyên liệu, Lịch tuần
    FE->>API: PUT /api/v1/zalo/config (store_id, channel_type, group_id, group_name)
    API->>DB: Lưu cấu hình từng kênh vào collection zalo_configs ({ store_id, channel_type })
    API-->>FE: Toast "Đã lưu cấu hình đa nhóm Zalo cho cơ sở"

    Note over API,ZCA: SỰ KIỆN PHÁT SINH TỰ ĐỘNG THEO NGHIỆP VỤ
    alt Sự kiện Điểm danh (Check-in trễ / Vắng ca)
        API->>DB: Lấy config { store_id, channel_type: 'CHECKIN' }
        API->>ZCA: Gửi ảnh selfie watermark + tọa độ vào Nhóm Điểm Danh
        ZCA->>ZaloServer: Bắn tin vào Nhóm Zalo Check-in
    else Sự kiện Vật liệu (Cạn nguyên liệu / Nhập kho)
        API->>DB: Lấy config { store_id, channel_type: 'MATERIAL' }
        API->>ZCA: Gửi danh sách nguyên liệu cạn vào Nhóm Vật Liệu
        ZCA->>ZaloServer: Bắn tin vào Nhóm Zalo Nguyên Liệu
    else Sự kiện Lịch tuần (Lịch chính thức được duyệt)
        API->>DB: Lấy config { store_id, channel_type: 'SCHEDULE' }
        API->>ZCA: Gửi ảnh bảng lịch tuần + danh sách ca vào Nhóm Lịch Tuần
        ZCA->>ZaloServer: Bắn tin vào Nhóm Zalo Lịch Tuần
    end
    API->>DB: Tự động cập nhật thời gian gửi cuối cùng (lastSentAt) của kênh
```

---

## 2. CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Bước 1: Bảo Mật Cấp Quyền Độc Quyền Admin (Zero-Trace Protection)
- Module Zalo Bot chỉ mở cổng duy nhất cho `admin_he_thong`.
- Khi bất kỳ tài khoản nào khác (kể cả Quản lý hay Trưởng ca) cố tình truy cập `/zalo`, Frontend tự động chuyển hướng ngay lập tức về `/schedule` và trả về `null`.
- Tầng Backend Express bảo vệ 100% routes `/api/v1/zalo/*` bằng middleware `requireRoles('admin_he_thong')`.

### Bước 2: Quét Mã QR & Duy Trì Phiên Đăng Nhập Duy Nhất
- Sử dụng thư viện `zca-js` để giả lập phiên đăng nhập Zalo Web. Hệ thống chỉ cần duy trì **1 phiên tài khoản Zalo Bot duy nhất** của Admin để gửi tin nhắn đến các nhóm khác nhau của mọi cơ sở trong toàn chuỗi.
- Sau khi Admin quét mã QR thành công, token và cookies phiên được mã hóa an toàn bằng thuật toán mã hóa đối xứng **AES-256-GCM** trước khi lưu vào MongoDB Atlas.
- Khi backend khởi động lại, hệ thống tự động giải mã session và tái kết nối ngầm mà Admin không cần phải quét lại mã QR.

### Bước 3: Lưu Trữ Cấu Hình Đa Kênh Nhóm Nghiệp Vụ (Multi-Channel Group Config)
- Cấu hình truyền thông được lưu bền vững vào MongoDB Atlas collection `zalo_configs` (model `ZaloConfig`) theo bộ đôi `{ store_id, channel_type }`:
  - `store_id`: ID của cơ sở tương ứng
  - `channel_type`: `CHECKIN`, `MATERIAL`, `SCHEDULE`, `GENERAL`
  - `group_id`: ID nhóm Zalo nội bộ phụ trách nghiệp vụ đó
  - `group_name`: Tên nhóm Zalo gợi nhớ
  - `template_message`: Mẫu tin nhắn định dạng riêng cho từng kênh
  - `is_active`: Bật / Tắt kích hoạt tự động gửi tin
- Giao diện Admin cung cấp Store Switcher để chọn cơ sở, sau đó hiển thị 3 khối cấu hình riêng biệt tương ứng cho 3 nhóm Zalo để Admin nhập Group ID độc lập.

### Bước 4: Tự Động Định Tuyến & Bắn Tin Đúng Nhóm Đích (Intelligent Event Dispatching)
- Hệ thống lắng nghe các sự kiện nghiệp vụ trong backend:
  1. **Khi có check-in trễ / vắng ca:** Trích xuất cấu hình `{ store_id, channel_type: 'CHECKIN' }` $\rightarrow$ Bắn ảnh chấm công và cảnh báo vào **Nhóm Điểm Danh**.
  2. **Khi Phó ca vật liệu báo hết hàng / yêu cầu nhập kho:** Trích xuất cấu hình `{ store_id, channel_type: 'MATERIAL' }` $\rightarrow$ Bắn danh sách hàng cạn vào **Nhóm Vật Liệu**.
  3. **Khi Lịch tuần được duyệt hoặc mở đăng ký:** Trích xuất cấu hình `{ store_id, channel_type: 'SCHEDULE' }` $\rightarrow$ Bắn ảnh bảng lịch tuần vào **Nhóm Lịch Tuần**.
- Các thông báo được phân luồng chính xác, không gây phiền toái hay loãng thông tin trong các nhóm khác.


