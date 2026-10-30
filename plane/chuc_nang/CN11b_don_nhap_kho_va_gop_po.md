# 📦 CN11b: YÊU CẦU NHẬP KHO & TRUNG TÂM GỘP ĐƠN THU MUA ĐA CƠ SỞ (PURCHASE REQUISITION & PO AGGREGATION)

---

## 1. MỤC TIÊU TÍNH NĂNG
- Cho phép **Phó ca vật liệu** (hoặc Trưởng ca trở lên) lập phiếu đề xuất nhập nguyên vật liệu cho chi nhánh dựa trên định mức an toàn (`min_threshold`) và tồn kho thực tế.
- Cung cấp cho **Quản lý / Admin hệ thống** "Trung tâm thu mua" (Procurement Center) để:
  1. Thẩm định, điều chỉnh số lượng duyệt của các chi nhánh.
  2. **Chế độ Gộp đơn đa chi nhánh (Consolidated PO):** Gom nhu cầu của nhiều cơ sở theo từng Nhà Cung Cấp thành 1 đơn PO lớn để hưởng giá sỉ, chiết khấu và tối ưu phí vận chuyển; tự do chọn địa điểm nhận hàng (Kho Tổng hoặc Chi nhánh chỉ định).
  3. **Chế độ Đơn riêng biệt (Branch-Specific PO):** Tách đơn riêng cho từng chi nhánh giao thẳng về địa chỉ quán đối với hàng tươi sống, đá hoặc hàng giao gấp.
  4. Xác nhận nhập kho thực tế (Goods Receipt) tự động tăng số lượng tồn kho (`quantity_in_stock`) tại cơ sở tiếp nhận.

---

## 2. PHÂN QUYỀN TRUY CẬP & PHẠM VI CƠ SỞ (STORE SCOPE)

| Vai trò | Tạo Phiếu Yêu Cầu (PR) | Tự Động Gợi Ý (Auto-Suggest) | Duyệt & Điều Chỉnh PR | Tạo Đơn Mua (PO) | Chế Độ Gộp Đa Chi Nhánh | Xác Nhận Nhập Kho |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `admin_he_thong` | ✅ Toàn chuỗi | ✅ Toàn chuỗi | ✅ Toàn chuỗi | ✅ Toàn chuỗi | ✅ Mọi cơ sở | ✅ Toàn quyền |
| `quan_ly` | ✅ Cơ sở quản lý | ✅ Cơ sở quản lý | ✅ Cơ sở quản lý | ✅ Cơ sở quản lý | ✅ Các cơ sở phụ trách | ✅ Quản lý duyệt |
| `truong_ca` | ✅ Đúng 1 cơ sở mình | ✅ Cơ sở mình | ⚠️ Duyệt sơ bộ cơ sở | ❌ Bị chặn | ❌ Bị chặn | ✅ Ký nhận tại quán |
| `pho_ca_vat_lieu` | ✅ **Đúng 1 cơ sở mình** | ✅ **Nhiệm vụ chính** | ❌ Chờ quản lý duyệt | ❌ Bị chặn | ❌ Bị chặn | ✅ **Kiểm đếm nhập kho** |
| `pho_ca_lam_lich` | ❌ Bị ẩn | ❌ Bị ẩn | ❌ Bị ẩn | ❌ Bị ẩn | ❌ Bị ẩn | ❌ |
| `nhan_vien` | ❌ Bị ẩn | ❌ Bị ẩn | ❌ Bị ẩn | ❌ Bị ẩn | ❌ Bị ẩn | ❌ |

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU

