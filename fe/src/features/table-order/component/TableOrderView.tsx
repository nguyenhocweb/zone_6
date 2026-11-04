'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { tableOrderService } from '../service/table-order.service';
import { TableVerifyResponse, TableCartItem, TableOrderResult } from '../type/table-order.type';
import { GeofenceGuard } from './GeofenceGuard';
import { CustomerMenu } from './CustomerMenu';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { CustomerCartDrawer } from './CustomerCartDrawer';
import { TableVietQrModal } from './TableVietQrModal';
import { getOrCreateDeviceId, detectDeviceName } from '../utils/device-info';
import { FaQrcode, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export const TableOrderView: React.FC = () => {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  const [activeToken, setActiveToken] = useState<string>(urlToken);
  const [isLoading, setIsLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [verifyData, setVerifyData] = useState<TableVerifyResponse | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<TableCartItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<TableOrderResult | null>(null);

  const verifyLocationAndLoadData = useCallback(() => {
    if (!activeToken) {
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setIsLoading(false);
      setGpsError('Trình duyệt của bạn không hỗ trợ định vị GPS!');
      return;
    }

    setIsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const verifyRes = await tableOrderService.verifyTable(activeToken, lat, lng);
          setVerifyData(verifyRes);

          // Tải danh mục và menu
          const [catRes, menuRes] = await Promise.all([
            tableOrderService.getCategories(),
            tableOrderService.getMenu(verifyRes.store?.id),
          ]);
          setCategories(catRes);
          setRecipes(menuRes);
        } catch (err: any) {
          const msg = err.response?.data?.message || err.message || 'Lỗi xác thực bàn';
          toast.error(msg);
          setGpsError(msg);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép định vị GPS trên trình duyệt để chống đặt đơn từ xa.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('Không thể xác định vị trí hiện tại. Vui lòng bật GPS trên thiết bị.');
        } else {
          setGpsError('Hết thời gian chờ phản hồi GPS. Vui lòng bấm thử lại.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [activeToken]);

  useEffect(() => {
    if (activeToken) {
      verifyLocationAndLoadData();
    }
  }, [activeToken, verifyLocationAndLoadData]);

  const handleAddToCart = (item: TableCartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.recipeId === item.recipeId &&
          i.name === item.name &&
          i.sugarLevel === item.sugarLevel &&
          i.iceLevel === item.iceLevel &&
          JSON.stringify(i.toppings || []) === JSON.stringify(item.toppings || [])
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        updated[existingIdx].subtotal = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
        return updated;
      }
      return [...prev, item];
    });
    toast.success(`Đã thêm "${item.name}" vào giỏ!`);
  };

  const handleUpdateQuantity = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(idx);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[idx].quantity = newQty;
      updated[idx].subtotal = newQty * updated[idx].unitPrice;
      return updated;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitOrder = async (
    customerName: string,
    customerPhone: string,
    paymentMethod: 'VIETQR' | 'CASH'
  ) => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng đang trống!');
      return;
    }
    if (!coords) {
      toast.error('Chưa có tọa độ GPS để xác thực vị trí!');
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    setIsSubmitting(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const deviceName = detectDeviceName();

      const result = await tableOrderService.submitOrder({
        token: activeToken,
        customerLat: coords.lat,
        customerLng: coords.lng,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        deviceId,
        deviceName,
        items: cartItems.map((item) => ({
          recipeId: item.recipeId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          toppings: item.toppings,
          notes: item.notes,
        })),
        totalAmount: total,
        discountAmount: 0,
        finalAmount: total,
        paymentMethod,
      });

      setSubmittedOrder(result);
      setCartItems([]);

      if (paymentMethod === 'CASH') {
        toast.success(`🎉 Đã gửi đơn ${result.orderCode}! Nhân viên sẽ tới bàn thu tiền mặt.`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi đặt món';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // KHI KHÁCH CHƯA QUÉT MÃ QR TRÊN BÀN: Khóa truy cập, yêu cầu quét mã QR Standee mica tại bàn
  if (!activeToken) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-[#f4f5f8] flex flex-col items-center justify-center p-4 sm:p-6 text-center selection:bg-[#d4af37] selection:text-black">
        <div className="max-w-md w-full bg-[#12141a] border border-[#212532] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-[#d4af37]/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#906b18]/10 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] text-2xl mx-auto shadow-lg shadow-[#d4af37]/10">
            <FaQrcode />
          </div>

          <div className="space-y-2">
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              Yêu Cầu Quét Mã QR Tại Bàn
            </h1>
            <p className="text-xs text-[#a0a5b5] leading-relaxed">
              Trang gọi món chỉ mở khi bạn quét mã QR Standee mica được đặt trực tiếp trên bàn tại quán Zone Six.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#181b24] border border-[#212532] text-left space-y-3 text-xs text-[#a0a5b5]">
            <div className="text-white font-bold text-xs uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
              <span>Quy trình tự gọi món:</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>Mở ứng dụng <strong>Camera</strong> hoặc <strong>Zalo</strong> trên điện thoại.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>Hướng máy ảnh quét mã QR trên tấm <strong>Standee Mica</strong> đặt trên bàn bạn đang ngồi.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>Chạm vào liên kết hiển thị để tự động mở thực đơn và gọi món phục vụ tận nơi.</span>
            </div>
          </div>

          <Link
            href="/"
            className="w-full py-3.5 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-[#d4af37] to-[#b58d22] text-[#0b0c10] uppercase tracking-wider hover:brightness-110 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#d4af37]/15"
          >
            <FaArrowLeft className="text-xs" />
            <span>Quay Lại Trang Chủ Zone Six</span>
          </Link>
        </div>

        <div className="text-center text-[11px] text-[#6c7280] pt-6 pb-2">
          Zone Six Signature © 2026 • Trải nghiệm dịch vụ số hóa tại bàn
        </div>
      </div>
    );
  }

  const tableName = verifyData?.table?.table_number
    ? `Bàn ${verifyData.table.table_number}`
    : 'Bàn Của Bạn';
  const zoneName = verifyData?.table?.zone_name || 'Khu Vực Quán';
  const storeName = verifyData?.store?.store_name || 'Zone Six';

  return (
    <GeofenceGuard
      isLoading={isLoading}
      gpsError={gpsError}
      isValidLocation={verifyData?.is_inside ?? false}
      distanceMeters={verifyData?.distance_meters ?? 0}
      allowedRadiusMeters={verifyData?.allowed_radius_meters ?? 30}
      orderingModeAllowed={verifyData?.allow_ordering ?? false}
      tableName={tableName}
      zoneName={zoneName}
      storeName={storeName}
      onRetry={verifyLocationAndLoadData}
    >
      {/* Menu Catalog */}
      <CustomerMenu
        categories={categories}
        recipes={recipes}
        onSelectItem={(item) => setSelectedRecipe(item)}
      />

      {/* Floating Bottom Cart Drawer */}
      <CustomerCartDrawer
        items={cartItems}
        tableName={tableName}
        distanceMeters={verifyData?.distance_meters}
        isSubmitting={isSubmitting}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Item Customizer Modal */}
      <ItemCustomizerModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onAddToCart={handleAddToCart}
      />

      {/* VietQR Modal */}
      <TableVietQrModal
        order={submittedOrder}
        onClose={() => setSubmittedOrder(null)}
        onCompleted={() => {
          setSubmittedOrder(null);
          toast.success('🎉 Chúc bạn thưởng thức đồ uống ngon miệng!');
        }}
      />
    </GeofenceGuard>
  );
};
