import { useQuery } from '@tanstack/react-query';
import { getDefaultPayOSConfigService } from '../service/payos.get.service';

export const PAYOS_DEFAULT_QUERY_KEY = ['payos', 'default'];

export function useGetDefaultPayOSConfig() {
  return useQuery({
    queryKey: PAYOS_DEFAULT_QUERY_KEY,
    queryFn: getDefaultPayOSConfigService,
    staleTime: 60 * 1000,
  });
}