### 3.1 `purchase_requisitions` (Phiếu Yêu Cầu Nhập Kho)
- `_id`: ObjectId
- `code`: String (Mã duy nhất, e.g. `PR-20261029-CN01-001`)
- `store_id`: ObjectId (Cơ sở yêu cầu)
- `creator_id`: ObjectId (Người lập)
- `creator_role`: String (`pho_ca_vat_lieu`, `truong_ca`, `quan_ly`, `admin_he_thong`)
- `status`: String (`PENDING` | `APPROVED` | `PARTIALLY_CONVERTED` | `CONVERTED_TO_PO` | `REJECTED`)
- `priority`: String (`NORMAL` | `URGENT`)
- `expected_delivery_date`: Date?
- `notes`: String?
- `items`: Danh sách nguyên liệu cần nhập:
  - `material_id`: ObjectId
  - `material_code`: String
  - `material_name`: String
  - `category`: String (`packaging` | `ingredient` | `topping`)
  - `unit`: String
  - `current_stock`: Number
  - `min_threshold`: Number
  - `requested_quantity`: Number
  - `approved_quantity`: Number?
  - `suggested_supplier_id`: ObjectId?
  - `status`: String (`PENDING` | `APPROVED` | `REJECTED` | `CONVERTED`)

### 3.2 `purchase_orders` (Đơn Thu Mua Nhà Cung Cấp)
- `_id`: ObjectId
- `po_number`: String (Mã duy nhất, e.g. `PO-20261029-SUP01-001`)
- `order_type`: String (`CONSOLIDATED` | `BRANCH_DIRECT`)
- `supplier_id`: ObjectId
- `supplier_name`: String
- `created_by_id`: ObjectId
- `status`: String (`PENDING` | `SENT` | `CONFIRMED` | `SHIPPING` | `PARTIALLY_RECEIVED` | `COMPLETED` | `CANCELLED`)
- `delivery_destination`: String (`CENTRAL_HUB` | `STORE_DIRECT`)
- `delivery_store_id`: ObjectId?
- `delivery_address`: String
- `contact_person`: String?
- `contact_phone`: String?
- `total_estimated_cost`: Number
- `expected_arrival_date`: Date?
- `notes`: String?
- `items`: Danh sách mặt hàng mua:
  - `requisition_id`: ObjectId?
  - `target_store_id`: ObjectId (Phân bổ cho chi nhánh nào)
  - `target_store_name`: String
  - `material_id`: ObjectId
  - `material_name`: String
  - `unit`: String
  - `ordered_quantity`: Number
  - `received_quantity`: Number
  - `unit_price`: Number
  - `subtotal`: Number

---

## 4. LUỒNG NGHIỆP VỤ & API ENDPOINTS

### 4.1 Phân hệ Yêu Cầu Nhập Kho (`/api/v1/purchase-requisitions`)
- `POST /api/v1/purchase-requisitions`: Tạo phiếu PR mới (Phó ca vật liệu / Trưởng ca / Quản lý).
- `GET /api/v1/purchase-requisitions`: Lấy danh sách PR (Lọc theo `store_id`, `status`).
- `GET /api/v1/purchase-requisitions/suggest`: Tự động quét các mặt hàng $\le$ `min_threshold` của chi nhánh và tính số lượng thiếu hụt.
- `GET /api/v1/purchase-requisitions/:id`: Xem chi tiết 1 phiếu PR.
- `PATCH /api/v1/purchase-requisitions/:id/status`: Quản lý duyệt hoặc từ chối phiếu PR.

### 4.2 Phân hệ Đơn Thu Mua & Gộp Đơn (`/api/v1/purchase-orders`)
- `POST /api/v1/purchase-orders/aggregate-preview`: Xem trước ma trận gom nhóm nguyên vật liệu theo Nhà Cung Cấp từ danh sách các PR được chọn.
- `POST /api/v1/purchase-orders/create-from-requisitions`: Tạo đơn PO chính thức (hỗ trợ cả 2 mode: Gộp đa cơ sở hoặc Tách riêng từng cơ sở; kèm chọn địa điểm giao hàng).
- `GET /api/v1/purchase-orders`: Lấy danh sách PO.
- `GET /api/v1/purchase-orders/:id`: Chi tiết 1 đơn PO.
- `POST /api/v1/purchase-orders/:id/receive`: Xác nhận nhập hàng vào kho $\rightarrow$ Tự động cộng tồn kho `quantity_in_stock` tại cơ sở tiếp nhận.

