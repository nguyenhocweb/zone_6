# BỘ QUY CHUẨN KIẾN TRÚC TOÀN DIỆN CHO FULLSTACK (NODE.JS EXPRESS + NEXT.JS)
# Tech Stack Cốt Lõi: Node.js (Express.js + Zod + Mongoose/Prisma + TypeScript/ESM) & Next.js 14+ (App Router + React Query v5 + TypeScript)

Tài liệu này là "Hiến pháp Kỹ thuật" (Architectural Constitution) bắt buộc tuân thủ 100% đối với mọi AI Agent và lập trình viên trong workspace.

---

## 🏛️ 1. NGUYÊN TẮC CỐT LÕI (CORE TENETS)

### 1.1 Backend Node.js: Role-based Feature-Sliced Architecture with Granular SRP
- **Quy tắc phân rã CRUD triệt để:** CẤM TUYỆT ĐỐI gộp chung CRUD vào 1 file controller/service duy nhất. Mọi hành động được phân tách granular: `.create.`, `.get.`, `.update.`, `.delete.`, `.status.`, `.stats.`.
- **Phân tầng kỹ thuật 4 cấp:**
  $$\mathbf{Role\ (Vai\ trò)} \longrightarrow \mathbf{Feature\ (Chức\ năng)} \longrightarrow \mathbf{Layer\ (Tầng\ kỹ\ thuật)} \longrightarrow \mathbf{Action\ (CRUD\ chia\ nhỏ)}$$
  - `controllers/`: Chỉ tiếp nhận HTTP request, bọc `asyncHandler`, gọi Service và trả về response JSON. Không chứa logic hay DB query.
  - `services/`: Xử lý 100% logic nghiệp vụ, tính toán, ném Semantic Error (`NotFoundError`, `ConflictError`, `BadRequestError`...). Giao tiếp liên module theo nguyên tắc `Service -> Service`.
  - `repositories/`: Tương tác trực tiếp với Database qua Mongoose/Prisma.
  - `validators/`: Kiểm tra toàn bộ dữ liệu đầu vào bằng Zod schema qua `demoValidator`.
  - `*.router.js` (hoặc `*.router.ts`): Khai báo route, phân quyền role và gắn middleware.

### 1.2 Frontend Next.js: Role-based Feature-Sliced Design with Granular SRP
- **Cấu trúc phân tầng Feature-Sliced:**
  ```text
  fe/src/features/[role]/[feature]/
  ├── component/   # Các UI components chia nhỏ (List, CreateModal, UpdateModal, Stats)
  ├── hook/        # React Query hooks chia nhỏ (useGet..., useCreate..., useUpdate..., useDelete...)
  ├── service/     # HTTP calls qua axiosClient chuẩn ([feature].get.service.ts, ...)
  ├── schema/      # Zod validation schemas ([feature].create.schema.ts, ...)
  └── type/        # TypeScript interfaces & types ([feature].type.ts)
  ```
- **Phân định ranh giới Server Components (RSC) vs Client Components ("use client"):**
  - Mặc định các layout và page bao ngoài là Server Components để tối ưu SEO và streaming HTML.
  - Chỉ thêm chỉ thị `"use client"` ở các lá component tương tác (Form, Modal, Table có state, Nút bấm có onClick).
  - Tận dụng `HydrationBoundary` và `dehydrate(queryClient)` khi cần prefetch dữ liệu tại Server.

---

## 🧱 2. HẠ TẦNG DÙNG CHUNG CỐT LÕI (`config/` VÀ `core/`)

```text
be/src/
├── config/                                             # [CẤU HÌNH HỆ THỐNG & 3RD PARTIES]
│   ├── app.config.js                                   # Cấu hình PORT, NODE_ENV, APP_URL, CORS
│   ├── cloudinary.config.js                            # Cấu hình Cloudinary SDK
│   ├── loginAuth.config.js                             # Cấu hình JWT
│   └── database.config.js                              # Cấu hình MongoDB Atlas (Database: zone_6)
│
├── core/                                               # [HẠ TẦNG DÙNG CHUNG TOÀN ỨNG DỤNG]
│   ├── middlewares/                                    # authenticateToken, authorizeRole, validator, error, cors, upload
│   ├── utils/                                          # asyncHandler, validator (demoValidator), authUtils, geofence
│   └── constants/                                      # Status_code, Messages, Custom Errors (ConflictError, NotFoundError...)
```

---

## ⚡ 3. LUỒNG DỮ LIỆU CHUẨN ĐỒNG BỘ 2 CHIỀU (DATA FLOW PIPELINE)

```text
[Browser User]
     │
     ▼
[Next.js Client Component] ──(Zod Validate Form Client-side)
     │
     ▼
[Custom React Query Hook] ──(Check staleTime: 60s / QueryKey)
     │
     ▼
[Axios Service Layer] ──(Bearer JWT Cookie / Header Interceptor)
     │
     ▼ [HTTP Request: JSON payload]
     │
[Express Route & Middleware] ──(validator.middleware.js, authenticateToken, authorizeRole)
     │
     ▼
[Granular Controller] ──(asyncHandler: Bắt unhandled rejection)
     │
     ▼
[Granular Service] ──(100% Business Logic, ném Custom Error)
     │
     ▼
[Granular Repository] ──(Database Query Mongoose/Prisma)
     │
     ▼
[MongoDB Atlas (Database: zone_6)]
```

