// web/app/lib/adminMenus.ts
//
// 管理画面用 メニュー取得データ層（Server Component から呼ぶ）
// 書き込み操作は app/admin/menus/actions.ts の Server Actions を使う

import { backendFetch } from "@/lib/backendFetch";

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID  = "kitagen";

// ── 型定義 ─────────────────────────────────────────────────

export interface AdminMenuItem {
  id:            string;
  name:          string;
  description:   string | null;
  basePrice:     number | null;
  imageUrl:      string | null;
  category:      string;      // "food" | "drink"
  subCategory:   string;
  sortOrder:     number;
  isActive:      boolean;
  showOnTop:              boolean;
  showOnOfficialMenuPage: boolean;
  showOnTakeout:          boolean;
  createdAt:     string;
  updatedAt:     string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItem(raw: Record<string, any>): AdminMenuItem {
  return {
    id:             String(raw.id ?? ""),
    name:           String(raw.name ?? ""),
    description:    raw.description ? String(raw.description) : null,
    basePrice:      raw.basePrice != null ? Number(raw.basePrice) : null,
    imageUrl:       raw.imageUrl   ? String(raw.imageUrl)   : null,
    category:       String(raw.category    ?? raw.category_main ?? ""),
    subCategory:    String(raw.subCategory ?? raw.category_sub  ?? ""),
    sortOrder:      Number(raw.sortOrder   ?? 0),
    isActive:       raw.isActive   !== false,
    showOnTop:              raw.showOnTop              === true,
    showOnOfficialMenuPage: raw.showOnOfficialMenuPage === true,
    showOnTakeout:          raw.showOnTakeout          === true,
    createdAt:      String(raw.createdAt ?? ""),
    updatedAt:      String(raw.updatedAt ?? ""),
  };
}

// ── 一覧取得 ───────────────────────────────────────────────

export async function getAdminMenus(): Promise<AdminMenuItem[]> {
  if (!BASE_URL) {
    console.warn("[adminMenus] MENU_API_BASE_URL が未設定です");
    return [];
  }
  const url = `${BASE_URL}/api/admin/menus?shopId=${SHOP_ID}`;
  try {
    const res = await backendFetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`[adminMenus] list failed: status=${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.items ?? []).map(mapItem);
  } catch (e) {
    console.error("[adminMenus] list error:", e);
    return [];
  }
}
