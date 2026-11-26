import React from "react";
import { Metadata } from "next";
import { FiPackage } from "react-icons/fi";
import { ProcurementDashboard } from "@/features/quan_ly/procurement/component/ProcurementDashboard";

export const metadata: Metadata = {
  title: "Trung Tâm Thu Mua & Đơn Hàng Gộp | Go Cà Phê",
  description: "Quản lý đơn thu mua PO, gộp yêu cầu nhập kho đa chi nhánh và kiểm soát nhập kho toàn chuỗi",
};

export default function ProcurementPage() {
  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-xl shadow-sm shrink-0">
            <FiPackage className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                Trung Tâm Thu Mua &amp; Đơn Hàng PO Gộp Đa Chi Nhánh
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300">
                Procurement &amp; Supply Chain
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
              Tổng hợp yêu cầu nhập kho từ các cơ sở, phân nhóm theo Nhà Cung Cấp, tối ưu giá sỉ và xác nhận nhập kho thực tế.
            </p>
          </div>
        </div>
      </div>

      <ProcurementDashboard />
    </div>
  );
}
