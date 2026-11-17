import type { ComponentType, ReactNode } from "react";
import SectionInner from "../SectionInner";
import ScenePlayOnView from "./ScenePlayOnView";
import type { SceneTone } from "./Scene";
import SeiroIllustration from "./SeiroIllustration";
import TeppanIllustration from "./TeppanIllustration";
import KaraageIllustration from "./KaraageIllustration";
import KakuniIllustration from "./KakuniIllustration";
import KushiIllustration from "./KushiIllustration";
import HiyayakkoIllustration from "./HiyayakkoIllustration";
import BeerIllustration from "./BeerIllustration";
import SakeIllustration from "./SakeIllustration";
import SoftDrinkIllustration from "./SoftDrinkIllustration";
import CardFrame from "./CardFrame";
import type { SpecialtyArt, SpecialtyCards, SpecialtyItem } from "../../content";
import { formatSpecialtyPrice } from "../../content/specialty-prices";
import "./scenes.css";

// ─── 「きたげんの名物」の欄（料理6品・お飲みもの3つの、イラストのカード） ───
// ディナーメニュー（app/menu/dinner/page.tsx。/menu から転送）のいちばん上、ページの見出しと目次の帯のすぐ下に置く。
// トップの名物の場面（せいろの絵）の入口「お品書きを見る →」がこのページに来る。
// ・品・ひとこと・値段・絵の種類は content/specialty-prices.ts（SPECIALTY_FOOD・SPECIALTY_DRINKS）。並ぶ順もそのまま
// ・欄の中は「料理」と「お飲みもの」の2つ。小見出しは、このページのほかの小見出し（dinner/page.tsx の SubHeading）と
//   同じ大きさ・色・下線で、字だけ明朝体にする
// ・背景：tone で section-*（ページの前後の欄と色が変わるものを渡す）。上下の余白はメニューのページの欄にそろえる
// ・明朝体（Noto Serif JP 500・700）は、この欄を置くページで読み込む
//
// ・並べ方（カードどうしは重ねない。カードの間は、md より狭い画面 24px、md 以上 32px）
//   - 料理：lg（1024px）以上は 3つずつ2段、lg より狭い画面は 2つずつ3段
//   - お飲みもの：lg 以上は 3つを1段、lg より狭い画面は 2つと1つ（最後の1つは真ん中）
//   - flex-wrap と justify-center で並べるので、段の最後の1つは自然に真ん中に来る
//   - 欄の幅：lg 以上は 960px まで、md〜lg は 720px まで（カードが大きくなりすぎないように）
//   - カードの幅：(欄の幅 − 間) ÷ 列の数。lg の 1024px の画面で約 299px、md の 768px の画面で約 336px、
//     320px の画面で 124px（中の幅 108px。品名はいちばん長い「自家製しゅうまい」8字が 13px で1行に収まる）
// ・カードの中身（上から）：
//   番号（漢数字。左上の角、明朝体 700、accent）→ 動く線画（カードの幅いっぱいの正方形の場所。絵はその中に収める）→
//   品名（横書き、明朝体 700）→ ひとこと（横書き、1行。md より狭い画面では出さない）→
//   値段（値段のある品だけ。料理は「¥580（税込）」、お飲みものは「¥450〜（税込）」）
// ・カードの色：section-light（#F7F3EB と同じ和紙の模様）。欄の背景（section-deep）より少し明るい。
//   絵の中の「後ろの線を隠す塗り」（--scene-paper）もカードの色にする（scenes.css の .scene-card）
// ・カードのふち：筆ペンで描いたような、少し揺らぎのある四角い線（CardFrame。乱数なし）。影はごく薄く
// ・絵の線の太さは scenes.css の .scene-svg-card（絵の幅に合わせて段に分ける）
// ・各カードの動きは、その絵が画面に入る位置に合わせて、それぞれ進む（絵ごとに ScenePlayOnView で囲む）
// ・9枚とも同じ決まり（scenes.css の「名物の欄の決まり」）：絵の線のいちばん下が画面に入ったら始まり、
//   絵の真ん中が見えている画面の真ん中に来たら完成。列によるずらしはしない（同じ段のカードは同時に進む）

const ART_CLASS = "block h-full w-full text-foreground scene-svg-card";

// 絵の種類と部品（content/specialty-prices.ts の SpecialtyArt）
const ART: Record<SpecialtyArt, ComponentType<{ className?: string }>> = {
  seiro: SeiroIllustration,
  teppan: TeppanIllustration,
  karaage: KaraageIllustration,
  kakuni: KakuniIllustration,
  kushi: KushiIllustration,
  hiyayakko: HiyayakkoIllustration,
  beer: BeerIllustration,
  sake: SakeIllustration,
  soft: SoftDrinkIllustration,
};

