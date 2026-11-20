'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiX, FiCheck, FiKey, FiCreditCard, FiWifi } from 'react-icons/fi';
import { payOSFormSchema, PayOSFormValues } from '../schema/payos.schema';
import {
  useCreatePayOSConfig,
  useUpdatePayOSConfig,
  useTestPayOSConfig,
} from '../hook';
import type { PayOSConfig } from '../type/payos.type';
import { toast } from 'sonner';

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
      toast.warning('Vui lòng nhập Client ID, API Key và Checksum Key trước khi kiểm tra');
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
    <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#25221e]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
              <FiCreditCard className="w-4 h-4 text-stone-400 dark:text-stone-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de]">
                {accountToEdit ? 'Chỉnh sửa tài khoản PayOS' : 'Thêm mới cấu hình PayOS'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {accountToEdit
                  ? `Cập nhật thông tin cho cấu hình "${accountToEdit.name}"`
                  : 'Kết nối tài khoản ngân hàng Open Banking qua PayOS'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#1c1a17] text-stone-500 hover:text-stone-900 dark:hover:text-[#efe9de] border border-stone-200 dark:border-stone-800 flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="w-4 h-4 text-stone-400 dark:text-stone-400" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Tên gợi nhớ */}
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Tên định danh / Gợi nhớ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="VD: PayOS MBBank Chính, PayOS Quán Zone Six..."
              className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none rounded-xl text-stone-900 dark:text-[#efe9de] text-xs sm:text-sm transition"
            />
            {errors.name && (
              <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Nhóm thông tin ngân hàng thụ hưởng */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-3.5">
            <h4 className="text-xs font-medium text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
              <FiCreditCard className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Thông tin ngân hàng thụ hưởng (VietQR)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Mã ngân hàng (Bank Code) <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('bank_name')}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none rounded-xl text-stone-900 dark:text-[#efe9de] text-xs sm:text-sm transition cursor-pointer"
                >
                  {COMMON_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
                {errors.bank_name && (
                  <p className="text-rose-500 text-xs mt-1">{errors.bank_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Số tài khoản ngân hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('account_number')}
                  placeholder="VD: 0353489999"
                  className="w-full px-3 py-2 bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none rounded-xl text-stone-900 dark:text-[#efe9de] text-xs sm:text-sm transition font-mono"
                />
                {errors.account_number && (
                  <p className="text-rose-500 text-xs mt-1">{errors.account_number.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                Tên chủ tài khoản (In hoa) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('account_holder_name')}
                placeholder="VD: ZONE SIX COFFEE & LOUNGE"
                className="w-full px-3 py-2 bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none rounded-xl text-stone-900 dark:text-[#efe9de] text-xs sm:text-sm transition uppercase tracking-wider font-medium"
              />
              {errors.account_holder_name && (
                <p className="text-rose-500 text-xs mt-1">{errors.account_holder_name.message}</p>
              )}
            </div>
          </div>

          {/* Nhóm thông tin bảo mật PayOS Credentials */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                <FiKey className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Khóa xác thực PayOS (Credentials)
              </h4>
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-[#efe9de] transition cursor-pointer"
              >
                {showSecrets ? 'Ẩn mã bí mật' : 'Hiển thị mã bí mật'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                Client ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('client_id')}
                placeholder="VD: e928a5cf-81dd-4444-9cb3-..."
                className="w-full px-3 py-2 bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none rounded-xl text-stone-900 dark:text-[#efe9de] transition font-mono text-xs"
              />
              {errors.client_id && (
                <p className="text-rose-500 text-xs mt-1">{errors.client_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  API Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  {...register('api_key')}
                  placeholder="VD: 74d47e45-..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none rounded-xl text-stone-900 dark:text-[#efe9de] transition font-mono text-xs"
                />
                {errors.api_key && (
                  <p className="text-rose-500 text-xs mt-1">{errors.api_key.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Checksum Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  {...register('checksum_key')}
                  placeholder="VD: 0a69345241b77..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none rounded-xl text-stone-900 dark:text-[#efe9de] transition font-mono text-xs"
                />
                {errors.checksum_key && (
                  <p className="text-rose-500 text-xs mt-1">{errors.checksum_key.message}</p>
                )}
              </div>
            </div>

            {/* Nút Test Connection */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Kiểm tra thông tin với máy chủ PayOS trước khi lưu.
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testMutation.isPending}
                className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1c1a17] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <FiWifi className={`w-3.5 h-3.5 text-stone-400 dark:text-stone-400 ${testMutation.isPending ? 'animate-pulse' : ''}`} />
                <span>{testMutation.isPending ? 'Đang kết nối...' : 'Kiểm tra kết nối'}</span>
              </button>
            </div>
          </div>

          {/* Tùy chọn tài khoản chính & kích hoạt */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_default')}
                className="mt-0.5 w-4 h-4 rounded text-stone-900 focus:ring-0 bg-white dark:bg-[#1c1a17] border-stone-300 dark:border-stone-700"
              />
              <div>
                <span className="text-xs font-medium text-stone-900 dark:text-[#efe9de] block">
                  Đặt làm tài khoản thanh toán chính duy nhất
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Tài khoản này sẽ được tự động kích hoạt để nhận thanh toán VietQR trên POS và QR tại bàn. Tất cả tài khoản khác sẽ tự động thành tài khoản phụ.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer pt-1 border-t border-stone-200 dark:border-stone-800">
              <input
                type="checkbox"
                {...register('is_active')}
                className="w-4 h-4 rounded text-stone-900 focus:ring-0 bg-white dark:bg-[#1c1a17] border-stone-300 dark:border-stone-700"
              />
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Kích hoạt tài khoản này trong hệ thống
              </span>
            </label>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Ghi chú</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="VD: Tài khoản thanh toán nhận tiền doanh thu qua PayOS..."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none rounded-xl text-stone-900 dark:text-[#efe9de] text-xs transition"
            />
          </div>

          {/* Footer Modal */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <FiCheck className="w-4 h-4" />
              <span>{isPending ? 'Đang lưu...' : accountToEdit ? 'Cập nhật' : 'Thêm tài khoản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
