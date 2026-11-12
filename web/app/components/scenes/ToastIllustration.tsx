// ─── 宴（ビールのジョッキで乾杯）の線画 ───
// トップの「宴」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
//   （ジョッキにだけ、重なった後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（乾杯ではねた泡のしぶき）
// ・部品ごとに g でまとめる：左のジョッキ（toast-mug-left）・右のジョッキ（toast-mug-right）・
//   泡のしぶき（toast-splash）・カチン（toast-clink）。
//   ジョッキは1つの形を描き、右は左右反転して使う。置く位置と傾き（SVG の transform）の g と、
//   動かす g（CSS の transform）は分ける（CSS の transform は SVG の transform を上書きしてしまうため）
// ・動きの順番：左右からジョッキが寄ってきて乾杯する → 泡がふわっとはねる → ぶつかった所に小さな線（カチン）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { anim, jitter, line, polygon, smooth, type P } from "./draw";

// ── ジョッキ（原点が胴の真ん中。取っ手は左。泡は上） ──
const BODY_OUTLINE: readonly P[] = [
  [-46, -88],
  [-43, 0],
  [-41, 78],
  [-36, 88],
  [0, 90],
  [36, 88],
  [41, 78],
  [43, 0],
  [46, -88],
];
// 泡（もこもこした上の形。両端はふちより少し外にはみ出す）
const FOAM_TOP: readonly P[] = [
  [-49, -86],
  [-53, -100],
  [-41, -113],
  [-25, -110],
  [-12, -123],
  [5, -118],
  [19, -125],
  [34, -114],
  [47, -110],
  [53, -97],
  [49, -86],
];
const MUG_FILL = polygon([...FOAM_TOP, ...BODY_OUTLINE.slice().reverse()]);
const MUG = [
  smooth(BODY_OUTLINE.map(([x, y], i) => [x + jitter(3000 + i) * 0.6, y] as const)), // 胴
  smooth(FOAM_TOP.map(([x, y], i) => [x, y + jitter(3020 + i) * 0.8] as const)), // 泡の上
  // 取っ手（外と内の2本）
  smooth([
    [-45, -60],
    [-74, -58],
    [-84, -30],
    [-82, 20],
    [-70, 44],
    [-42, 46],
  ]),
  smooth([
    [-44, -42],
    [-62, -40],
    [-67, -16],
    [-65, 16],
    [-58, 28],
    [-42, 29],
  ]),
];
const MUG_FINE = [
  line([-47, -86], [47, -86], 3040, 0.5, 2), // 泡とビールの境（ふち）
  // 泡のたれ
  smooth([
    [24, -86],
    [25, -76],
    [29, -71],
    [33, -75],
    [34, -86],
  ]),
  // 底の厚み
  line([-38, 72], [38, 72], 3050, 0.6, 2),
  // ガラスの面（縦の筋）
  line([-20, -66], [-19, 54], 3060, 0.6, 2),
  line([2, -66], [2, 56], 3065, 0.6, 2),
  line([24, -66], [23, 54], 3070, 0.6, 2),
];

function Mug() {
  return (
    <>
      <path d={MUG_FILL} className="scene-paper" stroke="none" />
      {MUG.map((d, i) => (
        <path key={i} d={d} className="scene-line" />
      ))}
      {MUG_FINE.map((d, i) => (
        <path key={i} d={d} className="scene-fine" />
      ))}
    </>
  );
}

// ── 泡のしぶき（差し色。ぶつかった所の上に小さな輪） ──
const SPLASH: readonly [number, number, number][] = [
  [176, 64, 4.2],
  [194, 46, 3],
  [212, 56, 3.6],
  [228, 72, 2.6],
  [160, 72, 2.4],
  [240, 76, 2.2],
];

// ── カチン（ぶつかった所から外へ、短い線を3本） ──
const CLINK = [
  line([200, 98], [200, 80], 3100, 0.3, 1),
  line([190, 96], [181, 84], 3105, 0.3, 1),
  line([210, 96], [219, 84], 3110, 0.3, 1),
];

export default function ToastIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 20 400 310"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 左のジョッキ：右に傾けて、泡の右上が真ん中（x 200）に届く位置 */}
      <g className="toast-mug-left" transform="translate(130 206) rotate(12)">
        <g className="scene-anim" style={anim("scene-slide-in", 6, 30, { "--o": "50% 100%" })}>
          <Mug />
        </g>
      </g>
      {/* 右のジョッキ：左のジョッキを左右反転（取っ手は右）。寄ってくる向きも反転するので、動きの指定は同じ */}
      <g className="toast-mug-right" transform="translate(270 206) rotate(-12) scale(-1 1)">
        <g className="scene-anim" style={anim("scene-slide-in", 6, 30, { "--o": "50% 100%" })}>
          <Mug />
        </g>
      </g>

      {/* 差し色（accent）はここだけ：はねた泡 */}
      <g className="toast-splash">
        {SPLASH.map(([x, y, r], i) => (
          <g
            key={i}
            className="scene-anim"
            style={anim("scene-fade-up", 30 + (i % 3) * 2, 40 + (i % 3) * 2, { "--dy": "14px" })}
          >
            <circle cx={x} cy={y} r={r} className="scene-fine scene-accent" />
          </g>
        ))}
      </g>

      <g className="toast-clink scene-anim" style={anim("scene-pop", 36, 44, { "--o": "50% 100%" })}>
        {CLINK.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>
    </svg>
  );
}
