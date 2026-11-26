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
import { DesktopOrderCart } from './DesktopOrderCart';
import { TableVietQrModal } from './TableVietQrModal';
import { TableCashBillModal } from './TableCashBillModal';
import { ScanQrPrompt } from './ScanQrPrompt';
import { getOrCreateDeviceId, detectDeviceName } from '../utils/device-info';

export const TableOrderView: React.FC = () => {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  const [activeToken] = useState<string>(urlToken);
  const [isLoading, setIsLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [verifyData, setVerifyData] = useState<TableVerifyResponse | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<TableCartItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vietQrOrder, setVietQrOrder] = useState<TableOrderResult | null>(null);
  const [cashBillOrder, setCashBillOrder] = useState<TableOrderResult | null>(null);

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

          const [catRes, menuRes, toppingsRes] = await Promise.all([
            tableOrderService.getCategories(),
            tableOrderService.getMenu(verifyRes.store?.id),
            tableOrderService.getToppings(verifyRes.store?.id),
          ]);
          const safeCatList = Array.isArray(catRes)
            ? catRes
            : (catRes as any)?.categories || [];
          const safeMenuList = Array.isArray(menuRes)
            ? menuRes
            : (menuRes as any)?.recipes || [];

          setCategories(safeCatList);
          setRecipes(safeMenuList);
          setToppings(toppingsRes || []);
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
      setCartItems((prev) => prev.filter((_, i) => i !== idx));
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

      setCartItems([]);
      if (paymentMethod === 'VIETQR') {
        setVietQrOrder(result);
      } else {
        setCashBillOrder(result);
        toast.info(`Phiếu thanh toán đơn #${result.orderCode} đã tạo. Vui lòng đến quầy thanh toán tiền mặt!`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi đặt món';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeToken) {
    return <ScanQrPrompt />;
  }

  const tableName = verifyData?.table?.table_number
    ? `Bàn ${verifyData.table.table_number}`
    : 'Bàn Của Bạn';
  const zoneName = verifyData?.table?.zone_name || 'Khu Vực Quán';
  const storeName = verifyData?.store?.store_name || 'Go Cà Phê';

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
      {/* Main 2-Column Desktop & Mobile Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-7 items-start">
          {/* Cột Trái: Thực đơn & Danh mục */}
          <main className="flex-1 min-w-0 w-full">
            <CustomerMenu
              categories={categories}
              recipes={recipes}
              onSelectItem={(item) => setSelectedRecipe(item)}
            />
          </main>

          {/* Cột Phải: Giỏ Hàng Desktop */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 hidden lg:block">
            <DesktopOrderCart
              items={cartItems}
              tableName={tableName}
              zoneName={zoneName}
              distanceMeters={verifyData?.distance_meters}
              isSubmitting={isSubmitting}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={() => setCartItems([])}
              onSubmitOrder={handleSubmitOrder}
            />
          </div>
        </div>
      </div>

      {/* Floating Bottom Cart Drawer (Mobile < lg) */}
      <div className="lg:hidden">
        <CustomerCartDrawer
          items={cartItems}
          tableName={tableName}
          distanceMeters={verifyData?.distance_meters}
          isSubmitting={isSubmitting}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onSubmitOrder={handleSubmitOrder}
        />
      </div>

      {/* Item Customizer Modal */}
      <ItemCustomizerModal
        recipe={selectedRecipe}
        availableToppings={toppings}
        onClose={() => setSelectedRecipe(null)}
        onAddToCart={handleAddToCart}
      />

      {/* VietQR Dynamic Modal */}
      <TableVietQrModal
        order={vietQrOrder}
        onClose={() => setVietQrOrder(null)}
        onCompleted={() => {
          setVietQrOrder(null);
          toast.success('🎉 Chúc bạn thưởng thức đồ uống ngon miệng!');
        }}
      />

      {/* Cash Bill Modal (Thanh toán tiền mặt tại quầy + Đếm ngược 30 phút) */}
      <TableCashBillModal
        order={cashBillOrder}
        onClose={() => setCashBillOrder(null)}
        onCompleted={() => {
          setCashBillOrder(null);
          toast.success('🎉 Đã xác nhận thanh toán! Đồ uống đang được pha chế.');
        }}
        onReorder={() => setCashBillOrder(null)}
      />
    </GeofenceGuard>
  );
};
