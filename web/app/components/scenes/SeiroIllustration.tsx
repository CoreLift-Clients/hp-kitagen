// ─── せいろ（自家製しゅうまい）の線画 ───
// トップの名物の場面と、ディナーメニューの名物の欄の壱（しゅうまい）のカードで使う飾りの絵（aria-hidden。意味は横の文・品名で伝える）。
// 本物の盛り付け（代表者から届いた写真）をもとに、料理の絵の決まり（scenes.css の先頭）で抽象化する：
// 明るい竹のせいろを上からのぞき込み、穴のあいた敷き紙の上に、まるっとしたしゅうまいを4つ（2つずつ2列）並べる。
// ・形で伝える：上からのぞいた丸いせいろと、上の口が開いた丸いしゅうまい4つ
// ・特徴は2つだけ：しゅうまいの口から見える茶色のあん、口のまわりのひだ（6本）
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く
// ・色はべた塗り＋陰1段（グラデーションは使わない）。この絵だけの決まりとして、あん・陰に foreground の色を混ぜ、
//   皮と敷き紙に白を使う（scenes.css の .seiro-*）
// ・せいろ：上のふちの竹の輪（明るい竹の色）。陰の1段は、外の側面と内側の奥の壁。中の線は、内のふち・竹の帯・奥の壁と底の境目の3本
// ・敷き紙：白に近い淡い面に、小さな丸い穴を5つ
// ・しゅうまい：皮は淡いクリーム色、右下にべたの陰1段。あんは茶色のべた塗りに点を3つ。敷き紙の上に、うすいべたの落ち影
// ・ふた：動き終わりは、せいろの奥（上）へ持ち上げて少し傾けた形（しゅうまいを隠さない。せいろの後ろに描く）。
//   閉じたふた（しゅうまいの上に描く）は、現れてから持ち上がって消え、入れ替わりに奥のふたが下から上がってくる
// ・湯気（時間で揺れる）は、奥の列のしゅうまいの上から立ちのぼる
// ・部品ごとに g でまとめる：奥のふた（seiro-lid）・本体（seiro-body）・敷き紙（seiro-paper）・しゅうまい（seiro-shumai）・
//   閉じたふた（seiro-lid-closed）・湯気（seiro-steam）。重なりの順もこのとおり
// ・動きの順番：せいろ → 敷き紙 → しゅうまいが1つずつ → ふたがかぶさってから持ち上がる → 湯気
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）。何も動かさないときの形が、動き終わった形
// ・見る角度は上から（床の面を縦に SQ だけつぶす。pr()）
// ・絵は viewBox を 356 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
//
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, arc, blobPts, jitter, polygon, r1, smooth, steam, sway, type P } from "./draw";

// ── 見る角度（床の面の点 u・v と高さ z を、絵の座標にする） ──
const CX = 200;
const FY = 252; // せいろの底（敷き紙の面）のまん中の y
const SQ = 0.64; // 縦のつぶし（上からのぞき込む）
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
const RIM_Z = 26; // 底から上のふちまでの深さ
const SIDE = 40; // 外の側面の高さ（上のふちから下）
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
// 中の線（3本）：上のふちの内・外の側面の竹の帯・内側の奥の壁と底の境目
const BODY_IN = [
  arc(CX, FY - RIM_Z, RI, RI * SQ, PI * 0.96, PI * 3.02, 40, 0.5, 80),
  arc(CX, FY - RIM_Z + 18, RO - 0.5, (RO - 0.5) * SQ, PI * 0.02, PI * 0.98, 24, 0.6, 160),
  arc(CX, FY, RI, RI * SQ, PI * 1.04, PI * 1.96, 24, 0.4, 220),
];

// ── 敷き紙（底いっぱい。穴は、しゅうまいの間と外まわりに5つだけ） ──
const PAPER = ell(RI - 4, 0.5);
const HOLES: P[] = [
  [0, 0],
  [0, -112],
  [-124, 2],
  [124, -2],
  [0, 114],
].map(([u, v]) => pr(u, v, 0.5));

