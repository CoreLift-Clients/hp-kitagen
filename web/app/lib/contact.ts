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
