# 🚀 CẨM NANG TOÀN DIỆN TRIỂN KHAI HỆ THỐNG ZONE SIX (DEPLOYMENT GUIDE)
> **Tài liệu hướng dẫn triển khai sản phẩm thực tế (Production Deployment):**
> 1. **Backend (Node.js Express + Prisma + Mongoose + Zalo Bot):** Triển khai lên máy chủ VPS Ubuntu (`160.191.243.53`).
> 2. **Frontend (Next.js 16 App Router + React Query v5):** Triển khai lên Vercel Edge Cloud.

---

## 🏛️ TỔNG QUAN KIẾN TRÚC MẠNG & TRIỂN KHAI

```text
[Người Dùng Trình Duyệt / Mobile]
             │
             ├──► (HTTPS) ──► [Frontend Vercel Cloud: https://zone6.vercel.app]
             │                            │
             │                    (API Call / Rewrites)
             │                            ▼
             └──► [Backend VPS Ubuntu: http://160.191.243.53:8000]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     [MongoDB Atlas Cloud: zone_6]                 [Zalo Bot Socket: zca-js Session]
```

---

# PHẦN 1: TRIỂN KHAI BACKEND VỚI DOCKER & NGINX (KHUYÊN DÙNG NHẤT)

Đây là phương pháp triển khai tiêu chuẩn công nghiệp hiện đại: Toàn bộ Backend Node.js và Nginx Reverse Proxy được tự động hóa 100% bằng Docker Compose.

