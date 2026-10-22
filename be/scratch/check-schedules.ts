import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { WeeklyScheduleModel } from '../src/modules/scheduling/models/weekly-schedule.model.js';
import { ScheduleNotificationModel } from '../src/modules/scheduling/models/notification.model.js';
import { ScheduleNotificationService } from '../src/modules/scheduling/services/notification.service.js';

async function main() {
  await connectDatabase();
  const schedules = await WeeklyScheduleModel.find({});
  console.log('Saved schedules count:', schedules.length);
  for (const s of schedules) {
    console.log('Week:', s.week_start_date, 'Slots count:', s.slots?.length);
    const emptyCount = s.slots?.filter(sl => !sl.staff_name || sl.is_empty).length;
    const filledCount = s.slots?.filter(sl => sl.staff_name && !sl.is_empty).length;
    const checkedInCount = s.slots?.filter(sl => sl.is_checked_in).length;
    console.log(`  Filled: ${filledCount}, Empty: ${emptyCount}, CheckedIn: ${checkedInCount}`);
  }

  const notifService = new ScheduleNotificationService();
  await notifService.scanAndGenerateNotifications();

  const notifs = await ScheduleNotificationModel.find({});
  console.log('Total notifications:', notifs.length);
  for (const n of notifs) {
    console.log(`  [${n.severity.toUpperCase()}] ${n.type} - ${n.title} (resolved: ${n.is_resolved})`);
  }

  await disconnectDatabase();
}

main().catch(console.error);
