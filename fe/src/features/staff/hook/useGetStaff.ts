import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/constants/query-keys";
import { getStaffListService } from "../service/staff.get.service";
import type { StaffItem } from "../type/staff.type";

export function useGetStaff(params?: { search?: string; role?: string }) {
  return useQuery<StaffItem[], Error>({
    queryKey: queryKeys.staff.list(params),
    queryFn: () => getStaffListService(params),
    staleTime: 60 * 1000, // 60s per Zone 6 architectural standard
    refetchOnWindowFocus: false,
  });
}
