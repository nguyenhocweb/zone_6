import { Server, Socket } from 'socket.io';
import { logger } from '../../../../core/logger.js';

let tableNamespaceInstance: any = null;

export function emitTableEvent(storeId: string, event: string, data: any) {
  if (tableNamespaceInstance) {
    tableNamespaceInstance.to(`store_${storeId}`).emit(event, { ...data, storeId });
    // Emit toàn namespace để các client đang xem All Stores (Admin) nhận được
    tableNamespaceInstance.emit(event, { ...data, storeId });
  }
}

export function setupTableSocket(io: Server) {
  const tableNamespace = io.of('/tables');
  tableNamespaceInstance = tableNamespace;

  tableNamespace.on('connection', (socket: Socket) => {
    logger.info(`[Table Socket] Client kết nối: ${socket.id}`);

    // Tham gia phòng theo cơ sở để nhận sự kiện sơ đồ bàn thời gian thực
    socket.on('table:join_store', (data: { storeId: string; user?: any }) => {
      try {
        if (data?.storeId) {
          const room = `store_${data.storeId}`;
          socket.join(room);
          logger.info(`[Table Socket] ${socket.id} (${data?.user?.name || 'User'}) gia nhập phòng ${room}`);
        }
      } catch (err: any) {
        logger.error('[Table Socket] Lỗi khi gia nhập phòng cơ sở', err);
      }
    });

    socket.on('disconnect', () => {
      // Client ngắt kết nối
    });
  });
}
