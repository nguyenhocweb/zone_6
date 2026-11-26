"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiMaximize2, FiDownload, FiCopy, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import type { StaffItem } from "../type/staff.type";

interface StaffQrModalProps {
  staff: StaffItem | null;
  onClose: () => void;
}

export const StaffQrModal: React.FC<StaffQrModalProps> = ({ staff, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted || !staff) return null;

  const virtualQrData = `DEMO-SALARY-QR-${staff.user_code || staff.id}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    virtualQrData
  )}&bgcolor=ffffff&color=1c1917&margin=10`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(virtualQrData);
    setCopied(true);
    toast.info("Đây là mã QR minh họa (chức năng thanh toán lương QR chưa cập nhật).");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `QR_${staff.user_code}_${staff.name}.png`;
    link.target = "_blank";
    link.click();
    toast.success("Đang tải ảnh mã QR nhân viên...");
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 shadow-2xl p-6 space-y-5 animate-fadeIn z-10 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 text-stone-900 dark:text-[#efe9de] font-semibold text-sm">
            <FiMaximize2 className="w-4 h-4 text-stone-400 dark:text-stone-400" />
            <span>Mã QR thanh toán lương</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="w-4 h-4 text-stone-400 dark:text-stone-400" />
          </button>
        </div>

        {/* QR Display (Virtual Preview) */}
        <div className="p-3 bg-white rounded-2xl border border-stone-200 dark:border-stone-800 inline-block mx-auto shadow-sm opacity-90">
          <img
            src={qrImageUrl}
            alt={`QR Thanh Toán Lương ${staff.name}`}
            className="w-44 h-44 rounded-xl object-contain mx-auto"
          />
        </div>

        {/* Notice: Chưa cập nhật chức năng */}
        <div className="px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-medium">
          Chưa cập nhật chức năng — Đây chỉ là mã QR ảo minh họa.
        </div>

        {/* Staff details */}
        <div>
          <div className="text-base font-semibold text-stone-900 dark:text-[#efe9de]">{staff.name}</div>
          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
            {staff.role_label} • {staff.position || "Phục vụ"}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 font-mono">
            {staff.email}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition cursor-pointer"
          >
            {copied ? (
              <FiCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FiCopy className="w-4 h-4 text-stone-400 dark:text-stone-400" />
            )}
            <span>{copied ? "Đã chép" : "Sao chép mã"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQr}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs transition shadow-sm cursor-pointer"
          >
            <FiDownload className="w-4 h-4 text-white/80 dark:text-stone-900/80" />
            <span>Tải ảnh QR</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
