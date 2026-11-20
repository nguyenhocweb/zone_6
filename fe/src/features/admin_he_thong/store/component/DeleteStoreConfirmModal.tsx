"use client";

import React from "react";
import { ConfirmModal } from "@/core/components/ui/ConfirmModal";
import type { Store } from "../type/store.type";
import { useDeleteStore } from "../hook/useDeleteStore";

interface DeleteStoreConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
}

export const DeleteStoreConfirmModal: React.FC<DeleteStoreConfirmModalProps> = ({
  isOpen,
  onClose,
  store,
}) => {
  const deleteMutation = useDeleteStore();

  if (!isOpen || !store) return null;

  const handleDelete = () => {
    deleteMutation.mutate(store.id || store._id || "", {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Xóa chi nhánh vĩnh viễn"
      confirmLabel="Xóa chi nhánh"
      cancelLabel="Hủy bỏ"
      isDestructive={true}
      isLoading={deleteMutation.isPending}
      onConfirm={handleDelete}
      onCancel={onClose}
    >
      <div className="space-y-3">
        <p className="text-xs text-stone-600 dark:text-stone-300">
          Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa chi nhánh sau:
        </p>
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
          <div className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">{store.store_name}</div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Mã: <span className="font-mono text-stone-700 dark:text-stone-300">{store.store_code || "Z6"}</span> • {store.address}
          </div>
        </div>
        <p className="text-[11px] text-rose-600 dark:text-rose-400">
          * Nếu chi nhánh chỉ đang sửa chữa hoặc tạm dừng, vui lòng sử dụng chức năng <strong>Đóng cửa</strong> thay vì xóa.
        </p>
      </div>
    </ConfirmModal>
  );
};
