// ─── 生ビールの線画 ───
// トップの「名物」の欄の3品目（生ビール）で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
//   （ジョッキと泡にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・色を塗るのは食材だけ：ビール（淡い琥珀色 .food-wash-beer）と泡（ほぼ紙の色、ふちだけうすいクリーム .food-wash-foam）。
//   料理の絵の決まり（scenes.css の先頭）の「水彩の塗り方」で、線画にうすく絵の具で塗ったように付ける
//   （部品は Wash.tsx。にじみのフィルタは beer-wash の1つを使い回す）。
//   飲み物は入れ物そのものが主役なので、入れ物にも水彩の色を付ける（料理の絵の決まり、scenes.css の先頭）：
//   ジョッキのガラス（胴と取っ手）はごく淡い色（ほぼ紙の色、ふちだけうすく .food-wash-glass）、
//   注ぎ口（サーバー）は淡い灰色を1段（.food-wash-tap）。焼酎・日本酒、ソフトドリンクのカードと塗り方をそろえる。
//   ビールと泡の水彩は、泡が盛り上がったあと、最後にじわっと出る
// ・注がれるビールは、琥珀色の水彩の帯（.food-wash-beer。輪郭は細い線）。下へ行くほど少し細く、ほんの少しよじれる。
//   帯の中に白をうすくした明るい筋を2本入れ、時間でずっと上から下へ流す（scenes.css の beer-flow。画面の外では止まる）
// ・流れが泡に当たる所は、泡がこんもり盛り上がった山。そのまわりに小さな泡の粒を4つ、はねるように置く
//   （泡の粒は、ほかの線と同じ foreground の色）
// ・注ぎ口の上に、上へ伸びる太いレバー（先は丸い玉）。注ぎ口とレバーは淡い灰色の水彩
// ・部品ごとに g でまとめる：注ぎ口（beer-tap）・レバー（beer-lever）・注がれる流れ（beer-pour）・ジョッキ（beer-mug）・
//   ビールの線（beer-level）・泡（beer-foam）・泡の粒（beer-bubbles）
// ・動きの順番：注ぎ口が上から現れる → レバーが手前へ少し倒れる → 流れが上から下へ伸びる →
//   ジョッキの中のビールの線が下から上がる → 泡がふわっと盛り上がる → 泡の粒がはねる → 流れの中の筋が流れ続ける
//   （動き終わりの形は、注いでいる途中の形。動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arcPts, jitter, line, polygon, ring, smooth, type P } from "./draw";
import { Wash, WashFilter } from "./Wash";

// ── 注ぎ口（サーバーの口。右から伸びる管と、下向きの口） ──
const TAP = [
  line([392, 20], [236, 20], 5000, 0.8, 3), // 管の上
  line([392, 40], [256, 40], 5010, 0.8, 3), // 管の下
  smooth([
    [236, 20],
    [228, 24],
    [226, 34],
    [228, 46],
  ]), // 管の曲がり（外）
  line([228, 46], [229, 82], 5020, 0.4, 1), // 口の左
  line([256, 40], [257, 82], 5030, 0.4, 1), // 口の右
  line([224, 84], [261, 84], 5040, 0.4, 1), // 口の先
];
const TAP_FINE = [line([300, 26], [300, 34], 5070, 0.2, 1)];

// 注ぎ口の面（管と下向きの口。淡い灰色の水彩）
const TAP_FILL = polygon([
  [400, 20],
  [236, 20],
  [228, 24],
  [226, 34],
  [228, 46],
  [229, 83],
  [257, 83],
  [256, 40],
  [400, 40],
]);

// ── レバー（管の上から上へ伸びる太い取っ手。先は丸い玉） ──
// 動き終わりの形は、手前（左）へ少し倒れた形。根元（LEVER_PIVOT）を中心に、まっすぐ立った形から倒れる（scenes.css の beer-lever）
const LEVER_PIVOT: P = [331, 20];
const LEVER_TOP: P = [324, -1];
const LEVER_HALF = 5.5;
const leverEdge = (side: 1 | -1): [P, P] => {
  const dx = LEVER_TOP[0] - LEVER_PIVOT[0];
  const dy = LEVER_TOP[1] - LEVER_PIVOT[1];
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * LEVER_HALF * side;
  const ny = (dx / len) * LEVER_HALF * side;
  // 根元は管の下へもぐらせる（管の面で隠れる）
  return [
    [LEVER_PIVOT[0] + nx - (dx / len) * 4, LEVER_PIVOT[1] + ny + 4],
    [LEVER_TOP[0] + nx, LEVER_TOP[1] + ny],
  ];
};
const LEVER_L = leverEdge(-1);
const LEVER_R = leverEdge(1);
const LEVER_ROD = [line(LEVER_L[0], LEVER_L[1], 5050, 0.3, 1), line(LEVER_R[0], LEVER_R[1], 5055, 0.3, 1)];
const LEVER_ROD_FILL = polygon([LEVER_L[0], LEVER_L[1], LEVER_R[1], LEVER_R[0]]);
const KNOB: readonly [number, number, number, number] = [323, -5, 8, 7.5];
const LEVER_KNOB = ring(KNOB[0], KNOB[1], KNOB[2], KNOB[3], 5060, 0.3);
const LEVER_KNOB_FILL = polygon(arcPts(KNOB[0], KNOB[1], KNOB[2], KNOB[3], 0, PI * 2, 24, 0, 0));

