// ─── 鉄鍋餃子の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の弐（鉄鍋餃子）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// トップでは使っていない（トップの名物の場面はせいろの絵）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：黒くて厚みのある丸い鉄のスキレット（ふちが厚く、太く短い取っ手が1本。
// 先に小さな穴）に、ふっくらした餃子が7個、焼き目の面を上にして、鍋いっぱいにゆるく丸く並び、となりどうし少しずつ重なる。
// 鍋の下に薄い1枚の木の板。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （鍋・取っ手・餃子にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・鍋の黒さは塗りつぶさず、鍋の外側の側面の短い斜線で表す
// ・差し色は accent を1か所だけ（餃子の上の面の焼き色。面をうすい accent で塗り、焼けたしみを少し濃い accent で塗る。
//   scenes.css の .teppan-brown-wash・.teppan-brown-spot。しみの輪郭は foreground の細い線）
// ・部品ごとに g でまとめる：木の板（teppan-board）・取っ手（teppan-handle）・鍋（teppan-pan）・
//   餃子7個（teppan-gyoza。焼き色 teppan-brown は餃子ごとに中に入れる）・湯気（teppan-steam）
// ・見る角度は少し斜め上から。床の面の点を縦につぶして描く（pr()）
// ・動きの順番：木の板と鍋が現れる（ふちが描かれる）→ 餃子がまん中、まわりを奥から時計回りに1つずつ置かれる
//   → 餃子の上の面に焼き色がじわっと出る → 湯気が2本立つ
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// ・絵は viewBox を 360 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, blobPts, jitter, line, polygon, smooth, steam, sway, type P } from "./draw";

// ── 見る角度（床の面の点 u・v と高さ z を、絵の座標にする） ──
const CX = 200;
const CY = 292;
const SQ = 0.55; // 縦のつぶし（少し斜め上から見る）
const pr = (u: number, v: number, z = 0): P => [CX + u, CY + v * SQ - z];

// だ円（床の面の円を pr で描いたもの）の点。t0→t1（ラジアン）。y は下向きなので 0〜π が手前
function ovalPts(cu: number, cv: number, r: number, z: number, t0: number, t1: number, steps: number, amp: number, seed: number): P[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / steps;
    const [x, y] = pr(cu + r * Math.cos(t), cv + r * Math.sin(t), z);
    return [x + jitter(seed + i) * amp, y + jitter(seed + i + 40) * amp * 0.5] as const;
  });
}

// ── 木の板（鍋敷き。鍋の楕円より少し大きい、角の丸い四角の薄い1枚の板） ──
// 板の中心は鍋の中心に合わせる（板の位置と大きさは、下の鍋の数字 PU・PV・R_OUT に合わせて決める）
const BU = -14; // 板の中心（u）＝ 鍋の中心
const BV = -6; // 板の中心（v）。鍋より少しだけ手前
const BW = 146; // 半分の幅（u）
const BD = 138; // 半分の奥行き（v）
const BR = 58; // 角の丸み
const BOARD_T = 4; // 板の厚み（手前に見える分。薄い板）
const BROT = 0.16; // 板の向き（床の面で少し回す。辺が斜めになり、箱ではなく平らな板に見える）
const bp = (u: number, v: number, z = 0): P =>
  pr(BU + u * Math.cos(BROT) - v * Math.sin(BROT), BV + u * Math.sin(BROT) + v * Math.cos(BROT), z);
