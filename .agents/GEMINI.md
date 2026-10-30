# GEMINI & ANTIGRAVITY AGENT CONFIGURATION

This project operates strictly on:
- **Backend**: Node.js (Express.js + Zod + Mongoose/Prisma + TypeScript/ESM) under `be/src/`.
- **Frontend**: Next.js 14+ using App Router, TypeScript, React Query (@tanstack/react-query v5), Zod, and TailwindCSS under `fe/src/`.
- **Database**: MongoDB Atlas (Database: `zone_6`).

Refer to:
- Master Rules: [.agents/AGENTS.md](./AGENTS.md)
- Single Source of Truth (Nghiệp vụ, Vai trò, Chức năng, Luồng & Giám sát):
  - Master Plane: [plane/README.md](../plane/README.md)
  - Mô tả Vai Trò: [plane/vai_tro/](../plane/vai_tro/README.md)
  - Mô tả Chức Năng: [plane/chuc_nang/](../plane/chuc_nang/README.md)
  - Luồng Hoạt Động: [plane/luong_hoat_dong/](../plane/luong_hoat_dong/README.md)
  - Bảng Tiến Độ & Nhật Ký Giám Sát (Bắt buộc cập nhật khi code): [plane/giam_sat/](../plane/giam_sat/README.md)
- Backend Node.js Rules: [.agents/rules/backend_express_rules.md](./rules/backend_express_rules.md)
- Next.js Rules: [.agents/rules/nextjs_app_router_rules.md](./rules/nextjs_app_router_rules.md)
- Database Schema: [.agents/DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Prisma & Seed Rules: [.agents/rules/prisma_mongo_database_rules.md](./rules/prisma_mongo_database_rules.md)
- React Query Registry: [.agents/REACT_QUERY_REGISTRY.md](./REACT_QUERY_REGISTRY.md)
- Skills: [.agents/skills/](./skills/)