// ── しゅうまい ──
// しゅうまいの置き場所（床の面の u・v）。奥の列から
const SHUMAI_AT: readonly P[] = [
  [-57, -55],
  [57, -57],
  [-58, 56],
  [56, 55],
];
const R_BASE = 49; // 底の半径
const R_MID = 54; // いちばんふくらんだ所の半径
const R_TOP = 48; // 上の口のふちの半径
const Z_TOP = 34;
const R_MEAT = 35; // 口から見えるあんの半径
const Z_MEAT = 38;
// 胴の太さ（高さ z の所の半径）：底 → まん中でふくらみ → 口へすぼまる
const radiusAt = (z: number) => R_BASE - 2 + (R_MID - R_BASE + 3) * Math.sin((PI * z) / (Z_TOP * 1.3)) - 2.5 * (z / Z_TOP) ** 3;

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
  shadow: string;
  body: string;
  lit: string;
  outline: string;
  lip: string;
  lipLine: string;
  creases: string[];
  meat: string;
  dots: P[];
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
  // 口のひだ（あんのふちから外へ向かう短い線を6本。左右と手前に）
  const creases = [0.12, 0.42, 0.68, 0.95, 1.25, 1.75].map((f, k) => {
    const t = PI * f + jitter(s + 500 + k) * 0.05;
    const a = pr(u0 + (R_MEAT + 1) * Math.cos(t), v0 + (R_MEAT + 1) * Math.sin(t), Z_MEAT - 1.5);
    const b = pr(u0 + (R_TOP - 3) * Math.cos(t + 0.06), v0 + (R_TOP - 3) * Math.sin(t + 0.06), Z_TOP + 0.5);
    return smooth([a, b]);
  });
  // あん（口から見える面）と、点を3つ
  const [mx, my] = pr(u0, v0, Z_MEAT);
  const meatPts = blobPts(mx, my, R_MEAT, R_MEAT * SQ + 2, s + 600, 7, 0.04, 40);
  const dots: P[] = [
    [mx - 12, my - 4],
    [mx + 9, my - 7],
    [mx + 2, my + 7],
  ];
  return {
    shadow: polygon(circ(u0 + 9, v0 + 9, R_MID + 2, 0.6, 40).slice(0, 40)),
    body: polygon(outer),
    // 明るい面（胴を左上へずらした形）。胴の形で切り取り、右下に陰の1段を残す
    lit: polygon(outer.map(([x, y]) => [x - 9, y - 7] as const)),
    outline: smooth([...outer, outer[0], outer[1]]),
    lip: `${smooth(lipPts)} Z`,
    lipLine: smooth(lipPts),
    creases,
    meat: `${smooth(meatPts)} Z`,
    dots,
  };
});

// ── ふた ──
// 閉じたふた（せいろの上のふちにかぶさる。動きの途中だけ見える）
const LC_Z = RIM_Z + 14; // ふたの上の面の高さ
const LID_CLOSED_TOP = ell(RO + 3, LC_Z);
const LID_CLOSED_SIDE = polygon([...circ(0, 0, RO + 3, LC_Z, 24, PI, 0), ...circ(0, 0, RO + 3, RIM_Z - 2, 24, 0, PI)]);
const LID_CLOSED_LINE = [
  arc(CX, FY - LC_Z, RO + 3, (RO + 3) * SQ, PI * 0.97, PI * 3.03, 40, 0.7, 2000),
  arc(CX, FY - RIM_Z + 2, RO + 3, (RO + 3) * SQ, PI * -0.005, PI * 1.005, 28, 0.7, 2050),
  smooth([pr(-RO - 3, 0, LC_Z), pr(-RO - 3, 0, RIM_Z - 2)]),
  smooth([pr(RO + 3, 0, LC_Z), pr(RO + 3, 0, RIM_Z - 2)]),
];
// 中の線（4本）：内側の枠と、編み目3本
const LID_CLOSED_IN = [
  arc(CX, FY - LC_Z, RO - 12, (RO - 12) * SQ, PI * 0.96, PI * 3.02, 40, 0.5, 2100),
  ...[-40, 5, 50].map((v, i) => {
    const half = (RO - 22) * Math.sqrt(1 - (v / (RO - 12)) ** 2);
    return smooth([pr(-half, v, LC_Z), pr(jitter(2150 + i) * 6, v + jitter(2160 + i), LC_Z), pr(half, v, LC_Z)]);
  }),
];

