'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { posService } from '../service/pos.service';
import { IVerifyShiftData, ILiveCartState, IPosCartItem } from '../type/pos.type';

export function useLivePos(shiftData: IVerifyShiftData | null, user: { userId: string; name: string } | null) {
  const [cart, setCart] = useState<ILiveCartState>({
    items: [],
    subtotal: 0,
    discount: 0,
    finalTotal: 0,
    tableNumber: '',
    customerName: 'Khách lẻ',
    lockedBy: null,
    lockedByName: null,
    lockedAt: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [activeStaff, setActiveStaff] = useState<Array<{ userId: string; name: string }>>([]);
  const socketRef = useRef<Socket | null>(null);

  // Khởi tạo kết nối Socket.io
  useEffect(() => {
    if (!shiftData || !user) return;

    // Xác định URL Socket.io (Ưu tiên biến môi trường Backend VPS, fallback về window.location.origin)
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    const socket = io(`${socketUrl}/pos`, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('pos:join', {
        sessionCode: shiftData.sessionCode,
        storeId: shiftData.storeId,
        shiftId: shiftData.shiftId,
        user: { userId: user.userId, name: user.name },
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Đồng bộ ban đầu khi vừa vào phòng
    socket.on('pos:sync_initial', (data: { cart: ILiveCartState }) => {
      if (data.cart) {
        setCart(data.cart);
      }
    });

    // Nhân viên khác vừa vào phòng
    socket.on('pos:staff_joined', (data: { user: { name: string } }) => {
      toast.info(`🟢 ${data.user.name} vừa tham gia ca trực`, { duration: 3000 });
    });

    // Giỏ hàng được cập nhật bởi đồng nghiệp
    socket.on('pos:cart_updated', (data: { cart: ILiveCartState; actionUser: { name: string } }) => {
      setCart(data.cart);
      toast.success(`⚡ ${data.actionUser.name} vừa cập nhật giỏ hàng`, { duration: 2500 });
    });

    // Trạng thái khóa thanh toán thay đổi
    socket.on('pos:cart_lock_changed', (data: { isLocked: boolean; lockedBy: string | null; lockedByName: string | null }) => {
      setCart((prev) => ({
        ...prev,
        lockedBy: data.lockedBy,
        lockedByName: data.lockedByName,
      }));

      if (data.isLocked && data.lockedBy !== user.userId) {
        toast.warning(`🔒 ${data.lockedByName || 'Đồng nghiệp'} đang tiến hành thanh toán đơn hàng này.`);
      } else if (!data.isLocked) {
        toast.info('🔓 Đơn hàng đã được mở khóa chỉnh sửa.');
      }
    });

    // Đơn hàng thanh toán hoàn tất
    socket.on('pos:order_completed', (data: { order: any; completedBy: { name: string } }) => {
      setCart({
        items: [],
        subtotal: 0,
        discount: 0,
        finalTotal: 0,
        tableNumber: '',
        customerName: 'Khách lẻ',
        lockedBy: null,
        lockedByName: null,
        lockedAt: null,
      });

      toast.success(
        `🎉 Đơn hàng ${data.order?.order_code || ''} (${Number(data.order?.final_amount || 0).toLocaleString()}đ) đã được ${data.completedBy.name} thanh toán thành công!`,
        { duration: 5000 }
      );
    });

    socket.on('pos:error', (data: { message: string }) => {
      toast.error(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [shiftData, user]);

  // Cập nhật giỏ hàng lên server và phát socket
  const syncCartToServer = useCallback(
    async (newItems: IPosCartItem[], tableNumber?: string, customerName?: string, discount?: number) => {
      if (!shiftData || !user) return;

      const subtotal = newItems.reduce((acc, it) => acc + it.subtotal, 0);
      const finalDiscount = discount ?? cart.discount;
      const finalTotal = Math.max(0, subtotal - finalDiscount);

      const updatedCart: ILiveCartState = {
        ...cart,
        items: newItems,
        subtotal,
        discount: finalDiscount,
        finalTotal,
        tableNumber: tableNumber ?? cart.tableNumber,
        customerName: customerName ?? cart.customerName,
      };

      // Optimistic update
      setCart(updatedCart);

      // Phát qua Socket nếu đã kết nối
      if (socketRef.current?.connected) {
        socketRef.current.emit('pos:cart_update', {
          sessionCode: shiftData.sessionCode,
          items: newItems,
          tableNumber: updatedCart.tableNumber,
          customerName: updatedCart.customerName,
          discount: finalDiscount,
          user: { userId: user.userId, name: user.name },
        });
      } else {
        // Fallback qua REST API nếu socket rớt
        try {
          await posService.updateCart({
            sessionCode: shiftData.sessionCode,
            items: newItems,
            tableNumber: updatedCart.tableNumber,
            customerName: updatedCart.customerName,
            discount: finalDiscount,
          });
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Cập nhật giỏ hàng thất bại');
        }
      }
    },
    [shiftData, user, cart]
  );

  // Thêm món vào giỏ hàng
  const addItem = useCallback(
    (recipe: any, toppings: Array<{ name: string; price: number }> = [], notes: string = '') => {
      if (cart.lockedBy && cart.lockedBy !== user?.userId) {
        toast.error(`Đơn hàng đang bị khóa bởi ${cart.lockedByName}. Bạn không thể thêm món lúc này.`);
        return;
      }

      const toppingTotal = toppings.reduce((sum, t) => sum + t.price, 0);
      const unitPrice = recipe.selling_price || 0;
      const subtotal = unitPrice + toppingTotal;

      const newItem: IPosCartItem = {
        recipeId: recipe._id || recipe.id,
        name: recipe.name,
        quantity: 1,
        unitPrice,
        subtotal,
        toppings,
        notes,
        addedById: user?.userId,
        addedByName: user?.name,
      };

      // Kiểm tra món đã có trong giỏ chưa (cùng recipeId, toppings và notes)
      const existingIndex = cart.items.findIndex(
        (it) =>
          it.recipeId === newItem.recipeId &&
          JSON.stringify(it.toppings || []) === JSON.stringify(newItem.toppings || []) &&
          (it.notes || '') === (newItem.notes || '')
      );

      let newItems: IPosCartItem[];
      if (existingIndex > -1) {
        newItems = [...cart.items];
        const cur = newItems[existingIndex];
        const newQty = cur.quantity + 1;
        newItems[existingIndex] = {
          ...cur,
          quantity: newQty,
          subtotal: (cur.unitPrice + toppingTotal) * newQty,
        };
      } else {
        newItems = [...cart.items, newItem];
      }

      syncCartToServer(newItems);
    },
    [cart, user, syncCartToServer]
  );

  // Tăng giảm số lượng món
  const updateQuantity = useCallback(
    (index: number, quantity: number) => {
      if (cart.lockedBy && cart.lockedBy !== user?.userId) {
        toast.error(`Đơn hàng đang bị khóa bởi ${cart.lockedByName}.`);
        return;
      }

      let newItems = [...cart.items];
      if (quantity <= 0) {
        newItems.splice(index, 1);
      } else {
        const item = newItems[index];
        const toppingTotal = (item.toppings || []).reduce((sum, t) => sum + t.price, 0);
        newItems[index] = {
          ...item,
          quantity,
          subtotal: (item.unitPrice + toppingTotal) * quantity,
        };
      }

      syncCartToServer(newItems);
    },
    [cart, user, syncCartToServer]
  );

  // Xóa toàn bộ giỏ hàng
  const clearCart = useCallback(() => {
    syncCartToServer([]);
  }, [syncCartToServer]);

  // Khóa / Mở khóa đơn hàng khi thanh toán
  const setLockForPayment = useCallback(
    (isLocked: boolean) => {
      if (!shiftData || !user) return;

      if (socketRef.current?.connected) {
        socketRef.current.emit('pos:cart_lock', {
          sessionCode: shiftData.sessionCode,
          isLocked,
          user: { userId: user.userId, name: user.name },
        });
      }

      setCart((prev) => ({
        ...prev,
        lockedBy: isLocked ? user.userId : null,
        lockedByName: isLocked ? user.name : null,
      }));
    },
    [shiftData, user]
  );

  // Thông báo thanh toán hoàn tất
  const notifyOrderCompleted = useCallback(
    (order: any) => {
      if (!shiftData || !user) return;
      if (socketRef.current?.connected) {
        socketRef.current.emit('pos:order_completed', {
          sessionCode: shiftData.sessionCode,
          order,
          user: { userId: user.userId, name: user.name },
        });
      }
    },
    [shiftData, user]
  );

  return {
    cart,
    isConnected,
    activeStaff,
    addItem,
    updateQuantity,
    clearCart,
    setLockForPayment,
    notifyOrderCompleted,
    syncCartToServer,
  };
}

