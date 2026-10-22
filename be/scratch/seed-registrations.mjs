import fs from 'fs';
import path from 'path';
import { connectDatabase } from '../dist/core/database.js';
import { ExcelScheduleService } from '../dist/modules/scheduling/services/excel.service.js';
import { UserModel } from '../dist/modules/user/models/user.model.js';
import { ShiftRegistrationModel } from '../dist/modules/scheduling/models/shift-registration.model.js';

async function run() {
  await connectDatabase();

  const p = path.resolve('../docs/FILE_MAU_DANG_KY_LICH_LAM_ZONE6_V2.xlsx');
  const buf = fs.readFileSync(p);
  const rawList = await ExcelScheduleService.parseRegistrationExcel(buf);

  console.log('Parsed employees:', rawList.length);
  const weeks = ['2026-10-12', '2026-10-19'];

  for (const item of rawList) {
    const code = 'Z6-STF' + String(item.stt).padStart(2, '0');
    const safeName = item.name.length < 2 ? item.name + 'n' : item.name;
    const email = 'nv.' + safeName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') + item.stt + '@zonesix.vn';
    let user = await UserModel.findOne({ $or: [{ name: safeName }, { user_code: code }] });
    if (!user) {
      user = await UserModel.create({
        user_code: code,
        name: safeName,
        email: email,
        password: 'password123',
        role: 'nhan_vien',
        qr_code: 'QR-' + code,
        hourly_rate: 18000,
        position: 'service',
        is_active: true
      });
    }

    for (const week of weeks) {
      await ShiftRegistrationModel.findOneAndUpdate(
        { user_id: user._id, week_start_date: week },
        {
          user_id: user._id,
          user_code: user.user_code,
          user_name: user.name,
          role: user.role,
          week_start_date: week,
          mon: item.mon || 'Off',
          tue: item.tue || 'Off',
          wed: item.wed || 'Off',
          thu: item.thu || 'Off',
          fri: item.fri || 'Off',
          sat: item.sat || 'Off',
          sun: item.sun || 'Off',
          notes: 'Đăng ký hệ thống'
        },
        { upsert: true, new: true }
      );
    }
  }

  const count = await ShiftRegistrationModel.countDocuments();
  console.log('✅ Seeded successfully! Total shift_registrations in DB:', count);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
