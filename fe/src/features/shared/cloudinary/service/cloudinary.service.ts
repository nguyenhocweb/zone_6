import axiosClient from '@/core/api/axios-instance';
import type {
  CloudinarySignPayload,
  CloudinarySignResponse,
  CloudinaryUploadResult,
} from '../type/cloudinary.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * 1. Xin chữ ký xác thực từ Backend Zone 6
 */
export async function getCloudinaryMenuSignature(
  payload?: CloudinarySignPayload
): Promise<CloudinarySignResponse> {
  const res = await axiosClient.post<ApiResponse<CloudinarySignResponse>>(
    '/api/v1/cloudinary/sign',
    payload || {}
  );
  return res.data.data;
}

/**
 * 2. Upload file trực tiếp lên Cloudinary sử dụng chữ ký đã xin
 */
export async function uploadToCloudinary(
  file: File,
  sig: CloudinarySignResponse
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.api_key);
  formData.append('timestamp', String(sig.timestamp));
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`;

  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `Tải ảnh lên Cloudinary thất bại (Mã lỗi ${res.status})`
    );
  }

  const data: CloudinaryUploadResult = await res.json();
  return data;
}

/**
 * Quy trình trọn gói: Xin chữ ký từ BE -> Tải ảnh lên Cloudinary folder zone_6/menu/{id món}
 */
export async function uploadMenuItemImage(
  file: File,
  itemId?: string
): Promise<{ url: string; itemId: string; folder: string }> {
  // 1. Xin chữ ký
  const sig = await getCloudinaryMenuSignature({ item_id: itemId });

  // 2. Upload lên Cloudinary
  const result = await uploadToCloudinary(file, sig);

  return {
    url: result.secure_url,
    itemId: sig.item_id,
    folder: sig.folder,
  };
}

