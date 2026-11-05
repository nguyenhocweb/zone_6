import { Router } from 'express';
import { ZaloService } from '../modules/admin_he_thong/zalo/services/zalo.service.js';
import { createZaloRouter } from './zalo.routes.js';
import { createSubscriptionRouter } from '../modules/admin_he_thong/subscription/routes/subscription.routes.js';
import { createSchedulingRouter } from '../modules/pho_ca_lam_lich/scheduling/routes/scheduling.routes.js';
import { createAuthRouter } from '../modules/shared/auth/routes/auth.routes.js';
import { createUserRouter } from '../modules/quan_ly/staff/routes/user.routes.js';

import { createStoreConfigRouter } from '../modules/admin_he_thong/store-config/routes/store-config.routes.js';
import { createStoreRouter } from '../modules/admin_he_thong/store/routes/store.routes.js';
import { createAttendanceRouter } from '../modules/nhan_vien/attendance/routes/attendance.routes.js';
import { createMaterialRouter } from '../modules/pho_ca_vat_lieu/material/routes/material.routes.js';
import { createSellableToppingRouter } from '../modules/pho_ca_vat_lieu/material/routes/sellable-topping.routes.js';
import { createRecipeRouter } from '../modules/pho_ca_vat_lieu/material/routes/recipe.routes.js';
import { createInventoryAuditRouter } from '../modules/pho_ca_vat_lieu/material/routes/inventory-audit.routes.js';
import { createSupplierRouter } from '../modules/admin_he_thong/supplier/routes/supplier.routes.js';
import { createPurchaseRequisitionRouter } from '../modules/pho_ca_vat_lieu/purchase_requisition/routes/purchase-requisition.routes.js';
import { createPurchaseOrderRouter } from '../modules/quan_ly/purchase_order/routes/purchase-order.routes.js';
import { createPosRouter } from '../modules/pos/routes/pos.routes.js';
import { createTableRouter } from '../modules/admin_he_thong/table/routes/table.routes.js';
import { createPayOSRouter } from '../modules/admin_he_thong/payos/routes/payos.routes.js';
import { createCloudinaryRouter } from '../modules/shared/cloudinary/routes/cloudinary.routes.js';

export function createApiRouter(zaloService: ZaloService): Router {
  const router = Router();

  // Root & Health check
  router.get('/', (_req, res) => {
    res.status(200).json({
      status: 'online',
      project: 'Zone 6 Signature - Fullstack Node.js Backend',
      modules: ['auth', 'users', 'scheduling', 'zalo', 'store-config', 'materials', 'inventory-audits', 'suppliers'],
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  // 1. Phân hệ Xác thực & Phân quyền (Auth & Users)
  router.use('/v1/auth', createAuthRouter());
  router.use('/auth', createAuthRouter());
  router.use('/v1/users', createUserRouter());
  router.use('/users', createUserRouter());

  // 2. Phân hệ Subscriptions (Tương thích backwards)
  router.use('/v1/subscriptions', createSubscriptionRouter());

  // 3. Phân hệ Xếp Lịch Làm Việc (Scheduling)
  router.use('/v1/scheduling', createSchedulingRouter());

  // 4. Phân hệ Cấu Hình Check-in & Định Vị Quán (Store Config)
  router.use('/v1/store-config', createStoreConfigRouter());
  router.use('/store-config', createStoreConfigRouter());

  // 4b. Phân hệ Quản Trị Chi Nhánh (Stores Management - Thêm mới & Đóng/Mở cửa)
  router.use('/v1/stores', createStoreRouter());
  router.use('/stores', createStoreRouter());

  // 5. Phân hệ Điểm Danh Check-in Ca Làm & Chụp Ảnh (Attendance)
  router.use('/v1/attendance', createAttendanceRouter(zaloService));
  router.use('/attendance', createAttendanceRouter(zaloService));

  // 6. Phân hệ Quản Lý Nguyên Vật Liệu & Kho Hàng (CN11 - Materials)
  router.use('/v1/materials', createMaterialRouter());
  router.use('/materials', createMaterialRouter());

  // 6b. Bảng CSDL Riêng Cho Topping Bán Ra (Sellable Toppings)
  router.use('/v1/sellable-toppings', createSellableToppingRouter());
  router.use('/sellable-toppings', createSellableToppingRouter());

  // 6c. Kiểm Kho (Inventory Audits - Nhân viên kiểm đếm, Phó ca trở lên xem & điều chỉnh)
  router.use('/v1/inventory-audits', createInventoryAuditRouter());
  router.use('/inventory-audits', createInventoryAuditRouter());

  // 6d. Quản Lý Nhà Cung Cấp (Suppliers - Độc quyền Quản Lý & Admin Hệ Thống)
  router.use('/v1/suppliers', createSupplierRouter());
  router.use('/suppliers', createSupplierRouter());

  // 6e. Phiếu Yêu Cầu Nhập Kho Chi Nhánh (CN11b - Purchase Requisitions)
  router.use('/v1/purchase-requisitions', createPurchaseRequisitionRouter());
  router.use('/purchase-requisitions', createPurchaseRequisitionRouter());

  // 6f. Trung Tâm Thu Mua & Đơn Đặt Hàng Gộp Đa Chi Nhánh (CN11b - Purchase Orders)
  router.use('/v1/purchase-orders', createPurchaseOrderRouter());
  router.use('/purchase-orders', createPurchaseOrderRouter());

  // 7. Phân hệ Quản Lý Công Thức Pha Chế & Món (Recipes & Menu Items)
  router.use('/v1/recipes', createRecipeRouter());
  router.use('/recipes', createRecipeRouter());

  // 8. Phân hệ POS Live Order Đồng Bộ Thời Gian Thực (CN12)
  router.use('/v1/pos', createPosRouter());
  router.use('/pos', createPosRouter());

  // 8b. Phân hệ Quản Lý Bàn & Khách Quét QR Gọi Món (CN13)
  router.use('/v1/tables', createTableRouter());
  router.use('/tables', createTableRouter());

  // 8c. Phân hệ Cấu Hình Cổng Thanh Toán PayOS (Admin Hệ Thống & POS/QR)
  router.use('/v1/payos', createPayOSRouter());
  router.use('/payos', createPayOSRouter());

  // 8d. Phân hệ Chữ Ký Cloudinary Lưu Trữ Ảnh Món Ăn (zone_6/menu/{id món})
  router.use('/v1/cloudinary', createCloudinaryRouter());
  router.use('/cloudinary', createCloudinaryRouter());

  // 9. Phân hệ Zalo Integration (Cả v1 lẫn root zalo)
  const zaloRouter = createZaloRouter(zaloService);
  router.use('/v1/zalo', zaloRouter);
  router.use('/zalo', zaloRouter);

  return router;
}
