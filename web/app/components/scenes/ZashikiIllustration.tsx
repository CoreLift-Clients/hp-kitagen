// ─── 2階の座敷（座卓と座布団）の線画 ───
// トップの「宴」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
//   （座卓と座布団にだけ、重なった後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（座卓の上の器から立つ湯気）
// ・部品ごとに g でまとめる：障子（zashiki-shoji）・座卓（zashiki-table）・座布団6枚（zashiki-cushions）・
//   器（zashiki-dishes）・湯気（zashiki-steam）
// ・動きの順番：座卓が現れる → 座布団が1枚ずつ並ぶ（奥の左 → 奥の右 → 右 → 手前の右 → 手前の左 → 左）→
//   座卓の上に器が出る → 器から湯気が立つ
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arc, arcPts, line, polygon, ring, smooth, steam, sway, type P } from "./draw";

// ── 障子（奥の壁。4枚の戸と、細い格子） ──
const SHOJI = [
  line([30, 18], [370, 17], 6000, 0.8, 4), // 上
  line([30, 144], [370, 144], 6010, 0.8, 4), // 下（畳との境）
  line([30, 18], [30, 144], 6020, 0.5, 2),
  line([370, 17], [370, 144], 6030, 0.5, 2),
  ...[115, 200, 285].map((x, i) => line([x, 18], [x, 144], 6040 + i * 5, 0.5, 2)),
];
const SHOJI_FINE = [
  // 横の格子
  ...[52, 86, 112].map((y, i) => line([32, y], [368, y], 6100 + i * 5, 0.6, 4)),
  // 縦の格子（各戸のまん中）
  ...[72.5, 157.5, 242.5, 327.5].map((x, i) => line([x, 20], [x, 142], 6130 + i * 5, 0.4, 2)),
  // 畳の縁（床の奥行きの線）
  line([30, 144], [4, 300], 6160, 0.6, 3),
  line([370, 144], [396, 300], 6170, 0.6, 3),
];

// ── 座卓（少し上から見た低い机） ──
const TABLE_TOP: readonly P[] = [
  [122, 190],
  [278, 190],
  [312, 242],
  [88, 242],
];
const TABLE_FILL = polygon([...TABLE_TOP, [312, 251], [296, 251], [296, 272], [286, 272], [286, 251], [114, 251], [114, 272], [104, 272], [104, 251], [88, 251]]);
const TABLE = [
  line(TABLE_TOP[0], TABLE_TOP[1], 6200, 0.6, 3), // 奥のふち
  line(TABLE_TOP[1], TABLE_TOP[2], 6210, 0.5, 2), // 右のふち
  line(TABLE_TOP[3], TABLE_TOP[2], 6220, 0.6, 3), // 手前のふち
  line(TABLE_TOP[0], TABLE_TOP[3], 6230, 0.5, 2), // 左のふち
  line([88, 242], [88, 251], 6240, 0.2, 1), // 天板の厚み
  line([312, 242], [312, 251], 6245, 0.2, 1),
  line([88, 251], [312, 251], 6250, 0.6, 3),
  // 脚（手前の2本だけ見える）
  line([104, 251], [104, 272], 6260, 0.3, 1),
  line([114, 251], [114, 272], 6265, 0.3, 1),
  line([286, 251], [286, 272], 6270, 0.3, 1),
  line([296, 251], [296, 272], 6275, 0.3, 1),
];

