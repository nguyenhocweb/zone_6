import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { WeeklyScheduleModel } from '../src/modules/scheduling/models/weekly-schedule.model.js';
import { ScheduleNotificationService } from '../src/modules/scheduling/services/notification.service.js';

async function main() {
  await connectDatabase();
  const schedule = await WeeklyScheduleModel.findOne({ week_start_date: '2026-10-19' });
  if (!schedule) {
    console.log('No schedule found for 2026-10-19');
    await disconnectDatabase();
    return;
  }

  // 1. Monday Sáng: Mai chưa check-in (Hết ca lúc 12:30 chưa check-in -> Báo động CAO)
  schedule.slots = schedule.slots.map(s => {
    if (s.day === 'Thứ 2' && s.shift === 'Sáng' && s.staff_name === 'Mai') {
      return { ...s, is_checked_in: false };
    }
    // 2. Tuesday Chiều: Giữ xe để trống (còn ~24h nữa vào ca -> Báo động GẤP nhắc lần 2)
    if (s.day === 'Thứ 3' && s.shift === 'Chiều' && s.role === 'Giữ xe') {
      return { ...s, staff_name: null, is_empty: true, is_checked_in: false };
    }
    // 3. Wednesday Tối: Pha chế để trống (còn ~48h nữa vào ca -> Báo động GẤP)
    if (s.day === 'Thứ 4' && s.shift === 'Tối' && s.role === 'Pha chế') {
      return { ...s, staff_name: null, is_empty: true, is_checked_in: false };
    }
    // 4. Thursday Sáng: Giữ xe để trống (còn ~72h nữa vào ca -> Báo động TRUNG BÌNH)
    if (s.day === 'Thứ 5' && s.shift === 'Sáng' && s.role === 'Giữ xe') {
      return { ...s, staff_name: null, is_empty: true, is_checked_in: false };
    }
    return s;
  });

  schedule.markModified('slots');
  await schedule.save();
  console.log('Updated schedule for 2026-10-19 with realistic test slots.');

  const notifService = new ScheduleNotificationService();
  await notifService.scanAndGenerateNotifications();
  const res = await notifService.getNotifications();
  console.log('Generated notifications stats:', res.stats);
  for (const n of res.notifications) {
    console.log(`- [${n.severity.toUpperCase()}] ${n.title}: ${n.message}`);
  }

  await disconnectDatabase();
}

main().catch(console.error);
