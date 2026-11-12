// ヘッダー（デスクトップ Header・モバイル MobileNav 共通）に表示するナビ。
// スッキリさせるため主要4項目に絞る。トップはロゴ（→ /）で代替し、
// お知らせはフッター（layout.tsx の Footer）から辿れるようにしている。
export const NAV_LINKS = [
  { href: "/menu/dinner", label: "メニュー" },
  { href: "/takeout",     label: "テイクアウト" },
  { href: "/info",        label: "店舗情報" },
  { href: "/owner",       label: "店主紹介" },
];
