import type { CSSProperties } from "react";
import { animAt } from "./draw";

// ─── 炭酸の泡（時間でずっと下から上へ立ちのぼる粒。コーラ〈SoftDrinkIllustration.tsx〉とビール〈BeerIllustration.tsx〉で使う） ───
// ・粒は線なしの丸（circle）。色は tone の class で決める（scenes.css の .cola-bubble・.beer-fizz）
// ・立ちのぼる動き：scenes.css の fizz-rise。各粒の --from（底の近く）から --to（液の上の端）まで、まっすぐ上へ。
//   途中で横に少しゆれる（--wx）。出始めと上の端の手前で、すっと見えなくなる。
//   粒ごとに、立ちのぼる長さ（dur 秒）と始まる時刻（delay 秒。負の数で途中から）をずらす（乱数なし）
// ・液の中だけ：液の形（clip）で切り抜く。グラス・ジョッキの線、氷・ストローなどは、この部品より後ろ（上）に描くこと
// ・見え始め：囲みの g（.scene-anim）が、スクロールの段 range で、すっと現れる（scene-fade-up。ずれ 0）。
//   スクロールで進めるのは、この現れ方だけ。立ちのぼる動きは .scene-anim ではないので、
//   CSS の仕組み（animation-timeline）でも、iPhone の JS で進める形（sceneScroll.ts）でも、時間で動き続ける
// ・場面が画面の外にあるあいだは止める（scenes.css。ScenePlayOnView の data-inview="false"）
// ・prefers-reduced-motion のとき：動きは付かないので、各粒の止まっているときの位置（y）に散らばって見える
// ・JavaScript が動かないときも、止まっているときの位置に見える

export type FizzBubble = {
  x: number;
  /** 止まっているとき（prefers-reduced-motion）の y */
  y: number;
  /** 半径 */
  r: number;
  /** 立ちのぼる長さ（秒） */
  dur: number;
  /** 始まる時刻（秒。負の数で途中から） */
  delay: number;
  /** 途中の横のゆれ（px。付けないときは 0 ＝ まっすぐ） */
  wx?: number;
};

export function Fizz({
  id,
  clip,
  bubbles,
  bottom,
  top,
  range,
  className,
  tone,
}: {
  /** 切り抜きの id（ページの中で重ならない名前） */
  id: string;
  /** 液の形（path の d）。この中だけに見せる */
  clip: string;
  bubbles: readonly FizzBubble[];
  /** 立ちのぼり始める y（底の近く） */
  bottom: number;
  /** 消える y（液の上の端） */
  top: number;
  /** 見え始めるスクロールの段（anim の from・to） */
  range: readonly [number, number];
  /** 囲みの g の class（部品の名前） */
  className: string;
  /** 粒の色の class */
  tone: string;
}) {
  return (
    <g className={`${className} scene-anim`} style={animAt("scene-fade-up", range, { "--dy": "0px" })}>
      <clipPath id={id}>
        <path d={clip} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {bubbles.map(({ x, y, r, dur, delay, wx = 0 }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            className={`fizz-bubble ${tone}`}
            stroke="none"
            style={
              {
                "--from": `${bottom - y}px`,
                "--to": `${top - y}px`,
                "--wx": `${wx}px`,
                "--rise-dur": `${dur}s`,
                "--rise-delay": `${delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </g>
    </g>
  );
}
