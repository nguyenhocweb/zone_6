/**
 * Tiện ích nhận diện thiết bị & định danh khách hàng tự động (Client Fingerprinting & Device ID)
 * Không yêu cầu khách hàng đăng nhập, tự động lưu giữ phiên thiết bị trên localStorage
 */

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_side_device';

  const STORAGE_KEY = 'z6_client_device_id';
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      // Sinh UUID định danh thiết bị độc nhất
      id = 'z6_dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch (e) {
    return 'anon_device_' + Math.random().toString(36).slice(2, 10);
  }
}

export function detectDeviceName(): string {
  if (typeof window === 'undefined') return 'Thiết bị không xác định';

  const ua = navigator.userAgent;

  let os = 'Khác';
  if (/iPhone/i.test(ua)) os = 'iPhone';
  else if (/iPad/i.test(ua)) os = 'iPad';
  else if (/Android/i.test(ua)) {
    // Thử trích xuất model Android nếu có
    const match = ua.match(/Android\s+[\d\.]+;\s+([^;)]+)/i);
    os = match ? match[1].trim() : 'Android Device';
  } else if (/Macintosh|Mac OS X/i.test(ua)) os = 'MacBook / macOS';
  else if (/Windows NT 10.0|Windows NT 11.0/i.test(ua)) os = 'Windows PC';
  else if (/Linux/i.test(ua)) os = 'Linux PC';

  let browser = 'Browser';
  if (/Zalo/i.test(ua)) browser = 'Zalo App';
  else if (/FBAN|FBAV/i.test(ua)) browser = 'Facebook App';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/CocCoc/i.test(ua)) browser = 'Cốc Cốc';

  return `${os} (${browser})`;
}
