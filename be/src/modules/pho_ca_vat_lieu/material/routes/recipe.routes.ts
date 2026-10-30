import { Router } from 'express';
import { authenticate, optionalAuthenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';
import { RecipeGetController } from '../controllers/recipe.get.controller.js';
import { RecipeCreateController } from '../controllers/recipe.create.controller.js';
import { RecipeUpdateController } from '../controllers/recipe.update.controller.js';
import { RecipeDeleteController } from '../controllers/recipe.delete.controller.js';
import { RecipeCategoryGetController } from '../controllers/recipe-category.get.controller.js';
import { RecipeCategoryCreateController } from '../controllers/recipe-category.create.controller.js';

export function createRecipeRouter(): Router {
  const router = Router();

  const getController = new RecipeGetController();
  const createController = new RecipeCreateController();
  const updateController = new RecipeUpdateController();
  const deleteController = new RecipeDeleteController();
  const categoryGetController = new RecipeCategoryGetController();
  const categoryCreateController = new RecipeCategoryCreateController();

  // Danh mục món (1 table riêng biệt recipe_categories)
  router.get('/categories', optionalAuthenticate, categoryGetController.getAll);
  router.get('/categories/:id', optionalAuthenticate, categoryGetController.getById);
  router.post(
    '/categories',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu'),
    categoryCreateController.create
  );

  // Xem thực đơn & công thức:
  // - Khách hàng / Unauthenticated: Chỉ xem món bán khách (customer_product), ẩn công thức bí mật
  // - Nhân viên trở lên: Xem toàn bộ món sơ chế nội bộ + full công thức pha chế
  router.get('/', optionalAuthenticate, getController.getAll);
  router.get('/:id', optionalAuthenticate, getController.getById);

  // Tạo công thức mới (Chỉ Admin, Quản Lý & Phó Ca Vật Liệu)
  router.post(
    '/',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu'),
    createController.create
  );

  // Chỉnh sửa công thức (Chỉ Admin, Quản Lý & Phó Ca Vật Liệu)
  router.put(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu'),
    updateController.update
  );

  // Xóa công thức (Chỉ Admin & Quản Lý)
  router.delete(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    deleteController.delete
  );

  return router;
}
