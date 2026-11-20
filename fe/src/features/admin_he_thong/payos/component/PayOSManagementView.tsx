'use client';

import React, { useState } from 'react';
import {
  FiCreditCard,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiZap,
} from 'react-icons/fi';
import { useGetPayOSConfigs } from '../hook/useGetPayOSConfigs';
import { PayOSAccountCard } from './PayOSAccountCard';
import { PayOSAccountModal } from './PayOSAccountModal';
import type { PayOSConfig } from '../type/payos.type';

export const PayOSManagementView: React.FC = () => {
  const { data: configs = [], isLoading, error } = useGetPayOSConfigs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<PayOSConfig | null>(null);

  const defaultAccount = configs.find((c) => c.is_default);

  const handleOpenCreateModal = () => {
    setAccountToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (account: PayOSConfig) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center shrink-0">
            <FiCreditCard className="w-5 h-5 text-stone-400 dark:text-stone-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
                Cấu hình cổng thanh toán PayOS
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
                Admin Hệ Thống
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Quản lý các tài khoản thanh toán PayOS Open Banking. Cấu hình được lưu trực tiếp trên
              Database. Hệ thống hỗ trợ nhiều tài khoản nhưng{' '}
              <strong className="text-stone-800 dark:text-stone-200">
                chỉ có duy nhất 1 tài khoản được đặt làm thanh toán chính
              </strong>{' '}
              cho POS và QR tại bàn.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
        >
          <FiPlus className="w-4 h-4" />
          <span>Thêm tài khoản PayOS</span>
        </button>
      </div>

      {/* 2. Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tổng số cấu hình */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium block">
              Tổng tài khoản
            </span>
            <span className="text-2xl font-semibold font-mono text-stone-900 dark:text-[#efe9de] mt-1 block">
              {configs.length} <span className="text-xs text-stone-400 font-normal">tài khoản</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
            <FiCreditCard className="w-4 h-4 text-stone-400 dark:text-stone-400" />
          </div>
        </div>

        {/* Tài khoản thanh toán chính */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-stone-700 dark:text-stone-300 font-medium block flex items-center gap-1.5">
              <FiZap className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Đang thanh toán chính
            </span>
            {defaultAccount ? (
              <div className="mt-1">
                <span className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] block font-mono">
                  {defaultAccount.bank_name} - {defaultAccount.account_number}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate max-w-[200px]">
                  {defaultAccount.account_holder_name}
                </span>
              </div>
            ) : (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 block">
                Chưa chọn tài khoản chính
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center">
            <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Trạng thái bảo mật & cơ chế thanh toán */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium block">
              Cơ chế bảo mật
            </span>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-1 block flex items-center gap-1">
              API Key &amp; Checksum độc quyền
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
              Chỉ Admin hệ thống được xem &amp; chỉnh sửa
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
            <FiShield className="w-4 h-4 text-stone-400 dark:text-stone-400" />
          </div>
        </div>
      </div>

      {/* 3. Danh Sách Tài Khoản PayOS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            Danh sách tài khoản đã cấu hình ({configs.length})
          </h2>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Hệ thống tự động sử dụng tài khoản chính cho POS &amp; QR gọi món
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800">
            <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 dark:border-stone-700 dark:border-t-stone-300 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-500 dark:text-stone-400">Đang tải danh sách tài khoản PayOS...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#1c1a17] border border-rose-200 dark:border-rose-900/40 text-stone-800 dark:text-stone-200">
            <FiAlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500 dark:text-rose-400" />
            <p className="text-sm font-semibold">Không thể tải danh sách tài khoản PayOS</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Vui lòng kiểm tra quyền truy cập hoặc kết nối mạng</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex flex-col items-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-400 mb-4">
              <FiCreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] mb-1">Chưa có tài khoản PayOS nào</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mb-5 leading-relaxed">
              Hãy thêm tài khoản PayOS đầu tiên của bạn để kích hoạt tính năng thanh toán VietQR tự động
              trên quầy POS và hệ thống gọi món tại bàn.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Thêm tài khoản ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {configs.map((config, idx) => {
              const accountId = config.id || config._id || (config as any)._id || `payos-${idx}`;
              const normalizedConfig = { ...config, id: accountId };
              return (
                <PayOSAccountCard
                  key={accountId}
                  config={normalizedConfig}
                  onEdit={handleOpenEditModal}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Modal Thêm / Chỉnh Sửa */}
      <PayOSAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accountToEdit={accountToEdit}
      />
    </div>
  );
};
