import type { ReactNode } from "react";
import SectionInner from "../SectionInner";
import ScenePlayOnView from "./ScenePlayOnView";
import { SceneText, type SceneTone } from "./Scene";
import SeiroIllustration from "./SeiroIllustration";
import TeppanIllustration from "./TeppanIllustration";
import BeerIllustration from "./BeerIllustration";
import { jitter, smooth, type P } from "./draw";
import type { SpecialtyCardId, SpecialtyCardContent } from "../../content";
import { formatTaxIncludedPrice } from "../../content/specialties";
import "./scenes.css";

// ─── 「名物」の欄（しゅうまい・鉄鍋餃子・生ビール） ───
// ディナーメニュー（app/menu/dinner/page.tsx。/menu から転送）のいちばん上、ページの見出しと目次の帯のすぐ下に置く。
// トップの名物は、席・宴・結びと同じ共通の部品の場面（せいろの絵）で、その入口「お品書きを見る →」がこのページに来る。
// 1品ずつ、和紙のカード（台紙）と「こだわりの文」を左右に並べ、品ごとに左右を入れ替える（ジグザグ）。
// カードどうしは重ねない。同じページへのリンクになるので、欄の最後の「お品書きを見る →」は置かない。
// ・背景：tone で section-*（ページの前後の欄と色が変わるものを渡す）。上下の余白はメニューのページの欄にそろえる。
// ・明朝体（Noto Serif JP 500・700）は、この欄を置くページで読み込む
// ・カードの中身：番号（壱・弐・参。左上の角、明朝体、accent）・線画・縦書きの見出しと文・値段（値段がある品だけ）
// ・カードの色：section-light（#F7F3EB と同じ和紙の模様）。欄の背景（section-deep）より少し明るい。
//   絵の中の「後ろの線を隠す塗り」（--scene-paper）もカードの色にする（scenes.css の .scene-card）
// ・カードのふち：筆ペンで描いたような、少し揺らぎのある四角い線（CardFrame。乱数なし）。影はごく薄く
// ・湯気・泡などはカードの上のふちから少しはみ出す（絵を -mt で上に出す。カードは overflow を切らない）
// ・こだわりの文：content/specialty-prices.ts の text。横書きの1つの段落。品名は繰り返さない。
//   字は OUR STORY の本文と同じ決まり（lg 以上は明朝体 500、lg より狭い画面はゴシック体 400）。
//   大きさは lg より狭い画面 18px、lg 16px、xl 18px。文の箱の幅は lg 380px・xl 400px（1行 約22〜23字）
// ・並べ方
//   - lg（1024px）以上：カード（幅 400px）と文を横に並べ、間は 80px。
//     壱・参はカードが左・文が右、弐はカードが右・文が左（lg:flex-row-reverse）。
//     lg の 1024px の画面（欄の幅 960px）でも 400 ＋ 80 ＋ 380 ＝ 860px で収まる
//   - lg より狭い画面：カードを上、文を下にして縦に並べる。カードの幅は画面の幅の 85%（md は 400px まで）、真ん中。
//     文の箱もカードと同じ幅（400px まで）。カードと文の間は 40px
//   - 品と品の上下の間は 80px（gap-20。lg 以上はカードどうしの縁から縁、lg より狭い画面は文の下からカードの上まで）
// ・「きたげんの名物」の見出し：欄のいちばん上の真ん中（縦書き）
// ・絵の大きさ：カードの幅から左右の余白を引いた幅（lg 以上 344px、320px の画面で約 232px）。
//   線の太さは scenes.css の .scene-svg-small
// ・各品の動きは、その品の絵が画面に入る位置に合わせて、それぞれ進む（絵ごとに ScenePlayOnView で囲む）
// ・縦書きの横幅：いちばん広いしゅうまいで約 175px。320px の画面のカードの中（約 232px）に収まる

const ART = "block w-full h-auto text-foreground scene-svg-small";

type Card = {
  id: SpecialtyCardId;
  num: string;
  art: ReactNode;
  heading: string;
  lines: readonly string[];
  // lg 以上で、カードを右・文を左に入れ替える品（弐 鉄鍋餃子）
  reverse?: boolean;
  // 絵を上に出す量。湯気・油はねのある品は上のふちから少しはみ出させる。
  // 生ビールは注ぎ口が上にあるので、少しだけにする（泡の粒はカードの中）
  artLift: string;
};

const CARDS: readonly Card[] = [
  {
    id: "shumai",
    num: "壱",
    art: <SeiroIllustration className={ART} />,
    heading: "しゅうまい。",
    lines: ["自家製の、", "蒸したてを肴に、", "まずは一杯。"],
    artLift: "-mt-10 lg:-mt-12",
  },
  {
    id: "gyoza",
    num: "弐",
    art: <TeppanIllustration className={ART} />,
    heading: "鉄鍋餃子。",
    lines: ["こんがり焼いて、", "一品一品、", "手間を惜しまず。"],
    reverse: true,
    artLift: "-mt-10 lg:-mt-12",
  },
  {
    id: "beer",
    num: "参",
    art: <BeerIllustration className={ART} />,
    heading: "生ビール。",
    lines: ["名物と一緒に、", "乾杯。"],
    artLift: "-mt-1 lg:-mt-2",
  },
];

