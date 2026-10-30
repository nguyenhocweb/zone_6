import { type Request, type Response } from 'express';
import { SellableToppingCreateService } from '../services/sellable-topping.create.service.js';
import { SellableToppingCreateSchema } from '../schemas/sellable-topping.schema.js';

export async function createSellableToppingController(req: Request, res: Response): Promise<void> {
  const authReq = req as any;
  const user = authReq.user;
  const body = { ...req.body };

  if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
    if (user.assigned_store_id) {
      body.store_id = String(user.assigned_store_id);
    }
  }

  const parsed = SellableToppingCreateSchema.parse(body);
  const service = new SellableToppingCreateService();
  const result = await service.execute(parsed);

  res.status(201).json({
    success: true,
    message: 'Thêm mới topping bán ra thành công',
    data: result,
  });
}
