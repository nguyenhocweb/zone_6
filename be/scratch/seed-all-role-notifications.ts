import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { ScheduleNotificationService } from '../src/modules/scheduling/services/notification.service.js';
import { ALL_ROLE_NOTIFICATION_MODELS } from '../src/modules/scheduling/models/notification.model.js';

async function main() {
  await connectDatabase();
  console.log('--- Scanning & populating all 6 role collections in MongoDB Atlas ---');
  const service = new ScheduleNotificationService();
  await service.scanAndGenerateNotifications();

  for (const [roleKey, model] of Object.entries(ALL_ROLE_NOTIFICATION_MODELS)) {
    const count = await model.countDocuments({});
    console.log(`Collection: ${model.collection.name} (${roleKey}) -> ${count} notifications`);
    const samples = await model.find({}).limit(2);
    for (const s of samples) {
      console.log(`   - [${s.severity.toUpperCase()}] ${s.title}`);
    }
  }

  await disconnectDatabase();
}

main().catch(console.error);
