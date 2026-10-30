import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/core/constants/query-keys";
import { createStaffService } from "../service/staff.create.service";
import type { CreateStaffPayload, StaffItem } from "../type/staff.type";

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation<{ staff: StaffItem; message: string }, Error, CreateStaffPayload>({
    mutationFn: (payload: CreateStaffPayload) => createStaffService(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Tạo tài khoản nhân viên thành công!");
      // Invalidate danh sách nhân sự để tải lại dữ liệu mới nhất
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.all,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tạo tài khoản nhân viên. Vui lòng thử lại!";
      toast.error(message);
    },
  });
}
