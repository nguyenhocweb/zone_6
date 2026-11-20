'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiShield,
  FiLock,
  FiUser,
  FiLoader,
} from 'react-icons/fi';
import {
  getStaffSalariesService,
  type StaffSalaryItem,
} from '@/features/pho_ca_lam_lich/scheduling/service/scheduling.service';
import { useAuth } from '@/features/shared/auth/hook/useAuth';

export const StaffSalaryTable: React.FC = () => {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<StaffSalaryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bộ lọc tháng (Mặc định: tháng hiện tại YYYY-MM)
  const currentMonthDefault = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthDefault);

  // Phân quyền: Quản lý và Trưởng ca (cùng Admin) có thể xem lương theo tháng
  const canViewSalary = user
    ? ['admin_he_thong', 'quan_ly', 'truong_ca'].includes(user.role)
    : false;

  useEffect(() => {
    if (!canViewSalary) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    getStaffSalariesService(selectedMonth)
      .then((data) => {
        setSalaries(data || []);
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.message || 'Không thể tải bảng lương nhân viên');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [canViewSalary, selectedMonth]);

  if (!canViewSalary) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#1c1a17] border border-rose-200 dark:border-rose-900/50 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center text-rose-500 mx-auto text-xl">
          <FiLock className="w-5 h-5 text-stone-400" />
        </div>
        <h3 className="text-base font-bold text-rose-700 dark:text-rose-400">Không Có Quyền Truy Cập Bảng Lương</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Chỉ <strong>Quản Lý</strong> và <strong>Trưởng Ca</strong> mới có quyền tra cứu bảng lương nhân viên theo tháng.
        </p>
      </div>
    );
  }

  // Format tiền tệ VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalMonthlyPayroll = salaries.reduce(
    (sum, item) => sum + (item.actual_salary ?? item.estimated_monthly_salary ?? 0),
    0
  );

  const totalHoursWorked = salaries.reduce(
    (sum, item) => sum + (item.actual_hours_worked ?? item.estimated_monthly_hours ?? 0),
    0
  );

  const totalShiftsWorked = salaries.reduce(
    (sum, item) => sum + (item.actual_shifts_worked ?? 0),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Top Banner & KPI Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-xl shadow-sm shrink-0">
            <FiFileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                Bảng Lương Chấm Công Thực Tế
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300">
                GPS &amp; Attendance Realtime
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Tính lương tự động dựa trên số ca và giờ công thực tế nhân viên đã hoàn thành trong tháng.
            </p>
          </div>
        </div>

        {/* Bộ Lọc Tháng */}
        <div className="flex items-center gap-2.5 bg-stone-50 dark:bg-[#25221e] p-2 px-3 rounded-2xl border border-stone-200/80 dark:border-stone-700/60 shrink-0">
          <FiCalendar className="text-stone-400 text-xs shrink-0" />
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Kỳ Lương:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 text-stone-900 dark:text-[#efe9de] text-xs font-semibold px-2.5 py-1 rounded-xl outline-none focus:border-stone-400 transition cursor-pointer"
          />
        </div>
      </div>

      {/* 2. 3 Thẻ Chỉ Số KPI Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Tổng Quỹ Lương */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Tổng Quỹ Lương Thực Nhận</div>
            <div className="text-2xl font-mono font-bold text-stone-900 dark:text-[#efe9de] mt-1">
              {formatVND(totalMonthlyPayroll)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
            <FiDollarSign className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* KPI 2: Tổng Giờ Công Thực Tế */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Tổng Giờ Công Thực Tế</div>
            <div className="text-2xl font-mono font-bold text-stone-900 dark:text-[#efe9de] mt-1">
              {totalHoursWorked.toFixed(1)} <span className="text-xs font-normal text-stone-400">giờ</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
            <FiClock className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* KPI 3: Tổng Số Ca Đã Trực */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Tổng Ca Làm Đã Hoàn Thành</div>
            <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {totalShiftsWorked} <span className="text-xs font-normal text-stone-400">ca trực</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-center text-stone-400">
            <FiCheckCircle className="w-4 h-4 text-stone-400" />
          </div>
        </div>
      </div>

      {/* 3. Security Confidentiality Notice */}
      <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
        <FiShield className="w-4 h-4 text-stone-400 shrink-0" />
        <span>
          <strong className="text-stone-800 dark:text-stone-200">Chính sách bảo mật nội bộ Zone Six:</strong> Thông tin hiển thị tuân thủ nghiêm ngặt phân quyền — chỉ bao gồm <strong>Tên nhân viên</strong>, <strong>Vị trí</strong>, <strong>Ca thực tế</strong> và <strong>Lương thực nhận</strong>. Mọi thông tin nhạy cảm (mật khẩu, mã QR cá nhân, số điện thoại) được bảo vệ và ẩn hoàn toàn.
        </span>
      </div>

      {/* 4. Main Salary Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-stone-900 dark:text-[#efe9de] uppercase tracking-wider">
              Danh Sách Lương Tháng {selectedMonth}
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
              {salaries.length} nhân sự
            </span>
          </div>

          {isLoading && (
            <span className="text-xs text-stone-400 flex items-center gap-1.5">
              <FiLoader className="animate-spin text-stone-400" />
              <span>Đang tính toán dữ liệu chấm công...</span>
            </span>
          )}
        </div>

        {errorMsg ? (
          <div className="py-12 text-center text-xs text-rose-500">
            {errorMsg}
          </div>
        ) : salaries.length === 0 && !isLoading ? (
          <div className="py-12 text-center text-xs text-stone-400 dark:text-stone-500">
            Chưa có dữ liệu nhân viên hoạt động trong kỳ lương này.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200/80 dark:border-stone-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">STT</th>
                  <th className="px-5 py-3.5 min-w-[180px]">Nhân Viên</th>
                  <th className="px-4 py-3.5 min-w-[130px]">Vai Trò</th>
                  <th className="px-4 py-3.5 text-right">Lương / Giờ</th>
                  <th className="px-4 py-3.5 text-center">Ca Đã Làm</th>
                  <th className="px-4 py-3.5 text-center">Giờ Thực Tế</th>
                  <th className="px-4 py-3.5 text-center">Chuyên Cần</th>
                  <th className="px-5 py-3.5 text-right">Lương Thực Nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                {salaries.map((item, idx) => {
                  const actualShifts = item.actual_shifts_worked ?? 0;
                  const actualHours = item.actual_hours_worked ?? item.estimated_monthly_hours ?? 0;
                  const actualSalary = item.actual_salary ?? item.estimated_monthly_salary ?? 0;
                  const completionRate = item.completion_rate ?? 100;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition-colors">
                      <td className="px-4 py-3.5 text-center text-stone-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-stone-900 dark:text-[#efe9de]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-xs text-stone-500 dark:text-stone-400 shrink-0">
                            <FiUser className="w-4 h-4 text-stone-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-stone-900 dark:text-[#efe9de]">{item.name}</div>
                            <div className="text-[11px] text-stone-400 font-normal">{item.position || 'Nhân viên'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-[#25221e] px-2 py-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700/60">
                          {item.role_label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-stone-800 dark:text-stone-200">
                        {formatVND(item.hourly_rate)} /h
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono">
                        <span className="font-semibold text-stone-900 dark:text-[#efe9de] px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60">
                          {actualShifts} ca
                        </span>
                        {item.late_shifts_count && item.late_shifts_count > 0 ? (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                            {item.late_shifts_count} ca trễ
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-stone-800 dark:text-stone-200 font-semibold">
                        {actualHours.toFixed(1)} h
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            completionRate >= 90
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/50'
                              : completionRate >= 60
                              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/50'
                              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200/70 dark:border-rose-800/50'
                          }`}
                        >
                          {completionRate}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-sm text-stone-900 dark:text-[#efe9de]">
                        {formatVND(actualSalary)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
