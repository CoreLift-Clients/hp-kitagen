// ─── 豚の角煮の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の肆（豚の角煮）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：白い四角いお皿（角が丸く、ふちが少し立つ）に、千切りキャベツをこんもり敷き、
// 豚バラ肉の厚めの薄切りを4枚、切り口を上にして寝かせ、瓦のように少しずつずらして重ねる。
// そばに、半分に切った味玉を1つ（写真では2つ。代表者の決めで1つ）。
// 料理の絵の決まり（scenes.css の先頭）で線画にする：
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く。輪郭は scene-line、中の線は scene-fine
// ・お皿と千切りキャベツは線だけ（キャベツは、少し曲げた短い線を約40本、山の形に散らす）
// ・色を塗るのは2か所：角煮の肉（こげ茶のべた .food-brown。厚みのふちは陰の1段 .food-brown-shade。
//   切り口に脂の層を、紙の色の帯で2本だけ）と、味玉の黄身（オレンジのべた .food-yolk）。白身は紙の色
// ・部品ごとに g でまとめる：お皿（kakuni-dish）・千切りキャベツ（kakuni-cabbage）・角煮4枚（kakuni-pieces）・
//   味玉（kakuni-egg）・湯気（kakuni-steam）
// ・見る角度は斜め上から。お皿と角煮は、床の面の上で少し回してから縦につぶして描く（pr()）
// ・動きの順番：お皿が現れる → キャベツの山（千切りの線がふわっと描かれる）→ 角煮が奥の列から1枚ずつ置かれる → 味玉が置かれる → 湯気が2本立つ
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）。何も動かさないときの形が、動き終わった形
// ・絵は viewBox を 332 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, jitter, polygon, r1, smooth, steam, sway, type P } from "./draw";

// ── 見る角度（床の面の点 u・v を、絵の座標にする） ──
// u … 左 → 右、v … 奥 → 手前、z … 高さ
const CX = 200;
const CY = 282;
const TH = 0.16; // 床の面での回し（ラジアン）
const SQ = 0.6; // 縦のつぶし（斜め上から見る）
const COS = Math.cos(TH);
const SIN = Math.sin(TH);
const pr = (u: number, v: number, z = 0): P => [CX + u * COS - v * SIN, CY + (u * SIN + v * COS) * SQ - z];

// ── お皿（白い四角い皿。角が丸く、ふちが少し立つ） ──
// 角の丸い長方形のまわりの点（床の面、高さ z）。書き始めと書き終わりを少し重ねて、筆で描いた輪にする
function roundRectPts(hl: number, hw: number, r: number, z: number, seed: number, amp: number, close = true): P[] {
  const ground: [number, number][] = [];
  const corners: [number, number, number][] = [
    [hl - r, hw - r, 0], // 右手前
    [-(hl - r), hw - r, PI / 2], // 左手前
    [-(hl - r), -(hw - r), PI], // 左奥
    [hl - r, -(hw - r), PI * 1.5], // 右奥
  ];
  corners.forEach(([cx, cy, t0], k) => {
    for (let i = 0; i <= 4; i++) {
      const t = t0 + (PI / 2) * (i / 4);
      ground.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
    const [nx, ny, nt] = corners[(k + 1) % 4];
    const a: [number, number] = [cx + r * Math.cos(t0 + PI / 2), cy + r * Math.sin(t0 + PI / 2)];
    const b: [number, number] = [nx + r * Math.cos(nt), ny + r * Math.sin(nt)];
    ground.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
  });
  const base = ground.length;
  if (close) {
    // 書き始めを奥の辺のまん中にする（重ねた所が角に来ないように）
    ground.push(...ground.splice(0, 17));
    ground.push(ground[0], ground[1]);
  }
  return ground.map(([u, v], i) => {
    const [x, y] = pr(u, v, z);
    const j = i % base; // 重ねた点は、最初の点と同じ揺らぎにする（輪の継ぎ目にかぎができないように）
    return [x + jitter(seed + j) * amp, y + jitter(seed + j + 50) * amp * 0.6] as const;
  });
}
const DHL = 140; // お皿の半分の長さ（u）
const DHW = 102; // 半分の幅（v）
const DR = 30; // 角の丸み
const RIM_Z = 9; // ふちの高さ
const DISH_SIDE = polygon(roundRectPts(DHL, DHW, DR, 0, 0, 0, false));
const DISH_TOP = polygon(roundRectPts(DHL, DHW, DR, RIM_Z, 0, 0, false));
const DISH_RIM = smooth(roundRectPts(DHL, DHW, DR, RIM_Z, 10100, 0.8));
const DISH_INNER = smooth(roundRectPts(DHL - 17, DHW - 17, DR - 12, 3, 10160, 0.6));
// ふちの厚み（手前の下のふち。右の角から左の角まで。点の 0〜10 が、右の角 → 手前の辺 → 左の角）
const DISH_BOTTOM = smooth(roundRectPts(DHL, DHW, DR, 0, 10220, 0.6, false).slice(0, 11));

// ── 角煮（厚めの薄切り4枚。切り口を上にして寝かせ、瓦のように少しずつずらして重ねる） ──
// 1枚の中の向き：a … 長い向き（左 → 右）、b … 短い向き（奥 → 手前。奥のふちが皮）
const SL = 38; // 半分の長さ
const SW = 26; // 半分の幅
const ST = 8; // 厚み（手前の側面に細く見える）
const BASE_Z = 16; // 千切りキャベツの山の上にのせる高さ
// 切り口の脂の層（奥のふちからの位置 [始まり, 終わり]。紙の色の帯を2本）。外側は形で切り取る（clipPath）ので、はみ出してよい
const FAT_BANDS: readonly (readonly [number, number])[] = [
  [0.14, 0.27],
  [0.55, 0.65],
];

// 角を丸めた閉じた形（点ごとの丸みの大きさ r。角の手前から次の辺へ、2次の曲線でつなぐ）
function roundPath(pts: readonly P[], r: readonly number[]): string {
  const n = pts.length;
  const toward = (a: P, b: P, d: number): P => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const k = Math.min(d, len / 2) / len;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const a = toward(cur, prev, r[i]);
    const b = toward(cur, next, r[i]);
    d += `${i === 0 ? "M" : " L"}${r1(a[0])} ${r1(a[1])} Q${r1(cur[0])} ${r1(cur[1])} ${r1(b[0])} ${r1(b[1])}`;
  }
  return `${d} Z`;
}

