"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaQrcode, FaDownload, FaCopy, FaCheck } from "react-icons/fa";
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

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    staff.qr_code || `QR-${staff.user_code}`
  )}&bgcolor=12141a&color=d4af37&margin=10`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(staff.qr_code || `QR-${staff.user_code}`);
    setCopied(true);
    toast.success("Đã sao chép mã QR vào bộ nhớ tạm!");
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
        className="fixed inset-0 bg-[#0B0C10]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#12141A] border border-[#212532] shadow-2xl p-6 space-y-5 animate-fadeIn z-10 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#212532]">
          <div className="flex items-center gap-2 text-[#D4AF37] font-black text-sm">
            <FaQrcode />
            <span>MÃ QR ĐIỂM DANH CA TRỰC</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#181B24] hover:bg-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] flex items-center justify-center transition cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* QR Display */}
        <div className="p-4 bg-[#0B0C10] rounded-2xl border border-[#212532] inline-block mx-auto shadow-inner">
          <img
            src={qrImageUrl}
            alt={`QR Code ${staff.name}`}
            className="w-48 h-48 rounded-xl object-contain mx-auto"
          />
        </div>

        {/* Staff details */}
        <div>
          <div className="text-base font-black text-[#F4F5F8]">{staff.name}</div>
          <div className="text-xs text-[#D4AF37] font-semibold mt-0.5">
            {staff.role_label} • {staff.position || "Phục vụ"}
          </div>
          <div className="text-[11px] text-[#6D7588] mt-1 font-mono">
            {staff.email}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#212532] bg-[#181B24] hover:bg-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] text-xs font-bold transition cursor-pointer"
          >
            {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
            <span>{copied ? "Đã chép" : "Sao chép mã"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQr}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs transition shadow-md cursor-pointer hover:brightness-110"
          >
            <FaDownload />
            <span>Tải Ảnh QR</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
