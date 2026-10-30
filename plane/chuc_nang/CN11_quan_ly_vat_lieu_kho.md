# 📦 CN11: QUẢN LÝ NGUYÊN VẬT LIỆU & TỒN KHO THEO CƠ SỞ (MULTI-STORE)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Kiểm soát toàn diện dòng chảy nguyên vật liệu pha chế và vật tư tiêu hao của từng cơ sở trong chuỗi Cafe Zone Six.
- Ngăn ngừa thất thoát, lãng phí nguyên liệu và tránh hiện tượng đứt gãy đồ uống trong giờ cao điểm do hết hàng đột xuất tại từng chi nhánh.
- Chuẩn hóa quy trình kiểm kê định kỳ và quy trình đề xuất nhập hàng giữa Phó ca vật liệu cơ sở và Quản lý phụ trách cơ sở.

---

## 2. PHẠM VI & PHÂN QUYỀN TRUY CẬP

| Vai Trò | Quyền Kiểm Kê Tồn Kho | Quyền Lập Đề Xuất Nhập Hàng | Quyền Duyệt Chi Ngân Sách | Phạm Vi Cơ Sở (Store Scope) |
| :--- | :---: | :---: | :---: | :--- |
| `admin_he_thong` | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Toàn quyền | Toàn bộ chuỗi mọi cơ sở |
| `quan_ly` | ✅ Toàn quyền | ✅ Toàn quyền | ✅ Phê duyệt & Chốt chi | Các cơ sở được phân công quản lý |
| `truong_ca` | ⚠️ Xem theo dõi | ⚠️ Góp ý số lượng | ❌ Không có | **CHỈ THEO DÕI ĐÚNG 1 CƠ SỞ MÌNH** |
| `pho_ca_vat_lieu` | ✅ **Trực tiếp kiểm kê** | ✅ **Trực tiếp lập phiếu** | ❌ Chờ quản lý duyệt | **Chỉ kho tại cơ sở của mình** |
| `pho_ca_lam_lich` | ❌ Bị ẩn | ❌ Bị ẩn | ❌ Bị ẩn | Không có quyền |
| `nhan_vien` | ❌ Bị ẩn | ❌ Bị ẩn | ❌ Bị ẩn | Không có quyền |

- **Phân hệ:** Tồn kho, Vật liệu & Sổ Tay Công Thức Pha Chế Bí Mật (Materials & Recipe SOP).
- **Tình trạng:** ✅ **ĐÃ HOÀN THÀNH TOÀN DIỆN (FULLSTACK: BE + FE + DB)**.

---

## 3. LOGIC NGHIỆP VỤ & QUY TRÌNH QUẢN LÝ KHO & CÔNG THỨC PHA CHẾ

### 3.1 Phân Loại Vật Liệu & Định Mức An Toàn
- **Bao bì & Ly nhựa (`packaging`):** Ly nhựa 500ml/700ml, Nắp bằng, Nắp cầu, Ống hút phi 6/phi 12, Túi mang đi chữ T...
- **Nguyên liệu pha chế (`ingredient`):** Trà đen, Trà sen, Cà phê pha phin blend, Đường cát trắng, Siro dâu, Mứt dâu tươi, Sữa tươi thanh trùng, Sữa đặc, Kem béo Rich...
- **Topping & Phụ gia (`topping`):** Topping nha đam, Trân châu trắng, Thạch củ năng...
- **Cảnh báo tồn kho tối thiểu (`min_threshold`):** Hệ thống tự động gắn cờ cảnh báo `is_low_stock` khi số lượng tồn chạm ngưỡng an toàn.

### 3.2 Quy Tắc Bảo Mật Công Thức Bí Quyết Độc Quyền (Secret Recipes & SOP)
- **Món sơ chế bán thành phẩm nội bộ (`internal_prep`):**
  - Ví dụ: *Công thức Nấu Nước Đường Nền Chuẩn Vị, Công thức Ủ Cốt Trà Đen Đậm Hương, Công thức Đánh Kem Cheese Macchiato.*
  - **Khách hàng vãng lai / Unauthenticated view:** Hoàn toàn KHÔNG THỂ nhìn thấy các món này trên hệ thống.
  - **Chỉ nhân sự Zone 6 (từ cấp Nhân Viên trở lên):** Mới được quyền truy cập xem định lượng và quy trình nấu ủ.
