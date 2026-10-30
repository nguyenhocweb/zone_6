import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

async function runMigration() {
  console.log('🔄 Đang kết nối tới MongoDB Atlas...');
  await mongoose.connect(DATABASE_URL);
  console.log('✅ Kết nối thành công!');

  const db = mongoose.connection.db;

  // 1. Lấy danh sách Store
  const stores = await db.collection('store_configs').find({}).toArray();
  console.log(`Tìm thấy ${stores.length} cơ sở:`);
  stores.forEach((s) => console.log(` - [${s._id.toString()}] ${s.store_name} (${s.store_code || 'N/A'})`));

  const store1 = stores.find((s) => s.store_code === 'Z6-CS01') || stores[0];
  const store2 = stores.find((s) => s.store_code === 'Z6-CS02') || stores[1] || stores[0];

  const store1Id = store1._id;
  const store2Id = store2._id;

  console.log(`\n👉 Cơ sở 1: ${store1.store_name} (${store1Id})`);
  console.log(`👉 Cơ sở 2: ${store2.store_name} (${store2Id})`);

  // 2. Xử lý Index cũ trong weekly_schedules
  try {
    const wsIndexes = await db.collection('weekly_schedules').indexes();
    console.log('\nCác index hiện tại của weekly_schedules:');
    wsIndexes.forEach((idx) => console.log(` - ${idx.name}`));

    const hasOldIndex = wsIndexes.some((idx) => idx.name === 'week_start_date_1');
    if (hasOldIndex) {
      console.log('Xóa index cũ week_start_date_1 để hỗ trợ đa cơ sở...');
      await db.collection('weekly_schedules').dropIndex('week_start_date_1');
      console.log('✅ Đã xóa index week_start_date_1.');
    }
  } catch (err) {
    console.log('Lưu ý index weekly_schedules:', err.message);
  }

  // 3. Xử lý Index cũ trong registration_windows
  try {
    const rwIndexes = await db.collection('registration_windows').indexes();
    const hasOldRwIndex = rwIndexes.some((idx) => idx.name === 'week_start_date_1');
    if (hasOldRwIndex) {
      console.log('Xóa index cũ week_start_date_1 trong registration_windows...');
      await db.collection('registration_windows').dropIndex('week_start_date_1');
      console.log('✅ Đã xóa index week_start_date_1 trong registration_windows.');
    }
  } catch (err) {
    console.log('Lưu ý index registration_windows:', err.message);
  }

  // 4. Xử lý Index cũ trong shift_registrations
  try {
    const srIndexes = await db.collection('shift_registrations').indexes();
    const hasOldSrIndex = srIndexes.some((idx) => idx.name === 'user_id_1_week_start_date_1');
    if (hasOldSrIndex) {
      console.log('Xóa index cũ user_id_1_week_start_date_1 trong shift_registrations...');
      await db.collection('shift_registrations').dropIndex('user_id_1_week_start_date_1');
      console.log('✅ Đã xóa index user_id_1_week_start_date_1 trong shift_registrations.');
    }
  } catch (err) {
    console.log('Lưu ý index shift_registrations:', err.message);
  }

  // 5. Cập nhật weekly_schedules hiện có
  const wsResult = await db.collection('weekly_schedules').updateMany(
    { $or: [{ store_id: null }, { store_id: { $exists: false } }] },
    {
      $set: {
        store_id: store2Id,
        store_name: store2.store_name,
      },
    }
  );
  console.log(`✅ Đã cập nhật ${wsResult.modifiedCount} lịch tuần về ${store2.store_name}`);

  // 6. Cập nhật registration_windows hiện có
  const rwResult = await db.collection('registration_windows').updateMany(
    { $or: [{ store_id: null }, { store_id: { $exists: false } }] },
    {
      $set: {
        store_id: store2Id,
      },
    }
  );
  console.log(`✅ Đã cập nhật ${rwResult.modifiedCount} đợt đăng ký về ${store2.store_name}`);

  // 7. Cập nhật shift_registrations hiện có
  const srResult = await db.collection('shift_registrations').updateMany(
    { $or: [{ store_id: null }, { store_id: { $exists: false } }] },
    {
      $set: {
        store_id: store2Id,
      },
    }
  );
  console.log(`✅ Đã cập nhật ${srResult.modifiedCount} bản đăng ký ca về ${store2.store_name}`);

  // 8. Cập nhật Users:
  // - Admin: assigned_stores: [store1Id, store2Id]
  await db.collection('users').updateMany(
    { role: 'admin_he_thong' },
    {
      $set: {
        assigned_stores: [store1Id, store2Id],
        assigned_store_id: store2Id,
      },
    }
  );

  // - Quản lý: assigned_stores: [store1Id, store2Id]
  await db.collection('users').updateMany(
    { role: 'quan_ly' },
    {
      $set: {
        assigned_stores: [store1Id, store2Id],
        assigned_store_id: store2Id,
      },
    }
  );

  // - Trưởng ca, Phó ca, Nhân viên mẫu: gán Cơ sở 2 (214 Lê Ninh)
  await db.collection('users').updateMany(
    {
      role: { $in: ['truong_ca', 'pho_ca_lam_lich', 'pho_ca_vat_lieu', 'nhan_vien'] },
      user_code: { $in: ['Z6-TC01', 'Z6-PCL01', 'Z6-PCVL01', 'Z6-NV01'] },
    },
    {
      $set: {
        assigned_store_id: store2Id,
        assigned_stores: [],
      },
    }
  );

  // - Phân bổ nhân viên thực tế Z6-STF01 -> Z6-STF12 về Cơ sở 2, Z6-STF13 -> Z6-STF21 về Cơ sở 1
  for (let i = 1; i <= 12; i++) {
    const code = `Z6-STF${String(i).padStart(2, '0')}`;
    await db.collection('users').updateOne(
      { user_code: code },
      { $set: { assigned_store_id: store2Id, assigned_stores: [] } }
    );
  }

  for (let i = 13; i <= 21; i++) {
    const code = `Z6-STF${String(i).padStart(2, '0')}`;
    await db.collection('users').updateOne(
      { user_code: code },
      { $set: { assigned_store_id: store1Id, assigned_stores: [] } }
    );
  }

  // - Các tài khoản còn lại chưa có store_id: gán mặc định về Cơ sở 2
  const otherUsers = await db.collection('users').updateMany(
    { assigned_store_id: null, role: { $ne: 'admin_he_thong' } },
    { $set: { assigned_store_id: store2Id } }
  );
  console.log(`✅ Đã phân bổ ${otherUsers.modifiedCount} nhân sự còn lại về cơ sở.`);

  // 9. Tạo lại các Compound Index mới
  try {
    await db.collection('weekly_schedules').createIndex({ week_start_date: 1, store_id: 1 }, { unique: true });
    console.log('✅ Đã tạo compound index { week_start_date: 1, store_id: 1 } trên weekly_schedules');
  } catch (e) {
    console.log('Lưu ý tạo index weekly_schedules:', e.message);
  }

  try {
    await db.collection('registration_windows').createIndex({ week_start_date: 1, store_id: 1 }, { unique: true });
    console.log('✅ Đã tạo compound index { week_start_date: 1, store_id: 1 } trên registration_windows');
  } catch (e) {
    console.log('Lưu ý tạo index registration_windows:', e.message);
  }

  try {
    await db.collection('shift_registrations').createIndex({ user_id: 1, week_start_date: 1, store_id: 1 }, { unique: true });
    console.log('✅ Đã tạo compound index { user_id: 1, week_start_date: 1, store_id: 1 } trên shift_registrations');
  } catch (e) {
    console.log('Lưu ý tạo index shift_registrations:', e.message);
  }

  console.log('\n🎉 Hoàn thành migration phân tách đa cơ sở (Multi-Store) cho dữ liệu MongoDB Atlas!');
  await mongoose.disconnect();
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('❌ Lỗi migration:', err);
  process.exit(1);
});

