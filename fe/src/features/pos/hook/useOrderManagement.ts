'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderManagementService } from '../service/order-management.service';
import { OrderFilterParams } from '../type/pos.type';
import { toast } from 'sonner';

export const ORDER_MANAGEMENT_QUERY_KEY = ['pos', 'orders', 'all'] as const;

export function useOrderManagement(params?: OrderFilterParams) {
  return useQuery({
    queryKey: [...ORDER_MANAGEMENT_QUERY_KEY, params],
    queryFn: () => orderManagementService.listAll(params),
    staleTime: 15 * 1000,
  });
}

export function useVoidOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderManagementService.voidOrder(id, reason),
    onSuccess: (order) => {
      toast.success(`Đã hủy hóa đơn #${order.order_code} thành công!`);
      queryClient.invalidateQueries({ queryKey: ORDER_MANAGEMENT_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi hủy hóa đơn');
    },
  });
}

