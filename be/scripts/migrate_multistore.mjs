import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://My_Restaurant:Matkhau2k3.@nguyenhocweb.pqyjucr.mongodb.net/zone_6?retryWrites=true&w=majority&appName=nguyenhocweb';

async function migrate() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const storeCol = db.collection('store_configs');
  const pkgCol = db.collection('packagings');
  const ingCol = db.collection('ingredients');
  const topCol = db.collection('toppings');
  const sellTopCol = db.collection('sellable_toppings');
  const userCol = db.collection('users');

  // 1. Cập nhật Store 1
  let store1 = await storeCol.findOne({ store_name: /Lương Nhữ Học/i });
  if (!store1) {
    store1 = await storeCol.findOne({});
  }
  if (!store1) {
    console.error('No store found in database!');
    process.exit(1);
  }

  await storeCol.updateOne(
    { _id: store1._id },
    {
      $set: {
        store_code: 'Z6-CS01',
        store_name: 'Zone Six - Lương Nhữ Học (Cơ sở 1)',
        address: '124 Lương Nhữ Học, Phường 11, Quận 5, TP.HCM',
        is_active: true,
      },
    }
  );
  console.log('✅ Store 1 updated:', store1._id.toString());

  // 2. Tạo Store 2 nếu chưa có
  let store2 = await storeCol.findOne({ store_code: 'Z6-CS02' });
  if (!store2) {
    const res = await storeCol.insertOne({
      store_name: 'Zone Six - 214 Lê Ninh (Cơ sở 2)',
      store_code: 'Z6-CS02',
      address: '214 Lê Ninh, Phường Quán Bàu, TP Vinh',
      phone: '0988000002',
      latitude: 18.679584,
      longitude: 105.681329,
      geofence_radius_meters: 100,
      allowed_checkin_before_minutes: 30,
      allowed_checkin_after_minutes: 30,
      is_geofence_required: true,
      is_time_window_strict: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    store2 = await storeCol.findOne({ _id: res.insertedId });
    console.log('✅ Store 2 created:', store2._id.toString());
  } else {
    console.log('✅ Store 2 already exists:', store2._id.toString());
  }

  // 3. Gán store_id = store1._id cho tất cả vật liệu hiện tại có store_id null
  const r1 = await pkgCol.updateMany(
    { $or: [{ store_id: null }, { store_id: { $exists: false } }] },
    { $set: { store_id: store1._id } }
  );
  const r2 = await ingCol.updateMany(
    { $or: [{ store_id: null }, { store_id: { $exists: false } }] },
    { $set: { store_id: store1._id } }
  );
  const r3 = await topCol.updateMany(
    { $or: [{ store_id: null }, { store_id: { $exists: false } }] },
    { $set: { store_id: store1._id } }
  );
  const r4 = await sellTopCol.updateMany(
    { $or: [{ store_id: null }, { store_id: { $exists: false } }] },
    { $set: { store_id: store1._id } }
  );
  console.log(`✅ Assigned store 1 to existing materials: pkgs=${r1.modifiedCount}, ings=${r2.modifiedCount}, tops=${r3.modifiedCount}, sellTops=${r4.modifiedCount}`);

  // 4. Khởi tạo danh mục kho độc lập cho Store 2 nếu Store 2 chưa có
  const store2PkgCount = await pkgCol.countDocuments({ store_id: store2._id });
  if (store2PkgCount === 0) {
    console.log('Seeding materials for Store 2...');
    await pkgCol.insertMany([
      {
        store_id: store2._id,
        name: 'Ly nhựa PP 500ml (Size M) CS2',
        code: 'MAT-CS02-LY500',
        temperature_mode: 'cold',
        cup_size: 'Size M (500ml)',
        unit: 'Cái',
        cost_per_unit: 450,
        quantity_in_stock: 280, // Tồn kho riêng cơ sở 2
        min_threshold: 100,
        description: 'Ly lạnh size M tại cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        store_id: store2._id,
        name: 'Ly nhựa PP 700ml (Size L) CS2',
        code: 'MAT-CS02-LY700',
        temperature_mode: 'cold',
        cup_size: 'Size L (700ml)',
        unit: 'Cái',
        cost_per_unit: 550,
        quantity_in_stock: 140, // Tồn kho riêng cơ sở 2
        min_threshold: 100,
        description: 'Ly lạnh size L tại cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        store_id: store2._id,
        name: 'Ly giấy 2 lớp nóng 350ml CS2',
        code: 'MAT-CS02-LYGIAY',
        temperature_mode: 'hot',
        cup_size: 'Size S (350ml)',
        unit: 'Cái',
        cost_per_unit: 700,
        quantity_in_stock: 85, // Tồn kho riêng cơ sở 2
        min_threshold: 50,
        description: 'Ly giấy nóng cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        store_id: store2._id,
        name: 'Ống hút trân châu bọc màng CS2',
        code: 'MAT-CS02-ONGHUT',
        temperature_mode: 'both',
        unit: 'Cái',
        cost_per_unit: 120,
        quantity_in_stock: 450,
        min_threshold: 150,
        description: 'Ống hút to dùng cho topping cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await ingCol.insertMany([
      {
        store_id: store2._id,
        name: 'Trà Đen Lộc Phát CS2',
        code: 'MAT-CS02-TRADEN',
        unit: 'Gói',
        cost_per_unit: 65000,
        quantity_in_stock: 15, // Tồn kho cơ sở 2
        min_threshold: 5,
        usage_scope: 'both',
        description: 'Trà đen pha chế cốt trà cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        store_id: store2._id,
        name: 'Sữa Tươi Thanh Trùng DalatMilk CS2',
        code: 'MAT-CS02-SUATUOI',
        unit: 'Hộp',
        cost_per_unit: 36000,
        quantity_in_stock: 4, // Đang sắp hết hàng ở cơ sở 2
        min_threshold: 8,
        usage_scope: 'customer_product',
        description: 'Sữa tươi thanh trùng 1 lít tại cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        store_id: store2._id,
        name: 'Đường Cát Trắng Biên Hòa CS2',
        code: 'MAT-CS02-DUONG',
        unit: 'Kg',
        cost_per_unit: 22000,
        quantity_in_stock: 40,
        min_threshold: 10,
        usage_scope: 'both',
        description: 'Đường cát nấu nước đường tại cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        store_id: store2._id,
        name: 'Siro Dâu Monin CS2',
        code: 'MAT-CS02-SIRO-DAU',
        unit: 'Chai',
        cost_per_unit: 210000,
        quantity_in_stock: 3,
        min_threshold: 2,
        usage_scope: 'customer_product',
        description: 'Siro dâu cao cấp tại cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const topInsert = await topCol.insertMany([
      {
        store_id: store2._id,
        name: 'Trân Châu Trắng 3Q Giòn CS2',
        code: 'TOP-CS02-TC-TRANG',
        unit: 'Bao',
        cost_per_unit: 45000,
        quantity_in_stock: 12,
        min_threshold: 3,
        portion_unit: '1 vá',
        selling_price: 6000,
        description: 'Trân châu trắng 3Q cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        store_id: store2._id,
        name: 'Thạch Củ Năng Giòn Lá Dứa CS2',
        code: 'TOP-CS02-THACH-NANG',
        unit: 'Hộp',
        cost_per_unit: 38000,
        quantity_in_stock: 7,
        min_threshold: 3,
        portion_unit: '1 vá',
        selling_price: 7000,
        description: 'Thạch củ năng cơ sở 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Đồng bộ sang sellable_toppings của Store 2
    for (const topId of Object.values(topInsert.insertedIds)) {
      const topDoc = await topCol.findOne({ _id: topId });
      if (topDoc) {
        await sellTopCol.insertOne({
          store_id: store2._id,
          topping_id: topDoc._id,
          name: topDoc.name,
          code: topDoc.code,
          portion_unit: topDoc.portion_unit || '1 vá',
          selling_price: topDoc.selling_price || 6000,
          cost_estimate: 1500,
          description: topDoc.description || null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    console.log('✅ Store 2 materials and toppings seeded successfully!');
  }

  // 5. Cập nhật phân quyền chi nhánh cho Users
  await userCol.updateOne(
    { email: 'vatlieu@zonesix.vn' },
    { $set: { assigned_store_id: store1._id } }
  );
  await userCol.updateOne(
    { email: 'truongca@zonesix.vn' },
    { $set: { assigned_store_id: store1._id } }
  );
  await userCol.updateOne(
    { email: 'nhanvien@zonesix.vn' },
    { $set: { assigned_store_id: store1._id } }
  );
  await userCol.updateOne(
    { email: 'lamlich@zonesix.vn' },
    { $set: { assigned_store_id: store1._id } }
  );
  await userCol.updateOne(
    { email: 'quanly@zonesix.vn' },
    { $set: { assigned_store_id: store1._id, assigned_stores: [store1._id, store2._id] } }
  );

  console.log('✅ Users store assignments updated successfully!');
  await mongoose.disconnect();
  console.log('🎉 Migration completed successfully!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
