// ─── せいろ（自家製しゅうまい）の線画 ───
// トップの名物の場面と、ディナーメニューの名物の欄の壱（しゅうまい）のカードで使う飾りの絵（aria-hidden。意味は横の文・品名で伝える）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：明るい竹のせいろを上からのぞき込み、穴のあいた敷き紙の上に、
// 大きくまるっとしたしゅうまいを4つ（2つずつ2列）、せいろの中いっぱいに並べる。
// 小さいカードでも何の料理か分かるように、色と明暗の差をはっきり付ける：
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く
// ・この絵だけの決まりとして、あん・陰に foreground の色を混ぜ、皮と敷き紙に白を使う（scenes.css の .seiro-*）
// ・せいろ：明るい竹の色（accent をごく淡く）。上のふちの竹の輪（太い帯）、内側の奥の壁、外の側面と竹の帯
// ・敷き紙：白に近い淡い面に、小さな丸い穴（しゅうまいの間からのぞく分だけ）
// ・しゅうまい：皮は少し透けた淡いクリーム色。上の口から、ピンクがかった茶色のあん（ひき肉のつぶつぶを小さな点で）。
//   口のまわりのひだと、胴の細かいしわ（上の口へ向かって寄る短い線）。下と右側にうすい陰、敷き紙の上に落ち影
// ・ふた：動き終わりは、せいろの奥（上）へ持ち上げて少し傾けた形（しゅうまいを隠さない。せいろの後ろに描く）。
//   閉じたふた（しゅうまいの上に描く）は、現れてから持ち上がって消え、入れ替わりに奥のふたが下から上がってくる
// ・湯気（時間で揺れる）は、しゅうまいの上から立ちのぼる
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
const BODY_LINE = [
  arc(CX, FY - RIM_Z, RO, RO * SQ, PI * 0.97, PI * 3.03, 40, 0.7, 30), // 上のふち（外）
  arc(CX, FY - RIM_Z, RI, RI * SQ, PI * 0.96, PI * 3.02, 40, 0.5, 80), // 上のふち（内）
  smooth([pr(-RO, 0, RIM_Z), pr(-RO + 0.6, 0, RIM_Z - SIDE * 0.5), pr(-RO + 1.2, 0, RIM_Z - SIDE)]), // 左の側面
  smooth([pr(RO, 0, RIM_Z), pr(RO - 0.6, 0, RIM_Z - SIDE * 0.5), pr(RO - 1.2, 0, RIM_Z - SIDE)]), // 右の側面
  arc(CX, FY - RIM_Z + SIDE, RO - 1.2, (RO - 1.2) * SQ, PI * -0.005, PI * 1.005, 28, 0.7, 130), // 下のふち（手前）
];
const BODY_FINE = [
  // 外の側面の竹の帯（2本）
  arc(CX, FY - RIM_Z + 15, RO - 0.4, (RO - 0.4) * SQ, PI * 0.02, PI * 0.98, 24, 0.6, 160),
  arc(CX, FY - RIM_Z + 22, RO - 0.6, (RO - 0.6) * SQ, PI * 0.03, PI * 0.97, 24, 0.6, 190),
  // 内側の奥の壁と底の境目
  arc(CX, FY, RI, RI * SQ, PI * 1.04, PI * 1.96, 24, 0.4, 220),
];
// 竹の輪の帯の上の、竹の継ぎ目（短い筋）と、内側の奥の壁の竹の筋
const BODY_HAIR = [
  ...[0.22, 0.62, 1.12, 1.5, 1.86].map((t, i) => {
    const a = PI * t;
    return smooth([pr((RI + 2) * Math.cos(a), (RI + 2) * Math.sin(a), RIM_Z), pr((RO - 2) * Math.cos(a + 0.01), (RO - 2) * Math.sin(a + 0.01), RIM_Z)]);
  }),
  ...Array.from({ length: 13 }, (_, i) => {
    const a = PI * (1.12 + i * 0.06);
    const x = RI * Math.cos(a);
    const y = RI * Math.sin(a);
    return smooth([pr(x, y, RIM_Z - 3), pr(x + jitter(260 + i) * 0.6, y, 4)]);
  }),
];

