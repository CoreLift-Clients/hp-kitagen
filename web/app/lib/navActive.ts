/**
 * ヘッダー/モバイルナビ共通のアクティブ判定。
 * - "/"（トップ）: 完全一致のみ（startsWith だと全ページにマッチしてしまうため）
 * - "/menu..." : "/menu" 配下（/menu/dinner・将来の /menu サブパス）をまとめて active
 * - その他       : 完全一致、または href + "/" 始まり（サブパス対応）
 */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/menu")) return pathname.startsWith("/menu");
  return pathname === href || pathname.startsWith(href + "/");
}
