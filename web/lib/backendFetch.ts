// web/lib/backendFetch.ts
//
// バックエンド API（口コミ案内サポート）へのリクエストに認証ヘッダーを自動付与する fetch ラッパー。
// - SITE_API_KEY（公式サイト専用の API キー）があれば x-api-key として送る。
//   口コミ側はキーを優先し、この店舗のデータだけを許す。
// - 移行の間だけ、BACKEND_ADMIN_TOKEN があれば Authorization: Bearer としても送る（口コミ側はキーがあればキーで判定する）。
//   キーで動くのを確かめたら、Vercel から BACKEND_ADMIN_TOKEN を消す。

export function backendFetch(
  url: string | URL,
  init: RequestInit = {}
): Promise<Response> {
  const apiKey = process.env.SITE_API_KEY ?? "";
  const token = process.env.BACKEND_ADMIN_TOKEN ?? "";
  const authHeader: Record<string, string> = {
    ...(apiKey ? { "x-api-key": apiKey } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, {
    ...init,
    headers: { ...authHeader, ...(init.headers as Record<string, string> ?? {}) },
  });
}
