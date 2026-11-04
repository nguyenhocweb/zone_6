import { Server, Socket } from 'socket.io';
import { logger } from '../../../core/logger.js';
import { PosSessionRepository } from '../repositories/pos-session.repository.js';
import { PosCartUpdateService } from '../services/pos-cart.update.service.js';

let posNamespaceInstance: any = null;

export function emitPosEvent(storeId: string, event: string, data: any) {
  if (posNamespaceInstance) {
    posNamespaceInstance.emit(event, { ...data, storeId });
  }
}

export function setupPosSocket(io: Server) {
  const sessionRepo = new PosSessionRepository();
  const cartUpdateService = new PosCartUpdateService();

  const posNamespace = io.of('/pos');
  posNamespaceInstance = posNamespace;

  posNamespace.on('connection', (socket: Socket) => {
    logger.info(`[POS Socket] Client kết nối: ${socket.id}`);

    let currentRoom: string | null = null;
    let currentUser: { userId: string; name: string } | null = null;

    // 1. Gia nhập phòng ca trực
    socket.on('pos:join', async (data: {
      sessionCode: string;
      storeId: string;
      shiftId: string;
      user: { userId: string; name: string };
    }) => {
      try {
        const { sessionCode, storeId, shiftId, user } = data;
        currentRoom = `pos_${sessionCode}`;
        currentUser = user;

        socket.join(currentRoom);
        logger.info(`[POS Socket] ${user?.name || 'Nhân viên'} (${user?.userId}) gia nhập phòng ${currentRoom}`);

        // Đảm bảo phiên làm việc POS tồn tại trong Database
        const session = await sessionRepo.findOrCreateSession(storeId, shiftId, sessionCode);

        // Ghi nhận nhân viên đang active
        if (user?.userId) {
          await sessionRepo.addActiveStaff(sessionCode, user.userId);
        }

        // Báo cho người vừa vào thông tin giỏ hàng hiện tại
        socket.emit('pos:sync_initial', {
          cart: session?.current_cart,
          activeStaffIds: session?.active_staff_ids || [],
        });

        // Báo cho những người khác trong phòng biết có đồng nghiệp mới vào
        socket.to(currentRoom).emit('pos:staff_joined', {
          user,
          activeStaffIds: session?.active_staff_ids || [],
        });
      } catch (err: any) {
        logger.error('[POS Socket] Lỗi khi join phòng', err);
        socket.emit('pos:error', { message: err?.message || 'Không thể gia nhập phòng POS.' });
      }
    });

    // 2. Cập nhật món / giỏ hàng thời gian thực
    socket.on('pos:cart_update', async (data: {
      sessionCode: string;
      items: any[];
      tableNumber?: string;
      customerName?: string;
      discount?: number;
      user: { userId: string; name: string };
    }) => {
      try {
        if (!currentRoom) return;

        const updatedCart = await cartUpdateService.execute({
          sessionCode: data.sessionCode,
          items: data.items,
          tableNumber: data.tableNumber,
          customerName: data.customerName,
          discount: data.discount,
          user: data.user,
        });

        // Phát tín hiệu cập nhật cho toàn bộ máy khác trong phòng
        socket.to(currentRoom).emit('pos:cart_updated', {
          cart: updatedCart,
          actionUser: data.user,
        });

        // Xác nhận lại cho chính người gửi
        socket.emit('pos:cart_ack', { cart: updatedCart });
      } catch (err: any) {
        logger.error('[POS Socket] Lỗi khi cập nhật giỏ hàng', err);
        socket.emit('pos:error', { message: err?.message || 'Cập nhật giỏ hàng thất bại.' });
      }
    });

    // 3. Khóa / Mở khóa đơn hàng khi bấm thanh toán
    socket.on('pos:cart_lock', async (data: {
      sessionCode: string;
      isLocked: boolean;
      user: { userId: string; name: string };
    }) => {
      try {
        if (!currentRoom) return;

        const lockedBy = data.isLocked ? data.user.userId : null;
        const lockedByName = data.isLocked ? data.user.name : null;

        await sessionRepo.lockCart(data.sessionCode, lockedBy, lockedByName);

        // Báo cho tất cả người trong phòng trạng thái khóa
        posNamespace.to(currentRoom).emit('pos:cart_lock_changed', {
          isLocked: data.isLocked,
          lockedBy,
          lockedByName,
        });
      } catch (err: any) {
        logger.error('[POS Socket] Lỗi khi khóa/mở khóa đơn', err);
      }
    });

    // 4. Thanh toán hoàn tất -> Làm sạch giỏ hàng trên tất cả màn hình
    socket.on('pos:order_completed', (data: { sessionCode: string; order: any; user: { name: string } }) => {
      if (!currentRoom) return;
      logger.info(`[POS Socket] Đơn hàng ${data.order?.order_code} đã thanh toán thành công bởi ${data.user.name}`);
      
      posNamespace.to(currentRoom).emit('pos:order_completed', {
        order: data.order,
        completedBy: data.user,
      });
    });

    // 5. Ngắt kết nối
    socket.on('disconnect', async () => {
      if (currentRoom && currentUser) {
        logger.info(`[POS Socket] ${currentUser.name} ngắt kết nối khỏi ${currentRoom}`);
        const sessionCode = currentRoom.replace('pos_', '');
        await sessionRepo.removeActiveStaff(sessionCode, currentUser.userId);

        socket.to(currentRoom).emit('pos:staff_left', {
          user: currentUser,
        });
      }
    });
  });
}

