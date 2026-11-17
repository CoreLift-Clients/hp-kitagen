import type { ReactNode } from "react";
import SectionInner from "./SectionInner";
import { jitter, smooth, type P } from "./scenes/draw";
// 区切りの線の太さ（.info-rule-line）は scenes.css にある
import "./scenes/scenes.css";

// ─── 1枚の和紙（店舗情報のページ。「店先の貼り紙」） ───
// 店主紹介のページは「店主からの手紙」として、見た目を分けて便箋にしている（app/owner/letter.css）。
// 店主紹介で使うのは、下の WASHI_LINK（文字のリンク）だけ
// ・地（section-deep。メニューのページの名物の欄と同じ）に、縦に長い1枚の和紙（section-light。名物のカードと同じ紙の色）を置く
// ・和紙の幅：md より狭い画面は左右の余白を除いた幅いっぱい、md〜lg も幅いっぱい、lg 以上は 1040px まで
//   （サイト共通の幅 max-w-page-wide。globals.css の --container-page-wide）。
//   広い画面で広がった分は、紙のふちの左右の余白（md 48px・lg 96px）と、縦書きの項目名と本文のあいだ
//   （md 48px・lg 80px）に回す
// ・項目（WashiItem）は、md 以上は左に縦書きの項目名（明朝体 700。トップの OUR STORY の縦書きと同じ書き方）、
//   md より狭い画面は横書きで項目の上に。本文はゴシック体 16px・行間 1.95、1行は 38em（約 38 字）まで
// ・項目のあいだは、筆で引いたような細い横線1本だけ（BrushRule。料理の絵の線と同じ揺らぎ・色）
// ・折り返しは語の切れ目で（auto-phrase。メニューのページのテイクアウトのご案内と同じ）

// 和紙を置く地と、和紙
export function WashiSheet({ children }: { children: ReactNode }) {
  return (
    <div className="section-deep py-14 md:py-24">
      <SectionInner>
        <article className="section-light mx-auto w-full max-w-page-wide px-5 py-3 md:px-12 md:py-6 lg:px-24 lg:py-8 shadow-[0_1px_6px_rgba(47,36,28,0.08)]">
          {children}
        </article>
      </SectionInner>
    </div>
  );
}

// 区切りの線（筆で引いたような細い横線）。seed を変えると揺らぎ方が変わる（乱数なし）。
// viewBox は横 100・縦 6 で描き、幅いっぱいに伸ばす（線の太さは scenes.css の .info-rule-line で変わらない）
function rulePath(seed: number): string {
  const pts: P[] = [];
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // 引き始めは少し上から入り、終わりはわずかに下がる（筆の入りと抜け）
    const y = 3 + (t - 0.5) * 0.5 + jitter(seed + i) * 0.55 * (i === 0 || i === n ? 0.3 : 1);
    pts.push([0.6 + 98.8 * t, y]);
  }
  return smooth(pts);
}

export function BrushRule({ seed }: { seed: number }) {
  return (
    <svg
      viewBox="0 0 100 6"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="block h-[6px] w-full overflow-visible text-foreground"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <path d={rulePath(seed)} className="info-rule-line" />
    </svg>
  );
}

// 縦書きの項目名の列と、本文の列（md 以上）
const WASHI_GRID = "md:grid md:grid-cols-[2.5rem_1fr] lg:grid-cols-[3rem_1fr] md:gap-x-12 lg:gap-x-20";
// 本文の字（店舗情報の本文と同じ）
const WASHI_BODY = "min-w-0 max-w-[38em] text-base text-foreground leading-[1.95] [word-break:auto-phrase] text-pretty";

// 項目（左に縦書きの項目名、右に中身。md より狭い画面は項目名が上）
export function WashiItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className={`py-9 md:py-12 lg:py-14 ${WASHI_GRID}`}>
      <h2 className="mb-4 md:mb-0 font-serif text-lg md:text-xl lg:text-[1.375rem] font-bold text-foreground tracking-[0.18em] md:[writing-mode:vertical-rl] md:leading-[1.7]">
        {label}
      </h2>
      <div className={`space-y-2 ${WASHI_BODY}`}>{children}</div>
    </section>
  );
}

// 控えめな文字のリンク（文字と細い下線。店舗情報の「地図アプリで開く」、店主紹介の結びのリンク）
export const WASHI_LINK =
  "inline-flex items-center gap-1.5 text-accent hover:text-accent-dark underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors duration-200";
