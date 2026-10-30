# 💰 CN09: QUẢN LÝ BẢNG LƯƠNG & CHI TRẢ THÙ LAO ĐA CƠ SỞ (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Tự động hóa quá trình tổng hợp giờ làm việc thực tế từ các ca đã được điểm danh hợp lệ của nhân viên theo từng cơ sở trong chuỗi Zone Six.
- Tính toán chính xác tổng thu nhập tháng dựa trên đơn giá lương/giờ và các phụ cấp ca trực tại từng chi nhánh.
- Hỗ trợ xem chi phí lương theo từng cơ sở độc lập hoặc tổng hợp toàn chuỗi.
- Bảo đảm an toàn thông tin tài chính và quyền riêng tư nội bộ của quán.

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP (QUY ĐỊNH BẢO MẬT & RÀNG BUỘC CƠ SỞ)

| Vai Trò | Hiển Thị Menu Bảng Lương | Quyền Truy Cập Route `/salary` | Phạm Vi Cơ Sở (Store Scope) |
| :--- | :---: | :---: | :--- |
| `admin_he_thong` | ✅ **Hiển thị** | ✅ Xem toàn bộ | Xem toàn chuỗi HOẶC lọc theo cơ sở |
| `quan_ly` | ✅ **Hiển thị** | ✅ Xem cơ sở phụ trách | Xem các cơ sở được Admin phân công |
| `truong_ca` | ✅ **Hiển thị** | ✅ **Chỉ cơ sở của mình** | **CHỈ XEM NHÂN SỰ ĐÚNG 1 CƠ SỞ MÌNH** |
| `pho_ca_lam_lich` | ❌ **ẨN HOÀN TOÀN** | ❌ Chuyển hướng `/schedule` | ❌ **403 Forbidden** |
| `pho_ca_vat_lieu` | ❌ **ẨN HOÀN TOÀN** | ❌ Chuyển hướng `/schedule` | ❌ **403 Forbidden** |
| `nhan_vien` | ❌ **ẨN HOÀN TOÀN** | ❌ Chuyển hướng `/schedule` | ❌ **403 Forbidden** |

- **Giao diện FE:** Route `/salary`.
  - Component: `fe/src/app/salary/page.tsx`, `fe/src/features/scheduling/component/SalaryReportTable.tsx`, `StoreSelector.tsx`.
- **Tầng Backend BE:**
  - Route: `be/src/modules/scheduling/routes/salary.routes.ts`
  - Controller: `get-salary-report.controller.ts`
  - Service: `calculate-salary.service.ts`

---

## 3. LOGIC NGHIỆP VỤ & RÀNG BUỘC KỸ THUẬT

### 3.1 Bóc Tách Dữ Liệu Lương Theo Cơ Sở
- Dữ liệu lương được trích xuất từ các ca làm việc có `is_checked_in: true` trong `weekly_schedules` gắn với từng `store_id`.
- **Ràng buộc phân quyền đối với Trưởng Ca:**
  - Backend kiểm tra nếu `currentUser.role === 'truong_ca'`: Ép buộc query chỉ lấy các ca và nhân sự thuộc `assigned_store_id` của Trưởng ca.
  - Trưởng ca tuyệt đối không thể truy vấn hoặc xem bảng lương của cơ sở khác.
- **Quản lý đa cơ sở:** Có bộ chọn cơ sở để xem báo cáo lương từng chi nhánh mình phụ trách hoặc xem tổng hợp các chi nhánh đó.
- **Admin:** Có thể xem chi phí lương tổng hợp toàn bộ các cơ sở hoặc xem chi tiết từng cơ sở.

### 3.2 Công Thức Tính Lương Tự Động
- Hệ thống trích xuất toàn bộ các ca làm việc trong tháng có trạng thái điểm danh hợp lệ:
  $$\text{Tổng Giờ Làm} = \sum (\text{Thời gian kết thúc ca} - \text{Thời gian bắt đầu ca})$$
- Lương tháng của nhân viên được tính theo công thức:
  $$\text{Tổng Thu Nhập} = (\text{Tổng Giờ Làm} \times \text{Lương Giờ}) + \text{Phụ Cấp Trách Nhiệm} - \text{Khấu Trừ Đi Trễ/Vắng}$$

### 3.3 Quy Tắc Bảo Mật Thông Tin Nghiêm Ngặt
- Bảng lương hiển thị: Tên Nhân Viên, Cơ sở làm việc, Vị Trí (Barista/Service), Mức Lương Giờ (VND/giờ), Tổng Số Giờ Làm Thực Tế, Tổng Lương Tháng (VND).
- **Ẩn Tuyệt Đối Thông Tin Riêng Tư:** Bảng lương tuyệt đối không hiển thị Số điện thoại cá nhân, Mã QR thẻ số hay Mật khẩu.

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/salary/monthly?store_id=...` | Admin, Quản lý, Trưởng ca | Lấy bảng tổng hợp lương tháng theo tháng, năm và cơ sở |
| `GET` | `/api/v1/salary/export?store_id=...` | Admin, Quản lý | Xuất file Excel bảng lương chi tiết theo cơ sở |

