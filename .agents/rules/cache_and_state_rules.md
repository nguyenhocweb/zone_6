# QUY CHUẨN CACHING ĐA TẦNG (REDIS ASYNCIO CHO PYTHON & REACT QUERY CHO NEXT.JS)

Tài liệu này là quy định bắt buộc nhằm tối ưu tốc độ phản hồi (High Performance) và triệt tiêu triệt để tình trạng dữ liệu lỗi thời (Stale Data) giữa Backend và Frontend.

---

## 🏛️ 1. NGUYÊN TẮC PHÂN CẤP REDIS KEYS

$$\mathbf{app}:[\mathbf{env}]:[\mathbf{module}]:[\mathbf{entity}]:[\mathbf{id}]:[\mathbf{scope}]$$

- `app`: Viết tắt dự án (mặc định: `app`).
- `env`: Môi trường (`prod`, `staging`, `dev`).
- `module`: Phân hệ (`auth`, `admin`, `brand`, `restaurant`, `order`).
- `entity`: Đối tượng CSDL (`user`, `subscription`, `menu`, `table`).
- `id`: ID đối tượng UUID hoặc ID định danh.
- `scope`: Phạm vi dữ liệu (`detail`, `active_list`, `stats`).

---

## 🐍 2. PYTHON REDIS HELPER CHUẨN (`core/utils/redis_client.py`)

- **CẤM dùng lệnh `keys(pattern)`:** Gây treo single-thread của Redis server trên production! Bắt buộc dùng `scan_iter`.
- **Tích hợp Pydantic serialization và TTL Jitter:**

```python
import json
import random
from typing import Any
import redis.asyncio as aioredis
from app.core.config import settings

redis_pool = aioredis.ConnectionPool.from_url(
    settings.REDIS_URL, decode_responses=True, max_connections=20
)

def get_redis() -> aioredis.Redis:
    return aioredis.Redis(connection_pool=redis_pool)

class RedisCache:
    @staticmethod
    async def get_json(key: str) -> Any | None:
        client = get_redis()
        data = await client.get(key)
        return json.loads(data) if data else None

    @staticmethod
    async def set_json(key: str, value: Any, ttl: int = 3600) -> None:
        client = get_redis()
        jitter = random.randint(5, 60)
        # Hỗ trợ Pydantic model hoặc dict
        payload = value.model_dump_json() if hasattr(value, "model_dump_json") else json.dumps(value)
        await client.set(key, payload, ex=ttl + jitter)

    @staticmethod
    async def delete_keys(*keys: str) -> None:
        if not keys:
            return
        client = get_redis()
        await client.delete(*keys)

    @staticmethod
    async def delete_pattern(pattern: str) -> None:
        client = get_redis()
        async for key in client.scan_iter(match=pattern):
            await client.delete(key)
```

---

## 🔄 3. MÔ HÌNH CACHE-ASIDE TRONG SERVICE PYTHON

1. **Khi Đọc (Read):**
   - Check Redis Cache trước $\rightarrow$ Cache Hit: Parse JSON trả về ngay.
   - Cache Miss $\rightarrow$ Query DB qua Repository $\rightarrow$ Ghi vào Redis với TTL $\rightarrow$ Trả về dữ liệu.
2. **Khi Ghi / Sửa / Xóa (Write / Update / Delete):**
   - Cập nhật DB qua Repository thành công.
   - Xóa ngay lập tức key tương ứng trong Redis (`RedisCache.delete_keys(...)`). Tuyệt đối không write-through để tránh race condition.

---

## ⚛️ 4. LIÊN KẾT ĐỒNG BỘ VỚI REACT QUERY FRONTEND

- Khi Frontend thực hiện thao tác thay đổi dữ liệu (ví dụ: tạo gói dịch vụ mới), Backend xóa Redis Cache và trả về HTTP 201/200.
- Frontend Mutation Hook nhận kết quả thành công $\rightarrow$ Lập tức kích hoạt `queryClient.invalidateQueries` theo QueryKey tương ứng đã đăng ký tại `.agents/REACT_QUERY_REGISTRY.md`.
- Nhờ đó, Frontend tải lại dữ liệu mới nhất trực tiếp từ Backend (vừa được query sạch từ DB và lưu lại vào cache).
