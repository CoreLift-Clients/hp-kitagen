// ─── せいろ（自家製しゅうまい）の線画 ───
// トップの名物の場面と、ディナーメニューの名物の欄の壱（しゅうまい）のカードで使う飾りの絵（aria-hidden。意味は横の文・品名で伝える）。
// 本物の盛り付け（代表者から届いた写真）をもとに、料理の絵の決まり（scenes.css の先頭）で抽象化する：
// 明るい竹のせいろを上からのぞき込み、穴のあいた敷き紙の上に、まるっとしたしゅうまいを4つ（2つずつ2列）並べる。
// ・形で伝える：上からのぞいた丸いせいろと、上の口が開いた丸いしゅうまい4つ
// ・特徴は2つだけ：しゅうまいの口から見えるあん、口のまわりのひだ（5本）
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く。輪郭は scene-line、中の線は scene-fine
// ・色を塗るのは食材だけ：しゅうまいの皮（淡いクリーム .food-wash-skin）と、口から見えるあん（淡い肉の色 .food-wash-meat）。
//   料理の絵の決まり（scenes.css の先頭）の「水彩の塗り方」で、線画にうすく絵の具で塗ったように付ける
//   （部品は Wash.tsx。にじみのフィルタは seiro-wash の1つを使い回す）。
//   敷き紙・ふたは線だけ（面は、後ろの線を隠すための紙の色 --scene-paper）。
//   せいろだけは例外（scenes.css の「料理の絵の決まり」）：深さが分かるよう、ごく淡い水彩の陰を1か所だけ付ける
//   （内側の奥の壁だけ。.seiro-wash-shade ＝ foreground をうすく）
// ・せいろ：しゅうまいを引き立てるよう、線は少なく。横の線は、上のふちの厚みの2本（外のふち・内のふち）・
//   胴の竹の帯1本（胴の中ほど）・底の線（手前の下のふち）の4本だけ。ほかは左右の側面の縦の線2本
// ・敷き紙：線は描かない（底いっぱいの紙の色の面だけ。しゅうまいは、その上に座る）
// ・しゅうまい：中の線は、口のふち1本とひだ5本
// ・ふた：閉じた形（しゅうまいの上にかぶさる）だけ。開くときは、手で開けるように、手前のふちから持ち上がって傾き、
//   上の奥へ持ち去られて消える（手は描かない。動き終わりは、ふたのないせいろ）
// ・湯気（時間で揺れる）は、奥の列のしゅうまいの上から立ちのぼる。ふたが少し浮いた間だけ、手前のすき間からも2本もれる
// ・部品ごとに g でまとめる：本体（seiro-body）・しゅうまい（seiro-shumai）・
//   ふた（seiro-lid-move）・もれる湯気と湯気（seiro-steam）。重なりの順もこのとおり。
//   湯気より前の3つは、まとめて1つの g（seiro-set）に入れる
// ・動きの順番：
//   1. ふたがぴったり閉まったせいろが現れる（seiro-set をまとめて薄くしてから出すので、途中もしゅうまいは透けない）
//   2. 手前のふちから持ち上がる（奥のふちを支点に、手前だけが少し浮いて傾く。奥のふちはせいろに付いたまま）
//   3. 手前のすき間から、湯気が2本ふわっともれる（2〜3 の「少し浮いた状態」は、全体の動きの2割あまり）
//   4. さらに傾けながら持ち上げる（奥のふちもせいろから離れ、上の奥へ）
//   5. 上の奥へ持ち去られながら、すっと消える（2〜5 は scenes.css の seiro-lid-open。形は LID_VARS）
//   6. しゅうまいの皮とあんの水彩がじわっと出て、湯気がしっかり立ちのぼる
//   しゅうまいは、ふたが開くにつれて手前から見えてくる（ふたが残っている奥の部分は、ふたに隠れたまま）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）。何も動かさないときの形が、動き終わった形
//   （ふたはなく、しゅうまいと湯気が見える）。トップの場面でも同じ
// ・見る角度はななめ上から（床の面を縦に SQ だけつぶす。pr()）。胴の側面と、内側の奥の壁が帯として見える角度
// ・絵は viewBox を 356 の幅に切り出して大きく見せる（上の奥へ持ち去られるふたの上の端まで入る。
//   線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
//
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, arc, arcPts, blobPts, jitter, polygon, r1, smooth, steam, sway, type P } from "./draw";
import { Wash, WashFilter, type Hole } from "./Wash";

