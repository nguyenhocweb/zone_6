import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { getStoresService } from '../service/store.get.service';
import type { StoreListResponse } from '../type/store.type';

export function useGetStores(filters?: { is_active?: boolean; search?: string }) {
  return useQuery<StoreListResponse, Error>({
    queryKey: queryKeys.stores.list(filters),
    queryFn: () => getStoresService(filters),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
