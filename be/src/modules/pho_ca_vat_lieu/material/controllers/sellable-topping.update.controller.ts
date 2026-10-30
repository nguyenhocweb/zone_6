import { type Request, type Response } from 'express';
import { SellableToppingUpdateService } from '../services/sellable-topping.update.service.js';
import { SellableToppingUpdateSchema } from '../schemas/sellable-topping.schema.js';

export async function updateSellableToppingController(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const parsed = SellableToppingUpdateSchema.parse(req.body);
  const service = new SellableToppingUpdateService();
  const result = await service.execute(id, parsed);

  res.status(200).json({
    success: true,
    message: 'Cập nhật topping bán ra thành công',
    data: result,
  });
}
