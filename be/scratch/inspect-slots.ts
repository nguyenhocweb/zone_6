import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { WeeklyScheduleModel } from '../src/modules/scheduling/models/weekly-schedule.model.js';

async function inspectSlots() {
  await connectDatabase();
  const schedule = await WeeklyScheduleModel.findOne({ week_start_date: '2026-10-19' }).exec();
  if (!schedule) {
    console.log('No schedule found for 2026-10-19');
    return;
  }
  console.log(`Total slots: ${schedule.slots.length}`);
  const dayGroups: Record<string, any[]> = {};
  for (const slot of schedule.slots) {
    if (!dayGroups[slot.day]) dayGroups[slot.day] = [];
    dayGroups[slot.day].push(slot);
  }
  for (const [day, slots] of Object.entries(dayGroups)) {
    console.log(`--- ${day} ---`);
    for (const s of slots) {
      console.log(`  Shift: ${s.shift.padEnd(8)} | Role: ${s.role.padEnd(12)} | Staff: ${s.staff_name || '(empty)'} | Disabled: ${s.is_disabled}`);
    }
  }
}

inspectSlots().catch(console.error).finally(() => disconnectDatabase());
