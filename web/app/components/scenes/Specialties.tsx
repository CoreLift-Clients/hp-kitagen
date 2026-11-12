import type { ReactNode } from "react";
import SectionInner from "../SectionInner";
import ScenePlayOnView from "./ScenePlayOnView";
import { SceneLink, SceneText, type SceneTone } from "./Scene";
import SeiroIllustration from "./SeiroIllustration";
import TeppanIllustration from "./TeppanIllustration";
import BeerIllustration from "./BeerIllustration";
import "./scenes.css";

// ─── トップの「名物」の欄（しゅうまい・鉄鍋餃子・生ビール） ───
// 欄の見出し「きたげんの名物」の下に、3品を「線画＋その横（スマホは下）の縦書きの見出しと文」で、階段のように斜めに置く。
// 欄の最後に「お品書きを見る →」を1つだけ置く。
// ・見出しの位置：lg 以上は欄の右上（右端・上端にそろえる）、lg より狭い画面は欄の上の真ん中
// ・3品の置き方
//   - lg 以上：左上（しゅうまい）→ 真ん中（鉄鍋餃子）→ 右下（生ビール）。
//     横は self-start・self-center・self-end で左・真ん中・右に寄せる。
//     縦は上から順に積む（2品目は mt-6 で少しあけ、3品目は -mt-6 で少し詰める）。
//     1品目の縦書きの下の端と2品目の湯気の上の端が横に重なる位置にあるので、2品目を上に詰めるとぶつかる
//   - lg より狭い画面：縦に並べ、左・右・左に寄せる（self-start・self-end・self-start）。
//     縦書きは絵の下。320px の画面では、絵（62vw ≒ 198px）が左右に約 74px ずれる
// ・お品書きの入口の位置：lg 以上は右下、lg より狭い画面は下の真ん中
// ・絵の大きさ：lg 以上 幅 280px、lg より狭い画面は画面の幅の 62%（最大 280px）。線の太さは scenes.css の .scene-svg-small
// ・各品の動きは、その品の絵が画面に入る位置に合わせて、それぞれ進む（絵ごとに ScenePlayOnView で囲む）
// ・縦書きの横幅（lg より狭い画面）：いちばん広いしゅうまいで約 220px。320px の画面（左右の余白を除いて 272px）に収まる

const ART = "block w-[62vw] max-w-[280px] lg:w-[280px] h-auto text-foreground scene-svg-small";

type Item = {
  key: string;
  art: ReactNode;
  heading: string;
  lines: readonly string[];
  // 置く位置（スマホ／パソコン）
  place: string;
};

const ITEMS: readonly Item[] = [
  {
    key: "shumai",
    art: <SeiroIllustration className={ART} />,
    heading: "自家製の、しゅうまい。",
    lines: ["蒸したての", "しゅうまいを肴に、", "まずは一杯。"],
    place: "self-start lg:self-start",
  },
  {
    key: "gyoza",
    art: <TeppanIllustration className={ART} />,
    heading: "こんがり焼いた、鉄鍋餃子。",
    lines: ["手間を惜しまず、", "一品一品。"],
    place: "self-end lg:self-center lg:mt-6",
  },
  {
    key: "beer",
    art: <BeerIllustration className={ART} />,
    heading: "まずは、生ビール。",
    lines: ["名物と一緒に、", "乾杯。"],
    place: "self-start lg:self-end lg:-mt-6",
  },
];

export default function Specialties({ tone }: { tone: SceneTone }) {
  return (
    <section className={`scene py-28 md:py-40 section-${tone}`}>
      <SectionInner>
        <div className="relative">
          {/* 欄の見出し（縦書き・明朝体 700） */}
          <div className="flex justify-center lg:absolute lg:right-0 lg:top-0">
            <h2 className="font-serif [writing-mode:vertical-rl] text-foreground text-[1.75rem] md:text-[2rem] font-bold leading-[1.6] tracking-[0.16em] whitespace-nowrap">
              きたげんの名物
            </h2>
          </div>

          <ol className="mt-16 lg:mt-0 flex flex-col gap-20 lg:gap-0">
            {ITEMS.map((item) => (
              <li key={item.key} className={item.place}>
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-10">
                  <ScenePlayOnView className="shrink-0">{item.art}</ScenePlayOnView>
                  <SceneText heading={item.heading} lines={item.lines} level="h3" compact />
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-16 lg:mt-12 flex justify-center lg:justify-end">
            <SceneLink href="/menu">お品書きを見る →</SceneLink>
          </div>
        </div>
      </SectionInner>
    </section>
  );
}