// ── 敷き紙（底いっぱい。穴は、しゅうまいの間と外まわりからのぞく分だけ） ──
const PAPER = ell(RI - 4, 0.5);
// しゅうまいの置き場所（床の面の u・v）。奥の列から
const SHUMAI_AT: readonly P[] = [
  [-57, -55],
  [57, -57],
  [-58, 56],
  [56, 55],
];
const R_BASE = 49; // 底の半径
const R_MID = 54; // いちばんふくらんだ所の半径
const Z_MID = 15;
const R_TOP = 48; // 上の口のふちの半径
const Z_TOP = 34;
const R_MEAT = 35; // 口から見えるあんの半径
const Z_MEAT = 38;
const HOLES: P[] = [];
[30, 64, 96, 124].forEach((r, ri) => {
  const n = Math.round((r * 2 * PI) / 22);
  for (let k = 0; k < n; k++) {
    const t = (PI * 2 * k) / n + ri * 0.4;
    const u = r * Math.cos(t);
    const v = r * Math.sin(t);
    if (SHUMAI_AT.every(([su, sv]) => Math.hypot(u - su, v - sv) > R_MID + 6)) HOLES.push(pr(u, v, 0.5));
  }
});
// 敷き紙のしわ（細い折り目）
const PAPER_FOLD = [
  smooth([pr(-130, 8, 0.5), pr(-100, 4, 0.5), pr(-80, 2, 0.5)]),
  smooth([pr(78, -2, 0.5), pr(104, 3, 0.5), pr(128, 10, 0.5)]),
  smooth([pr(-6, -128, 0.5), pr(-2, -110, 0.5)]),
];

// ── しゅうまい ──
// 凸包（胴のまわりの形を、底・ふくらみ・口の3つの輪の点から作る）
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

// 胴の太さ（高さ z の所の半径）
const radiusAt = (z: number) => R_BASE - 2 + (R_MID - R_BASE + 3) * Math.sin((PI * z) / (Z_TOP * 1.3)) - 2.5 * (z / Z_TOP) ** 3;

