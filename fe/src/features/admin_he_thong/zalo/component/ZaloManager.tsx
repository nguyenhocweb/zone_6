'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useZaloStatus,
  useStartZaloQr,
  useZaloQrStatus,
  useCancelZaloQr,
  useSendZaloMessage,
  useLogoutZalo,
  useZaloGroups,
  useStoreZaloChannels,
  useUpdateStoreZaloChannels,
} from '../hook/useZalo';
import { useCheckinConfig } from '@/features/admin_he_thong/checkin-config/hook/useCheckinConfig';
import { useGetStores } from '@/features/admin_he_thong/store/hook/useGetStores';
import type { ZaloChannelConfig, ZaloChannelType } from '../type/zalo.type';
import {
  FiRadio,
  FiLogOut,
  FiSend,
  FiShield,
  FiCheckCircle,
  FiHelpCircle,
  FiCheck,
  FiCopy,
  FiMapPin,
  FiCamera,
  FiBox,
  FiCalendar,
  FiBell,
  FiToggleLeft,
  FiToggleRight,
  FiMaximize2,
  FiInfo,
  FiRefreshCw,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { ConfirmModal } from '@/core/components/ui/ConfirmModal';

interface StoreOption {
  id: string;
  code: string;
  shortCode: string;
  name: string;
  address: string;
}

const CHANNEL_METADATA: Record<
  ZaloChannelType,
  {
    title: string;
    icon: React.ReactNode;
    badgeBg: string;
    description: string;
    suggestedIcon: string;
    channelNameRaw: string;
    defaultSampleText: (storeName: string) => string;
  }
> = {
  CHECKIN: {
    title: 'Điểm danh & Check-in ca',
    icon: <FiCamera className="w-4 h-4 text-stone-400 dark:text-stone-400" />,
    badgeBg: 'bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800',
    description: 'Bắn ảnh selfie có GPS, thông báo vào ca, đi muộn hoặc vắng mặt.',
    suggestedIcon: '📸',
    channelNameRaw: 'ĐIỂM DANH & CHECK-IN',
    defaultSampleText: (storeName) =>
      `📸 [GO CÀ PHÊ CHECK-IN]: Nhân viên [Nguyễn Văn A] đã check-in thành công ca Sáng (07:00 - 12:00) tại ${storeName}. Vị trí GPS: Hợp lệ.`,
  },
  MATERIAL: {
    title: 'Kho & Nguyên vật liệu',
    icon: <FiBox className="w-4 h-4 text-stone-400 dark:text-stone-400" />,
    badgeBg: 'bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800',
    description: 'Cảnh báo hết đá, hết sữa tươi, siro cạn và đề xuất nhập kho gấp.',
    suggestedIcon: '📦',
    channelNameRaw: 'KHO & NGUYÊN VẬT LIỆU',
    defaultSampleText: (storeName) =>
      `⚠️ [CẢNH BÁO NGUYÊN LIỆU]: ${storeName} sắp hết hàng tồn quầy:\n- Sữa tươi thanh trùng: còn 2 hộp\n- Đá bi: còn 1 bao\nĐề nghị quản trị viên / kho trung tâm cấp hàng!`,
  },
  SCHEDULE: {
    title: 'Đăng ký ca & Lịch tuần',
    icon: <FiCalendar className="w-4 h-4 text-stone-400 dark:text-stone-400" />,
    badgeBg: 'bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800',
    description: 'Nhắc nhân sự nộp lịch trống, thông báo mở cổng và bắn bảng lịch tuần duyệt.',
    suggestedIcon: '📅',
    channelNameRaw: 'ĐĂNG KÝ CA & LỊCH TUẦN',
    defaultSampleText: (storeName) =>
      `🔔 [LỊCH LÀM VIỆC TUẦN MỚI]: Bảng phân ca làm việc tuần tới của ${storeName} đã được ban hành chính thức. Đề nghị toàn thể nhân sự kiểm tra ca trực cá nhân!`,
  },
  GENERAL: {
    title: 'Thông báo chung & Khẩn cấp',
    icon: <FiBell className="w-4 h-4 text-stone-400 dark:text-stone-400" />,
    badgeBg: 'bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800',
    description: 'Phổ biến quy chế hoạt động, lịch họp quán và thông báo vận hành khẩn cấp.',
    suggestedIcon: '📢',
    channelNameRaw: 'THÔNG BÁO CHUNG & KHẨN CẤP',
    defaultSampleText: (storeName) =>
      `📢 [THÔNG BÁO QUÁN]: Họp toàn thể nhân sự ${storeName} vào lúc 22:30 Chủ Nhật tuần này. Đề nghị mọi thành viên có mặt đầy đủ đúng giờ!`,
  },
};

const DEFAULT_CHANNEL_TYPES: ZaloChannelType[] = ['CHECKIN', 'MATERIAL', 'SCHEDULE', 'GENERAL'];

export const ZaloManager: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === 'admin_he_thong';

  // Lấy cấu hình cơ sở từ backend MongoDB Atlas
  const { data: storeConfigData } = useCheckinConfig();
  const { data: storesResponse } = useGetStores({ is_active: true });

  const storeList: StoreOption[] = useMemo(() => {
    if (storesResponse?.stores && storesResponse.stores.length > 0) {
      return storesResponse.stores.map((s) => ({
        id: s.id || s._id || '',
        code: s.store_code,
        shortCode: s.store_name.replace('Go Cà Phê - ', ''),
        name: s.store_name,
        address: s.address,
      }));
    }

    if (storeConfigData) {
      return [
        {
          id: storeConfigData.id || '',
          code: 'Z6-CS01',
          shortCode: storeConfigData.store_name || 'Cơ sở 1',
          name: storeConfigData.store_name || 'Go Cà Phê Cơ Sở 1',
          address: storeConfigData.address || '',
        },
      ];
    }

    return [];
  }, [storesResponse, storeConfigData]);

  const [selectedStore, setSelectedStore] = useState<StoreOption>({
    id: '',
    code: 'Z6-CS01',
    shortCode: 'CS01',
    name: 'Đang tải chi nhánh...',
    address: '',
  });

  useEffect(() => {
    if (storeList.length > 0) {
      if (!selectedStore.id || !storeList.some((s) => s.id === selectedStore.id)) {
        setSelectedStore(storeList[0]);
      }
    }
  }, [storeList, selectedStore.id]);

  // API Hooks
  const {
    data: statusData,
    isLoading: isStatusLoading,
    refetch: refetchStatus,
  } = useZaloStatus(isAdmin);
  const startQrMutation = useStartZaloQr();
  const cancelQrMutation = useCancelZaloQr();
  const logoutMutation = useLogoutZalo();
  const sendMessageMutation = useSendZaloMessage();
  const updateChannelsMutation = useUpdateStoreZaloChannels();

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Lấy danh sách cấu hình 4 kênh của cơ sở đang chọn
  const {
    data: remoteChannels,
    isLoading: isChannelsLoading,
    refetch: refetchChannels,
  } = useStoreZaloChannels(selectedStore.id, selectedStore.shortCode, isAdmin);

  const [channels, setChannels] = useState<ZaloChannelConfig[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [showIdGuide, setShowIdGuide] = useState<boolean>(false);

  const [activeQrId, setActiveQrId] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(120);
  const { data: qrData } = useZaloQrStatus(activeQrId);

  const isReady = statusData?.status === 'ready';

  const { data: groupsData } = useZaloGroups(isAdmin && isReady);

  useEffect(() => {
    if (remoteChannels && remoteChannels.length > 0) {
      setChannels(remoteChannels);
    } else {
      const defaults: ZaloChannelConfig[] = DEFAULT_CHANNEL_TYPES.map((type) => {
        const meta = CHANNEL_METADATA[type];
        const suggestedGroupName = `[Z6 - ${selectedStore.shortCode}] ${meta.suggestedIcon} ${meta.channelNameRaw}`;
        return {
          storeId: selectedStore.id,
          channelType: type,
          groupName: suggestedGroupName,
          targetId: '',
          targetName: suggestedGroupName,
          threadType: 'group',
          defaultMessage: meta.defaultSampleText(selectedStore.name),
          isActive: true,
          lastSentAt: null,
        };
      });
      setChannels(defaults);
    }
  }, [remoteChannels, selectedStore]);

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

  useEffect(() => {
    if (qrData?.status === 'confirmed') {
      toast.success('Đăng nhập Zalo thành công!');
      setActiveQrId(null);
      refetchStatus();
    }
  }, [qrData?.status, refetchStatus]);

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      router.replace('/schedule');
    }
  }, [isAuthLoading, isAdmin, router]);

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

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    try {
      await logoutMutation.mutateAsync();
      toast.success('Đã đăng xuất tài khoản Zalo');
      refetchStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Lỗi khi đăng xuất');
    }
  };

  const handleUpdateChannelField = (
    channelType: ZaloChannelType,
    field: keyof ZaloChannelConfig,
    value: any
  ) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.channelType === channelType) {
          return { ...c, [field]: value };
        }
        return c;
      })
    );
  };

  const handleCopySuggestedName = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Đã sao chép tên nhóm: "${text}"`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSaveStoreChannels = async () => {
    try {
      await updateChannelsMutation.mutateAsync({
        storeId: selectedStore.id,
        channels: channels.map((c) => ({
          ...c,
          storeId: selectedStore.id,
          targetId: c.targetId?.trim() || '',
          groupName: c.groupName?.trim() || '',
          targetName: c.groupName?.trim() || '',
        })),
      });
      toast.success(`Đã lưu cấu hình các nhóm Zalo cho ${selectedStore.name} thành công!`);
      refetchChannels();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Lỗi khi lưu cấu hình Zalo cơ sở');
    }
  };

  const handleTestChannel = async (channel: ZaloChannelConfig) => {
    if (!isReady) {
      toast.warning('Tài khoản Zalo Bot chưa kết nối. Vui lòng quét mã QR trước!');
      return;
    }
    if (!channel.targetId?.trim()) {
      toast.warning(`Vui lòng nhập hoặc chọn ID nhóm Zalo cho kênh [${CHANNEL_METADATA[channel.channelType]?.title}]`);
      return;
    }

    const testContent = channel.defaultMessage?.trim() ||
      `🤖 [TEST BOT GO CÀ PHÊ]: Đây là tin nhắn thử nghiệm kết nối nhóm nghiệp vụ [${channel.groupName || channel.channelType}]. Bot hoạt động chuẩn xác!`;

    try {
      setTestingChannel(channel.channelType);
      await sendMessageMutation.mutateAsync({
        recipientId: channel.targetId.trim(),
        threadType: channel.threadType || 'group',
        content: testContent,
      });
      toast.success(`Đã bắn tin thử nghiệm thành công vào nhóm [${channel.groupName || channel.targetId}]!`);
      handleUpdateChannelField(channel.channelType, 'lastSentAt', new Date().toISOString());
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Không thể gửi tin nhắn thử nghiệm tới nhóm này');
    } finally {
      setTestingChannel(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 dark:border-stone-700 dark:border-t-stone-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Header Banner & Trạng Thái Hệ Thống */}
      <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#1c1a17] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center shrink-0">
              <FiRadio className="w-5 h-5 text-stone-400 dark:text-stone-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
                  Điều hành Zalo Bot đa cơ sở
                </h2>
                {isReady ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đã kết nối (Online)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Chưa đăng nhập
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-3xl">
                Cấu hình hệ thống nhóm Zalo chuyên biệt theo từng cơ sở (Điểm danh, Kho nguyên liệu,
                Lịch tuần, Thông báo chung). Tự động định tuyến tin nhắn, chống trễ ca và bắn thông
                báo tức thì tới nhân sự chi nhánh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={() => {
                refetchStatus();
                refetchChannels();
                toast.info('Đang làm mới trạng thái...');
              }}
              disabled={isStatusLoading || isChannelsLoading}
              className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-2 cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 text-stone-400 dark:text-stone-400 ${isStatusLoading || isChannelsLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            {isReady && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition flex items-center gap-2 cursor-pointer"
              >
                <FiLogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Thanh Điều Hướng Chọn Cơ Sở */}
      <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#1c1a17] p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300">
            <FiMapPin className="w-4 h-4 text-stone-400 dark:text-stone-400" />
            <span>Chi nhánh đang cấu hình:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {storeList.map((st) => {
              const isSelected = selectedStore.id === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStore(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-[#efe9de] dark:text-stone-900 border-stone-900 dark:border-[#efe9de] shadow-sm'
                      : 'bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-[#efe9de]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white dark:bg-stone-900' : 'bg-emerald-500'}`}
                  />
                  <span>{st.shortCode}</span>
                  <span className="opacity-70 text-[10px] font-mono">({st.code})</span>
                </button>
              );
            })}
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-400 dark:text-stone-500">Địa chỉ: </span>
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{selectedStore.address}</span>
          </div>
        </div>
      </div>

      {/* 3. Khu Vực Chính: Cột Trái + Cột Phải */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: Quản Lý Phiên Zalo & Hướng Dẫn */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card Tài Khoản Zalo */}
          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#1c1a17] p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-2 mb-4">
              <FiCheckCircle className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Tài khoản Zalo đăng nhập
            </h3>

            {isReady ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-[#25221e] flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-lg font-semibold overflow-hidden shrink-0">
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
                    <p className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] truncate">
                      {statusData.activeSession?.displayName || 'Tài Khoản Zalo Quán'}
                    </p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate font-mono mt-0.5">
                      ID: {statusData.activeSession?.userId}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                        AES-256 Vault
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">
                        Bot Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] p-3 text-xs space-y-1.5 text-stone-500 dark:text-stone-400">
                  <div className="flex justify-between">
                    <span>Phiên làm việc:</span>
                    <span className="text-stone-800 dark:text-stone-200 font-medium">Chung toàn chuỗi</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Độ trễ chống spam:</span>
                    <span className="text-stone-800 dark:text-stone-200 font-medium font-mono">3 giây / tin</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cơ sở đang gán:</span>
                    <span className="text-stone-900 dark:text-[#efe9de] font-semibold font-mono">{selectedStore.code}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeQrId ? (
                  qrData?.qrDataUrl || startQrMutation.data?.qrDataUrl ? (
                    <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] text-center space-y-3">
                      <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-stone-200">
                        <img
                          src={qrData?.qrDataUrl || startQrMutation.data?.qrDataUrl}
                          alt="Zalo QR Code"
                          className="w-48 h-48 object-contain rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">
                          Mở Zalo trên điện thoại &gt; Quét mã QR
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Hết hạn trong:{' '}
                          <span className="font-mono text-stone-900 dark:text-[#efe9de] font-semibold">
                            {qrCountdown}s
                          </span>
                        </p>
                        {qrData?.status === 'scanned' && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium animate-pulse mt-1">
                            Đã quét! Vui lòng ấn "Xác nhận" trên điện thoại...
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleStartLogin}
                          disabled={startQrMutation.isPending}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1c1a17] text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                        >
                          Tạo lại
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelQr}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] text-center space-y-3">
                      <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 dark:border-stone-700 dark:border-t-stone-300 rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Đang tạo mã QR từ máy chủ Zalo...</p>
                      <button
                        type="button"
                        onClick={handleCancelQr}
                        className="px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-400 cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#25221e] text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-400">
                      <FiMaximize2 className="w-5 h-5 text-stone-400 dark:text-stone-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">Chưa kết nối tài khoản Zalo</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Đăng nhập để Bot có quyền gửi tin vào các nhóm chi nhánh.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartLogin}
                      disabled={startQrMutation.isPending}
                      className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                      <FiMaximize2 className="w-3.5 h-3.5" />
                      <span>{startQrMutation.isPending ? 'Đang tạo...' : 'Quét mã QR đăng nhập'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Quy Chuẩn Đặt Tên Nhóm Zalo */}
          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#1c1a17] p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <FiShield className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Quy chuẩn đặt tên nhóm chi nhánh
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Mỗi cơ sở nên tạo đúng 4 nhóm Zalo tương ứng với 4 nghiệp vụ. Đặt tên theo chuẩn để nhân
              viên và quản lý không bị nhầm lẫn giữa các chi nhánh:
            </p>
            <div className="space-y-2 text-xs">
              {DEFAULT_CHANNEL_TYPES.map((type) => {
                const meta = CHANNEL_METADATA[type];
                const suggested = `[Z6 - ${selectedStore.shortCode}] ${meta.suggestedIcon} ${meta.channelNameRaw}`;
                const isCopied = copiedKey === `suggest_${type}`;
                return (
                  <div
                    key={type}
                    className="p-2.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-medium text-stone-400 dark:text-stone-500 block">
                        {meta.title}
                      </span>
                      <span className="font-mono text-[11px] text-stone-800 dark:text-stone-200 truncate block">
                        {suggested}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopySuggestedName(suggested, `suggest_${type}`)}
                      className="p-1.5 rounded-lg bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-[#efe9de] transition shrink-0 cursor-pointer"
                      title="Sao chép tên này"
                    >
                      {isCopied ? <FiCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hướng Dẫn Lấy ID Nhóm */}
          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#1c1a17] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <FiHelpCircle className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Cách lấy ID nhóm (Grid)
              </h4>
              <button
                type="button"
                onClick={() => setShowIdGuide(!showIdGuide)}
                className="text-[11px] text-stone-600 dark:text-stone-400 underline cursor-pointer"
              >
                {showIdGuide ? 'Ẩn bớt' : 'Xem chi tiết'}
              </button>
            </div>

            {showIdGuide && (
              <div className="space-y-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed pt-1 animate-fadeIn">
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
                  <strong className="text-stone-900 dark:text-[#efe9de]">Cách 1: Chọn từ danh sách Zalo</strong>
                  <p className="mt-0.5 text-[11px]">
                    Khi Bot đã đăng nhập, ở mỗi thẻ kênh bên phải có nút{' '}
                    <span className="font-semibold text-stone-800 dark:text-stone-200">"Chọn từ nhóm đã tham gia"</span>,
                    chỉ cần click chọn là hệ thống tự điền ID!
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
                  <strong className="text-stone-900 dark:text-[#efe9de]">Cách 2: URL chat.zalo.me</strong>
                  <p className="mt-0.5 text-[11px]">
                    Mở nhóm trên trình duyệt máy tính &gt; Nhìn link{' '}
                    <code className="text-stone-800 dark:text-stone-200 font-mono">chat.zalo.me/g/852749102...</code>.
                    Dãy số sau chữ <code className="font-mono font-semibold">/g/</code> chính là Grid ID.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Lưới 4 Thẻ Kênh Nghiệp Vụ Cho Cơ Sở */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-stone-400 dark:text-stone-400" />
                Các kênh Zalo nghiệp vụ - {selectedStore.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Cấu hình định tuyến tin nhắn tự động theo từng nhóm nghiệp vụ riêng biệt
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveStoreChannels}
              disabled={updateChannelsMutation.isPending}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs shadow-sm transition flex items-center gap-2 cursor-pointer self-start sm:self-center shrink-0"
            >
              <FiCheck className="w-4 h-4" />
              <span>{updateChannelsMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình cơ sở này'}</span>
            </button>
          </div>

          {/* Grid 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DEFAULT_CHANNEL_TYPES.map((channelType) => {
              const meta = CHANNEL_METADATA[channelType];
              const channelConfig =
                channels.find((c) => c.channelType === channelType) || {
                  storeId: selectedStore.id,
                  channelType,
                  groupName: `[Z6 - ${selectedStore.shortCode}] ${meta.suggestedIcon} ${meta.channelNameRaw}`,
                  targetId: '',
                  targetName: '',
                  threadType: 'group',
                  defaultMessage: meta.defaultSampleText(selectedStore.name),
                  isActive: true,
                  lastSentAt: null,
                };

              const suggestedName = `[Z6 - ${selectedStore.shortCode}] ${meta.suggestedIcon} ${meta.channelNameRaw}`;
              const isCopied = copiedKey === `card_${channelType}`;
              const isTesting = testingChannel === channelType;

              return (
                <div
                  key={channelType}
                  className={`rounded-3xl border bg-white dark:bg-[#1c1a17] p-5 shadow-sm transition space-y-4 flex flex-col justify-between ${
                    channelConfig.isActive ? 'border-stone-200/90 dark:border-stone-800' : 'border-stone-200/50 dark:border-stone-800/50 opacity-75'
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
                          {meta.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">{meta.title}</h4>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border mt-0.5 ${meta.badgeBg}`}
                          >
                            {channelType}
                          </span>
                        </div>
                      </div>

                      {/* Công tắc Bật/Tắt */}
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateChannelField(channelType, 'isActive', !channelConfig.isActive)
                        }
                        className="text-2xl cursor-pointer transition text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
                        title={channelConfig.isActive ? 'Kênh đang BẬT' : 'Kênh đang TẮT'}
                      >
                        {channelConfig.isActive ? (
                          <FiToggleRight className="text-stone-900 dark:text-[#efe9de]" />
                        ) : (
                          <FiToggleLeft className="text-stone-300 dark:text-stone-600" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  {/* Tên nhóm chuẩn đề xuất */}
                  <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                      <span>Tên nhóm gợi ý:</span>
                      <button
                        type="button"
                        onClick={() => handleCopySuggestedName(suggestedName, `card_${channelType}`)}
                        className="text-stone-600 dark:text-stone-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {isCopied ? <FiCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <FiCopy className="w-3 h-3 text-stone-400 dark:text-stone-400" />}
                        {isCopied ? 'Đã copy' : 'Sao chép'}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-stone-800 dark:text-stone-200 font-medium break-all select-all">
                      {suggestedName}
                    </p>
                  </div>

                  {/* ID Nhóm & Chọn Nhanh Từ Zalo */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                      ID nhóm Zalo (Group ID / Grid)
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={channelConfig.targetId || ''}
                        onChange={(e) => {
                          const clean = e.target.value.trim().replace(/^[_gG]+/, '');
                          handleUpdateChannelField(channelType, 'targetId', clean);
                        }}
                        placeholder="Ví dụ: 8974711845327448590"
                        className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-mono"
                      />
                    </div>

                    {isReady && groupsData && groupsData.length > 0 && (
                      <div className="pt-1">
                        <select
                          className="w-full px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 cursor-pointer"
                          value={channelConfig.targetId || ''}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const groupObj = groupsData.find((g) => g.id === selectedId);
                            if (groupObj) {
                              handleUpdateChannelField(channelType, 'targetId', groupObj.id);
                              handleUpdateChannelField(channelType, 'groupName', groupObj.name);
                              handleUpdateChannelField(channelType, 'targetName', groupObj.name);
                              toast.success(
                                `Đã gán nhóm "${groupObj.name}" vào kênh ${meta.title}`
                              );
                            }
                          }}
                        >
                          <option value="">-- Chọn nhanh từ nhóm Zalo của bạn --</option>
                          {groupsData.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name} ({g.totalMembers || '?'} thành viên)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Mẫu Tin Nhắn Tự Động */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                      Mẫu tin nhắn mặc định
                    </label>
                    <textarea
                      rows={3}
                      value={channelConfig.defaultMessage || ''}
                      onChange={(e) =>
                        handleUpdateChannelField(channelType, 'defaultMessage', e.target.value)
                      }
                      placeholder="Nội dung mẫu tin nhắn tự động khi bắn vào nhóm này..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Footer Card */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-stone-400 dark:text-stone-500">
                      {channelConfig.lastSentAt ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Bắn tin lúc: {new Date(channelConfig.lastSentAt).toLocaleTimeString('vi-VN')}
                        </span>
                      ) : (
                        <span>Chưa bắn tin nào</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestChannel(channelConfig)}
                      disabled={isTesting || !isReady || !channelConfig.targetId?.trim()}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        isReady && channelConfig.targetId?.trim()
                          ? 'border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700'
                          : 'border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] text-stone-400 cursor-not-allowed'
                      }`}
                      title="Gửi ngay 1 tin nhắn thử nghiệm vào nhóm Zalo này"
                    >
                      <FiSend className={`w-3.5 h-3.5 text-stone-400 dark:text-stone-400 ${isTesting ? 'animate-bounce' : ''}`} />
                      <span>{isTesting ? 'Đang gửi...' : 'Gửi thử nghiệm'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Thanh Lưu Tổng Thể Cuối Trang */}
          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#1c1a17] p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
              <FiInfo className="w-4 h-4 text-stone-400 dark:text-stone-400 shrink-0" />
              <span>
                Cấu hình sẽ được lưu vào MongoDB Atlas và áp dụng ngay lập tức cho các sự kiện
                Điểm danh, Cảnh báo kho và Lịch tuần của chi nhánh <strong>{selectedStore.name}</strong>.
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveStoreChannels}
              disabled={updateChannelsMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FiCheck className="w-4 h-4" />
              <span>{updateChannelsMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình cơ sở'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal xác nhận Đăng xuất Zalo */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Đăng xuất tài khoản Zalo Bot"
        message="Bạn có chắc chắn muốn đăng xuất tài khoản Zalo này? Hệ thống sẽ tạm dừng gửi thông báo tự động cho đến khi có tài khoản mới được quét mã QR kết nối."
        confirmLabel="Đăng xuất"
        cancelLabel="Hủy bỏ"
        isDestructive={true}
        isLoading={logoutMutation.isPending}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
};
