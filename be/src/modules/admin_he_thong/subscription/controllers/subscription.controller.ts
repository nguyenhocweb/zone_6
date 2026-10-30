import type { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription.service.js';
import type { 
  SubscriptionCreateDto, 
  SubscriptionQueryDto, 
  SubscriptionUpdateDto 
} from '../schemas/subscription.schema.js';

export class SubscriptionController {
  constructor(private service: SubscriptionService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: SubscriptionQueryDto = req.query as any;
      const result = await this.service.getSubscriptions(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const result = await this.service.getById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: SubscriptionCreateDto = req.body;
      const result = await this.service.createSubscription(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const dto: SubscriptionUpdateDto = req.body;
      const result = await this.service.updateSubscription(id, dto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteSubscription(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
