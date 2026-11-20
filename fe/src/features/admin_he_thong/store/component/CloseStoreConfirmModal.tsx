"use client";

import React from "react";
import { ConfirmModal } from "@/core/components/ui/ConfirmModal";
import type { Store } from "../type/store.type";
import { useToggleStoreStatus } from "../hook/useToggleStoreStatus";

interface CloseStoreConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
}

export const CloseStoreConfirmModal: React.FC<CloseStoreConfirmModalProps> = ({
  isOpen,
  onClose,
  store,
}) => {
  const toggleMutation = useToggleStoreStatus();

  if (!isOpen || !store) return null;

  const isCurrentlyActive = store.is_active;

  const handleConfirm = () => {
    toggleMutation.mutate(
      {
        id: store.id || store._id || "",
        payload: {
          is_active: !isCurrentlyActive,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={isCurrentlyActive ? "Tạm dừng / Đóng cửa chi nhánh" : "Kích hoạt / Mở cửa chi nhánh"}
      confirmLabel={isCurrentlyActive ? "Đóng cửa" : "Mở cửa"}
      cancelLabel="Quay lại"
      isDestructive={isCurrentlyActive}
      isLoading={toggleMutation.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    >
      <div className="space-y-3">
        <p className="text-xs text-stone-600 dark:text-stone-300">
          Bạn có chắc chắn muốn {isCurrentlyActive ? "tạm dừng hoạt động" : "mở cửa trở lại"} chi nhánh:
        </p>
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
          <div className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">{store.store_name}</div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Mã: <span className="font-mono text-stone-700 dark:text-stone-300">{store.store_code || "Z6"}</span> • {store.address}
          </div>
        </div>
        {isCurrentlyActive && (
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            * Khi đóng cửa, nhân viên sẽ không thể thực hiện điểm danh ca trực tại cơ sở này.
          </p>
        )}
      </div>
    </ConfirmModal>
  );
};