// ── 見る角度（床の面の点 u・v と高さ z を、絵の座標にする） ──
const CX = 200;
const FY = 236; // せいろの底（敷き紙の面）のまん中の y
const SQ = 0.55; // 縦のつぶし（ななめ上からのぞき込む。0.64 より少し横から見て、胴の側面がよく見える）
const pr = (u: number, v: number, z = 0): P => [CX + u, FY + v * SQ - z];
// 床の面の円（半径 r、高さ z）のまわりの点
const circ = (u0: number, v0: number, r: number, z: number, n: number, t0 = 0, t1 = PI * 2): P[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / n;
    return pr(u0 + r * Math.cos(t), v0 + r * Math.sin(t), z);
  });
// だ円（絵の座標の中心と半径）の閉じた塗り
const ell = (r: number, z: number, u0 = 0, v0 = 0) => polygon(circ(u0, v0, r, z, 48).slice(0, 48));

// ── せいろ ──
const RO = 160; // 上のふちの外の半径
const RI = 145; // 上のふちの内の半径（竹の輪の帯の幅 15）
const RIM_Z = 28; // 底から上のふちまでの深さ（＝ 奥の内側の壁の帯の高さ）
const SIDE = 80; // 外の側面（竹の胴）の高さ（上のふちから下）
const RIM_FACE = `${ell(RO, RIM_Z)} ${ell(RI, RIM_Z)}`; // 竹の輪（evenodd で中を抜く）
const INNER_WALL = polygon([...circ(0, 0, RI, RIM_Z, 24, PI, PI * 2), ...circ(0, 0, RI, 0, 24, PI * 2, PI)]);
const FLOOR = ell(RI, 0);
// 外の側面（左の端 → 手前の上のふち → 右の端 → 手前の下のふち）
const OUTER_SIDE = polygon([...circ(0, 0, RO, RIM_Z, 24, PI, 0), ...circ(0, 0, RO, RIM_Z - SIDE, 24, 0, PI)]);
// 外の形（上のふちの外・左右の側面・手前の下のふち）
const BODY_LINE = [
  arc(CX, FY - RIM_Z, RO, RO * SQ, PI * 0.97, PI * 3.03, 40, 0.7, 30), // 上のふち（外）
  smooth([pr(-RO, 0, RIM_Z), pr(-RO + 0.6, 0, RIM_Z - SIDE * 0.5), pr(-RO + 1.2, 0, RIM_Z - SIDE)]), // 左の側面
  smooth([pr(RO, 0, RIM_Z), pr(RO - 0.6, 0, RIM_Z - SIDE * 0.5), pr(RO - 1.2, 0, RIM_Z - SIDE)]), // 右の側面
  arc(CX, FY - RIM_Z + SIDE, RO - 1.2, (RO - 1.2) * SQ, PI * -0.005, PI * 1.005, 28, 0.7, 130), // 下のふち（手前）
];
// 中の線（2本）：上のふちの内（外のふちと2本で、ふちの厚みを表す）・外の側面の竹の帯1本（胴の中ほど）。
// 内側の奥の壁と底の境目は線にしない（奥の壁の淡い陰の下のふちが、その境目になる）
const BODY_IN = [
  arc(CX, FY - RIM_Z, RI, RI * SQ, PI * 0.96, PI * 3.02, 40, 0.5, 80),
  arc(CX, FY - RIM_Z + 42, RO - 0.8, (RO - 0.8) * SQ, PI * 0.02, PI * 0.98, 24, 0.6, 180),
];
// 陰（ごく淡い水彩。せいろだけの例外）：内側の奥の壁（上のふちの内と、底の境目の間の帯）だけ。光は左上から
const SHADE_WALL = INNER_WALL;

