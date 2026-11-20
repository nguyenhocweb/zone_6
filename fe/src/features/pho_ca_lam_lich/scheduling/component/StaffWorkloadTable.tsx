"use client";

import React from "react";
import { StaffWorkloadSummary } from "../type/scheduling.type";
import { FiArrowUp, FiCheck, FiAlertTriangle, FiUsers } from "react-icons/fi";

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
    <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm transition-colors mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#25221e] text-stone-400 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center shrink-0">
            <FiUsers className="text-base" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
              Bảng Cân Đối Tải &amp; Phân Bổ Ca Nhân Sự
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Phân bổ công bằng: {metTargetCount}/{totalStaff} nhân viên đạt hoặc vượt chỉ tiêu định mức.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          <span className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e] font-medium text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
            Tổng nhân sự: <strong className="font-semibold text-stone-900 dark:text-[#efe9de]">{totalStaff}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e] font-medium text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
            Trung bình: <strong className="font-semibold text-stone-900 dark:text-[#efe9de]">~{avgShifts} ca / người</strong>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#181614] border-b border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300 font-medium">
              <th className="px-4 py-3 w-16 text-center border-r border-stone-200/80 dark:border-stone-800">STT</th>
              <th className="px-4 py-3 border-r border-stone-200/80 dark:border-stone-800">Tên Nhân Viên</th>
              <th className="px-4 py-3 text-center border-r border-stone-200/80 dark:border-stone-800">Số Ca Đã Xếp</th>
              <th className="px-4 py-3 text-center border-r border-stone-200/80 dark:border-stone-800">Chỉ Tiêu Tối Thiểu</th>
              <th className="px-4 py-3 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {workloads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  Chưa có dữ liệu phân công nhân sự.
                </td>
              </tr>
            ) : (
              workloads.map((staff, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-stone-50/50 dark:hover:bg-[#1f1d19]/40 transition-colors"
                >
                  <td className="px-4 py-3 text-center font-mono font-medium text-stone-500 dark:text-stone-400 border-r border-stone-200/80 dark:border-stone-800">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-[#efe9de] border-r border-stone-200/80 dark:border-stone-800">
                    {staff.name}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-stone-900 dark:text-[#efe9de] border-r border-stone-200/80 dark:border-stone-800">
                    {staff.assigned_shifts} ca
                  </td>
                  <td className="px-4 py-3 text-center text-stone-500 dark:text-stone-400 font-medium border-r border-stone-200/80 dark:border-stone-800">
                    {staff.target_shifts} ca
                  </td>
                  <td className="px-4 py-3 text-center">
                    {staff.assigned_shifts > staff.target_shifts || staff.status === "Vượt" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-900/40">
                        <FiArrowUp className="text-[10px] text-stone-400 shrink-0" />
                        <span>Vượt ({staff.assigned_shifts}/{staff.target_shifts})</span>
                      </span>
                    ) : staff.assigned_shifts < staff.target_shifts || staff.status === "Thiếu" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40">
                        <FiAlertTriangle className="text-[10px] text-stone-400 shrink-0" />
                        <span>Thiếu ({staff.assigned_shifts}/{staff.target_shifts})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40">
                        <FiCheck className="text-[10px] text-stone-400 shrink-0" />
                        <span>Đủ</span>
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
