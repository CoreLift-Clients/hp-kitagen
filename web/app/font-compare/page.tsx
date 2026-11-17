import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import SectionInner from "../components/SectionInner";
import { SpecialtyCard } from "../components/scenes/Specialties";
import { getSpecialtyCards, type SpecialtyItem } from "../content";
import "../components/scenes/scenes.css";

// 字のファイル。どれも @fontsource から、今の noto-sans-jp・noto-serif-jp と同じ読み込み方
// （日本語を約120の範囲に小分けした @font-face。ページで使う字の範囲のファイルだけを、ブラウザが読む）。
// 太さは、それぞれのいちばん太いものだけ（くれない・よもぎ・ぽった・佑字 粛・佑字 朴は 400 しかない）
import "@fontsource/noto-serif-jp/700.css";
import "@fontsource/klee-one/600.css";
import "@fontsource/zen-kurenaido/400.css";
import "@fontsource/yomogi/400.css";
import "@fontsource/potta-one/400.css";
import "@fontsource/yuji-syuku/400.css";
import "@fontsource/yuji-boku/400.css";

// ─── 見出しの手書き風の字の見比べ（/font-compare） ───
// 代表者が字を1つ選ぶための、仮のページ。選んだら、このページは外す。
// ・検索に出さない（noindex）。サイトマップ・ヘッダー・フッターには載せない
// ・組は3つ。パソコン（lg 以上）はどの組も同じ列の幅（4列の格子）、md より狭い画面ではすべて縦に並ぶ
//   1. やわらかい手書き：今の字（明朝）・クレー・くれない・よもぎ
//   2. 太い筆：ぽった・佑字 粛・佑字 朴
//   3. 使い分けの例：大きい見出しは筆の字、カードの品名はクレー（筆の3つそれぞれ）
// ・見出しは、サイトで使っている大きさ・色・行の間をそのまま写している（字だけを列ごとに変える）
//   字は CSS の変数 --cmp-font（字の並び）と --cmp-weight（太さ）で列ごとに渡す。
//   カードの品名だけ別の字にするときは --cmp-card-font・--cmp-card-weight（使い分けの例）
// ・本文・数字は今の字のまま

export const metadata: Metadata = {
  title: "見出しの字の見比べ｜きたげん",
  robots: { index: false, follow: false },
};

type FontOption = { name: string; note: string; family: string; weight: number };

const MINCHO: FontOption = { name: "今の文字（明朝）", note: "Noto Serif JP 700", family: "var(--font-noto-serif-jp)", weight: 700 };
const KLEE: FontOption = { name: "クレー", note: "Klee One 600", family: "'Klee One', var(--font-noto-serif-jp)", weight: 600 };

const SOFT_FONTS: FontOption[] = [
  MINCHO,
  KLEE,
  { name: "くれない", note: "Zen Kurenaido 400", family: "'Zen Kurenaido', var(--font-noto-serif-jp)", weight: 400 },
  { name: "よもぎ", note: "Yomogi 400", family: "'Yomogi', var(--font-noto-serif-jp)", weight: 400 },
];

const BRUSH_FONTS: FontOption[] = [
  { name: "ぽった", note: "Potta One 400", family: "'Potta One', var(--font-noto-serif-jp)", weight: 400 },
  { name: "佑字 粛", note: "Yuji Syuku 400", family: "'Yuji Syuku', var(--font-noto-serif-jp)", weight: 400 },
  { name: "佑字 朴", note: "Yuji Boku 400", family: "'Yuji Boku', var(--font-noto-serif-jp)", weight: 400 },
];

// 見出しの字（列ごとの変数から）
const F = "[font-family:var(--cmp-font)] [font-weight:var(--cmp-weight)]";
// 使い分けの例の、カードの品名の字
const F_CARD = "[font-family:var(--cmp-card-font)] [font-weight:var(--cmp-card-weight)]";

// 見本の組の小さなラベル（今のゴシック体）
function Label({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[11px] tracking-wider text-muted">{children}</p>;
}

// 組の見出し（今のゴシック体）
function GroupHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-10 md:mb-12">
      <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted">{note}</p>
    </div>
  );
}

// 列の上の字の名前（今のゴシック体で小さく）
function ColumnName({ name, note }: { name: string; note: string }) {
  return (
    <div className="mb-8 pb-2 border-b border-foreground/20">
      <p className="text-sm font-bold text-foreground">{name}</p>
      <p className="text-[11px] text-muted">{note}</p>
    </div>
  );
}

// 本物のカード（しゅうまい）。スマホではメニューのページと同じ2列の幅、lg 以上は名物の欄の3列と同じくらい（約 300px）
function Card({ item, nameClassName }: { item: SpecialtyItem | undefined; nameClassName: string }) {
  if (!item) return null;
  return (
    <ol className="flex flex-wrap justify-center">
      <SpecialtyCard
        item={item}
        index={0}
        seed={7000}
        widthClass="w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2rem)/2)] lg:w-full lg:max-w-[300px]"
        nameClassName={nameClassName}
      />
    </ol>
  );
}

// 縦書きの場面の見出し（Scene.tsx。「名物」はふつうの大きさ、「今日も桃谷で、」は結びの大きい方）
function SceneHeadings({ withClosing = true }: { withClosing?: boolean }) {
  return (
    <div className="flex flex-row-reverse justify-center items-start gap-10 text-foreground">
      <p className={`${F} [writing-mode:vertical-rl] text-[1.75rem] md:text-[2rem] leading-[1.6] tracking-[0.16em] whitespace-nowrap`}>
        きたげんの名物。
      </p>
      {withClosing && (
        <p className={`${F} [writing-mode:vertical-rl] text-[2.25rem] md:text-[2.875rem] leading-[1.6] tracking-[0.16em] whitespace-nowrap`}>
          今日も桃谷で、
        </p>
      )}
    </div>
  );
}