// ── しゅうまい ──
// 本物の写真のように、しゅうまいどうしの間と、せいろの内のふちとの間に敷き紙が見えるよう、
// しゅうまいは小さめ（形は K 倍に縮めるだけで、比率・ひだの本数・塗りは同じ）にして、せいろの内側の真ん中に寄せる。
// 左右の間は床の面で約 16。前後は、ななめ上から見ると手前の列が奥の列にかぶるので、
// 床の面では左右より広く空け、絵の上で列の間に敷き紙が見えるようにする。
// 手前の列は、足もとがせいろの手前の内のふちの線にかからず、その手前に底（敷き紙）が少し見える所まで奥に置く
// （そのぶん、2列のかたまりは床の面で少し奥に寄る。奥の列も少し奥へずらし、列の間を保つ）
const K = 0.7; // しゅうまいの大きさ（もとの形に対する倍率）
const H = 1.18; // しゅうまいの背（胴の高さだけの倍率。横幅は K のまま）
// しゅうまいの置き場所（床の面の u・v）。奥の列から
const SHUMAI_AT: readonly P[] = [
  [-46, -72],
  [46, -73],
  [-47, 50],
  [45, 49],
];
const R_BASE = 49 * K; // 底の半径
const R_MID = 54 * K; // いちばんふくらんだ所の半径
const R_TOP = 48 * K; // 上の口のふちの半径
const Z_TOP = 34 * K * H;
const R_MEAT = 35 * K; // 口から見えるあんの半径
const Z_MEAT = 38 * K * H;
// 胴の太さ（高さ z の所の半径）：底 → まん中でふくらみ → 口へすぼまる
const radiusAt = (z: number) =>
  R_BASE - 2 * K + (R_MID - R_BASE + 3 * K) * Math.sin((PI * z) / (Z_TOP * 1.3)) - 2.5 * K * (z / Z_TOP) ** 3;

