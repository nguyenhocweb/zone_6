---
name: fullstack-orchestrator
description: >-
  Use this skill when initializing a new project or feature, assessing workspace tech stack readiness, conducting trade-off analysis, scaffolding fullstack Python FastAPI and Next.js applications, and establishing initial directories, tests, and documentation.
---

# 🚀 Fullstack Project Orchestrator & Bootstrapper Skill

Skill này đóng vai trò Trưởng Nhóm Kiến Trúc Sư Phần Mềm (Chief Software Architect), chịu trách nhiệm điều phối toàn diện quy trình khởi tạo dự án mới hoặc tính năng mới với cặp bài trùng **Python FastAPI + Next.js App Router**.

---

## 🧭 QUY TRÌNH ĐIỀU PHỐI 4 BƯỚC (WORKFLOW)

### BƯỚC 1: KHẢO SÁT HIỆN TRẠNG & BÀI TOÁN (DISCOVERY)
1. Kiểm tra cấu trúc workspace hiện tại (`list_dir`).
2. Xác định yêu cầu đề tài:
   - Nghiệp vụ chính: E-commerce, Quản trị hệ thống, Đặt chỗ, Mạng xã hội, Tích hợp AI Bot.
   - Các yêu cầu kỹ thuật: SEO SSR, Realtime WebSocket, Tần suất đọc/ghi, Tích hợp LLM.
3. Nếu người dùng đưa ra đề tài mới: Phân tích ưu nhược điểm và xác lập kế hoạch triển khai.

### BƯỚC 2: TỰ ĐỘNG SCAFFOLD DỰ ÁN (100% TỰ HÀNH)
Khi khởi tạo dự án, Agent tự động thiết lập cây thư mục:
1. **Khởi tạo Backend (`backend/`):**
   - Thiết lập môi trường Python (`requirements.txt` hoặc `pyproject.toml` với `fastapi`, `uvicorn`, `pydantic-settings`, `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `redis`).
   - Tạo khung thư mục `backend/app/` (`core/`, `modules/`, `main.py`).
2. **Khởi tạo Frontend (`fe/` hoặc `frontend/`):**
   - Khởi tạo Next.js với TypeScript & TailwindCSS.
   - Cài đặt `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `axios`, `sonner`, `react-icons`.
   - Dựng sẵn khung thư mục `src/core/` và `src/features/`.
3. **Khởi tạo Hạ Tầng Test Cùng Cấp (`tests/`):**
   - `tests/be/`: Pytest configuration, fixtures async, `conftest.py`.
   - `tests/fe/`: Vitest configuration, RTL setup, `setup.ts`.
4. **Khởi tạo Tài Liệu Lưu Trữ Vĩnh Viễn (`docs/`):**
   - `docs/specs/PRD.md`: Bản đặc tả chi tiết nghiệp vụ.
   - `docs/adr/0001_tech_stack_selection.md`: Quyết định kiến trúc.
   - `docs/plans/IMPLEMENTATION_PLAN.md`: Kế hoạch chia nhỏ từng giai đoạn.

### BƯỚC 3: ĐỒNG BỘ TRÍ NHỚ NGOÀI
- Cập nhật tiến độ vào [`.agents/session_state.json`](../../session_state.json).
- Đăng ký bảng ban đầu vào [`.agents/DATABASE_SCHEMA.md`](../../DATABASE_SCHEMA.md).
- Đăng ký query keys vào [`.agents/REACT_QUERY_REGISTRY.md`](../../REACT_QUERY_REGISTRY.md).

### BƯỚC 4: BÀN GIAO & HƯỚNG DẪN KHỞI CHẠY
- Cung cấp câu lệnh khởi chạy đơn giản:
  - Backend: `uvicorn app.main:app --reload --port 8000`
  - Frontend: `npm run dev` (hoặc `pnpm dev`)
  - Chạy test: `pytest` (cho BE) và `npm run test` (cho FE).
