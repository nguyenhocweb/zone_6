import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/core/constants/query-keys";
import { updateStaffService } from "../service/staff.update.service";
import type { StaffItem, UpdateStaffPayload } from "../type/staff.type";

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation<
    { staff: StaffItem; message: string },
    Error,
    { staffId: string; payload: UpdateStaffPayload }
  >({
    mutationFn: ({ staffId, payload }) => updateStaffService(staffId, payload),
    onSuccess: (data) => {
      toast.success(data.message || "Cập nhật thông tin nhân viên thành công!");
      // Invalidate query để cập nhật danh sách nhân sự tức thời
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.all,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật nhân viên. Vui lòng kiểm tra lại quyền hạn!";
      toast.error(message);
    },
  });
}
