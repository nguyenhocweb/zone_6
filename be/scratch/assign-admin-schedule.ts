import { connectDatabase, disconnectDatabase } from '../src/core/database.js';
import { WeeklyScheduleModel } from '../src/modules/scheduling/models/weekly-schedule.model.js';

async function updateScheduleWithPartners() {
  await connectDatabase();
  
  const weekStartDate = '2026-10-19';
  const schedule = await WeeklyScheduleModel.findOne({ week_start_date: weekStartDate }).exec();
  
  if (!schedule) {
    console.error(`Không tìm thấy lịch làm việc cho tuần ${weekStartDate}`);
    return;
  }
  
  console.log(`Đang cập nhật 49 ca làm việc tuần ${weekStartDate}...`);
  
  for (const slot of schedule.slots) {
    slot.is_disabled = false;
    slot.is_empty = false;
    slot.is_checked_in = false;
    
    // Nếu vị trí là Pha chế hoặc Khuya -> Gán Admin Hệ Thống
    // Nếu vị trí là Giữ xe -> Gán "Nam" (hoặc "Hoàng") để tạo ca 2 người phục vụ Chụp Chung
    if (slot.role === 'Pha chế' || slot.shift === 'Khuya') {
      slot.staff_name = 'Admin Hệ Thống';
    } else if (slot.role === 'Giữ xe') {
      slot.staff_name = slot.shift === 'Chiều' ? 'Hoàng' : 'Nam';
    } else {
      slot.staff_name = 'Admin Hệ Thống';
    }
  }
  
  schedule.workloads = [
    {
      name: 'Admin Hệ Thống',
      staff_name: 'Admin Hệ Thống',
      assigned_count: 28,
      assigned_shifts: 28,
      target_count: 28,
      target_shifts: 28,
      status: 'Đủ',
    } as any,
    {
      name: 'Nam',
      staff_name: 'Nam',
      assigned_count: 14,
      assigned_shifts: 14,
      target_count: 14,
      target_shifts: 14,
      status: 'Đủ',
    } as any,
    {
      name: 'Hoàng',
      staff_name: 'Hoàng',
      assigned_count: 7,
      assigned_shifts: 7,
      target_count: 7,
      target_shifts: 7,
      status: 'Đủ',
    } as any,
  ];
  
  schedule.updated_at = new Date();
  await schedule.save();
  
  console.log(`✅ Đã cập nhật xong: Admin Hệ Thống làm mọi ca (Pha chế / Khuya), và đồng nghiệp Nam / Hoàng làm Giữ xe trong mọi ca 2 người!`);
}

updateScheduleWithPartners()
  .catch(console.error)
  .finally(() => disconnectDatabase());
