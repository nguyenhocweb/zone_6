import mongoose from 'mongoose';
import { ENV } from '../config/env.config.js';
import { logger } from './logger.js';

export async function connectDatabase(): Promise<void> {
  try {
    logger.info('Đang kết nối tới MongoDB Atlas (Database: zone_6)...');
    
    // Tùy chọn kết nối
    mongoose.set('strictQuery', true);

    await mongoose.connect(ENV.DATABASE_URL, {
      serverSelectionTimeoutMS: 15000,
    });

    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    logger.info(`✅ Kết nối MongoDB Atlas THÀNH CÔNG! [Database: ${dbName}] @ [Host: ${host}]`);

    mongoose.connection.on('error', (err) => {
      logger.error('Lỗi kết nối MongoDB Atlas trong quá trình chạy', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mất kết nối tới MongoDB Atlas. Đang chờ kết nối lại...');
    });

  } catch (error) {
    logger.error('❌ Kết nối MongoDB Atlas THẤT BẠI', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Đã ngắt kết nối MongoDB an toàn.');
  } catch (error) {
    logger.error('Lỗi khi ngắt kết nối MongoDB', error);
  }
}