// 持ち上げたふた（奥。少し傾けて、せいろの奥のふちに立てかけたように見せる）
const LO_X = 200;
const LO_Y = 92; // 上の面のまん中
const LO_RX = 150;
const LO_RY = 36; // 奥へ倒れているので、上の面は細いだ円に見える
const LO_T = 13; // ふたのふちの厚み
const LO_ROT = -5; // 傾き（度）
const lidPts = (cy: number, t0: number, t1: number, n = 24): P[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / n;
    return [LO_X + LO_RX * Math.cos(t), cy + LO_RY * Math.sin(t)];
  });
const LID_OPEN_TOP = polygon(lidPts(LO_Y, 0, PI * 2, 48).slice(0, 48));
const LID_OPEN_SIDE = polygon([...lidPts(LO_Y, PI, 0), ...lidPts(LO_Y + LO_T, 0, PI)]);
const LID_OPEN_LINE = [
  arc(LO_X, LO_Y, LO_RX, LO_RY, PI * 0.97, PI * 3.03, 40, 0.6, 2200),
  arc(LO_X, LO_Y + LO_T, LO_RX, LO_RY, PI * -0.005, PI * 1.005, 28, 0.6, 2250),
  smooth([[LO_X - LO_RX, LO_Y], [LO_X - LO_RX, LO_Y + LO_T]]),
  smooth([[LO_X + LO_RX, LO_Y], [LO_X + LO_RX, LO_Y + LO_T]]),
];
// 中の線（4本）：内側の枠と、上の面の編み目3本
const LID_OPEN_IN = [
  arc(LO_X, LO_Y, LO_RX - 12, LO_RY - 4, PI * 0.96, PI * 3.02, 40, 0.4, 2300),
  ...[-12, 0, 12].map((dy, i) => {
    const y = LO_Y + dy;
    const half = (LO_RX - 24) * Math.sqrt(Math.max(0, 1 - (dy / (LO_RY - 6)) ** 2));
    return smooth([[LO_X - half, y], [LO_X + jitter(2350 + i) * 10, y + jitter(2360 + i)], [LO_X + half, y]]);
  }),
];

