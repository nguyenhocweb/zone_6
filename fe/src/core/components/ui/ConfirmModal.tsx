import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  children,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy bỏ",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn"
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
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1c1a17] p-6 shadow-2xl border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-[#efe9de] relative z-10 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-lg font-bold text-stone-900 dark:text-[#efe9de] mb-2">{title}</h3>
        {typeof message === "string" ? (
          <p className="text-sm text-stone-600 dark:text-stone-300 mb-5 leading-relaxed">{message}</p>
        ) : message ? (
          <div className="text-sm text-stone-600 dark:text-stone-300 mb-5 leading-relaxed">{message}</div>
        ) : null}
        {children && <div className="mb-5">{children}</div>}
        <div className="flex justify-end gap-3 pt-4 border-t border-stone-200/80 dark:border-stone-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#25221e] hover:text-stone-900 dark:hover:text-stone-200 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2 text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white"
            }`}
          >
            {isLoading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
