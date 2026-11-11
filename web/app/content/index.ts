// web/app/content/index.ts
//
// サイトに表示するデータの読み込み口（ここ1か所）。
// ページや app/lib/ はデータを直接持たず、ここの関数から取る。
//
// 今はリポジトリの中の TS ファイル（menus.ts / news.ts）と public/ の画像を返すだけ。
// 第2段でお知らせ・写真の出どころを Instagram に差し替えるときは、
// このファイルの中身だけを変えれば済むように、関数は async のままにしている。

import type { PublicMenuItem } from "../lib/menus";
import type { PublicAnnouncement } from "../lib/announcements";
import { DEFAULT_SITE_IMAGES } from "../lib/site-image-defaults";
import { MENUS, type MenuDisplay } from "./menus";
import { NEWS } from "./news";
import { SPECIALTIES, displayableSpecialties, type DisplaySpecialty } from "./specialties";

export type { MenuDisplay, DisplaySpecialty };

export interface SiteImages {
  hero:  { sp: string; pc: string };
  about: { shop: string };
  food:  { main: string };
  space: { counter: string };
}

/** 表示する場所ごとのメニュー。 */
export async function getMenus(display: MenuDisplay): Promise<PublicMenuItem[]> {
  return MENUS[display].map((item) => ({ ...item }));
}

/** お知らせ（公開予約の判定は app/lib/announcements.ts 側で行う）。 */
export async function getAnnouncements(): Promise<PublicAnnouncement[]> {
  return NEWS.map((item) => ({ ...item }));
}

/** トップページなどの写真（public/ の画像）。 */
export async function getSiteImages(): Promise<SiteImages> {
  return {
    hero:  { sp: DEFAULT_SITE_IMAGES.hero.sp, pc: DEFAULT_SITE_IMAGES.hero.pc },
    about: { shop:    DEFAULT_SITE_IMAGES.about.shop    },
    food:  { main:    DEFAULT_SITE_IMAGES.food.main     },
    space: { counter: DEFAULT_SITE_IMAGES.space.counter },
  };
}

/** トップ ④FOOD の名物の一覧（写真と値段がそろった品だけ）。 */
export async function getSpecialties(): Promise<DisplaySpecialty[]> {
  return displayableSpecialties(SPECIALTIES).map((item) => ({ ...item }));
}
