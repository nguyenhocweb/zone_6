import { useQuery } from '@tanstack/react-query';
import { getPayOSConfigsService } from '../service/payos.get.service';

export const PAYOS_CONFIGS_QUERY_KEY = ['admin_he_thong', 'payos_configs'];

export function useGetPayOSConfigs() {
  return useQuery({
    queryKey: PAYOS_CONFIGS_QUERY_KEY,
    queryFn: getPayOSConfigsService,
    staleTime: 60 * 1000,
  });
}