// ── 座布団（6枚。少し上から見た、角の丸い四角。手前のふちの下に厚みの線） ──
type Cushion = { cx: number; cy: number; a: number; b: number };
// 並ぶ順（動きの順）：奥の左 → 奥の右 → 右 → 手前の右 → 手前の左 → 左
const CUSHIONS: readonly Cushion[] = [
  { cx: 158, cy: 172, a: 34, b: 13 },
  { cx: 242, cy: 172, a: 34, b: 13 },
  { cx: 350, cy: 230, a: 30, b: 17 },
  { cx: 252, cy: 296, a: 44, b: 18 },
  { cx: 148, cy: 296, a: 44, b: 18 },
  { cx: 50, cy: 230, a: 30, b: 17 },
];
function cushion({ cx, cy, a, b }: Cushion, i: number) {
  const s = 6300 + i * 30;
  const k = 1.12; // 手前のほうが少し広い（奥行き）
  const corners: P[] = [
    [cx - a, cy - b],
    [cx + a, cy - b],
    [cx + a * k, cy + b],
    [cx - a * k, cy + b],
  ];
  // 角を丸めた輪郭（各辺の途中の点をつないで、角は丸く回る）
  const pts: P[] = [];
  for (let c = 0; c < 4; c++) {
    const p0 = corners[c];
    const p1 = corners[(c + 1) % 4];
    pts.push([p0[0] + (p1[0] - p0[0]) * 0.12, p0[1] + (p1[1] - p0[1]) * 0.12]);
    pts.push([p0[0] + (p1[0] - p0[0]) * 0.88, p0[1] + (p1[1] - p0[1]) * 0.88]);
  }
  pts.push(pts[0], pts[1]);
  return {
    fill: polygon(pts),
    outline: smooth(pts),
    // 厚み（手前のふちの下にもう1本）
    fine: [line([cx - a * k * 0.9, cy + b + 5], [cx + a * k * 0.9, cy + b + 5], s + 10, 0.4, 2)],
  };
}
const CUSHION_PATHS = CUSHIONS.map(cushion);
// 重なりの順：奥の座布団は座卓の後ろ、左右と手前は座卓の前
const BACK = [0, 1];
const FRONT = [2, 3, 4, 5];

// ── 器（座卓の上に小鉢2つと、湯のみ） ──
const DISHES = [
  // 小鉢（左）
  ring(156, 212, 18, 5.5, 6500, 0.3),
  arc(156, 212, 16, 12, PI * 0.05, PI * 0.95, 8, 0.3, 6510),
  // 小鉢（右。湯気の立つ器）
  ring(236, 214, 20, 6, 6520, 0.3),
  arc(236, 214, 18, 13, PI * 0.05, PI * 0.95, 8, 0.3, 6530),
  // 湯のみ
  line([190, 222], [191, 236], 6540, 0.2, 1),
  line([204, 222], [203, 236], 6545, 0.2, 1),
  ring(197, 222, 7, 2.4, 6550, 0.2),
  smooth([
    [191, 236],
    [197, 238],
    [203, 236],
  ]),
];
const DISHES_FILL = [
  polygon([...arcPts(156, 212, 18, 5.5, PI, PI * 2, 8, 0, 0), ...arcPts(156, 212, 16, 12, 0, PI, 8, 0, 0)]),
  polygon([...arcPts(236, 214, 20, 6, PI, PI * 2, 8, 0, 0), ...arcPts(236, 214, 18, 13, 0, PI, 8, 0, 0)]),
];

// ── 湯気（差し色。右の小鉢から2本） ──
const STEAM = [steam(228, 206, 150, 0.8, 6, 6600), steam(244, 207, 142, 3.1, 6, 6620)];
const STEAM_SWAY = [sway(4.6, -1.2), sway(5.4, -2.6)];

export default function ZashikiIllustration({ className = "" }: { className?: string }) {
  const cushionG = (i: number) => {
    const c = CUSHION_PATHS[i];
    return (
      <g key={i} className="scene-anim" style={anim("scene-fade-up", 14 + i * 4, 22 + i * 4, { "--dy": "8px" })}>
        <path d={c.fill} className="scene-paper" stroke="none" />
        <path d={c.outline} className="scene-line" />
        {c.fine.map((d, k) => (
          <path key={k} d={d} className="scene-fine" />
        ))}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 6 400 324"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="zashiki-shoji">
        {SHOJI.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {SHOJI_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="zashiki-cushions">{BACK.map(cushionG)}</g>

      <g className="zashiki-table scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        <path d={TABLE_FILL} className="scene-paper" stroke="none" />
        {TABLE.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
      </g>

      {/* 差し色（accent）はここだけ：器の湯気。器の後ろから立ちのぼる */}
      <g className="zashiki-steam">
        {STEAM.map((d, i) => (
          <g key={i} className="scene-sway" style={STEAM_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-line scene-accent scene-stroke-draw scene-anim"
              style={anim("scene-draw", 44 + i * 3, 56 + i * 2)}
            />
          </g>
        ))}
      </g>

      <g className="zashiki-dishes scene-anim" style={anim("scene-fade-up", 38, 46, { "--dy": "6px" })}>
        {DISHES_FILL.map((d, i) => (
          <path key={i} d={d} className="scene-paper" stroke="none" />
        ))}
        {DISHES.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="zashiki-cushions">{FRONT.map(cushionG)}</g>
    </svg>
  );
}
