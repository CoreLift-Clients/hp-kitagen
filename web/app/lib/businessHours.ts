/**
 * 営業時間・臨時休業フラグの一元管理
 *
 * 表示側（/info・ディナーメニューの見出し・ランチメニュー等）と
 * 構造化データ（StructuredData.tsx の JSON-LD）は、すべてここを参照する。
 * BUSINESS_HOURS は通常営業（ランチを含む）の時間を残しておく。
 * ランチ休止中かどうかの判定は isLunchSuspendedFor() の 1 か所で行い、
 * 開店時刻は openTimeNow() から作る（休止中はランチの曜日も DINNER_START から）。
 * /info の営業時間の表と JSON-LD は businessHoursNow()（いまの時間が同じ曜日を1行にまとめたもの）を使う。
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ★ ランチ営業を再開したら、ここを false にするだけでよい ★
//   → /info・ランチメニューページの「臨時休業中」表示が消え、
//     /info の表と JSON-LD は、ランチのある曜日（11:30〜）とない曜日の行に分かれて戻る。
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
  /** この曜日の open がランチ営業の開始時刻なら true（ランチ休止中は DINNER_START から営業） */
  hasLunch?: boolean;
}

/**
 * 通常営業時間（曜日グループごと）。曜日を変えるときは days と schemaDays を両方直す。
 * 日曜日は定休日なので、ここには入れない（REGULAR_CLOSED を参照）。
 */
export const BUSINESS_HOURS: HourGroup[] = [
  { days: "月・水・土", schemaDays: ["Monday", "Wednesday", "Saturday"], open: "11:30", close: "22:00", lo: "21:30", hasLunch: true },
  { days: "火・木・金", schemaDays: ["Tuesday", "Thursday", "Friday"],    open: "17:00", close: "22:00", lo: "21:30" },
  // ★ 祝日の営業は代表者が確認中。決まったらこの1行だけを直す
  //   （休みにするなら、この行を消して REGULAR_CLOSED に「祝日」を足す）。
  { days: "祝日",       schemaDays: ["PublicHolidays"],                   open: "15:00", close: "22:00", lo: "21:30" },
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

/** この曜日のランチが、いま休止中か（判定はここだけで行う） */
export function isLunchSuspendedFor(g: HourGroup): boolean {
  return LUNCH_SUSPENDED && g.hasLunch === true;
}

/**
 * いまの開店時刻。ランチ休止中のランチの曜日は DINNER_START、それ以外は g.open。
 * JSON-LD（StructuredData.tsx）の opens に使う。
 */
export function openTimeNow(g: HourGroup): string {
  return isLunchSuspendedFor(g) ? DINNER_START : g.open;
}

/** 曜日の並び（月曜はじまり）。schemaDays を日本語の曜日にするときと、並べ替えに使う */
const WEEK: readonly (readonly [string, string])[] = [
  ["Monday", "月"], ["Tuesday", "火"], ["Wednesday", "水"], ["Thursday", "木"],
  ["Friday", "金"], ["Saturday", "土"], ["Sunday", "日"],
];
const weekIndex = (d: string) => WEEK.findIndex(([en]) => en === d);
const isWeekdayGroup = (days: string[]) => days.every((d) => weekIndex(d) >= 0);

/** 曜日の名前（英語）を、画面に出す形にする。3日以上続いていれば「月〜土」、それ以外は「月・水・土」 */
function weekdayLabel(schemaDays: string[]): string {
  const idx = schemaDays.map(weekIndex).sort((a, b) => a - b);
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (idx.length >= 3 && contiguous) return `${WEEK[idx[0]][1]}〜${WEEK[idx[idx.length - 1]][1]}`;
  return idx.map((i) => WEEK[i][1]).join("・");
}

/** いまの営業時間の1行（/info の表と JSON-LD に使う） */
export interface HoursNowRow {
  days: string;
  schemaDays: string[];
  open: string;
  close: string;
  lo: string;
}

/**
 * いまの営業時間。BUSINESS_HOURS の曜日グループのうち、いまの開店時刻（openTimeNow）・閉店・L.O. が
 * すべて同じもの（月〜日の曜日のグループどうし）を1行にまとめる。
 * ・ランチ休止中：「月・水・土」と「火・木・金」がどちらも 17:00〜22:00 なので「月〜土」の1行になる
 * ・ランチ再開後（LUNCH_SUSPENDED = false）：時間が違うので、もとの2行のまま
 * ・祝日（PublicHolidays）は曜日ではないので、まとめない
 * まとめなかった行の days は BUSINESS_HOURS の書き方のまま。
 */
export function businessHoursNow(): HoursNowRow[] {
  const rows: (HoursNowRow & { merged: boolean })[] = [];
  for (const g of BUSINESS_HOURS) {
    const open = openTimeNow(g);
    const same = isWeekdayGroup(g.schemaDays)
      ? rows.find((r) => isWeekdayGroup(r.schemaDays) && r.open === open && r.close === g.close && r.lo === g.lo)
      : undefined;
    if (same) {
      same.schemaDays = [...same.schemaDays, ...g.schemaDays].sort((a, b) => weekIndex(a) - weekIndex(b));
      same.merged = true;
    } else {
      rows.push({ days: g.days, schemaDays: [...g.schemaDays], open, close: g.close, lo: g.lo, merged: false });
    }
  }
  return rows.map(({ merged, ...r }) => (merged ? { ...r, days: weekdayLabel(r.schemaDays) } : r));
}

/** 定休日（/info の「定休日」の行に出す）。日曜日は BUSINESS_HOURS に入れない。 */
export const REGULAR_CLOSED = "日曜日";
