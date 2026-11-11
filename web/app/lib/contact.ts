/**
 * 連絡先情報の一元管理。
 *
 * 電話番号を変更する場合は、このファイルの PHONE / PHONE_INTL だけを編集すれば
 * サイト全体（ヘッダー・モバイルナビ・トップ・店舗情報・テイクアウト・構造化データ）に反映される。
 *
 * ・PHONE      … サイト表示・tel: リンク用（`tel:${PHONE}` で使用）
 * ・PHONE_INTL … JSON-LD（schema.org）の telephone 用の国際表記
 */
export const PHONE = "070-1744-2839";

export const PHONE_INTL = "+81-70-1744-2839";

/**
 * 公式 Instagram。最新情報・急な営業の変更はここで発信している。
 * 店舗情報・ディナーメニュー・お知らせの案内・構造化データ（sameAs）はこの定数を使う。
 */
export const INSTAGRAM_URL = "https://www.instagram.com/izakaya_kitagen";

/**
 * Google マップの店舗ページ。
 * 店舗情報（/info）の「Googleマップで開く」とトップの「地図を見る」はこの定数を使う。
 */
export const MAP_URL =
  "https://www.google.co.jp/maps/place/IZAKAYA+%E3%81%8D%E3%81%9F%E3%81%92%E3%82%93/@34.6574683,135.5267993,17z/data=!3m1!4b1!4m6!3m5!1s0x6000df000a517bf7:0x81ed5ec961cb5e!8m2!3d34.6574639!4d135.5293742!16s%2Fg%2F11vwjd2bch?entry=ttu&g_ep=EgoyMDI2MDMwOS4wIKXMDSoASAFQAw%3D%3D";
