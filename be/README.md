# 🚀 ZONE 6 - BACKEND CHÍNH THỨC 100% NODE.JS (`be/`)

Toàn bộ luồng mã nguồn Backend của dự án đã được chuyển đổi hoàn toàn từ Python sang **Node.js (TypeScript)** theo chuẩn kiến trúc phân tầng sạch (Clean Role-Based & Feature-Based Architecture), phục vụ trực tiếp cho Frontend Next.js trên cổng **8000**.

---

## 🏛️ CẤU TRÚC PHÂN TẦNG VAI TRÒ CHỨC NĂNG

```text
be/
├── .env.example
├── package.json
├── tsconfig.json
├── src/
│   ├── config/                                # TẦNG CẤU HÌNH
│   │   └── env.config.ts                      # Cổng 8000, Sessions, TTL
│   ├── core/                                  # TẦNG DÙNG CHUNG CỐT LÕI
│   │   ├── crypto.ts                          # Mã hóa AES-256-GCM
│   │   ├── errors.ts                          # AppError, NotFound, Conflict, Validation
│   │   └── logger.ts                          # Structured Logger
│   ├── modules/
│   │   ├── subscription/                      # 1. PHÂN HỆ QUẢN LÝ GÓI (SUBSCRIPTION)
│   │   │   ├── schemas/                       # Zod DTOs & Response Interfaces
│   │   │   ├── repository/                    # SQLite Database Persistence
│   │   │   ├── services/                      # Business Logic & Conflict Detection
│   │   │   ├── controllers/                   # HTTP Controller Handlers
│   │   │   └── routes/                        # /api/v1/subscriptions
│   │   ├── scheduling/                        # 2. PHÂN HỆ XẾP LỊCH ZONE 6 (SCHEDULING)
│   │   │   ├── schemas/                       # DTOs: StaffRegistration, ScheduleMatrix
│   │   │   ├── engine/                        # AutoSchedulerEngine (Multi-Objective Optimization)
│   │   │   ├── services/                      # Excel parse & export styling (ExcelJS)
│   │   │   ├── controllers/                   # Upload, Auto-Assign, Export Excel
│   │   │   └── routes/                        # /api/v1/scheduling
│   │   └── zalo/                              # 3. PHÂN HỆ ZALO BOT (ZALO INTEGRATION)
│   │       ├── types/                         # Zalo interfaces & protocol types
│   │       ├── adapter/                       # zca-js dynamic loader & normalization
│   │       ├── session/                       # AES-256-GCM Session Storage
│   │       ├── listener/                      # WebSocket Listener & Exponential Backoff
│   │       ├── qr/                            # QR Code State Machine (120s TTL)
│   │       ├── sender/                        # Gửi tin nhắn & ảnh vào Group Zalo (Anti-Spam)
│   │       ├── schemas/                       # Zod Validation DTOs
│   │       ├── services/                      # Business Logic điều phối Zalo
│   │       └── controllers/                   # /api/v1/zalo
│   ├── routes/                                # TẦNG TỔNG HỢP ROUTER
│   │   └── index.ts                           # Mount tất cả các phân hệ v1
│   ├── middlewares/                           # TẦNG INTERCEPTORS
│   │   ├── error.middleware.ts                # Global Error Handling
│   │   └── validation.middleware.ts           # Zod Validation Middleware
│   ├── app.ts                                 # Khởi tạo Express App & Middlewares
│   └── server.ts                              # Entrypoint & Phục hồi phiên Zalo tự động
```

---

## 📡 TỔNG HỢP ENDPOINTS API (PORT 8000)

### 1. Phân hệ Gói dịch vụ (`/api/v1/subscriptions`)
* `GET /api/v1/subscriptions`: Danh sách phân trang, tìm kiếm & lọc trạng thái.
* `GET /api/v1/subscriptions/:id`: Chi tiết gói dịch vụ.
* `POST /api/v1/subscriptions`: Thêm mới gói (Zod validated, chống trùng tên).
* `PUT /api/v1/subscriptions/:id`: Cập nhật gói dịch vụ.
* `DELETE /api/v1/subscriptions/:id`: Xóa an toàn gói dịch vụ.

### 2. Phân hệ Xếp lịch làm việc (`/api/v1/scheduling`)
* `POST /api/v1/scheduling/upload`: Tải file Excel đăng ký ca ➔ Tự động phân bổ lịch.
* `POST /api/v1/scheduling/auto-assign`: Tối ưu hóa phân công lịch từ JSON payload.
* `POST /api/v1/scheduling/export-excel`: Xuất file Excel chuẩn format Zone 6 (dd"th"m, ca đêm, ca trống, thống kê số ca).
* `GET /api/v1/scheduling/sample-template`: Tải file Excel đăng ký mẫu.

### 3. Phân hệ Zalo Cá nhân (`/api/v1/zalo`)
* `POST /api/v1/zalo/login`: Sinh mã QR Base64 đăng nhập Zalo.
* `GET /api/v1/zalo/login/:id`: Thăm dò trạng thái quét mã QR.
* `DELETE /api/v1/zalo/login/:id`: Hủy phiên QR.
* `GET /api/v1/zalo/status`: Xem trạng thái tài khoản & WebSocket đang hoạt động.
* `POST /api/v1/zalo/send`: Bắn tin nhắn vào Group Zalo hoặc User.
* `POST /api/v1/zalo/send-image`: Bắn hình ảnh lịch làm việc vào Group Zalo.
* `POST /api/v1/zalo/logout`: Đăng xuất và dọn dẹp phiên làm việc.

---

## 🚀 KHỞI ĐỘNG HỆ THỐNG
* Chạy file `run.bat` ở thư mục gốc để khởi động đồng thời cả Backend (Port 8000) và Frontend Next.js (Port 3000).
* Hoặc chạy độc lập Backend:
  ```bash
  cd be
  npm run dev
  ```
