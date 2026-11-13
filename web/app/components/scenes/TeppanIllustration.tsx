// ─── 鉄鍋餃子の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の弐（鉄鍋餃子）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// トップでは使っていない（トップの名物の場面はせいろの絵）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：黒くて厚みのある丸い鉄のスキレット（ふちが厚く、太く短い取っ手が1本。
// 先に小さな穴）に、餃子が7個、焼き目の面を上にして、花びらのように丸く並び、となりどうし少しずつ重なる。鍋の下に木の板。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （鍋・取っ手・餃子にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・鍋の黒さは塗りつぶさず、鍋の外側の側面の短い斜線で表す
// ・差し色は accent を1か所だけ（餃子の上の面の焼き色。面をうすい accent で塗る。scenes.css の .scene-accent-wash）
// ・部品ごとに g でまとめる：木の板（teppan-board）・取っ手（teppan-handle）・鍋（teppan-pan）・
//   餃子7個（teppan-gyoza。焼き色 teppan-brown は餃子ごとに中に入れる）・湯気（teppan-steam）
// ・見る角度は少し斜め上から。床の面の点を縦につぶして描く（pr()）
// ・動きの順番：木の板と鍋が現れる（ふちが描かれる）→ 餃子が上から時計回りに1つずつ置かれる
//   → 餃子の上の面に焼き色がじわっと出る → 湯気が2本立つ
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// ・絵は viewBox を 360 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, jitter, line, polygon, smooth, steam, sway, type P } from "./draw";

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

// ── 木の板（鍋敷き。鍋より少し大きい、角の丸い四角） ──
const BW = 166; // 半分の幅（u）
const BD = 140; // 半分の奥行き（v）
const BR = 42; // 角の丸み
const BOARD_T = 9; // 板の厚み（手前に見える分）
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
    const [x, y] = pr(u, v, z);
    return [x + jitter(seed + i) * amp, y + jitter(seed + i + 50) * amp * 0.6] as const;
  });
}
const BOARD_TOP = smooth(boardPts(0, 7000, 0.9));
// 板の厚み：手前の辺と、両はしの角の丸みの下（手前の半分だけ）
const BOARD_EDGE = smooth(
  [
    pr(BW, BD - BR, 0),
    ...Array.from({ length: 5 }, (_, i) => {
      const t = (PI / 2) * (i / 4);
      return pr(BW - BR + BR * Math.cos(t), BD - BR + BR * Math.sin(t), -BOARD_T);
    }),
    ...Array.from({ length: 5 }, (_, i) => {
      const t = PI / 2 + (PI / 2) * (i / 4);
      return pr(-(BW - BR) + BR * Math.cos(t), BD - BR + BR * Math.sin(t), -BOARD_T);
    }),
    pr(-BW, BD - BR, 0),
  ].map(([x, y], i) => [x + jitter(7100 + i) * 0.6, y] as const),
);
// 木目（鍋に隠れない、板の手前と左右に短い線 3本）
const GRAIN = [
  line(pr(-158, 96), pr(-122, 122), 7200, 0.5, 2),
  line(pr(104, 128), pr(146, 112), 7210, 0.5, 2),
  line(pr(-150, 30), pr(-142, 62), 7220, 0.5, 1),
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

// ── 餃子（7個。焼き目の面を上に、花びらのように丸く並ぶ） ──
// 1つずつ、少しふくらんだ半月の形（外側が丸く、内側がほぼまっすぐ）。床の面で、鍋の中心のまわりに置き、
// 少しずつ傾けて、となりの餃子に重ねる。並ぶ順（動きの順）：奥のまん中から時計回り
const GZ = DEPTH - 2; // 餃子の上の面の高さ（ふちと同じくらいまで、こんもり）
const N = 7;
const RC = 54; // 餃子の中心を置く半径
const GL = 108; // 長さ
const GH = 60; // ふくらみ（まっすぐな辺から丸い辺のいちばん外まで）
const TILT = 0.98; // 傾き（ラジアン）。花びらのように少しずつ回す

type Gyoza = { fill: string; line: string; brown: string; spots: string[] };

function gyoza(i: number): Gyoza {
  const phi = -PI / 2 + (PI * 2 * i) / N; // 置く向き（-π/2 が奥）
  const th = phi + PI / 2 + TILT; // 餃子の長い向き
  const cu = PU + RC * Math.cos(phi);
  const cv = PV + RC * Math.sin(phi);
  const ex = [Math.cos(th), Math.sin(th)];
  const ey = [Math.sin(th), -Math.cos(th)]; // 外向き（丸い辺の側）
  // 餃子の中の点（x … 長い向き -1〜1、y … 0 がまっすぐな辺、1 が丸い辺のいちばん外）
  const at = (x: number, y: number, seed = 0, amp = 0): P => {
    const lx = (x * GL) / 2;
    const ly = (y - 0.38) * GH; // 中心がまん中あたりに来るよう、少し下げる
    const [px, py] = pr(cu + lx * ex[0] + ly * ey[0], cv + lx * ex[1] + ly * ey[1], GZ);
    return [px + jitter(seed) * amp, py + jitter(seed + 7) * amp * 0.6];
  };
  const s = 8000 + i * 60;
  const pts: P[] = [];
  // 丸い辺（左の端 → 外 → 右の端）
  for (let k = 0; k <= 14; k++) {
    const x = -1 + (2 * k) / 14;
    pts.push(at(x * 0.97, Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(x), 3.4))) * 0.92 + 0.08, s + k, 0.7));
  }
  // まっすぐな辺（右 → 左）。少しだけふくらむ
  for (let k = 0; k <= 6; k++) {
    const x = 1 - (2 * k) / 6;
    pts.push(at(x * 0.95, 0.04 + 0.1 * (1 - x * x), s + 20 + k, 0.5));
  }
  pts.push(pts[0], pts[1]); // 書き始めと書き終わりを少し重ねる
  // 焼き色（上の面の内側。ふちを少し残す）
  const brown: P[] = [];
  for (let k = 0; k <= 12; k++) {
    const t = (PI * 2 * k) / 12;
    const w = 1 + 0.1 * Math.sin(3 * t + i) + jitter(s + 40 + k) * 0.05;
    brown.push(at(0.66 * w * Math.cos(t), 0.45 + 0.3 * w * Math.sin(t)));
  }
  // 焼き色のまだら（短い曲線 2〜3本）
  const spotAt: readonly [number, number, number][] = i % 2 === 0
    ? [[-0.42, 0.48, 0.2], [0.05, 0.66, 0.25], [0.38, 0.4, 0.18]]
    : [[-0.3, 0.6, 0.24], [0.28, 0.5, 0.22]];
  const spots = spotAt.map(([x, y, w], k) =>
    smooth([at(x - w / 2, y - 0.02, s + 50 + k, 0.3), at(x, y + 0.04), at(x + w / 2, y - 0.01, s + 55 + k, 0.3)]),
  );
  return { fill: polygon(pts), line: smooth(pts), brown: polygon(brown), spots };
}
const GYOZA = Array.from({ length: N }, (_, i) => gyoza(i));

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
            <path d={g.fill} className="scene-paper" stroke="none" />
            <g className="teppan-brown scene-anim" style={anim("scene-fade-up", 44 + i * 1.2, 51 + i * 1.2, { "--dy": "0px" })}>
              <path d={g.brown} className="scene-accent-wash" stroke="none" />
              {g.spots.map((d, k) => (
                <path key={k} d={d} className="scene-fine" />
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