### BƯỚC 1: CẤU HÌNH IP TRÊN MONGODB ATLAS (BẮT BUỘC)
Trước khi khởi chạy Backend trên VPS, bạn phải cấp phép cho IP VPS truy cập Database:
1. Đăng nhập vào [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Vào menu **Security** $\rightarrow$ **Network Access**.
3. Bấm **Add IP Address**:
   - Nhập IP VPS của bạn: `160.191.243.53/32` (hoặc chọn "Allow Access From Anywhere" `0.0.0.0/0`).
4. Bấm **Confirm**.

---

### BƯỚC 2: CÀI ĐẶT DOCKER & DOCKER COMPOSE TRÊN VPS UBUNTU

Trên màn hình Terminal của VPS, chạy các lệnh sau:
```bash
# 1. Cập nhật hệ thống và cài đặt Docker
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git

# 2. Cho phép Docker tự động chạy khi bật VPS
sudo systemctl enable docker
sudo systemctl start docker

# 3. Kiểm tra phiên bản Docker
docker --version
docker compose version
```

---

### BƯỚC 3: TẢI MÃ NGUỒN, TẠO FILE .ENV VÀ KHỞI CHẠY HỆ THỐNG

1. **Clone mã nguồn dự án về VPS:**
   ```bash
   sudo mkdir -p /var/www/zone6
   cd /var/www/zone6
   git clone https://github.com/nguyenhocweb/zone_6.git .
   ```

2. **Tạo file cấu hình môi trường `.env` cho Backend:**
   > ⚠️ **Lưu ý quan trọng:** Vì lý do bảo mật, file `.env` chứa mật khẩu Database không bao giờ được đưa lên GitHub. Do đó khi clone code về VPS, bạn cần chạy lệnh sau (chỉ 1 cú dán Enter) để tạo file `be/.env`:

   ```bash
   cat << 'EOF' > be/.env
# Cấu hình Cổng Service
PORT=8000
NODE_ENV=production

# Kết nối CSDL MongoDB Atlas (Database: zone_6)
DATABASE_URL="mongodb+srv://My_Restaurant:Matkhau2k3.@nguyenhocweb.pqyjucr.mongodb.net/zone_6?retryWrites=true&w=majority&appName=nguyenhocweb"

# Khóa bí mật mã hóa Session (AES-256-GCM)
ZALO_SESSION_KEY=AES-256-GCM

# Thư mục lưu trữ phiên đăng nhập mã hóa Zalo Bot (bên trong Docker container)
ZALO_SESSION_DIR=/app/.sessions

# Giới hạn thời gian sống của QR (mili-giây, mặc định 120s)
ZALO_QR_TTL_MS=120000

# Tùy chọn Anti-Spam: Độ trễ tối thiểu giữa 2 lần gửi tin (mili-giây)
ZALO_SEND_DELAY_MS=3000

# Cấu hình Cloudinary (Lưu trữ ảnh chấm công, hóa đơn)
CLOUDINARY_NAME=dwbzexuqd
CLOUDINARY_API_KEY=437768759352932
CLOUDINARY_API_SECRET=GYbnPtFn9mWFLteHIvQRWF0XIDU

# Cấu hình Token Authentication (JWT)
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=3d
JWT_SECRET=Wtqh5wrHO5pkWJtPxkJ6oGMW8aSz26IdUtrGZlL3X9h2Aagqy52J61564MeyOduUqL2XkRh3bWEKebOzhIBalMibzs9FyEAgGpXBLFqIw47H6veIE5oeLmQVFTUbV2fLQWSC
ACCESS_TOKEN_SECRET=Wtqh5wrHO5pkWJtPxkJ6oGMW8aSz26IdUtrGZlL3X9h2Aagqy52J61564MeyOduUqL2XkRh3bWEKebOzhIBalMibzs9FyEAgGpXBLFqIw47H6veIE5oeLmQVFTUbV2fLQWSC
REFRESH_TOKEN_SECRET=bOG0ctzET1qF1T27i4l2xeHGCM0uVIK2vVQTD8LZriQP3izjxsPrQHUFg32YmEa9dyQDWkVblGXO25H2CX4sf2vIvYv49xwZCPHiWx0qzpxHWZsK18ZtSbrgEu8FT8KiGZzc
EOF
   ```

3. **Chỉ cần 1 lệnh duy nhất để Build và Chạy toàn bộ hệ thống bằng Docker Compose:**
   ```bash
   docker compose up -d --build
   ```

4. **Kiểm tra trạng thái các container:**
   ```bash
   docker compose ps
   ```
   *Bạn sẽ thấy cả 2 container `zone6-backend` và `zone6-nginx` đều ở trạng thái `running` (hoặc `Up`).*

5. **Xem log Backend hoạt động thời gian thực (đảm bảo Prisma và Server kết nối DB thành công):**
   ```bash
   docker compose logs -f backend
   ```
   *(Nhấn `Ctrl + C` để thoát màn hình xem log).*

---

### BƯỚC 4: MỞ FIREWALL CỔNG 80 TRÊN VPS
1. Trên tab **`Firewall`** của bảng điều khiển web VPS: Thêm Rule cho phép cổng **`80/TCP`** (HTTP).
2. Trên terminal VPS:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 22/tcp
   sudo ufw --force enable
   ```

---

### BƯỚC 5: KIỂM TRA TRÊN TRÌNH DUYỆT
Mở trình duyệt truy cập thẳng vào IP (không cần gõ cổng 8000 vì Nginx đã xử lý):
* **Health Check:** `http://160.191.243.53/health` $\rightarrow$ Trả về `{"status":"healthy"}`
* **API Root:** `http://160.191.243.53/api` $\rightarrow$ Trả về thông tin hệ thống Online

---
---

# PHẦN 1B: CÁCH TRIỂN KHAI TRUYỀN THỐNG BẰNG PM2 (KHÔNG DÙNG DOCKER)

### Thông tin máy chủ của bạn (theo bảng điều khiển):
* **Hệ điều hành:** Ubuntu Linux (Hostname: `nguyen`)
* **Địa chỉ IP:** `160.191.243.53`
* **Dung lượng đĩa:** 25 GB SSD (Đã dùng ~2.38 GB)
* **Cổng Backend:** `8000`

---

### BƯỚC 1: CẤU HÌNH IP TRÊN MONGODB ATLAS (BẮT BUỘC)
Trước khi khởi chạy Backend trên VPS, bạn phải cấp phép cho IP VPS truy cập Database:
1. Đăng nhập vào [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Vào menu **Security** $\rightarrow$ **Network Access**.
3. Bấm **Add IP Address**:
   - Nhập IP VPS của bạn: `160.191.243.53/32` (ghi chú: *Zone 6 Production VPS*).
   - *(Hoặc chọn "Allow Access From Anywhere" `0.0.0.0/0` để kiểm tra nhanh).*
4. Bấm **Confirm**.

---

### BƯỚC 2: KẾT NỐI VÀO VPS QUA SSH
Mở PowerShell (hoặc Terminal) trên máy tính cá nhân và đăng nhập vào VPS:
```bash
ssh root@160.191.243.53
```
*(Hoặc dùng trực tiếp cửa sổ **Web Console / Terminal** icon `[_]` cạnh nút nguồn trên giao diện web VPS của bạn).*

---

### BƯỚC 3: CÀI ĐẶT MÔI TRƯỜNG CẦN THIẾT (NODE.JS 20, GIT, PM2)
Chạy lần lượt các lệnh sau trên terminal của VPS:

```bash
# 1. Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt các công cụ cơ bản
sudo apt install -y curl git build-essential ufw

# 3. Cài đặt Node.js 20.x LTS chính thức từ NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Kiểm tra phiên bản (Yêu cầu Node >= 20.x và npm >= 10.x)
node -v
npm -v

# 5. Cài đặt PM2 (Công cụ quản lý tiến trình chạy ngầm vĩnh viễn)
sudo npm install -g pm2
```

---

### BƯỚC 4: TẢI MÃ NGUỒN BACKEND LÊN VPS

Tạo thư mục ứng dụng trên máy chủ:
```bash
sudo mkdir -p /var/www/zone6
sudo chown -R $USER:$USER /var/www/zone6
cd /var/www/zone6
```

Chọn 1 trong 2 cách đưa code lên:

#### Cách 4.1: Clone qua Git (Khuyên dùng)
```bash
git clone <URL_REPO_GITHUB_CUA_BAN> .
cd be
```

#### Cách 4.2: Copy trực tiếp từ máy tính lên VPS qua SCP
Mở một cửa sổ PowerShell mới trên máy tính cá nhân của bạn:
```powershell
# Chạy từ thư mục gốc dự án zone_6
scp -r be root@160.191.243.53:/var/www/zone6/
```

---

### BƯỚC 5: TẠO FILE MÔI TRƯỜNG `.env` CHO BACKEND

Tại thư mục `be` trên VPS (`/var/www/zone6/be`):
```bash
nano .env
```

Dán toàn bộ nội dung sau vào:
```env
# Cấu hình Cổng Backend
PORT=8000
NODE_ENV=production

# Kết nối CSDL MongoDB Atlas
DATABASE_URL="mongodb+srv://My_Restaurant:Matkhau2k3.@nguyenhocweb.pqyjucr.mongodb.net/zone_6?retryWrites=true&w=majority&appName=nguyenhocweb"

# Khóa bí mật mã hóa Zalo Session (AES-256-GCM)
ZALO_SESSION_KEY=AES-256-GCM

# Thư mục lưu trữ phiên đăng nhập mã hóa
ZALO_SESSION_DIR=.sessions

# Thời gian sống QR Code & Anti-Spam
ZALO_QR_TTL_MS=120000
ZALO_SEND_DELAY_MS=3000

# Cấu hình Cloudinary (Lưu trữ ảnh chấm công, hóa đơn)
CLOUDINARY_NAME=dwbzexuqd
CLOUDINARY_API_KEY=437768759352932
CLOUDINARY_API_SECRET=GYbnPtFn9mWFLteHIvQRWF0XIDU

# Cấu hình Token Authentication (JWT)
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=3d
JWT_SECRET=Wtqh5wrHO5pkWJtPxkJ6oGMW8aSz26IdUtrGZlL3X9h2Aagqy52J61564MeyOduUqL2XkRh3bWEKebOzhIBalMibzs9FyEAgGpXBLFqIw47H6veIE5oeLmQVFTUbV2fLQWSC
ACCESS_TOKEN_SECRET=Wtqh5wrHO5pkWJtPxkJ6oGMW8aSz26IdUtrGZlL3X9h2Aagqy52J61564MeyOduUqL2XkRh3bWEKebOzhIBalMibzs9FyEAgGpXBLFqIw47H6veIE5oeLmQVFTUbV2fLQWSC
REFRESH_TOKEN_SECRET=bOG0ctzET1qF1T27i4l2xeHGCM0uVIK2vVQTD8LZriQP3izjxsPrQHUFg32YmEa9dyQDWkVblGXO25H2CX4sf2vIvYv49xwZCPHiWx0qzpxHWZsK18ZtSbrgEu8FT8KiGZzc
```
> Nhấn **`Ctrl + O`** $\rightarrow$ nhấn **`Enter`** để Lưu $\rightarrow$ nhấn **`Ctrl + X`** để Thoát.

---

### BƯỚC 6: CÀI ĐẶT THƯ VIỆN & BUILD DỰ ÁN

Tại thư mục `be` trên VPS, chạy:
```bash
# 1. Cài đặt toàn bộ dependencies
npm install

# 2. Sinh Prisma Client kết nối MongoDB
npm run db:generate

# 3. Biên dịch TypeScript sang JavaScript trong thư mục dist/
npm run build
```

---

### BƯỚC 7: KHỞI CHẠY BACKEND CHẠY NGẦM BẰNG PM2

```bash
# Khởi chạy dịch vụ backend với PM2
pm2 start dist/server.js --name "zone6-be"

# Lưu danh sách tiến trình để tự động bật lại khi VPS khởi động lại
pm2 save
pm2 startup
```
*(Nếu terminal hiển thị một dòng lệnh dạng `sudo env PATH=...`, hãy copy dòng đó và paste chạy tiếp).*

#### Các lệnh quản trị PM2 hữu ích:
```bash
pm2 status              # Xem trạng thái hoạt động
pm2 logs zone6-be       # Xem log trực tiếp thời gian thực
pm2 restart zone6-be    # Khởi động lại Backend
pm2 stop zone6-be       # Dừng Backend
```

---

### BƯỚC 8: MỞ CỔNG TƯỜNG LỬA (FIREWALL)

1. **Trên bảng điều khiển Web của VPS (giao diện trong ảnh):**
   - Vào tab **`Firewall`**.
   - Thêm quy tắc (Rule): Cho phép cổng **`8000`** (Protocol: `TCP`, Action: `Allow`).
   - Mở thêm cổng **`80`** (HTTP) và **`443`** (HTTPS).

2. **Trên Terminal VPS:**
   ```bash
   sudo ufw allow 8000/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw --force enable
   ```

---

### BƯỚC 9: KIỂM TRA BACKEND HOẠT ĐỘNG
Mở trình duyệt trên máy tính và truy cập:
* `http://160.191.243.53:8000/health` $\rightarrow$ Trả về `{"status":"healthy"}`
* `http://160.191.243.53:8000/api` $\rightarrow$ Trả về danh sách phân hệ Online

---
---

# PHẦN 2: TRIỂN KHAI FRONTEND (NEXT.JS) LÊN VERCEL

Vercel là nền tảng tối ưu nhất cho Next.js App Router (tự động tối ưu hình ảnh, Edge Caching, Serverless Functions).

---

### ⚠️ BÍ QUYẾT GIẢI QUYẾT LỖI "MIXED CONTENT" (HTTPS VERCEL GỌI HTTP VPS)

> **Vấn đề thực tế:** Khi deploy lên Vercel, website của bạn sẽ chạy HTTPS (`https://zone6.vercel.app`). Nếu frontend gọi trực tiếp API dạng `http://160.191.243.53:8000`, trình duyệt (Chrome, Safari) sẽ chặn vì lỗi bảo mật **Mixed Content** (trang HTTPS không được gọi HTTP không an toàn).
> 
> **Giải pháp tối ưu nhất:** Cấu hình **Next.js Rewrites Proxy** ngay trong `fe/next.config.ts`. Toàn bộ request từ Vercel sẽ tự động proxy ngầm về VPS của bạn mà không hề bị chặn bởi trình duyệt!

---

### BƯỚC 1: CẤU HÌNH PROXY TRONG `fe/next.config.ts`

Kiểm tra và bổ sung khối `rewrites()` vào file [fe/next.config.ts](file:///d:/DuAnCaNhan/zone_6/fe/next.config.ts):

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    agentUpgrade: "security",
  } as any,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Proxy toàn bộ request /api/* ngầm về Backend VPS
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://160.191.243.53:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
```

---

### BƯỚC 2: ĐẨY CODE LÊN GITHUB / GITLAB
1. Khởi tạo Git và commit toàn bộ thay đổi:
   ```bash
   git add .
   git commit -m "feat: configure production deployment for VPS and Vercel"
   git push origin main
   ```

---

### BƯỚC 3: KẾT NỐI VÀ DEPLOY TRÊN VERCEL

1. Truy cập [https://vercel.com/](https://vercel.com/) và đăng nhập (bằng tài khoản GitHub/GitLab).
2. Bấm **"Add New..."** $\rightarrow$ chọn **"Project"**.
3. Tìm kho mã nguồn GitHub của dự án **`zone_6`** $\rightarrow$ bấm **"Import"**.
4. **Cấu hình dự án (Project Configuration):**
   * **Project Name:** `zone-six` (hoặc tên bạn muốn).
   * **Framework Preset:** `Next.js` (Vercel tự nhận diện).
   * **Root Directory:** Bấm **Edit** $\rightarrow$ chọn thư mục **`fe`** *(vì dự án của bạn chứa cả `be` và `fe`, frontend nằm trong thư mục `fe`)*.
   * **Build Command:** Để mặc định (`next build`).
   * **Output Directory:** Để mặc định (`.next`).
5. **Cài đặt Biến Môi Trường (Environment Variables):**
   Mở rộng mục **Environment Variables** và thêm:
   | Key | Value | Mô tả |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `http://160.191.243.53:8000` | Địa chỉ Backend trên VPS |
6. Bấm nút **"Deploy"** và chờ khoảng 1–2 phút.

Khi màn hình pháo hoa chúc mừng xuất hiện, website Zone Six chính thức hoạt động trên toàn cầu tại địa chỉ:
👉 **`https://zone-six.vercel.app`** (hoặc domain cá nhân do Vercel cấp).

---

# PHẦN 3: KIỂM TRA ĐỒNG BỘ TOÀN HỆ THỐNG (END-TO-END VERIFICATION)

| Bước kiểm tra | Thao tác thực hiện | Kết quả mong đợi |
| :--- | :--- | :--- |
| **1. Truy cập Frontend** | Mở trình duyệt vào link Vercel | Giao diện đăng nhập Zone Six Obsidian Gold hiển thị mượt mà |
| **2. Đăng nhập hệ thống** | Nhập `admin@zonesix.vn` / `admin123` | Đăng nhập thành công, nhận Access Token và tải Dashboard |
| **3. Xếp lịch & Phân ca** | Mở tab Xếp Lịch (/schedule) | Dữ liệu ca kíp từ MongoDB Atlas tải đầy đủ theo từng chi nhánh |
| **4. Kho & Phiếu Nhập** | Mở Kho & Vật Liệu (/materials) | Hiển thị 5 Tab gồm Yêu Cầu Nhập Kho & Đơn Thu Mua PO |
| **5. Zalo Bot** | Mở Quản lý Zalo (/zalo) | Trạng thái hiển thị WebSocket kết nối và phiên zca-js online |

---

# PHẦN 4: TỰ ĐỘNG HÓA 100% BẰNG GITHUB ACTIONS (CI/CD)

Khi bạn cấu hình mục này, mỗi lần bạn gõ `git push origin main`:
* **Vercel:** Tự động phát hiện và build lại Frontend.
* **VPS:** GitHub Actions tự động đăng nhập SSH vào VPS `160.191.243.53`, chạy `git pull` và `docker compose up -d --build` hoàn toàn tự động!

### Các bước thêm bí mật (Secrets) trên GitHub:
1. Mở repository dự án của bạn trên trang web **GitHub**.
2. Bấm vào tab **`Settings`** $\rightarrow$ chọn mục **`Secrets and variables`** ở cột trái $\rightarrow$ chọn **`Actions`**.
3. Bấm nút màu xanh **"New repository secret"** và thêm lần lượt 3 biến sau:

| Tên Secret (Name) | Giá trị (Secret Value) | Giải thích |
| :--- | :--- | :--- |
| `VPS_HOST` | `160.191.243.53` | Địa chỉ IP máy chủ VPS của bạn |
| `VPS_USERNAME` | `root` | Tên người dùng quản trị VPS |
| `VPS_PASSWORD` | *(Mật khẩu VPS của bạn)* | Mật khẩu nhà cung cấp cấp cho bạn qua email |

Sau khi thêm xong 3 biến trên:
👉 Mỗi khi bạn chạy `git push origin main` từ máy tính, bạn chỉ cần mở tab **Actions** trên GitHub là sẽ thấy quy trình tự động cập nhật code lên VPS diễn ra hoàn toàn tự động!

