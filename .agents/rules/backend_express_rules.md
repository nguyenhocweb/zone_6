# CHUẨN MỰC KIẾN TRÚC BACKEND (EXPRESS.JS + PRISMA/MONGOOSE + ZOD)
## Mô hình: Role-based Feature-Sliced Architecture with Granular SRP

Tài liệu này là quy chuẩn bắt buộc khi tạo mới hoặc bảo trì các module và thành phần hạ tầng Backend trong thư mục `be/src/` (hoặc `backend/src/`).

---

## 🏛️ 1. NGUYÊN TẮC PHÂN CẤP TỔ CHỨC THƯ MỤC

$$\mathbf{Role\ (Vai\ trò)} \longrightarrow \mathbf{Feature\ (Chức\ năng)} \longrightarrow \mathbf{Layer\ (Tầng\ kỹ\ thuật)} \longrightarrow \mathbf{Action\ (CRUD\ chia\ nhỏ)}$$

1. **Cấp 1 - Role (Vai trò hệ thống):**
   - `system_admin`: Quản trị viên hệ thống cấp cao.
   - `restaurant_manager`: Quản lý nhà hàng / chi nhánh.
   - `brand_owner`: Chủ thương hiệu chuỗi nhà hàng.
   - `staff`: Nhân viên phục vụ, thu ngân, barista, pha chế.
   - `customer`: Khách hàng sử dụng dịch vụ.
   - `public`: Các endpoint công khai không cần đăng nhập.
   - `shared`: Module dùng chung (auth, notifications, cloudinary, llm, vector).
2. **Cấp 2 - Feature (Nghiệp vụ độc lập):**
   - Mỗi nghiệp vụ là một thư mục độc lập (ví dụ: `subscription`, `review`, `reservation`, `menu_item`, `scheduling`, `attendance`, `zalo`).
3. **Cấp 3 - Layer (Mối quan tâm kỹ thuật):**
   - `controllers/`: Tiếp nhận HTTP request, gọi Service và trả về JSON.
   - `services/`: Chứa 100% logic nghiệp vụ và tính toán.
   - `repositories/`: Tương tác trực tiếp với cơ sở dữ liệu (Prisma / Mongoose Client).
   - `validators/`: Kiểm tra tính hợp lệ của dữ liệu đầu vào bằng Zod.
   - `*.router.js` (hoặc `*.router.ts`): Khai báo route, phân quyền và gắn middleware.
4. **Cấp 4 - Action (CRUD chia nhỏ theo Single Responsibility Principle):**
   - **CẤM TUYỆT ĐỐI GỘP CRUD VÀO 1 FILE**. Mỗi hành động phải là 1 file độc lập: `.create.`, `.get.`, `.update.`, `.delete.`, `.status.`, `.stats.`, `.reply.`.

---

## 🧱 2. CẤU TRÚC HẠ TẦNG CỐT LÕI: `config/` VÀ `core/`

Toàn bộ hạ tầng kỹ thuật dùng chung của hệ thống được tổ chức chặt chẽ trong 2 thư mục cốt lõi: `src/config/` và `src/core/`.

### 🌳 Cây cấu trúc chi tiết của `config/` và `core/`:

