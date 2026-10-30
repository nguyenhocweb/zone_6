import axiosClient from '@/core/api/axios-instance';
import type { ChangePasswordPayload, LoginPayload, LoginResponseData, RoleInfo, UpdateProfilePayload, UserProfile } from '../type/auth.type';

export async function loginService(payload: LoginPayload): Promise<LoginResponseData> {
  const response = await axiosClient.post<{ success: boolean; data: LoginResponseData }>(
    '/api/v1/auth/login',
    payload
  );
  return response.data.data;
}

export async function refreshTokenService(): Promise<{ token: string; user: UserProfile }> {
  const response = await axiosClient.post<{
    success: boolean;
    data: { token: string; user: UserProfile };
  }>('/api/v1/auth/refresh');
  return response.data.data;
}

export async function logoutService(): Promise<void> {
  await axiosClient.post('/api/v1/auth/logout');
}

export async function getMeService(): Promise<UserProfile> {
  const response = await axiosClient.get<{ success: boolean; data: UserProfile }>('/api/v1/auth/me');
  return response.data.data;
}

export async function updateMeService(payload: UpdateProfilePayload): Promise<UserProfile> {
  const response = await axiosClient.put<{ success: boolean; data: UserProfile; message: string }>(
    '/api/v1/auth/me',
    payload
  );
  return response.data.data;
}

export async function changePasswordService(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const response = await axiosClient.put<{ success: boolean; message: string }>(
    '/api/v1/auth/change-password',
    payload
  );
  return response.data;
}

export async function getRolesService(): Promise<RoleInfo[]> {
  const response = await axiosClient.get<{ success: boolean; data: RoleInfo[] }>('/api/v1/auth/roles');
  return response.data.data;
}