// ── 注がれるビールの流れ（口の先から、泡の山の中まで。琥珀色の水彩の帯） ──
// 幅は口のすぐ下で約 9、泡に入る所（y 121 あたり）で約 6。下へ行くほど少し細く、ほんの少しよじれて揺らぐ（乱数なし）
const POUR_Y0 = 84.5;
const POUR_Y1 = 132;
const POUR_STEPS = 8;
const pourAt = (t: number) => {
  const cx = 243 + Math.sin(t * PI * 1.6 + 0.3) * 0.9 - 0.3;
  const w = 9 - 3.4 * t + Math.sin(t * PI * 3.2) * 0.45;
  const twist = Math.sin(t * PI * 2.4) * 0.35;
  return { y: POUR_Y0 + (POUR_Y1 - POUR_Y0) * t, cx, w, twist };
};
const POUR_L: P[] = [];
const POUR_R: P[] = [];
const POUR_C: P[] = [];
for (let i = 0; i <= POUR_STEPS; i++) {
  const { y, cx, w, twist } = pourAt(i / POUR_STEPS);
  POUR_L.push([cx - w / 2 + twist, y]);
  POUR_R.push([cx + w / 2 + Math.sin((i / POUR_STEPS) * PI * 2.4 + 1.4) * 0.35, y]);
  POUR_C.push([cx + twist * 0.5, y]);
}
// 帯の輪郭（左右の細い線。上は口の先、下は泡の中へ入るので、どちらも閉じない）
const POUR_EDGES = [smooth(POUR_L), smooth(POUR_R)];
// 帯の面（ビールの水彩を塗る形）
const POUR_FILL = polygon([...POUR_L, ...[...POUR_R].reverse()]);
// 流れの中の明るい筋（白をうすく。上から下へ流れ続ける）。中心から左右へ少しずらした2本
const POUR_STREAKS = [
  smooth(POUR_C.slice(0, -1).map(([x, y]) => [x - 1.2, y + 2] as const)),
  smooth(POUR_C.slice(1).map(([x, y]) => [x + 1.4, y] as const)),
];

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
// 取っ手の面（外と内の線のあいだ。ガラスの水彩）
const HANDLE_FILL = polygon([
  [129, 212],
  [96, 214],
  [82, 244],
  [84, 300],
  [98, 326],
  [132, 328],
  [132, 307],
  [111, 306],
  [103, 292],
  [101, 256],
  [108, 234],
  [130, 232],
]);
const MUG_FINE = [
  line([136, 346], [276, 346], 5150, 0.6, 2), // 底の厚み
  // ガラスの面（縦の筋）
  line([166, 232], [167, 334], 5160, 0.6, 2),
  line([206, 232], [206, 336], 5165, 0.6, 2),
  line([246, 232], [245, 334], 5170, 0.6, 2),
];

// ビールの線（ジョッキの中の水面。動き終わりは泡のすぐ下で、泡とビールの境になる）
const LEVEL = line([132, 196], [281, 196], 5200, 1.2, 4);
// ビールの面（水面から底の厚みの線まで。ジョッキの内側の形。水彩で塗る）
const BEER_WASH = polygon([
  [129, 196],
  [283, 196],
  [281, 270],
  [279.5, 346],
  [133, 346],
  [131, 270],
]);

