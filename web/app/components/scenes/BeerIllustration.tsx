// ─── 生ビールの線画 ───
// トップの「名物」の欄の3品目（生ビール）で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
//   （ジョッキと泡にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・色を塗るのは食材だけ：ビール（淡い琥珀色 .food-wash-beer）と泡（ほぼ紙の色、ふちだけうすいクリーム .food-wash-foam）。
//   料理の絵の決まり（scenes.css の先頭）の「水彩の塗り方」で、線画にうすく絵の具で塗ったように付ける
//   （部品は Wash.tsx。にじみのフィルタは beer-wash の1つを使い回す）。
//   飲み物は入れ物そのものが主役なので、入れ物にも水彩の色を付ける（料理の絵の決まり、scenes.css の先頭）：
//   ジョッキのガラス（胴と取っ手）はごく淡い色（ほぼ紙の色、ふちだけうすく .food-wash-glass）、
//   注ぎ口（サーバー）は淡い灰色を1段（.food-wash-tap）。日本酒・焼酎、ソフトドリンクのカードと塗り方をそろえる。
//   ビールと泡の水彩は、注ぎ終えてレバーが戻ったあと、最後にじわっと出る
// ・注がれるビールは、琥珀色の水彩の帯（.food-wash-beer。輪郭は細い線）。下へ行くほど少し細く、ほんの少しよじれる。
//   帯の中に白をうすくした明るい筋を2本入れ、時間でずっと上から下へ流す（scenes.css の pour-flow。画面の外では止まる）
//   流れの描き方と、注ぎ終わりに上から切れて消える動きは、日本酒・焼酎の絵と共通の部品（Pour.tsx の cut）
// ・流れが泡に当たっていた所は、泡がこんもり盛り上がった山（流れが切れたあとも、完成の形で残る）。
//   そのまわりに小さな泡の粒を4つ、はねるように置く（泡の粒は、ほかの線と同じ foreground の色）
// ・注ぎ口の上に、上へ伸びる太いレバー（先は丸い玉）。注ぎ口とレバーは淡い灰色の水彩。
//   レバーは、まっすぐ立った形（完成の形）で描き、注ぐあいだだけ手前（左）へ倒す
// ・部品ごとに g でまとめる：注ぎ口（beer-tap）・レバー（beer-lever）・注がれる流れ（Pour。class は pour）・ジョッキ（beer-mug）・
//   ビールの線（beer-level）・泡（beer-foam）・泡の粒（beer-bubbles）
// ・動きの順番：注ぎ口が上から現れる → レバーが手前へ少し倒れる → 流れが上から下へ伸びる →
//   ジョッキの中のビールの線が下から上がる → 泡がふわっと盛り上がる → 流れが上から切れて消える（中の筋も先に消える）→
//   間をおいて、レバーがまっすぐ立った形に戻る → 泡の粒がはねて、ビールと泡の水彩がじわっと出る
//   動き終わり（prefers-reduced-motion のときも）は完成の形：泡の乗ったジョッキと、止まった注ぎ口（流れ・筋はない）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css。レバーは toast-tilt を2段（倒れる・戻る）、流れは pour-grow → pour-cut）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, animAt, arcPts, cardTiming, jitter, line, polygon, ring, smooth, type P } from "./draw";
import { Pour, pourShape } from "./Pour";
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
// 描く形（動き終わりの形）は、まっすぐ立った形。注ぐあいだだけ、根元（LEVER_PIVOT）を中心に手前（左）へ LEVER_TILT 度倒れる。
// 下の数は、倒れた形（前の動き終わりの形）の数。それを根元を中心に LEVER_TILT 度起こして、立った形にする
const LEVER_PIVOT: P = [331, 20];
const LEVER_TILT = 15; // 倒れる角度（度）
const upright = ([x, y]: P): P => {
  const a = (LEVER_TILT * PI) / 180;
  const dx = x - LEVER_PIVOT[0];
  const dy = y - LEVER_PIVOT[1];
  const r = (n: number) => Math.round(n * 10) / 10;
  return [r(LEVER_PIVOT[0] + dx * Math.cos(a) - dy * Math.sin(a)), r(LEVER_PIVOT[1] + dx * Math.sin(a) + dy * Math.cos(a))];
};
const LEVER_TOP: P = upright([324, -1]);
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
const KNOB_C = upright([323, -5]);
const KNOB: readonly [number, number, number, number] = [KNOB_C[0], KNOB_C[1], 8, 7.5];
const KNOB_HOLE = upright([320.5, -7.5]);
const LEVER_KNOB = ring(KNOB[0], KNOB[1], KNOB[2], KNOB[3], 5060, 0.3);
const LEVER_KNOB_FILL = polygon(arcPts(KNOB[0], KNOB[1], KNOB[2], KNOB[3], 0, PI * 2, 24, 0, 0));

// ── 注がれるビールの流れ（口の先から、泡の山の中まで。琥珀色の水彩の帯。部品は Pour.tsx） ──
// 幅は口のすぐ下で約 9、泡に入る所（y 121 あたり）で約 6。下へ行くほど少し細く、ほんの少しよじれて揺らぐ（乱数なし）
const POUR = pourShape({ from: [243, 84.5], ctrl: [243, 108.25], to: [243, 132], w0: 9, w1: 5.6 });

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

