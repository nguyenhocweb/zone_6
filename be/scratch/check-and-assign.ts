import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { WeeklyScheduleModel } from '../src/modules/scheduling/models/weekly-schedule.model.js';

async function run() {
  await connectDatabase();
  const schedules = await WeeklyScheduleModel.find().exec();
  console.log(`Found ${schedules.length} schedules`);
  for (const s of schedules) {
    console.log(`Schedule week: ${s.week_start_date}, status: ${s.status}, slots count: ${s.slots?.length}`);
    const assignedSlots = s.slots?.filter(sl => !sl.is_empty && sl.staff_name);
    console.log(`  Assigned slots: ${assignedSlots.length}`);
    const names = [...new Set(assignedSlots.map(sl => sl.staff_name))];
    console.log(`  Staff names in schedule: ${names.join(', ')}`);
  }
}

run().catch(console.error).finally(() => disconnectDatabase());