type Slice = {
  top: string;
  body: string;
  fat: string[];
};
// 置き場所（床の面の u・v）・向き（ラジアン）・奥のふちの下の高さ（手前の列は、奥の薄切りの上に奥のふちをのせる）
const SLICE_AT: readonly (readonly [number, number, number, number])[] = [
  [-6, -38, 0.07, BASE_Z], // 奥の左
  [74, -33, -0.03, BASE_Z], // 奥の右
  [8, 10, 0.11, BASE_Z + ST * 0.7], // 手前の左（奥のふちを、奥の左の薄切りにのせる）
  [86, 16, 0.02, BASE_Z + ST * 0.7], // 手前の右（奥のふちを、奥の右の薄切りにのせる）
];
const SLICES: Slice[] = SLICE_AT.map(([u, v, yaw, zBack], i) => {
  const s = 10300 + i * 60;
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  // 下の面の高さ（奥のふち zBack → 手前のふち BASE_Z へ、まっすぐ下がる）
  const zb = (b: number) => zBack + (BASE_Z - zBack) * ((b + SW) / (2 * SW));
  const g = (a: number, b: number, up = 0) => pr(u + a * c - b * sn, v + a * sn + b * c, zb(b) + up);
  // 角を少しずつずらして、手で切ったゆがみを出す
  const k = (n: number) => jitter(s + n) * 2.5;
  const cBL: [number, number] = [-SL + k(1), -SW + k(2)];
  const cBR: [number, number] = [SL + k(3), -SW + k(4)];
  const cFR: [number, number] = [SL + k(5), SW + k(6)];
  const cFL: [number, number] = [-SL + k(7), SW + k(8)];
  const T = (p: [number, number], up = ST) => g(p[0], p[1], up);
  // 辺のまん中（少しふくらませる）
  const mid = (p: [number, number], q: [number, number], out: [number, number], up: number) =>
    g((p[0] + q[0]) / 2 + out[0], (p[1] + q[1]) / 2 + out[1], up);
  // 高さ up の所の、薄切りのまわりの8点（角4つと辺のまん中4つ）
  const ring = (up: number): P[] => [
    T(cBL, up),
    mid(cBL, cBR, [0, -1.5], up),
    T(cBR, up),
    mid(cBR, cFR, [1.5, 0], up),
    T(cFR, up),
    mid(cFR, cFL, [0, 1.5], up),
    T(cFL, up),
    mid(cFL, cBL, [-1.5, 0], up),
  ];
  // しまの境目（奥のふちから f の所。長い向きに沿って少し波打ち、厚みを1枚ごとに少し変える）
  const boundary = (f: number, k0: number): P[] =>
    Array.from({ length: 9 }, (_, n) => {
      const t = -1.25 + (2.5 * n) / 8;
      const ff = f + 0.05 * Math.sin(t * 3.2 + i * 1.9 + f * 7) + jitter(s + k0 + n) * 0.015 + jitter(s + k0 + 40) * 0.03;
      return g(SL * t, -SW + 2 * SW * ff, ST);
    });
  const R = [9, 40, 9, 30, 9, 40, 9, 30]; // 角の丸み（辺のまん中は大きく丸めて、なめらかにつなぐ）
  return {
    top: roundPath(ring(ST), R),
    // 厚み：下の面の高さの形（上の面の下に、ふちだけ見える）
    body: roundPath(ring(0), R),
    fat: FAT_BANDS.map(([f0, f1], j) => polygon([...boundary(f0, 100 + j * 20), ...boundary(f1, 110 + j * 20).reverse()])),
  };
});

