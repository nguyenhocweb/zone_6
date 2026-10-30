import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { getMaterialsService } from '../service/material.get.service';
import type { MaterialListResponse } from '../type/material.type';

export function useGetMaterials(params?: {
  store_id?: string;
  category?: string;
  search?: string;
  is_active?: boolean;
  limit?: number;
  page?: number;
}) {
  return useQuery<MaterialListResponse>({
    queryKey: queryKeys.materials.list(params),
    queryFn: () => getMaterialsService(params),
    staleTime: 60 * 1000,
  });
}
