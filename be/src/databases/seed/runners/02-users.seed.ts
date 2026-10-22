import { readFileSync } from 'node:fs';
import { prisma } from '../../init.mongodb.js';

const usersData = JSON.parse(
  readFileSync(new URL('../data/users.json', import.meta.url), 'utf-8')
);

export async function seedUsers() {
  console.log('👉 [Tầng 2] Đang khởi tạo Nhân sự, Mã QR & Mức lương theo giờ...');

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        userCode: user.userCode,
        phone: user.phone,
        qrCode: user.qrCode,
        hourlyRate: user.hourlyRate,
        role: user.role as any,
        position: user.position as any,
        isActive: user.isActive,
      },
      create: {
        name: user.name,
        userCode: user.userCode,
        email: user.email,
        phone: user.phone,
        qrCode: user.qrCode,
        hourlyRate: user.hourlyRate,
        role: user.role as any,
        position: user.position as any,
        isActive: user.isActive,
      },
    });
  }

  console.log(`✅ [Tầng 2] Hoàn thành ${usersData.length} Nhân sự.`);
}
