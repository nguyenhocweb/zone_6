import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT || 8000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb+srv://My_Restaurant:Matkhau2k3.@nguyenhocweb.pqyjucr.mongodb.net/zone_6?retryWrites=true&w=majority&appName=nguyenhocweb',
  ZALO_SESSION_KEY: process.env.ZALO_SESSION_KEY || '',
  ZALO_SESSION_DIR: path.resolve(process.env.ZALO_SESSION_DIR || '.sessions'),
  ZALO_QR_TTL_MS: Number(process.env.ZALO_QR_TTL_MS || 120000),
  ZALO_SEND_DELAY_MS: Number(process.env.ZALO_SEND_DELAY_MS || 3000),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '3d',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',
};
