import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb+srv://My_Restaurant:Matkhau2k3.@nguyenhocweb.pqyjucr.mongodb.net/zone_6?retryWrites=true&w=majority&appName=nguyenhocweb';

async function updateSizes() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const db = mongoose.connection.db;
  const collection = db.collection('recipes');

  const res1 = await collection.updateOne({ code: 'REC-CA-PHE-MUOI' }, { $set: { serving_size: 'Size M' } });
  const res2 = await collection.updateOne({ code: 'REC-TRA-DAU' }, { $set: { serving_size: 'Size L' } });
  const res3 = await collection.updateOne({ code: 'REC-TRA-DAO-CAM-SA' }, { $set: { serving_size: 'Size L' } });

  console.log('Updated recipes:', { res1: res1.modifiedCount, res2: res2.modifiedCount, res3: res3.modifiedCount });

  await mongoose.disconnect();
  console.log('Disconnected');
}

updateSizes().catch(console.error);
