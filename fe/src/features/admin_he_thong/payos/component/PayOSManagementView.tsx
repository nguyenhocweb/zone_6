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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12141a] border border-[#212532] shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0b0c10] text-2xl font-black shrink-0 gold-glow-sm">
            <FiCreditCard />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Cấu Hình Cổng Thanh Toán PayOS
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
                Admin Hệ Thống
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8e95a5] mt-1 max-w-2xl">
              Quản lý các tài khoản thanh toán PayOS Open Banking. Cấu hình được lưu trực tiếp trên
              Database. Hệ thống hỗ trợ nhiều tài khoản nhưng{' '}
              <strong className="text-[#e7cd80]">
                chỉ có duy nhất 1 tài khoản được đặt làm thanh toán chính
              </strong>{' '}
              cho POS và QR tại bàn.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 rounded-2xl gold-gradient-bg text-[#0b0c10] font-black text-xs sm:text-sm gold-glow hover:brightness-110 transition flex items-center gap-2 cursor-pointer shrink-0 shadow-lg"
        >
          <FiPlus className="text-lg" />
          <span>Thêm Tài Khoản PayOS</span>
        </button>
      </div>

      {/* 2. Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tổng số cấu hình */}
        <div className="p-5 rounded-2xl bg-[#12141a] border border-[#212532] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8e95a5] font-semibold block uppercase tracking-wider">
              Tổng Tài Khoản
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {configs.length} <span className="text-xs text-[#8e95a5] font-normal">tài khoản</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#181b24] border border-[#212532] flex items-center justify-center text-[#a0a5b5]">
            <FiCreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Tài khoản thanh toán chính */}
        <div className="p-5 rounded-2xl bg-[#12141a] border border-[#d4af37]/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#d4af37] font-bold block uppercase tracking-wider flex items-center gap-1">
              <FiZap /> Đang Thanh Toán Chính
            </span>
            {defaultAccount ? (
              <div className="mt-1">
                <span className="text-sm font-black text-white block">
                  {defaultAccount.bank_name} - {defaultAccount.account_number}
                </span>
                <span className="text-[11px] text-[#8e95a5] block truncate max-w-[200px]">
                  {defaultAccount.account_holder_name}
                </span>
              </div>
            ) : (
              <span className="text-xs text-red-400 font-semibold mt-1 block">
                Chưa chọn tài khoản chính
              </span>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Trạng thái bảo mật & cơ chế thanh toán */}
        <div className="p-5 rounded-2xl bg-[#12141a] border border-[#212532] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8e95a5] font-semibold block uppercase tracking-wider">
              Cơ Chế Bảo Mật
            </span>
            <span className="text-xs font-bold text-emerald-400 mt-1 block flex items-center gap-1">
              <FiShield /> API Key & Checksum Độc Quyền
            </span>
            <span className="text-[10px] text-[#8e95a5] block mt-0.5">
              Chỉ Admin hệ thống được xem & chỉnh sửa
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FiShield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Danh Sách Tài Khoản PayOS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Danh Sách Tài Khoản Đã Cấu Hình ({configs.length})
          </h2>
          <span className="text-xs text-[#8e95a5]">
            Hệ thống tự động sử dụng tài khoản chính cho POS & QR gọi món
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center rounded-3xl bg-[#12141a] border border-[#212532]">
            <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#8e95a5]">Đang tải danh sách tài khoản PayOS từ Database...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-3xl bg-red-950/20 border border-red-500/30 text-red-300">
            <FiAlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-sm font-bold">Không thể tải danh sách tài khoản PayOS</p>
            <p className="text-xs text-red-400/80 mt-1">Vui lòng kiểm tra quyền truy cập hoặc kết nối mạng</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#12141a] border border-[#212532] flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#181b24] border border-[#212532] flex items-center justify-center text-[#8e95a5] text-2xl mb-4">
              <FiCreditCard />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Chưa có tài khoản PayOS nào</h3>
            <p className="text-xs text-[#8e95a5] max-w-md mb-5">
              Hãy thêm tài khoản PayOS đầu tiên của bạn để kích hoạt tính năng thanh toán VietQR tự động
              trên quầy POS và hệ thống gọi món tại bàn.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl gold-gradient-bg text-[#0b0c10] font-black text-xs gold-glow-sm hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <FiPlus />
              <span>Thêm Tài Khoản Ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {configs.map((config) => (
              <PayOSAccountCard
                key={config.id}
                config={config}
                onEdit={handleOpenEditModal}
              />
            ))}
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