const KANJI_NUM = ["壱", "弐", "参", "肆", "伍", "陸", "漆", "捌", "玖", "拾"] as const;

// カードのふち（筆ペンで描いた四角い枠）は CardFrame.tsx（店舗情報のページの囲みでも使う）

// ─── 1枚のカード ───
// 文字の見比べのページ（app/font-compare/page.tsx）でも、この本物のカードを使う。そのための口が2つある（ふだんは渡さない）
// ・widthClass：カードの幅（ふだんはこの欄の並べ方の幅）
// ・nameClassName：品名の字（ふだんは明朝体 700）
const CARD_WIDTH = "w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]";
const NAME_FONT = "font-serif font-bold";

export function SpecialtyCard({
  item,
  index,
  seed,
  widthClass = CARD_WIDTH,
  nameClassName = NAME_FONT,
}: {
  item: SpecialtyItem;
  index: number;
  seed: number;
  widthClass?: string;
  nameClassName?: string;
}) {
  const Art = ART[item.art];
  return (
    <li
      className={`scene-card section-light relative ${widthClass} px-2 min-[400px]:px-2.5 pt-7 pb-4 md:px-5 md:pt-9 md:pb-6 shadow-[0_1px_4px_rgba(47,36,28,0.06)]`}
    >
      <CardFrame seed={seed} />

      {/* 番号（左上の角） */}
      <span className="absolute left-2.5 top-1.5 md:left-4 md:top-3 font-serif font-bold text-[13px] md:text-[15px] leading-none md:leading-normal text-accent">
        {KANJI_NUM[index]}
      </span>

      {/* 絵（カードの幅いっぱいの正方形の場所。絵はその中に収める） */}
      <ScenePlayOnView className="aspect-square w-full">
        <Art className={ART_CLASS} />
      </ScenePlayOnView>

      <div className="mt-2 md:mt-4 text-center">
        <h4 className={`${nameClassName} text-foreground text-[13px] min-[400px]:text-[14px] md:text-[18px] leading-snug md:tracking-wider [word-break:auto-phrase]`}>
          {item.name}
        </h4>
        <p className="mt-1.5 hidden md:block whitespace-nowrap text-[13px] lg:text-[14px] text-muted leading-relaxed">
          {item.tagline}
        </p>
        {item.price !== undefined && (
          <p className="mt-1.5 md:mt-2 text-[12px] md:text-[14px] tracking-wider text-foreground tabular-nums">
            {formatSpecialtyPrice(item.price, item.priceFrom)}
          </p>
        )}
      </div>
    </li>
  );
}

// ─── 料理・お飲みものの、それぞれの組 ───
function CardGroup({ heading, items, seedBase }: { heading: string; items: readonly SpecialtyItem[]; seedBase: number }) {
  return (
    <div className="mx-auto w-full md:max-w-[720px] lg:max-w-[960px]">
      {/* 小見出し（dinner/page.tsx の SubHeading と同じ大きさ・色・下線。字は明朝体） */}
      <h3 className="font-serif text-base md:text-lg font-bold text-accent-dark mb-6 md:mb-8 pb-2 border-b border-accent/25">
        {heading}
      </h3>
      <ol className="flex flex-wrap justify-center gap-6 md:gap-8">
        {items.map((item, i) => (
          <SpecialtyCard key={item.name} item={item} index={i} seed={seedBase + i * 200} />
        ))}
      </ol>
    </div>
  );
}

// afterFood：「料理」の組のすぐ下、「お飲みもの」の前に差し込むもの（ディナーメニューでは、テイクアウトのご案内 TakeoutNote）
export default function Specialties({
  tone,
  items,
  id,
  afterFood,
}: {
  tone: SceneTone;
  items: SpecialtyCards;
  id?: string;
  afterFood?: ReactNode;
}) {
  return (
    <section id={id} className={`scene scroll-mt-32 py-20 md:py-24 section-${tone}`}>
      <SectionInner>
        {/* 欄の見出し（縦書き・明朝体 700）。欄のいちばん上の真ん中 */}
        <div className="mb-14 lg:mb-16 flex justify-center">
          <h2 className="font-serif [writing-mode:vertical-rl] text-foreground text-[1.75rem] md:text-[2rem] font-bold leading-[1.6] tracking-[0.16em] whitespace-nowrap">
            きたげんの名物
          </h2>
        </div>

        <div className="flex flex-col gap-16 md:gap-20">
          <CardGroup heading="料理" items={items.food} seedBase={7000} />
          {afterFood}
          <CardGroup heading="お飲みもの" items={items.drinks} seedBase={9000} />
        </div>
      </SectionInner>
    </section>
  );
}