// ── 千切りキャベツの山（角煮4枚の下に。角煮のまわりから少しのぞく程度の大きさで、奥と左右に少しはみ出す） ──
// 床の面のだ円（中心 CB_U・CB_V、半径 CB_RU・CB_RV）の上の、まん中が高いドームの形
const CB_U = 40;
const CB_V = -14;
const CB_RU = 93;
const CB_RV = 64;
const CB_H = 22; // まん中の高さ
const cabbageZ = (u: number, v: number) => {
  const r2 = ((u - CB_U) / CB_RU) ** 2 + ((v - CB_V) / CB_RV) ** 2;
  return r2 >= 1 ? 0 : CB_H * (1 - r2) ** 0.6;
};
// 山の外まわり（ゆるい点の並び。奥の半分は、ドームの頂上の線まで持ち上げる）。ふちの千切りの線をここに置く
const EDGE_N = 12;
const CABBAGE_EDGE: P[] = Array.from({ length: EDGE_N }, (_, k) => {
  const t = (PI * 2 * (k + 0.5)) / EDGE_N;
  const lift = Math.sin(t) < 0 ? CB_H * (-Math.sin(t)) ** 0.7 * 0.95 : 0;
  return pr(CB_U + CB_RU * Math.cos(t), CB_V + CB_RV * Math.sin(t), lift);
});
// 千切りの線：少し曲げた短い線
type Strand = { d: string; y: number };
function strand(pts: P[]): Strand {
  return { d: smooth(pts), y: pts[1][1] + pts[2][1] };
}
// 山の面の線（ひまわりの種のように山全体に散らす。向きは少しずつばらつかせる。高さはドームの面に合わせる）
const STRAND_N = 28;
const FACE_STRANDS: Strand[] = Array.from({ length: STRAND_N }, (_, k) => {
  const s = 11100 + k * 7;
  const rr = 0.98 * Math.sqrt((k + 0.5) / STRAND_N);
  const at = k * 2.39996;
  const u0 = CB_U + CB_RU * rr * Math.cos(at);
  const v0 = CB_V + CB_RV * rr * Math.sin(at);
  const a = 0.6 * Math.sin(k * 1.7) + 0.7 * Math.sin(k * 0.61 + 1) + jitter(s + 9) * 0.4;
  const len = 15 + jitter(s) * 3;
  const bend = 1.8 * Math.sin(k * 1.3 + 0.5) + jitter(s + 1) * 0.6;
  const pts: P[] = [-1, -0.33, 0.33, 1].map((t, n) => {
    const u = u0 + (len / 2) * t * Math.cos(a) - bend * (1 - t * t) * Math.sin(a) + jitter(s + 2 + n) * 0.5;
    const v = v0 + (len / 2) * t * Math.sin(a) + bend * (1 - t * t) * Math.cos(a) + jitter(s + 6 + n) * 0.5;
    return pr(u, v, cabbageZ(u, v) + 0.8);
  });
  return strand(pts);
});
// ふちの線（山の外まわりに沿って、少し外へはみ出す。ふわっとした輪郭になる）
const EDGE_STRANDS: Strand[] = CABBAGE_EDGE.flatMap(([x, y], k) => {
  const s = 11900 + k * 5;
  const [px, py] = CABBAGE_EDGE[(k + EDGE_N - 1) % EDGE_N];
  const [nx, ny] = CABBAGE_EDGE[(k + 1) % EDGE_N];
  const tx = nx - px;
  const ty = ny - py;
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  // 外向き（線の進む向きに対して右）
  const ox = uy;
  const oy = -ux;
  const tilt = jitter(s) * 0.6;
  const dx = ux * Math.cos(tilt) - uy * Math.sin(tilt);
  const dy = ux * Math.sin(tilt) + uy * Math.cos(tilt);
  const len = 13 + jitter(s + 1) * 2;
  const out = 0.8 + jitter(s + 2) * 1;
  const bend = 1.6 * Math.sin(k * 1.9);
  const cx = x + ox * out;
  const cy = y + oy * out;
  const pts: P[] = [-1, -0.33, 0.33, 1].map((t) => [
    cx + (len / 2) * t * dx + bend * (1 - t * t) * ox,
    cy + (len / 2) * t * dy + bend * (1 - t * t) * oy,
  ]);
  return [strand(pts)];
});
const CABBAGE_STRANDS: Strand[] = [...FACE_STRANDS, ...EDGE_STRANDS].sort((p, q) => p.y - q.y);