function boardPts(z: number, seed: number, amp: number): P[] {
  const g: [number, number][] = [];
  const corners: [number, number, number][] = [
    [BW - BR, BD - BR, 0],
    [-(BW - BR), BD - BR, PI / 2],
    [-(BW - BR), -(BD - BR), PI],
    [BW - BR, -(BD - BR), PI * 1.5],
  ];
  corners.forEach(([cu, cv, t0], k) => {
    for (let i = 0; i <= 4; i++) {
      const t = t0 + (PI / 2) * (i / 4);
      g.push([cu + BR * Math.cos(t), cv + BR * Math.sin(t)]);
    }
    const [nu, nv, nt] = corners[(k + 1) % 4];
    const a = [cu + BR * Math.cos(t0 + PI / 2), cv + BR * Math.sin(t0 + PI / 2)];
    const b = [nu + BR * Math.cos(nt), nv + BR * Math.sin(nt)];
    g.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
  });
  g.push(g[0], g[1]); // 書き始めと書き終わりを少し重ねる
  return g.map(([u, v], i) => {
    const [x, y] = bp(u, v, z);
    return [x + jitter(seed + i) * amp, y + jitter(seed + i + 50) * amp * 0.6] as const;
  });
}
const BOARD_TOP = smooth(boardPts(0, 7000, 0.9));
// 板の厚み：板のまわりを少し下にずらした線のうち、上の面より下に出る所（手前の側）だけ。低い1本の線
const BOARD_EDGE = (() => {
  const topPts = boardPts(0, 7000, 0);
  const lowPts = boardPts(-BOARD_T, 7100, 0.5);
  const n = topPts.length - 2; // 重ねた2点を除く
  // 板の中心から見て手前（絵の下）にある点だけ。両はしは、左右のいちばん外の点まで
  const [, cy] = bp(0, 0);
  const front = topPts.slice(0, n).map(([, y]) => y > cy + 6);
  let start = front.findIndex((f, j) => f && !front[(j - 1 + n) % n]);
  if (start < 0) start = 0;
  const run: P[] = [topPts[(start - 1 + n) % n]];
  for (let j = 0; j < n && front[(start + j) % n]; j++) run.push(lowPts[(start + j) % n]);
  run.push(topPts[(start + run.length - 1) % n]);
  return smooth(run);
})();
// 木目（鍋に隠れない、板の手前の左右の角に短い線 2本）
const GRAIN = [
  line(bp(-128, 80), bp(-96, 112), 7200, 0.5, 1),
  line(bp(96, 116), bp(124, 86), 7210, 0.5, 1),
];

// ── 鍋（丸い鉄のスキレット。ふちが厚い） ──
const PU = -14; // 鍋の中心（u）。右に取っ手を出す分、少し左へ
const PV = -16;
const R_OUT = 126; // ふちの外側
const R_IN = 110; // ふちの内側
const R_BOT = 121; // 下のふち（底は少しすぼまる）
const DEPTH = 26; // 鍋の高さ（ふちの上の面まで）
const RIM_OUT = smooth(ovalPts(PU, PV, R_OUT, DEPTH, PI * 0.96, PI * 3.03, 30, 0.9, 7300));
const RIM_IN = smooth(ovalPts(PU, PV, R_IN, DEPTH, PI * 0.94, PI * 3.04, 28, 0.7, 7340));
const SIDE_L = line(pr(PU - R_OUT, PV, DEPTH), pr(PU - R_BOT, PV, 0), 7380, 0.3, 1);
const SIDE_R = line(pr(PU + R_OUT, PV, DEPTH), pr(PU + R_BOT, PV, 0), 7390, 0.3, 1);
const BOTTOM = smooth(ovalPts(PU, PV, R_BOT, 0, 0, PI, 20, 0.8, 7400));
// 後ろの線（板）を隠す塗り：上のふちの奥の半分 → 手前の下のふち
const PAN_FILL = polygon([...ovalPts(PU, PV, R_OUT, DEPTH, PI, PI * 2, 24, 0, 0), ...ovalPts(PU, PV, R_BOT, 0, 0, PI, 24, 0, 0)]);
// 側面の短い斜線（鉄の黒さ）。上のふちと下のふちのあいだ、手前の側だけ
const HATCH = Array.from({ length: 9 }, (_, i) => {
  const t = PI * (0.12 + (0.76 * i) / 8);
  const a = pr(PU + R_OUT * Math.cos(t), PV + R_OUT * Math.sin(t), DEPTH - 7);
  const b = pr(PU + R_BOT * Math.cos(t + 0.07), PV + R_BOT * Math.sin(t + 0.07), 7);
  return line(a, b, 7500 + i * 3, 0.3, 1);
});

