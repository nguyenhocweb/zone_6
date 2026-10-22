import { prisma } from '../init.mongodb.js';

export async function cleanDatabase() {
  console.log('🧹 Đang dọn dẹp dữ liệu cũ theo chiều ngược lại của quan hệ...');

  await prisma.attendance.deleteMany();
  await prisma.shiftAssignment.deleteMany();
  await prisma.weeklySchedule.deleteMany();
  await prisma.notificationTruongCa.deleteMany();
  await prisma.notificationQuanLy.deleteMany();
  await prisma.notificationAdmin.deleteMany();
  await prisma.notificationPhoCaLamLich.deleteMany();
  await prisma.notificationPhoCaVatLieu.deleteMany();
  await prisma.notificationNhanVien.deleteMany();
  await prisma.scheduleNotification.deleteMany();
  await prisma.storeConfig.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscriptionPlan.deleteMany();

  console.log('✅ Đã dọn dẹp sạch toàn bộ dữ liệu cũ!');
}