// ── 味玉（半分に切ったもの1つ。切り口を上に、角煮のそばに少し斜めに置く） ──
const [EX, EY] = pr(-80, 20, 5);
const EA = -18; // 傾き（度）。右上がりに少し斜め
const ER = 38; // 長い向きの半径（たて長の楕円）
const EH = 24; // 短い向きの半径

// ── 湯気（2本。角煮の上から） ──
const STEAM = [steam(198, 225, 124, 0.8, 10, 10900), steam(262, 229, 136, 3.2, 11, 10920)];
const STEAM_SWAY = [sway(5.1, -0.4), sway(5.8, -2.0)];

export default function KakuniIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="34 76 332 332"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 332 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 湯気は上のほうで薄くなる（線の色は同じ foreground のまま、濃さだけ変える） */}
        <linearGradient id="kakuni-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1="229" x2="0" y2="124">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        {/* 角煮の薄切りの上の面の形（しま模様をこの形で切り取る） */}
        {SLICES.map((p, i) => (
          <clipPath key={i} id={`kakuni-top-${i}`}>
            <path d={p.top} />
          </clipPath>
        ))}
      </defs>

      {/* 1. お皿（後ろを隠す紙の色の面 → 線） */}
      <g className="kakuni-dish scene-anim" style={anim("scene-fade-up", 4, 12, { "--dy": "10px" })}>
        <path d={DISH_SIDE} className="scene-paper" stroke="none" />
        <path d={DISH_TOP} className="scene-paper" stroke="none" />
        <path d={DISH_BOTTOM} className="scene-fine" />
        <path d={DISH_INNER} className="scene-fine" />
        <path d={DISH_RIM} className="scene-line" />
      </g>

      {/* 2. 千切りキャベツの山（千切りの線がふわっと描かれる） */}
      <g className="kakuni-cabbage">
        {CABBAGE_STRANDS.map((st, k) => (
          <path
            key={k}
            d={st.d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 13 + (k % 12) * 0.35, 17 + (k % 12) * 0.35)}
          />
        ))}
      </g>

      {/* 湯気は角煮の後ろから立つ */}
      <g className="kakuni-steam" stroke="url(#kakuni-steam-fade)">
        {STEAM.map((d, i) => (
          <g key={i} className="scene-sway" style={STEAM_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-line scene-stroke-draw scene-anim"
              style={anim("scene-draw", 50 + i * 3, 59 + i * 1)}
            />
          </g>
        ))}
      </g>

      {/* 3. 角煮（奥の列から1枚ずつ、上から置かれる。手前の列ほど後に描くので、奥の薄切りに重なる） */}
      <g className="kakuni-pieces">
        {SLICES.map((p, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 18 + i * 6, 25 + i * 6, { "--dy": "-24px" })}>
            {/* 厚みのふち（陰の1段）→ 上の面（こげ茶）→ 脂の層（紙の色）→ 輪郭 */}
            <path d={p.body} className="food-brown-shade" stroke="none" />
            <path d={p.body} className="scene-line" />
            <path d={p.top} className="food-brown" stroke="none" />
            <g clipPath={`url(#kakuni-top-${i})`}>
              {p.fat.map((d, k) => (
                <path key={k} d={d} className="scene-paper" stroke="none" />
              ))}
            </g>
            <path d={p.top} className="scene-line" />
          </g>
        ))}
      </g>

      {/* 4. 味玉（半分を1つ。白身（紙の色）→ 黄身（オレンジのべた）→ 輪郭） */}
      <g className="kakuni-egg scene-anim" style={anim("scene-fade-up", 42, 48, { "--dy": "-20px" })}>
        <g transform={`rotate(${EA} ${EX.toFixed(1)} ${EY.toFixed(1)})`}>
          <ellipse cx={EX} cy={EY} rx={ER} ry={EH} className="scene-paper" stroke="none" />
          <ellipse cx={EX + 1.5} cy={EY + 0.5} rx={ER * 0.6} ry={EH * 0.62} className="food-yolk" stroke="none" />
          <ellipse cx={EX} cy={EY} rx={ER} ry={EH} className="scene-line" />
        </g>
      </g>
    </svg>
  );
}
