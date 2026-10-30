# 🔔 CN08: TRUNG TÂM THÔNG BÁO PHÂN LUỒNG THEO VAI TRÒ & CƠ SỞ (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Cung cấp kênh truyền thông nội bộ theo thời gian thực cho từng bộ phận trong từng cơ sở của chuỗi Zone Six.
- Phân luồng dữ liệu thông báo độc lập tuyệt đối giữa 6 vai trò thông qua 6 bộ sưu tập (Collection) riêng biệt trên cơ sở dữ liệu MongoDB Atlas.
- Gắn kèm ngữ cảnh cơ sở (`store_id`, `store_name`) trong từng thông báo để nhân sự nhận biết sự kiện xảy ra tại chi nhánh nào.
- Phân loại 4 mức độ cảnh báo để nhân sự ưu tiên xử lý việc khẩn cấp.
- Cung cấp trải nghiệm người dùng tối ưu với cửa sổ Modal căn giữa chính xác tuyệt đối (Dead-Center).

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP

| Vai Trò | Collection Lưu Trữ Trong MongoDB | Phạm Vi Thông Báo Tiếp Nhận | Phạm Vi Cơ Sở (Store Scope) |
| :--- | :--- | :--- | :--- |
| `admin_he_thong` | `notifications_admin` | Cảnh báo toàn hệ thống, lỗi Zalo Bot, sự cố DB | Toàn bộ chuỗi / Cơ sở được phân công |
| `quan_ly` | `notifications_quan_ly` | Yêu cầu duyệt lịch tuần, báo cáo thiếu người, đơn từ | Các cơ sở được Admin phân công |
| `truong_ca` | `notifications_truong_ca` | Ca trực sắp tới, nhân viên check-in trễ, đổi ca | **CHỈ TRONG ĐÚNG 1 CƠ SỞ CỦA MÌNH** |
| `pho_ca_lam_lich` | `notifications_pho_ca_lam_lich` | Hạn chốt ca tuần, nhắc mở/khóa cổng đăng ký | Cơ sở được phân công xếp lịch |
| `pho_ca_vat_lieu` | `notifications_pho_ca_vat_lieu` | Cảnh báo nguyên liệu chạm ngưỡng tồn an toàn | Cơ sở phụ trách kho |
| `nhan_vien` | `notifications_nhan_vien` | Lịch tuần đã duyệt, nhắc nhở giờ vào ca, ca mới | Cơ sở biên chế làm việc |

- **Giao diện FE:**
  - Nút chuông thông báo trên Header kèm Badge số lượng chưa đọc.
  - Component: `fe/src/features/scheduling/component/NotificationCenterModal.tsx`.
- **Tầng Backend BE:**
  - Route: `be/src/modules/scheduling/routes/notification.routes.ts`
  - Controller: `get-notifications.controller.ts`, `mark-read.controller.ts`
  - Model Prisma & Mongoose: 6 model riêng biệt (`notification_admin.prisma`, `notification_quan_ly.prisma`, ...) có đính kèm `store_id`.

---

## 3. LOGIC NGHIỆP VỤ & RÀNG BUỘC KỸ THUẬT

### 3.1 Cấu Trúc 6 Bảng CSDL Riêng Biệt & Lọc Theo Cơ Sở
- Kiến trúc tách rời 6 collection độc lập tương ứng với 6 role.
- Khi người dùng đăng nhập, backend tự động trỏ query vào collection tương ứng với `req.user.role`, đồng thời áp dụng bộ lọc theo Store Scope:
  - Nếu `role === 'truong_ca'`: `query.store_id = currentUser.assigned_store_id` (Trưởng ca chỉ thấy thông báo của đúng cơ sở mình).
  - Nếu `role === 'quan_ly'`: `query.store_id = { $in: currentUser.managed_store_ids }`.
  - Nếu `role === 'admin_he_thong'`: Nhận toàn bộ hoặc lọc theo cơ sở chọn trên Store Switcher.

### 3.2 Bốn Cấp Độ Cảnh Báo (Severity Levels)
1. **Khẩn Cấp (`urgent`):** Màu đỏ neon, viền phát sáng, icon cảnh báo nguy hiểm (dành cho vắng ca không phép, mất kết nối Zalo Bot, cạn kiệt nguyên liệu chính tại cơ sở).
2. **Mức Cao (`high`):** Màu cam hổ phách (dành cho thông báo duyệt lịch, ca trực trong vòng 2 giờ).
3. **Trung Bình (`medium`):** Màu xanh lam Obsidian (dành cho nhắc nhở đăng ký ca làm, thông báo đổi ca).
4. **Thông Thường (`low`):** Màu xám ghi (dành cho thông báo định kỳ, tin tức nội bộ).

### 3.3 Trải Nghiệm Giao Diện Tối Thượng (UI/UX Standards)
- **Dead-Center Modal:** Sử dụng React Portal đưa trực tiếp ra `document.body` với lớp phủ backdrop mờ `backdrop-blur-md`, z-index `z-[99999]`, khóa cuộn trang (`body scroll-lock`).
- **Badge Tên Cơ Sở:** Mỗi thẻ thông báo hiển thị một tag nhỏ chỉ rõ tên cơ sở phát sinh thông báo.
- **Hai Chế Độ Xem Linh Hoạt:** Cards View và Table View.

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/notifications?store_id=...` | Tất cả vai trò | Lấy danh sách thông báo theo collection của Role & phạm vi cơ sở |
| `PUT` | `/api/v1/notifications/:id/read` | Tất cả vai trò | Đánh dấu 1 thông báo là đã đọc |
| `PUT` | `/api/v1/notifications/read-all` | Tất cả vai trò | Đánh dấu toàn bộ thông báo của Role là đã đọc |

