import { getShiftTimeRange } from '../src/modules/scheduling/services/weekly-schedule.service.js';

const now = new Date();
console.log('now ISO:', now.toISOString());
console.log('now getTimezoneOffset:', now.getTimezoneOffset());
const timeRange = getShiftTimeRange('2026-10-19', 'Thứ 2', 'Sáng');
console.log('Sáng Thứ 2 startTime ISO:', timeRange?.startTime.toISOString());
console.log('Sáng Thứ 2 endTime ISO:', timeRange?.endTime.toISOString());
console.log('now > endTime:', timeRange ? now.getTime() > timeRange.endTime.getTime() : false);
