import { Router } from 'express';
import { authenticate } from '../../../../middlewares/auth.middleware.js';
import { CloudinarySignController } from '../controllers/cloudinary.sign.controller.js';

export function createCloudinaryRouter(): Router {
  const router = Router();
  const controller = new CloudinarySignController();

  // Xin chữ ký Cloudinary để tải ảnh món ăn vào thư mục zone_6/menu/{id món}
  router.post('/sign', authenticate, controller.signMenuUpload);

  return router;
}

