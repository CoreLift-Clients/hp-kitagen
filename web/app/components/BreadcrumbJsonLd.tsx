/**
 * パンくずリストの構造化データ（JSON-LD / schema.org BreadcrumbList）
 *
 * 下層ページに「トップ → 当該ページ」の階層を出力し、Google検索結果の
 * パンくず表示に対応する。/menu は /menu/dinner へのリダイレクトのため、
 * メニュー配下も「トップ → 当該ページ」の2階層で扱う。
 *
 * 使い方: 各 page.tsx で items を渡して JSX に配置する。
 *   <BreadcrumbJsonLd items={[
 *     { name: "トップ", path: "/" },
 *     { name: "店舗情報", path: "/info" },
 *   ]} />
 */

import { SITE_URL } from "../lib/seo";

type Crumb = {
  /** パンくずに表示する名称 */
  name: string;
  /** サイトルートからのパス（先頭スラッシュ付き。例: "/info"） */
  path: string;
};

export default function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify で生成するため XSS リスクはなく、内容は静的な文字列のみ。
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />
  );
}