// ── 湯気（4本。奥の列のしゅうまいの上から。下から上へ描くので、点は下から並べる） ──
const STEAM = [
  steam(132, 176, 58, 0.2, 8, 2500),
  steam(168, 170, 42, 2.1, 10, 2520),
  steam(236, 168, 46, 4.0, 9, 2540),
  steam(270, 174, 62, 1.0, 8, 2560),
];
const STEAM_SWAY = [sway(4.8, 0), sway(5.6, -1.8), sway(4.2, -3.1), sway(6.1, -0.9)];

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
        {/* しゅうまいの胴の形（明るい面をこの形で切り取る） */}
        {SHUMAI.map((p, i) => (
          <clipPath key={i} id={`seiro-shumai-${i}`}>
            <path d={p.body} />
          </clipPath>
        ))}
      </defs>

      {/* 1. 持ち上げたふた（せいろの奥。動き終わりの形。下から持ち上がってくる） */}
      <g className="seiro-lid scene-anim" style={anim("seiro-lid-up", 38, 50, { "--o": "50% 100%" })}>
        <g transform={`rotate(${LO_ROT} ${LO_X} ${LO_Y})`}>
          <path d={LID_OPEN_SIDE} className="seiro-bamboo-shade" stroke="none" />
          <path d={LID_OPEN_TOP} className="seiro-bamboo" stroke="none" />
          {LID_OPEN_IN.map((d, i) => (
            <path key={i} d={d} className="scene-fine seiro-in" />
          ))}
          {LID_OPEN_LINE.map((d, i) => (
            <path key={i} d={d} className="seiro-outline" />
          ))}
        </g>
      </g>

      {/* 2. せいろ（陰の面：外の側面・内側の奥の壁 → 竹の輪 → 線） */}
      <g className="seiro-body scene-anim" style={anim("scene-fade-up", 4, 10, { "--dy": "8px" })}>
        <path d={OUTER_SIDE} className="seiro-bamboo-shade" stroke="none" />
        <path d={INNER_WALL} className="seiro-bamboo-shade" stroke="none" />
        <path d={FLOOR} className="seiro-bamboo-shade" stroke="none" />
        <path d={RIM_FACE} className="seiro-bamboo" fillRule="evenodd" stroke="none" />
        {BODY_IN.map((d, i) => (
          <path key={`i${i}`} d={d} className="scene-fine seiro-in" />
        ))}
        {BODY_LINE.map((d, i) => (
          <path key={i} d={d} className="seiro-outline" />
        ))}
      </g>

      {/* 3. 敷き紙（淡い面に、小さな丸い穴を5つ） */}
      <g className="seiro-paper scene-anim" style={anim("scene-fade-up", 10, 14, { "--dy": "0px" })}>
        <path d={PAPER} className="seiro-paper-face" stroke="none" />
        {HOLES.map(([x, y], i) => (
          <ellipse key={i} cx={r1(x)} cy={r1(y)} rx={3} ry={2} className="seiro-hole" stroke="none" />
        ))}
      </g>

      {/* 4. しゅうまい（奥の列から1つずつ、上から置かれる） */}
      <g className="seiro-shumai">
        {SHUMAI.map((p, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 14 + i * 5, 20 + i * 5, { "--dy": "-18px" })}>
            <path d={p.shadow} className="seiro-shadow" stroke="none" />
            {/* 皮：陰の色で胴を塗り、左上へずらした明るい面を重ねて、右下に陰の1段を残す */}
            <path d={p.body} className="seiro-skin-shade" stroke="none" />
            <path d={p.lit} className="seiro-skin" stroke="none" clipPath={`url(#seiro-shumai-${i})`} />
            <path d={p.lip} className="seiro-skin" stroke="none" />
            {p.creases.map((d, k) => (
              <path key={`c${k}`} d={d} className="seiro-crease" />
            ))}
            <path d={p.meat} className="seiro-mince" stroke="none" />
            {p.dots.map(([x, y], k) => (
              <circle key={`d${k}`} cx={r1(x)} cy={r1(y)} r={1.8} className="seiro-mince-dot" stroke="none" />
            ))}
            <path d={p.lipLine} className="seiro-lip-line" />
            <path d={p.outline} className="seiro-outline" />
          </g>
        ))}
      </g>

      {/* 5. 閉じたふた（しゅうまいの上にかぶさってから、持ち上がって消える。動き終わりは見えない） */}
      <g className="seiro-lid-closed scene-anim" style={anim("seiro-lid-lift", 32, 44)}>
        <path d={LID_CLOSED_SIDE} className="seiro-bamboo-shade" stroke="none" />
        <path d={LID_CLOSED_TOP} className="seiro-bamboo" stroke="none" />
        {LID_CLOSED_IN.map((d, i) => (
          <path key={i} d={d} className="scene-fine seiro-in" />
        ))}
        {LID_CLOSED_LINE.map((d, i) => (
          <path key={i} d={d} className="seiro-outline" />
        ))}
      </g>

      {/* 6. 湯気（奥の列のしゅうまいの上から立ちのぼる。時間でゆっくり揺れる） */}
      <g className="seiro-steam" stroke="url(#seiro-steam-fade)">
        {STEAM.map((d, i) => (
          <g key={i} className="scene-sway" style={STEAM_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-line scene-stroke-draw scene-anim"
              style={anim("scene-draw", 46 + i * 2, [55, 57, 58, 59][i])}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
