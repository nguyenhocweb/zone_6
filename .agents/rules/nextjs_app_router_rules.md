# QUY CHUẨN KỸ THUẬT FRONTEND NEXT.JS (APP ROUTER + REACT QUERY V5 + TYPESCRIPT)

Tài liệu này là quy định bắt buộc khi xây dựng giao diện và kiến trúc phía Frontend Next.js. Mọi lập trình viên và Agent phải tuân thủ nghiêm ngặt theo các tiêu chuẩn dưới đây.

---

## 🏛️ 1. CẤU TRÚC THƯ MỤC CHUẨN: `fe/src/`

```text
fe/src/
├── app/                                                # [NEXT.JS APP ROUTER]
│   ├── (dashboard)/                                    # Routes yêu cầu đăng nhập (Dashboard Layout)
│   │   ├── system/                                     # System Admin pages
│   │   │   └── subscriptions/page.tsx                  # Mount Feature Component
│   │   └── layout.tsx                                  # Sidebar, Header, Auth Guard
│   ├── (public)/                                       # Routes công khai (Landing, Docs, Login)
│   ├── layout.tsx                                      # Root layout: Fonts, QueryProvider, Toaster
│   └── globals.css                                     # Global styling & Tailwind directives
│
├── core/                                               # [HẠ TẦNG DÙNG CHUNG CỐT LÕI]
│   ├── api/                                            # Axios instance với interceptors tự gắn token & refresh
│   │   └── axios-instance.ts
│   ├── components/                                     # UI Primitives & Global Layouts (Modal, Button, Input)
│   ├── hooks/                                          # Hooks tiện ích (useDebounce, usePagination, useSocket)
│   ├── lib/                                            # Lib helpers (validations Zod templates, errorFormatters)
│   └── constants/                                      # QueryKey Factory, Roles, Route paths
│
└── features/                                           # [CHỨC NĂNG NGHIỆP VỤ FEATURE-SLICED]
    └── [role]/[feature]/
        ├── component/                                  # UI nhỏ gọn (List, Form, Detail, Stats)
        ├── hook/                                       # Custom React Query Hooks (useGet..., useCreate...)
        ├── service/                                    # Gọi API qua axiosClient chuẩn
        ├── schema/                                     # Zod validation schemas
        └── type/                                       # TypeScript interfaces
```

---

## ⚡ 2. RANH GIỚI SERVER COMPONENTS (RSC) VS CLIENT COMPONENTS

- **Mặc định:** Toàn bộ file `page.tsx` và `layout.tsx` là **React Server Components (RSC)**.
- **Client Components:** Chỉ đánh dấu `"use client";` tại đầu file khi:
  - Có sử dụng React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
  - Có sự kiện tương tác (`onClick`, `onChange`, `onSubmit`).
  - Sử dụng React Query custom hooks (`useQuery`, `useMutation`).
  - Sử dụng browser API (`window`, `localStorage`).
- **Server-to-Client Prefetching:** Đối với trang yêu cầu SEO và tải nhanh dữ liệu đầu tiên, sử dụng `HydrationBoundary` của `@tanstack/react-query`:
  ```tsx
  // app/(dashboard)/system/subscriptions/page.tsx (Server Component)
  import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
  import { SubscriptionsList } from "@/src/features/system_admin/subscriptions/component/SubscriptionsList";

  export default async function SubscriptionsPage() {
    const queryClient = new QueryClient();
    // (Tùy chọn) Prefetch data trên server
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SubscriptionsList />
      </HydrationBoundary>
    );
  }
  ```

---

## 🎣 3. QUY CHUẨN REACT QUERY V5 & CACHING

1. **Luôn cấu hình `staleTime: 60 * 1000` (1 phút)** trong mọi `useQuery` để tránh nghẽn request khi chuyển tab.
2. **QueryKey phân cấp bằng mảng** định nghĩa qua `QueryKey Factory`.
3. **Mọi Mutation (Tạo, Sửa, Xóa)** BẮT BUỘC:
   - Hiển thị toast thông báo trạng thái (`toast.success` hoặc `toast.error` từ `sonner`).
   - Gọi `queryClient.invalidateQueries({ queryKey: [...] })` trong `onSuccess`.
   - Vô hiệu hóa nút Submit (`disabled={isPending}`) kèm icon loading khi đang xử lý.

```typescript
// features/system_admin/subscriptions/hook/useCreateSubscription.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSubscriptionService } from "../service/subscription.create.service";
import { CreateSubscriptionFormValues } from "../schema/subscription.create.schema";
import { queryKeys } from "@/src/core/constants/query-keys";

export const useCreateSubscription = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionFormValues) => createSubscriptionService(data),
    onSuccess: () => {
      toast.success("Tạo gói dịch vụ thành công!");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.subscriptions() });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo gói dịch vụ!");
    },
  });
};
```

---

## 📝 4. FORM VALIDATION VỚI ZOD & REACT HOOK FORM

- Tuyệt đối KHÔNG dùng `as any` cho `zodResolver`. Cần định nghĩa type signature khớp 100%:
```typescript
import { z } from "zod";

export const createSubscriptionSchema = z.object({
  name: z.string().min(2, "Tên gói phải từ 2 ký tự trở lên").max(100, "Tên gói tối đa 100 ký tự"),
  price: z.number({ invalid_type_error: "Giá tiền phải là số" }).min(0, "Giá tiền không được âm"),
  duration_days: z.number().int().min(1, "Thời hạn tối thiểu là 1 ngày"),
});

export type CreateSubscriptionFormValues = z.infer<typeof createSubscriptionSchema>;
```

---

## 🚫 5. CÁC ĐIỀU CẤM KỴ TUYỆT ĐỐI (NEXT.JS ZERO TOLERANCE)

1. **CẤM gọi `axiosClient` trực tiếp trong Component:** Mọi thao tác HTTP phải thông qua custom hook React Query.
2. **CẤM TUYỆT ĐỐI dùng `alert()`, `confirm()`, `prompt()` của trình duyệt:** Nghiêm cấm 100% việc gọi `alert()`, `confirm()`, `prompt()` hoặc `window.alert()`, `window.confirm()`, `window.prompt()`. Tất cả thông báo validation, cảnh báo và lỗi BẮT BUỘC dùng `toast` từ `sonner` (`toast.error()`, `toast.warning()`, `toast.success()`, `toast.info()`). Tất cả các thao tác xác nhận hành động (xóa, hủy, đổi trạng thái...) BẮT BUỘC sử dụng `<ConfirmModal>` (`@/core/components/ui/ConfirmModal`) đồng bộ phong cách Obsidian Gold của hệ thống.
3. **CẤM quên Animation và Loading Skeleton:** Giao diện khi fetch dữ liệu phải có Skeleton state, các card phải bọc hiệu ứng mượt mà (`<FadeIn>`).
4. **CẤM thiếu phân trang (Pagination):** Bất kỳ danh sách nào cũng phải hỗ trợ phân trang và chọn rows per page.
5. **CẤM hardcode URL:** URL API luôn dùng biến môi trường `NEXT_PUBLIC_API_URL`.