// ── 動きの段（anim の from・to。4〜60。scenes.css の「名物の欄の決まり」） ──
// 60（完成）は、絵の真ん中が見えている画面の真ん中に来たところ。
// 主役は、注いで泡が盛り上がるまで（流れが伸びる → ビールの線が上がる → 泡が盛り上がる。14〜35 ＝ 全体の約 4 割弱）。
// 段のあいだに短い間
const T = {
  tap: [4, 8], // 注ぎ口が上から現れる
  lever: [9, 13], // （間）レバーが手前へ倒れる
  pour: [14, 18.5], // （間）流れが上から下へ伸びる（注いでいる段は 14 〜 35.5）
  level: [18, 30], // ビールの線が下から上がる
  foam: [25.5, 35], // 泡がふわっと盛り上がる
  pourCut: [35.5, 38.5], // 注ぎ終わる：流れが上から切れて消える（中の筋は、その始めにすっと消える）
  leverBack: [41, 45], // （間をおいて）レバーがまっすぐ立った形に戻る
  bubbles: [45.5, 51.5], // 泡の粒がはねる（1つおきに 2 ずらす）
  liquid: [48, 58], // ビールの水彩がじわっと出る
  foamWash: [50, 60], // 泡の水彩（完成）
} as const;
// 線のいちばん下は、絵の場所の上から 96.7%。主役が時間で動くとき ((25.5 − 14) × 0.045 + 9.5 × 0.05) × 1.35 ≒ 1.34 秒
const CARD = cardTiming({ ink: 0.975, time: 1.35 });

export default function BeerIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -16 400 392"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={CARD}
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
          上から下へ伸びる（pour-grow）。帯の水彩は、流れそのものなので、流れと一緒に出る。
          明るい筋は、注いでいるあいだ時間でずっと上から下へ流れる（scenes.css の pour-flow）。
          注ぎ終わると、上から切れて消える（cut。動き終わりは見えない） */}
      <Pour shape={POUR} tone="food-wash-beer" filter="beer-wash" id="beer-w-pour" grow={T.pour} cut={T.pourCut} />

      <g className="beer-mug">
        <path d={MUG_FILL} className="scene-paper" stroke="none" />
        {/* ジョッキのガラス（ごく淡い色。ふちだけうすく） */}
        <Wash filter="beer-wash" d={MUG_FILL} tone="food-wash-glass" id="beer-w-glass" shift={[1, 0.75]} />
        <Wash filter="beer-wash" d={HANDLE_FILL} tone="food-wash-glass" id="beer-w-handle" shift={[0.8, 0.6]} />
      </g>

      {/* ビールの水彩（最後にじわっと出る） */}
      <g className="beer-liquid scene-anim" style={animAt("scene-fade-up", T.liquid, { "--dy": "0px" })}>
        <Wash filter="beer-wash" d={BEER_WASH} tone="food-wash-beer" id="beer-w-beer" shift={[1.5, 1]} holes={[[150, 300, 3, 10], [262, 226, 2.6, 6]]} />
      </g>
      <g className="beer-level scene-anim" style={animAt("scene-fade-up", T.level, { "--dy": "136px" })}>
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

      <g className="beer-foam scene-anim" style={animAt("scene-swell", T.foam, { "--o": "50% 100%" })}>
        <path d={FOAM_FILL} className="scene-paper" stroke="none" />
        {/* 泡の水彩（ほぼ紙の色。ふちだけうすいクリーム。最後にじわっと出る） */}
        <g className="scene-anim" style={animAt("scene-fade-up", T.foamWash, { "--dy": "0px" })}>
          <Wash filter="beer-wash" d={FOAM_FILL} tone="food-wash-foam" id="beer-w-foam" shift={[1, 1]} holes={[[180, 160, 7, 3]]} />
        </g>
        {FOAM.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {FOAM_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      {/* 注ぎ口（上から現れる）。レバーは管の後ろに置き、根元を管の面で隠す。
          レバーは、まっすぐ立った形（完成の形）で描き、根元（絵の座標 331・20）を中心に傾ける。
          外の g が「倒れた形 → 立った形」（leverBack）、内の g が「立った形 → 倒れた形」（lever） */}
      <g className="beer-tap scene-anim" style={animAt("scene-fade-up", T.tap, { "--dy": "-10px" })}>
        <g className="beer-lever scene-anim beer-lever-move" style={animAt("toast-tilt", T.leverBack, { "--tilt": `${-LEVER_TILT}deg` })}>
          <g className="scene-anim beer-lever-move" style={animAt("toast-tilt", T.lever, { "--tilt": `${LEVER_TILT}deg` })}>
            <path d={LEVER_ROD_FILL} className="scene-paper" stroke="none" />
            <Wash filter="beer-wash" d={LEVER_ROD_FILL} tone="food-wash-tap" id="beer-w-lever" shift={[0.6, 0.5]} />
            {LEVER_ROD.map((d, i) => (
              <path key={i} d={d} className="scene-line" />
            ))}
            <path d={LEVER_KNOB_FILL} className="scene-paper" stroke="none" />
            <Wash filter="beer-wash" d={LEVER_KNOB_FILL} tone="food-wash-tap" id="beer-w-knob" shift={[0.6, 0.5]} holes={[[KNOB_HOLE[0], KNOB_HOLE[1], 2, 1.4]]} />
            <path d={LEVER_KNOB} className="scene-line" />
          </g>
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

      {/* 泡の粒（流れが当たる所から、はねて出る。scenes.css の pour-splash） */}
      <g className="beer-bubbles">
        {BUBBLES.map(([x, y, r], i) => (
          <g
            key={i}
            className="scene-anim"
            style={animAt(
              "pour-splash",
              T.bubbles,
              { "--sx": `${SPLASH_AT[0] - x}px`, "--sy": `${SPLASH_AT[1] - y}px` },
              (i % 2) * 2,
            )}
          >
            <circle cx={x} cy={y} r={r} className="scene-fine" />
          </g>
        ))}
      </g>
    </svg>
  );
}
