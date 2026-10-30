import { type Request, type Response } from 'express';
import { SellableToppingDeleteService } from '../services/sellable-topping.delete.service.js';

export async function deleteSellableToppingController(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const service = new SellableToppingDeleteService();
  await service.execute(id);

  res.status(200).json({
    success: true,
    message: 'Xóa topping bán ra thành công',
  });
}
