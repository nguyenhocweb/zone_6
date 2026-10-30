import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb+srv://My_Restaurant:Matkhau2k3.@nguyenhocweb.pqyjucr.mongodb.net/zone_6?retryWrites=true&w=majority&appName=nguyenhocweb';

async function migrateRecipes() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const db = mongoose.connection.db;
  const storeCol = db.collection('store_configs');
  const recipeCol = db.collection('recipes');

  // Lấy Store 1 & Store 2
  const store1 = await storeCol.findOne({ store_code: 'Z6-CS01' });
  const store2 = await storeCol.findOne({ store_code: 'Z6-CS02' });

  if (!store1 || !store2) {
    console.error('Missing Store 1 or Store 2!');
    process.exit(1);
  }

  const s1Id = store1._id;
  const s2Id = store2._id;

  console.log('Store 1 ID:', s1Id.toString(), 'Store 2 ID:', s2Id.toString());

  // 1. Gán tất cả món hiện tại chưa có store_id hoặc đang dùng chung vào Store 1 (Lương Nhữ Học)
  const res1 = await recipeCol.updateMany(
    { $or: [{ store_id: null }, { store_id: { $exists: false } }] },
    { $set: { store_id: s1Id } }
  );
  console.log(`Assigned ${res1.modifiedCount} existing recipes to Store 1.`);

  // 2. Tạo món riêng cho Store 2 (214 Lê Ninh) nếu chưa có
  const cs2Recipes = [
    {
      store_id: s2Id,
      name: 'Cà Phê Trứng Béo CS2',
      code: 'REC-CS02-CA-PHE-TRUNG',
      type: 'customer_product',
      category: 'Cà phê',
      price: 38000,
      estimated_cost: 9500,
      description: 'Cà phê pha máy nguyên chất phối cùng lớp kem trứng đánh bông béo ngậy đặc trưng tại cơ sở 2.',
      image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      serving_size: 'Size M',
      serving_mode: 'cold',
      prep_time_minutes: 3,
      shelf_life: 'Dùng ngay',
      storage_method: 'Nhiệt độ có đá',
      ingredients: [
        { material_name: 'Cốt Cà Phê Blend Zone 6', quantity: 50, unit: 'ml', cost: 3500 },
        { material_name: 'Sữa đặc Ngôi Sao Phương Nam', quantity: 20, unit: 'ml', cost: 1200 },
        { material_name: 'Kem Trứng Nướng Cháy CS2', quantity: 60, unit: 'ml', cost: 3000 },
        { material_name: 'Ly nhựa PP 500ml (Size M)', quantity: 1, unit: 'Cái', cost: 450 },
      ],
      steps: [
        { step_number: 1, title: 'Rót sữa đặc & Cà phê', instruction: 'Rót 20ml sữa đặc vào đáy ly, chiết xuất 50ml espresso ấm rót vào khuấy đều.' },
        { step_number: 2, title: 'Đá & Phủ kem trứng', instruction: 'Cho đá bi cách miệng 3cm, rót nhẹ nhàng lớp kem trứng phủ kín mặt.' },
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: s2Id,
      name: 'Trà Xoài Nhiệt Đới CS2',
      code: 'REC-CS02-TRA-XOAI',
      type: 'customer_product',
      category: 'Trà trái cây',
      price: 42000,
      estimated_cost: 10200,
      description: 'Hương trà lài thanh mát hòa quyện sốt xoài cát tươi vàng óng và topping hạt trân châu giòn sần sật.',
      image_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
      serving_size: 'Size L',
      serving_mode: 'cold',
      prep_time_minutes: 3,
      shelf_life: 'Dùng ngay trong ngày',
      storage_method: 'Nhiệt độ có đá',
      ingredients: [
        { material_name: 'Cốt Trà Oolong Nướng CS2', quantity: 150, unit: 'ml', cost: 2800 },
        { material_name: 'Mứt Dâu Monin CS2', quantity: 30, unit: 'g', cost: 3000 },
        { material_name: 'Đường Cát Trắng Biên Hòa CS2', quantity: 20, unit: 'ml', cost: 500 },
        { material_name: 'Ly nhựa PP 700ml (Size L)', quantity: 1, unit: 'Cái', cost: 550 },
      ],
      steps: [
        { step_number: 1, title: 'Lắc cốt trà & sốt xoài', instruction: 'Cho trà, sốt xoài, đá vào shaker lắc mạnh 15 lần.' },
        { step_number: 2, title: 'Rót ly & trang trí', instruction: 'Đổ ra ly 700ml, thêm lát xoài tươi decor mặt ly.' },
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: s2Id,
      name: 'Trà Sữa Oolong Nướng CS2',
      code: 'REC-CS02-TS-OOLONG',
      type: 'customer_product',
      category: 'Trà sữa',
      price: 45000,
      estimated_cost: 11000,
      description: 'Trà sữa rang đậm đà vị khói đặc trưng phối hợp cùng sữa thanh trùng béo ngậy.',
      image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
      serving_size: 'Size L',
      serving_mode: 'both',
      prep_time_minutes: 3,
      shelf_life: 'Dùng ngay trong ngày',
      storage_method: 'Nhiệt độ phòng hoặc có đá',
      ingredients: [
        { material_name: 'Cốt Trà Oolong Nướng CS2', quantity: 120, unit: 'ml', cost: 2500 },
        { material_name: 'Sữa Tươi Thanh Trùng DalatMilk CS2', quantity: 80, unit: 'ml', cost: 3200 },
        { material_name: 'Syrup Đường Đen Nấu Chậm CS2', quantity: 25, unit: 'ml', cost: 1200 },
        { material_name: 'Ly nhựa PP 700ml (Size L)', quantity: 1, unit: 'Cái', cost: 550 },
      ],
      steps: [
        { step_number: 1, title: 'Khuấy sữa & đường đen', instruction: 'Cho đường đen quết quanh thành ly tạo vệt caramel đẹp mắt.' },
        { step_number: 2, title: 'Hòa quyện cốt trà sữa', instruction: 'Khuấy đều cốt trà oolong cùng sữa tươi rót vào ly.' },
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: s2Id,
      name: 'Cốt Trà Oolong Nướng CS2',
      code: 'REC-CS02-COT-OOLONG',
      type: 'internal_prep',
      category: 'Cốt trà & Syrup sơ chế',
      price: 0,
      estimated_cost: 32000,
      description: 'Ủ 50g trà oolong nướng với 1.5L nước sôi 95°C trong 12 phút, giữ nhiệt chuẩn cho quầy pha chế cơ sở 2.',
      serving_size: '1.5 Lít',
      prep_time_minutes: 15,
      shelf_life: '6 tiếng trong bình ủ nhiệt',
      storage_method: 'Bình ủ trà inox kín',
      ingredients: [
        { material_name: 'Trà Đen Lộc Phát CS2', quantity: 50, unit: 'g', cost: 12000 },
      ],
      steps: [
        { step_number: 1, title: 'Đun nước sôi', instruction: 'Đun 1.5L nước sôi 95 độ C, tráng bình ủ.' },
        { step_number: 2, title: 'Hãm trà', instruction: 'Cho trà vào túi lọc, ủ trong 12 phút rồi vắt nhẹ lấy nước cốt.' },
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: s2Id,
      name: 'Syrup Đường Đen Nấu Chậm CS2',
      code: 'REC-CS02-DUONG-DEN',
      type: 'internal_prep',
      category: 'Cốt trà & Syrup sơ chế',
      price: 0,
      estimated_cost: 28000,
      description: 'Đường đen Hàn Quốc nấu sánh dẻo thơm caramel đặc trưng quầy bar CS2.',
      serving_size: '1 Lít',
      prep_time_minutes: 30,
      shelf_life: '15 ngày nhiệt độ phòng',
      storage_method: 'Chai thủy tinh tối màu',
      ingredients: [
        { material_name: 'Đường Cát Trắng Biên Hòa CS2', quantity: 500, unit: 'g', cost: 10000 },
      ],
      steps: [
        { step_number: 1, title: 'Nấu sôi lăn tăn', instruction: 'Đun nhỏ lửa khuấy đều tay đến khi syrup sánh dẻo.' },
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: s2Id,
      name: 'Kem Trứng Nướng Cháy CS2',
      code: 'REC-CS02-KEM-TRUNG',
      type: 'internal_prep',
      category: 'Cốt trà & Syrup sơ chế',
      price: 0,
      estimated_cost: 35000,
      description: 'Lớp foam trứng vàng óng thơm nức dùng cho các món Signature tại CS2.',
      serving_size: '500ml',
      prep_time_minutes: 10,
      shelf_life: '2 ngày trong tủ mát 4°C',
      storage_method: 'Ca đậy nắp trong ngăn mát tủ lạnh',
      ingredients: [
        { material_name: 'Sữa đặc Ngôi Sao Phương Nam', quantity: 100, unit: 'ml', cost: 5000 },
      ],
      steps: [
        { step_number: 1, title: 'Đánh bông kem trứng', instruction: 'Đánh số 3 máy đánh trứng trong 4 phút đến khi đạt độ sánh mịn.' },
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  for (const r of cs2Recipes) {
    const existing = await recipeCol.findOne({ code: r.code });
    if (!existing) {
      await recipeCol.insertOne(r);
      console.log(`Created CS2 Recipe: ${r.name}`);
    } else {
      await recipeCol.updateOne({ _id: existing._id }, { $set: { store_id: s2Id } });
      console.log(`Updated CS2 Recipe store_id: ${r.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('✅ Migration complete!');
}

migrateRecipes().catch(console.error);
