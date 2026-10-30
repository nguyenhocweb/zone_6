"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  FaCloudUploadAlt,
  FaFileExcel,
  FaGoogleDrive,
  FaMagic,
  FaSpinner,
} from "react-icons/fa";

interface Props {
  isLoading: boolean;
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
  canManageSchedule?: boolean;
  userRoleLabel?: string;
}

export const ScheduleUploader: React.FC<Props> = ({
  isLoading,
  onFileUpload,
  onLoadSample,
  canManageSchedule = true,
  userRoleLabel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveUrl, setDriveUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isDriveModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDriveModalOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast.error("Vui lòng chọn file Excel định dạng .xlsx hoặc .xls!");
        return;
      }
      onFileUpload(file);
    }
  };

  const handleDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl.trim()) {
      toast.error("Vui lòng dán liên kết Google Drive của file đăng ký!");
      return;
    }
    toast.info("Đang nạp file từ Google Drive...");
    setIsDriveModalOpen(false);
    onLoadSample();
  };

  // Nếu không có quyền xếp lịch (nhân viên hoặc phó ca vật liệu) -> Hiển thị thông báo chế độ xem
  if (!canManageSchedule) {
    return (
      <div className="bg-[#12141A] border border-[#D4AF37]/30 rounded-3xl p-6 shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#181B24] border border-[#D4AF37]/40 flex items-center justify-center text-xl text-[#D4AF37] shrink-0 shadow-inner">
            👁️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#F4F5F8]">Chế Độ Xem Lịch Làm Việc (Read-Only)</span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#1A1D28] text-[#E7CD80] border border-[#D4AF37]/40">
                {userRoleLabel || "Nhân viên"}
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              Bạn đang xem bảng phân công ca tuần này. Quyền kích hoạt <strong>Auto xếp lịch</strong> và <strong>chỉnh sửa ca</strong> chỉ dành cho Quản lý, Trưởng ca và Phó ca làm lịch.
            </p>
          </div>
        </div>
        <div className="text-xs text-[#D4AF37] bg-[#181B24] px-3.5 py-2 rounded-xl border border-[#D4AF37]/30 font-medium self-stretch md:self-auto text-center">
          * Đăng ký ca làm của bạn tại tab <strong className="font-bold underline">"Đăng Ký Ca Làm"</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#12141A] border border-[#212532] rounded-3xl p-6 shadow-xl mb-8 transition-all">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Drag & Drop Card */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 w-full border-2 border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37] bg-[#181B24]/70 hover:bg-[#181B24] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition group text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-2xl mb-3 group-hover:scale-110 gold-glow-sm transition-transform">
            {isLoading ? <FaSpinner className="animate-spin text-[#D4AF37]" /> : <FaCloudUploadAlt />}
          </div>
          <p className="text-sm font-bold text-[#F4F5F8]">
            Kéo thả hoặc bấm để chọn file Excel đăng ký ca
          </p>
          <p className="text-xs text-[#8E95A5] mt-1">
            Định dạng tương thích: <code className="text-[#D4AF37]">FILE_MAU_DANG_KY_LICH_LAM_ZONE6_V2.xlsx</code>
          </p>
        </div>

        {/* Right: Quick action buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-64">
          <button
            type="button"
            disabled={isLoading}
            onClick={onLoadSample}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl gold-gradient-bg hover:brightness-110 text-[#0B0C10] text-xs font-black shadow-lg gold-glow-sm transition disabled:opacity-50"
          >
            <FaMagic className="text-sm" /> Dùng Mẫu Nhân Sự V2 (Zone 6)
          </button>

          <button
            type="button"
            onClick={() => setIsDriveModalOpen(true)}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-[#212532] bg-[#181B24] hover:bg-[#212532] hover:border-[#D4AF37]/40 text-[#E7CD80] text-xs font-bold transition"
          >
            <FaGoogleDrive className="text-emerald-400 text-sm" /> Nhập từ Google Drive
          </button>
        </div>
      </div>

      {/* Google Drive Link Modal - Portal trực tiếp vào document.body để luôn ở giữa màn hình (viewport) */}
      {isDriveModalOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsDriveModalOpen(false);
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-[#12141A] border border-[#212532] p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 mb-3 text-[#D4AF37] font-bold text-base">
                <FaGoogleDrive className="text-xl text-emerald-400" /> Nhập file từ Google Drive
              </div>
              <p className="text-xs text-[#8E95A5] mb-4 leading-relaxed">
                Dán đường link chia sẻ Google Drive / Sheets (ở chế độ <em>"Bất kỳ ai có đường liên kết"</em>) để tự động đồng bộ:
              </p>
              <form onSubmit={handleDriveSubmit} className="space-y-4">
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full rounded-xl border border-[#212532] bg-[#0B0C10] px-4 py-2.5 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] transition"
                  autoFocus
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsDriveModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-[#8E95A5] hover:bg-[#181B24] transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl gold-gradient-bg text-[#0B0C10] font-black px-4 py-2 text-xs transition shadow-md hover:brightness-110 cursor-pointer"
                  >
                    Tải và Phân Bổ
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
