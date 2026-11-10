// web/app/lib/menus.ts
//
// メニューのデータ層。データはリポジトリの中（app/content/menus.ts）にあり、
// 読み込み口（app/content/index.ts）の getMenus() から取る。外部の API には頼らない。

import { getMenus } from "../content";

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string | undefined;
  price: string | undefined;
  image: string | null;
  category_main: string;
  category_sub: string;
  sortOrder: number;
  isNew: boolean;
}

export const getMenusForTop = () => getMenus("top");
export const getMenusForMenuPage = () => getMenus("menu");
export const getMenusForTakeout = () => getMenus("takeout");
export const getMenusForLunch = () => getMenus("lunch");
export const getMenusForDinner = () => getMenus("dinner");

export function groupByCategorySub(
  items: PublicMenuItem[],
): { heading: string; items: PublicMenuItem[] }[] {
  const map = new Map<string, PublicMenuItem[]>();

  for (const item of items) {
    const group = map.get(item.category_sub) ?? [];
    group.push(item);
    map.set(item.category_sub, group);
  }

  return Array.from(map.entries()).map(([heading, items]) => ({
    heading,
    items,
  }));
}
