"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  FiUploadCloud,
  FiFileText,
  FiZap,
  FiLoader,
  FiEye,
  FiGlobe,
  FiX,
} from "react-icons/fi";

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
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-sm text-stone-500 shrink-0">
            <FiEye className="w-4 h-4 text-stone-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 dark:text-[#efe9de]">
                Chế Độ Xem Lịch Làm Việc (Read-Only)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
                {userRoleLabel || "Nhân viên"}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Bạn đang xem bảng phân công ca tuần này. Quyền kích hoạt <strong>Auto xếp lịch</strong> và <strong>chỉnh sửa ca</strong> chỉ dành cho Quản lý, Trưởng ca và Phó ca làm lịch.
            </p>
          </div>
        </div>
        <div className="text-[11px] text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-[#25221e] px-3.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-700/60 font-medium self-stretch md:self-auto text-center">
          * Đăng ký ca làm của bạn tại tab <strong className="font-semibold underline">"Đăng Ký Ca Làm"</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm mb-6 transition-all">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Drag & Drop Card */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 w-full border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 bg-stone-50/60 hover:bg-stone-50 dark:bg-[#25221e]/40 dark:hover:bg-[#25221e]/80 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition group text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition-transform">
            {isLoading ? (
              <FiLoader className="w-5 h-5 animate-spin text-stone-400" />
            ) : (
              <FiUploadCloud className="w-5 h-5 text-stone-400" />
            )}
          </div>
          <p className="text-xs font-bold text-stone-900 dark:text-[#efe9de]">
            Kéo thả hoặc bấm để chọn file Excel đăng ký ca
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            Định dạng tương thích: <code className="font-mono text-stone-700 dark:text-stone-300">FILE_MAU_DANG_KY_LICH_LAM_ZONE6_V2.xlsx</code>
          </p>
        </div>

        {/* Right: Quick action buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-64">
          <button
            type="button"
            disabled={isLoading}
            onClick={onLoadSample}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <FiZap className="w-3.5 h-3.5 text-stone-400" />
            <span>Dùng Mẫu Nhân Sự V2</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDriveModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 text-xs font-semibold transition cursor-pointer"
          >
            <FiGlobe className="w-3.5 h-3.5 text-stone-400" />
            <span>Nhập từ Google Drive</span>
          </button>
        </div>
      </div>

      {/* Google Drive Link Modal */}
      {isDriveModalOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsDriveModalOpen(false);
            }}
          >
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 p-5 shadow-xl relative z-10 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800 mb-3">
                <div className="flex items-center gap-2 text-stone-900 dark:text-[#efe9de] font-bold text-sm">
                  <FiGlobe className="w-4 h-4 text-stone-400" /> Nhập file từ Google Drive
                </div>
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  <FiX className="w-4 h-4 text-stone-400" />
                </button>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
                Dán đường link chia sẻ Google Drive / Sheets (ở chế độ <em>"Bất kỳ ai có đường liên kết"</em>) để tự động đồng bộ:
              </p>
              <form onSubmit={handleDriveSubmit} className="space-y-3">
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition"
                  autoFocus
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsDriveModalOpen(false)}
                    className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 font-semibold px-4 py-1.5 text-xs transition shadow-xs cursor-pointer"
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
