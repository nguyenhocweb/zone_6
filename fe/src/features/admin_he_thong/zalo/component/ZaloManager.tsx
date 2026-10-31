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
  FaQrcode,
  FaSignOutAlt,
  FaPaperPlane,
  FaShieldAlt,
  FaBroadcastTower,
  FaUserCheck,
  FaSync,
  FaInfoCircle,
  FaCheckCircle,
  FaQuestionCircle,
  FaSave,
  FaCopy,
  FaStore,
  FaBuilding,
  FaCamera,
  FaBoxOpen,
  FaCalendarAlt,
  FaBullhorn,
  FaToggleOn,
  FaToggleOff,
  FaCheck,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/shared/auth/hook/useAuth';

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
    color: string;
    badgeBg: string;
    borderColor: string;
    description: string;
    suggestedIcon: string;
    channelNameRaw: string;
    defaultSampleText: (storeName: string) => string;
  }
> = {
  CHECKIN: {
    title: 'Điểm Danh & Check-in Ca',
    icon: <FaCamera className="text-emerald-400 text-lg" />,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
    description: 'Bắn ảnh selfie có GPS, thông báo vào ca, đi muộn hoặc vắng mặt.',
    suggestedIcon: '📸',
    channelNameRaw: 'ĐIỂM DANH & CHECK-IN',
    defaultSampleText: (storeName) =>
      `📸 [ZONE SIX CHECK-IN]: Nhân viên [Nguyễn Văn A] đã check-in thành công ca Sáng (07:00 - 12:00) tại ${storeName}. Vị trí GPS: Hợp lệ.`,
  },
  MATERIAL: {
    title: 'Kho & Nguyên Vật Liệu',
    icon: <FaBoxOpen className="text-amber-400 text-lg" />,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
    description: 'Cảnh báo hết đá, hết sữa tươi, siro cạn và đề xuất nhập kho gấp.',
    suggestedIcon: '📦',
    channelNameRaw: 'KHO & NGUYÊN VẬT LIỆU',
    defaultSampleText: (storeName) =>
      `⚠️ [CẢNH BÁO NGUYÊN LIỆU]: ${storeName} sắp hết hàng tồn quầy:\n- Sữa tươi thanh trùng: còn 2 hộp\n- Đá bi: còn 1 bao\nĐề nghị quản trị viên / kho trung tâm cấp hàng!`,
  },
  SCHEDULE: {
    title: 'Đăng Ký Ca & Lịch Tuần',
    icon: <FaCalendarAlt className="text-[#D4AF37] text-lg" />,
    color: 'text-[#D4AF37]',
    badgeBg: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30',
    borderColor: 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60',
    description: 'Nhắc nhân sự nộp lịch trống, thông báo mở cổng và bắn bảng lịch tuần duyệt.',
    suggestedIcon: '📅',
    channelNameRaw: 'ĐĂNG KÝ CA & LỊCH TUẦN',
    defaultSampleText: (storeName) =>
      `🔔 [LỊCH LÀM VIỆC TUẦN MỚI]: Bảng phân ca làm việc tuần tới của ${storeName} đã được ban hành chính thức. Đề nghị toàn thể nhân sự kiểm tra ca trực cá nhân!`,
  },
  GENERAL: {
    title: 'Thông Báo Chung & Khẩn Cấp',
    icon: <FaBullhorn className="text-sky-400 text-lg" />,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500/30 hover:border-sky-500/60',
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

  // Danh sách các cơ sở thực tế từ CSDL MongoDB Atlas (Mặc định 2 cơ sở)
  const storeList: StoreOption[] = useMemo(() => {
    if (storesResponse?.stores && storesResponse.stores.length > 0) {
      return storesResponse.stores.map((s) => ({
        id: s.id || s._id || '',
        code: s.store_code,
        shortCode: s.store_name.replace('Zone Six - ', ''),
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
          name: storeConfigData.store_name || 'Zone Six Cơ Sở 1',
          address: storeConfigData.address || '',
        },
      ];
    }

    return [];
  }, [storesResponse, storeConfigData]);

  // Cơ sở đang chọn
  const [selectedStore, setSelectedStore] = useState<StoreOption>({
    id: '',
    code: 'Z6-CS01',
    shortCode: 'CS01',
    name: 'Đang tải chi nhánh...',
    address: '',
  });

  // Cập nhật selectedStore khi storeList có dữ liệu từ Database
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

  // Lấy danh sách cấu hình 4 kênh của cơ sở đang chọn
  const {
    data: remoteChannels,
    isLoading: isChannelsLoading,
    refetch: refetchChannels,
  } = useStoreZaloChannels(selectedStore.id, selectedStore.shortCode, isAdmin);

  // State local cho 4 kênh của cơ sở đang chọn
  const [channels, setChannels] = useState<ZaloChannelConfig[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [showIdGuide, setShowIdGuide] = useState<boolean>(false);

  // State cho phiên QR hiện tại
  const [activeQrId, setActiveQrId] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(120);
  const { data: qrData } = useZaloQrStatus(activeQrId);

  const isReady = statusData?.status === 'ready';

  // Lấy danh sách nhóm Zalo khi bot đã kết nối
  const { data: groupsData } = useZaloGroups(isAdmin && isReady);

  // Khởi tạo hoặc đồng bộ local state khi remoteChannels thay đổi
  useEffect(() => {
    if (remoteChannels && remoteChannels.length > 0) {
      setChannels(remoteChannels);
    } else {
      // Khởi tạo 4 kênh mặc định
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

  // Tự động redirect nếu không phải admin
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

  // Cập nhật giá trị trường của 1 kênh
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

  // Sao chép tên nhóm quy chuẩn
  const handleCopySuggestedName = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Đã sao chép tên nhóm chuẩn: "${text}"`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Lưu toàn bộ cấu hình 4 kênh của cơ sở
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

  // Gửi tin nhắn thử nghiệm vào 1 kênh cụ thể
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
      `🤖 [TEST BOT ZONE SIX]: Đây là tin nhắn thử nghiệm kết nối nhóm nghiệp vụ [${channel.groupName || channel.channelType}]. Bot hoạt động chuẩn xác!`;

    try {
      setTestingChannel(channel.channelType);
      await sendMessageMutation.mutateAsync({
        recipientId: channel.targetId.trim(),
        threadType: channel.threadType || 'group',
        content: testContent,
      });
      toast.success(`Đã bắn tin thử nghiệm thành công vào nhóm [${channel.groupName || channel.targetId}]!`);

      // Cập nhật lastSentAt tại chỗ
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
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner & Trạng Thái Hệ Thống */}
      <div className="relative overflow-hidden rounded-2xl border border-[#212532] bg-[#12141A] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-2xl font-black shadow-lg shrink-0">
              <FaBroadcastTower />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-black text-[#F4F5F8] tracking-wide">
                  Trung Tâm Điều Hành Zalo Bot Đa Cơ Sở Zone Six
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
              <p className="mt-1 text-xs text-[#8E95A5] leading-relaxed max-w-3xl">
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
              className="px-3.5 py-2 rounded-xl border border-[#212532] bg-[#181B24] text-xs font-semibold text-[#8E95A5] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition flex items-center gap-2 cursor-pointer"
            >
              <FaSync className={isStatusLoading || isChannelsLoading ? 'animate-spin' : ''} />
              Làm Mới
            </button>
            {isReady && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <FaSignOutAlt />
                Đăng Xuất
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Thanh Điều Hướng Chọn Cơ Sở (Store Switcher) */}
      <div className="rounded-2xl border border-[#212532] bg-[#12141A] p-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E7CD80] uppercase tracking-wider">
            <FaStore className="text-[#D4AF37] text-sm" />
            <span>Chi Nhánh Đang Cấu Hình:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {storeList.map((st) => {
              const isSelected = selectedStore.id === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStore(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? 'gold-gradient-bg text-[#0B0C10] border-[#D4AF37] shadow-md shadow-[#D4AF37]/20 scale-[1.02]'
                      : 'bg-[#181B24] text-[#8E95A5] border-[#212532] hover:text-[#F4F5F8] hover:border-[#D4AF37]/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#0B0C10]' : 'bg-emerald-400'}`}
                  />
                  <span>{st.shortCode}</span>
                  <span className="opacity-70 text-[11px]">({st.code})</span>
                </button>
              );
            })}
          </div>

          <div className="text-right">
            <span className="text-xs text-[#8E95A5]">Địa chỉ: </span>
            <span className="text-xs font-medium text-[#F4F5F8]">{selectedStore.address}</span>
          </div>
        </div>
      </div>

      {/* 3. Khu Vực Chính: Cột Trái (Tài khoản) + Cột Phải (4 Kênh Nghiệp Vụ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: Quản Lý Phiên Zalo & Hướng Dẫn (4 Cột) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card Tài Khoản Zalo */}
          <div className="rounded-2xl border border-[#212532] bg-[#12141A] p-5 shadow-xl">
            <h3 className="text-xs font-bold text-[#E7CD80] uppercase tracking-wider flex items-center gap-2 mb-4">
              <FaUserCheck className="text-[#D4AF37]" /> Tài Khoản Zalo Đăng Nhập
            </h3>

            {isReady ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/40 bg-[#181B24] flex items-center justify-center text-emerald-400 text-xl font-bold overflow-hidden shrink-0">
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
                      {statusData.activeSession?.displayName || 'Tài Khoản Zalo Quán'}
                    </p>
                    <p className="text-[11px] text-[#8E95A5] truncate font-mono mt-0.5">
                      ID: {statusData.activeSession?.userId}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                        AES-256 Vault
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#181B24] text-[#D4AF37] font-medium border border-[#D4AF37]/30">
                        Bot Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#212532] bg-[#0B0C10] p-3 text-xs space-y-1.5 text-[#8E95A5]">
                  <div className="flex justify-between">
                    <span>Phiên làm việc:</span>
                    <span className="text-emerald-400 font-medium">Chung Toàn Chuỗi</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Độ trễ chống spam:</span>
                    <span className="text-[#D4AF37] font-medium">3 giây / tin</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cơ sở đang gán:</span>
                    <span className="text-[#F4F5F8] font-bold">{selectedStore.code}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeQrId ? (
                  qrData?.qrDataUrl || startQrMutation.data?.qrDataUrl ? (
                    <div className="flex flex-col items-center justify-center p-5 rounded-xl border border-[#D4AF37]/40 bg-[#0B0C10] text-center space-y-3">
                      <div className="p-2.5 bg-white rounded-xl shadow-xl">
                        <img
                          src={qrData?.qrDataUrl || startQrMutation.data?.qrDataUrl}
                          alt="Zalo QR Code"
                          className="w-48 h-48 object-contain"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#D4AF37]">
                          Mở Zalo trên điện thoại &gt; Quét mã QR
                        </p>
                        <p className="text-[11px] text-[#8E95A5]">
                          Hết hạn trong:{' '}
                          <span className="font-mono text-emerald-400 font-bold">
                            {qrCountdown}s
                          </span>
                        </p>
                        {qrData?.status === 'scanned' && (
                          <p className="text-xs text-amber-400 font-bold animate-pulse mt-1">
                            Đã quét! Vui lòng ấn "Xác nhận" trên điện thoại...
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleStartLogin}
                          disabled={startQrMutation.isPending}
                          className="px-3 py-1.5 rounded-lg border border-[#212532] bg-[#181B24] text-xs font-semibold text-[#8E95A5] hover:text-[#D4AF37] transition cursor-pointer"
                        >
                          Tạo Lại
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelQr}
                          className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-[#D4AF37]/30 bg-[#0B0C10] text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-[#E7CD80]">Đang tạo mã QR từ máy chủ Zalo...</p>
                      <button
                        type="button"
                        onClick={handleCancelQr}
                        className="px-3 py-1 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400 cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-[#212532] bg-[#0B0C10] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#181B24] border border-[#212532] flex items-center justify-center text-[#8E95A5] text-2xl">
                      <FaQrcode />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#F4F5F8]">Chưa kết nối tài khoản Zalo</p>
                      <p className="text-[11px] text-[#8E95A5]">
                        Đăng nhập để Bot có quyền gửi tin vào các nhóm chi nhánh.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartLogin}
                      disabled={startQrMutation.isPending}
                      className="px-4 py-2 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs uppercase tracking-wider gold-glow-sm hover:scale-[1.02] transition shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <FaQrcode />
                      {startQrMutation.isPending ? 'Đang Tạo...' : 'Quét Mã QR Đăng Nhập'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Quy Chuẩn Đặt Tên Nhóm Zalo */}
          <div className="rounded-2xl border border-[#212532] bg-[#12141A] p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <FaShieldAlt /> Quy Chuẩn Đặt Tên Nhóm Chi Nhánh
            </h4>
            <p className="text-xs text-[#8E95A5] leading-relaxed">
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
                    className="p-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#6D7588] block">
                        {meta.title}
                      </span>
                      <span className="font-mono text-[11px] text-[#F4F5F8] truncate block">
                        {suggested}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopySuggestedName(suggested, `suggest_${type}`)}
                      className="p-1.5 rounded-lg bg-[#181B24] border border-[#212532] text-xs text-[#8E95A5] hover:text-[#D4AF37] transition shrink-0 cursor-pointer"
                      title="Sao chép tên này"
                    >
                      {isCopied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hướng Dẫn Lấy ID Nhóm */}
          <div className="rounded-2xl border border-[#212532] bg-[#12141A] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#E7CD80] uppercase tracking-wider flex items-center gap-2">
                <FaQuestionCircle className="text-[#D4AF37]" /> Cách Lấy ID Nhóm (Grid)
              </h4>
              <button
                type="button"
                onClick={() => setShowIdGuide(!showIdGuide)}
                className="text-[11px] text-[#D4AF37] underline cursor-pointer"
              >
                {showIdGuide ? 'Ẩn bớt' : 'Xem chi tiết'}
              </button>
            </div>

            {showIdGuide && (
              <div className="space-y-2 text-xs text-[#8E95A5] leading-relaxed pt-1 animate-fadeIn">
                <div className="p-2 rounded-lg bg-[#0B0C10] border border-[#212532]">
                  <strong className="text-white">Cách 1: Chọn từ danh sách Zalo</strong>
                  <p className="mt-0.5 text-[11px]">
                    Khi Bot đã đăng nhập, ở mỗi thẻ kênh bên phải có nút{' '}
                    <span className="text-[#D4AF37] font-semibold">"Chọn từ nhóm đã tham gia"</span>,
                    chỉ cần click chọn là hệ thống tự điền ID!
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-[#0B0C10] border border-[#212532]">
                  <strong className="text-white">Cách 2: URL chat.zalo.me</strong>
                  <p className="mt-0.5 text-[11px]">
                    Mở nhóm trên trình duyệt máy tính &gt; Nhìn link{' '}
                    <code className="text-emerald-400 font-mono">chat.zalo.me/g/852749102...</code>.
                    Dãy số sau chữ <code className="text-[#D4AF37]">/g/</code> chính là Grid ID.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Lưới 4 Thẻ Kênh Nghiệp Vụ Cho Cơ Sở (8 Cột) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#212532] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#F4F5F8] flex items-center gap-2">
                <FaBuilding className="text-[#D4AF37]" />
                Các Kênh Zalo Nghiệp Vụ - {selectedStore.name}
              </h3>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                Cấu hình định tuyến tin nhắn tự động theo từng nhóm nghiệp vụ riêng biệt
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveStoreChannels}
              disabled={updateChannelsMutation.isPending}
              className="px-5 py-2.5 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs uppercase tracking-wider gold-glow-sm hover:scale-[1.02] transition shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-center shrink-0"
            >
              <FaSave />
              {updateChannelsMutation.isPending ? 'Đang Lưu...' : 'Lưu Cấu Hình Cơ Sở Này'}
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
                  className={`rounded-2xl border bg-[#12141A] p-5 shadow-xl transition space-y-4 flex flex-col justify-between ${
                    channelConfig.isActive ? meta.borderColor : 'border-[#212532] opacity-75'
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#181B24] border border-[#212532]">
                          {meta.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#F4F5F8]">{meta.title}</h4>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${meta.badgeBg}`}
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
                        className="text-2xl cursor-pointer transition text-[#8E95A5] hover:text-white"
                        title={channelConfig.isActive ? 'Kênh đang BẬT' : 'Kênh đang TẮT'}
                      >
                        {channelConfig.isActive ? (
                          <FaToggleOn className="text-emerald-400" />
                        ) : (
                          <FaToggleOff className="text-[#6D7588]" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  {/* Tên nhóm chuẩn đề xuất */}
                  <div className="p-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#8E95A5] font-semibold">
                      <span>Tên Nhóm Gợi Ý Chuẩn:</span>
                      <button
                        type="button"
                        onClick={() => handleCopySuggestedName(suggestedName, `card_${channelType}`)}
                        className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        {isCopied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                        {isCopied ? 'Đã copy' : 'Sao chép'}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-[#E7CD80] font-medium break-all select-all">
                      {suggestedName}
                    </p>
                  </div>

                  {/* ID Nhóm & Chọn Nhanh Từ Zalo */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#8E95A5] uppercase tracking-wider">
                      ID Nhóm Zalo (Group ID / Grid)
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
                        className="flex-1 px-3 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] font-mono"
                      />
                    </div>

                    {/* Chọn nhanh từ các nhóm Zalo thực tế của bot */}
                    {isReady && groupsData && groupsData.length > 0 && (
                      <div className="pt-1">
                        <select
                          className="w-full px-3 py-1.5 rounded-xl bg-[#181B24] border border-[#212532] text-xs text-[#8E95A5] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
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
                    <label className="block text-xs font-semibold text-[#8E95A5] uppercase tracking-wider">
                      Mẫu Tin Nhắn Mặc Định
                    </label>
                    <textarea
                      rows={3}
                      value={channelConfig.defaultMessage || ''}
                      onChange={(e) =>
                        handleUpdateChannelField(channelType, 'defaultMessage', e.target.value)
                      }
                      placeholder="Nội dung mẫu tin nhắn tự động khi bắn vào nhóm này..."
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] resize-none leading-relaxed"
                    />
                  </div>

                  {/* Footer Card: Trạng thái gửi tin & Nút Gửi Test */}
                  <div className="pt-3 border-t border-[#212532] flex items-center justify-between gap-2">
                    <div className="text-[10px] text-[#6D7588]">
                      {channelConfig.lastSentAt ? (
                        <span className="text-emerald-400">
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isReady && channelConfig.targetId?.trim()
                          ? 'border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 active:scale-95'
                          : 'border border-[#212532] bg-[#181B24] text-[#6D7588] cursor-not-allowed'
                      }`}
                      title="Gửi ngay 1 tin nhắn thử nghiệm vào nhóm Zalo này"
                    >
                      <FaPaperPlane className={isTesting ? 'animate-bounce' : ''} />
                      {isTesting ? 'Đang Gửi...' : 'Gửi Thử Nghiệm'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Thanh Lưu Tổng Thể Cuối Trang */}
          <div className="rounded-2xl border border-[#212532] bg-[#12141A] p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-[#8E95A5]">
              <FaInfoCircle className="text-[#D4AF37] text-lg shrink-0" />
              <span>
                Cấu hình sẽ được lưu vào MongoDB Atlas và áp dụng ngay lập tức cho các sự kiện
                Điểm danh, Cảnh báo kho và Lịch tuần của chi nhánh <strong>{selectedStore.name}</strong>.
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveStoreChannels}
              disabled={updateChannelsMutation.isPending}
              className="px-6 py-3 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs uppercase tracking-wider gold-glow-sm hover:scale-[1.02] transition shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FaSave />
              {updateChannelsMutation.isPending ? 'Đang Lưu Dữ Liệu...' : 'Lưu Cấu Hình Cơ Sở'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
