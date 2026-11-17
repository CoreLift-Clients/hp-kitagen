import { Phone } from "lucide-react";
import { PHONE } from "../lib/contact";

// ─── テイクアウトのご案内（ディナーメニューのページの、名物の欄の「料理」と「お飲みもの」の間） ───
// 以前は別のページ（/takeout）があったが、テイクアウトのメニューは店内と同じなので、ページはやめてここにまとめた。
// /takeout に来た人は next.config.ts の redirects で /menu/dinner#takeout（この囲み）へ転送する。
// ・id="takeout"：転送とリンクの飛び先。scroll-mt はヘッダーの高さの分（名物の欄と同じ）
// ・見せ方：名物のカードと同じ和紙（section-light）の、小さな横長の囲み。ふちは細い線だけにして、カードより目立たせない
//   - md 以上：左に見出しと本文、右に電話のボタン
//   - md より狭い画面：上から見出し → 本文 → 電話のボタン（1列）
// ・電話のボタン：トップの宴の場面の「電話で相談する」（app/page.tsx の CALL_BUTTON_CLASS）と同じ形（アイコン・文字・番号）。
//   この囲みは控えめにするので、塗りではなく accent の線と字にし、少し小さくしている
// ・番号は lib/contact.ts の PHONE（1か所）から読む
// ・文は代表者が決めたもの。変えるときは代表者に確かめる

const CALL_BUTTON_CLASS =
  "inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 py-3 px-6 rounded-sm border border-accent/70 bg-background/60 text-accent hover:bg-accent hover:text-white font-bold text-sm tracking-wider transition-colors duration-200 active:scale-[0.98]";

export default function TakeoutNote() {
  return (
    <div
      id="takeout"
      className="section-light scroll-mt-32 mx-auto w-full md:max-w-[720px] rounded-sm border border-border px-5 py-6 md:px-8 md:py-7 shadow-[0_1px_3px_rgba(47,36,28,0.04)]"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="min-w-0">
          <h3 className="font-serif font-bold text-foreground text-base md:text-[17px] tracking-wider">
            テイクアウトもできます
          </h3>
          <div className="mt-2.5 space-y-1 text-[13px] md:text-sm text-muted leading-relaxed [word-break:auto-phrase]">
            <p>お料理は、お持ち帰りいただけます（一部できないものもございます）。</p>
            <p>お電話、または店頭でご注文ください。</p>
            <p>お持ち帰りのお値段は、店内と少し異なる場合がございます。</p>
          </div>
        </div>
        <a href={`tel:${PHONE}`} className={`${CALL_BUTTON_CLASS} shrink-0 self-stretch md:self-center`}>
          <span className="inline-flex items-center gap-2">
            <Phone size={16} strokeWidth={2} aria-hidden="true" />
            電話する
          </span>
          <span className="tabular-nums">{PHONE}</span>
        </a>
      </div>
    </div>
  );
}
