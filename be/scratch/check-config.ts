import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { StoreConfigModel } from '../src/modules/scheduling/models/store-config.model.js';

async function run() {
  await connectDatabase();
  await StoreConfigModel.updateOne({}, {
    allowed_checkin_before_minutes: 90,
    allowed_checkin_after_minutes: 120,
  });
  const config = await StoreConfigModel.findOne().lean();
  console.log('--- STORE CONFIG IN DB ---');
  console.log(JSON.stringify(config, null, 2));
}

run().finally(() => disconnectDatabase());
