---
name: python-fastapi-architect
description: >-
  Use this skill when developing, refactoring, or reviewing Python FastAPI backend architectures, including Entity-based modules (router, schemas, service, repository, models), Pydantic v2 validation, SQLAlchemy 2.0 AsyncSession pipelines, and Alembic migrations.
---

# 🐍 Python FastAPI & SQLAlchemy 2.0 Async Architect Skill

Skill này hướng dẫn Agent xây dựng và mở rộng hệ thống Backend Python chuẩn Enterprise, tuân thủ chặt chẽ Python Idiom, PEP 8, và Asyncio Concurrency.

---

## 🛠️ QUY TRÌNH TRIỂN KHAI MỘT ENTITY MODULE MỚI

Khi tạo một tính năng mới trong `backend/app/modules/[role]/[feature]/`:

### Bước 1: Khởi tạo Model CSDL (`models.py`)
- Kế thừa từ `Base` và `TimestampMixin` tại `app/core/database.py`.
- Định nghĩa rõ `Mapped[T] = mapped_column(...)`, Indexes và Foreign Key cascades.
- Đăng ký tên bảng và class vào [`.agents/DATABASE_SCHEMA.md`](../../DATABASE_SCHEMA.md).

### Bước 2: Khởi tạo Pydantic Schemas (`schemas.py`)
- Định nghĩa các schemas: `[Entity]Base`, `[Entity]Create`, `[Entity]Update`, `[Entity]Response`, `[Entity]FilterParams`.
- Bắt buộc gắn `model_config = ConfigDict(from_attributes=True)` vào Response schema để tương thích với SQLAlchemy ORM model.
- Sử dụng `Field(..., min_length=..., ge=...)` để tự động validate và sinh OpenAPI docs chính xác.

### Bước 3: Khởi tạo Tầng Truy Vấn Repository (`repository.py`)
- Nhận `db: AsyncSession` qua constructor.
- Sử dụng cú pháp SQLAlchemy 2.0: `select(Model).where(...)`, `await self.db.execute(...)`, `result.scalars().all()`.
- Tuyệt đối không chứa logic nghiệp vụ hay validate quyền hạn tại đây.

### Bước 4: Khởi tạo Tầng Nghiệp Vụ Service (`service.py`)
- Nhận Repository qua constructor.
- Thực hiện kiểm tra tính toàn vẹn (tên đã tồn tại chưa, số dư có đủ không).
- Khi có lỗi nghiệp vụ, ném Domain Exception từ `app/core/exceptions/` (ví dụ `ConflictException`, `NotFoundException`).
- Thực hiện cache invalidation qua `RedisCache` khi thêm/sửa/xóa.

### Bước 5: Khởi tạo Tầng Định Tuyến Router (`router.py`)
- Khai báo `router = APIRouter(prefix="/...", tags=["..."])`.
- Tiêm dependencies: `db: AsyncSession = Depends(get_db)` và `current_user = Depends(require_role([...]))`.
- Gọi hàm của Service và trả về response model thích hợp (status code 200, 201).

---

## 📋 CHECKLIST KIỂM SOÁT CHẤT LƯỢNG (ARCHITECTURAL CHECKLIST)

- [ ] Không có file xé vụn CRUD kiểu Node.js (`.create.py`).
- [ ] Không có `import` gây Circular Dependency giữa các module.
- [ ] Mọi endpoint async đều sử dụng `AsyncSession` và các câu lệnh `await`.
- [ ] Không sử dụng `HTTPException` trực tiếp trong `service.py` hay `repository.py`.
- [ ] Đã thêm Migration file trong Alembic nếu có thay đổi Model CSDL.
