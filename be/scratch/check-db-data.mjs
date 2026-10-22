import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = process.env.DATABASE_URL;
console.log('Connecting to MongoDB Atlas...');
await mongoose.connect(uri);
console.log('Connected!');

const collections = await mongoose.connection.db.listCollections().toArray();
console.log('\n--- COLLECTIONS IN DATABASE zone_6 ---');
collections.forEach(c => console.log(' - ' + c.name));

const usersCount = await mongoose.connection.db.collection('users').countDocuments();
const shiftRegCount = await mongoose.connection.db.collection('shift_registrations').countDocuments();
const weeklySchedCount = await mongoose.connection.db.collection('weekly_schedules').countDocuments();
const regWindowsCount = await mongoose.connection.db.collection('registration_windows').countDocuments();

console.log('\n--- DOCUMENT COUNTS ---');
console.log(`users: ${usersCount}`);
console.log(`shift_registrations: ${shiftRegCount}`);
console.log(`weekly_schedules: ${weeklySchedCount}`);
console.log(`registration_windows: ${regWindowsCount}`);

console.log('\n--- SAMPLE SHIFT REGISTRATIONS ---');
const sampleRegs = await mongoose.connection.db.collection('shift_registrations').find({}).limit(5).toArray();
sampleRegs.forEach(r => {
  console.log(`Staff: ${r.user_name} (${r.user_code}), Week: ${r.week_start_date}, Mon: ${r.mon}, Tue: ${r.tue}, Wed: ${r.wed}, Thu: ${r.thu}, Fri: ${r.fri}, Sat: ${r.sat}, Sun: ${r.sun}`);
});

console.log('\n--- SAMPLE WEEKLY SCHEDULES ---');
const sampleScheds = await mongoose.connection.db.collection('weekly_schedules').find({}).toArray();
console.log(`Found ${sampleScheds.length} weekly schedules:`);
sampleScheds.forEach(s => {
  console.log(`Week: ${s.week_start_date} (${s.week_range}), Status: ${s.status}, CreatedBy: ${s.created_by_name}, Slots count: ${s.slots?.length}`);
});

await mongoose.disconnect();
console.log('\nDone check.');
