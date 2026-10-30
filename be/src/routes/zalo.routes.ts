import { Router } from 'express';
import { ZaloController } from '../modules/admin_he_thong/zalo/controllers/zalo.controller.js';
import { ZaloConfigController } from '../modules/admin_he_thong/zalo/controllers/zalo-config.controller.js';
import { ZaloService } from '../modules/admin_he_thong/zalo/services/zalo.service.js';
import { 
  QrIdParamSchema, 
  SendImageMessageSchema, 
  SendTextMessageSchema,
  UpdateZaloConfigSchema,
} from '../modules/admin_he_thong/zalo/schemas/zalo.schema.js';
import { validateBody, validateParams } from '../middlewares/validation.middleware.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

export function createZaloRouter(service: ZaloService): Router {
  const router = Router();
  const controller = new ZaloController(service);
  const configController = new ZaloConfigController();

  // Cấu hình Zalo: Chỉ duy nhất Admin Hệ Thống (admin_he_thong) mới được phép truy cập & thao tác
  router.use(authenticate, requireRoles('admin_he_thong'));

  // Cấu hình lưu trữ Database (Channel Config: Group/User destination, image, default message theo cơ sở)
  router.get('/config', configController.getConfig);
  router.put('/config', configController.updateConfig);


  // QR Login Routes
  router.post('/login', controller.startQr);
  router.get('/login/:id', validateParams(QrIdParamSchema), controller.getQrStatus);
  router.delete('/login/:id', validateParams(QrIdParamSchema), controller.cancelQr);

  // Status & Session Routes
  router.get('/status', controller.getStatus);
  router.get('/groups', controller.getGroups);
  router.post('/logout', controller.logout);

  // Messaging Routes (Group & User)
  router.post('/send', validateBody(SendTextMessageSchema), controller.sendText);
  router.post('/send-image', validateBody(SendImageMessageSchema), controller.sendImage);

  return router;
}
