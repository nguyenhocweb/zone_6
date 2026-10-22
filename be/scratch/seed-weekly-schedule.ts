import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { WeeklyScheduleModel } from '../src/modules/scheduling/models/weekly-schedule.model.js';
import { AutoSchedulerEngine } from '../src/modules/scheduling/engine/scheduling-engine.js';
import { ShiftRegistrationService } from '../src/modules/scheduling/services/shift-registration.service.js';

async function main() {
  await connectDatabase();
  const regService = new ShiftRegistrationService();
  const regs = await regService.getEngineInputsForWeek('2026-10-19');
  const engine = new AutoSchedulerEngine({
    evening_shift_mode: 2,
    max_shifts_per_day: 1,
    registrations: regs,
    start_date: '2026-10-19',
  });
  const matrix = engine.run();

  const existing = await WeeklyScheduleModel.findOne({ week_start_date: '2026-10-19' });
  if (!existing) {
    await WeeklyScheduleModel.create({
      week_start_date: '2026-10-19',
      week_range: '19/10/2026 – 25/10/2026',
      evening_shift_mode: 2,
      slots: matrix.slots,
      workloads: matrix.workloads,
      status: 'published',
      first_created_at: new Date('2026-10-17T10:00:00.000Z'),
      created_by_name: 'Hoàng Làm Lịch',
      created_by_role: 'pho_ca_lam_lich',
    });
    console.log('Successfully seeded initial weekly schedule for 2026-10-19!');
  } else {
    console.log('Weekly schedule for 2026-10-19 already exists.');
  }
  await disconnectDatabase();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
