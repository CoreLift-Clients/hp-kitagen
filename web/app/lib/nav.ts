// ヘッダー（デスクトップ Header・モバイル MobileNav 共通）に表示するナビ。
// スッキリさせるため主要4項目に絞る。トップはロゴ（→ /）で代替し、
// お知らせ・アンケートはフッター（layout.tsx の Footer）から辿れるようにしている。
export const NAV_LINKS = [
  { href: "/menu/dinner", label: "メニュー",     en: "Menu"    },
  { href: "/takeout",     label: "テイクアウト", en: "Takeout" },
  { href: "/info",        label: "店舗情報",     en: "Info"    },
  { href: "/owner",       label: "店主紹介",     en: "Owner"   },
];
