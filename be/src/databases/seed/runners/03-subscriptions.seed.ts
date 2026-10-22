import { readFileSync } from 'node:fs';
import { prisma } from '../../init.mongodb.js';

const plansData = JSON.parse(
  readFileSync(new URL('../data/subscription_plans.json', import.meta.url), 'utf-8')
);

export async function seedSubscriptions() {
  console.log('👉 [Tầng 3] Đang khởi tạo Gói dịch vụ hệ thống...');

  for (const plan of plansData) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        maxProjects: plan.maxProjects,
        isActive: plan.isActive,
      },
      create: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        maxProjects: plan.maxProjects,
        isActive: plan.isActive,
      },
    });
  }

  console.log(`✅ [Tầng 3] Hoàn thành ${plansData.length} Gói dịch vụ.`);
}
