import { Router } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { authenticate, optionalAuthenticate } from '../../../../middlewares/auth.middleware.js';
import {
  getSellableToppingsController,
  getSellableToppingByIdController,
} from '../controllers/sellable-topping.get.controller.js';
import { createSellableToppingController } from '../controllers/sellable-topping.create.controller.js';
import { updateSellableToppingController } from '../controllers/sellable-topping.update.controller.js';
import { deleteSellableToppingController } from '../controllers/sellable-topping.delete.controller.js';

export function createSellableToppingRouter(): Router {
  const router = Router();

  // GET all sellable toppings & GET by id (cho phép cả khách tại bàn lẫn nhân viên)
  router.get('/', optionalAuthenticate, asyncHandler(getSellableToppingsController));
  router.get('/:id', optionalAuthenticate, asyncHandler(getSellableToppingByIdController));

  // Quản lý: thêm, sửa, xóa
  router.post('/', authenticate, asyncHandler(createSellableToppingController));
  router.put('/:id', authenticate, asyncHandler(updateSellableToppingController));
  router.delete('/:id', authenticate, asyncHandler(deleteSellableToppingController));

  return router;
}