// ─── カードのふち（筆ペンで描いた四角い枠） ───
// viewBox は 0〜100 の正方形で描き、カードの大きさに合わせて伸ばす（preserveAspectRatio="none"）。
// 線の太さは伸ばしても変わらないよう vector-effect: non-scaling-stroke（scenes.css の .scene-card-frame）。
// 辺はわずかに揺らした点をなめらかな線でつなぎ、角は小さな曲線（Q）で、ほんの少しだけ丸める。
function framePath(seed: number): string {
  const a = 0.6; // 枠の内側へのあき（線が切れないように）
  const b = 100 - a;
  const c = 1.1; // 角の丸み（角から両側へ、この分だけ手前で曲がり始める）
  const amp = 0.28;
  const side = (x0: number, y0: number, x1: number, y1: number, s: number): string => {
    const pts: P[] = [];
    const n = 5;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const edge = i === 0 || i === n ? 0 : 1;
      pts.push([x0 + (x1 - x0) * t + jitter(s + i) * amp * edge, y0 + (y1 - y0) * t + jitter(s + i + 20) * amp * edge]);
    }
    // smooth() の書き出し（M x y）を外し、曲線の部分だけをつなぐ
    return smooth(pts).replace(/^M[^C]*/, "");
  };
  return [
    `M${a + c} ${a}`,
    side(a + c, a, b - c, a, seed), // 上
    `Q${b} ${a} ${b} ${a + c}`,
    side(b, a + c, b, b - c, seed + 40), // 右
    `Q${b} ${b} ${b - c} ${b}`,
    side(b - c, b, a + c, b, seed + 80), // 下
    `Q${a} ${b} ${a} ${b - c}`,
    side(a, b - c, a, a + c, seed + 120), // 左
    `Q${a} ${a} ${a + c} ${a}`,
    "Z",
  ].join(" ");
}

function CardFrame({ seed }: { seed: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-foreground"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={framePath(seed)} className="scene-card-frame" />
    </svg>
  );
}

export default function Specialties({
  tone,
  items,
  id,
}: {
  tone: SceneTone;
  items: Record<SpecialtyCardId, SpecialtyCardContent>;
  id?: string;
}) {
  return (
    <section id={id} className={`scene scroll-mt-32 py-20 md:py-24 section-${tone}`}>
      <SectionInner>
        {/* 欄の見出し（縦書き・明朝体 700）。欄のいちばん上の真ん中 */}
        <div className="mb-16 lg:mb-20 flex justify-center">
          <h2 className="font-serif [writing-mode:vertical-rl] text-foreground text-[1.75rem] md:text-[2rem] font-bold leading-[1.6] tracking-[0.16em] whitespace-nowrap">
            きたげんの名物
          </h2>
        </div>

        <ol className="flex flex-col gap-20">
          {CARDS.map((card, i) => {
            const { price, text } = items[card.id];
            return (
              <li
                key={card.id}
                className={`flex flex-col items-center gap-10 lg:justify-center lg:gap-20 ${
                  card.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                <div className="scene-card section-light relative w-[85vw] max-w-[400px] lg:w-[400px] lg:shrink-0 px-5 pt-5 pb-7 lg:px-7 lg:pt-6 lg:pb-8 shadow-[0_1px_4px_rgba(47,36,28,0.06)]">
                  <CardFrame seed={7000 + i * 200} />

                  {/* 番号（左上の角） */}
                  <span className="absolute left-4 top-3 lg:left-5 lg:top-4 font-serif font-bold text-[15px] text-accent">
                    {card.num}
                  </span>

                  {/* 絵。上のふちから湯気などが少しはみ出すよう、上に出す */}
                  <ScenePlayOnView className={`relative ${card.artLift}`}>{card.art}</ScenePlayOnView>

                  <div className="mt-6 flex flex-col items-center">
                    <SceneText heading={card.heading} lines={card.lines} level="h3" compact />
                    {price !== undefined && (
                      <p className="mt-6 text-[14px] tracking-wider text-foreground tabular-nums">
                        {formatTaxIncludedPrice(price)}
                      </p>
                    )}
                  </div>
                </div>

                {/* こだわりの文（横書き・1つの段落） */}
                <p className="w-[85vw] max-w-[400px] lg:max-w-none lg:w-[380px] xl:w-[400px] lg:shrink-0 text-start text-[18px] lg:text-[16px] xl:text-[18px] font-sans font-normal lg:font-serif lg:font-medium text-foreground leading-[2] tracking-wide [word-break:auto-phrase] text-pretty">
                  {text}
                </p>
              </li>
            );
          })}
        </ol>
      </SectionInner>
    </section>
  );
}
