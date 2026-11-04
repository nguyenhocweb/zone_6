'use client';

import React, { useState } from 'react';
import {
  FiCheckCircle,
  FiStar,
  FiTrash2,
  FiEdit3,
  FiWifi,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiCreditCard,
  FiKey,
} from 'react-icons/fi';
import { toast } from 'sonner';
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
  const [showSecret, setShowSecret] = useState(false);
  const setDefaultMutation = useSetDefaultPayOSConfig();
  const deleteMutation = useDeletePayOSConfig();
  const testMutation = useTestPayOSConfig();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  const handleSetDefault = () => {
    setDefaultMutation.mutate(config.id);
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa cấu hình PayOS "${config.name}" không?`)) {
      deleteMutation.mutate(config.id);
    }
  };

  const handleTest = () => {
    testMutation.mutate({ id: config.id });
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
        config.is_default
          ? 'bg-gradient-to-b from-[#181b24] to-[#12141a] border-[#d4af37] shadow-xl shadow-[#d4af37]/10'
          : 'bg-[#12141a] border-[#212532] hover:border-[#32384a]'
      }`}
    >
      {/* Top Banner nếu là tài khoản thanh toán chính */}
      {config.is_default && (
        <div className="bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#d4af37] py-1 px-4 text-center">
          <span className="text-[11px] font-black text-[#0b0c10] tracking-wider uppercase flex items-center justify-center gap-1.5">
            <FiStar className="fill-current" /> Tài Khoản Thanh Toán Chính Duy Nhất
          </span>
        </div>
      )}

      {/* Card Header */}
      <div className="p-5 border-b border-[#212532]/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">{config.name}</h3>
              {config.is_active ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Hoạt Động
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                  Tạm Dừng
                </span>
              )}
            </div>
            {config.notes && <p className="text-xs text-[#8e95a5] mt-1">{config.notes}</p>}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(config)}
              className="w-8 h-8 rounded-xl bg-[#181b24] hover:bg-[#212532] text-[#a0a5b5] hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Chỉnh sửa"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-8 h-8 rounded-xl bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 flex items-center justify-center transition cursor-pointer"
              title="Xóa cấu hình"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3.5 text-xs flex-1">
        {/* Thông tin Ngân hàng thụ hưởng */}
        <div className="p-3 rounded-2xl bg-[#0b0c10] border border-[#212532] space-y-2">
          <div className="flex items-center justify-between text-[#8e95a5]">
            <span className="flex items-center gap-1.5 font-medium">
              <FiCreditCard className="text-[#d4af37]" /> Ngân hàng thụ hưởng:
            </span>
            <span className="font-bold text-white bg-[#181b24] px-2 py-0.5 rounded-lg border border-[#212532]">
              {config.bank_name}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#8e95a5]">
            <span>Số tài khoản:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-white text-sm">{config.account_number}</span>
              <button
                onClick={() => handleCopy(config.account_number, 'Số tài khoản')}
                className="text-[#d4af37] hover:brightness-125 transition cursor-pointer"
                title="Sao chép"
              >
                <FiCopy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[#8e95a5]">
            <span>Chủ tài khoản:</span>
            <span className="font-bold text-[#e7cd80] uppercase tracking-wide">
              {config.account_holder_name}
            </span>
          </div>
        </div>

        {/* Thông tin PayOS Credentials */}
        <div className="p-3 rounded-2xl bg-[#0b0c10] border border-[#212532] space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-[#8e95a5] pb-1 border-b border-[#212532]">
            <span className="flex items-center gap-1 font-sans text-xs">
              <FiKey className="text-[#d4af37]" /> PayOS Credentials
            </span>
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="text-xs text-[#a0a5b5] hover:text-[#d4af37] flex items-center gap-1 font-sans transition cursor-pointer"
            >
              {showSecret ? <FiEyeOff className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
              <span>{showSecret ? 'Ẩn' : 'Hiện'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8e95a5]">Client ID:</span>
            <span className="text-white truncate max-w-[200px]">{config.client_id}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8e95a5]">API Key:</span>
            <span className="text-white truncate max-w-[200px]">
              {showSecret ? config.api_key : '••••••••••••••••••••'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8e95a5]">Checksum:</span>
            <span className="text-white truncate max-w-[200px]">
              {showSecret ? config.checksum_key : '••••••••••••••••••••'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 border-t border-[#212532] bg-[#181b24]/40 flex items-center justify-between gap-2">
        <button
          onClick={handleTest}
          disabled={testMutation.isPending}
          className="px-3 py-1.5 rounded-xl border border-[#212532] bg-[#0e1015] hover:bg-[#181b24] text-[#a0a5b5] hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <FiWifi className={testMutation.isPending ? 'animate-pulse text-[#d4af37]' : ''} />
          <span>{testMutation.isPending ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối'}</span>
        </button>

        {!config.is_default ? (
          <button
            onClick={handleSetDefault}
            disabled={setDefaultMutation.isPending}
            className="px-3.5 py-1.5 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <FiCheckCircle />
            <span>{setDefaultMutation.isPending ? 'Đang xử lý...' : 'Chọn Làm Tài Khoản Chính'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-black text-[#d4af37]">
            <FiCheckCircle className="text-emerald-400" />
            <span>Đang Thanh Toán Chính</span>
          </div>
        )}
      </div>
    </div>
  );
};

