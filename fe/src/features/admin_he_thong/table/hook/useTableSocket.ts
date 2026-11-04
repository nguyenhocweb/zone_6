'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { TABLE_QUERY_KEY } from './useTables';
import { TableItem } from '../type/table.type';
import { formatTableDisplayName } from '../component/TableDetailModal';
import { toast } from 'sonner';

export function useTableSocket(storeId?: string | null, currentUser?: { id?: string; name?: string }) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    const socket = io(`${socketUrl}/tables`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('table:join_store', {
        storeId,
        user: currentUser,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Lắng nghe sự kiện cập nhật trạng thái bàn thời gian thực
    socket.on(
      'table:updated',
      (data: { table: TableItem; storeId: string; actionUser?: { userId?: string; name?: string } }) => {
        if (!data?.table) return;

        // 1. Cập nhật cache tức thì (Optimistic UI sync)
        queryClient.setQueriesData<TableItem[]>({ queryKey: TABLE_QUERY_KEY }, (oldData) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((t) => (t.id === data.table.id ? { ...t, ...data.table } : t));
        });

        // 2. Làm mới để đồng bộ hoàn toàn
        queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEY });

        // 3. Thông báo nhẹ nhàng nếu là thao tác từ nhân viên khác hoặc khách tự gọi món
        if (data.actionUser?.userId !== currentUser?.id) {
          const statusLabels: Record<string, string> = {
            AVAILABLE: 'Trống',
            OCCUPIED: 'Có Khách',
            RESERVED: 'Đã Đặt',
            MAINTENANCE: 'Bảo Trì',
          };
          const name = formatTableDisplayName(data.table.table_number);
          const statusName = statusLabels[data.table.status] || data.table.status;
          const actor = data.actionUser?.name ? ` bởi ${data.actionUser.name}` : '';
          toast.info(`⚡ ${name} vừa chuyển sang "${statusName}"${actor}`);
        }
      }
    );

    socket.on('table:created', () => {
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEY });
    });

    socket.on('table:deleted', () => {
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEY });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [storeId, queryClient, currentUser?.id, currentUser?.name]);

  return { isConnected };
}
