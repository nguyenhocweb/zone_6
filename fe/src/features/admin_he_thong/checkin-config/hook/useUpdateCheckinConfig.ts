import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/constants/query-keys";
import { updateCheckinConfigService } from "../service/checkin-config.service";
import type { UpdateCheckinConfigPayload, CheckinConfig } from "../type/checkin-config.type";
import { toast } from "sonner";

export function useUpdateCheckinConfig() {
  const queryClient = useQueryClient();

  return useMutation<CheckinConfig, Error, UpdateCheckinConfigPayload>({
    mutationFn: updateCheckinConfigService,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.checkinConfig.current, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.checkinConfig.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduling.all });
      toast.success("Đã cập nhật cấu hình Check-in & Định vị quán thành công!");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật cấu hình check-in. Vui lòng thử lại!";
      toast.error(msg);
    },
  });
}
