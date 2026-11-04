'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { tableOrderService, IPublicStoreTables } from '../service/table-order.service';
import { TableVerifyResponse, TableCartItem, TableOrderResult } from '../type/table-order.type';
import { GeofenceGuard } from './GeofenceGuard';
import { CustomerMenu } from './CustomerMenu';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { CustomerCartDrawer } from './CustomerCartDrawer';
import { TableVietQrModal } from './TableVietQrModal';
import { getOrCreateDeviceId, detectDeviceName } from '../utils/device-info';
import { FaChair, FaMapMarkerAlt, FaStore, FaQrcode, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export const TableOrderView: React.FC = () => {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  const [activeToken, setActiveToken] = useState<string>(urlToken);
  const [isLoading, setIsLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [verifyData, setVerifyData] = useState<TableVerifyResponse | null>(null);

  // Danh sách cơ sở & bàn công khai nếu khách chưa quét mã QR
  const [publicStores, setPublicStores] = useState<IPublicStoreTables[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState<number>(0);
  const [isStoreLoading, setIsStoreLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<TableCartItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<TableOrderResult | null>(null);

  // Nếu không có token trong URL, tải danh sách bàn công khai
  useEffect(() => {
    if (!activeToken) {
      setIsStoreLoading(true);
      tableOrderService
        .getPublicStoresAndTables()
        .then((res) => {
          setPublicStores(res);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        })
        .finally(() => {
          setIsStoreLoading(false);
        });
    }
  }, [activeToken]);

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

  // MÀN HÌNH CHỌN BÀN THỦ CÔNG (Khi khách chưa quét mã QR trên bàn)
  if (!activeToken) {
    const currentStore = publicStores[selectedStoreIndex];
    return (
      <div className="min-h-screen bg-[#0b0c10] text-[#f4f5f8] flex flex-col justify-between p-4 sm:p-6">
        <div className="max-w-xl mx-auto w-full space-y-6 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#a0a5b5] hover:text-[#d4af37] transition"
            >
              <FaArrowLeft />
              <span>Về Trang Chủ</span>
            </Link>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
              SELF-ORDERING
            </span>
          </div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#906b18] flex items-center justify-center text-black font-extrabold text-xl shadow-xl shadow-[#d4af37]/20">
              Z6
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Gọi Món Trực Tiếp Tại Bàn
            </h1>
            <p className="text-xs text-[#a0a5b5] max-w-md mx-auto leading-relaxed">
              Quét mã QR Standee mica trên bàn của bạn, hoặc chọn chi nhánh và số bàn bên dưới để xem thực đơn & gọi món ngay không cần đăng nhập.
            </p>
          </div>

          {/* Chọn Cơ Sở */}
          {publicStores.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#fae29c] flex items-center gap-1.5 uppercase tracking-wider">
                <FaStore /> Chọn Cơ Sở Quán
              </label>
              <div className="grid grid-cols-2 gap-2">
                {publicStores.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStoreIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedStoreIndex === idx
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-md shadow-[#d4af37]/10'
                        : 'bg-[#12141a] border-[#212532] text-[#a0a5b5] hover:border-[#2f3546]'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{st.name}</div>
                    <div className="text-[10px] text-[#6c7280] truncate mt-0.5">{st.address}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Danh Sách Bàn Của Cơ Sở */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#fae29c] flex items-center gap-1.5 uppercase tracking-wider">
                <FaChair /> Bạn Đang Ngồi Bàn Nào?
              </label>
              {currentStore && (
                <span className="text-[11px] text-[#a0a5b5] flex items-center gap-1">
                  <FaMapMarkerAlt className="text-[#d4af37]" />
                  {currentStore.name}
                </span>
              )}
            </div>

            {isStoreLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-[#12141a] border border-[#212532] animate-pulse" />
                ))}
              </div>
            ) : !currentStore || currentStore.tables.length === 0 ? (
              <div className="p-8 text-center bg-[#12141a] border border-[#212532] rounded-2xl text-[#a0a5b5] text-xs space-y-2">
                <FaQrcode className="text-3xl mx-auto text-[#444b60]" />
                <p>Chưa có bàn nào trong cơ sở này hoặc hệ thống đang bảo trì.</p>
                <p className="text-[11px] text-[#6c7280]">Vui lòng quét trực tiếp mã QR Standee mica tại bàn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {currentStore.tables.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveToken(t.qrToken);
                    }}
                    className="p-3 rounded-2xl bg-[#12141a] hover:bg-[#181b24] border border-[#212532] hover:border-[#d4af37] text-center transition flex flex-col items-center justify-center gap-1 group active:scale-95 cursor-pointer shadow-sm"
                  >
                    <span className="text-xs font-black text-white group-hover:text-[#fae29c]">
                      Bàn {t.tableNumber}
                    </span>
                    <span className="text-[10px] text-[#a0a5b5] font-medium truncate max-w-full">
                      {t.zoneName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-[#6c7280] pt-6 pb-2">
          Zone Six Signature © 2026 • Đặt món tự động được bảo vệ bởi GPS Geofence
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
