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

export const TableOrderView: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

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
    if (!token) {
      setIsLoading(false);
      setGpsError('Thiếu mã QR bàn (token). Vui lòng quét lại mã QR tại bàn của bạn!');
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
          const verifyRes = await tableOrderService.verifyTable(token, lat, lng);
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
          setGpsError('Bạn đã từ chối quyền truy cập vị trí. Hệ thống cần định vị để chống đặt đơn từ xa.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('Không thể xác định vị trí hiện tại. Vui lòng bật GPS trên thiết bị.');
        } else {
          setGpsError('Hết thời gian chờ phản hồi GPS. Vui lòng bấm thử lại.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [token]);

  useEffect(() => {
    verifyLocationAndLoadData();
  }, [verifyLocationAndLoadData]);

  const handleAddToCart = (item: TableCartItem) => {
    setCartItems((prev) => {
      // Nếu trùng recipeId, size, sugar, ice thì tăng số lượng
      const existingIdx = prev.findIndex(
        (i) =>
          i.recipeId === item.recipeId &&
          i.name === item.name &&
          i.sugarLevel === item.sugarLevel &&
          i.iceLevel === item.iceLevel
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        updated[existingIdx].subtotal = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
        return updated;
      }
      return [...prev, item];
    });
    toast.success(`Đã thêm ${item.name} vào giỏ!`);
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

  const handleSubmitOrder = async (customerName: string, paymentMethod: 'VIETQR' | 'CASH') => {
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
      const result = await tableOrderService.submitOrder({
        token,
        customerLat: coords.lat,
        customerLng: coords.lng,
        customerName: customerName.trim() || undefined,
        items: cartItems.map((item) => ({
          recipeId: item.recipeId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
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
          toast.success('Chúc bạn thưởng thức đồ uống ngon miệng!');
        }}
      />
    </GeofenceGuard>
  );
};