- **Món thương phẩm bán khách hàng (`customer_product`):**
  - Ví dụ: *Trà Dâu Tây Tươi Zone 6, Cà Phê Muối Hoàng Gia, Trà Đào Cam Sả Tươi.*
  - **Khách hàng:** Có thể xem tên món, ảnh đại diện, giá niêm yết và mô tả hương vị.
  - **Bảo mật tỷ lệ định lượng (BOM) & quy trình pha chế (SOP):** Bị ẩn tuyệt đối đối với khách hàng (`has_recipe_access: false`). Chỉ khi nhân viên đăng nhập, backend mới trả về bảng định lượng BOM (từng ml, gram nguyên liệu) và các bước thao tác SOP kèm Mẹo Barista (`has_recipe_access: true`).

### 3.3 Tự Động Tính Toán Chi Phí Giá Vốn (COGS) & Lợi Nhuận Gộp
- Khi thiết lập công thức món, hệ thống tự động cộng dồn chi phí thành phần của từng vật tư trong kho (ly nhựa + nắp + ống hút + cốt trà + siro + đường) để tính ra **Giá vốn ước tính (`estimated_cost`)**.
- Cho phép hiển thị lãi gộp và tỷ suất lợi nhuận trực quan trên từng Card món.

---

## 4. DANH SÁCH TỆP TRIỂN KHAI

### 4.1 Backend (Node.js Express + Prisma + Mongoose)
- `be/src/databases/prisma/schema/material.prisma`
- `be/src/databases/prisma/schema/recipe.prisma`
- `be/src/modules/pho_ca_vat_lieu/material/models/material.model.ts`
- `be/src/modules/pho_ca_vat_lieu/material/models/recipe.model.ts`
- `be/src/modules/pho_ca_vat_lieu/material/schemas/material.schema.ts`
- `be/src/modules/pho_ca_vat_lieu/material/schemas/recipe.schema.ts`
- `be/src/modules/pho_ca_vat_lieu/material/repositories/material.repository.ts`
- `be/src/modules/pho_ca_vat_lieu/material/repositories/recipe.repository.ts`
- `be/src/modules/pho_ca_vat_lieu/material/services/material.get.service.ts`
- `be/src/modules/pho_ca_vat_lieu/material/services/material.create.service.ts`
- `be/src/modules/pho_ca_vat_lieu/material/services/material.update.service.ts`
- `be/src/modules/pho_ca_vat_lieu/material/services/material.delete.service.ts`
- `be/src/modules/pho_ca_vat_lieu/material/services/recipe.get.service.ts`
- `be/src/modules/pho_ca_vat_lieu/material/services/recipe.create.service.ts`
- `be/src/modules/pho_ca_vat_lieu/material/services/recipe.update.service.ts`
- `be/src/modules/pho_ca_vat_lieu/material/services/recipe.delete.service.ts`
- `be/src/modules/pho_ca_vat_lieu/material/controllers/*.controller.ts`
- `be/src/modules/pho_ca_vat_lieu/material/routes/material.routes.ts`
- `be/src/modules/pho_ca_vat_lieu/material/routes/recipe.routes.ts`

### 4.2 Frontend (Next.js 14+ App Router + React Query v5 + Obsidian Gold)
- `fe/src/app/materials/page.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/type/material.type.ts` & `recipe.type.ts`
- `fe/src/features/pho_ca_vat_lieu/material/schema/material.schema.ts` & `recipe.schema.ts`
- `fe/src/features/pho_ca_vat_lieu/material/service/*.service.ts`
- `fe/src/features/pho_ca_vat_lieu/material/hook/*.ts`
- `fe/src/features/pho_ca_vat_lieu/material/component/MaterialsView.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/component/MaterialCard.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/component/CreateMaterialModal.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/component/EditMaterialModal.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/component/DeleteMaterialModal.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/component/RecipeCard.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/component/RecipeDetailModal.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/component/CreateRecipeModal.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/component/EditRecipeModal.tsx`
- `fe/src/features/pho_ca_vat_lieu/material/component/DeleteRecipeModal.tsx`
- `fe/src/core/components/layout/AppShell.tsx`

