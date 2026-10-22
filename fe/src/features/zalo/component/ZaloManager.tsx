'use client';

import React, { useState, useEffect } from 'react';
import {
  useZaloStatus,
  useStartZaloQr,
  useZaloQrStatus,
  useCancelZaloQr,
  useSendZaloMessage,
  useSendZaloImage,
  useLogoutZalo,
  useZaloGroups,
  useZaloConfig,
  useUpdateZaloConfig,
} from '../hook/useZalo';
import {
  FaQrcode,
  FaSignOutAlt,
  FaPaperPlane,
  FaShieldAlt,
  FaBroadcastTower,
  FaUserCheck,
  FaSync,
  FaImage,
  FaInfoCircle,
  FaCheckCircle,
  FaQuestionCircle,
  FaDatabase,
  FaSave,
} from 'react-icons/fa';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hook/useAuth';

export const ZaloManager: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === 'admin_he_thong';

  const { data: statusData, isLoading: isStatusLoading, refetch: refetchStatus } = useZaloStatus(isAdmin);
  const { data: savedConfig, isLoading: isConfigLoading } = useZaloConfig(isAdmin);
  const startQrMutation = useStartZaloQr();
  const cancelQrMutation = useCancelZaloQr();
  const logoutMutation = useLogoutZalo();
  const sendMessageMutation = useSendZaloMessage();
  const sendImageMutation = useSendZaloImage();
  const updateConfigMutation = useUpdateZaloConfig();

  // State cho phiên QR hiện tại
  const [activeQrId, setActiveQrId] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(120);

  // Hook theo dõi tiến độ QR hiện tại
  const { data: qrData } = useZaloQrStatus(activeQrId);

  const [targetId, setTargetId] = useState<string>('');
  const [targetName, setTargetName] = useState<string>('');
  const [threadType, setThreadType] = useState<'group' | 'user'>('group');
  const [messageContent, setMessageContent] = useState<string>(
    '🔔 [THÔNG BÁO ZONE SIX]: Lịch làm việc tuần mới đã được cập nhật trên hệ thống. Đề nghị nhân sự kiểm tra ca trực!'
  );
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showIdGuide, setShowIdGuide] = useState<boolean>(false);
  const [hasLoadedInitialConfig, setHasLoadedInitialConfig] = useState<boolean>(false);

  // Tự động nạp cấu hình từ database khi tải trang
  useEffect(() => {
    if (savedConfig && !hasLoadedInitialConfig) {
      if (savedConfig.targetId) setTargetId(savedConfig.targetId);
      if (savedConfig.threadType) setThreadType(savedConfig.threadType);
      if (savedConfig.imageUrl) setImageUrl(savedConfig.imageUrl);
      if (savedConfig.targetName) setTargetName(savedConfig.targetName);
      if (savedConfig.defaultMessage) setMessageContent(savedConfig.defaultMessage);
      setHasLoadedInitialConfig(true);
    }
  }, [savedConfig, hasLoadedInitialConfig]);

  const isReady = statusData?.status === 'ready';

  // Lấy danh sách nhóm Zalo khi bot đã kết nối
  const { data: groupsData } = useZaloGroups(isAdmin && isReady);

  // Đếm ngược QR
  useEffect(() => {
    if (!activeQrId) return;
    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveQrId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQrId]);

  // Xử lý khi quét mã thành công
  useEffect(() => {
    if (qrData?.status === 'confirmed') {
      toast.success('Đăng nhập Zalo thành công!');
      setActiveQrId(null);
      refetchStatus();
    }
  }, [qrData?.status, refetchStatus]);

  const handleStartLogin = async () => {
    try {
      const res = await startQrMutation.mutateAsync();
      setActiveQrId(res.id);
      setQrCountdown(Math.floor((res.ttlMs || 120000) / 1000));
      toast.info('Vui lòng mở ứng dụng Zalo trên điện thoại và quét mã QR!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Không thể tạo mã QR lúc này');
    }
  };

  const handleCancelQr = async () => {
    if (!activeQrId) return;
    try {
      await cancelQrMutation.mutateAsync(activeQrId);
      setActiveQrId(null);
      toast.info('Đã hủy phiên quét QR');
    } catch {
      setActiveQrId(null);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất tài khoản Zalo này?')) return;
    try {
      await logoutMutation.mutateAsync();
      toast.success('Đã đăng xuất tài khoản Zalo');
      refetchStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Lỗi khi đăng xuất');
    }
  };

  const handleSaveConfig = async (silent: boolean = false) => {
    if (!targetId.trim()) {
      if (!silent) toast.warning('Vui lòng nhập ID người nhận hoặc ID nhóm (Grid) trước khi lưu cấu hình');
      return;
    }

    try {
      await updateConfigMutation.mutateAsync({
        threadType,
        targetId: targetId.trim(),
        targetName: targetName.trim(),
        imageUrl: imageUrl.trim(),
        defaultMessage: messageContent.trim(),
      });
      if (!silent) {
        toast.success('Đã lưu cấu hình Zalo vào database thành công!');
      }
    } catch (err: any) {
      if (!silent) {
        toast.error(err?.response?.data?.error?.message || 'Lỗi khi lưu cấu hình vào database');
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) {
      toast.warning('Vui lòng nhập ID người nhận hoặc ID nhóm (Grid)');
      return;
    }
    if (!messageContent.trim()) {
      toast.warning('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    try {
      if (imageUrl.trim()) {
        // Gửi ảnh kèm chú thích
        await sendImageMutation.mutateAsync({
          recipientId: targetId.trim(),
          threadType,
          imageUrl: imageUrl.trim(),
          caption: messageContent.trim(),
        });
        toast.success('Đã gửi hình ảnh thành công qua Zalo!');
      } else {
        // Gửi tin nhắn chữ
        await sendMessageMutation.mutateAsync({
          recipientId: targetId.trim(),
          threadType,
          content: messageContent.trim(),
        });
        toast.success('Đã gửi tin nhắn thành công qua Zalo!');
      }

      // Tự động lưu cấu hình kênh gửi này vào database
      await handleSaveConfig(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Lỗi khi gửi tin nhắn');
    }
  };

  const router = useRouter();

  // Nếu người dùng không phải admin_he_thong, tự động chuyển về trang Lịch làm việc và xóa bỏ hoàn toàn giao diện
  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      router.replace('/schedule');
    }
  }, [isAuthLoading, isAdmin, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Banner Giới Thiệu & Trạng Thái Hệ Thống */}
      <div className="relative overflow-hidden rounded-2xl border border-[#212532] bg-[#12141A] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-2xl font-black shadow-lg">
              <FaBroadcastTower />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-[#F4F5F8] tracking-wide">
                  Zalo Personal Assistant &amp; Real-time Bridge
                </h2>
                {isReady ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Đã Kết Nối (WebSocket Online)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Chưa Đăng Nhập
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#8E95A5] leading-relaxed max-w-2xl">
                Cầu nối Node.js chuẩn Reverse Web Protocol (zca-js). Duy trì phiên đăng nhập bằng mã
                hóa AES-256-GCM, lắng nghe sự kiện WebSocket thời gian thực và bắn thông báo lịch
                phân ca tự động vào Group Zalo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <button
              type="button"
              onClick={() => refetchStatus()}
              disabled={isStatusLoading}
              className="px-3.5 py-2 rounded-xl border border-[#212532] bg-[#181B24] text-xs font-semibold text-[#8E95A5] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition flex items-center gap-2"
            >
              <FaSync className={isStatusLoading ? 'animate-spin' : ''} />
              Làm Mới
            </button>
            {isReady && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition flex items-center gap-2"
              >
                <FaSignOutAlt />
                Đăng Xuất
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: Quản Lý Phiên & QR Code (5 Cột) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#212532] bg-[#12141A] p-6 shadow-xl">
            <h3 className="text-sm font-bold text-[#E7CD80] uppercase tracking-wider flex items-center gap-2 mb-4">
              <FaUserCheck className="text-[#D4AF37]" /> Trạng Thái Tài Khoản Zalo
            </h3>

            {isReady ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-500/40 bg-[#181B24] flex items-center justify-center text-emerald-400 text-2xl font-bold overflow-hidden">
                    {statusData.activeSession?.avatar ? (
                      <img
                        src={statusData.activeSession.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      statusData.activeSession?.displayName?.charAt(0) || 'Z'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#F4F5F8] truncate">
                      {statusData.activeSession?.displayName || 'Tài Khoản Zalo Cá Nhân'}
                    </p>
                    <p className="text-xs text-[#8E95A5] truncate font-mono mt-0.5">
                      User ID: {statusData.activeSession?.userId}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                        Session Vault: AES-256
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#181B24] text-[#D4AF37] font-medium border border-[#D4AF37]/30">
                        WebSocket: Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#212532] bg-[#0B0C10] p-4 text-xs space-y-2 text-[#8E95A5]">
                  <div className="flex justify-between">
                    <span>Cơ chế bảo vệ:</span>
                    <span className="text-[#D4AF37] font-medium">Anti-Spam (3s Delay)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lắng nghe tin nhắn:</span>
                    <span className="text-emerald-400 font-medium">Tự Động Bật</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lưu trữ phiên:</span>
                    <span className="text-[#F4F5F8] font-medium">Mã Hóa Cục Bộ (.sessions)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeQrId ? (
                  (qrData?.qrDataUrl || startQrMutation.data?.qrDataUrl) ? (
                    <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-[#D4AF37]/40 bg-[#0B0C10] text-center space-y-4">
                      <div className="p-3 bg-white rounded-2xl shadow-xl">
                        <img
                          src={qrData?.qrDataUrl || startQrMutation.data?.qrDataUrl}
                          alt="Zalo QR Code"
                          className="w-56 h-56 object-contain"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#D4AF37]">
                          Mở Zalo trên điện thoại &gt; Quét mã QR
                        </p>
                        <p className="text-xs text-[#8E95A5]">
                          Mã hết hạn trong:{' '}
                          <span className="font-mono text-emerald-400 font-bold">
                            {qrCountdown}s
                          </span>
                        </p>
                        {qrData?.status === 'scanned' && (
                          <p className="text-xs text-amber-400 font-bold animate-pulse mt-2">
                            Đã quét mã! Vui lòng ấn "Xác nhận đăng nhập" trên điện thoại...
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleStartLogin}
                          disabled={startQrMutation.isPending}
                          className="px-3.5 py-1.5 rounded-lg border border-[#212532] bg-[#181B24] text-xs font-semibold text-[#8E95A5] hover:text-[#D4AF37] transition"
                        >
                          Tạo Lại Mã
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelQr}
                          className="px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                        >
                          Hủy Bỏ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-[#D4AF37]/30 bg-[#0B0C10] text-center space-y-4">
                      <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#E7CD80]">Đang tạo mã QR từ máy chủ Zalo...</p>
                        <p className="text-xs text-[#8E95A5]">Vui lòng đợi giây lát để hiển thị mã quét</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelQr}
                        className="px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                      >
                        Hủy Bỏ
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[#212532] bg-[#0B0C10] text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#181B24] border border-[#212532] flex items-center justify-center text-[#8E95A5] text-3xl">
                      <FaQrcode />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#F4F5F8]">Chưa có phiên Zalo hoạt động</p>
                      <p className="text-xs text-[#8E95A5] max-w-xs">
                        Tạo mã QR an toàn để quét đăng nhập bằng ứng dụng Zalo trên điện thoại.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartLogin}
                      disabled={startQrMutation.isPending}
                      className="px-6 py-2.5 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs uppercase tracking-wider gold-glow-sm hover:scale-[1.02] transition shadow-md flex items-center gap-2"
                    >
                      <FaQrcode />
                      {startQrMutation.isPending ? 'Đang Tạo Mã...' : 'Tạo Mã QR Đăng Nhập'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hộp Thông Tin Bảo Vệ An Toàn */}
          <div className="rounded-2xl border border-[#212532] bg-[#12141A] p-5 text-xs space-y-3">
            <h4 className="font-bold text-[#D4AF37] flex items-center gap-2">
              <FaShieldAlt /> Nguyên Tắc Vận Hành An Toàn (Anti-Ban Protocol)
            </h4>
            <ul className="space-y-2 text-[#8E95A5] list-disc list-inside">
              <li>
                <strong className="text-[#F4F5F8]">Duy trì phiên:</strong> Sử dụng khóa bí mật AES
                để bảo vệ cookie và secret key. Không cần quét lại QR mỗi khi khởi động server.
              </li>
              <li>
                <strong className="text-[#F4F5F8]">Chống spam:</strong> Hệ thống tự động giới hạn độ
                trễ tối thiểu 3 giây giữa các lần gửi tin nhắn.
              </li>
              <li>
                <strong className="text-[#F4F5F8]">Khuyến nghị:</strong> Sử dụng tài khoản nhân viên
                quản lý hoặc tài khoản riêng cho quán để điều phối công việc nội bộ.
              </li>
            </ul>
          </div>
        </div>

        {/* CỘT PHẢI: Bảng Điều Khiển Gửi Tin & Bắn Lịch Phân Ca (7 Cột) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-[#212532] bg-[#12141A] p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#212532] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#F4F5F8] flex items-center gap-2">
                  <FaPaperPlane className="text-[#D4AF37]" /> Bảng Gửi Tin Zalo Cá Nhân / Nhóm
                </h3>
                <p className="text-xs text-[#8E95A5] mt-0.5">
                  Gửi thông báo phân ca, lời nhắc nhở hoặc ảnh lịch trực vào nhóm làm việc Zone Six
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveConfig(false)}
                disabled={updateConfigMutation.isPending}
                className="px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37]/20 transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 shrink-0 self-start sm:self-center"
                title="Lưu cấu hình Loại hội thoại, ID nhận tin và URL ảnh vào Database"
              >
                <FaDatabase />
                {updateConfigMutation.isPending ? 'Đang Lưu...' : 'Lưu Vào Database'}
              </button>
            </div>

            {/* Thanh trạng thái cấu hình lưu trong Database */}
            {isConfigLoading ? (
              <div className="flex items-center gap-2 text-xs text-[#8E95A5] bg-[#0B0C10] px-3.5 py-2.5 rounded-xl border border-[#212532]">
                <FaSync className="animate-spin text-[#D4AF37]" /> Đang tải cấu hình Zalo từ database...
              </div>
            ) : savedConfig?.targetId ? (
              <div className="flex flex-wrap items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-[#8E95A5] gap-2">
                <div className="flex items-center gap-2">
                  <FaDatabase className="text-emerald-400" />
                  <span>Cấu hình đã lưu trong DB:</span>
                  <span className="font-mono text-[#F4F5F8] font-bold">
                    {savedConfig.threadType === 'group' ? '[Nhóm Zalo]' : '[Cá Nhân]'} {savedConfig.targetId}
                  </span>
                  {savedConfig.targetName && (
                    <span className="text-[#D4AF37] font-semibold">({savedConfig.targetName})</span>
                  )}
                </div>
                {targetId === savedConfig.targetId && threadType === savedConfig.threadType ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                    <FaCheckCircle /> Đã đồng bộ với DB
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveConfig(false)}
                    className="text-amber-400 hover:text-amber-300 underline font-medium text-[11px] cursor-pointer"
                  >
                    ● Có thay đổi chưa lưu (Click để lưu vào DB)
                  </button>
                )}
              </div>
            ) : null}

            <form onSubmit={handleSendMessage} className="space-y-4">
              {/* Chọn hình thức người nhận */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E95A5] uppercase tracking-wider mb-2">
                    Loại Hội Thoại
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setThreadType('group')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        threadType === 'group'
                          ? 'gold-gradient-bg text-[#0B0C10] border-[#D4AF37]'
                          : 'bg-[#181B24] text-[#8E95A5] border-[#212532]'
                      }`}
                    >
                      Nhóm Zalo (Group)
                    </button>
                    <button
                      type="button"
                      onClick={() => setThreadType('user')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        threadType === 'user'
                          ? 'gold-gradient-bg text-[#0B0C10] border-[#D4AF37]'
                          : 'bg-[#181B24] text-[#8E95A5] border-[#212532]'
                      }`}
                    >
                      Cá Nhân (User)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-[#8E95A5] uppercase tracking-wider">
                      {threadType === 'group' ? 'ID Nhóm (Group ID / Grid)' : 'ID Người Nhận (User ID)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowIdGuide(!showIdGuide)}
                      className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <FaQuestionCircle /> Lấy ID ở đâu?
                    </button>
                  </div>
                  <input
                    type="text"
                    value={targetId}
                    onChange={(e) => {
                      const clean = e.target.value.trim().replace(/^[_gG]+/, '');
                      setTargetId(clean);
                    }}
                    placeholder={
                      threadType === 'group'
                        ? 'Ví dụ: 8974711845327448590'
                        : 'Ví dụ: 2358753643259609401'
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>
              </div>

              {/* Hướng Dẫn Chi Tiết Cách Lấy ID */}
              {showIdGuide && (
                <div className="p-4 rounded-xl bg-[#0B0C10] border border-[#D4AF37]/30 space-y-3 text-xs text-[#8E95A5] animate-fadeIn">
                  <div className="flex items-center justify-between text-[#E7CD80] font-bold">
                    <span className="flex items-center gap-2">
                      <FaInfoCircle className="text-[#D4AF37]" /> Hướng Dẫn Lấy ID Nhóm (Grid) &amp; ID Cá Nhân (Uid)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowIdGuide(false)}
                      className="text-xs text-[#8E95A5] hover:text-white"
                    >
                      ✕ Đóng
                    </button>
                  </div>
                  <div className="space-y-2 leading-relaxed">
                    <div className="p-2.5 rounded-lg bg-[#181B24] border border-[#212532]">
                      <strong className="text-white">Cách 1: Lấy từ URL Zalo Web (Khuyên Dùng)</strong>
                      <p className="mt-0.5">
                        Mở <a href="https://chat.zalo.me" target="_blank" rel="noreferrer" className="text-[#D4AF37] underline font-medium">chat.zalo.me</a> trên máy tính &gt; Bấm vào Nhóm cần gửi &gt; Nhìn lên thanh địa chỉ trình duyệt: <code className="text-[#E7CD80] font-mono px-1 py-0.5 bg-black/40 rounded">https://chat.zalo.me/g/852749102374921</code>. Dãy số sau chữ <code className="text-emerald-400">/g/</code> chính là <strong className="text-white">ID Nhóm</strong>.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#181B24] border border-[#212532]">
                      <strong className="text-white">Cách 2: Gửi 1 tin nhắn vào nhóm rồi xem Terminal Zone Six</strong>
                      <p className="mt-0.5">
                        Sau khi Bot đăng nhập, mời bot vào nhóm rồi gõ bất kỳ tin nhắn nào (ví dụ <code className="text-[#E7CD80] font-mono px-1 py-0.5 bg-black/40 rounded">Zone 6 test</code>). Cửa sổ Terminal Backend sẽ lập tức in: <code className="text-emerald-400 font-mono text-[11px]">[Tin nhắn mới] Kênh: group (852749102374921)</code>. Bạn chỉ cần copy dãy số trong ngoặc.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#181B24] border border-[#212532]">
                      <strong className="text-white">Cách 3: Chọn trực tiếp từ danh sách trên</strong>
                      <p className="mt-0.5">
                        Khi tài khoản Zalo đã đăng nhập thành công, hệ thống sẽ tự động tải danh sách các nhóm bạn đang tham gia ngay phía trên để bạn click chọn trực tiếp.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách các nhóm Zalo đang tham gia (để click chọn nhanh) */}
              {threadType === 'group' && isReady && groupsData && groupsData.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#0B0C10] border border-[#212532] space-y-2">
                  <div className="text-[11px] font-bold text-[#E7CD80] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FaCheckCircle className="text-emerald-400" /> Nhóm Zalo bạn đang tham gia ({groupsData.length} nhóm - Click để chọn):
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                    {groupsData.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setTargetId(g.id);
                          setTargetName(g.name);
                          toast.success(`Đã chọn nhóm: ${g.name}. Nhấn "Lưu Vào Database" để ghi nhớ mặc định!`);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition flex items-center gap-2 cursor-pointer ${
                          targetId === g.id
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold shadow-sm'
                            : 'bg-[#181B24] border-[#262C3F] text-[#8E95A5] hover:text-[#F4F5F8] hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                        <span className="truncate max-w-[200px]">{g.name}</span>
                        {g.totalMembers && (
                          <span className="text-[10px] text-[#6D7588] shrink-0">({g.totalMembers} tv)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tùy chọn URL Ảnh */}
              <div>
                <label className="block text-xs font-semibold text-[#8E95A5] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FaImage className="text-[#D4AF37]" /> URL Hình Ảnh (Tùy Chọn)
                  </span>
                  <span className="text-[11px] text-[#6D7588]">Để trống nếu chỉ gửi tin chữ</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/schedule-matrix-zone-6.png"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Nội Dung Tin Nhắn */}
              <div>
                <label className="block text-xs font-semibold text-[#8E95A5] uppercase tracking-wider mb-2">
                  Nội Dung Tin Nhắn
                </label>
                <textarea
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Nhập nội dung cần thông báo tới nhóm làm việc..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] leading-relaxed resize-none"
                />
              </div>

              {/* Mẫu Soạn Sẵn Nhanh */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-[#6D7588] self-center">Mẫu nhanh:</span>
                <button
                  type="button"
                  onClick={() =>
                    setMessageContent(
                      '🌟 [ZONE SIX - LỊCH LÀM VIỆC]: Bảng phân ca tuần mới đã được tối ưu hóa thành công. Anh em vào kiểm tra ca sáng/chiều/tối nhé!'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#181B24] border border-[#212532] text-[11px] text-[#8E95A5] hover:text-[#D4AF37] transition"
                >
                  Thông Báo Lịch Tuần
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessageContent(
                      '🌙 [NHẮC NHỞ CA TỐI]: Ca tối hôm nay (18:00 - 23:00) gồm 2 nhân sự. Yêu cầu kiểm tra chốt quầy và bàn giao ca chu đáo!'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#181B24] border border-[#212532] text-[11px] text-[#8E95A5] hover:text-[#D4AF37] transition"
                >
                  Nhắc Ca Tối
                </button>
              </div>

              {/* Nút lưu cấu hình và Nút gửi */}
              <div className="pt-3 border-t border-[#212532] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#8E95A5] flex items-center gap-1.5 self-start sm:self-center">
                  <FaInfoCircle className="text-[#D4AF37]" />
                  <span>Tin nhắn sẽ được gửi trực tiếp từ phiên đăng nhập Zalo hiện tại</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSaveConfig(false)}
                    disabled={updateConfigMutation.isPending}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#212532] bg-[#181B24] hover:bg-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <FaSave className="text-[#D4AF37]" />
                    {updateConfigMutation.isPending ? 'Đang Lưu...' : 'Lưu Cấu Hình'}
                  </button>

                  <button
                    type="submit"
                    disabled={!isReady || sendMessageMutation.isPending || sendImageMutation.isPending}
                    className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md ${
                      isReady
                        ? 'gold-gradient-bg text-[#0B0C10] gold-glow-sm hover:scale-[1.02] cursor-pointer'
                        : 'bg-[#181B24] text-[#6D7588] border border-[#212532] cursor-not-allowed'
                    }`}
                  >
                    <FaPaperPlane />
                    {sendMessageMutation.isPending || sendImageMutation.isPending
                      ? 'Đang Gửi...'
                      : 'Gửi Tin Nhắn Zalo'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
