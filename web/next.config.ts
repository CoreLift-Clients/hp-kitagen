import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options",        value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // モノレポ親（corelift）に package-lock.json があるため、Next がワークスペース
  // ルートを誤推定し tailwindcss を解決できなくなる。web/ をルートとして明示する。
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // アンケートのページは外した。古いリンク・QR から来た人はトップへ（恒久転送）。
      { source: "/survey", destination: "/", permanent: true },
    ];
  },
  // 画像はすべて public/ のものを使うため、外部の画像の許可（remotePatterns）は持たない。
};

export default nextConfig;
