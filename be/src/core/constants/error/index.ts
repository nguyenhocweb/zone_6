import { StatusCodes } from '../Status_code.js';

export class ConflictError extends Error {
  public statusCode: number;
  constructor(message = 'Dữ liệu bị xung đột hoặc đã tồn tại') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = StatusCodes.CONFLICT;
  }
}

export class NotFoundError extends Error {
  public statusCode: number;
  constructor(message = 'Không tìm thấy tài nguyên yêu cầu') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export class BadRequestError extends Error {
  public statusCode: number;
  constructor(message = 'Dữ liệu yêu cầu không hợp lệ') {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export class ForbiddenError extends Error {
  public statusCode: number;
  constructor(message = 'Không có quyền thực hiện hành động này') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

export class UnauthorizedError extends Error {
  public statusCode: number;
  constructor(message = 'Chưa xác thực hoặc phiên đăng nhập hết hạn') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
