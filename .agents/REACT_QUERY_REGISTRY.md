# DANH BẠ ĐĂNG KÝ QUERY KEYS FRONTEND (REACT QUERY / TANSTACK QUERY V5)

Tài liệu này lưu vết toàn bộ các QueryKey trong Frontend để tránh trùng lặp key, đảm bảo tính phân cấp đồng nhất và vô hiệu hóa cache chính xác (invalidation).

---

## 🔑 NGUYÊN TẮC CẤU TRÚC QUERYKEY

Tất cả QueryKey BẮT BUỘC là **mảng phân cấp**:
```typescript
[ROLE_OR_SCOPE, ENTITY_NAME, OPTIONAL_ID, OPTIONAL_FILTERS_OBJECT]
```

---

## 📋 BẢNG TRA CỨU DANH BẠ QUERY KEYS

| Role / Scope | Thực Thể (Entity) | QueryKey Template | Hook Quản Lý | Invalidation Trigger (Khi Nào Xóa Cache?) |
| :--- | :--- | :--- | :--- | :--- |
| `system_admin` | `subscriptions` | `['system_admin', 'subscriptions', filters]` | `useGetSubscriptions` | Khi tạo/sửa/xóa gói dịch vụ (`useCreateSubscription`, `useDeleteSubscription`) |
| `system_admin` | `users` | `['system_admin', 'users', filters]` | `useGetAdminUsers` | Khi khóa/mở khóa/đổi vai trò user |
| `brand_owner` | `restaurants` | `['brand_owner', 'restaurants', brandId, filters]` | `useGetBrandRestaurants` | Khi thêm/sửa chi nhánh |
| `brand_owner` | `menus` | `['brand_owner', 'menus', brandId]` | `useGetBrandMenus` | Khi cập nhật menu/món ăn |
| `public` | `restaurants` | `['public', 'restaurants', filters]` | `useGetPublicRestaurants` | Dữ liệu công khai, refresh theo filter |
| `shared` | `profile` | `['shared', 'profile']` | `useGetProfile` | Khi cập nhật thông tin cá nhân hoặc đổi mật khẩu |
| `zalo` | `bot` | `['zalo', 'status']` | `useZaloStatus` | Khi quét QR thành công, đăng xuất, gửi tin nhắn |
| `zalo` | `config` | `['zalo', 'config']` | `useZaloConfig` | Khi lưu hoặc cập nhật cấu hình kênh nhận tin Zalo vào database (`useUpdateZaloConfig`) |
| `zalo` | `groups` | `['zalo', 'groups']` | `useZaloGroups` | Khi tài khoản Zalo bot đăng nhập và tải danh sách nhóm tham gia |
| `scheduling` | `notifications` | `['scheduling', 'notifications', filters]` | `useScheduleNotifications` | Khi tích check-in, đổi slot, đánh dấu đã đọc hoặc ẩn thông báo |
| `shared` | `staff` | `['staff', 'list', filters]` | `useGetStaff` | Khi tạo tài khoản nhân viên mới (`useCreateStaff`) hoặc cập nhật nhân sự |
| `system_admin` | `checkinConfig` | `['checkinConfig', 'current']` / `['checkinConfig', 'store', storeId]` | `useCheckinConfig` | Khi cập nhật tọa độ quán, bán kính GPS hoặc thời gian trước/sau ca và Thuế VAT theo từng chi nhánh (`useUpdateCheckinConfig`) |
| `scheduling` | `attendance` | `['scheduling', 'attendance', 'slot', slotParams]` | `useSlotAttendance` | Khi check-in ca làm có ảnh (`useCheckInShift`) hoặc hủy điểm danh |
| `scheduling` | `attendance_week` | `['scheduling', 'attendance', 'week', weekStartDate]` | `useWeekAttendances` | Tự động đồng bộ toàn bộ ảnh & lịch sử check-in của tuần |
| `pho_ca_vat_lieu` | `materials` | `['pho_ca_vat_lieu', 'materials', filters]` | `useGetMaterials` | Khi thêm/sửa/xóa vật liệu hoặc điều chỉnh tồn kho (`useAdjustStock`) |
| `pho_ca_vat_lieu` | `recipe_categories` | `['pho_ca_vat_lieu', 'recipes', 'categories']` | `useGetRecipeCategories` | Khi tạo danh mục món mới (`useCreateRecipeCategory`) hoặc tạo món kèm danh mục mới |
| `pho_ca_vat_lieu` | `sellable_toppings` | `['pho_ca_vat_lieu', 'sellable_toppings', filters]` | `useGetSellableToppings` | Khi cập nhật cách bán hoặc giá bán lẻ topping (`useUpdateSellableTopping`), đồng bộ tự động từ kho |
| `pho_ca_vat_lieu` | `inventoryAudits` | `['inventoryAudits', 'list', filters]` | `useGetInventoryAudits`, `useGetInventoryAuditDetail` | Khi nộp phiếu kiểm kho (`useCreateInventoryAudit`), chỉnh sửa phiếu hoặc đồng bộ tồn kho (`useUpdateInventoryAudit`) |
| `admin_he_thong` | `suppliers` | `['suppliers', 'list', filters]` | `useGetSuppliers`, `useGetSupplierDetail` | Khi thêm/sửa/xóa nhà cung cấp đối tác (`useCreateSupplier`, `useUpdateSupplier`, `useDeleteSupplier`) |
| `pho_ca_lam_lich` | `shiftConfigs` | `['shiftConfigs', 'list', storeId]` | `useGetShiftConfigs` | Khi thêm, sửa, xóa ca làm hoặc khôi phục 4 ca mặc định (`useCreateShiftConfig`, `useUpdateShiftConfig`, `useDeleteShiftConfig`, `useResetShiftConfigs`) |
| `pho_ca_vat_lieu` | `purchase_requisitions` | `['purchase_requisitions', 'list', params]` | `useGetRequisitions`, `useGetRequisitionSuggestions` | Khi tạo phiếu yêu cầu nhập kho (`useCreateRequisition`) hoặc duyệt phiếu (`useUpdateRequisitionStatus`) |
| `quan_ly` | `purchase_orders` | `['purchase_orders', 'list', params]` | `useGetPurchaseOrders`, `useGetPurchaseOrderById` | Khi tạo đơn thu mua PO (`useCreatePoFromRequisitions`) hoặc xác nhận nhập kho (`useReceivePo`) |
| `admin_he_thong` | `tables` | `['admin_he_thong', 'tables', params]` | `useTables` | Khi tạo, sửa, xóa bàn, đổi trạng thái qua Socket thời gian thực (`table:updated`), hoặc đổi mã token QR |
| `admin_he_thong` | `table_zones` | `['admin_he_thong', 'table_zones', storeId]` | `useTableZones` | Khi tạo hoặc xóa tầng/khu vực (`useCreateTableZone`, `useDeleteTableZone`) |
| `admin_he_thong` | `table_shift_status` | `['admin_he_thong', 'table_shift_status', storeId]` | `useTableShiftStatus` | Kiểm tra quyền nhân viên trong ca trước khi cho phép bấm nút đổi trạng thái bàn |
| `admin_he_thong` | `payos_configs` | `['admin_he_thong', 'payos_configs']` | `usePayOS` | Khi thêm/sửa/xóa hoặc đổi tài khoản chính PayOS (`useCreatePayOSConfig`, `useUpdatePayOSConfig`, `useDeletePayOSConfig`, `useSetDefaultPayOSConfig`) |
| `pos` / `shared` | `payos_default` | `['payos', 'default']` | `useGetDefaultPayOSConfig` | Tự động đồng bộ tài khoản ngân hàng thụ hưởng cho POS và QR tại bàn khi có thay đổi |
| `pos` | `orders` | `['pos', 'orders', 'all', params]` | `useOrderManagement` | Khi tạo đơn mới, thanh toán hoặc hủy hóa đơn (`useVoidOrder`) |

---

## 🏭 QUERYKEY FACTORY CHUẨN (`fe/src/core/constants/query-keys.ts`)

```typescript
export const queryKeys = {
  admin: {
    all: ['system_admin'] as const,
    subscriptions: (filters?: Record<string, unknown>) => ['system_admin', 'subscriptions', filters] as const,
    subscriptionDetail: (id: string) => ['system_admin', 'subscriptions', id] as const,
    users: (filters?: Record<string, unknown>) => ['system_admin', 'users', filters] as const,
  },
  brand: {
    all: ['brand_owner'] as const,
    restaurants: (brandId: string, filters?: Record<string, unknown>) => ['brand_owner', 'restaurants', brandId, filters] as const,
  },
  shared: {
    profile: ['shared', 'profile'] as const,
    notifications: ['shared', 'notifications'] as const,
  }
} as const;
```
