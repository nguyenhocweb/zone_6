/**
 * SCRIPT RESET CƠ SỞ DỮ LIỆU ZONE SIX (MONGODB ATLAS)
 * 
 * Mục đích: Xóa sạch toàn bộ dữ liệu mẫu / dữ liệu rác trên toàn bộ các collections,
 * duy nhất chỉ giữ lại 1 tài khoản Admin Hệ Thống (admin@zonesix.vn) để bắt đầu vận hành thật.
 * 
 * Cách chạy:
 *   node be/scripts/reset_database_keep_admin.mjs            # Mặc định: Xóa toàn bộ dữ liệu, giữ 1 Admin
 *   node be/scripts/reset_database_keep_admin.mjs --keep-stores  # Giữ lại thông tin 2 chi nhánh (store_configs)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nạp file .env từ thư mục be/
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI =
  process.env.DATABASE_URL ||
  'mongodb+srv://My_Restaurant:Matkhau2k3.@nguyenhocweb.pqyjucr.mongodb.net/zone_6?retryWrites=true&w=majority&appName=nguyenhocweb';

export async function wipeDatabaseKeepAdmin(options = { keepStores: false }) {
  console.log('\n========================================================================');
  console.log('🚨 BẮT ĐẦU DỌN DẸP & RESET CƠ SỞ DỮ LIỆU ZONE SIX TRÊN MONGODB ATLAS');
  console.log('========================================================================\n');

  console.log('⏳ Đang kết nối tới MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  console.log(`✅ Kết nối thành công tới Database: "${db.databaseName}"\n`);

  // 1. Tìm hoặc bảo vệ duy nhất 1 tài khoản Admin Hệ Thống
  let admin = await db.collection('users').findOne({ role: 'admin_he_thong' });

  if (!admin) {
    console.log('⚠️ Chưa tìm thấy tài khoản Admin, đang khởi tạo mới tài khoản Admin chuẩn...');
    const newAdmin = {
      user_code: 'Z6-ADMIN',
      name: 'Admin Hệ Thống',
      email: 'admin@zonesix.vn',
      password: 'admin123',
      role: 'admin_he_thong',
      phone: '0901234567',
      hourly_rate: 50000,
      position: 'Quản trị viên hệ thống',
      assigned_stores: [],
      assigned_store_id: null,
      qr_code: 'QR-Z6-ADMIN',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const insertResult = await db.collection('users').insertOne(newAdmin);
    admin = { _id: insertResult.insertedId, ...newAdmin };
    console.log('✅ Đã tạo tài khoản Admin mặc định thành công.');
  } else {
    console.log(`🛡️ Đã xác định tài khoản Admin duy nhất cần giữ lại:`);
    console.log(`   - Họ tên:    ${admin.name}`);
    console.log(`   - Email:     ${admin.email}`);
    console.log(`   - Mã NV:     ${admin.user_code}`);
    console.log(`   - Vai trò:   ${admin.role}`);
    console.log(`   - ID:        ${admin._id}`);
  }

  // 2. Lấy danh sách tất cả các collections hiện có trong database
  const allCollections = await db.listCollections().toArray();
  const collectionNames = allCollections.map((c) => c.name);

  console.log(`\n📋 Phát hiện tổng cộng ${collectionNames.length} bảng/collections trong CSDL:\n`);

  let totalDeletedCount = 0;

  for (const name of collectionNames) {
    if (name.startsWith('system.')) {
      continue; // Bỏ qua system collections của MongoDB
    }

    // Trường hợp bảng users: Xóa tất cả, chỉ giữ lại đúng 1 Admin này
    if (name === 'users') {
      const deleteResult = await db.collection('users').deleteMany({
        _id: { $ne: admin._id },
      });
      console.log(`🗑️ [users]: Đã xóa ${deleteResult.deletedCount} tài khoản nhân sự khác (Giữ lại duy nhất 1 Admin)`);
      totalDeletedCount += deleteResult.deletedCount;
      continue;
    }

    // Nếu người dùng chọn giữ lại cấu hình cơ sở (store_configs)
    if (name === 'store_configs' && options.keepStores) {
      const storeCount = await db.collection('store_configs').countDocuments();
      console.log(`🏢 [store_configs]: GIỮ LẠI ${storeCount} cơ sở theo tùy chọn --keep-stores`);
      continue;
    }

    // Tất cả các bảng nghiệp vụ khác: Xóa sạch toàn bộ
    const deleteResult = await db.collection(name).deleteMany({});
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️ [${name}]: Đã xóa sạch ${deleteResult.deletedCount} bản ghi`);
      totalDeletedCount += deleteResult.deletedCount;
    } else {
      console.log(`⚪ [${name}]: Bảng đang trống (0 bản ghi)`);
    }
  }

  console.log('\n========================================================================');
  console.log(`🎉 HOÀN TẤT RESET CSDL ZONE SIX!`);
  console.log(`- Tổng số bản ghi đã xóa: ${totalDeletedCount} bản ghi`);
  console.log(`- Trạng thái CSDL: SẠCH 100%`);
  console.log(`- Tài khoản duy nhất còn lại trên toàn hệ thống:`);
  console.log(`    + Email:     ${admin.email}`);
  console.log(`    + Mật khẩu:  ${admin.password}`);
  console.log(`    + Vai trò:   ${admin.role} (Toàn quyền quản trị chuỗi)`);
  console.log('========================================================================\n');

  await mongoose.disconnect();
}

// Tự động kích hoạt khi chạy script trực tiếp từ dòng lệnh
if (process.argv[1] && process.argv[1].endsWith('reset_database_keep_admin.mjs')) {
  const keepStores = process.argv.includes('--keep-stores');
  wipeDatabaseKeepAdmin({ keepStores })
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Lỗi trong quá trình reset CSDL:', err);
      process.exit(1);
    });
}

