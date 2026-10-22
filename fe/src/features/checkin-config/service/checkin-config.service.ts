import axiosClient from "@/core/api/axios-instance";
import type {
  CheckinConfig,
  UpdateCheckinConfigPayload,
  VerifyLocationResponse,
} from "../type/checkin-config.type";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function getCheckinConfigService(): Promise<CheckinConfig> {
  const res = await axiosClient.get<ApiResponse<CheckinConfig>>("/api/v1/store-config");
  return res.data.data;
}

export async function updateCheckinConfigService(
  payload: UpdateCheckinConfigPayload
): Promise<CheckinConfig> {
  const res = await axiosClient.put<ApiResponse<CheckinConfig>>(
    "/api/v1/store-config",
    payload
  );
  return res.data.data;
}

export async function verifyLocationService(
  latitude: number,
  longitude: number
): Promise<VerifyLocationResponse> {
  const res = await axiosClient.post<ApiResponse<VerifyLocationResponse>>(
    "/api/v1/store-config/verify-location",
    { latitude, longitude }
  );
  return res.data.data;
}

export async function reverseGeocodeService(
  lat: number,
  lon: number
): Promise<string | null> {
  // Ưu tiên gọi qua Backend Zone 6 (đảm bảo không bị CORS và không bị chặn User-Agent)
  try {
    const res = await axiosClient.get<ApiResponse<{ address: string }>>(
      "/api/v1/store-config/reverse-geocode",
      {
        params: { lat, lon },
        timeout: 5000,
      }
    );
    if (res.data?.data?.address && res.data.data.address.trim()) {
      return res.data.data.address.trim();
    }
  } catch (backendErr) {
    console.warn("Backend reverse geocode failed, trying client fallback...", backendErr);
  }

  // Fallback trực tiếp nếu backend bận
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`,
      {
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      const parts = [
        addr.house_number ? `Số ${addr.house_number}` : null,
        addr.road || addr.street,
        addr.suburb || addr.quarter || addr.neighbourhood,
        addr.ward,
        addr.city_district || addr.district || addr.county,
        addr.city || addr.state || addr.province,
      ].filter(Boolean);
      const uniqueParts = Array.from(new Set(parts));
      if (uniqueParts.length >= 2) {
        return uniqueParts.join(", ");
      }
    }
    return data?.display_name || null;
  } catch (err) {
    console.warn("Reverse geocode failed:", err);
    return null;
  }
}

