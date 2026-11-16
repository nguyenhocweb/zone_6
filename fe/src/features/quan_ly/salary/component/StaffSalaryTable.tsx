"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  FaCoins,
  FaFileInvoiceDollar,
  FaLock,
  FaMoneyBillWave,
  FaShieldAlt,
  FaSpinner,
  FaUserTie,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import {
  getStaffSalariesService,
  type StaffSalaryItem,
} from "@/features/pho_ca_lam_lich/scheduling/service/scheduling.service";
import { useAuth } from "@/features/shared/auth/hook/useAuth";

export const StaffSalaryTable: React.FC = () => {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<StaffSalaryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bộ lọc tháng (Mặc định: tháng hiện tại YYYY-MM)
  const currentMonthDefault = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthDefault);

  // Quy tắc 3: Quản lý và Trưởng ca (cùng Admin) có thể xem lương theo tháng
  const canViewSalary = user
    ? ["admin_he_thong", "quan_ly", "truong_ca"].includes(user.role)
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
        setErrorMsg(err?.response?.data?.message || "Không thể tải bảng lương nhân viên");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [canViewSalary, selectedMonth]);

  if (!canViewSalary) {
    return (
      <div className="bg-[#12141A] border border-red-500/30 rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto text-xl">
          <FaLock />
        </div>
        <h3 className="text-base font-black text-red-200">Không Có Quyền Truy Cập Bảng Lương</h3>
        <p className="text-xs text-[#8E95A5] max-w-md mx-auto">
          Quy tắc 3: Chỉ <strong>Quản Lý</strong> và <strong>Trưởng Ca</strong> mới có quyền tra cứu bảng lương nhân viên theo tháng.
        </p>
      </div>
    );
  }

  // Format tiền tệ VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
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
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & KPI Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#181B26] via-[#12141F] to-[#0D0F17] border border-[#212532] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-2xl text-[#0B0C10] font-black shadow-xl gold-glow-sm shrink-0">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black gold-gradient-text uppercase tracking-wide">
                Bảng Lương Chấm Công Thực Tế (Zone Six Lounge & Cafe)
              </h2>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Ăn theo dữ liệu GPS & Điểm danh thật 100%
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              Tính lương tự động dựa trên số ca và giờ công thực tế nhân viên đã hoàn thành trong tháng.
            </p>
          </div>
        </div>

        {/* Bộ Lọc Tháng */}
        <div className="flex items-center gap-3 bg-[#0B0C10] p-2 rounded-2xl border border-[#212532] self-stretch md:self-auto">
          <FaCalendarAlt className="text-[#D4AF37] ml-2 text-sm" />
          <span className="text-xs font-bold text-[#8E95A5]">Kỳ Lương:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#181B24] border border-[#2B3144] text-[#F4F5F8] text-xs font-bold px-3 py-1.5 rounded-xl outline-none focus:border-[#D4AF37] transition cursor-pointer"
          />
        </div>
      </div>

      {/* 3 Thẻ Chỉ Số KPI Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Tổng Quỹ Lương */}
        <div className="p-5 rounded-3xl bg-[#12141A] border border-[#D4AF37]/40 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#201A09] border border-[#D4AF37]/50 flex items-center justify-center text-xl text-[#F5D77F] shrink-0">
            <FaCoins />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-bold text-[#8E95A5] tracking-wider truncate">
              Tổng Quỹ Lương Thực Nhận
            </div>
            <div className="text-lg font-black text-[#F5D77F] gold-gradient-text font-mono truncate">
              {formatVND(totalMonthlyPayroll)}
            </div>
          </div>
        </div>

        {/* KPI 2: Tổng Giờ Công Thực Tế */}
        <div className="p-5 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#181B24] border border-blue-500/30 flex items-center justify-center text-xl text-blue-400 shrink-0">
            <FaClock />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-bold text-[#8E95A5] tracking-wider truncate">
              Tổng Giờ Công Chấm Thực Tế
            </div>
            <div className="text-lg font-black text-white font-mono truncate">
              {totalHoursWorked.toFixed(1)} <span className="text-xs font-normal text-[#8E95A5]">giờ</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Tổng Số Ca Đã Trực */}
        <div className="p-5 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#181B24] border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400 shrink-0">
            <FaCheckCircle />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-bold text-[#8E95A5] tracking-wider truncate">
              Tổng Ca Làm Đã Hoàn Thành
            </div>
            <div className="text-lg font-black text-emerald-400 font-mono truncate">
              {totalShiftsWorked} <span className="text-xs font-normal text-[#8E95A5]">ca trực</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Confidentiality Notice */}
      <div className="p-4 rounded-2xl bg-[#0E1015] border border-[#212532] flex items-center gap-3 text-xs text-[#8E95A5]">
        <FaShieldAlt className="text-[#D4AF37] text-base shrink-0" />
        <span>
          <strong className="text-[#F4F5F8]">Chính sách bảo mật nội bộ Zone 6:</strong> Thông tin hiển thị tuân thủ nghiêm ngặt Quy tắc 3 — chỉ bao gồm <strong>Tên nhân viên</strong>, <strong>Vị trí</strong>, <strong>Ca thực tế</strong> và <strong>Lương thực nhận</strong>. Mọi thông tin nhạy cảm (mật khẩu, mã QR cá nhân, số điện thoại) được bảo vệ và ẩn hoàn toàn.
        </span>
      </div>

      {/* Main Salary Table */}
      <div className="bg-[#12141A] border border-[#212532] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[#212532] bg-[#0B0C10] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-[#D4AF37]" />
            <h3 className="text-xs font-black gold-gradient-text uppercase tracking-wider">
              Danh Sách Lương Tháng {selectedMonth}
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#181B24] text-[#E7CD80] border border-[#212532]">
              {salaries.length} nhân sự
            </span>
          </div>

          {isLoading && (
            <span className="text-xs text-[#8E95A5] flex items-center gap-1.5">
              <FaSpinner className="animate-spin text-[#D4AF37]" /> Đang tính toán dữ liệu chấm công...
            </span>
          )}
        </div>

        {errorMsg ? (
          <div className="py-12 text-center text-xs text-rose-400">
            {errorMsg}
          </div>
        ) : salaries.length === 0 && !isLoading ? (
          <div className="py-12 text-center text-xs text-[#6D7588]">
            Chưa có dữ liệu nhân viên hoạt động trong kỳ lương này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F4F5F8] border-collapse">
              <thead>
                <tr className="bg-[#0E1015] border-b border-[#212532] text-[11px] font-black uppercase text-[#D4AF37]">
                  <th className="px-4 py-3.5 w-12 text-center border-r border-[#212532]">STT</th>
                  <th className="px-5 py-3.5 min-w-[180px] border-r border-[#212532]">Nhân Viên</th>
                  <th className="px-4 py-3.5 min-w-[130px] border-r border-[#212532]">Vai Trò</th>
                  <th className="px-4 py-3.5 text-right border-r border-[#212532]">Lương / Giờ</th>
                  <th className="px-4 py-3.5 text-center border-r border-[#212532]">Ca Đã Làm</th>
                  <th className="px-4 py-3.5 text-center border-r border-[#212532]">Giờ Thực Tế</th>
                  <th className="px-4 py-3.5 text-center border-r border-[#212532]">Chuyên Cần</th>
                  <th className="px-5 py-3.5 text-right">Lương Thực Nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212532]">
                {salaries.map((item, idx) => {
                  const actualShifts = item.actual_shifts_worked ?? 0;
                  const actualHours = item.actual_hours_worked ?? item.estimated_monthly_hours ?? 0;
                  const actualSalary = item.actual_salary ?? item.estimated_monthly_salary ?? 0;
                  const completionRate = item.completion_rate ?? 100;

                  return (
                    <tr key={item.id} className="hover:bg-[#181B24]/50 transition-colors">
                      <td className="px-4 py-3.5 text-center text-[#8E95A5] font-mono border-r border-[#212532]">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#F4F5F8] border-r border-[#212532]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#181B24] border border-[#212532] flex items-center justify-center text-xs text-[#D4AF37] shrink-0">
                            <FaUserTie />
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-[#F4F5F8]">{item.name}</div>
                            <div className="text-[11px] text-[#8E95A5] font-normal">{item.position || "Nhân viên"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 border-r border-[#212532]">
                        <span className="text-[11px] font-semibold text-[#8E95A5] bg-[#181B24] px-2 py-0.5 rounded border border-[#212532]">
                          {item.role_label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-[#E7CD80] border-r border-[#212532]">
                        {formatVND(item.hourly_rate)} /h
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono border-r border-[#212532]">
                        <span className="font-black text-white px-2 py-0.5 rounded bg-black/40 border border-white/5">
                          {actualShifts} ca
                        </span>
                        {item.late_shifts_count && item.late_shifts_count > 0 ? (
                          <div className="text-[10px] text-amber-400 mt-1 font-semibold">
                            ⚠️ {item.late_shifts_count} ca trễ
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-[#F4F5F8] font-bold border-r border-[#212532]">
                        {actualHours.toFixed(1)} h
                      </td>
                      <td className="px-4 py-3.5 text-center border-r border-[#212532]">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            completionRate >= 90
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : completionRate >= 60
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-red-500/15 text-red-300 border-red-500/30"
                          }`}
                        >
                          {completionRate}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-black text-sm text-[#F5D77F] gold-gradient-text">
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
