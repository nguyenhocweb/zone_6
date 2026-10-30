import ExcelJS from 'exceljs';
import path from 'node:path';
import { existsSync } from 'node:fs';
import type { 
  ScheduleMatrixResponse, 
  StaffRegistrationInput 
} from '../schemas/scheduling.schema.js';

export class ExcelScheduleService {
  /**
   * Đọc file Excel đăng ký ca (xlsx) và trích xuất danh sách nhân viên
   */
  static async parseRegistrationExcel(buffer: Buffer): Promise<StaffRegistrationInput[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    let sheet = workbook.worksheets[0];
    for (const ws of workbook.worksheets) {
      if (ws.name.toLowerCase().includes('dangky')) {
        sheet = ws;
        break;
      }
    }

    const registrations: StaffRegistrationInput[] = [];

    // Tìm dòng header
    let startRow = 5;
    for (let r = 1; r <= 10; r++) {
      const row = sheet.getRow(r);
      const val1 = String(row.getCell(1).value || '').toLowerCase();
      const val2 = String(row.getCell(2).value || '').toLowerCase();
      if (val1.includes('stt') || val2.includes('tên')) {
        startRow = r + 1;
        break;
      }
    }

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < startRow) return;

      const nameVal = String(row.getCell(2).value || '').trim();
      if (!nameVal) return;

      const sttVal = row.getCell(1).value;
      const sttInt = Number(sttVal) || registrations.length + 1;

      registrations.push({
        stt: sttInt,
        name: nameVal,
        mon: String(row.getCell(3).value || '').trim(),
        tue: String(row.getCell(4).value || '').trim(),
        wed: String(row.getCell(5).value || '').trim(),
        thu: String(row.getCell(6).value || '').trim(),
        fri: String(row.getCell(7).value || '').trim(),
        sat: String(row.getCell(8).value || '').trim(),
        sun: String(row.getCell(9).value || '').trim(),
      });
    });

    return registrations;
  }

  /**
   * Xuất ma trận kết quả ra file Excel mô phỏng đúng chuẩn Zone 6
   */
  static async exportScheduleToExcel(matrix: ScheduleMatrixResponse): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Tìm file template mẫu
    const candidatePaths = [
      path.resolve(process.cwd(), 'docs/LỊCH LÀM Z6 11th9-17th9.xlsx'),
      path.resolve(process.cwd(), '../docs/LỊCH LÀM Z6 11th9-17th9.xlsx'),
    ];

    let templateLoaded = false;
    for (const p of candidatePaths) {
      if (existsSync(p)) {
        await workbook.xlsx.readFile(p);
        templateLoaded = true;
        break;
      }
    }

    const ws = workbook.worksheets[0] || workbook.addWorksheet('Sheet1');
    ws.views = [{ showGridLines: true }];

    // Tính ngày bắt đầu
    let startDt = new Date();
    if (matrix.start_date) {
      const p = new Date(matrix.start_date);
      if (!isNaN(p.getTime())) startDt = p;
    }

    const endDt = new Date(startDt);
    endDt.setDate(startDt.getDate() + 6);

    // Tiêu đề A1
    const a1 = ws.getCell('A1');
    a1.value = `Lịch làm Zone Six 214 LNH (${startDt.getDate()}/${startDt.getMonth() + 1} - ${endDt.getDate()}/${endDt.getMonth() + 1})`;
    a1.alignment = { horizontal: 'center', vertical: 'middle' };

    // Tiêu đề các thứ
    const dayHeaders = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6 ', 'Thứ 7', 'Chủ nhật'];
    dayHeaders.forEach((text, i) => {
      const cell = ws.getCell(2, i + 2);
      cell.value = text;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Mapping slots
    const norm = (str?: string | null) => (str || '').trim().toLowerCase().replace(/^ca\s+/, '');
    const slotLookup = new Map<string, typeof matrix.slots[0]>();
    for (const s of matrix.slots) {
      slotLookup.set(`${norm(s.day)}:${norm(s.shift)}:${norm(s.role)}`, s);
    }

    const gridRows: Array<[number, string, string]> = [
      [4, 'sáng', 'pha chế'],
      [5, 'sáng', 'giữ xe'],
      [7, 'chiều', 'pha chế'],
      [8, 'chiều', 'giữ xe'],
      [10, 'tối', 'pha chế'],
      [11, 'tối', 'giữ xe'],
      [13, 'khuya', 'all'],
    ];

    const dayCols = [
      'thứ 2', 'thứ 3', 'thứ 4', 'thứ 5', 'thứ 6', 'thứ 7', 'chủ nhật'
    ];

    for (const [rIdx, shiftK, roleK] of gridRows) {
      dayCols.forEach((dayK, cIdx) => {
        const cell = ws.getCell(rIdx, cIdx + 2);

        // Ca tối 1 người -> dòng 11 để trắng
        if (rIdx === 11 && matrix.evening_shift_mode === 1) {
          cell.value = '';
          cell.fill = { type: 'pattern', pattern: 'none' };
          return;
        }

        const slot = slotLookup.get(`${dayK}:${shiftK}:${roleK}`);
        if (slot && slot.staff_name) {
          cell.value = slot.staff_name;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (slot.is_leader) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF00' },
            };
          }
        } else if (slot && slot.is_disabled) {
          cell.value = '';
          cell.fill = { type: 'pattern', pattern: 'none' };
        } else {
          // Ca trống -> tô màu đỏ
          cell.value = '';
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' },
          };
        }
      });
    }

    // Bảng thống kê bên phải: Cột 9 (STT), 10 (Tên), 11 (Số ca), 12 (Trạng thái)
    ws.getCell('J1').value = 'Tên';
    ws.getCell('K1').value = 'Số ca';

    matrix.workloads.forEach((wl, idx) => {
      const curR = 2 + idx;
      ws.getCell(curR, 9).value = idx + 1;
      ws.getCell(curR, 10).value = wl.name;
      ws.getCell(curR, 11).value = wl.assigned_shifts;
      ws.getCell(curR, 12).value = (wl.status || '').toLowerCase();
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }
}
