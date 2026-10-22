# QUY CHUẨN KIỂM THỬ TỰ ĐỘNG (PYTEST ASYNC CHO BACKEND & VITEST CHO FRONTEND)

Tài liệu này quy định kiến trúc và tiêu chuẩn viết Unit Test / Integration Test cho hệ thống Fullstack Python + Next.js, đặt tại thư mục độc lập cùng cấp `tests/`.

---

## 🌳 1. SƠ ĐỒ CẤU TRÚC THƯ MỤC KIỂM THỬ: `tests/`

```text
tests/
├── be/                                                 # [BACKEND TEST PYTHON - MIRROR 1:1 THEO APP/]
│   ├── conftest.py                                     # Pytest fixtures: async client, test DB, mock tokens
│   ├── core/                                           # Test hạ tầng: config, security, exceptions, middlewares
│   │   ├── test_security.py
│   │   └── test_middlewares.py
│   └── modules/                                        # Test nghiệp vụ theo role & feature
│       └── system_admin/
│           └── subscription/
│               ├── test_router.py                      # Integration test HTTP endpoints (httpx.AsyncClient)
│               ├── test_service.py                     # Unit test business logic & domain exceptions
│               ├── test_repository.py                  # Unit test query SQLAlchemy async
│               └── test_schemas.py                     # Unit test Pydantic validation
│
└── fe/                                                 # [FRONTEND TEST NEXT.JS - MIRROR 1:1 THEO FE/SRC/]
    ├── setup.ts                                        # JSDom setup, matchers jest-dom, mocks matchMedia
    ├── utils/test-query-client.tsx                     # QueryClientProvider wrapper sạch cho test hooks
    ├── core/                                           # Test hạ tầng core: axios-instance, validations, hooks
    │   ├── api/test_axios.test.ts
    │   └── hooks/useDebounce.test.ts
    └── features/                                       # Test UI, Hooks, Schemas của từng feature
        └── system_admin/
            └── subscriptions/
                ├── component/SubscriptionsList.test.tsx
                ├── hook/useCreateSubscription.test.ts
                ├── service/subscription.service.test.ts
                └── schema/subscription.schema.test.ts
```

---

## 🐍 2. BACKEND TEST STANDARDS (PYTEST + ASYNCIO + HTTPX)

### A. Fixtures Toàn Cục (`tests/be/conftest.py`):
```python
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.database import Base, get_db

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture
async def db_session(test_engine):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)
    async with session_factory() as session:
        yield session
        await session.rollback()

@pytest_asyncio.fixture
async def async_client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()
```

### B. Unit Test Service (`tests/be/modules/.../test_service.py`):
```python
import pytest
from unittest.mock import AsyncMock
from app.modules.system_admin.subscription.service import SubscriptionService
from app.modules.system_admin.subscription.schemas import SubscriptionCreate
from app.core.exceptions.conflict import ConflictException

@pytest.mark.asyncio
async def test_create_subscription_duplicate_name_raises_conflict():
    mock_repo = AsyncMock()
    mock_repo.get_by_name.return_value = {"id": "123", "name": "VIP"}
    service = SubscriptionService(repo=mock_repo)

    payload = SubscriptionCreate(name="VIP", price=100000, duration_days=30)
    with pytest.raises(ConflictException):
        await service.create_subscription(payload)
```

---

## ⚛️ 3. FRONTEND TEST STANDARDS (VITEST + REACT TESTING LIBRARY)

- Không mock Axios thủ công; bọc `QueryClientProvider` sạch với `retry: false`:
```typescript
// tests/fe/features/system_admin/subscriptions/hook/useCreateSubscription.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useCreateSubscription } from "@/src/features/system_admin/subscriptions/hook/useCreateSubscription";
import * as subService from "@/src/features/system_admin/subscriptions/service/subscription.create.service";

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCreateSubscription Hook", () => {
  it("Thực thi thành công mutation và gọi callback", async () => {
    vi.spyOn(subService, "createSubscriptionService").mockResolvedValue({
      data: { success: true, message: "OK" }
    } as any);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreateSubscription(onSuccess), { wrapper: createWrapper() });

    result.current.mutate({ name: "Gói Mới", price: 50000, duration_days: 30 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalled();
  });
});
```
