import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options",        value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
];

const BACKEND_URL = process.env.MENU_API_BASE_URL ?? "";

function getRemotePatterns(): {
  protocol: "https" | "http";
  hostname: string;
  port?: string;
  pathname?: string;
}[] {
  if (!BACKEND_URL) return [];

  try {
    const url = new URL(BACKEND_URL);

    return [
      {
        protocol: url.protocol.replace(":", "") as "https" | "http",
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: "/**", // ← これが重要（全パス許可）
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // モノレポ親（corelift）に package-lock.json があるため、Next がワークスペース
  // ルートを誤推定し tailwindcss を解決できなくなる。web/ をルートとして明示する。
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      ...getRemotePatterns(),
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
