import { Schema, model, type Document } from 'mongoose';
import { USER_ROLES, type UserRole } from '../schemas/user-roles.js';

export interface IUserDoc extends Document {
  user_code: string;
  name: string;
  email: string;
  password: string; // Lưu plain text theo yêu cầu cụ thể của hệ thống: "pass đó không mã hóa nha"
  role: UserRole;
  phone?: string | null;
  qr_code?: string;
  hourly_rate?: number;
  position?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUserDoc>(
  {
    user_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true, // Plain text password per user request
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'nhan_vien',
      index: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    qr_code: {
      type: String,
      sparse: true,
      index: true,
    },
    hourly_rate: {
      type: Number,
      default: 18000,
      min: 0,
    },
    position: {
      type: String,
      default: 'service',
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    versionKey: false,
  }
);

export const UserModel = model<IUserDoc>('User', userSchema);
