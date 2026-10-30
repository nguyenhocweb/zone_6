# 📊 CN04: XẾP LỊCH TUẦN & THUẬT TOÁN AUTOSCHEDULER ĐA CƠ SỞ (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Tự động hóa quy trình lập lịch làm việc tuần cho nhân viên theo từng cơ sở độc lập trong chuỗi Zone Six.
- Giải quyết bài toán cân bằng tải giờ làm việc, tôn trọng tối đa nguyện vọng nhân viên và đáp ứng định biên nhân sự theo ca (Pha chế & Phục vụ) tại từng chi nhánh.
- Cung cấp giao diện ma trận xếp ca tương tác trực quan tích hợp bộ lọc cơ sở (Store Switcher) và công cụ xuất file Excel chuẩn mực cho từng cơ sở.

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP

| Nghiệp Vụ Trên Bảng Lịch | Admin (`admin_he_thong`) | Quản Lý (`quan_ly`) | Trưởng Ca (`truong_ca`) | Phó Ca Làm Lịch (`pho_ca_lam_lich`) | Phó Ca Vật Liệu (`pho_ca_vat_lieu`) | Nhân Viên (`nhan_vien`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Xem bảng lịch tuần** | ✅ Mọi cơ sở | ✅ Cơ sở phân công | ✅ **Chỉ cơ sở mình** | ✅ **Chỉ cơ sở mình** | ✅ Chỉ xem cơ sở mình | ✅ Chỉ xem cơ sở mình |
| **Kích hoạt AutoScheduler** | ✅ Mọi cơ sở | ✅ Cơ sở phân công | ✅ **Chỉ cơ sở mình** | ✅ **Chỉ cơ sở mình** | ❌ **Ẩn nút** | ❌ **Ẩn nút** |
| **Sửa đổi nhân sự trong ô ca**| ✅ Mọi cơ sở | ✅ Cơ sở phân công | ✅ **Chỉ cơ sở mình** | ✅ **Chỉ cơ sở mình** | ❌ **Khóa click** | ❌ **Khóa click** |
| **Xuất file Excel lịch làm** | ✅ Mọi cơ sở | ✅ Cơ sở phân công | ✅ **Chỉ cơ sở mình** | ✅ **Chỉ cơ sở mình** | ❌ **Ẩn nút** | ❌ **Ẩn nút** |

- **Giao diện FE:** Route `/schedule`.
  - Component: `fe/src/features/scheduling/component/WeeklyScheduleTable.tsx`, `ShiftSlotCell.tsx`, `AutoSchedulerControls.tsx`, `StoreSwitcher.tsx`.
- **Tầng Backend BE:**
  - Route: `be/src/modules/scheduling/routes/scheduling.routes.ts`
  - Engine: `be/src/modules/scheduling/services/auto-scheduler.engine.ts`
  - Export: `be/src/modules/scheduling/services/excel.service.ts`
  - Model: `be/src/databases/mongoose/models/weekly-schedule.model.ts` (trường `store_id`).

---

## 3. LOGIC THUẬT TOÁN AUTOSCHEDULER & RÀNG BUỘC THEO CƠ SỞ

### 3.1 Tiêu chí tối ưu của AutoSchedulerEngine theo cơ sở
- Thuật toán chạy phân lập trên phạm vi của từng cơ sở cụ thể (`store_id`):
  1. **Ràng buộc cứng (Hard Constraints):**
     - Chỉ phân bổ nhân viên thuộc biên chế của cơ sở đó (`assigned_store_id == currentStoreId`).
     - Không xếp một nhân viên vào 2 ca bị trùng thời gian trong cùng một ngày.
     - Mỗi ca trực bắt buộc phải có ít nhất 1 Barista phụ trách quầy bar và 1 Service phụ trách sảnh của cơ sở.
     - Tôn trọng giới hạn số ca tối đa mà một nhân viên có thể làm trong tuần (tránh quá tải).
  2. **Ràng buộc mềm (Soft Constraints):**
     - Ưu tiên cao nhất cho ca mà nhân viên đã đăng ký tại cơ sở (CN03).
     - Cân bằng số giờ làm giữa các nhân viên trong cùng cơ sở.
     - Ưu tiên nhân sự có thâm niên hoặc kỹ năng cao vào các khung giờ cao điểm (Tối Thứ Bảy, Tối Chủ Nhật).

### 3.2 Giao diện Ma Trận Ca & Ràng Buộc Vai Trò
- **Admin:** Có Store Switcher để chọn xem hoặc xếp lịch cho bất kỳ cơ sở nào trong chuỗi.
- **Quản lý:** Có Store Switcher chọn giữa các cơ sở được phân công phụ trách.
- **Trưởng ca (RÀNG BUỘC CỨNG):** Không có Store Switcher, hệ thống tự động khóa vào **ĐÚNG 1 CƠ SỞ CỦA TRƯỞNG CA**. Mọi thao tác xếp ca, sửa ô ca chỉ tác động trên cơ sở đó.
- **Nhân viên & Phó ca vật liệu:** Chế độ Read-only chỉ xem lịch của cơ sở mình.

### 3.3 Xuất file Excel chuẩn hóa theo cơ sở (ExcelJS)
- Tự động xuất file `.xlsx` với tiêu đề hiển thị rõ: "ZONE SIX - BẢNG LỊCH TUẦN [TÊN CƠ SỞ]".
- Kẻ khung rõ ràng, chia cột Thứ, Ca, danh sách nhân viên và tổng số ca trực của từng người tại chi nhánh.

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/scheduling/weekly?store_id=...` | Tất cả vai trò | Lấy dữ liệu ma trận lịch tuần theo cơ sở, tuần và năm |
| `POST` | `/api/v1/scheduling/auto-schedule` | Admin, Quản lý, Trưởng ca, Phó ca lịch | Kích hoạt thuật toán tự động xếp lịch tuần theo cơ sở |
| `PUT` | `/api/v1/scheduling/weekly/slot` | Admin, Quản lý, Trưởng ca, Phó ca lịch | Cập nhật nhân sự thủ công trong một ô ca của cơ sở |
| `GET` | `/api/v1/scheduling/export-excel?store_id=...` | Admin, Quản lý, Trưởng ca, Phó ca lịch | Xuất và tải file Excel lịch tuần của cơ sở |

