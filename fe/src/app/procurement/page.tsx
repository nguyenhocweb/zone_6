import React from "react";
import { Metadata } from "next";
import { ProcurementDashboard } from "@/features/quan_ly/procurement/component/ProcurementDashboard";

export const metadata: Metadata = {
  title: "Trung Tâm Thu Mua & Đơn Hàng Gộp | Zone 6",
  description: "Quản lý đơn thu mua PO, gộp yêu cầu nhập kho đa chi nhánh và kiểm soát nhập kho toàn chuỗi",
};

export default function ProcurementPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-lg">
            📦
          </span>
          Trung Tâm Thu Mua & Đơn Hàng PO Gộp Đa Chi Nhánh
        </h1>
        <p className="text-sm text-[#8E95A5]">
          Tổng hợp yêu cầu nhập kho từ các cơ sở, phân nhóm theo Nhà Cung Cấp, tối ưu giá sỉ và xác nhận nhập kho thực tế
        </p>
      </div>

      <ProcurementDashboard />
    </div>
  );
}

