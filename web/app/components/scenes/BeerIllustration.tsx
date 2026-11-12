// ─── 生ビールの線画 ───
// トップの「名物」の欄の3品目（生ビール）で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
//   （ジョッキと泡にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（泡の上に上がる小さな粒）
// ・部品ごとに g でまとめる：注ぎ口（beer-tap）・注がれるビールの線（beer-pour）・ジョッキ（beer-mug）・
//   ビールの線（beer-level）・泡（beer-foam）・泡の粒（beer-bubbles）
// ・動きの順番：注ぎ口からビールが注がれる線（上から下へ描く）→ ジョッキの中のビールの線が下から上がる →
//   泡がふわっと盛り上がる → 泡の小さな粒が少し上がる
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { anim, jitter, line, polygon, ring, smooth, type P } from "./draw";

// ── 注ぎ口（サーバーの口。右から伸びる管と、下向きの口、上のレバー） ──
const TAP = [
  line([392, 34], [236, 34], 5000, 0.8, 3), // 管の上
  line([392, 54], [256, 54], 5010, 0.8, 3), // 管の下
  smooth([
    [236, 34],
    [228, 38],
    [226, 48],
    [228, 60],
  ]), // 管の曲がり（外）
  line([228, 60], [229, 96], 5020, 0.4, 1), // 口の左
  line([256, 54], [257, 96], 5030, 0.4, 1), // 口の右
  line([224, 98], [261, 98], 5040, 0.4, 1), // 口の先
  line([330, 34], [342, 0], 5050, 0.5, 1), // レバー
];
const TAP_FINE = [ring(343, -4, 6, 5, 5060, 0.3), line([300, 40], [300, 48], 5070, 0.2, 1)];

// 注がれるビールの線（口の先から、ジョッキの泡の中まで。上から下へ描く）
const POUR = smooth([
  [243, 100],
  [243.6, 126],
  [243.2, 150],
  [243.8, 176],
]);

// ── ジョッキ（取っ手は左。注ぎ口が右上にあるので） ──
const MUG_OUTLINE: readonly P[] = [
  [128, 176],
  [131, 270],
  [133, 352],
  [140, 364],
  [206, 366],
  [272, 364],
  [279, 352],
  [281, 270],
  [284, 176],
];
const MUG_FILL = polygon(MUG_OUTLINE);
const MUG = [
  smooth(MUG_OUTLINE.map(([x, y], i) => [x + jitter(5100 + i) * 0.6, y] as const)),
  // 取っ手（外と内の2本）
  smooth([
    [129, 212],
    [96, 214],
    [82, 244],
    [84, 300],
    [98, 326],
    [132, 328],
  ]),
  smooth([
    [130, 232],
    [108, 234],
    [101, 256],
    [103, 292],
    [111, 306],
    [132, 307],
  ]),
];
const MUG_FINE = [
  line([136, 346], [276, 346], 5150, 0.6, 2), // 底の厚み
  // ガラスの面（縦の筋）
  line([166, 232], [167, 334], 5160, 0.6, 2),
  line([206, 232], [206, 336], 5165, 0.6, 2),
  line([246, 232], [245, 334], 5170, 0.6, 2),
];

// ビールの線（ジョッキの中の水面。動き終わりは泡のすぐ下で、泡とビールの境になる）
const LEVEL = line([132, 196], [281, 196], 5200, 1.2, 4);

// ── 泡（ふちの上にもこもこと盛り上がる。ふちより少し外へはみ出す） ──
const FOAM_TOP: readonly P[] = [
  [125, 178],
  [121, 164],
  [134, 150],
  [152, 152],
  [166, 138],
  [186, 144],
  [204, 132],
  [224, 140],
  [242, 134],
  [258, 146],
  [276, 148],
  [288, 162],
  [285, 178],
];
const FOAM_FILL = polygon([...FOAM_TOP, [284, 193], [128, 193]]);
const FOAM = [smooth(FOAM_TOP.map(([x, y], i) => [x, y + jitter(5300 + i) * 0.8] as const))];
const FOAM_FINE = [
  // 泡のたれ
  smooth([
    [258, 178],
    [259, 190],
    [263, 194],
    [268, 190],
    [269, 178],
  ]),
];

// ── 泡の粒（差し色） ──
const BUBBLES: readonly [number, number, number][] = [
  [160, 120, 3.4],
  [184, 106, 2.6],
  [214, 114, 3],
  [140, 134, 2.4],
  [204, 92, 2.2],
];

export default function BeerIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -16 400 392"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 注がれるビールの線は、ジョッキと泡の後ろ（泡の中へ入っていくように見せる） */}
      <path
        d={POUR}
        pathLength={1}
        className="beer-pour scene-line scene-stroke-draw scene-anim"
        style={anim("scene-draw", 4, 16)}
      />

      <g className="beer-mug">
        <path d={MUG_FILL} className="scene-paper" stroke="none" />
        {MUG_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="beer-level scene-anim" style={anim("scene-fade-up", 12, 28, { "--dy": "136px" })}>
        <path d={LEVEL} className="scene-fine" />
      </g>

      <g className="beer-mug">
        {MUG.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
      </g>

      <g className="beer-foam scene-anim" style={anim("scene-swell", 26, 38, { "--o": "50% 100%" })}>
        <path d={FOAM_FILL} className="scene-paper" stroke="none" />
        {FOAM.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {FOAM_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="beer-tap">
        {TAP.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {TAP_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      {/* 差し色（accent）はここだけ：泡の粒 */}
      <g className="beer-bubbles">
        {BUBBLES.map(([x, y, r], i) => (
          <g
            key={i}
            className="scene-anim"
            style={anim("scene-fade-up", 34 + (i % 3) * 2, 44 + (i % 3) * 2, { "--dy": "16px" })}
          >
            <circle cx={x} cy={y} r={r} className="scene-fine scene-accent" />
          </g>
        ))}
      </g>
    </svg>
  );
}
