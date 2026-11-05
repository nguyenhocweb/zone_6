import crypto from 'node:crypto';

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export const cloudinaryConfig: CloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_NAME || 'dwbzexuqd',
  api_key: process.env.CLOUDINARY_API_KEY || '437768759352932',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'GYbnPtFn9mWFLteHIvQRWF0XIDU',
};

/**
 * Tạo chữ ký Cloudinary an toàn theo chuẩn Cloudinary API.
 * Sắp xếp các tham số theo thứ tự alphabet (trừ file, cloud_name, resource_type, api_key),
 * nối thêm API Secret ở cuối và băm bằng thuật toán SHA-1.
 */
export function generateCloudinarySignature(params: Record<string, any>): {
  signature: string;
  timestamp: number;
} {
  const timestamp = params.timestamp || Math.floor(Date.now() / 1000);
  const paramsToSign: Record<string, any> = { ...params, timestamp };

  delete paramsToSign.file;
  delete paramsToSign.cloud_name;
  delete paramsToSign.resource_type;
  delete paramsToSign.api_key;
  delete paramsToSign.api_secret;

  const sortedKeys = Object.keys(paramsToSign).sort();
  const serialized = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&');
  const stringToSign = `${serialized}${cloudinaryConfig.api_secret}`;

  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  return { signature, timestamp };
}

