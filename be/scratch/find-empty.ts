import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { WeeklyScheduleModel } from '../src/modules/scheduling/models/weekly-schedule.model.js';

async function main() {
  await connectDatabase();
  const schedule = await WeeklyScheduleModel.findOne({ week_start_date: '2026-10-19' });
  if (schedule) {
    const emptySlots = schedule.slots.filter(s => !s.staff_name || s.is_empty);
    console.log('Empty slots in 2026-10-19:', emptySlots);
  }
  await disconnectDatabase();
}

main().catch(console.error);
