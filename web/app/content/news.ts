// web/app/content/news.ts
//
// お知らせのデータ（サイトの中で持つ）。
// 今は空の配列。空のあいだは「最新情報は Instagram で」の案内を出す。
// 第2段で、お知らせの出どころを Instagram に差し替える予定。
//
// 例:
//   {
//     id: "2026-12-01-nenmatsu",
//     title: "年末年始の営業について",
//     body: "12/31〜1/3 はお休みをいただきます。",
//     createdAt: "2026-12-01T00:00:00+09:00",
//     sortOrder: undefined,
//     publishAt: null, // 日時を入れると、その日時を過ぎてから表示される
//   },

import type { PublicAnnouncement } from "../lib/announcements";

export const NEWS: PublicAnnouncement[] = [];
