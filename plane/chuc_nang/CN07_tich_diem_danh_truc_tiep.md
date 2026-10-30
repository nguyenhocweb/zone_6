# ✅ CN07: TÍCH ĐIỂM DANH TRỰC TIẾP TRÊN Ô CA LÀM (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Cho phép cấp chỉ huy ca trực (Trưởng ca, Quản lý, Admin) xác nhận nhanh sự có mặt của nhân viên ngay trên bảng lịch làm việc tuần của từng cơ sở.
- Xử lý các tình huống thực tế tại quán: Nhân viên điện thoại hết pin không check-in được bằng camera, camera bị lỗi kỹ thuật, hoặc xác nhận sau khi đối soát bằng mắt thường.
- Đồng bộ tức thời trạng thái điểm danh vào cơ sở dữ liệu làm cơ sở đối chiếu tính lương theo từng cơ sở.

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP (QUY ĐỊNH ĐẶC BIỆT & RÀNG BUỘC CƠ SỞ)

| Vai Trò | Hiển Thị Dấu Tích Trên Ô Ca | Quyền Bấm Tích Điểm Danh | Phạm Vi Cơ Sở (Store Scope) |
| :--- | :---: | :---: | :--- |
| `admin_he_thong` | ✅ **Hiển thị** | ✅ Bấm tích / bỏ tích | Toàn quyền xác nhận trên mọi cơ sở |
| `quan_ly` | ✅ **Hiển thị** | ✅ Bấm tích / bỏ tích | Xác nhận trên các cơ sở được phân công |
| `truong_ca` | ✅ **Hiển thị** | ✅ Bấm tích / bỏ tích | **CHỈ ĐƯỢC TÍCH TẠI ĐÚNG 1 CƠ SỞ CỦA MÌNH** |
| `pho_ca_lam_lich` | ❌ **ẨN HOÀN TOÀN** | ❌ **Không có quyền** | **Tuyệt đối không hiển thị dấu tích** |
| `pho_ca_vat_lieu` | ❌ **ẨN HOÀN TOÀN** | ❌ **Không có quyền** | Chế độ Read-only |
| `nhan_vien` | ❌ **ẨN HOÀN TOÀN** | ❌ **Không có quyền** | Chế độ Read-only |

- **Giao diện FE:**
  - Component: `fe/src/features/scheduling/component/WeeklyScheduleTable.tsx`, `ShiftSlotCell.tsx`.
- **Tầng Backend BE:**
  - Route: `be/src/modules/scheduling/routes/scheduling.routes.ts`
  - Controller: `toggle-slot-checkin.controller.ts`
  - Model: `be/src/databases/mongoose/models/weekly-schedule.model.ts` (trường `slots.is_checked_in`, `store_id`).

---

## 3. LOGIC NGHIỆP VỤ & RÀNG BUỘC KỸ THUẬT

### 3.1 Ràng Buộc Cơ Sở Tuyệt Đối Đối Với Trưởng Ca (Strict 1-Store Policy)
- **Trưởng ca chỉ làm việc và phụ trách tại ĐÚNG 1 CƠ SỞ DUY NHẤT:**
  - Giao diện của Trưởng ca chỉ hiển thị bảng lịch của cơ sở mình.
  - Khi Trưởng ca nhấp vào ô ca để tích điểm danh, request gửi kèm `store_id`.
  - Backend kiểm tra chéo:
    ```typescript
    if (currentUser.role === 'truong_ca' && slotStoreId !== currentUser.assigned_store_id) {
      throw new ForbiddenError("Trưởng ca chỉ được tích điểm danh tại đúng cơ sở của mình");
    }
    ```
  - Ngăn chặn hoàn toàn mọi hành vi cố ý can thiệp hoặc chấm công chéo cơ sở.

### 3.2 Quy tắc Phân Ly Trách Nhiệm (Separation of Powers)
- **Vì sao Phó Ca Làm Lịch bị ẩn dấu tích?**
  - Trong vận hành quán Cafe, vai trò lập lịch tuần (`pho_ca_lam_lich`) nắm quyền xếp ai vào ca nào.
  - Nếu cho phép người xếp lịch đồng thời có quyền tích điểm danh, sẽ tạo ra kẽ hở gian lận: Tự xếp mình vào ca rồi tự tích chấm công để nhận tiền lương dù không đi làm.
  - Vì vậy, hệ thống quy định: **Phó ca làm lịch chỉ có quyền xếp lịch, tuyệt đối không được tham gia vào quy trình điểm danh.** Dấu tích bị ẩn hoàn toàn khỏi mã nguồn hiển thị của role này.

### 3.3 Tương Tác Trực Tiếp & Cập Nhật Tức Thời (Optimistic Update)
- Người dùng có thẩm quyền (`admin_he_thong`, `quan_ly`, `truong_ca`) khi nhấp vào ô ca của nhân viên:
  - Nếu ô đang ở trạng thái chưa check-in: Chuyển sang màu xanh lá, xuất hiện con dấu tích tròn kèm nhãn "ĐÃ CHECK-IN".
  - Nếu ô đã check-in: Nhấp lần nữa để bỏ check-in (chuyển về trạng thái chờ).
- Tầng Frontend sử dụng React Query mutation với Optimistic Update để giao diện phản hồi ngay lập tức không có độ trễ, sau đó gửi request PUT ngầm về máy chủ.

---

## 4. DANH SÁCH API ENDPOINTS

| Phương Thức | Endpoint | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `PUT` | `/api/v1/scheduling/weekly/slot/check-in` | Admin, Quản lý, Trưởng ca | Tích hoặc bỏ tích điểm danh trực tiếp cho nhân viên (kiểm tra Store Scope) |