```text
be/src/
├── config/                                             # [CẤU HÌNH HỆ THỐNG & 3RD PARTIES]
│   ├── app.config.js                                   # Cấu hình PORT, NODE_ENV, APP_URL, CORS origins
│   ├── cloudinary.config.js                            # Cấu hình Cloudinary SDK (cloud_name, api_key, secret)
│   ├── loginAuth.config.js                             # Cấu hình JWT (Secret, Access/Refresh Token Expiry)
│   ├── passport.config.js                              # Cấu hình Passport Google OAuth2 Strategy
│   ├── ai.config.js                                    # Cấu hình AI Engine (Gemini / OpenAI API Keys & Models)
│   ├── pinecone.config.js                              # Cấu hình Vector Database Pinecone (AI Embeddings)
│   ├── prisma.config.js / database.config.js           # Cấu hình Database connection pool & logs
│   └── locales.js                                      # Cấu hình đa ngôn ngữ hệ thống
│
├── core/                                               # [HẠ TẦNG DÙNG CHUNG TOÀN ỨNG DỤNG]
│   ├── middlewares/                                    # CÁC MIDDLEWARE XỬ LÝ REQUEST CỦA EXPRESS
│   │   ├── authenticateToken.js                        # Xác thực Access Token JWT từ Header/Cookie
│   │   ├── authorizeRole.middleware.js                 # Phân quyền dựa trên Role tiếng Việt ("Admin",...)
│   │   ├── authorizePermission.middleware.js           # Phân quyền chi tiết theo bảng Permission
│   │   ├── validator.middleware.js                     # Middleware Zod validate (body, query, params)
│   │   ├── error.middleware.js                         # Global Error Handler bắt mọi lỗi và trả JSON
│   │   ├── cors.middlewares.js                         # Cấu hình CORS an toàn theo whitelist
│   │   ├── upload.middleware.js                        # Multer memory storage xử lý file tạm
│   │   ├── verifyApiKey.middleware.js                  # Kiểm tra API Key cho các webhook/kiosk
│   │   └── requireFeature.middleware.js                # Chặn tính năng nếu gói subscription chưa kích hoạt
│   │
│   ├── utils/                                          # HÀM TIỆN ÍCH CỐT LÕI (UTILITY FUNCTIONS)
│   │   ├── asyncHandler.js                             # [BẮT BUỘC] Bọc Controller bắt unhandled rejection
│   │   ├── validator.js                                # [BẮT BUỘC] Bộ thư viện mẫu demoValidator cho Zod
│   │   ├── authUtils.js                                # Tạo Access Token, Refresh Token, Hash Token
│   │   ├── bcrypt.js                                   # Mã hóa và so sánh mật khẩu (bcrypt hash)
│   │   ├── cookie.utils.js                             # Đọc/ghi HTTP-Only Cookies an toàn
│   │   ├── cloudinary.js                               # Tạo chữ ký (sign_request) upload trực tiếp FE
│   │   ├── socket.js                                   # Khởi tạo Socket.IO instance & realtime events
│   │   ├── payos.util.js                               # Tạo link thanh toán PayOS & verify webhook
│   │   ├── Create_chuoi.js                             # Tiện ích sinh chuỗi ngẫu nhiên (Slug, Code)
│   │   └── Create_id.js                                # Tiện ích sinh ObjectId MongoDB hợp lệ
│   │
│   ├── constants/                                      # HẰNG SỐ VÀ HỆ THỐNG LỖI CHUẨN HÓA
│   │   ├── Status_code.js                              # HTTP Status Codes (200, 201, 400, 401, 403, 404, 409, 500)
│   │   ├── Messages.js                                 # Chuỗi thông báo hệ thống chuẩn
│   │   └── error/                                      # CÁC LỚP LỖI TÙY BIẾN (CUSTOM ERROR CLASSES)
│   │       ├── index.js                                # Export ConflictError, NotFoundError, BadRequestError...
│   │       ├── ConflictError.js                        # 409 Conflict (Trùng tên, trùng email)
│   │       ├── NotFoundError.js                        # 404 Not Found (Không tìm thấy bản ghi)
│   │       ├── BadRequestError.js                      # 400 Bad Request (Dữ liệu không hợp lệ)
│   │       ├── ForbiddenError.js                       # 403 Forbidden (Không đủ quyền truy cập)
│   │       └── UnauthorizedError.js                    # 401 Unauthorized (Chưa đăng nhập / Token hết hạn)
│   │
│   ├── services/                                       # DỊCH VỤ HẠ TẦNG TOÀN CỤC
│   │   ├── aiKeyResolver.service.js                    # Quản lý & cân bằng tải API Key AI
│   │   └── payment/                                    # Module tích hợp cổng thanh toán (PayOS, VNPay)
│   │
│   └── cron/                                           # TÁC VỤ NỀN ĐỊNH KỲ (SCHEDULED CRON JOBS)
│       ├── cleanupExpiredVouchers.cron.js              # Tự động quét voucher hết hạn
│       └── aggregateDailyRevenue.cron.js               # Tổng hợp doanh thu cuối ngày
```

---

