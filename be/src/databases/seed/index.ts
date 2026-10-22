import { prisma } from '../init.mongodb.js';
import { cleanDatabase } from './clean.js';
import { seedStoreConfig } from './runners/01-store-config.seed.js';
import { seedUsers } from './runners/02-users.seed.js';
import { seedSubscriptions } from './runners/03-subscriptions.seed.js';

async function main() {
  console.log('==================================================================');
  console.log('🚀 BẮT ĐẦU CHẠY SEEDING DỮ LIỆU TOÀN DIỆN (ZONE SIX MASTER SEED)...');
  console.log('==================================================================');

  const startTime = Date.now();

  try {
    // 1. Dọn dẹp dữ liệu cũ nếu có cờ --clean
    if (process.argv.includes('--clean')) {
      await cleanDatabase();
    }

    // 2. Chạy tuần tự các tầng dữ liệu có quan hệ phụ thuộc
    await seedStoreConfig();       // [Tầng 1] Store Coordinates & Geofence
    await seedUsers();             // [Tầng 2] Users, Hourly Rates (18k) & QR Codes
    await seedSubscriptions();     // [Tầng 3] Subscription Plans

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('==================================================================');
    console.log(`🎉 HOÀN THÀNH SEED DỮ LIỆU THÀNH CÔNG TRONG ${duration} GIÂY!`);
    console.log('==================================================================');
  } catch (error) {
    console.error('🔥 LỖI TRONG QUÁ TRÌNH SEEDING:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
