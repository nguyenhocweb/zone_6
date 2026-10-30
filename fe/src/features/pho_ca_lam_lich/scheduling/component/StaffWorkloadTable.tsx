"use client";

import React from "react";
import { StaffWorkloadSummary } from "../type/scheduling.type";
import { FaArrowUp, FaCheck, FaExclamationTriangle, FaUsers } from "react-icons/fa";

interface Props {
  workloads: StaffWorkloadSummary[];
}

export const StaffWorkloadTable: React.FC<Props> = ({ workloads }) => {
  const totalStaff = workloads.length;
  const totalAssigned = workloads.reduce((acc, cur) => acc + cur.assigned_shifts, 0);
  const avgShifts = totalStaff > 0 ? (totalAssigned / totalStaff).toFixed(1) : 0;
  const metTargetCount = workloads.filter(
    (w) => w.assigned_shifts >= w.target_shifts || w.status === "Đủ" || w.status === "Vượt"
  ).length;

  return (
    <div className="bg-[#12141A] border border-[#212532] rounded-3xl p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#212532] mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#181B24] text-[#D4AF37] border border-[#D4AF37]/30 gold-glow-sm">
            <FaUsers className="text-xl" />
          </div>
          <div>
            <h3 className="text-base font-black gold-gradient-text uppercase tracking-wide">
              Bảng Cân Đối Tải &amp; Phân Bổ Ca Nhân Sự
            </h3>
            <p className="text-xs text-[#8E95A5]">
              Mức độ phân bổ công bằng: {metTargetCount}/{totalStaff} nhân viên đạt/vượt chỉ tiêu định mức.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#181B24] font-bold text-[#E7CD80] border border-[#212532]">
            Tổng nhân sự: <strong className="text-white">{totalStaff}</strong>
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-[#181B24] font-bold text-[#F5D77F] border border-[#D4AF37]/40">
            Trung bình: <strong className="text-[#D4AF37]">~{avgShifts} ca / người</strong>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#B9BECC]">
          <thead className="bg-[#0B0C10] border-b border-[#212532] uppercase tracking-wider font-black text-[#D4AF37]">
            <tr>
              <th className="px-4 py-3 w-16 text-center">STT</th>
              <th className="px-4 py-3">Tên Nhân Viên</th>
              <th className="px-4 py-3 text-center">Số Ca Đã Xếp</th>
              <th className="px-4 py-3 text-center">Chỉ Tiêu Tối Thiểu</th>
              <th className="px-4 py-3 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#212532]">
            {workloads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#444B60]">
                  Chưa có dữ liệu phân công nhân sự.
                </td>
              </tr>
            ) : (
              workloads.map((staff, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#181B24]/80 transition-colors"
                >
                  <td className="px-4 py-3 text-center font-bold text-[#6D7588]">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-extrabold text-[#F4F5F8]">
                    {staff.name}
                  </td>
                  <td className="px-4 py-3 text-center font-black text-[#D4AF37] text-sm">
                    {staff.assigned_shifts} ca
                  </td>
                  <td className="px-4 py-3 text-center text-[#8E95A5] font-semibold">
                    {staff.target_shifts} ca
                  </td>
                  <td className="px-4 py-3 text-center">
                    {staff.assigned_shifts > staff.target_shifts || staff.status === "Vượt" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-[#142338] text-sky-300 border border-sky-500/40 shadow-xs">
                        <FaArrowUp className="text-[10px] text-sky-400" /> Vượt ({staff.assigned_shifts}/{staff.target_shifts})
                      </span>
                    ) : staff.assigned_shifts < staff.target_shifts || staff.status === "Thiếu" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-[#261B09] text-amber-300 border border-amber-600/40">
                        <FaExclamationTriangle className="text-[10px]" /> Thiếu ({staff.assigned_shifts}/{staff.target_shifts})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black bg-[#181B24] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs">
                        <FaCheck className="text-[10px]" /> Đủ
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
