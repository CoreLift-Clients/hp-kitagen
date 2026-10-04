/**
 * サーバー専用（Server Components / Server Actions から呼ぶ）
 * Client Component からは直接 import しないこと。
 * 定数だけ必要な場合は site-image-defaults.ts を使うこと。
 */
import "server-only";
import { backendFetch } from "@/lib/backendFetch";
import { DEFAULT_SITE_IMAGES } from "./site-image-defaults";

export { DEFAULT_SITE_IMAGES };

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID  = "kitagen";

export interface SiteImages {
  hero:  { sp: string; pc: string };
  about: { shop: string };
  food:  { main: string };
  space: { counter: string };
}

// slot キー → SiteImages のパス対応
const SLOT_MAP: Record<string, (imgs: SiteImages, url: string) => void> = {
  "hero.sp":       (imgs, url) => { imgs.hero.sp       = url; },
  "hero.pc":       (imgs, url) => { imgs.hero.pc       = url; },
  "about.shop":    (imgs, url) => { imgs.about.shop    = url; },
  "food.main":     (imgs, url) => { imgs.food.main     = url; },
  "space.counter": (imgs, url) => { imgs.space.counter = url; },
};

export async function getSiteImages(): Promise<SiteImages> {
  const result: SiteImages = {
    hero:  { sp: DEFAULT_SITE_IMAGES.hero.sp, pc: DEFAULT_SITE_IMAGES.hero.pc },
    about: { shop:    DEFAULT_SITE_IMAGES.about.shop    },
    food:  { main:    DEFAULT_SITE_IMAGES.food.main     },
    space: { counter: DEFAULT_SITE_IMAGES.space.counter },
  };

  if (!BASE_URL) return result;

  try {
    // type="top" と type="shop" の両方を取得
    const [topRes, shopRes] = await Promise.all([
      // 資料の一覧は認証が要る（公式サイト専用の API キー）。認証なしの fetch だと 401 で既定の画像に落ちていた
      backendFetch(`${BASE_URL}/api/admin/documents?shopId=${SHOP_ID}&type=top`, {
        next: { revalidate: 300 },
      }),
      backendFetch(`${BASE_URL}/api/admin/documents?shopId=${SHOP_ID}&type=shop`, {
        next: { revalidate: 300 },
      }),
    ]);

    const applyDocs = async (res: Response) => {
      if (!res.ok) return;
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const doc of (data.documents ?? []) as any[]) {
        if (doc.isActive && doc.slot && SLOT_MAP[doc.slot]) {
          SLOT_MAP[doc.slot](result, String(doc.fileUrl));
        }
      }
    };

    await Promise.all([applyDocs(topRes), applyDocs(shopRes)]);
  } catch {
    // ネットワークエラー時はデフォルト画像を使用
  }

  return result;
}
