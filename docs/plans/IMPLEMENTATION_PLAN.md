# 📋 KẾ HOẠCH TRIỂN KHAI & HƯỚNG DẪN VẬN HÀNH DỰ ÁN

## 1. CÂY THƯ MỤC DỰ ÁN TỔNG THỂ

```text
zone_6/
├── backend/                                            # 🐍 PYTHON FASTAPI BACKEND
│   ├── app/
│   │   ├── core/                                       # Hạ tầng config, database async, middlewares, exceptions
│   │   ├── modules/
│   │   │   └── subscription/                           # Module mẫu Entity đầy đủ (router, schemas, service, repo, models)
│   │   └── main.py                                     # Entrypoint FastAPI & Lifespan
│   ├── .env                                            # Biến môi trường
│   ├── requirements.txt                                # Thư viện phụ thuộc
│   └── .venv/                                          # Virtual environment cô lập
│
├── fe/                                                 # ⚛️ NEXT.JS 14+ APP ROUTER FRONTEND
│   ├── src/
│   │   ├── app/                                        # Layout & Pages
│   │   ├── core/                                       # Axios client, Providers, UI ConfirmModal, FadeIn
│   │   └── features/
│   │       └── subscriptions/                          # Feature-Sliced: component, hook, service, schema, type
│   └── package.json                                    # Dependencies & Scripts
│
├── tests/                                              # 🧪 HẠ TẦNG TEST ĐỘC LẬP CÙNG CẤP
│   ├── be/                                             # Pytest Async tests (fixtures in-memory, service, router)
│   └── fe/                                             # Vitest Frontend tests (Zod schema, React Query hooks)
│
├── docs/                                               # 📁 KHO TÀI LIỆU VĨNH VIỄN
│   ├── specs/PRD.md                                    # Đặc tả nghiệp vụ
│   └── plans/IMPLEMENTATION_PLAN.md                    # Kế hoạch vận hành
│
└── .agents/                                            # 🧠 BỘ NHỚ NGOÀI & SKILLS CHUẨN ANTIGRAVITY
    ├── AGENTS.md                                       # Master rules
    ├── DATABASE_SCHEMA.md                              # Schema registry
    ├── REACT_QUERY_REGISTRY.md                         # QueryKey registry
    ├── session_state.json                              # Tiến độ làm việc
    ├── rules/                                          # Python, Next.js, Testing, Cache rules
    └── skills/                                         # 6 Skills điều phối chuyên sâu
```

---

## 2. HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### A. Chạy Backend Python:
```bash
cd backend
# Kích hoạt virtualenv
.\.venv\Scripts\activate
# Chạy server FastAPI
uvicorn app.main:app --reload --port 8000
```
- Swagger UI Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### B. Chạy Frontend Next.js:
```bash
cd fe
npm run dev
```
- Truy cập giao diện: [http://localhost:3000](http://localhost:3000)

### C. Chạy Kiểm Thử (Tests):
- **Backend (Pytest):**
  ```bash
  cd backend
  .\.venv\Scripts\pytest ../tests/be/ -v
  ```
- **Frontend (Vitest):**
  ```bash
  cd fe
  npx vitest run ../tests/fe/
  ```
