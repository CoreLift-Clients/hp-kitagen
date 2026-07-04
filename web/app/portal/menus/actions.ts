"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backendFetch";

const BASE_URL = process.env.MENU_API_BASE_URL ?? "http://localhost:3000";
const SHOP_ID  = "kitagen";

// ── レイアウト一括保存 ─────────────────────────────────────

type Tab = "top" | "menu" | "takeout";

const TAB_FIELD: Record<Tab, "showOnTop" | "showOnOfficialMenuPage" | "showOnTakeout"> = {
  top:     "showOnTop",
  menu:    "showOnOfficialMenuPage",
  takeout: "showOnTakeout",
};

export async function saveLayout(
  tab: Tab,
  placedIds: string[],
  removedIds: string[],
) {
  const field = TAB_FIELD[tab];
  const updates = [
    ...placedIds.map((id, i) => ({ id, [field]: true, sortOrder: (i + 1) * 10 })),
    ...removedIds.map((id) => ({ id, [field]: false })),
  ];

  const res = await backendFetch(`${BASE_URL}/api/admin/menus/bulk-display`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ shopId: SHOP_ID, updates }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "レイアウトの保存に失敗しました");
  }

  revalidatePath("/portal/menus");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/menu/dinner");
  revalidatePath("/menu/lunch");
  revalidatePath("/takeout");
}

// ── 表示設定の更新（個別） ─────────────────────────────────

export async function updateMenuDisplay(
  id: string,
  data: {
    showOnTop:              boolean;
    showOnOfficialMenuPage: boolean;
    showOnTakeout:          boolean;
    sortOrder:              number;
  },
) {
  const res = await backendFetch(`${BASE_URL}/api/admin/menus/${id}/display`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      shopId: SHOP_ID,
      showOnTop:              data.showOnTop,
      showOnOfficialMenuPage: data.showOnOfficialMenuPage,
      showOnTakeout:          data.showOnTakeout,
      sortOrder:              data.sortOrder,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "更新に失敗しました");
  }

  revalidatePath("/portal/menus");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/menu/dinner");
  revalidatePath("/menu/lunch");
  revalidatePath("/takeout");
}

// ── ランチ並び順のみ保存（表示フラグは subCategory で制御されるため変更しない） ──

export async function saveLunchOrder(orderedIds: string[]) {
  if (orderedIds.length === 0) return;

  const updates = orderedIds.map((id, i) => ({ id, sortOrder: (i + 1) * 10 }));

  const res = await backendFetch(`${BASE_URL}/api/admin/menus/bulk-sort`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ shopId: SHOP_ID, updates }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "ランチ並び順の保存に失敗しました");
  }

  revalidatePath("/portal/menus");
  revalidatePath("/menu/lunch");
}

// ── 画像アップロード（Cloudinary） ──────────────────────────

export async function uploadMenuImageAction(
  formData: FormData,
): Promise<{ ok: boolean; imageUrl?: string; error?: string }> {
  formData.set("shopId", SHOP_ID);
  try {
    const res = await backendFetch(`${BASE_URL}/api/admin/menus/upload-image`, {
      method: "POST",
      body:   formData,
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "アップロードに失敗しました" };
    return { ok: true, imageUrl: data.imageUrl };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

// ── 画像URL の更新 ─────────────────────────────────────────

export async function updateImageUrl(id: string, imageUrl: string) {
  const res = await backendFetch(`${BASE_URL}/api/admin/menus/${id}/display`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ shopId: SHOP_ID, imageUrl }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "画像URLの保存に失敗しました");
  }

  revalidatePath("/portal/menus");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/menu/dinner");
  revalidatePath("/menu/lunch");
  revalidatePath("/takeout");
}
