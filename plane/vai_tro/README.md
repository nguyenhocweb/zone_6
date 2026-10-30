# 👑 MA TRẬN VAI TRÒ & PHÂN QUYỀN HỆ THỐNG ZONE SIX (MULTI-STORE)

> **Quy chuẩn bắt buộc:** Mọi thay đổi về phân quyền, hiển thị menu, lọc dữ liệu theo cơ sở hoặc xử lý API phải đối chiếu trực tiếp với ma trận vai trò này.

---

## 1. DANH SÁCH 6 VAI TRÒ HỆ THỐNG & PHẠM VI CƠ SỞ (STORE SCOPE)

Hệ thống Zone Six được tổ chức theo cấu trúc phân cấp 6 tầng nghiêm ngặt kết hợp cơ chế kiểm soát phạm vi cơ sở (Store Scope):

| Cấp Bậc | Mã Role (`role`) | Tên Vai Trò | Cấp Quản Lý | Phạm Vi Cơ Sở (Store Scope) | Nhiệm Vụ Cốt Lõi |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **Cấp 1** | `admin_he_thong` | **Admin Hệ Thống** | Cao nhất (Super) | **Toàn bộ cơ sở** HOẶC **Vài / Nhiều cơ sở** được phân | Toàn quyền kiểm soát hệ thống, Zalo Bot, CSDL, Tạo cơ sở & Phân quyền cơ sở |
| **Cấp 2** | `quan_ly` | **Quản Lý Quán** | Quản lý chung | **1 cơ sở** HOẶC **Vài / Nhiều cơ sở** do Admin phân | Điều hành nhân sự, duyệt lịch, xem lương, cấu hình GPS của đúng các cơ sở được giao |
| **Cấp 3** | `truong_ca` | **Trưởng Ca** | Quản lý ca trực | **ĐÚNG 1 CƠ SỞ CỐ ĐỊNH** (Ràng buộc cứng) | Điều hành ca tại cơ sở, tích điểm danh, xếp ca, xem lương nhân sự tại cơ sở đó |
| **Cấp 4** | `pho_ca_lam_lich` | **Phó Ca Làm Lịch** | Nghiệp vụ xếp lịch | **1 cơ sở cố định** | Chạy AutoScheduler cho cơ sở, mở đăng ký, chỉnh ô ca, xuất Excel (Ẩn dấu tích & lương) |
| **Cấp 5** | `pho_ca_vat_lieu` | **Phó Ca Vật Liệu** | Quản lý kho cơ sở | **1 cơ sở cố định** | Kiểm kê kho nguyên liệu cơ sở, đề xuất vật tư, đăng ký ca làm |
| **Cấp 6** | `nhan_vien` | **Nhân Viên** | Vận hành trực tiếp | **1 cơ sở biên chế** | Đăng ký ca tuần cơ sở, check-in camera + GPS tại cơ sở, xem lịch ca |

---

## 2. MA TRẬN PHÂN QUYỀN TÍNH NĂNG TOÀN DIỆN

