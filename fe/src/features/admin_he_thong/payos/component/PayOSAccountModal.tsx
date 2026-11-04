'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiX, FiCheck, FiKey, FiCreditCard, FiAlertCircle, FiWifi } from 'react-icons/fi';
import { payOSFormSchema, PayOSFormValues } from '../schema/payos.schema';
import {
  useCreatePayOSConfig,
  useUpdatePayOSConfig,
  useTestPayOSConfig,
} from '../hook';
import type { PayOSConfig } from '../type/payos.type';

interface PayOSAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: PayOSConfig | null;
}

const COMMON_BANKS = [
  { code: 'MB', name: 'MBBank (Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'ICB', name: 'VietinBank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'HDB', name: 'HDBank' },
  { code: 'VIB', name: 'VIB' },
];

export const PayOSAccountModal: React.FC<PayOSAccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
}) => {
  const createMutation = useCreatePayOSConfig();
  const updateMutation = useUpdatePayOSConfig();
  const testMutation = useTestPayOSConfig();
  const [showSecrets, setShowSecrets] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PayOSFormValues>({
    resolver: zodResolver(payOSFormSchema),
    defaultValues: {
      name: '',
      client_id: '',
      api_key: '',
      checksum_key: '',
      bank_name: 'MB',
      account_number: '',
      account_holder_name: '',
      is_default: false,
      is_active: true,
      notes: '',
    },
  });

  useEffect(() => {
    if (accountToEdit) {
      reset({
        name: accountToEdit.name,
        client_id: accountToEdit.client_id,
        api_key: accountToEdit.api_key,
        checksum_key: accountToEdit.checksum_key,
        bank_name: accountToEdit.bank_name,
        account_number: accountToEdit.account_number,
        account_holder_name: accountToEdit.account_holder_name,
        is_default: accountToEdit.is_default,
        is_active: accountToEdit.is_active,
        notes: accountToEdit.notes || '',
      });
    } else {
      reset({
        name: '',
        client_id: '',
        api_key: '',
        checksum_key: '',
        bank_name: 'MB',
        account_number: '',
        account_holder_name: '',
        is_default: false,
        is_active: true,
        notes: '',
      });
    }
  }, [accountToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const watchedClientId = watch('client_id');
  const watchedApiKey = watch('api_key');
  const watchedChecksumKey = watch('checksum_key');

  const handleTestConnection = () => {
    if (!watchedClientId || !watchedApiKey || !watchedChecksumKey) {
      alert('Vui lòng nhập Client ID, API Key và Checksum Key trước khi kiểm tra');
      return;
    }
    testMutation.mutate({
      client_id: watchedClientId,
      api_key: watchedApiKey,
      checksum_key: watchedChecksumKey,
    });
  };

  const onSubmit = (values: PayOSFormValues) => {
    if (accountToEdit) {
      updateMutation.mutate(
        { id: accountToEdit.id, payload: values },
        {
          onSuccess: () => onClose(),
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-[#d4af37]/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-[#d4af37]/10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#212532] flex items-center justify-between bg-[#181b24]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <FiCreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {accountToEdit ? 'Chỉnh Sửa Tài Khoản PayOS' : 'Thêm Mới Cấu Hình PayOS'}
              </h3>
              <p className="text-xs text-[#a0a5b5]">
                {accountToEdit
                  ? `Cập nhật thông tin cho cấu hình "${accountToEdit.name}"`
                  : 'Kết nối tài khoản ngân hàng Open Banking qua PayOS'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181b24] text-[#a0a5b5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Tên gợi nhớ */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5 uppercase tracking-wider">
              Tên Định Danh / Gợi Nhớ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="VD: PayOS MBBank Chính, PayOS Quán Zone Six..."
              className="w-full px-3.5 py-2.5 bg-[#0b0c10] border border-[#212532] focus:border-[#d4af37] focus:outline-none rounded-xl text-white text-sm transition"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Nhóm thông tin ngân hàng thụ hưởng */}
          <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#212532] space-y-3.5">
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <FiCreditCard /> Thông Tin Ngân Hàng Thụ Hưởng (VietQR)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#a0a5b5] mb-1">
                  Mã Ngân Hàng (Bank Code) <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('bank_name')}
                  className="w-full px-3 py-2 bg-[#181b24] border border-[#212532] focus:border-[#d4af37] focus:outline-none rounded-xl text-white text-sm transition"
                >
                  {COMMON_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
                {errors.bank_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.bank_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a0a5b5] mb-1">
                  Số Tài Khoản Ngân Hàng <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register('account_number')}
                  placeholder="VD: 0353489999"
                  className="w-full px-3 py-2 bg-[#181b24] border border-[#212532] focus:border-[#d4af37] focus:outline-none rounded-xl text-white text-sm transition font-mono"
                />
                {errors.account_number && (
                  <p className="text-red-400 text-xs mt-1">{errors.account_number.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a0a5b5] mb-1">
                Tên Chủ Tài Khoản (In Hoa) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('account_holder_name')}
                placeholder="VD: ZONE SIX COFFEE & LOUNGE"
                className="w-full px-3 py-2 bg-[#181b24] border border-[#212532] focus:border-[#d4af37] focus:outline-none rounded-xl text-white text-sm transition uppercase tracking-wider font-semibold"
              />
              {errors.account_holder_name && (
                <p className="text-red-400 text-xs mt-1">{errors.account_holder_name.message}</p>
              )}
            </div>
          </div>

          {/* Nhóm thông tin bảo mật PayOS Credentials */}
          <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#212532] space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                <FiKey /> Khóa Xác Thực PayOS (Credentials)
              </h4>
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-xs text-[#a0a5b5] hover:text-[#d4af37] transition cursor-pointer"
              >
                {showSecrets ? 'Ẩn mã bí mật' : 'Hiển thị mã bí mật'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a0a5b5] mb-1">
                Client ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('client_id')}
                placeholder="VD: e928a5cf-81dd-4444-9cb3-..."
                className="w-full px-3 py-2 bg-[#181b24] border border-[#212532] focus:border-[#d4af37] focus:outline-none rounded-xl text-white text-sm transition font-mono text-xs"
              />
              {errors.client_id && (
                <p className="text-red-400 text-xs mt-1">{errors.client_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#a0a5b5] mb-1">
                  API Key <span className="text-red-400">*</span>
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  {...register('api_key')}
                  placeholder="VD: 74d47e45-..."
                  className="w-full px-3 py-2 bg-[#181b24] border border-[#212532] focus:border-[#d4af37] focus:outline-none rounded-xl text-white text-sm transition font-mono text-xs"
                />
                {errors.api_key && (
                  <p className="text-red-400 text-xs mt-1">{errors.api_key.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a0a5b5] mb-1">
                  Checksum Key <span className="text-red-400">*</span>
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  {...register('checksum_key')}
                  placeholder="VD: 0a69345241b77..."
                  className="w-full px-3 py-2 bg-[#181b24] border border-[#212532] focus:border-[#d4af37] focus:outline-none rounded-xl text-white text-sm transition font-mono text-xs"
                />
                {errors.checksum_key && (
                  <p className="text-red-400 text-xs mt-1">{errors.checksum_key.message}</p>
                )}
              </div>
            </div>

            {/* Nút Test Connection */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-[#8e95a5]">
                Kiểm tra thông tin với máy chủ PayOS trước khi lưu.
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testMutation.isPending}
                className="px-3 py-1.5 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <FiWifi className={testMutation.isPending ? 'animate-pulse' : ''} />
                <span>{testMutation.isPending ? 'Đang kết nối...' : 'Kiểm Tra Kết Nối'}</span>
              </button>
            </div>
          </div>

          {/* Tùy chọn tài khoản chính & kích hoạt */}
          <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#212532] space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_default')}
                className="mt-0.5 w-4 h-4 rounded text-[#d4af37] focus:ring-0 bg-[#181b24] border-[#212532]"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  ★ Đặt làm tài khoản thanh toán chính duy nhất
                </span>
                <span className="text-[11px] text-[#a0a5b5]">
                  Tài khoản này sẽ được tự động kích hoạt để nhận thanh toán VietQR trên POS và QR tại bàn. Tất cả tài khoản khác sẽ tự động thành tài khoản phụ.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer pt-1 border-t border-[#212532]">
              <input
                type="checkbox"
                {...register('is_active')}
                className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 bg-[#181b24] border-[#212532]"
              />
              <span className="text-xs font-medium text-white">
                Kích hoạt tài khoản này trong hệ thống
              </span>
            </label>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-medium text-[#a0a5b5] mb-1">Ghi Chú</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="VD: Tài khoản thanh toán nhận tiền doanh thu qua PayOS..."
              className="w-full px-3 py-2 bg-[#0b0c10] border border-[#212532] focus:border-[#d4af37] focus:outline-none rounded-xl text-white text-xs transition"
            />
          </div>

          {/* Footer Modal */}
          <div className="pt-3 border-t border-[#212532] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-[#212532] text-[#a0a5b5] hover:text-white hover:bg-[#181b24] text-xs font-bold transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl gold-gradient-bg text-[#0b0c10] font-black text-xs gold-glow-sm hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FiCheck className="w-4 h-4" />
              <span>{isPending ? 'Đang lưu...' : accountToEdit ? 'Cập Nhật' : 'Thêm Tài Khoản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

