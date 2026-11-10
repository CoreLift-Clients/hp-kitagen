/**
 * 営業時間・臨時休業フラグの一元管理
 *
 * 表示側（/info・ディナーメニューの見出し・ランチメニュー等）と
 * 構造化データ（StructuredData.tsx の JSON-LD）は、すべてここを参照する。
 * JSON-LD には BUSINESS_HOURS（通常営業）をそのまま出し、
 * 臨時休業などの一時的な状態は LUNCH_SUSPENDED などの表示用フラグでのみ制御する。
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ★ ランチ営業を再開したら、ここを false にするだけでよい ★
//   → /info・ランチメニューページの「臨時休業中」表示が消える。
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const LUNCH_SUSPENDED = true;

/** 臨時休業の告知文（表示トーンに合わせて控えめに使う） */
export const LUNCH_SUSPENDED_NOTICE = "ランチ営業は現在、臨時休業とさせていただいております。";

export interface HourGroup {
  /** 画面に出す曜日（例: "月・水・土"） */
  days: string;
  /** 構造化データ（schema.org）用の曜日。days と同じ曜日を英語で書く */
  schemaDays: string[];
  open: string;
  close: string;
  lo: string;
}

/** 通常営業時間（曜日グループごと）。曜日を変えるときは days と schemaDays を両方直す。 */
export const BUSINESS_HOURS: HourGroup[] = [
  { days: "月・水・土", schemaDays: ["Monday", "Wednesday", "Saturday"], open: "11:30", close: "22:00", lo: "21:30" },
  { days: "火・木・金", schemaDays: ["Tuesday", "Thursday", "Friday"],    open: "17:00", close: "22:00", lo: "21:30" },
  { days: "日・祝",     schemaDays: ["Sunday", "PublicHolidays"],         open: "15:00", close: "22:00", lo: "21:30" },
];

/** ディナータイムの始まり（ディナーメニューの見出しに使う） */
export const DINNER_START = "17:00";

/**
 * ディナーメニューの見出しの文言（例: "17:00〜22:00（L.O. 21:30）"）。
 * 終わりと L.O. は BUSINESS_HOURS のいちばん遅い閉店時刻のものを使う。
 */
export function dinnerTimeLabel(): string {
  const last = [...BUSINESS_HOURS].sort((a, b) => b.close.localeCompare(a.close))[0];
  return `${DINNER_START}〜${last.close}（L.O. ${last.lo}）`;
}

/** 定休日 */
export const REGULAR_CLOSED = "不定休";
