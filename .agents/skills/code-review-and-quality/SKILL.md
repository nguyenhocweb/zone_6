---
name: code-review-and-quality
description: >-
  Use this skill to conduct strict, multi-dimensional code reviews, detecting security flaws, race conditions, memory leaks, circular imports in Python, and hydration mismatches in Next.js.
---

# 🧐 Senior Code Review & Quality Assurance Skill

Skill này đóng vai trò một Tech Lead / Senior Pro Max cực kỳ khó tính và tỉ mỉ, đánh giá mã nguồn dựa trên khung 5 trục chất lượng toàn diện.

---

## 🔍 KHUNG ĐÁNH GIÁ 5 TRỤC (5-AXIS AUDIT FRAMEWORK)

### Trục 1: Kiến Trúc & Thiết Kế (Architecture & Design)
- Python Backend có tuân thủ Entity Module không hay đang xé nhỏ file kiểu Node.js?
- Next.js Frontend có tôn trọng phân tầng Feature-Sliced không? Có component nào phình to > 300 dòng không?
- Có vi phạm ranh giới Module (gọi chéo Repository nội bộ) không?

### Trục 2: Hiệu Năng & Đồng Thời (Performance & Concurrency)
- **Backend:** Có vô tình dùng Synchronous DB call trong Async function không? Có câu lệnh N+1 queries trong SQLAlchemy không (thiếu `selectinload` / `joinedload`)? Có dùng `redis.keys()` thay vì `scan_iter()` không?
- **Frontend:** Có bị render loop không? `staleTime` có được cấu hình đúng chuẩn 60s không? Các ảnh lớn có dùng `next/image` không?

### Trục 3: Độ Tin Cậy & Xử Lý Lỗi (Reliability & Resilience)
- Có bẫy exception bằng `except Exception: pass` không (Silent failure - Tối kỵ)?
- Domain Exceptions có được tách biệt khỏi Web HTTP status codes không?
- Frontend có hiển thị thông báo lỗi rõ ràng bằng tiếng Việt cho người dùng không?

### Trục 4: Bảo Mật & Xác Thực (Security & Hardening)
- Có hardcode credentials hoặc token bí mật trong mã nguồn không?
- Các endpoint nhạy cảm có được bảo vệ bằng `require_role` không?
- Input từ người dùng có được validate chặt chẽ qua Pydantic v2 / Zod trước khi xử lý không?

### Trục 5: Tính Kiểm Thử & Dễ Duy Trì (Testability & Maintainability)
- Code mới có đi kèm Unit / Integration Test không?
- Type hint trong Python có đầy đủ không?
- TypeScript có bị lạm dụng `any` không?

---

## 🚦 THANG ĐIỂM ĐÁNH GIÁ VÀ HÀNH ĐỘNG
- **9.0 - 10.0 (Xuất sắc):** Code sạch, chuẩn idiomatic, test đầy đủ $\rightarrow$ Phê duyệt (Approve).
- **7.0 - 8.9 (Đạt nhưng cần tinh chỉnh):** Có một số thiếu sót nhỏ về naming, styling hoặc thiếu test edge-cases $\rightarrow$ Request Changes nhẹ.
- **Dưới 7.0 (Từ chối):** Vi phạm kiến trúc, nguy cơ nghẽn event loop, bảo mật yếu, thiếu test $\rightarrow$ Bắt buộc refactor lại toàn bộ trước khi merge.
