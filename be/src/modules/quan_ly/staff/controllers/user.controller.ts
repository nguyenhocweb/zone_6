import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import type { UserCreateDto, UserUpdateDto } from '../schemas/user.schema.js';

export class UserController {
  constructor(private service: UserService = new UserService()) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, is_active, search } = req.query;
      const result = await this.service.getUsers({
        role: role ? String(role) : undefined,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        search: search ? String(search) : undefined,
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getStaffSalaries = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getStaffSalaries();
      res.status(200).json({
        success: true,
        message: 'Lấy bảng lương nhân viên thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const result = await this.service.getById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: UserCreateDto = req.body;
      const result = await this.service.createUser(dto);
      res.status(201).json({
        success: true,
        message: 'Tạo tài khoản người dùng thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const dto: UserUpdateDto = req.body;
      const result = await this.service.updateUser(id, dto);
      res.status(200).json({
        success: true,
        message: 'Cập nhật tài khoản thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
