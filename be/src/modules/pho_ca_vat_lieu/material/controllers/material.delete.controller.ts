import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { MaterialDeleteService } from '../services/material.delete.service.js';

export class MaterialDeleteController {
  constructor(private service: MaterialDeleteService = new MaterialDeleteService()) {}

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await this.service.deleteMaterial(id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
