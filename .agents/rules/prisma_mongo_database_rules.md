# CHUẨN MỰC KIẾN TRÚC CƠ SỞ DỮ LIỆU & QUY TRÌNH SEED DỮ LIỆU
## (Prisma Multi-File Schema, JSON Data Stores & Master Orchestrator Pipeline)

Tài liệu này quy định cấu trúc thiết kế bảng CSDL, lưu trữ dữ liệu mẫu (JSON) và quy trình tự động hóa Xóa - Khởi tạo - Nạp dữ liệu trong thư mục `be/src/databases/` (hoặc `backend/src/databases/`).

---

## 🏛️ 1. NGUYÊN TẮC CỐT LÕI (DATABASE DESIGN & SEED PIPELINE)

1. **Mỗi Table / Model là 1 file `.prisma` riêng biệt:** Tuyệt đối không nhồi nhét hàng chục model vào 1 file `schema.prisma` khổng lồ. Mọi bảng phải được module hóa độc lập trong `src/databases/prisma/schema/`.
2. **Enum tập trung:** Toàn bộ enums của hệ thống được quy tụ tại `enum.prisma`. Khi đọc hoặc tạo model, luôn tra cứu file enum này trước.
3. **Phân tách dữ liệu sẵn (JSON Data Store):** Dữ liệu mẫu thực tế được lưu dưới dạng file `.json` hoặc script `generate_*.js` trong `src/databases/seed/data/`.
4. **Thực thi phân tầng có thứ tự phụ thuộc (Dependency-Driven Runners):** Các script nạp dữ liệu được đánh số từ `00-` đến `09-` theo thứ tự từ bảng cha (Roles, Users) đến bảng con (Schedules, Shifts, Attendances, Subscriptions).
5. **Cơ chế Dọn dẹp & Tái tạo an toàn (Clean & Seed Orchestrator):** Có file điều phối chính (`index.js` hoặc `index.ts`) tự động dọn dẹp dữ liệu cũ theo đúng chiều ngược lại, sau đó nạp dữ liệu mới tuần tự.

---

## 📂 2. CÂY CẤU TRÚC THƯ MỤC CƠ SỞ DỮ LIỆU

```text
be/src/databases/
├── init.mongodb.js                                     # Khởi tạo instance Prisma kết nối MongoDB
├── init.redis.js                                       # Khởi tạo kết nối Redis Cache
│
├── prisma/                                             # [TẦNG 1] CẤU TRÚC ĐẶC TẢ BẢNG (SCHEMAS)
│   ├── generated/                                      # Mã nguồn Prisma Client tự động sinh
│   └── schema/                                         # THƯ MỤC CHỨA TỪNG BẢNG RIÊNG BIỆT
│       ├── base.prisma                                 # Cấu hình datasource & generator client
│       ├── enum.prisma                                 # Toàn bộ Enums của hệ thống (Role, Status,...)
│       ├── Users.prisma                                # Model Người dùng / Nhân viên (Admin, Manager, Staff)
│       ├── weekly_schedule.prisma                      # Model Lịch làm việc tuần
│       ├── shift_assignment.prisma                     # Model Chi tiết phân ca làm việc
│       ├── attendance.prisma                           # Model Chấm công (GPS, Ảnh Selfie, Lương)
│       ├── store_config.prisma                         # Model Cấu hình tọa độ quán & Geofencing
│       ├── subscription_plan.prisma                    # Model Gói dịch vụ & Đăng ký
│       └── [table_name].prisma                         # Mỗi bảng tương ứng là 1 file độc lập
│
└── seed/                                               # [TẦNG 2] HỆ THỐNG DỮ LIỆU MẪU & SEEDING PIPELINE
    ├── data/                                           # KHO DỮ LIỆU SẴN (JSON & GENERATORS)
    │   ├── system_master_data.json                     # Dữ liệu mẫu cấu hình hệ thống & roles
    │   ├── users.json                                  # Dữ liệu nhân viên mẫu, mã QR & mức lương
    │   ├── schedules.json                              # Dữ liệu khung lịch tuần mẫu
    │   ├── store_config.json                           # Dữ liệu tọa độ GPS quán Zone Six
    │   └── subscription_plans.json                     # Dữ liệu các gói dịch vụ
    │
    ├── runners/                                        # SCRIPTS THỰC THI SEED THEO PHÂN HỆ
    │   ├── 00-system-roles.seed.js                     # [Tầng 0] Seed Roles & Master Data
    │   ├── 01-users.seed.js                            # [Tầng 1] Seed Tài khoản Admin & Nhân viên
    │   ├── 02-store-config.seed.js                     # [Tầng 2] Seed Tọa độ quán & Geofencing
    │   ├── 03-schedules.seed.js                        # [Tầng 3] Seed Lịch phân ca tuần
    │   ├── 04-attendances.seed.js                      # [Tầng 4] Seed Lịch sử chấm công mẫu
    │   └── 05-subscriptions.seed.js                    # [Tầng 5] Seed Gói dịch vụ
    │
    ├── clean.js                                        # Script dọn dẹp sạch CSDL theo chiều ngược
    └── index.js                                        # FILE CHẠY CHÍNH (MASTER SEED ORCHESTRATOR)
```

