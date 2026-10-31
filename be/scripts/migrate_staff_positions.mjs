import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://My_Restaurant:Matkhau2k3.@nguyenhocweb.pqyjucr.mongodb.net/zone_6?retryWrites=true&w=majority&appName=nguyenhocweb';

async function migratePositions() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const oldPositions = [
    'Pha chế',
    'Phục vụ',
    'Thu ngân',
    'Giữ xe',
    'BARISTA',
    'CASHIER',
    'SERVICE',
    'service',
    'Pha chế & Phục vụ',
  ];

  const updateResult = await db.collection('users').updateMany(
    { position: { $in: oldPositions } },
    { $set: { position: 'Nhân viên' } }
  );

  console.log(`✅ Successfully updated ${updateResult.modifiedCount} user records to 'Nhân viên'!`);

  const distinctNow = await db.collection('users').distinct('position');
  console.log('Distinct positions in DB now:', distinctNow);

  await mongoose.disconnect();
  process.exit(0);
}

migratePositions().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
