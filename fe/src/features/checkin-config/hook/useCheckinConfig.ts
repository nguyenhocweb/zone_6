import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/constants/query-keys";
import { getCheckinConfigService } from "../service/checkin-config.service";
import type { CheckinConfig } from "../type/checkin-config.type";

export function useCheckinConfig() {
  return useQuery<CheckinConfig, Error>({
    queryKey: queryKeys.checkinConfig.current,
    queryFn: getCheckinConfigService,
    staleTime: 60 * 1000, // 1 minute
  });
}