// ── 取っ手（右へ、少し奥に向けて出る。太くて短い。先に小さな穴） ──
const HA = -0.32; // 向き（床の面。0 が真右、マイナスで奥へ）
const HZ = DEPTH - 3; // 高さ（ふちより少し下）
const HW0 = 21; // 根元の半分の幅
const HW1 = 17; // 先の半分の幅
const H0 = R_OUT - 14; // 根元（ふちの下にもぐる）
const H1 = R_OUT + 58; // 先（丸める前）
const HT = 9; // 取っ手の厚み（手前の下に見える分）
const hp = (r: number, w: number, z = HZ): P => {
  const c = Math.cos(HA);
  const s = Math.sin(HA);
  return pr(PU + r * c - w * s, PV + r * s + w * c, z);
};
const handleOutline = (z: number): P[] => [
  hp(H0, -HW0, z),
  hp((H0 + H1) / 2, -(HW0 + HW1) / 2 + 0.6, z),
  hp(H1, -HW1, z),
  ...Array.from({ length: 7 }, (_, i) => {
    const t = -PI / 2 + (PI * (i + 1)) / 8;
    return hp(H1 + HW1 * Math.cos(t), HW1 * Math.sin(t), z);
  }),
  hp(H1, HW1, z),
  hp((H0 + H1) / 2, (HW0 + HW1) / 2 - 0.6, z),
  hp(H0, HW0, z),
];
const HANDLE_TOP = handleOutline(HZ);
const HANDLE_LINE = smooth(HANDLE_TOP);
// 厚み：手前の辺と先の丸みの下
const HANDLE_UNDER = smooth([hp(H0 + 8, HW0, HZ - HT), hp((H0 + H1) / 2, (HW0 + HW1) / 2, HZ - HT), hp(H1, HW1, HZ - HT), hp(H1 + HW1 * 0.7, HW1 * 0.7, HZ - HT)]);
const HANDLE_TIP = line(hp(H1 + HW1 * 0.7, HW1 * 0.7, HZ), hp(H1 + HW1 * 0.7, HW1 * 0.7, HZ - HT), 7620, 0.2, 1);
const HANDLE_FILL = polygon([...HANDLE_TOP, hp(H1 + HW1 * 0.7, HW1 * 0.7, HZ - HT), hp(H1, HW1, HZ - HT), hp(H0, HW0, HZ - HT)]);
const HOLE = smooth(
  Array.from({ length: 11 }, (_, i) => {
    const t = -0.3 + ((PI * 2 + 0.5) * i) / 10;
    const [x, y] = hp(H1 - 2, 0);
    return [x + 6.2 * Math.cos(t), y + 4.4 * Math.sin(t)] as const;
  }),
);

// ── 餃子（7個。焼き目の面を上に、鍋いっぱいにゆるく丸く並ぶ） ──
// 1つずつ、ふっくらした半月の形：外側は大きくふくらみ、内側もゆるい曲線、両端は丸い。
// 上の面の下に、厚みを表す下のふちの線を見える側（手前）だけ細く入れる。
// 並べ方は、まん中に1つ、そのまわりに6つ。きっちりの回転のくり返しに見えないよう、
// 置く向き・半径・傾き・大きさを1つずつ手で決めてばらつかせる（乱数は使わない）。
// 並ぶ順（動きの順）：まん中 → まわりを奥から時計回り。後から置くものが前のものに少し重なる
const GZ = DEPTH - 2; // 餃子の上の面の高さ（ふちと同じくらいまで、こんもり）
const GL = 118; // 長さ（床の面）
const GH = 62; // 幅（内側のふちから外側のふくらみのいちばん外まで）
const GT = 7; // ふっくらした厚み（上の面と下のふちの差。絵の座標）
const DEG = PI / 180;

// [置く向き（度。-90 が奥、時計回りに増える）, 中心からの距離, 傾き（度。0 は丸い側が外を向く向き）, 大きさ]
// まん中の1つは距離 0（向きは傾きだけで決める）
const GYOZA_AT: readonly [number, number, number, number][] = [
  [0, 0, 104, 0.92], // まん中（縦長に寝かせる）
  [-96, 64, 12, 1.0], // 奥
  [-38, 66, -9, 0.97], // 右奥
  [18, 60, 14, 1.04], // 右手前
  [82, 68, -11, 0.99], // 手前
  [146, 62, 9, 1.02], // 左手前
  [206, 66, -14, 0.96], // 左奥
];

type Gyoza = { under: string; underLine: string; fill: string; line: string; brown: string; spots: { fill: string; line: string }[] };