// ページの見出し（/info・/menu/dinner の h1）
function PageHeading({ children }: { children: ReactNode }) {
  return <p className={`${F} text-3xl md:text-4xl text-foreground text-center`}>{children}</p>;
}

// 欄の見出し（/info の欄の見出し・名物の欄の小見出し）
function SectionHeading({ children }: { children: ReactNode }) {
  return <p className={`${F} text-base md:text-lg text-accent-dark pb-2 border-b border-accent/25`}>{children}</p>;
}

// 1つの字の列（中身は全部その字）
function Column({ font, item }: { font: FontOption; item: SpecialtyItem | undefined }) {
  const vars = { "--cmp-font": font.family, "--cmp-weight": font.weight } as CSSProperties;
  return (
    <div style={vars} className="min-w-0">
      <ColumnName name={font.name} note={font.note} />

      <div className="flex flex-col gap-10">
        {/* 本物のカード（品名だけこの字。ひとこと・値段は今の字のまま）。
            列のいちばん上に置く（パソコンでは横にそろう。絵の動きも、ページの下の方より先に進み終わる） */}
        <div>
          <Label>本物のカード（品名だけこの字）</Label>
          <Card item={item} nameClassName={F} />
        </div>

        <div>
          <Label>トップの場面の見出し</Label>
          <SceneHeadings />
        </div>

        <div>
          <Label>ページの見出し</Label>
          <div className="space-y-3">
            <PageHeading>店舗情報</PageHeading>
            <PageHeading>ディナーメニュー</PageHeading>
          </div>
        </div>

        <div>
          <Label>欄の見出し</Label>
          <div className="space-y-5">
            {["営業時間", "アクセス", "料理", "お飲みもの"].map((t) => (
              <SectionHeading key={t}>{t}</SectionHeading>
            ))}
          </div>
        </div>

        {/* カードの品名（名物のカード。スマホ 13〜14px、md 以上 18px） */}
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

// 使い分けの例の列：大きい見出し（場面・ページ・欄）は筆の字、カードの品名はクレー
function MixColumn({ brush, item }: { brush: FontOption; item: SpecialtyItem | undefined }) {
  const vars = {
    "--cmp-font": brush.family,
    "--cmp-weight": brush.weight,
    "--cmp-card-font": KLEE.family,
    "--cmp-card-weight": KLEE.weight,
  } as CSSProperties;
  return (
    <div style={vars} className="min-w-0">
      <ColumnName name={`${brush.name} ＋ クレー`} note={`見出し：${brush.note}／カードの品名：${KLEE.note}`} />

      <div className="flex flex-col gap-10">
        <div>
          <Label>本物のカード（品名はクレー）</Label>
          <Card item={item} nameClassName={F_CARD} />
        </div>

        <div>
          <Label>トップの場面の見出し（筆）</Label>
          <SceneHeadings withClosing={false} />
        </div>

        <div>
          <Label>ページの見出し（筆）</Label>
          <PageHeading>店舗情報</PageHeading>
        </div>

        <div>
          <Label>欄の見出し（筆）</Label>
          <SectionHeading>営業時間</SectionHeading>
        </div>
      </div>
    </div>
  );
}

// 列の並べ方。どの組も同じ列の幅（lg 以上 4列）
const GRID = "grid gap-16 md:gap-20 lg:grid-cols-4 lg:gap-8";

export default async function FontComparePage() {
  const cards = await getSpecialtyCards();
  const shumai = cards.food.find((i) => i.art === "seiro") ?? cards.food[0];

  return (
    <div className="min-h-screen">
      <section className="section-warm border-b border-border py-12 md:py-16 text-center">
        <SectionInner>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">見出しの字の見比べ</h1>
          <p className="text-sm text-muted">本文・数字は今の字のまま。見出しだけを7つの字で並べています。</p>
        </SectionInner>
      </section>

      {/* 和紙の地（メニューのページの名物の欄と同じ section-deep。scene はカードの絵の線のため） */}
      <section className="scene section-deep py-16 md:py-20">
        <SectionInner maxW="max-w-[1440px]">
          <div className="flex flex-col gap-24 md:gap-28">
            <div>
              <GroupHeading title="1. やわらかい手書き" note="今の明朝と、手書き風の3つ" />
              <div className={GRID}>
                {SOFT_FONTS.map((font) => (
                  <Column key={font.name} font={font} item={shumai} />
                ))}
              </div>
            </div>

            <div>
              <GroupHeading title="2. 太い筆" note="ずっしり太い、筆に近い3つ（どれも太さは1つだけ）" />
              <div className={GRID}>
                {BRUSH_FONTS.map((font) => (
                  <Column key={font.name} font={font} item={shumai} />
                ))}
              </div>
            </div>

            <div>
              <GroupHeading title="3. 使い分けの例" note="大きい見出しは筆の字、カードの品名はクレー" />
              <div className={GRID}>
                {BRUSH_FONTS.map((font) => (
                  <MixColumn key={font.name} brush={font} item={shumai} />
                ))}
              </div>
            </div>
          </div>
        </SectionInner>
      </section>
    </div>
  );
}