// ── 泡（ふちの上にもこもこと盛り上がる。ふちより少し外へはみ出す） ──
// 流れが当たる所（x 243 あたり）は、泡がこんもり盛り上がった山（てっぺん y 121）
const FOAM_TOP: readonly P[] = [
  [125, 178],
  [121, 164],
  [134, 150],
  [152, 152],
  [166, 138],
  [186, 144],
  [204, 134],
  [220, 138],
  [231, 127],
  [243, 121],
  [255, 127],
  [266, 142],
  [278, 148],
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

// ── 泡の粒（流れが泡に当たる所 ＝ x 243・y 121 のまわりに、はねるように） ──
const SPLASH_AT: P = [243, 121];
const BUBBLES: readonly [number, number, number][] = [
  [226, 114, 2.6],
  [231, 103, 2],
  [256, 101, 1.8],
  [262, 114, 2.3],
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
      <defs>
        {/* 水彩のにじみ（塗りにだけ。絵の中で使い回す） */}
        <WashFilter id="beer-wash" seed={3} />
      </defs>
      {/* 注がれるビールの流れは、ジョッキと泡の後ろ（泡の山の中へ入っていくように見せる）。
          上から下へ伸びる（beer-pour）。帯の水彩は、流れそのものなので、流れと一緒に出る */}
      <g className="beer-pour scene-anim" style={anim("beer-pour", 13, 20, { "--o": "50% 0%" })}>
        <Wash filter="beer-wash" d={POUR_FILL} tone="food-wash-beer" id="beer-w-pour" shift={[0.4, 0.3]} line={2.1} />
        {/* 明るい筋（時間でずっと上から下へ流れる。scenes.css の beer-flow） */}
        {POUR_STREAKS.map((d, i) => (
          <path key={i} d={d} pathLength={1} className={`beer-flow beer-flow-${i + 1}`} />
        ))}
        {POUR_EDGES.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="beer-mug">
        <path d={MUG_FILL} className="scene-paper" stroke="none" />
        {/* ジョッキのガラス（ごく淡い色。ふちだけうすく） */}
        <Wash filter="beer-wash" d={MUG_FILL} tone="food-wash-glass" id="beer-w-glass" shift={[1, 0.75]} />
        <Wash filter="beer-wash" d={HANDLE_FILL} tone="food-wash-glass" id="beer-w-handle" shift={[0.8, 0.6]} />
      </g>

      {/* ビールの水彩（最後にじわっと出る） */}
      <g className="beer-liquid scene-anim" style={anim("scene-fade-up", 40, 50, { "--dy": "0px" })}>
        <Wash filter="beer-wash" d={BEER_WASH} tone="food-wash-beer" id="beer-w-beer" shift={[1.5, 1]} holes={[[150, 300, 3, 10], [262, 226, 2.6, 6]]} />
      </g>
      <g className="beer-level scene-anim" style={anim("scene-fade-up", 20, 30, { "--dy": "136px" })}>
        <path d={LEVEL} className="scene-fine" />
      </g>
      {/* ガラスの面の縦の筋は、ビールの上に */}
      <g className="beer-mug">
        {MUG_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="beer-mug">
        {MUG.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
      </g>

      <g className="beer-foam scene-anim" style={anim("scene-swell", 28, 38, { "--o": "50% 100%" })}>
        <path d={FOAM_FILL} className="scene-paper" stroke="none" />
        {/* 泡の水彩（ほぼ紙の色。ふちだけうすいクリーム。最後にじわっと出る） */}
        <g className="scene-anim" style={anim("scene-fade-up", 42, 50, { "--dy": "0px" })}>
          <Wash filter="beer-wash" d={FOAM_FILL} tone="food-wash-foam" id="beer-w-foam" shift={[1, 1]} holes={[[180, 160, 7, 3]]} />
        </g>
        {FOAM.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {FOAM_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      {/* 注ぎ口（上から現れる）。レバーは管の後ろに置き、根元を管の面で隠す */}
      <g className="beer-tap scene-anim" style={anim("scene-fade-up", 4, 8, { "--dy": "-10px" })}>
        <g className="beer-lever scene-anim beer-lever-move" style={anim("beer-lever", 8, 13)}>
          <path d={LEVER_ROD_FILL} className="scene-paper" stroke="none" />
          <Wash filter="beer-wash" d={LEVER_ROD_FILL} tone="food-wash-tap" id="beer-w-lever" shift={[0.6, 0.5]} />
          {LEVER_ROD.map((d, i) => (
            <path key={i} d={d} className="scene-line" />
          ))}
          <path d={LEVER_KNOB_FILL} className="scene-paper" stroke="none" />
          <Wash filter="beer-wash" d={LEVER_KNOB_FILL} tone="food-wash-tap" id="beer-w-knob" shift={[0.6, 0.5]} holes={[[320.5, -7.5, 2, 1.4]]} />
          <path d={LEVER_KNOB} className="scene-line" />
        </g>
        <path d={TAP_FILL} className="scene-paper" stroke="none" />
        <Wash filter="beer-wash" d={TAP_FILL} tone="food-wash-tap" id="beer-w-tap" shift={[1, 0.75]} holes={[[300, 26, 14, 1.6]]} />
        {TAP.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {TAP_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      {/* 泡の粒（流れが当たる所から、はねて出る。scenes.css の beer-splash） */}
      <g className="beer-bubbles">
        {BUBBLES.map(([x, y, r], i) => (
          <g
            key={i}
            className="scene-anim"
            style={anim("beer-splash", 36 + (i % 2) * 2, 44 + (i % 2) * 2, {
              "--sx": `${SPLASH_AT[0] - x}px`,
              "--sy": `${SPLASH_AT[1] - y}px`,
            })}
          >
            <circle cx={x} cy={y} r={r} className="scene-fine" />
          </g>
        ))}
      </g>
    </svg>
  );
}
