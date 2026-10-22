export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Tài nguyên không tồn tại') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Dữ liệu đầu vào không hợp lệ') {
    super(message, 400);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Yêu cầu không hợp lệ') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Xung đột trạng thái hệ thống') {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Email hoặc mật khẩu không chính xác') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Tài khoản không có quyền thực hiện thao tác này') {
    super(message, 403);
  }
}
