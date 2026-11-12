import type { ReactNode } from "react";
import Link from "next/link";
import SectionInner from "../SectionInner";
import ScenePlayOnView from "./ScenePlayOnView";
import "./scenes.css";

// ─── トップの線画の場面（共通の部品） ───
// トップは「場面をめくるように淡々と進む」入口。各場面は次の4つだけにする（詳しい説明は遷移先のページ）。
//   1) 動く線画（art。場面ごとの *Illustration.tsx。飾りなので aria-hidden）
//   2) 縦書きの短い見出し（heading。明朝体 700）
//   3) 縦書きの短い文（lines。明朝体 500。配列の1つが1行）
//   4) 詳しいページへの入口（action。SceneLink などを渡す）
// ・並び：md 以上は「左に絵、右に縦書き」。reverse のときは左右を入れ替える（場面ごとに互い違いにする）。
//   md より狭い画面は「上に絵、下に縦書きを真ん中に」
// ・高さ：「最低1画面」の決まり（section-screen）は当てない。中身に合わせた高さで、上下にゆったり余白をとる
// ・背景：tone で section-light・section-warm・section-deep のどれか。隣の場面と色が変わるように順に使う。
//   絵の中の「後ろの線を隠す塗り」（--scene-paper）も、この背景の色になる（scenes.css）
// ・絵の大きさ：md 以上 幅 400px、スマホ 画面の幅の 70%
// ・縦書きの横幅：見出し1列（約 45px）＋文3行（約 102px）＋あき（約 70px）で約 220px。
//   320px の画面（左右の余白を除いて 272px）にも収まる。文を4行以上にするときは、ここの計算を見直すこと
export type SceneTone = "light" | "warm" | "deep";

export default function Scene({
  art,
  heading,
  lines,
  action,
  tone,
  reverse = false,
  id,
}: {
  art: ReactNode;
  heading: string;
  lines: readonly string[];
  action: ReactNode;
  tone: SceneTone;
  reverse?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`scene py-28 md:py-40 section-${tone}`}>
      <SectionInner>
        <div
          className={`flex flex-col items-center justify-center gap-14 md:gap-20 lg:gap-24 ${
            reverse ? "md:flex-row-reverse" : "md:flex-row"
          }`}
        >
          <ScenePlayOnView className="shrink-0">{art}</ScenePlayOnView>

          <div className="flex max-w-full flex-col items-center">
            <SceneText heading={heading} lines={lines} />
            <div className="mt-10">{action}</div>
          </div>
        </div>
      </SectionInner>
    </section>
  );
}

// ─── 結びの場面（絵なし、文字だけで締める） ───
// トップのいちばん最後の場面。絵は置かず、縦書きの見出しと文、その下の入口を、欄の横の真ん中にそろえる。
// ・絵がない分、見出しと文を一段大きくする（SceneText の large）
// ・上下の余白・背景は Scene と同じ（py-28 md:py-40 ＝ スマホ 112px・md 以上 160px、tone で背景）
// ・縦書きの横幅：320px の画面では 見出し1列（36px × 1.6 ≒ 58px）＋あき（28px）＋文1行（18px × 2 ＝ 36px）で約 122px。
//   左右の余白を除いた 272px に収まる。文を増やすときは 1行 36px ずつ足して見直すこと
export function TextOnlyScene({
  heading,
  lines,
  action,
  tone,
  id,
}: {
  heading: string;
  lines: readonly string[];
  action: ReactNode;
  tone: SceneTone;
  id?: string;
}) {
  return (
    <section id={id} className={`scene py-28 md:py-40 section-${tone}`}>
      <SectionInner>
        <div className="flex flex-col items-center text-center">
          <SceneText heading={heading} lines={lines} large />
          <div className="mt-10 flex justify-center">{action}</div>
        </div>
      </SectionInner>
    </section>
  );
}

// ─── 縦書きの見出しと文 ───
// 右から左へ読み、見出しが右端。高さは見出しの字数で決まる。
// ・見出しは明朝体 700、文は明朝体 500（配列の1つが1行）
// ・level … 見出しの階層（場面は h2。名物の欄の各品は、欄の見出しの下なので h3）
// ・compact … 名物の欄の各品用。lg 以上で字を一段小さくする（絵を小さくした分に合わせる）
// ・large … 結びの場面（TextOnlyScene）用。絵がない分、字を一段大きくする
//   （見出し スマホ 36px・md 以上 46px、文 スマホ 18px・md 以上 20px。見出しと文のあきは普段と同じ）
export function SceneText({
  heading,
  lines,
  level = "h2",
  compact = false,
  large = false,
}: {
  heading: string;
  lines: readonly string[];
  level?: "h2" | "h3";
  compact?: boolean;
  large?: boolean;
}) {
  const Heading = level;
  const headingSize = large
    ? "text-[2.25rem] md:text-[2.875rem]"
    : `text-[1.75rem] md:text-[2rem] ${compact ? "lg:text-[1.625rem]" : ""}`;
  const textSize = large
    ? "text-[18px] md:text-[20px]"
    : `text-[17px] md:text-[18px] ${compact ? "lg:text-[16px]" : ""}`;
  const textGap = `[margin-block-start:1.75rem] md:[margin-block-start:2.25rem] ${
    compact ? "lg:[margin-block-start:1.5rem]" : ""
  }`;
  return (
    <div className="font-serif [writing-mode:vertical-rl] text-foreground">
      <Heading className={`${headingSize} font-bold leading-[1.6] tracking-[0.16em] whitespace-nowrap`}>
        {heading}
      </Heading>
      <p
        className={`${textGap} ${textSize} font-medium leading-[2] tracking-[0.14em] [padding-inline-start:2.5em]`}
      >
        {lines.map((l) => (
          <span key={l} className="block whitespace-nowrap">
            {l}
          </span>
        ))}
      </p>
    </div>
  );
}

// 入口の小さなリンク（横書き）。external のときは新しいタブで開く
export const SCENE_LINK_CLASS =
  "text-sm tracking-wider text-accent hover:text-accent-dark underline underline-offset-4 decoration-accent/40 transition-colors duration-200";

export function SceneLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={SCENE_LINK_CLASS}>
      {children}
    </Link>
  );
}
