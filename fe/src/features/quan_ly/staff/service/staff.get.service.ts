import axiosClient from "@/core/api/axios-instance";
import type { GetStaffListResponse, StaffItem } from "../type/staff.type";

export async function getStaffListService(params?: {
  search?: string;
  role?: string;
  store_id?: string;
}): Promise<StaffItem[]> {
  const response = await axiosClient.get<GetStaffListResponse>("/api/v1/users/staff", {
    params,
  });
  return response.data.data;
}