## 📂 3. CÂY CẤU TRÚC THƯ MỤC MODULES RIÊNG THEO ROLE (Ví dụ: `subscription` thuộc `system_admin`)

```text
be/src/modules/system_admin/
├── subscription/                                       # [CẤP 2] Tên nghiệp vụ
│   ├── controllers/                                    # [CẤP 3] Tầng Controller
│   │   ├── subscription.create.controller.js           # [CẤP 4] POST /api/v1/system_admin/subscription
│   │   ├── subscription.get.controller.js              # [CẤP 4] GET  /api/v1/system_admin/subscription
│   │   ├── subscription.update.controller.js           # [CẤP 4] PUT  /api/v1/system_admin/subscription/:id
│   │   ├── subscription.delete.controller.js           # [CẤP 4] DELETE /api/v1/system_admin/subscription/:id
│   │   ├── subscription.status.controller.js           # [CẤP 4] PATCH /api/v1/system_admin/subscription/:id/status
│   │   └── subscription.stats.controller.js            # [CẤP 4] GET  /api/v1/system_admin/subscription/stats
│   │
│   ├── services/                                       # [CẤP 3] Tầng Service
│   │   ├── subscription.create.service.js              # [CẤP 4] Logic tạo mới & validate trùng
│   │   ├── subscription.get.service.js                 # [CẤP 4] Logic lấy danh sách & phân trang
│   │   ├── subscription.update.service.js              # [CẤP 4] Logic cập nhật thông tin
│   │   ├── subscription.delete.service.js              # [CẤP 4] Logic xóa & kiểm tra ràng buộc FK
│   │   ├── subscription.status.service.js              # [CẤP 4] Logic bật/tắt active
│   │   └── subscription.stats.service.js               # [CẤP 4] Logic tính toán KPI doanh thu
│   │
│   ├── repositories/                                   # [CẤP 3] Tầng Repository (Prisma/Mongoose)
│   │   ├── subscription.create.repo.js                 # [CẤP 4] prisma.subscription.create() / Model.create()
│   │   ├── subscription.get.repo.js                    # [CẤP 4] prisma.subscription.findMany() / Model.find()
│   │   ├── subscription.update.repo.js                 # [CẤP 4] prisma.subscription.update() / Model.findByIdAndUpdate()
│   │   ├── subscription.delete.repo.js                 # [CẤP 4] prisma.subscription.delete() / Model.findByIdAndDelete()
│   │   ├── subscription.status.repo.js                 # [CẤP 4] prisma.subscription.update({ status })
│   │   └── subscription.stats.repo.js                  # [CẤP 4] prisma.subscription.aggregate()
│   │
│   ├── validators/                                     # [CẤP 3] Tầng Validator (Zod)
│   │   ├── subscription.create.validator.js            # [CẤP 4] Zod schema body tạo mới
│   │   ├── subscription.get.validator.js               # [CẤP 4] Zod schema query params
│   │   ├── subscription.update.validator.js            # [CẤP 4] Zod schema body cập nhật
│   │   └── subscription.status.validator.js            # [CẤP 4] Zod schema toggle status
│   │
│   └── subscription.router.js                          # Router nội bộ gắn middleware & controller
│
└── system_admin.router.js                              # Router tổng gom các router con của role
```

---

## 🌐 4. CẤU TRÚC THƯ MỤC CHỨC NĂNG DÙNG CHUNG (SHARED MODULES)

