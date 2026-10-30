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

  // Fallback 1: Photon OSM (tốc độ cao, không chặn CORS, hỗ trợ tiếng Việt)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const feature = data?.features?.[0]?.properties;
      if (feature) {
        const parts = [
          feature.housenumber ? `Số ${feature.housenumber}` : null,
          feature.street || feature.name,
          feature.locality,
          feature.district,
          feature.city || feature.state,
        ].filter(Boolean);
        const uniqueParts = Array.from(new Set(parts));
        if (uniqueParts.length >= 2) {
          return uniqueParts.join(", ");
        }
      }
    }
  } catch (err) {
    console.warn("Photon fallback failed:", err);
  }

  // Fallback 2: BigDataCloud
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const parts = [
        data.locality,
        data.city,
        data.principalSubdivision,
        data.countryName,
      ].filter(Boolean);
      const uniqueParts = Array.from(new Set(parts));
      if (uniqueParts.length >= 2) {
        return uniqueParts.join(", ");
      }
    }
  } catch (err) {
    console.warn("BigDataCloud fallback failed:", err);
  }

  return null;
}

