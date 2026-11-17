import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import SectionInner from "../components/SectionInner";
import { SpecialtyCard } from "../components/scenes/Specialties";
import { getSpecialtyCards } from "../content";
import "../components/scenes/scenes.css";

// 字のファイル。どれも @fontsource から、今の noto-sans-jp・noto-serif-jp と同じ読み込み方
// （日本語を約120の範囲に小分けした @font-face。ページで使う字の範囲のファイルだけを、ブラウザが読む）。
// 太さは、それぞれのいちばん太いものだけ（くれない・よもぎは 400 しかない）
import "@fontsource/noto-serif-jp/700.css";
import "@fontsource/klee-one/600.css";
import "@fontsource/zen-kurenaido/400.css";
import "@fontsource/yomogi/400.css";

// ─── 見出しの手書き風の字の見比べ（/font-compare） ───
// 代表者が字を1つ選ぶための、仮のページ。選んだら、このページは外す。
// ・検索に出さない（noindex）。サイトマップ・ヘッダー・フッターには載せない
// ・4つの列（md より狭い画面では縦に4段）：今の字（明朝）・クレー・くれない・よもぎ
// ・見出しは、サイトで使っている大きさ・色・行の間をそのまま写している（字だけを列ごとに変える）
//   字は CSS の変数 --cmp-font（字の並び）と --cmp-weight（太さ）で列ごとに渡す
// ・本文・数字は今の字のまま

export const metadata: Metadata = {
  title: "見出しの字の見比べ｜きたげん",
  robots: { index: false, follow: false },
};

type FontOption = { name: string; note: string; family: string; weight: number };

const FONTS: FontOption[] = [
  { name: "今の文字（明朝）", note: "Noto Serif JP 700", family: "var(--font-noto-serif-jp)", weight: 700 },
  { name: "クレー", note: "Klee One 600", family: "'Klee One', var(--font-noto-serif-jp)", weight: 600 },
  { name: "くれない", note: "Zen Kurenaido 400", family: "'Zen Kurenaido', var(--font-noto-serif-jp)", weight: 400 },
  { name: "よもぎ", note: "Yomogi 400", family: "'Yomogi', var(--font-noto-serif-jp)", weight: 400 },
];

// 見出しの字（列ごとの変数から）
const F = "[font-family:var(--cmp-font)] [font-weight:var(--cmp-weight)]";

// 見本の組の小さなラベル（今のゴシック体）
function Label({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[11px] tracking-wider text-muted">{children}</p>;
}

function Column({ font, card }: { font: FontOption; card: ReactNode }) {
  const vars = { "--cmp-font": font.family, "--cmp-weight": font.weight } as CSSProperties;
  return (
    <div style={vars} className="min-w-0">
      {/* 字の名前（今のゴシック体で小さく） */}
      <div className="mb-8 pb-2 border-b border-foreground/20">
        <p className="text-sm font-bold text-foreground">{font.name}</p>
        <p className="text-[11px] text-muted">{font.note}</p>
      </div>

      <div className="flex flex-col gap-10">
        {/* 本物のカード（品名だけこの字。ひとこと・値段は今の字のまま）。
            列のいちばん上に置く（パソコンでは4枚が横にそろう。絵の動きも、ページの下の方より先に進み終わる） */}
        <div>
          <Label>本物のカード（品名だけこの字）</Label>
          <ol className="flex flex-wrap justify-center">{card}</ol>
        </div>

        {/* トップの場面の見出し（Scene.tsx。縦書き。「名物」はふつうの大きさ、「今日も桃谷で、」は結びの大きい方） */}
        <div>
          <Label>トップの場面の見出し</Label>
          {/* 縦書きは見出しごとに付け、右から左へ横に並べる（場面と同じ、右がはじめ） */}
          <div className="flex flex-row-reverse justify-center items-start gap-10 text-foreground">
            <p className={`${F} [writing-mode:vertical-rl] text-[1.75rem] md:text-[2rem] leading-[1.6] tracking-[0.16em] whitespace-nowrap`}>
              きたげんの名物。
            </p>
            <p className={`${F} [writing-mode:vertical-rl] text-[2.25rem] md:text-[2.875rem] leading-[1.6] tracking-[0.16em] whitespace-nowrap`}>
              今日も桃谷で、
            </p>
          </div>
        </div>

        {/* ページの見出し（/info・/menu/dinner の h1） */}
        <div>
          <Label>ページの見出し</Label>
          <div className="space-y-3 text-center">
            <p className={`${F} text-3xl md:text-4xl text-foreground`}>店舗情報</p>
            <p className={`${F} text-3xl md:text-4xl text-foreground`}>ディナーメニュー</p>
          </div>
        </div>

        {/* 欄の見出し（/info の欄の見出し・名物の欄の小見出し） */}
        <div>
          <Label>欄の見出し</Label>
          <div className="space-y-5">
            {["営業時間", "アクセス", "料理", "お飲みもの"].map((t) => (
              <p key={t} className={`${F} text-base md:text-lg text-accent-dark pb-2 border-b border-accent/25`}>
                {t}
              </p>
            ))}
          </div>
        </div>

        {/* カードの品名（名物のカード。md 以上の大きさ） */}
        <div>
          <Label>カードの品名</Label>
          <div className="space-y-2 text-center">
            {["自家製しゅうまい", "鉄鍋餃子", "日本酒・焼酎"].map((t) => (
              <p key={t} className={`${F} text-[13px] min-[400px]:text-[14px] md:text-[18px] leading-snug md:tracking-wider text-foreground`}>
                {t}
              </p>
            ))}
          </div>
        </div>

        {/* テイクアウトの見出し（TakeoutNote.tsx） */}
        <div>
          <Label>テイクアウトの見出し</Label>
          <p className={`${F} text-base md:text-[17px] tracking-wider text-foreground`}>テイクアウトもできます</p>
        </div>
      </div>
    </div>
  );
}

export default async function FontComparePage() {
  const cards = await getSpecialtyCards();
  const shumai = cards.food.find((i) => i.art === "seiro") ?? cards.food[0];

  return (
    <div className="min-h-screen">
      <section className="section-warm border-b border-border py-12 md:py-16 text-center">
        <SectionInner>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">見出しの字の見比べ</h1>
          <p className="text-sm text-muted">本文・数字は今の字のまま。見出しだけを4つの字で並べています。</p>
        </SectionInner>
      </section>

      {/* 和紙の地（メニューのページの名物の欄と同じ section-deep。scene はカードの絵の線のため） */}
      <section className="scene section-deep py-16 md:py-20">
        <SectionInner maxW="max-w-[1440px]">
          <div className="grid gap-16 md:gap-20 lg:grid-cols-4 lg:gap-8">
            {FONTS.map((font) => (
              <Column
                key={font.name}
                font={font}
                card={
                  shumai && (
                    <SpecialtyCard
                      item={shumai}
                      index={0}
                      seed={7000}
                      // スマホではメニューのページと同じ2列の幅。lg 以上は名物の欄の3列と同じくらい（約 300px）
                      widthClass="w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2rem)/2)] lg:w-full lg:max-w-[300px]"
                      nameClassName={F}
                    />
                  )
                }
              />
            ))}
          </div>
        </SectionInner>
      </section>
    </div>
  );
}
