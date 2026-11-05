export interface CloudinarySignPayload {
  item_id?: string;
  folder?: string;
}

export interface CloudinarySignResponse {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  item_id: string;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  url: string;
}

