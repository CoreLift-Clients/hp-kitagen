import type { ReactNode } from "react";
import SectionInner from "../SectionInner";
import ScenePlayOnView from "./ScenePlayOnView";
import { SceneLink, SceneText, type SceneTone } from "./Scene";
import SeiroIllustration from "./SeiroIllustration";
import TeppanIllustration from "./TeppanIllustration";
import BeerIllustration from "./BeerIllustration";
import { jitter, smooth, type P } from "./draw";
import type { SpecialtyCardId } from "../../content";
import { formatTaxIncludedPrice } from "../../content/specialties";
import "./scenes.css";

// ─── トップの「名物」の欄（しゅうまい・鉄鍋餃子・生ビール） ───
// 3品をそれぞれ和紙のカード（台紙）に載せ、斜めに少しずつ重ねる。欄の最後に「お品書きを見る →」を1つだけ置く。
// ・カードの中身：番号（壱・弐・参。左上の角、明朝体、accent）・線画・縦書きの見出しと文・値段（値段がある品だけ）
// ・カードの色：section-light（#F7F3EB と同じ和紙の模様）。欄の背景（section-deep）より少し明るい。
//   絵の中の「後ろの線を隠す塗り」（--scene-paper）もカードの色にする（scenes.css の .scene-card）
// ・カードのふち：筆ペンで描いたような、少し揺らぎのある四角い線（CardFrame。乱数なし）。影はごく薄く
// ・湯気・泡などはカードの上のふちから少しはみ出す（絵を -mt で上に出す。カードは overflow を切らない）
// ・重ね方
//   - lg 以上：1枚目は左上、2枚目は真ん中、3枚目は右下。あとのカードが上（z-index）。
//     前のカードの右下の角に、次のカードの左上の角が縦横とも 56px 重なる。
//     カードの幅は (欄の幅 ＋ 56px × 2) ÷ 3。欄の幅 1088px（xl 以上）で 400px、lg の 1024px の画面（欄の幅 960px）で約 357px。
//     2枚目・3枚目の左の位置は「(カードの幅 − 56px) × 1・2」
//   - lg より狭い画面：カードの幅は画面の幅の 85%。縦に並べ、左・右・左に画面の幅の 7% ずらす。上下に 24px 重ねる。
//     カードを左右の余白（px-6）の外まで使えるよう、並びの囲みは -mx-6 で画面の幅いっぱいにする
//   - 重なるのはカードの角の余白（左右と下の余白 20〜28px ＋ 文は真ん中寄せ）だけなので、文や値段は隠れない
// ・「きたげんの名物」の見出し：lg 以上は1枚目のカードのすぐ右上、lg より狭い画面は上の真ん中
// ・絵の大きさ：カードの幅から左右の余白を引いた幅（lg 以上 約 300〜344px、320px の画面で約 232px）。
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
  // 置く位置（lg より狭い画面／lg 以上）と重なり
  place: string;
  // 絵を上に出す量。湯気・油はねのある品は上のふちから少しはみ出させる。
  // 生ビールは注ぎ口が上にあり、はみ出すと前のカードの値段に近づくので、少しだけにする（泡の粒はカードの中）
  artLift: string;
};

const CARDS: readonly Card[] = [
  {
    id: "shumai",
    num: "壱",
    art: <SeiroIllustration className={ART} />,
    heading: "しゅうまい。",
    lines: ["自家製の、", "蒸したてを肴に、", "まずは一杯。"],
    place: "z-[1] ml-[4vw] lg:ml-0",
    artLift: "-mt-10 lg:-mt-12",
  },
  {
    id: "gyoza",
    num: "弐",
    art: <TeppanIllustration className={ART} />,
    heading: "鉄鍋餃子。",
    lines: ["こんがり焼いて、", "一品一品、", "手間を惜しまず。"],
    place: "z-[2] ml-[11vw] -mt-6 lg:ml-[calc(100%/3-18.667px)] lg:-mt-14",
    artLift: "-mt-10 lg:-mt-12",
  },
  {
    id: "beer",
    num: "参",
    art: <BeerIllustration className={ART} />,
    heading: "生ビール。",
    lines: ["名物と一緒に、", "乾杯。"],
    place: "z-[3] ml-[4vw] -mt-6 lg:ml-[calc(200%/3-37.333px)] lg:-mt-14",
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
  prices,
}: {
  tone: SceneTone;
  prices: Record<SpecialtyCardId, number | undefined>;
}) {
  return (
    <section className={`scene py-28 md:py-40 section-${tone}`}>
      <SectionInner>
        <div className="relative">
          {/* 欄の見出し（縦書き・明朝体 700）。lg 以上は1枚目のカードのすぐ右上 */}
          <div className="mb-14 flex justify-center lg:absolute lg:top-0 lg:left-[calc((100%+112px)/3+28px)] lg:mb-0">
            <h2 className="font-serif [writing-mode:vertical-rl] text-foreground text-[1.75rem] md:text-[2rem] font-bold leading-[1.6] tracking-[0.16em] whitespace-nowrap">
              きたげんの名物
            </h2>
          </div>

          <ol className="-mx-6 md:-mx-8 lg:mx-0">
            {CARDS.map((card, i) => {
              const price = prices[card.id];
              return (
                <li
                  key={card.id}
                  className={`scene-card section-light relative w-[85vw] lg:w-[calc((100%+112px)/3)] px-5 pt-5 pb-7 lg:px-7 lg:pt-6 lg:pb-8 shadow-[0_1px_4px_rgba(47,36,28,0.06)] ${card.place}`}
                >
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
                </li>
              );
            })}
          </ol>

          <div className="mt-16 flex justify-center lg:justify-end">
            <SceneLink href="/menu">お品書きを見る →</SceneLink>
          </div>
        </div>
      </SectionInner>
    </section>
  );
}
