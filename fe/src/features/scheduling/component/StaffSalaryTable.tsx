"use client";

import React, { useEffect, useState } from "react";
import {
  FaCoins,
  FaFileInvoiceDollar,
  FaLock,
  FaMoneyBillWave,
  FaShieldAlt,
  FaSpinner,
  FaUserTie,
} from "react-icons/fa";
import { getStaffSalariesService, type StaffSalaryItem } from "../service/scheduling.service";
import { useAuth } from "@/features/auth/hook/useAuth";

export const StaffSalaryTable: React.FC = () => {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<StaffSalaryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quy tắc 3: Quản lý và Trưởng ca (cùng Admin) có thể xem lương theo tháng
  const canViewSalary = user
    ? ["admin_he_thong", "quan_ly", "truong_ca"].includes(user.role)
    : false;

  useEffect(() => {
    if (!canViewSalary) {
      setIsLoading(false);
      return;
    }

    getStaffSalariesService()
      .then((data) => {
        setSalaries(data || []);
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.message || "Không thể tải bảng lương nhân viên");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [canViewSalary]);

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
    (sum, item) => sum + (item.estimated_monthly_salary || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Security Policy Notice */}
      <div className="p-6 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center text-xl text-[#0B0C10] font-black shadow-lg">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black gold-gradient-text uppercase">
                Bảng Lương Tháng Nhân Sự (Zone Six Lounge & Cafe)
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#181B24] text-[#D4AF37] border border-[#D4AF37]/40">
                Quy tắc 3: Quản lý & Trưởng ca
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              Tra cứu mức lương theo giờ và quỹ lương tháng ước tính dựa trên định mức ca làm việc.
            </p>
          </div>
        </div>

        {/* Total Payroll KPI */}
        <div className="p-4 rounded-2xl bg-[#181B24] border border-[#D4AF37]/40 shadow-inner flex items-center gap-4 self-stretch md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-[#201A09] border border-[#D4AF37]/50 flex items-center justify-center text-lg text-[#F5D77F]">
            <FaCoins />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#8E95A5] tracking-wider">
              Tổng Quỹ Lương Dự Kiến / Tháng
            </div>
            <div className="text-base font-black text-[#F5D77F] gold-gradient-text">
              {formatVND(totalMonthlyPayroll)}
            </div>
          </div>
        </div>
      </div>

      {/* Security Confidentiality Notice */}
      <div className="p-4 rounded-2xl bg-[#0E1015] border border-[#212532] flex items-center gap-3 text-xs text-[#8E95A5]">
        <FaShieldAlt className="text-[#D4AF37] text-base shrink-0" />
        <span>
          <strong className="text-[#F4F5F8]">Chính sách bảo mật nội bộ Zone 6:</strong> Thông tin hiển thị tuân thủ nghiêm ngặt Quy tắc 3 — chỉ bao gồm <strong>Tên nhân viên</strong>, <strong>Vị trí</strong> và <strong>Mức lương</strong>. Toàn bộ thông tin riêng tư khác (mật khẩu, mã QR cá nhân, số điện thoại) được bảo vệ và ẩn hoàn toàn.
        </span>
      </div>

      {/* Main Salary Table */}
      <div className="bg-[#12141A] border border-[#212532] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[#212532] bg-[#0B0C10] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-[#D4AF37]" />
            <h3 className="text-xs font-black gold-gradient-text uppercase tracking-wider">
              Danh Sách Lương Nhân Sự Zone 6
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#181B24] text-[#E7CD80] border border-[#212532]">
              {salaries.length} nhân sự
            </span>
          </div>

          {isLoading && (
            <span className="text-xs text-[#8E95A5] flex items-center gap-1.5">
              <FaSpinner className="animate-spin text-[#D4AF37]" /> Đang tải dữ liệu lương...
            </span>
          )}
        </div>

        {errorMsg ? (
          <div className="py-12 text-center text-xs text-rose-400">
            {errorMsg}
          </div>
        ) : salaries.length === 0 && !isLoading ? (
          <div className="py-12 text-center text-xs text-[#6D7588]">
            Chưa có dữ liệu nhân viên hoạt động trong hệ thống.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F4F5F8] border-collapse">
              <thead>
                <tr className="bg-[#0E1015] border-b border-[#212532] text-[11px] font-black uppercase text-[#D4AF37]">
                  <th className="px-4 py-3.5 w-12 text-center border-r border-[#212532]">STT</th>
                  <th className="px-5 py-3.5 min-w-[180px] border-r border-[#212532]">Tên Nhân Viên</th>
                  <th className="px-4 py-3.5 min-w-[130px] border-r border-[#212532]">Vai Trò Hệ Thống</th>
                  <th className="px-4 py-3.5 text-right border-r border-[#212532]">Mức Lương / Giờ</th>
                  <th className="px-4 py-3.5 text-center border-r border-[#212532]">Giờ Chuẩn / Tháng</th>
                  <th className="px-5 py-3.5 text-right">Lương Tháng Ước Tính</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212532]">
                {salaries.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#181B24]/40 transition-colors">
                    <td className="px-4 py-3.5 text-center text-[#8E95A5] font-mono border-r border-[#212532]">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#F4F5F8] border-r border-[#212532]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#181B24] border border-[#212532] flex items-center justify-center text-xs text-[#D4AF37]">
                          <FaUserTie />
                        </div>
                        <span className="font-extrabold text-sm text-[#F4F5F8]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-r border-[#212532]">
                      <span className="text-[11px] font-semibold text-[#8E95A5]">
                        {item.role_label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-[#E7CD80] border-r border-[#212532]">
                      {formatVND(item.hourly_rate)} /h
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-[#8E95A5] border-r border-[#212532]">
                      {item.estimated_monthly_hours} giờ ({item.weekly_hours}h/tuần)
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-black text-sm text-[#F5D77F] gold-gradient-text">
                      {formatVND(item.estimated_monthly_salary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
