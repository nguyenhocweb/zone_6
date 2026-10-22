import { getSlotWorkStatus, getSlotTimeRange } from '../../fe/src/features/scheduling/util/scheduler-helpers.ts';

const testDate = new Date(2026, 9, 21, 22, 14, 0); // 22:14 Thứ 4 ngày 21/10/2026

console.log('Test date:', testDate.toString());
const range = getSlotTimeRange('2026-10-19', 'Thứ 4', 'Khuya');
console.log('Range for Khuya:', range?.startTime.toString(), 'to', range?.endTime.toString());

const status = getSlotWorkStatus(
  '2026-10-19',
  'Thứ 4',
  'Khuya',
  testDate,
  { before: 90, after: 120 }
);

console.log('Status with {before: 90, after: 120}:', status);

const statusDefault = getSlotWorkStatus(
  '2026-10-19',
  'Thứ 4',
  'Khuya',
  testDate
);

console.log('Status with default (30):', statusDefault);
