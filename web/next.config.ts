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
      // テイクアウトのページはやめ、メニューのページの中の案内（components/TakeoutNote.tsx）にまとめた（恒久転送）。
      { source: "/takeout", destination: "/menu/dinner#takeout", permanent: true },
      // お知らせはインスタグラムで出すので、お知らせのページ（/news）はやめた。
      // /news とその下の URL に来た人は、ご案内のページの「お知らせ」の欄（app/info/page.tsx。id="news"）へ（恒久転送）。
      { source: "/news", destination: "/info#news", permanent: true },
      { source: "/news/:path*", destination: "/info#news", permanent: true },
    ];
  },
  // 画像はすべて public/ のものを使うため、外部の画像の許可（remotePatterns）は持たない。
};

export default nextConfig;
