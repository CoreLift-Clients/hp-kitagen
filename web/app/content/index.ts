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
import { SPECIALTY_FOOD, SPECIALTY_DRINKS, type SpecialtyItem, type SpecialtyArt } from "./specialty-prices";

export type { MenuDisplay, DisplaySpecialty, SpecialtyItem, SpecialtyArt };

/** 名物の欄のカード（料理とお飲みもの） */
export interface SpecialtyCards {
  food: SpecialtyItem[];
  drinks: SpecialtyItem[];
}

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

/** ディナーメニューの「きたげんの名物」の欄のカード（料理6品・お飲みもの3つ）。
 *  値段が数字でない品は undefined にする（値段の行を出さない） */
export async function getSpecialtyCards(): Promise<SpecialtyCards> {
  const valid = (n: number | undefined) => (typeof n === "number" && Number.isFinite(n) ? n : undefined);
  const pick = (item: SpecialtyItem): SpecialtyItem => ({ ...item, price: valid(item.price) });
  return { food: SPECIALTY_FOOD.map(pick), drinks: SPECIALTY_DRINKS.map(pick) };
}