Khi một tính năng nghiệp vụ được **nhiều Role khác nhau cùng sử dụng** (hoặc phục vụ toàn bộ hệ thống), thay vì copy-paste code trùng lặp vào từng role (vi phạm nguyên tắc DRY - Don't Repeat Yourself), tính năng đó bắt buộc phải được đặt trong thư mục:
`be/src/modules/shared/[feature_name]/`

### 4.1. Bảng phân định ranh giới: `core/` vs `modules/shared/` vs `modules/[role]/`

| Tiêu chí phân định | `be/src/core/` | `be/src/modules/shared/` | `be/src/modules/[role]/` |
| :--- | :--- | :--- | :--- |
| **Bản chất** | Hạ tầng kỹ thuật (Technical Infra) | Nghiệp vụ dùng chung (Shared Business Feature) | Nghiệp vụ đặc thù (Role-Specific Feature) |
| **Chứa DB Model?** | **KHÔNG**. Không chứa Prisma/Mongoose query nghiệp vụ. | **CÓ**. Tương tác với CSDL (Notification, Media, User, Zalo). | **CÓ**. Tương tác với CSDL riêng của Role. |
| **Phạm vi dùng** | Toàn bộ ứng dụng (Middlewares, Utils, Errors). | Nhiều Role cùng gọi (Admin, Manager, Staff, Customer). | Chỉ duy nhất 1 Role có quyền gọi. |
| **Ví dụ cụ thể** | `asyncHandler.js`, `validator.js`, JWT verify, Socket Server. | `notifications/`, `cloudinary/`, `auth/`, `llm/`, `vector/`, `zalo/`. | `subscription/` (chỉ Admin), `reservations/` (chỉ Nhà hàng), `attendance/` (Staff & Manager). |

---

### 4.2. Cây cấu trúc chi tiết thư mục `modules/shared/` (Ví dụ: `notifications` & `cloudinary`)

Tương tự như module của Role, các module dùng chung vẫn tuân thủ triệt để nguyên tắc phân rã SRP theo CRUD:

```text
be/src/modules/shared/
├── notifications/                                      # Chức năng thông báo đa kênh toàn hệ thống
│   ├── controllers/
│   │   ├── notification.get.controller.js              # Lấy thông báo theo userId & role của người dùng
│   │   ├── notification.read.controller.js             # Đánh dấu 1 hoặc tất cả thông báo đã đọc
│   │   └── notification.delete.controller.js           # Xóa thông báo khỏi danh sách
│   │
│   ├── services/
│   │   ├── notification.get.service.js                 # Lọc thông báo chưa đọc, phân trang
│   │   ├── notification.create.service.js              # [RẤT QUAN TRỌNG] Hàm tạo thông báo nội bộ để các module khác gọi
│   │   ├── notification.read.service.js                # Cập nhật isRead = true
│   │   └── notification.delete.service.js              # Xóa thông báo
│   │
│   ├── repositories/
│   │   ├── notification.get.repo.js                    # findMany({ where: { userId } })
│   │   ├── notification.create.repo.js                 # create()
│   │   ├── notification.update.repo.js                 # updateMany()
│   │   └── notification.delete.repo.js                 # delete()
│   │
│   ├── validators/
│   │   ├── notification.get.validator.js               # Validate query filter thông báo
│   │   └── notification.read.validator.js              # Validate param id thông báo
│   │
│   └── notification.router.js                          # Router dùng chung (gắn middleware authenticateToken)
│
├── cloudinary/                                         # Dịch vụ upload ảnh ký số (Signed Upload) dùng chung
│   ├── controllers/
│   │   └── cloudinary.sign.controller.js               # API sinh chữ ký upload cho FE
│   ├── services/
│   │   └── cloudinary.sign.service.js                  # Logic tạo timestamp, folder path, signature
│   ├── validators/
│   │   └── cloudinary.sign.validator.js                # Validate query: folder, public_id
│   └── cloudinary.router.js                            # GET /api/v1/shared/cloudinary/image
│
├── llm/                                                # Dịch vụ AI Chatbot & Agent dùng chung
│   ├── controllers/
│   ├── services/
│   └── llm.router.js
│
├── vector/                                             # Dịch vụ nhúng Embeddings & tìm kiếm ngữ nghĩa
│   ├── services/
│   └── vector.router.js
│
└── shared.router.js                                    # Router tổng gom các router của modules/shared
```

---

### 4.3. Quy tắc giao tiếp liên Module (Inter-Module Communication Rule)

Khi một Module của Role (ví dụ: `restaurant_manager/order`) muốn kích hoạt một tính năng dùng chung (ví dụ: tạo thông báo cho khách hàng sau khi tạo đơn):

* ✅ **ĐÚNG (Service gọi Service):**
  Trong file `order.create.service.js`, import trực tiếp hàm từ service của `shared`:
  ```javascript
  import { createNotificationService } from "../../shared/notifications/services/notification.create.service.js";

  export const createOrderService = async (payload) => {
    // 1. Tạo đơn hàng trong DB thông qua Repository
    const newOrder = await createOrderRepo(payload);

    // 2. Kích hoạt thông báo dùng chung
    await createNotificationService({
      userId: payload.customerId,
      title: "Đơn hàng đã được tiếp nhận",
      content: `Đơn hàng #${newOrder.id} của bạn đang được bếp chuẩn bị.`,
      type: "ORDER_UPDATE"
    });

    return newOrder;
  };
  ```

* ❌ **SAI (Cấm kỵ tuyệt đối):**
  1. **CẤM gọi chéo Controller:** Không bao giờ import `notification.create.controller.js` sang module khác. Controller chỉ giao tiếp với Client qua HTTP request.
  2. **CẤM gọi chéo Repository bỏ qua Service:** Module `order` không được tự tiện gọi `notification.create.repo.js` vì sẽ làm bỏ sót logic validation, ghi log kiểm toán và bắn realtime qua Socket.IO của Notification Service.

---

## 🏷️ 5. TỪ ĐIỂN ĐẶT TÊN FILE DÀNH CHO NODE.JS (NAMING CONVENTIONS)

Quy tắc đặt tên file trong toàn bộ dự án Node.js sử dụng phong cách **kebab-case** hoặc **dot-separated (dấu chấm phân tách rõ vai trò kỹ thuật)**. Đuôi file luôn là `.js` hoặc `.ts` (ES Modules).

### 5.1. Quy chuẩn file trong Module Nghiệp vụ (`modules/[role]/[feature]/` hoặc `modules/shared/[feature]/`):

| Tầng kỹ thuật | Quy tắc đặt tên file Node.js | Ví dụ cụ thể | Tên hàm/export tương ứng |
| :--- | :--- | :--- | :--- |
| **Controller** | `[feature].[action].controller.js` | `subscription.create.controller.js`<br>`notification.read.controller.js`<br>`order.stats.controller.js` | `export const createSubscriptionController = asyncHandler(...)`<br>`export const markAsReadNotificationController = asyncHandler(...)` |
| **Service** | `[feature].[action].service.js` | `subscription.create.service.js`<br>`notification.create.service.js`<br>`order.stats.service.js` | `export const createSubscriptionService = async (...)`<br>`export const createNotificationService = async (...)` |
| **Repository** | `[feature].[action].repo.js` | `subscription.create.repo.js`<br>`notification.get.repo.js`<br>`order.stats.repo.js` | `export const createSubscriptionRepo = async (...)`<br>`export const getNotificationRepo = async (...)` |
| **Validator** | `[feature].[action].validator.js` | `subscription.create.validator.js`<br>`notification.read.validator.js`<br>`order.get.validator.js` | `export const createSubscriptionValidator = { body: ... }`<br>`export const readNotificationValidator = { params: ... }` |
| **Router con** | `[feature].router.js` | `subscription.router.js`<br>`notification.router.js`<br>`cloudinary.router.js` | `const router = express.Router(); export default router;` |
| **Router Role** | `[role].router.js` | `system_admin.router.js`<br>`shared.router.js` | `const router = express.Router(); export default router;` |

---

### 5.2. Quy chuẩn file trong `config/` và `core/`:

| Danh mục | Quy tắc đặt tên file | Ví dụ trong dự án | Ghi chú & Trách nhiệm |
| :--- | :--- | :--- | :--- |
| **Config** | `[service].config.js` | `app.config.js`<br>`cloudinary.config.js`<br>`loginAuth.config.js` | Đọc `process.env`, có fallback mặc định, export object cấu hình cố định. |
| **Middleware** | `[name].middleware.js` | `auth.middleware.js`<br>`validator.middleware.js`<br>`error.middleware.js` | Middleware của Express xử lý `(req, res, next)`. |
| **Utility** | `[name].js` hoặc `[name].util.js` | `asyncHandler.js`<br>`validator.js`<br>`cookie.utils.js`<br>`payos.util.js` | Hàm thuần túy dùng chung toàn hệ thống. |
| **Custom Error** | `[Type]Error.js` | `ConflictError.js`<br>`NotFoundError.js`<br>`BadRequestError.js`<br>`ForbiddenError.js` | Kế thừa từ `Error` class với mã status code cố định. |
| **Constants** | `[name].js` hoặc `[name].constant.js` | `Status_code.js`<br>`Messages.js` | Hằng số hệ thống, chuỗi không đổi. |
| **Cron Job** | `[taskName].cron.js` | `cleanupExpiredVouchers.cron.js` | Tác vụ chạy ngầm định kỳ bằng node-cron. |

---

## ⚙️ 6. QUY CHUẨN CODE MẪU CHO TỪNG THÀNH PHẦN

### A. Config File (`config/cloudinary.config.js`)
```javascript
import dotenv from "dotenv";
dotenv.config();

