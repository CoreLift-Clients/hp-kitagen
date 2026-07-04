/**
 * 構造化データ（JSON-LD / schema.org Restaurant）
 *
 * Googleのローカル検索・リッチリザルト向けに店舗情報を出力する。
 * layout.tsx から全ページに出力している（1店舗のため内容は共通）。
 *
 * ── 更新のポイント ──────────────────────────────────────
 * ・営業時間は「通常営業」を記載する（ランチ臨時休業などの一時的な状態は
 *   表示側でのみ出し、この構造化データは通常営業のまま維持する方針）。
 * ・sameAs には公式・予約系アカウントのURLを入れる。分かった順に追記する。
 * ────────────────────────────────────────────────────────
 */

import { PHONE_INTL } from "../lib/contact";
import { SITE_URL } from "../lib/seo";

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "IZAKAYA きたげん",
  url: SITE_URL,
  telephone: PHONE_INTL,
  image: `${SITE_URL}/og.png`,
  priceRange: "¥3,000〜4,000",
  // 日本語表記に加え、英語圏の検索・リッチリザルト向けに "Japanese" を併記。
  servesCuisine: ["居酒屋", "中華", "Japanese"],
  // メニューページ（実ページはディナー）。電話予約を受けるため予約可も明示。
  menu: `${SITE_URL}/menu/dinner`,
  acceptsReservations: true,
  address: {
    "@type": "PostalAddress",
    postalCode: "544-0033",
    addressRegion: "大阪府",
    addressLocality: "大阪市生野区",
    streetAddress: "勝山北1-2-13",
    addressCountry: "JP",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 34.6574639,
    longitude: 135.5293742,
  },
  // 通常営業時間（曜日ごと）。臨時休業などの一時的な状態はここには反映しない。
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Wednesday", "Saturday"],
      opens: "11:30",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Thursday", "Friday"],
      opens: "17:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "PublicHolidays"],
      opens: "15:00",
      closes: "22:00",
    },
  ],
  // ── 公式・予約系アカウント ──────────────────────────────
  // 注意: ぐるなび掲載の電話番号(050-5488-5660)は転送番号のため使用しない。
  //       電話は telephone / サイト表示ともに 070-1744-2839 で統一する。
  sameAs: [
    "https://www.instagram.com/izakaya_kitagen",
    "https://tabelog.com/osaka/A2701/A270205/27146445/",
    "https://www.hotpepper.jp/strJ003784147/",
    "https://r.gnavi.co.jp/6yktmbzh0000/",
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify で生成するため XSS リスクはなく、内容は静的定数のみ。
      dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
    />
  );
}