function gyoza([deg, dist, tilt, k]: readonly [number, number, number, number], i: number): Gyoza {
  const phi = deg * DEG;
  const cu = PU + dist * Math.cos(phi);
  const cv = PV + dist * Math.sin(phi);
  // 丸い側の向き（外向き）。まん中の1つは傾きだけで決める
  const out = dist === 0 ? tilt * DEG : phi + tilt * DEG;
  const ex = [-Math.sin(out), Math.cos(out)]; // 長い向き
  const ey = [Math.cos(out), Math.sin(out)]; // 丸い側（外）
  const L = (GL * k) / 2;
  const H = GH * k;
  // 餃子の中の点（x … 長い向き -1〜1、y … 0 が内側のふち、1 が外側のいちばん外）
  const ground = (x: number, y: number): [number, number] => {
    const lx = x * L;
    const ly = (y - 0.42) * H; // 中心がまん中あたりに来るよう、少し下げる
    return [cu + lx * ex[0] + ly * ey[0], cv + lx * ex[1] + ly * ey[1]];
  };
  const s = 8000 + i * 60;
  // まわり（1周）：t=0 が右の端。上半分（外側）は大きくふくらみ、下半分（内側）はゆるい曲線。
  // 両端は丸く、全体を少しだけ弓なりに曲げる（三日月）
  const outline = (z: number, amp: number, seed: number): P[] => {
    const n = 28;
    const pts: P[] = [];
    for (let j = 0; j <= n + 2; j++) {
      const t = (PI * 2 * (j % n)) / n;
      const c = Math.cos(t);
      const sn = Math.sin(t);
      const x = Math.sign(c) * Math.pow(Math.abs(c), 0.85);
      const y = sn < 0 ? 0.24 + 0.76 * Math.pow(-sn, 0.9) : 0.24 - 0.24 * Math.pow(sn, 0.9);
      const bend = -0.16 * x * x; // 両端を内側へ少し寄せる
      const [gu, gv] = ground(x, y + bend);
      const [px, py] = pr(gu, gv, z);
      pts.push([px + jitter(seed + (j % n)) * amp, py + jitter(seed + (j % n) + 7) * amp * 0.6]);
    }
    return pts;
  };
  const top = outline(GZ, 0.7, s);
  const low = outline(GZ - GT, 0.5, s + 30);
  // 下のふち：上の面より下に出る所（手前の側）だけ。両はしは上の面のふちへつなぐ
  const n = 28;
  const below = top.slice(0, n).map((p, j) => low[j][1] > p[1] + GT * 0.55);
  let start = below.findIndex((b, j) => b && !below[(j - 1 + n) % n]);
  if (start < 0) start = 0;
  const run: P[] = [top[(start - 1 + n) % n]];
  for (let j = 0; j < n && below[(start + j) % n]; j++) run.push(low[(start + j) % n]);
  const endJ = (start + run.length - 1) % n;
  run.push(top[endJ]);
  // 焼き色（上の面の内側。ふちを少し残す）
  const brown: P[] = [];
  for (let j = 0; j <= 14; j++) {
    const t = (PI * 2 * j) / 14;
    const w = 1 + 0.08 * Math.sin(3 * t + i * 1.3) + jitter(s + 40 + j) * 0.05;
    const [gu, gv] = ground(0.72 * w * Math.cos(t), 0.5 + 0.3 * w * Math.sin(t) - 0.16 * Math.pow(0.72 * Math.cos(t), 2));
    brown.push(pr(gu, gv, GZ));
  }
  // 焼き色のしみ（閉じた小さな丸っこい形 2〜3個。輪郭は細い線、中は少し濃い accent）
  const spotAt: readonly [number, number, number][] =
    i % 3 === 0
      ? [[-0.36, 0.52, 1], [0.3, 0.6, 0.8]]
      : i % 3 === 1
        ? [[-0.22, 0.6, 0.9], [0.4, 0.44, 0.75], [-0.56, 0.36, 0.6]]
        : [[-0.42, 0.42, 0.85], [0.18, 0.58, 1]];
  const spots = spotAt.map(([x, y, r], j) => {
    const [gu, gv] = ground(x, y - 0.16 * x * x);
    const [px, py] = pr(gu, gv, GZ);
    const pts = blobPts(px, py, 10 * r * k, 6 * r * k, s + 50 + j * 9, 2, 0.16, 16);
    return { fill: polygon(pts), line: smooth(pts) };
  });
  return {
    under: polygon(low),
    underLine: smooth(run),
    fill: polygon(top),
    line: smooth(top),
    brown: polygon(brown),
    spots,
  };
}
const GYOZA = GYOZA_AT.map(gyoza);

