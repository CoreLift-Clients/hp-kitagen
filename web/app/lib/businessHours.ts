/**
 * 営業時間・臨時休業フラグの一元管理
 *
 * 表示側（/info・ランチメニュー等）はすべてここを参照する。
 * 構造化データ（StructuredData.tsx）の営業時間は「通常営業」を別途保持しており、
 * 臨時休業などの一時的な状態はこのファイルの表示用フラグでのみ制御する。
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ★ ランチ営業を再開したら、ここを false にするだけでよい ★
//   → /info・ランチメニューページの「臨時休業中」表示が消える。
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const LUNCH_SUSPENDED = true;

/** 臨時休業の告知文（表示トーンに合わせて控えめに使う） */
export const LUNCH_SUSPENDED_NOTICE = "ランチ営業は現在、臨時休業とさせていただいております。";

export interface HourGroup {
  days: string;
  open: string;
  close: string;
  lo: string;
}

/** 通常営業時間（曜日グループごと） */
export const BUSINESS_HOURS: HourGroup[] = [
  { days: "月・水・土", open: "11:30", close: "22:00", lo: "21:30" },
  { days: "火・木・金", open: "17:00", close: "22:00", lo: "21:30" },
  { days: "日・祝",     open: "15:00", close: "22:00", lo: "21:30" },
];

/** 定休日 */
export const REGULAR_CLOSED = "不定休";