| Nhóm Tính Năng | Nghiệp Vụ Cụ Thể | `admin_he_thong` | `quan_ly` | `truong_ca` | `pho_ca_lam_lich` | `pho_ca_vat_lieu` | `nhan_vien` |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Quản trị Cơ sở (Store)**| Quản lý danh mục Cơ sở (Thêm/Sửa/Xóa cơ sở)| ✅ Toàn chuỗi | ❌ Không có | ❌ Không có | ❌ Không có | ❌ Không có | ❌ Không có |
| | Phân quyền Cơ sở cho Quản lý / Admin chi nhánh | ✅ Độc quyền | ❌ Không có | ❌ Không có | ❌ Không có | ❌ Không có | ❌ Không có |
| | Bộ chuyển đổi Cơ sở (Store Switcher) trên Navbar | ✅ Tất cả / Cơ sở được phân | ✅ Các cơ sở được phân | ❌ Cố định 1 cơ sở | ❌ Cố định 1 cơ sở | ❌ Cố định 1 cơ sở | ❌ Cố định 1 cơ sở |
| **Xác thực & Tài khoản** | Đăng nhập hệ thống (Cookie JWT nạp Store Scope) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Xem Profile & Thẻ nhân viên số kèm tên Cơ sở | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Đổi mật khẩu cá nhân | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Đăng ký ca làm** | Đăng ký nguyện vọng ca tuần theo Cơ sở | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Mở / Khóa đợt đăng ký ca của Cơ sở | ✅ | ✅ (Cơ sở phân công)| ✅ (Cơ sở của mình)| ✅ (Cơ sở của mình)| ❌ | ❌ |
| **Xếp lịch & Điều phối** | Tự động xếp lịch (AutoScheduler) theo Cơ sở | ✅ | ✅ (Cơ sở phân công)| ✅ (Cơ sở của mình)| ✅ (Cơ sở của mình)| ❌ Bị chặn | ❌ Bị chặn |
| | Kéo thả / Đổi nhân sự ô ca làm của Cơ sở | ✅ | ✅ (Cơ sở phân công)| ✅ (Cơ sở của mình)| ✅ (Cơ sở của mình)| ❌ Chỉ xem | ❌ Chỉ xem |
| | Xuất file Excel bảng lịch tuần theo Cơ sở | ✅ | ✅ (Cơ sở phân công)| ✅ (Cơ sở của mình)| ✅ (Cơ sở của mình)| ❌ | ❌ |
| **Điểm danh & Chấm công** | Tự Check-in Camera + GPS theo Cơ sở làm việc | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Tích điểm danh trực tiếp trên ô ca | ✅ Toàn quyền | ✅ (Cơ sở phân công)| ✅ (**Chỉ đúng 1 cơ sở**)| ❌ **Ẩn dấu tích** | ❌ Chỉ xem | ❌ Chỉ xem |
| | Cấu hình tọa độ GPS & Geofence Cơ sở | ✅ Mọi cơ sở | ✅ (Cơ sở phân công)| ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn | ❌ Bị chặn |
| | Xem chi tiết bằng chứng Check-in | ✅ | ✅ (Cơ sở phân công)| ✅ (Cơ sở của mình)| ❌ | ❌ | ❌ (Chỉ của mình) |
| **Quản lý Nhân sự** | Xem danh sách nhân viên | ✅ Toàn bộ / Theo cơ sở | ✅ Cơ sở phân công | ⚠️ Cấp dưới tại cơ sở | ❌ | ❌ | ❌ |
| | Thêm nhân viên mới (phân bổ Cơ sở) | ✅ | ✅ (<= Trưởng ca) | ⚠️ (Cấp dưới cơ sở) | ❌ | ❌ | ❌ |
| | Sửa lương & vai trò nhân sự | ✅ | ✅ (Không vượt cấp)| ⚠️ (Cấp dưới cơ sở) | ❌ | ❌ | ❌ |
| **Lương & Thù lao** | Xem Bảng lương tháng | ✅ **Toàn chuỗi / Cơ sở**| ✅ **Cơ sở phân công** | ✅ **Chỉ cơ sở của mình**| ❌ **Ẩn hoàn toàn** | ❌ **Ẩn hoàn toàn** | ❌ **Ẩn hoàn toàn** |
| | Bảo mật thông tin lương (ẩn sđt/qr)| ✅ Bắt buộc | ✅ Bắt buộc | ✅ Bắt buộc | ❌ | ❌ | ❌ |
| **Thông báo & Tương tác**| Trung tâm thông báo riêng theo Role & Cơ sở | ✅ (6 DB riêng) | ✅ (6 DB riêng) | ✅ (6 DB riêng) | ✅ (6 DB riêng) | ✅ (6 DB riêng) | ✅ (6 DB riêng) |
| **Zalo Automation Bot** | Quét mã QR đăng nhập Zalo | ✅ **Duy nhất** | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn |
| | Cấu hình nhóm / kênh nhận tin theo Cơ sở | ✅ **Duy nhất** | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn |
| | Bắn tin nhắn lịch tuần / nhắc ca theo Cơ sở | ✅ **Duy nhất** | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn | ❌ Ẩn/Chặn |
| **Vật liệu & Tồn kho** | Kiểm kê kho & đề xuất nhập hàng Cơ sở | ✅ Mọi cơ sở | ✅ Cơ sở phân công | ⚠️ Theo dõi cơ sở | ❌ | ✅ **Kho cơ sở mình**| ❌ |

---