type Shumai = {
  shadow: string;
  body: string;
  outline: string;
  pleats: string[];
  lip: string;
  lipLine: string;
  creases: string[];
  meat: string;
  meatLine: string;
  meatShade: string;
  crumbs: { x: number; y: number; r: number; dark: boolean }[];
  grains: string[];
};
const SHUMAI: Shumai[] = SHUMAI_AT.map(([u0, v0], i) => {
  const s = 1000 + i * 200;
  // 胴の輪（少しでこぼこ。皮のしわの寄り）
  const wobble = (t: number, k: number) => 1 + 0.025 * Math.sin(11 * t + i * 1.3 + k) + jitter(s + Math.round(t * 20) + k * 50) * 0.012;
  const ringAt = (r: number, z: number, k: number): P[] =>
    Array.from({ length: 64 }, (_, n) => {
      const t = (PI * 2 * n) / 64;
      return pr(u0 + r * wobble(t, k) * Math.cos(t), v0 + r * wobble(t, k) * Math.sin(t), z);
    });
  // 胴の太さ（高さ z ごと）：底 → まん中でふくらみ → 口へすぼまる。輪をたくさん重ねて、まるっとした形にする
  const outer = hull(Array.from({ length: 13 }, (_, k) => ringAt(radiusAt((Z_TOP * k) / 12), (Z_TOP * k) / 12, k % 3)).flat());
  // 胴のしわ（底から口へ向かって寄る短い線。手前と左右の、見える所だけ）
  const pleats: string[] = [];
  const NP = 20;
  for (let k = 0; k < NP; k++) {
    const t = PI * (-0.2 + (1.4 * (k + 0.5)) / NP) + jitter(s + 300 + k) * 0.05;
    const tw = 0.08 + jitter(s + 330 + k) * 0.05; // 口へ向かってねじれながら寄る
    const len = 0.55 + 0.35 * Math.abs(Math.sin(k * 1.7 + i));
    const pts: P[] = [0, 0.5, 1].map((f) => {
      const z = 3 + (Z_TOP - 3) * (0.25 + f * 0.75) * len + (f === 1 ? (Z_TOP - 3) * (1 - len) * 0.9 : 0);
      const r = radiusAt(z) - 0.8;
      const a = t + tw * f;
      return pr(u0 + r * Math.cos(a), v0 + r * Math.sin(a), z);
    });
    pleats.push(smooth(pts));
  }
  // 口のふち（ひだが波打つ輪）
  const lipPts = blobPts(...pr(u0, v0, Z_TOP), R_TOP, R_TOP * SQ, s + 400, 16, 0.03, 64);
  // 口のひだ（あんのふちから外へ向かう短い線。ぐるりと）
  const creases: string[] = [];
  const NC = 30;
  for (let k = 0; k < NC; k++) {
    const t = (PI * 2 * k) / NC + jitter(s + 500 + k) * 0.06;
    const r0 = R_MEAT + 1;
    const r1_ = R_TOP - 1.5 - Math.abs(jitter(s + 540 + k)) * 3;
    const a = pr(u0 + r0 * Math.cos(t), v0 + r0 * Math.sin(t), Z_MEAT - 1.5);
    const b = pr(u0 + r1_ * Math.cos(t + 0.05), v0 + r1_ * Math.sin(t + 0.05), Z_TOP + 0.5);
    creases.push(smooth([a, [(a[0] + b[0]) / 2 + jitter(s + 580 + k) * 0.8, (a[1] + b[1]) / 2], b]));
  }
  // あん（口から見える、こんもりした面）
  const [mx, my] = pr(u0, v0, Z_MEAT);
  const meatPts = blobPts(mx, my, R_MEAT, R_MEAT * SQ + 2, s + 600, 9, 0.05, 40);
  // あんの右下の陰（口のふちの影）
  const meatShade = polygon([
    ...Array.from({ length: 13 }, (_, n) => {
      const t = PI * (-0.15 + (0.95 * n) / 12);
      return [mx + R_MEAT * 1.02 * Math.cos(t), my + (R_MEAT * SQ + 2) * 1.02 * Math.sin(t)] as P;
    }),
    ...Array.from({ length: 13 }, (_, n) => {
      const t = PI * (0.8 - (0.95 * n) / 12);
      return [mx - 4 + R_MEAT * 0.86 * Math.cos(t), my - 3 + (R_MEAT * SQ + 2) * 0.8 * Math.sin(t)] as P;
    }),
  ]);
  // ひき肉のつぶつぶ（ひまわりの種のように散らす）
  const crumbs = Array.from({ length: 30 }, (_, k) => {
    const rr = 0.86 * Math.sqrt((k + 0.5) / 30);
    const a = k * 2.39996 + i;
    return {
      x: r1(mx + R_MEAT * rr * Math.cos(a) + jitter(s + 700 + k) * 1.5),
      y: r1(my + (R_MEAT * SQ + 1) * rr * Math.sin(a) + jitter(s + 740 + k) * 1),
      r: r1(1.1 + Math.abs(jitter(s + 780 + k)) * 0.9),
      dark: k % 3 !== 1,
    };
  });
  const grains = Array.from({ length: 9 }, (_, k) => {
    const rr = 0.7 * Math.sqrt((k + 0.5) / 9);
    const a = k * 2.39996 + 1.2 + i;
    const x = mx + R_MEAT * rr * Math.cos(a);
    const y = my + R_MEAT * SQ * rr * Math.sin(a);
    const d = 2.2 + jitter(s + 820 + k) * 0.8;
    const ang = jitter(s + 850 + k) * 1.4;
    return smooth([
      [x - d * Math.cos(ang), y - d * Math.sin(ang) * 0.6],
      [x + d * Math.cos(ang), y + d * Math.sin(ang) * 0.6],
    ]);
  });
  return {
    shadow: polygon(circ(u0 + 9, v0 + 9, R_MID + 2, 0.6, 40).slice(0, 40)),
    body: polygon(outer),
    outline: smooth([...outer, outer[0], outer[1]]),
    pleats,
    lip: polygon(lipPts),
    lipLine: smooth(lipPts),
    creases,
    meat: polygon(meatPts),
    meatLine: smooth(meatPts),
    meatShade,
    crumbs,
    grains,
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
const LID_CLOSED_FINE = [
  arc(CX, FY - LC_Z, RO - 12, (RO - 12) * SQ, PI * 0.96, PI * 3.02, 40, 0.5, 2100),
  ...[-60, -25, 10, 45, 78].map((v, i) => {
    const half = (RO - 18) * Math.sqrt(1 - (v / (RO - 12)) ** 2);
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
const lidPts = (cy: number, t0: number, t1: number, n = 24, rx = LO_RX, ry = LO_RY): P[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / n;
    return [LO_X + rx * Math.cos(t), cy + ry * Math.sin(t)];
  });
const LID_OPEN_TOP = polygon(lidPts(LO_Y, 0, PI * 2, 48).slice(0, 48));
const LID_OPEN_SIDE = polygon([...lidPts(LO_Y, PI, 0), ...lidPts(LO_Y + LO_T, 0, PI)]);
const LID_OPEN_LINE = [
  arc(LO_X, LO_Y, LO_RX, LO_RY, PI * 0.97, PI * 3.03, 40, 0.6, 2200),
  arc(LO_X, LO_Y + LO_T, LO_RX, LO_RY, PI * -0.005, PI * 1.005, 28, 0.6, 2250),
  smooth([[LO_X - LO_RX, LO_Y], [LO_X - LO_RX, LO_Y + LO_T]]),
  smooth([[LO_X + LO_RX, LO_Y], [LO_X + LO_RX, LO_Y + LO_T]]),
];
const LID_OPEN_FINE = [
  arc(LO_X, LO_Y, LO_RX - 12, LO_RY - 4, PI * 0.96, PI * 3.02, 40, 0.4, 2300),
  // 上の面の編み目（ところどころ途切れる短い筋）
  ...[-16, -6, 4, 14].flatMap((dy, i) => {
    const y = LO_Y + dy;
    const half = (LO_RX - 18) * Math.sqrt(Math.max(0, 1 - (dy / (LO_RY - 6)) ** 2));
    const cut = LO_X + jitter(2350 + i) * 40;
    return [
      smooth([[LO_X - half, y], [cut - 9, y + jitter(2360 + i)]]),
      smooth([[cut + 9, y + jitter(2370 + i)], [LO_X + half, y]]),
    ];
  }),
  // ふちの竹の帯
  arc(LO_X, LO_Y + LO_T * 0.55, LO_RX, LO_RY, PI * 0.03, PI * 0.97, 24, 0.4, 2400),
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
        {/* 湯気は上のほうで薄くなる（線の色は同じ foreground のまま、濃さだけ変える） */}
        <linearGradient id="seiro-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1="230" x2="0" y2="40">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.75" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        {/* しゅうまいの胴の陰：左上は明るく、下と右側にうすい陰 */}
        <linearGradient id="seiro-shumai-shade" x1="0.15" y1="0.1" x2="0.95" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.26" />
        </linearGradient>
        {/* 内側の奥の壁：上のふちの下ほど暗い */}
        <linearGradient id="seiro-wall-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
        {/* 外の側面：右側を少し暗く */}
        <linearGradient id="seiro-side-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.02" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {/* 1. 持ち上げたふた（せいろの奥。動き終わりの形。下から持ち上がってくる） */}
      <g className="seiro-lid scene-anim" style={anim("seiro-lid-up", 38, 50, { "--o": "50% 100%" })}>
        <g transform={`rotate(${LO_ROT} ${LO_X} ${LO_Y})`}>
          <path d={LID_OPEN_SIDE} className="seiro-bamboo-side" stroke="none" />
          <path d={LID_OPEN_SIDE} fill="url(#seiro-side-shade)" stroke="none" />
          <path d={LID_OPEN_TOP} className="seiro-bamboo" stroke="none" />
          {LID_OPEN_FINE.map((d, i) => (
            <path key={i} d={d} className="scene-fine seiro-hair" />
          ))}
          {LID_OPEN_LINE.map((d, i) => (
            <path key={i} d={d} className="seiro-outline" />
          ))}
        </g>
      </g>

      {/* 2. せいろ（外の側面 → 内側の奥の壁 → 底 → 竹の輪 → 線） */}
      <g className="seiro-body scene-anim" style={anim("scene-fade-up", 4, 10, { "--dy": "8px" })}>
        <path d={OUTER_SIDE} className="seiro-bamboo-side" stroke="none" />
        <path d={OUTER_SIDE} fill="url(#seiro-side-shade)" stroke="none" />
        <path d={INNER_WALL} className="seiro-bamboo-in" stroke="none" />
        <path d={INNER_WALL} fill="url(#seiro-wall-shade)" stroke="none" />
        <path d={FLOOR} className="seiro-bamboo-in" stroke="none" />
        <path d={RIM_FACE} className="seiro-bamboo" fillRule="evenodd" stroke="none" />
        {BODY_HAIR.map((d, i) => (
          <path key={`h${i}`} d={d} className="seiro-hair-line" />
        ))}
        {BODY_FINE.map((d, i) => (
          <path key={`f${i}`} d={d} className="scene-fine seiro-hair" />
        ))}
        {BODY_LINE.map((d, i) => (
          <path key={i} d={d} className="seiro-outline" />
        ))}
      </g>

      {/* 3. 敷き紙（穴のあいた淡い面） */}
      <g className="seiro-paper scene-anim" style={anim("scene-fade-up", 10, 14, { "--dy": "0px" })}>
        <path d={PAPER} className="seiro-paper-face" stroke="none" />
        {HOLES.map(([x, y], i) => (
          <ellipse key={i} cx={r1(x)} cy={r1(y)} rx={2.6} ry={1.8} className="seiro-hole" stroke="none" />
        ))}
        {PAPER_FOLD.map((d, i) => (
          <path key={`f${i}`} d={d} className="seiro-paper-fold" />
        ))}
      </g>

      {/* 4. しゅうまい（奥の列から1つずつ、上から置かれる） */}
      <g className="seiro-shumai">
        {SHUMAI.map((p, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 14 + i * 5, 20 + i * 5, { "--dy": "-18px" })}>
            <path d={p.shadow} className="seiro-shadow" stroke="none" />
            <path d={p.body} className="seiro-skin" stroke="none" />
            <path d={p.body} fill="url(#seiro-shumai-shade)" stroke="none" />
            {p.pleats.map((d, k) => (
              <path key={`p${k}`} d={d} className="seiro-pleat" />
            ))}
            <path d={p.lip} className="seiro-skin-top" stroke="none" />
            {p.creases.map((d, k) => (
              <path key={`c${k}`} d={d} className="seiro-crease" />
            ))}
            <path d={p.meat} className="seiro-mince" stroke="none" />
            <path d={p.meatShade} className="seiro-mince-shade" stroke="none" />
            {p.crumbs.map((c, k) => (
              <circle key={`m${k}`} cx={c.x} cy={c.y} r={c.r} className={c.dark ? "seiro-crumb" : "seiro-crumb-hi"} stroke="none" />
            ))}
            {p.grains.map((d, k) => (
              <path key={`g${k}`} d={d} className="seiro-grain" />
            ))}
            <path d={p.meatLine} className="seiro-meat-line" />
            <path d={p.lipLine} className="seiro-lip-line" />
            <path d={p.outline} className="seiro-outline" />
          </g>
        ))}
      </g>

      {/* 5. 閉じたふた（しゅうまいの上にかぶさってから、持ち上がって消える。動き終わりは見えない） */}
      <g className="seiro-lid-closed scene-anim" style={anim("seiro-lid-lift", 32, 44)}>
        <path d={LID_CLOSED_SIDE} className="seiro-bamboo-side" stroke="none" />
        <path d={LID_CLOSED_TOP} className="seiro-bamboo" stroke="none" />
        {LID_CLOSED_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine seiro-hair" />
        ))}
        {LID_CLOSED_LINE.map((d, i) => (
          <path key={i} d={d} className="seiro-outline" />
        ))}
      </g>

      {/* 6. 湯気（しゅうまいの上から立ちのぼる。時間でゆっくり揺れる） */}
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
