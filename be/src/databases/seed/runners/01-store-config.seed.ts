import { readFileSync } from 'node:fs';
import { prisma } from '../../init.mongodb.js';

const storeData = JSON.parse(
  readFileSync(new URL('../data/store_config.json', import.meta.url), 'utf-8')
);

export async function seedStoreConfig() {
  console.log('👉 [Tầng 1] Đang khởi tạo Cấu hình Tọa độ Quán Zone Six...');

  await prisma.storeConfig.upsert({
    where: { storeName: storeData.storeName },
    update: {
      address: storeData.address,
      latitude: storeData.latitude,
      longitude: storeData.longitude,
      geofenceRadiusMeters: storeData.geofenceRadiusMeters,
    },
    create: {
      storeName: storeData.storeName,
      address: storeData.address,
      latitude: storeData.latitude,
      longitude: storeData.longitude,
      geofenceRadiusMeters: storeData.geofenceRadiusMeters,
    },
  });

  console.log('✅ [Tầng 1] Hoàn thành Store Config.');
}
