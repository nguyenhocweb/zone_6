---
name: test-driven-py-next
description: >-
  Use this skill to enforce Test-Driven Development (TDD) across Python FastAPI (Pytest, pytest-asyncio, httpx) and Next.js (Vitest, React Testing Library), ensuring tests are written before or alongside implementation.
---

# 🧪 Test-Driven Development (TDD) for Python & Next.js Skill

Skill này áp dụng kỷ luật TDD tuyệt đối (Red -> Green -> Refactor), bảo đảm tính toàn vẹn và độ tin cậy 100% cho mọi thay đổi mã nguồn.

---

## 🚦 VÒNG ĐỜI TDD 3 BƯỚC

```text
[1. RED: Viết Test Thất Bại] ──> [2. GREEN: Viết Code Tối Thiểu Để Pass] ──> [3. REFACTOR: Tối Ưu & Dọn Dẹp]
```

### 1. Viết Test Đỏ (Red)
- Xác định rõ hành vi kỳ vọng của tính năng.
- Tạo file test tương ứng trong `tests/be/` hoặc `tests/fe/` trước khi viết code nghiệp vụ.
- Chạy test và xác nhận test thất bại vì lý do chính đáng (chưa có code).

### 2. Viết Code Xanh (Green)
- Viết lượng code tối thiểu cần thiết để test vượt qua (pass).
- Tránh thêm thắt các tính năng nằm ngoài phạm vi của test case hiện tại.

### 3. Tái Cấu Trúc (Refactor)
- Tối ưu hóa thuật toán, cấu trúc code, loại bỏ duplicate code.
- Chạy lại toàn bộ test suite để đảm bảo không làm gãy các tính năng hiện hữu (regression test).

---

## 🎯 QUY TẮC MOCK CHUẨN MỰC

1. **Backend Python (Pytest):**
   - Unit test Service: Mock Repository bằng `unittest.mock.AsyncMock`.
   - Integration test Router: Không mock Service; sử dụng SQLite In-memory và `app.dependency_overrides[get_db]`.
2. **Frontend Next.js (Vitest):**
   - Unit test Hooks: Wrap bằng `QueryClientProvider` sạch với `retry: false`.
   - Test Component: Tìm kiếm phần tử theo Accessible Roles (`screen.getByRole("button", { name: ... })`), tránh tìm kiếm bằng class CSS hay test-id tùy tiện.