---

## 🚫 4. CÁC ĐIỀU CẤM KỴ TUYỆT ĐỐI

1. **CẤM gộp CRUD:** Không được tạo file kiểu `user.controller.js` hay `user.service.js`. Bắt buộc tách nhỏ thành `.create.`, `.get.`, `.update.`, `.delete.`, `.status.`, `.stats.`.
2. **CẤM gọi Database từ Controller hoặc Service:** Chỉ duy nhất thư mục `repositories/` (hoặc `*.repo.js`) được phép thao tác trực tiếp với Database.
3. **CẤM dùng try...catch trong Controller:** Mọi controller phải được bọc trong `asyncHandler`. Toàn bộ lỗi phải ném từ tầng Service qua các lớp `Error` chuẩn (`ConflictError`, `NotFoundError`, `BadRequestError`, `ForbiddenError`).
4. **CẤM gọi chéo Controller giữa các module:** Giao tiếp liên module bắt buộc phải là Service gọi Service (`service -> service`).

---

## 🧠 5. BỘ NHỚ NGOÀI & THEO DÕI TRẠNG THÁI (.agents/)

- Mọi bảng CSDL mới tạo phải được đăng ký vào [`.agents/DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).
- Mọi React Query key mới phải được tra cứu và đăng ký vào [`.agents/REACT_QUERY_REGISTRY.md`](./REACT_QUERY_REGISTRY.md).
- Trạng thái công việc mỗi phiên làm việc được lưu tại [`.agents/session_state.json`](./session_state.json).
- Toàn bộ quy chuẩn chi tiết của Backend Express được lưu tại [`.agents/rules/backend_express_rules.md`](./rules/backend_express_rules.md).
- Toàn bộ quy chuẩn cơ sở dữ liệu Prisma MongoDB đa file & Seed Pipeline được lưu tại [`.agents/rules/prisma_mongo_database_rules.md`](./rules/prisma_mongo_database_rules.md).

---

## 🏛️ 6. QUY CHUẨN ĐỒNG BỘ TÌNH TRẠNG VỚI TÀI LIỆU GỐC (`plane/`) [BẮT BUỘC 100%]

> **NGUYÊN TẮC TỐI CAO:** Thư mục `plane/` là **Single Source of Truth** về nghiệp vụ, vai trò, chức năng và luồng vận hành của toàn bộ hệ thống Zone Six. Mọi AI Agent và lập trình viên trong workspace BẮT BUỘC phải tuân thủ quy trình 3 bước sau đây mỗi khi can thiệp mã nguồn:

### 6.1 Trước Khi Viết Code (Pre-flight Verification)
1. **Kiểm tra Vai Trò (`plane/vai_tro/`):** Nắm rõ quyền hạn, giới hạn giao diện và các điều cấm kỵ của từng vai trò liên quan (đặc biệt: Phó ca làm lịch bị ẩn dấu tích điểm danh và ẩn bảng lương; Zalo Bot là độc quyền của Admin).
2. **Kiểm tra Mô Tả Chức Năng (`plane/chuc_nang/`):** Đọc kỹ tài liệu chức năng tương ứng (CN01 $\rightarrow$ CN11) để nắm đúng Input, Output, API endpoints và Business Rules.
3. **Kiểm tra Luồng Hoạt Động (`plane/luong_hoat_dong/`):** Nắm đúng trình tự các bước thực thi, sơ đồ tuần tự và cơ chế xử lý lỗi/rollback.

### 6.2 Sau Khi Viết Code (Post-coding Audit & Status Update) [BẮT BUỘC]
Ngay sau khi viết code, sửa logic hoặc điều chỉnh DB/API thành công, BẮT BUỘC phải thực hiện 3 hành động:
1. **Cập nhật Bảng Tiến Độ Chức Năng:** Mở file [`plane/giam_sat/tien_do_chuc_nang.md`](../plane/giam_sat/tien_do_chuc_nang.md), cập nhật trạng thái (`✅ ĐÃ HOÀN THÀNH`, `⏳ ĐANG LÀM`, `📌 KẾ HOẠCH`), danh sách file BE/FE liên quan và ngày cập nhật.
2. **Ghi Nhật Ký Kiểm Toán (Audit Log):** Thêm 1 bản ghi mới vào đầu file [`plane/giam_sat/nhat_ky_cap_nhat.md`](../plane/giam_sat/nhat_ky_cap_nhat.md) ghi rõ ngày giờ, mã chức năng, danh sách tệp thay đổi và nội dung tóm tắt.
3. **Cập nhật Bộ Nhớ Phiên:** Bổ sung tác vụ đã hoàn thành vào `completed_tasks` trong [`.agents/session_state.json`](./session_state.json) và cập nhật `last_updated`.

**NGHIÊM CẤM:** Kết thúc phiên làm việc mà không cập nhật tình trạng vào `plane/giam_sat/`!

