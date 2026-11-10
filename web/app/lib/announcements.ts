// web/app/lib/announcements.ts
//
// お知らせのデータ層。データはリポジトリの中（app/content/news.ts）にあり、
// 読み込み口（app/content/index.ts）から取る。外部の API には頼らない。
// Next.js Server Component から呼び出す（client component からは呼ばない）。

import { getAnnouncements as loadAnnouncements } from "../content";

// ── 型定義 ─────────────────────────────────────────────────────

export interface PublicAnnouncement {
  id: string;
  title: string;
  body: string | undefined;
  createdAt: string | undefined; // ISO8601 文字列
  sortOrder: number | undefined;
  publishAt: string | null | undefined; // ISO8601 or null（null = 即時公開）
}

// ── 公開判定 ───────────────────────────────────────────────────

/**
 * publishAt が設定されている場合、その日時を過ぎているものだけを表示する。
 * publishAt が null / undefined の場合は常に表示対象とする。
 */
function isVisibleNow(item: PublicAnnouncement): boolean {
  if (!item.publishAt) return true;
  return new Date(item.publishAt) <= new Date();
}

// ── 取得 ───────────────────────────────────────────────────────

export async function getAnnouncements(): Promise<PublicAnnouncement[]> {
  const items = await loadAnnouncements();
  // publishAt による表示フィルタリング
  return items.filter(isVisibleNow);
}