// 凸包（胴のまわりの形を、高さごとの輪の点から作る）
function hull(pts: P[]): P[] {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: P[] = [];
  for (const p of s) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: P[] = [];
  for (const p of [...s].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

type Shumai = {
  body: string;
  outline: string;
  lipLine: string;
  creases: string[];
  meat: string;
  skinHole: Hole;
  meatHole: Hole;
};
const SHUMAI: Shumai[] = SHUMAI_AT.map(([u0, v0], i) => {
  const s = 1000 + i * 200;
  const ringAt = (r: number, z: number): P[] =>
    Array.from({ length: 64 }, (_, n) => {
      const t = (PI * 2 * n) / 64;
      const w = 1 + 0.02 * Math.sin(11 * t + i * 1.3);
      return pr(u0 + r * w * Math.cos(t), v0 + r * w * Math.sin(t), z);
    });
  const outer = hull(Array.from({ length: 13 }, (_, k) => ringAt(radiusAt((Z_TOP * k) / 12), (Z_TOP * k) / 12)).flat());
  // 口のふち（ゆるく波打つ輪）
  const lipPts = blobPts(...pr(u0, v0, Z_TOP), R_TOP, R_TOP * SQ, s + 400, 8, 0.03, 48);
  // 口のひだ（あんのふちから外へ向かう短い線を5本。左右と手前に）
  const creases = [0.12, 0.5, 0.88, 1.25, 1.75].map((f, k) => {
    const t = PI * f + jitter(s + 500 + k) * 0.05;
    const a = pr(u0 + (R_MEAT + K) * Math.cos(t), v0 + (R_MEAT + K) * Math.sin(t), Z_MEAT - 1.5 * K * H);
    const b = pr(u0 + (R_TOP - 3 * K) * Math.cos(t + 0.06), v0 + (R_TOP - 3 * K) * Math.sin(t + 0.06), Z_TOP + 0.5 * K * H);
    return smooth([a, b]);
  });
  // あん（口から見える面）
  const [mx, my] = pr(u0, v0, Z_MEAT);
  const meatPts = blobPts(mx, my, R_MEAT, R_MEAT * SQ + 2 * K, s + 600, 7, 0.04, 40);
  return {
    body: polygon(outer),
    outline: smooth([...outer, outer[0], outer[1]]),
    lipLine: smooth(lipPts),
    creases,
    meat: `${smooth(meatPts)} Z`,
    // 紙の色の抜け（胴の左の、光が当たる所と、あんの左上）
    skinHole: [r1(pr(u0 - 36 * K, v0 + 18 * K, 14 * K * H)[0]), r1(pr(u0 - 36 * K, v0 + 18 * K, 14 * K * H)[1]), 3.4 * K, 5.2 * K],
    meatHole: [r1(mx - 11 * K), r1(my - 5 * K), 3.4 * K, 1.8 * K],
  };
});

// ── ふた（せいろの上のふちにかぶさる、閉じた形） ──
const LC_Z = RIM_Z + 14; // ふたの上の面の高さ
const LC_R = RO + 3; // ふたの半径（せいろの上のふちにかぶさる）
const LC_BOTTOM = RIM_Z - 2; // ふたの下のふちの高さ（ふたの高さ ＝ LC_Z − LC_BOTTOM ＝ 16）

// ── ふたを手で開ける動き（手は描かない。ふたの動きだけで、人が手前のふちを持って開けた感じを出す） ──
// 支点は、ふたの奥のふち（下のふちの、いちばん奥の点 HINGE）。ななめ上から見たふたが開いていく形を、2Dの変形で表す：
// ・縦の伸び縮み（scaleY。支点のまわり）… 手前が浮いてふたが傾くほど、ふたの面は奥へ倒れて細く見え、手前のふちが上がる
// ・支点のまわりの小さな回転 … 右手で持ち上げたように、右の手前が少し先に上がる（左回り）
// ・支点ごとの移動 … 奥のふちも、せいろのふちから離れて、上の奥（上・少し右）へ持ち去られる
// 5つの形を、同じ並びの関数（translate・rotate・scale・translate）で書き、scenes.css の @keyframes seiro-lid-open が順につなぐ
//   0. 閉じた形
//   1. 手前が少し浮いた形（傾き約 12° のつもり。手前のふちが約 27 上がり、すき間から手前のしゅうまいがのぞく。奥のふちは付いたまま）
//   2. 少し浮いたまま、ほんの少し傾きが増した形（ここまでの 1〜2 が、ゆっくり見せる「少し浮いた状態」）
//   3. 大きく傾けた形（傾き約 35° のつもり。ふたの面はかなり細くなり、奥のふちも上の奥へ離れる）
//   4. 上の奥へ持ち去られた形（ここで消えきる）
const HINGE: P = pr(0, -LC_R, LC_BOTTOM);
const lidTransform = (dx: number, dy: number, rot: number, sy: number) =>
  `translate(${r1(HINGE[0] + dx)}px, ${r1(HINGE[1] + dy)}px) rotate(${rot}deg) scale(1, ${sy}) translate(${r1(-HINGE[0])}px, ${r1(-HINGE[1])}px)`;
const LID_VARS = {
  "--lid-0": lidTransform(0, 0, 0, 1),
  "--lid-1": lidTransform(0, 0, -1.5, 0.85),
  "--lid-2": lidTransform(0, -1, -2.5, 0.8),
  "--lid-3": lidTransform(6, -30, -5, 0.38),
  "--lid-4": lidTransform(10, -56, -5.5, 0.2),
};

const LID_CLOSED = (() => {
  const top = circ(0, 0, LC_R, LC_Z, 48).slice(0, 48);
  const side = [...circ(0, 0, LC_R, LC_Z, 24, PI, 0), ...circ(0, 0, LC_R, LC_BOTTOM, 24, 0, PI)];
  const fill = [polygon(side), polygon(top)];
  const lines = [
    smooth(arcPts(CX, FY - LC_Z, LC_R, LC_R * SQ, PI * 0.97, PI * 3.03, 40, 0.7, 2000)),
    smooth(arcPts(CX, FY - LC_BOTTOM, LC_R, LC_R * SQ, PI * -0.005, PI * 1.005, 28, 0.7, 2050)),
    smooth([pr(-LC_R, 0, LC_Z), pr(-LC_R, 0, LC_BOTTOM)]),
    smooth([pr(LC_R, 0, LC_Z), pr(LC_R, 0, LC_BOTTOM)]),
  ];
  // 中の線（4本）：内側の枠と、編み目3本
  const inner = [
    smooth(arcPts(CX, FY - LC_Z, RO - 12, (RO - 12) * SQ, PI * 0.96, PI * 3.02, 40, 0.5, 2100)),
    ...[-40, 5, 50].map((v, i) => {
      const half = (RO - 22) * Math.sqrt(1 - (v / (RO - 12)) ** 2);
      return smooth([pr(-half, v, LC_Z), pr(jitter(2150 + i) * 6, v + jitter(2160 + i), LC_Z), pr(half, v, LC_Z)]);
    }),
  ];
  return { fill, lines, inner };
})();

// ── 湯気（4本。奥の列のしゅうまいの口の上から。下から上へ描くので、点は下から並べる） ──
// 奥の列の口のまん中は、左が (154, 171)・右が (246, 170) あたり
const STEAM = [
  steam(146, 166, 58, 0.2, 8, 2500),
  steam(171, 161, 42, 2.1, 10, 2520),
  steam(231, 160, 46, 4.0, 9, 2540),
  steam(255, 165, 62, 1.0, 8, 2560),
];
const STEAM_SWAY = [sway(4.8, 0), sway(5.6, -1.8), sway(4.2, -3.1), sway(6.1, -0.9)];
// すき間からもれる湯気（2本）。手前が浮いた所（ふたの手前のふちと、せいろの手前のふちの間）から、ふわっと出て、
// ふたが持ち去られるころに消える（scenes.css の seiro-leak。動き終わりは見えない）。
// 出どころは、左のすき間（しゅうまいとせいろの内のふちの間）と、手前の2つのしゅうまいの間。ふたの手前のふちを越えて立ちのぼる
const LEAK = [steam(104, 288, 192, 1.3, 11, 2600), steam(199, 292, 204, 3.4, 10, 2620)];
const LEAK_SWAY = [sway(5.2, -0.6), sway(4.6, -2.2)];

export default function SeiroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="22 30 356 356"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 356 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 湯気は上のほうで薄くなる（線の色は同じ foreground のまま、濃さだけ変える。ほかの絵の湯気と同じ） */}
        <linearGradient id="seiro-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1="230" x2="0" y2="40">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.75" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        {/* すき間からもれる湯気は、出どころ（下）から上へ、すぐ薄くなる */}
        <linearGradient id="seiro-leak-fade" gradientUnits="userSpaceOnUse" x1="0" y1="292" x2="0" y2="190">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        {/* 水彩のにじみ（塗りにだけ。絵の中で使い回す） */}
        <WashFilter id="seiro-wash" seed={11} />
      </defs>

      {/* 1. 閉じたせいろ（本体・しゅうまい・閉じたふた）が、まとめて1つの g で現れる。
          まとめて薄くしてから出すので、出てくる途中も、閉じたふたの下のしゅうまいは透けて見えない */}
      <g className="seiro-set scene-anim" style={anim("scene-fade-up", 4, 12, { "--dy": "8px" })}>
        {/* せいろ（後ろを隠す紙の色の面 → 線） */}
        <g className="seiro-body">
          <path d={OUTER_SIDE} className="scene-paper" stroke="none" />
          <path d={INNER_WALL} className="scene-paper" stroke="none" />
          <path d={FLOOR} className="scene-paper" stroke="none" />
          <path d={RIM_FACE} className="scene-paper" fillRule="evenodd" stroke="none" />
          {/* ごく淡い水彩の陰（せいろだけの例外）：内側の奥の壁だけ */}
          <g>
            <Wash filter="seiro-wash" d={SHADE_WALL} tone="seiro-wash-shade" id="seiro-w-wall" shift={[1, 0.75]} />
          </g>
          {BODY_IN.map((d, i) => (
            <path key={`i${i}`} d={d} className="scene-fine" />
          ))}
          {BODY_LINE.map((d, i) => (
            <path key={i} d={d} className="scene-line" />
          ))}
        </g>

        {/* しゅうまい（はじめから、閉じたふたの下にある） */}
        <g className="seiro-shumai">
          {SHUMAI.map((p, i) => (
            <g key={i}>
              {/* 後ろの線を隠す紙の色 → 皮とあんの水彩（ふたが開いて、しゅうまいが見えてから、じわっと出る）→ ひだ → 口のふち → 輪郭 */}
              <path d={p.body} className="scene-paper" stroke="none" />
              <g className="scene-anim" style={anim("scene-fade-up", 40 + i, 48 + i, { "--dy": "0px" })}>
                <Wash filter="seiro-wash" d={p.body} tone="food-wash-skin" id={`seiro-w-skin-${i}`} shift={[1.1, 0.9]} holes={[p.skinHole]} />
                <Wash filter="seiro-wash" d={p.meat} tone="food-wash-meat" id={`seiro-w-meat-${i}`} shift={[0.9, 0.75]} holes={[p.meatHole]} />
              </g>
              {p.creases.map((d, k) => (
                <path key={`c${k}`} d={d} className="scene-fine" />
              ))}
              <path d={p.lipLine} className="scene-fine" />
              <path d={p.outline} className="scene-line" />
            </g>
          ))}
        </g>

        {/* 2. ふた（手前のふちから持ち上がり、奥のふちを支点に傾いて、上の奥へ持ち去られて消える。動き終わりは見えない。
            transform は LID_VARS。ふたが残っている奥の部分は、しゅうまいを隠したまま） */}
        <g className="seiro-lid-move scene-anim" style={anim("seiro-lid-open", 14, 48, LID_VARS)}>
          {LID_CLOSED.fill.map((d, i) => (
            <path key={`f${i}`} d={d} className="scene-paper" stroke="none" />
          ))}
          {LID_CLOSED.inner.map((d, i) => (
            <path key={`i${i}`} d={d} className="scene-fine" />
          ))}
          {LID_CLOSED.lines.map((d, i) => (
            <path key={i} d={d} className="scene-line" />
          ))}
        </g>
      </g>

      {/* 3. すき間からもれる湯気（手前が浮いた所から、ふわっと出て、ふたが持ち去られるころに消える） */}
      <g className="seiro-steam" stroke="url(#seiro-leak-fade)">
        {LEAK.map((d, i) => (
          <g key={`l${i}`} className="scene-sway" style={LEAK_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-fine scene-stroke-draw seiro-leak scene-anim"
              style={anim("seiro-leak", 21 + i * 2, 40 + i)}
            />
          </g>
        ))}
      </g>

      {/* 4. 湯気（奥の列のしゅうまいの上から立ちのぼる。時間でゆっくり揺れる） */}
      <g className="seiro-steam" stroke="url(#seiro-steam-fade)">
        {STEAM.map((d, i) => (
          <g key={i} className="scene-sway" style={STEAM_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-line scene-stroke-draw scene-anim"
              style={anim("scene-draw", 46 + i * 2, [54, 56, 58, 60][i])}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