---

## ⚙️ 3. QUY CHUẨN ĐẶC TẢ TỪNG BẢNG (`.prisma`)

### A. File cấu hình gốc (`prisma/schema/base.prisma`)
*Chứa cấu hình datasource và kết nối MongoDB:*
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  output          = "../generated/prisma"
  previewFeatures = ["prismaSchemaFolder"] // Bắt buộc để Prisma hỗ trợ nhiều file schema
}
```

### B. File Enum tập trung (`prisma/schema/enum.prisma`)
*Tất cả trạng thái, vai trò phải nằm ở đây:*
```prisma
enum SystemRoleType {
  ADMIN
  MANAGER
  STAFF
  CUSTOMER
}

enum CommonStatus {
  ACTIVE
  INACTIVE
  PENDING
  DELETED
}

enum ShiftType {
  MORNING
  AFTERNOON
  NIGHT
}

enum AttendanceVerificationStatus {
  VALID
  WRONG_SHIFT
  OUT_OF_RANGE
  LATE
  MANUAL_APPROVED
}
```

### C. File Model riêng biệt (Ví dụ: `prisma/schema/Users.prisma`)
```prisma
model User {
  id          String         @id @default(auto()) @map("_id") @db.ObjectId
  userCode    String         @unique @map("user_code")
  name        String
  email       String         @unique
  phone       String?
  qrCode      String         @unique @map("qr_code")
  hourlyRate  Float          @default(18000) @map("hourly_rate")
  role        SystemRoleType @default(STAFF)
  position    String         @default("service")
  isActive    Boolean        @default(true) @map("is_active")
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  shiftAssignments ShiftAssignment[]
  attendances      Attendance[]

  @@map("users")
}
```

---

## 📦 4. QUY CHUẨN KHO DỮ LIỆU SẴN (JSON DATA STORE)

Tất cả dữ liệu mẫu phục vụ kiểm thử và demo được lưu tại `seed/data/[entity].json`.

---

## 🧹 5. QUY CHUẨN LỆNH DỌN DẸP & XÓA DỮ LIỆU CŨ (CLEAN DATABASE)

Trước khi nạp dữ liệu mới, bắt buộc phải có hàm dọn dẹp dữ liệu cũ theo **chiều ngược lại của quan hệ** (xóa bảng con chứa foreign key trước, xóa bảng cha sau) để tránh orphan records:

```javascript
import { prisma } from "../init.mongodb.js";

export async function cleanDatabase() {
  console.log("🧹 Đang dọn dẹp dữ liệu cũ...");

  // Xóa theo thứ tự từ bảng phụ thuộc cao nhất đến bảng gốc
  await prisma.attendance.deleteMany();
  await prisma.shiftAssignment.deleteMany();
  await prisma.weeklySchedule.deleteMany();
  await prisma.storeConfig.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscriptionPlan.deleteMany();

  console.log("✅ Đã dọn dẹp sạch toàn bộ dữ liệu cũ!");
}
```

---

## 🚀 6. QUY CHUẨN RUNNERS PHÂN TẦNG (`seed/runners/`)

Mỗi phân hệ có 1 file runner riêng, đọc dữ liệu từ `data/*.json` và insert vào CSDL thông qua Prisma:

```javascript
import { prisma } from "../../init.mongodb.js";
import usersData from "../data/users.json" assert { type: "json" };

export async function seedUsers() {
  console.log("👉 [Tầng 1] Đang khởi tạo Users & Hourly Rates...");

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log("✅ [Tầng 1] Hoàn thành Users.");
}
```

---

## 🎯 7. FILE CHẠY CHÍNH (MASTER SEED ORCHESTRATOR: `seed/index.js`)

File này là điểm kích hoạt duy nhất điều phối toàn bộ chu trình:
1. Kết nối CSDL
2. Dọn dẹp dữ liệu cũ (Tùy chọn cờ `--clean`)
3. Thực thi tuần tự từ Runner 00 đến Runner 09
4. Đo lường thời gian thực thi (duration)
5. Bắt lỗi và ngắt kết nối an toàn (`prisma.$disconnect()`)

---

## 💻 8. CÁC LỆNH TERMINAL TIÊU CHUẨN

Trong thư mục `be/`:

```bash
# 1. Đồng bộ Schema Prisma vào Database MongoDB Atlas
npx prisma db push

# 2. Sinh Prisma Client sau khi sửa schema
npx prisma generate

# 3. Chạy nạp dữ liệu Master Seed
node src/databases/seed/index.js (hoặc npx tsx src/databases/seed/index.ts)

# 4. Chạy dọn dẹp sạch và nạp lại toàn bộ từ đầu
node src/databases/seed/index.js --clean
```
