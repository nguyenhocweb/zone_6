---
name: nextjs-app-router-expert
description: >-
  Use this skill when developing, refactoring, or optimizing Next.js App Router applications, implementing Feature-Sliced Architecture, React Query v5 caching and mutations, Zod form validation, and Server/Client Component boundaries.
---

# ⚛️ Next.js App Router & React Query v5 Expert Skill

Skill này hướng dẫn Agent thiết kế và phát triển Frontend Next.js chuyên nghiệp, đảm bảo hiệu năng cao, trải nghiệm người dùng mượt mà và code base sạch sẽ dễ bảo trì.

---

## 🛠️ QUY TRÌNH TRIỂN KHAI MỘT TÍNH NĂNG FEATURE MỚI

Khi phát triển một feature tại `fe/src/features/[role]/[feature]/`:

### Bước 1: Khai Báo TypeScript Types (`type/[feature].type.ts`)
- Định nghĩa interface dữ liệu thực thể `[Feature]`, payload tạo mới/chỉnh sửa, và định dạng response từ Backend Python.

### Bước 2: Thiết Lập Zod Validation Schemas (`schema/[feature].[action].schema.ts`)
- Viết schema xác thực form cho từng thao tác Create, Update.
- Trích xuất inferred type bằng `z.infer<typeof schema>`.
- Khớp chặt chẽ với quy chuẩn Pydantic schema ở Backend.

### Bước 3: Viết HTTP Services (`service/[feature].[action].service.ts`)
- Tách nhỏ từng file: `[feature].get.service.ts`, `[feature].create.service.ts`,...
- Luôn sử dụng default export `import axiosClient from "@/src/core/api/axios-instance"`.

### Bước 4: Viết React Query Hooks (`hook/use[Action][Feature].ts`)
- Tách nhỏ từng hook: `useGet[Feature].ts` (chứa `staleTime: 60 * 1000` và QueryKey từ factory), `useCreate[Feature].ts` (Mutation kèm toast và invalidation).
- Đăng ký QueryKey mới vào [`.agents/REACT_QUERY_REGISTRY.md`](../../REACT_QUERY_REGISTRY.md).

### Bước 5: Xây Dựng UI Components (`component/`)
- Tách nhỏ thành: `[Feature]List.tsx`, `Create[Feature]Modal.tsx`, `Update[Feature]Modal.tsx`, `[Feature]StatsCards.tsx`.
- Gắn `"use client";` tại các component cần tương tác hoặc dùng hooks.
- Bọc toàn bộ container trong animation wrapper `<FadeIn>`.
- Hiển thị Skeleton loading khi `isLoading = true`.

### Bước 6: Mount Vào Next.js App Route (`fe/src/app/(dashboard)/.../page.tsx`)
- Giữ file `page.tsx` ở mức mỏng tối đa. Mount component của feature vào và bọc trong Suspense / HydrationBoundary nếu cần.

---

## 📋 CHECKLIST KIỂM SOÁT CHẤT LƯỢNG (FRONTEND CHECKLIST)

- [ ] Component không gọi `axiosClient` trực tiếp mà thông qua hook.
- [ ] Không có `zodResolver as any` (phải đảm bảo 100% type safety).
- [ ] Bảng dữ liệu có phân trang đầy đủ (Pagination).
- [ ] Nút submit form có trạng thái disable và loading spinner khi đang gửi dữ liệu.
- [ ] Mọi hành động xóa đều kích hoạt `<ConfirmModal>`.
