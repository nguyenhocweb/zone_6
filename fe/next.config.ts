import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    agentUpgrade: "security",
  } as any,
  // Proxy ngược về Backend VPS để tránh lỗi Mixed Content (HTTPS -> HTTP) khi deploy trên Vercel
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://160.191.243.53";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/socket.io",
        destination: `${backendUrl}/socket.io/`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${backendUrl}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