## 3. TÁC ĐỘNG CHÉO GIỮA CÁC VAI TRÒ & NGUYÊN TẮC CƠ SỞ (STORE SCOPE RULES)

```text
       ┌────────────────────────┐
       │     admin_he_thong     │◄── Quản trị toàn bộ chuỗi cơ sở, phân quyền cơ sở, Zalo Bot
       └───────────┬────────────┘
                   │ Phân quyền quản lý 1 hoặc nhiều cơ sở
                   ▼
       ┌────────────────────────┐
       │        quan_ly         │◄── Quản lý 1 hoặc vài/nhiều cơ sở được phân công (Duyệt lịch, nhân sự, lương, GPS)
       └───────────┬────────────┘
                   │ Phân bổ vào 1 cơ sở cố định
                   ▼
       ┌────────────────────────┐
       │       truong_ca        │◄── RÀNG BUỘC CỨNG: CHỈ LÀM VIỆC & PHỤ TRÁCH ĐÚNG 1 CƠ SỞ
       └───────────┬────────────┘    (Tích check-in, điều phối ca, xem lương CHỈ trong cơ sở đó)
                   │ Chỉ huy trong ca tại cơ sở
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│pho_ca_lam_lich│     │pho_ca_vat_lieu│
└───────┬───────┘     └───────┬───────┘
        │ Lịch cơ sở          │ Kho cơ sở
        └──────────┬──────────┘
                   ▼
       ┌────────────────────────┐
       │       nhan_vien        │◄── Biên chế tại cơ sở, Check-in Camera + GPS tại đúng cơ sở đó
       └────────────────────────┘
```

### 3.1 Quy tắc Ràng Buộc Phạm Vi Cơ Sở (Store Scope Rules)
1. **Admin Toàn Chuỗi vs Admin Chi Nhánh:**
   - Admin hệ thống tối cao có thể quản lý **toàn bộ tất cả cơ sở** trong chuỗi.
   - Khi cần thiết, Admin có thể phân quyền cho một tài khoản Admin/Quản lý chỉ phụ trách **một vài cơ sở cụ thể** hoặc **nhiều cơ sở**. Khi đó, người này **chỉ được phép xem và quản lý đúng các cơ sở đã được phân quyền**.
2. **Quy tắc Quản Lý Đa Cơ Sở (`quan_ly`):**
   - Quản lý có thể được phân công phụ trách **1 cơ sở** hoặc **vài / nhiều cơ sở** tùy quy mô kinh doanh.
   - Tại mỗi màn hình nghiệp vụ (Lịch ca, Nhân sự, Bảng lương, GPS, Kho), Quản lý có bộ chuyển đổi cơ sở (Store Switcher) để chọn xem từng cơ sở trong phạm vi được phân quyền.
3. **Quy tắc Trưởng Ca Đúng 1 Cơ Sở (`truong_ca` - BẮT BUỘC):**
   - **Trưởng ca chỉ làm việc và chỉ chịu trách nhiệm tại ĐÚNG 1 CƠ SỞ DUY NHẤT.**
   - Trưởng ca **không có bộ chuyển đổi cơ sở**, tài khoản gắn cứng với `assigned_store_id`.
   - Trưởng ca **tuyệt đối không được phép xem lịch, tích điểm danh, can thiệp nhân sự hoặc xem lương của cơ sở khác**.
4. **Quy tắc Điểm Danh Theo Cơ Sở:**
   - Khi nhân viên check-in GPS, hệ thống kiểm tra ca trực hôm đó thuộc cơ sở nào và đối chiếu khoảng cách Geofence với đúng tọa độ GPS của cơ sở đó.
5. **Quy tắc Phân Ly Trách Nhiệm Điểm Danh:**
   - `pho_ca_lam_lich` có quyền sửa lịch nhưng **tuyệt đối bị ẩn dấu tích điểm danh** để chống tự chấm công gian lận.
   - Chỉ `truong_ca` (tại cơ sở của mình), `quan_ly` (tại cơ sở được phân công) và `admin_he_thong` mới có quyền tích xác nhận điểm danh.
6. **Quy tắc Bảo Mật Bảng Lương:**
   - Các vai trò `pho_ca_lam_lich`, `pho_ca_vat_lieu`, `nhan_vien` bị ẩn hoàn toàn tab Bảng Lương và bị chặn ở API backend.

