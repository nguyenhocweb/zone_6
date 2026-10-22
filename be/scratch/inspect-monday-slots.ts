import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { WeeklyScheduleModel } from '../src/modules/scheduling/models/weekly-schedule.model.js';

async function main() {
  await connectDatabase();
  const schedule = await WeeklyScheduleModel.findOne({ week_start_date: '2026-10-19' });
  if (schedule) {
    const mondaySlots = schedule.slots.filter(s => s.day === 'Thứ 2');
    console.log('Monday slots count:', mondaySlots.length);
    for (const s of mondaySlots) {
      console.log(`Slot: shift=${s.shift}, role=${s.role}, staff=${s.staff_name}, checked_in=${s.is_checked_in}, empty=${s.is_empty}`);
    }
  }
  await disconnectDatabase();
}

main().catch(console.error);
