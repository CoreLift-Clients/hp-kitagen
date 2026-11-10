// web/app/content/menus.ts
//
// メニューのデータ（サイトの中で持つ）。
// 中身は店頭のメニュー表から後日入力する。今は空の配列。
//
// ─────────────────────────────────────────────────────────────
// 【入力のしかた】
//   表示する場所（dinner / lunch / takeout など）ごとの配列に、1品ずつ足す。
//   例:
//     {
//       id: "gyoza",
//       name: "鉄鍋ぎょうざ（8個）",
//       description: undefined,
//       price: "¥640〜",
//       image: null,
//       category_main: "food",   // "food" か "drink"
//       category_sub: "点心",     // 見出しになる小分類
//       sortOrder: 1,
//       isNew: false,
//     },
//   ・ dinner は category_main で「フード」「ドリンク」に分けて表示する。
//   ・ 同じ category_sub の品が1つの見出しにまとまる（並びは配列の順）。
// ─────────────────────────────────────────────────────────────

import type { PublicMenuItem } from "../lib/menus";

export type MenuDisplay = "top" | "menu" | "takeout" | "lunch" | "dinner";

export const MENUS: Record<MenuDisplay, PublicMenuItem[]> = {
  top: [],
  menu: [],
  takeout: [],
  lunch: [],
  dinner: [],
};