export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  folder_root: "quan_ly_nha_hang"
};
```

### B. Global Error Handler Middleware (`core/middlewares/error.middleware.js`)
```javascript
import { StatusCodes } from "../constants/Status_code.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Đã xảy ra lỗi nội bộ máy chủ";

  console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`);

  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
```

### C. Async Handler Wrapper (`core/utils/asyncHandler.js`)
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
```

### D. Custom Error Class (`core/constants/error/ConflictError.js`)
```javascript
import { StatusCodes } from "../Status_code.js";

export class ConflictError extends Error {
  constructor(message = "Dữ liệu bị xung đột hoặc đã tồn tại") {
    super(message);
    this.name = "ConflictError";
    this.statusCode = StatusCodes.CONFLICT; // 409
  }
}
```

### E. Validator Template (`core/utils/validator.js`)
```javascript
import { z } from "zod";

export const demoValidator = {
  chuoi: (tenTruong = "Trường này") =>
    z.string({ required_error: `${tenTruong} không được để trống` })
     .trim()
     .min(1, `${tenTruong} không được để trống`),

  soDuong: (tenTruong = "Số") =>
    z.number({ required_error: `${tenTruong} không được để trống` })
     .positive(`${tenTruong} phải lớn hơn 0`),

  soDienThoai: () =>
    z.string()
     .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không đúng định dạng Việt Nam"),

  email: () =>
    z.string().email("Địa chỉ Email không đúng định dạng")
};
```

---

## 🚫 7. CÁC ĐIỀU CẤM KỴ TUYỆT ĐỐI Ở BACKEND NODE.JS

1. **CẤM gộp CRUD:** Không được tạo file kiểu `subscription.controller.js` hay `subscription.service.js`. Bắt buộc tách nhỏ thành `.create.`, `.get.`, `.update.`, `.delete.`.
2. **CẤM import Database/ORM bừa bãi:** Phải luôn import instance quản lý kết nối tập trung từ `databases/` hoặc `core/database.js`. Không tự ý tạo kết nối mới rải rác.
3. **CẤM gọi Database từ Controller hoặc Service:** Chỉ duy nhất thư mục `repositories/` (hoặc `*.repo.js`) được phép thao tác trực tiếp với Database/ORM.
4. **CẤM dùng try...catch trong Controller:** Mọi controller phải được bọc trong `asyncHandler`. Toàn bộ lỗi phải ném từ tầng Service qua các lớp `Error` chuẩn (`ConflictError`, `NotFoundError`, `BadRequestError`, `ForbiddenError`).
5. **CẤM Hardcode credentials trong code:** Mọi token, secret, URL, key bắt buộc đọc từ `process.env` thông qua thư mục `src/config/`.
6. **CẤM tự viết lại validation regex:** Mọi validation thông dụng (chuỗi, số dương, SĐT, email) bắt buộc phải dùng `demoValidator` trong `src/core/utils/validator.js`.
7. **CẤM Hardcode chuỗi Role tiếng Anh bừa bãi:** Bắt buộc tuân thủ đúng định danh chuẩn: `"Admin"`, `"Quản lý thương hiệu"`, `"Quản lý nhà hàng"`, `"Nhân viên"`, `"Khách hàng"` hoặc enum tương ứng.
8. **CẤM gọi chéo Controller giữa các module:** Khi một module cần gọi chức năng của module khác (ví dụ: tạo thông báo), BẮT BUỘC Service gọi Service (`service -> service`), không bao giờ gọi Controller.
