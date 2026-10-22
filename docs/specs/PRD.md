# 📄 BẢN ĐẶC TẢ SẢN PHẨM (PRD): FULLSTACK STARTER PYTHON & NEXT.JS

## 1. TỔNG QUAN HỆ THỐNG
Dự án được xây dựng theo kiến trúc Enterprise Fullstack hiện đại nhất:
- **Backend:** Python 3.13+ với FastAPI, Pydantic v2, SQLAlchemy 2.0 Async, và Redis Caching.
- **Frontend:** Next.js 14+ (App Router), React 19, TypeScript, React Query v5, Zod và TailwindCSS.
- **Cơ chế:** Hoàn toàn độc lập, không phụ thuộc hệ thống xác thực (Auth) để tối ưu hóa thời gian mở rộng nghiệp vụ cho lập trình viên.

---

## 2. PHÂN HỆ NGHIỆP VỤ MẪU: QUẢN LÝ GÓI DỊCH VỤ (SUBSCRIPTION MODULE)
- **Danh sách phân trang:** Hỗ trợ tìm kiếm theo tên gói, lọc trạng thái kích hoạt/tạm dừng, tùy chỉnh số dòng mỗi trang (5, 10, 20).
- **Thêm mới gói dịch vụ:** Form Modal với Zod Client Validation và Pydantic Server Validation.
- **Chỉnh sửa & Cập nhật:** Đồng bộ thông tin nhanh chóng, cập nhật trạng thái trực quan.
- **Xóa an toàn:** Hộp thoại `<ConfirmModal>` xác nhận trước khi xóa, chống vô tình click nhầm.
- **Caching đa tầng:** Backend tự động dọn Redis cache theo pattern khi thêm/sửa/xóa; Frontend tự động vô hiệu hóa React Query cache.

---

## 3. MAPPING DỮ LIỆU ĐỒNG BỘ HAI CHIỀU

| Trường dữ liệu | Backend Model (SQLAlchemy) | Backend DTO (Pydantic v2) | Frontend Form (Zod) | Kiểu dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `Mapped[str]` | `Field(..., min_length=2)` | `z.string().min(2)` | Chuỗi ký tự (Unique) |
| `description` | `Mapped[str \| None]` | `Field(None, max_length=500)`| `z.string().optional()` | Văn bản mô tả |
| `price` | `Mapped[float]` | `Field(..., ge=0)` | `z.coerce.number().min(0)` | Số thực (VND) |
| `duration_days` | `Mapped[int]` | `Field(default=30, gt=0)` | `z.coerce.number().int().min(1)`| Số nguyên ngày |
| `max_projects` | `Mapped[int]` | `Field(default=1, gt=0)` | `z.coerce.number().int().min(1)`| Số lượng slot |
| `is_active` | `Mapped[bool]` | `bool` | `z.boolean()` | Boolean trạng thái |
