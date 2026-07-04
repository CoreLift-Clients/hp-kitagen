"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backendFetch";

const BASE_URL = process.env.MENU_API_BASE_URL ?? "http://localhost:3000";
const SHOP_ID  = "kitagen";

type Tab = "top" | "menu" | "takeout";

const TAB_FIELD: Record<Tab, "showOnTop" | "showOnOfficialMenuPage" | "showOnTakeout"> = {
  top:     "showOnTop",
  menu:    "showOnOfficialMenuPage",
  takeout: "showOnTakeout",
};

/**
 * レイアウトエディタの保存。
 * placedIds  : 配置済み（表示ON）の ID リスト（順番通り）
 * removedIds : 今回外した（表示OFF にする）ID リスト
 */
export async function saveLayout(
  tab: Tab,
  placedIds: string[],
  removedIds: string[],
) {
  const field = TAB_FIELD[tab];

  const updates = [
    ...placedIds.map((id, i) => ({
      id,
      [field]: true,
      sortOrder: (i + 1) * 10,
    })),
    ...removedIds.map((id) => ({
      id,
      [field]: false,
    })),
  ];

  const res = await backendFetch(`${BASE_URL}/api/admin/menus/bulk-display`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ shopId: SHOP_ID, updates }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "レイアウトの保存に失敗しました",
    );
  }

  revalidatePath("/portal/menus");
  revalidatePath("/portal/menus/sort");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/takeout");
}

/** 並び順を一括更新する。updates は [{id, sortOrder}] の配列。 */
export async function bulkUpdateSortOrder(
  updates: { id: string; sortOrder: number }[],
) {
  const res = await backendFetch(`${BASE_URL}/api/admin/menus/bulk-sort`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ shopId: SHOP_ID, updates }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "並び順の保存に失敗しました",
    );
  }

  revalidatePath("/portal/menus");
  revalidatePath("/portal/menus/sort");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/takeout");
}
