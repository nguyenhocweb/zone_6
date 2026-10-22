"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FaCalendarAlt,
  FaClock,
  FaCog,
  FaLock,
  FaLockOpen,
  FaSave,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import {
  configureRegistrationWindowService,
  getRegistrationWindowService,
  type RegistrationWindowStatus,
} from "../service/scheduling.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  weekStartDate: string;
  weekRange: string;
  onConfigSaved?: () => void;
}

export const RegistrationWindowModal: React.FC<Props> = ({
  isOpen,
  onClose,
  weekStartDate,
  weekRange,
  onConfigSaved,
}) => {
  const [windowStatus, setWindowStatus] = useState<RegistrationWindowStatus | null>(null);
  const [isOpenToggle, setIsOpenToggle] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [openAtStr, setOpenAtStr] = useState<string>("");
  const [closeAtStr, setCloseAtStr] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && weekStartDate) {
      loadWindowConfig();
    }
  }, [isOpen, weekStartDate]);

  // Chuyển đổi Date sang định dạng ISO cho input type="datetime-local" (YYYY-MM-DDTHH:mm)
  const toLocalInputValue = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const loadWindowConfig = async () => {
    try {
      setIsLoading(true);
      const data = await getRegistrationWindowService(weekStartDate);
      setWindowStatus(data);
      setIsOpenToggle(data.is_open);
      setTitle(data.title || `Đăng ký lịch làm việc tuần ${weekRange}`);
      setNotes(data.notes || "Vui lòng đăng ký trước hạn chót để Quản lý và Trưởng ca phân công lịch!");

      if (data.open_at) {
        setOpenAtStr(toLocalInputValue(new Date(data.open_at)));
      } else {
        setOpenAtStr(toLocalInputValue(new Date()));
      }

      if (data.close_at) {
        setCloseAtStr(toLocalInputValue(new Date(data.close_at)));
      } else {
        // Mặc định gợi ý đóng vào 22:00 Thứ 6 trước tuần làm
        const defaultClose = new Date();
        defaultClose.setDate(defaultClose.getDate() + 3);
        defaultClose.setHours(22, 0, 0, 0);
        setCloseAtStr(toLocalInputValue(defaultClose));
      }
    } catch (err: any) {
      toast.error("Không thể tải cấu hình đợt đăng ký");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset: Hẹn giờ đóng
  const handlePresetDays = (daysFromNow: number, hour: number = 22) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, 0, 0, 0);
    setCloseAtStr(toLocalInputValue(d));
    setIsOpenToggle(true);
    toast.info(`Đã đặt hạn đóng: ${hour}:00 sau ${daysFromNow} ngày`);
  };

  // Quy tắc: Bắt buộc khóa trước 28 tiếng trước khi tuần làm việc bắt đầu (Thứ 2 00:00)
  const isWeekMandatorilyLocked = React.useMemo(() => {
    if (!weekStartDate) return false;
    const parts = weekStartDate.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return false;
    const monday = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    const deadline = new Date(monday.getTime() - 28 * 60 * 60 * 1000);
    return new Date().getTime() >= deadline.getTime();
  }, [weekStartDate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWeekMandatorilyLocked && isOpenToggle) {
      toast.error("Tuần này bắt buộc phải khóa trước 28 tiếng trước khi bắt đầu làm việc. Đã qua thời gian quy định, không được phép mở khóa!");
      return;
    }
    try {
      setIsSaving(true);
      await configureRegistrationWindowService({
        week_start_date: weekStartDate,
        title: title.trim(),
        is_open: isWeekMandatorilyLocked ? false : isOpenToggle,
        open_at: openAtStr ? new Date(openAtStr).toISOString() : null,
        close_at: closeAtStr ? new Date(closeAtStr).toISOString() : null,
        notes: notes.trim(),
      });

      toast.success(`Đã lưu cấu hình đợt đăng ký tuần ${weekRange}!`);
      if (onConfigSaved) {
        onConfigSaved();
      }
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi lưu cấu hình";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#12141A] border border-[#D4AF37]/40 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#212532] bg-[#0B0C10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#201A09] border border-[#D4AF37]/50 flex items-center justify-center text-sm text-[#D4AF37]">
              <FaCog />
            </div>
            <div>
              <h3 className="text-sm font-black gold-gradient-text uppercase">
                Cấu Hình Đợt Đăng Ký Lịch Làm
              </h3>
              <p className="text-[11px] text-[#8E95A5]">
                Áp dụng cho: <strong className="text-[#F5D77F]">{weekRange}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E95A5] hover:text-white hover:bg-[#181B24] transition text-sm cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content Form */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs text-[#8E95A5]">
            <FaSpinner className="animate-spin text-lg text-[#D4AF37]" />
            <span>Đang tải cấu hình đợt đăng ký...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Banner nếu đã qua mốc bắt buộc khóa 28 tiếng */}
            {isWeekMandatorilyLocked && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-700/50 text-xs text-rose-300 flex items-center gap-2.5">
                <FaLock className="text-sm shrink-0 text-rose-400" />
                <span>
                  <strong>Bắt buộc khóa trước 28 tiếng.</strong> Đã qua thời hạn quy định trước ngày bắt đầu làm việc, không được phép mở khóa.
                </span>
              </div>
            )}

            {/* Toggle Mở / Đóng Thủ Công */}
            <div className="p-4 rounded-2xl bg-[#0B0C10] border border-[#212532] flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-[#F4F5F8] flex items-center gap-2">
                  {isOpenToggle && !isWeekMandatorilyLocked ? (
                    <FaLockOpen className="text-emerald-400" />
                  ) : (
                    <FaLock className="text-rose-400" />
                  )}
                  <span>Trạng Thái Đợt Đăng Ký:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isOpenToggle && !isWeekMandatorilyLocked
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950/60 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {isOpenToggle && !isWeekMandatorilyLocked ? "Đang Mở" : "Đã Đóng (Khóa)"}
                  </span>
                </div>
                <p className="text-[11px] text-[#8E95A5] mt-1">
                  {isWeekMandatorilyLocked
                    ? "Đã qua hạn 28 tiếng trước ngày làm việc, bắt buộc khóa và không nhận thêm đăng ký."
                    : isOpenToggle
                    ? "Nhân viên có thể gửi hoặc cập nhật bản đăng ký ca làm."
                    : "Biểu mẫu đăng ký sẽ bị khóa đối với nhân viên."}
                </p>
              </div>

              {isWeekMandatorilyLocked ? (
                <div className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#1A1012] text-rose-300 border border-rose-900/60 cursor-not-allowed">
                  Bắt Buộc Khóa
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpenToggle(!isOpenToggle)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-sm ${
                    isOpenToggle
                      ? "bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border border-rose-700/60"
                      : "bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-300 border border-emerald-700/60"
                  }`}
                >
                  {isOpenToggle ? "Đóng Khẩn Cấp" : "Mở Lại Ngay"}
                </button>
              )}
            </div>

            {/* Tiêu đề đợt đăng ký */}
            <div>
              <label className="block text-xs font-bold text-[#8E95A5] mb-1.5">
                Tiêu đề đợt đăng ký:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề đợt đăng ký..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:border-[#D4AF37] outline-none"
              />
            </div>

            {/* Thời gian mở & Đóng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8E95A5] mb-1.5 flex items-center gap-1.5">
                  <FaCalendarAlt className="text-[#D4AF37]" />
                  <span>Thời gian bắt đầu mở:</span>
                </label>
                <input
                  type="datetime-local"
                  value={openAtStr}
                  onChange={(e) => setOpenAtStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8E95A5] mb-1.5 flex items-center gap-1.5">
                  <FaClock className="text-[#D4AF37]" />
                  <span>Thời gian đóng đăng ký:</span>
                </label>
                <input
                  type="datetime-local"
                  value={closeAtStr}
                  onChange={(e) => setCloseAtStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            {/* Phím tắt điền hạn chót nhanh */}
            <div>
              <div className="text-[11px] font-bold text-[#6D7588] mb-1.5">
                Cài đặt hạn đóng nhanh:
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handlePresetDays(2, 22)}
                  className="px-2.5 py-1 rounded-lg bg-[#181B24] hover:bg-[#202534] text-[#E7CD80] border border-[#212532] text-[11px] transition"
                >
                  Đóng sau 2 ngày (22:00)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays(3, 22)}
                  className="px-2.5 py-1 rounded-lg bg-[#181B24] hover:bg-[#202534] text-[#E7CD80] border border-[#212532] text-[11px] transition"
                >
                  Đóng sau 3 ngày (22:00)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays(5, 23)}
                  className="px-2.5 py-1 rounded-lg bg-[#181B24] hover:bg-[#202534] text-[#E7CD80] border border-[#212532] text-[11px] transition"
                >
                  Đóng sau 5 ngày (23:00)
                </button>
                <button
                  type="button"
                  onClick={() => setCloseAtStr("")}
                  className="px-2.5 py-1 rounded-lg bg-[#181B24] hover:bg-[#202534] text-[#8E95A5] border border-[#212532] text-[11px] transition"
                >
                  Không giới hạn giờ
                </button>
              </div>
            </div>

            {/* Ghi chú hướng dẫn nhân viên */}
            <div>
              <label className="block text-xs font-bold text-[#8E95A5] mb-1.5">
                Thông báo / Quy định cho nhân viên:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Đăng ký trước 22h Thứ 6 để Trưởng ca chốt lịch..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:border-[#D4AF37] outline-none"
              />
            </div>

            {/* Buttons footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#212532]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#212532] text-[#8E95A5] hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient-bg hover:brightness-110 text-[#0B0C10] text-xs font-black shadow-lg gold-glow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Đang Lưu...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="text-xs" />
                    <span>Lưu Cấu Hình Đợt Đăng Ký</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
