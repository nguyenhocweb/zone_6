'use client';

import React, { useState } from 'react';
import {
  FiCheckCircle,
  FiTrash2,
  FiEdit2,
  FiWifi,
  FiCopy,
  FiCreditCard,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { ConfirmModal } from '@/core/components/ui/ConfirmModal';
import {
  useSetDefaultPayOSConfig,
  useDeletePayOSConfig,
  useTestPayOSConfig,
} from '../hook';
import type { PayOSConfig } from '../type/payos.type';

interface PayOSAccountCardProps {
  config: PayOSConfig;
  onEdit: (config: PayOSConfig) => void;
}

export const PayOSAccountCard: React.FC<PayOSAccountCardProps> = ({ config, onEdit }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const setDefaultMutation = useSetDefaultPayOSConfig();
  const deleteMutation = useDeletePayOSConfig();
  const testMutation = useTestPayOSConfig();

  const accountId = config.id || config._id || (config as any)._id || '';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  const handleSetDefault = () => {
    if (accountId) setDefaultMutation.mutate(accountId);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleTest = () => {
    if (accountId) testMutation.mutate({ id: accountId });
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
        config.is_default
          ? 'bg-white dark:bg-[#1c1a17] border-stone-900 dark:border-[#efe9de]'
          : 'bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
      }`}
    >
      {/* Top Banner nếu là tài khoản thanh toán chính */}
      {config.is_default && (
        <div className="bg-stone-900 dark:bg-[#efe9de] py-1 px-4 text-center">
          <span className="text-[11px] font-medium text-white dark:text-stone-900 tracking-wider uppercase flex items-center justify-center gap-1.5">
            <FiCheckCircle className="w-3.5 h-3.5" /> Tài khoản thanh toán chính
          </span>
        </div>
      )}

      {/* Card Header */}
      <div className="p-5 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">{config.name}</h3>
              {config.is_active ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  Hoạt động
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700">
                  Tạm dừng
                </span>
              )}
            </div>
            {config.notes && <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{config.notes}</p>}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit({ ...config, id: accountId })}
              className="w-8 h-8 rounded-xl bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] border border-stone-200 dark:border-stone-800 flex items-center justify-center transition cursor-pointer"
              title="Chỉnh sửa"
            >
              <FiEdit2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center transition cursor-pointer"
              title="Xóa cấu hình"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3.5 text-xs flex-1">
        {/* Thông tin Ngân hàng thụ hưởng */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <FiCreditCard className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Ngân hàng thụ hưởng:
            </span>
            <span className="font-semibold text-stone-900 dark:text-[#efe9de] bg-white dark:bg-[#1c1a17] px-2 py-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
              {config.bank_name}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span>Số tài khoản:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-semibold text-stone-900 dark:text-[#efe9de] text-sm">{config.account_number}</span>
              <button
                onClick={() => handleCopy(config.account_number, 'Số tài khoản')}
                className="text-stone-500 hover:text-stone-900 dark:hover:text-[#efe9de] transition cursor-pointer"
                title="Sao chép"
              >
                <FiCopy className="w-3 h-3 text-stone-400 dark:text-stone-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span>Chủ tài khoản:</span>
            <span className="font-semibold text-stone-900 dark:text-[#efe9de] uppercase tracking-wide">
              {config.account_holder_name}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-3 bg-stone-50 dark:bg-[#25221e] border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
        <button
          onClick={handleTest}
          disabled={testMutation.isPending}
          className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1c1a17] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <FiWifi className={`w-3.5 h-3.5 text-stone-400 dark:text-stone-400 ${testMutation.isPending ? 'animate-pulse' : ''}`} />
          <span>{testMutation.isPending ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
        </button>

        {!config.is_default ? (
          <button
            onClick={handleSetDefault}
            disabled={setDefaultMutation.isPending}
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            <span>{setDefaultMutation.isPending ? 'Đang xử lý...' : 'Chọn làm tài khoản chính'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Đang thanh toán chính</span>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Xác nhận xóa cấu hình PayOS"
        message={`Bạn có chắc chắn muốn xóa cấu hình PayOS "${config.name}" (${config.bank_name} - ${config.account_number}) khỏi hệ thống không?`}
        confirmLabel="Xóa cấu hình"
        cancelLabel="Hủy bỏ"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!accountId) return;
          deleteMutation.mutate(accountId, {
            onSettled: () => setIsDeleteModalOpen(false),
          });
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
