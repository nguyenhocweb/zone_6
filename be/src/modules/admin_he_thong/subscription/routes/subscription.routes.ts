import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller.js';
import { SubscriptionService } from '../services/subscription.service.js';
import { 
  SubscriptionCreateSchema, 
  SubscriptionUpdateSchema 
} from '../schemas/subscription.schema.js';
import { validateBody } from '../../../../middlewares/validation.middleware.js';

export function createSubscriptionRouter(): Router {
  const router = Router();
  const service = new SubscriptionService();
  const controller = new SubscriptionController(service);

  router.get('', controller.list);
  router.get('/:id', controller.getById);
  router.post('', validateBody(SubscriptionCreateSchema), controller.create);
  router.put('/:id', validateBody(SubscriptionUpdateSchema), controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
