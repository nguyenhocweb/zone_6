'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { posService } from '@/features/pos/service/pos.service';
import { useLivePos } from '@/features/pos/hook/useLivePos';
import { IVerifyShiftData, IOrderRecord } from '@/features/pos/type/pos.type';
import { PosHeader } from '@/features/pos/component/PosHeader';
import { MenuCatalog } from '@/features/pos/component/MenuCatalog';
import { LiveCart } from '@/features/pos/component/LiveCart';
import { VietQrModal } from '@/features/pos/component/VietQrModal';
import { OrderHistoryModal } from '@/features/pos/component/OrderHistoryModal';
import { ConfirmModal } from '@/core/components/ui/ConfirmModal';
import { useTables } from '@/features/admin_he_thong/table/hook/useTables';
import { useTableSocket } from '@/features/admin_he_thong/table/hook/useTableSocket';
import { FiLock, FiCamera, FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { toast } from 'sonner';

export default function PosPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [shiftData, setShiftData] = useState<IVerifyShiftData | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [recipes, setRecipes] = useState<any[]>([]);
  const [isRecipesLoading, setIsRecipesLoading] = useState(false);
  const [toppings, setToppings] = useState<any[]>([]);

  const [historyOrders, setHistoryOrders] = useState<IOrderRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Modal VietQR
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  // Modal Tiền Mặt (ConfirmModal chuẩn Obsidian Gold)
  const [isCashConfirmOpen, setIsCashConfirmOpen] = useState(false);
  const [orderCodePreview, setOrderCodePreview] = useState('');
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<'VIETQR' | 'CASH'>('VIETQR');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Memoize liveUser để tránh re-create object mỗi render gây đứt kết nối Socket
  const liveUser = React.useMemo(() => {
    if (!user) return null;
    return {
      userId: user.id || (user as any)._id || '',
      name: user.name || (user as any).username || 'Nhân viên',
    };
  }, [user?.id, (user as any)?._id, user?.name, (user as any)?.username]);

  // Lấy danh sách bàn theo cơ sở của ca trực
  const { data: storeTables = [] } = useTables(
    shiftData?.storeId ? { store_id: shiftData.storeId } : undefined
  );

  // Lắng nghe cập nhật trạng thái bàn thời gian thực từ Socket
  useTableSocket(shiftData?.storeId, liveUser || undefined);

  // Hook Live POS đồng bộ WebSocket
  const {
    cart,
    isConnected,
    addItem,
    updateQuantity,
    clearCart,
    setLockForPayment,
    notifyOrderCompleted,
    syncCartToServer,
  } = useLivePos(shiftData, liveUser);

  // 1. Kiểm tra điều kiện ca trực & điểm danh
  const checkShiftAccess = async () => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const data = await posService.verifyShift();
      setShiftData(data);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        'Bạn không có quyền truy cập màn hình POS lúc này do chưa có ca trực hợp lệ.';
      setVerifyError(errMsg);
      setShiftData(null);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkShiftAccess();
    }
  }, [user]);

  // 2. Tải danh mục món & Topping thật từ database khi đã xác thực ca thành công
  useEffect(() => {
    if (shiftData?.storeId) {
      setIsRecipesLoading(true);
      posService
        .getRecipes(shiftData.storeId)
        .then((data) => {
          if (Array.isArray(data)) {
            setRecipes(data);
          } else if (data && Array.isArray((data as any).recipes)) {
            setRecipes((data as any).recipes);
          } else {
            setRecipes([]);
          }
        })
        .catch(() => {
          toast.error('Không thể tải thực đơn món');
          setRecipes([]);
        })
        .finally(() => setIsRecipesLoading(false));

      posService
        .getToppings(shiftData.storeId)
        .then((data) => {
          setToppings(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setToppings([]);
        });
    }
  }, [shiftData?.storeId]);

  // 3. Mở thanh toán (Tiền mặt hoặc VietQR)
  const handleOpenCheckout = (method: 'VIETQR' | 'CASH') => {
    const items = cart?.items || [];
    if (items.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 món để thanh toán.');
      return;
    }

    setPendingPaymentMethod(method);
    setLockForPayment(true);
    setOrderCodePreview(`Z6-POS-${Date.now().toString().slice(-6)}`);

    if (method === 'VIETQR') {
      setIsQrModalOpen(true);
    } else {
      // Mở modal xác nhận tiền mặt chuẩn giao diện Obsidian Gold
      setIsCashConfirmOpen(true);
    }
  };

  // 4. Xác nhận hoàn tất thanh toán
  const handleConfirmPayment = async (method: 'VIETQR' | 'CASH') => {
    if (!shiftData || !user) return;
    setIsCheckingOut(true);

    try {
      const newOrder = await posService.checkoutOrder({
        storeId: shiftData.storeId,
        shiftId: shiftData.shiftId,
        sessionCode: shiftData.sessionCode,
        tableNumber: cart.tableNumber,
        customerName: cart.customerName,
        items: cart.items,
        totalAmount: cart.subtotal,
        discountAmount: cart.discount,
        finalAmount: cart.finalTotal,
        paymentMethod: method,
      });

      // Phát sự kiện hoàn tất đơn cho tất cả đồng nghiệp trong ca
      notifyOrderCompleted(newOrder);

      // Đóng modal
      setIsQrModalOpen(false);
      setLockForPayment(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thanh toán đơn hàng thất bại');
      setLockForPayment(false);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // 5. Mở lịch sử đơn hàng
  const handleOpenHistory = async () => {
    if (!shiftData?.storeId) return;
    setIsHistoryOpen(true);
    setIsHistoryLoading(true);
    try {
      const list = await posService.getOrderHistory(shiftData.storeId);
      setHistoryOrders(list);
    } catch {
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Trạng thái đang tải xác thực
  if (isAuthLoading || isVerifying) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-[#0b0c10] text-[#a0a5b5] p-6">
        <FiRefreshCw className="w-10 h-10 animate-spin text-[#d4af37] mb-4" />
        <p className="text-sm font-semibold text-white">
          Đang kiểm tra ca trực & trạng thái điểm danh...
        </p>
        <p className="text-xs text-[#6c7280] mt-1">
          Hệ thống đối chiếu lịch ca và định vị GPS thực tế
        </p>
      </div>
    );
  }

  // Trạng thái BỊ CHẶN TRUY CẬP (Shift Gatekeeper Blocked)
  if (verifyError || !shiftData) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-[#0b0c10] p-6">
        <div className="w-full max-w-md bg-[#12141a] border border-[#212532] rounded-3xl p-8 text-center shadow-2xl shadow-red-500/5">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/10">
            <FiLock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-white mb-2">
            Truy Cập POS Bị Khóa
          </h2>

          <div className="p-4 rounded-xl bg-[#181b24] border border-[#212532] text-xs text-[#a0a5b5] text-left space-y-2 mb-6">
            <div className="flex items-start gap-2 text-amber-300">
              <FiAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{verifyError}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/checkin"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#d4af37] to-[#b58d22] text-[#0b0c10] hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiCamera className="w-4 h-4" />
              <span>ĐIỂM DANH CHECK-IN NGAY</span>
            </Link>

            <button
              onClick={checkShiftAccess}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-[#181b24] hover:bg-[#212532] text-white border border-[#212532] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiRefreshCw className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Thử kiểm tra lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Thông tin user hiện tại
  const currentUserId = user?.id || (user as any)?._id || '';
  const effectiveOrderCode = orderCodePreview || 'Z6-POS-ORDER';

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-[#0b0c10]">
      {/* Header POS */}
      <PosHeader
        shiftData={shiftData}
        isConnected={isConnected}
        onOpenHistory={handleOpenHistory}
      />

      {/* Main 2-Column POS Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Cột trái: Danh mục thực đơn món (65%) */}
        <div className="flex-1 flex flex-col min-w-0">
          <MenuCatalog
            recipes={recipes}
            isLoading={isRecipesLoading}
            availableToppings={toppings}
            onAddItem={addItem}
            disabled={!!cart.lockedBy && cart.lockedBy !== currentUserId}
          />
        </div>

        {/* Cột phải: Giỏ hàng trực tiếp Live Cart (35%) */}
        <div className="w-full sm:w-[380px] lg:w-[420px] shrink-0 h-full">
          <LiveCart
            cart={cart}
            currentUserId={currentUserId}
            tables={storeTables}
            onUpdateQuantity={updateQuantity}
            onClearCart={clearCart}
            onOpenCheckout={handleOpenCheckout}
            onTableChange={(tableNumber) =>
              syncCartToServer(cart.items, tableNumber, cart.customerName, cart.discount)
            }
            onCustomerNameChange={(customerName) =>
              syncCartToServer(cart.items, cart.tableNumber, customerName, cart.discount)
            }
          />
        </div>
      </div>

      {/* Modal Quét VietQR Động */}
      <VietQrModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setLockForPayment(false);
        }}
        totalAmount={cart?.finalTotal || 0}
        orderCode={effectiveOrderCode}
        tableNumber={cart?.tableNumber}
        onConfirmSuccess={() => handleConfirmPayment('VIETQR')}
        isSubmitting={isCheckingOut}
      />

      {/* Modal Lịch Sử Đơn Hàng */}
      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={historyOrders}
        isLoading={isHistoryLoading}
      />

      {/* Modal Xác Nhận Thanh Toán Tiền Mặt chuẩn Obsidian Gold (Không dùng popup mặc định trình duyệt) */}
      <ConfirmModal
        isOpen={isCashConfirmOpen}
        title="Xác Nhận Thu TIỀN MẶT"
        message={
          <div className="space-y-3.5">
            <p className="text-sm text-[#a0a5b5]">
              Xác nhận thu tiền mặt từ khách hàng cho đơn{' '}
              <span className="text-[#d4af37] font-bold">{effectiveOrderCode}</span>:
            </p>
            <div className="p-4 rounded-2xl bg-[#181b24] border border-[#d4af37]/30 flex items-center justify-between shadow-inner">
              <span className="text-xs text-[#a0a5b5] uppercase font-bold tracking-wider">
                Tổng tiền cần thu:
              </span>
              <span className="text-2xl font-black text-[#d4af37]">
                {(cart?.finalTotal || 0).toLocaleString()} VNĐ
              </span>
            </div>
            <div className="text-xs text-[#8e95a5] flex justify-between items-center px-1">
              <span>Bàn phục vụ: <strong className="text-white">{cart?.tableNumber || 'Mang về / Tại quầy'}</strong></span>
              <span>Khách hàng: <strong className="text-white">{cart?.customerName || 'Khách lẻ'}</strong></span>
            </div>
          </div>
        }
        confirmLabel="💵 Xác Nhận Đã Thu Tiền"
        cancelLabel="Hủy Bỏ"
        isLoading={isCheckingOut}
        onConfirm={() => {
          setIsCashConfirmOpen(false);
          handleConfirmPayment('CASH');
        }}
        onCancel={() => {
          setIsCashConfirmOpen(false);
          setLockForPayment(false);
        }}
      />
    </div>
  );
}