// ── 湯気（2本だけ。控えめに、餃子のまん中あたりから上へ） ──
const [STX, STY] = pr(PU, PV, GZ);
const STEAM = [steam(STX - 26, STY - 18, STY - 136, 0.8, 8, 8600), steam(STX + 24, STY - 24, STY - 150, 3.4, 9, 8620)];
const STEAM_SWAY = [sway(5.4, -0.8), sway(6.1, -2.4)];

export default function TeppanIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="22 70 360 360"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 360 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 湯気は上のほうで薄くなる（線の色は同じ foreground のまま、濃さだけ変える） */}
        <linearGradient id="teppan-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1={STY - 16} x2="0" y2={STY - 150}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. 木の板（ふち → 厚み → 木目の順に描かれる） */}
      <g className="teppan-board">
        <path d={BOARD_TOP} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 4, 13)} />
        <path d={BOARD_EDGE} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 9, 15)} />
        {GRAIN.map((d, i) => (
          <path key={i} d={d} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 12 + i, 17 + i)} />
        ))}
      </g>

      {/* 1. 取っ手（根元は鍋のふちの下にもぐる） */}
      <g className="teppan-handle">
        <path d={HANDLE_FILL} className="scene-paper" stroke="none" />
        <path d={HANDLE_LINE} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 12, 19)} />
        <path d={HANDLE_UNDER} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 15, 20)} />
        <path d={HANDLE_TIP} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 15, 20)} />
        <path d={HOLE} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 17, 21)} />
      </g>

      {/* 1. 鍋（ふちの外側 → 内側 → 側面と下のふち → 側面の斜線） */}
      <g className="teppan-pan">
        <path d={PAN_FILL} className="scene-paper" stroke="none" />
        <path d={RIM_OUT} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 6, 15)} />
        <path d={RIM_IN} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 9, 17)} />
        {[SIDE_L, SIDE_R, BOTTOM].map((d, i) => (
          <path key={i} d={d} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 12, 18)} />
        ))}
        {HATCH.map((d, i) => (
          <path key={i} d={d} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 16 + i * 0.5, 19 + i * 0.5)} />
        ))}
      </g>

      {/* 2. 餃子（奥のまん中から時計回りに、1つずつ上から置かれる。後から置くものが前のものに少し重なる）
          3. 差し色（accent）はここだけ：餃子の上の面の焼き色（うすい accent の面）とまだら。置かれたあと、じわっと出る */}
      <g className="teppan-gyoza">
        {GYOZA.map((g, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 20 + i * 3, 26 + i * 3, { "--dy": "-12px" })}>
            <path d={g.under} className="scene-paper" stroke="none" />
            <path d={g.underLine} className="scene-fine" />
            <path d={g.fill} className="scene-paper" stroke="none" />
            <g className="teppan-brown scene-anim" style={anim("scene-fade-up", 44 + i * 1.2, 51 + i * 1.2, { "--dy": "0px" })}>
              <path d={g.brown} className="teppan-brown-wash" stroke="none" />
              {g.spots.map((p, k) => (
                <g key={k}>
                  <path d={p.fill} className="teppan-brown-spot" stroke="none" />
                  <path d={p.line} className="teppan-brown-spot-line" />
                </g>
              ))}
            </g>
            <path d={g.line} className="scene-line" />
          </g>
        ))}
      </g>

      {/* 4. 湯気（2本。時間でゆっくり揺れ続ける。画面の外では止まる） */}
      <g className="teppan-steam" stroke="url(#teppan-steam-fade)">
        {STEAM.map((d, i) => (
          <g key={i} className="scene-sway" style={STEAM_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-fine scene-stroke-draw scene-anim"
              style={anim("scene-draw", 52 + i * 3, 58 + i * 2)}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
