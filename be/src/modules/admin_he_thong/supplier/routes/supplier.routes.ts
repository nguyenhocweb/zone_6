import { Router } from 'express';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';
import { SupplierCreateController } from '../controllers/supplier.create.controller.js';
import { SupplierGetController } from '../controllers/supplier.get.controller.js';
import { SupplierUpdateController } from '../controllers/supplier.update.controller.js';
import { SupplierDeleteController } from '../controllers/supplier.delete.controller.js';

export function createSupplierRouter(): Router {
  const router = Router();

  const createController = new SupplierCreateController();
  const getController = new SupplierGetController();
  const updateController = new SupplierUpdateController();
  const deleteController = new SupplierDeleteController();

  // CHỈ CÓ ADMIN HỆ THỐNG VÀ QUẢN LÝ MỚI ĐƯỢC PHÉP TRUY CẬP TẤT CẢ ROUTE NHÀ CUNG CẤP
  router.use(authenticate, requireRoles('admin_he_thong', 'quan_ly'));

  router.get('/', getController.getAll);
  router.get('/:id', getController.getById);
  router.post('/', createController.create);
  router.put('/:id', updateController.update);
  router.delete('/:id', deleteController.delete);

  return router;
}
