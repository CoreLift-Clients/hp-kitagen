// ─── 豚の角煮の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の肆（豚の角煮）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：白い四角いお皿（角が丸く、ふちが少し立つ）に、細切りの野菜を敷き、
// 豚バラ肉のかたまりを4切れ、少しずつ重ねて盛る。横に、半分に切った味玉を1つ（写真では2つ。代表者の決めで1つ）。
// 小さいカードでも何の料理か分かるように、色と明暗の差をはっきり付ける：
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く
// ・お皿：面は白。ふちの厚み（手前の側面）と、お皿の下の落ち影は foreground の色をうすく。内側の底はごくうすい陰
// ・角煮：この絵だけの決まりとして、たれのこげ茶・赤身の茶色に foreground の色を混ぜる（scenes.css の .kakuni-*）。
//   上の面は、たれのこげ茶。つやは白い細い筋。手前の断面と右の側面に、上から
//   たれの皮 → 脂（クリーム色）→ 赤身 → 脂 → 赤身 のしま模様。右の側面は foreground の色をうすく重ねて陰にする
// ・細切りの野菜：角煮の下から少しのぞく、紙の色の面と、細い線の束
// ・味玉：白身は白、切り口のふちは少し茶色（味がしみた色）。黄身はとろっとしたオレンジ（accent。中心を少し濃く、ふちを明るく）。
//   黄身の表面に、小さなつやの白い点
// ・部品ごとに g でまとめる：お皿（kakuni-dish）・細切りの野菜（kakuni-shred）・角煮4切れ（kakuni-pieces）・
//   味玉（kakuni-egg）・湯気（kakuni-steam）
// ・見る角度は斜め上から。お皿と角煮は、床の面の上で少し回してから縦につぶして描く（pr()）
// ・動きの順番：お皿が現れる → 細切りの野菜 → 角煮が奥から1切れずつ置かれる → 味玉が置かれる → つやが光り、湯気が2本立つ
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
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const down = ([x, y]: P, d: number): P => [x, y + d];

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
const DISH_SHADOW = polygon(roundRectPts(DHL, DHW, DR, 0, 0, 0, false).map(([x, y]) => [x + 7, y + 6] as const));
const DISH_SIDE = polygon(roundRectPts(DHL, DHW, DR, 0, 0, 0, false));
const DISH_TOP = polygon(roundRectPts(DHL, DHW, DR, RIM_Z, 0, 0, false));
const DISH_WELL = polygon(roundRectPts(DHL - 17, DHW - 17, DR - 12, 3, 0, 0, false));
const DISH_RIM = smooth(roundRectPts(DHL, DHW, DR, RIM_Z, 10100, 0.8));
const DISH_INNER = smooth(roundRectPts(DHL - 17, DHW - 17, DR - 12, 3, 10160, 0.6));
// ふちの厚み（手前の下のふち。右の角から左の角まで。点の 0〜10 が、右の角 → 手前の辺 → 左の角）
const DISH_BOTTOM = smooth(roundRectPts(DHL, DHW, DR, 0, 10220, 0.6, false).slice(0, 11));

// ── 角煮（4切れ。奥から手前へ、少しずつ重ねて。1切れずつ向きを少し変える） ──
const PW = 34; // かたまりの半分の幅（切れの中での横）
const PD = 22; // 半分の奥行き
const PH = 46; // 高さ
const BASE_Z = 5; // 敷いた野菜の分だけ浮かせる
// 断面のしま（上から：たれの皮・脂・赤身・脂・赤身）。外側は形で切り取る（clipPath）ので、はみ出してよい
const BANDS = [-0.3, 0.1, 0.29, 0.5, 0.65, 1.3];
const BAND_CLASS = ["kakuni-sauce", "kakuni-fat", "kakuni-meat", "kakuni-fat", "kakuni-meat"];

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

type Piece = {
  top: string;
  front: string;
  side: string;
  frontBands: { d: string; c: string }[];
  sideBands: { d: string; c: string }[];
  bandLines: string[];
  gloss: string[];
  shadow: string;
};
// 置き場所（床の面の u・v）と向き（ラジアン）
const PIECE_AT: readonly (readonly [number, number, number])[] = [
  [-4, -40, 0.12], // 奥の左
  [66, -36, -0.05], // 奥の右
  [14, 8, -0.03], // 手前の左
  [82, 14, 0.16], // 手前の右
];
const PIECES: Piece[] = PIECE_AT.map(([u, v, yaw], i) => {
  const s = 10300 + i * 60;
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const g = (a: number, b: number, z: number) => pr(u + a * c - b * sn, v + a * sn + b * c, z);
  const z0 = BASE_Z;
  const z1 = z0 + PH + jitter(s) * 2.5;
  const bfl = g(-PW, PD, z0);
  const bfr = g(PW, PD, z0);
  const bbr = g(PW, -PD, z0);
  const tfl = g(-PW, PD, z1);
  const tfr = g(PW, PD, z1);
  const tbr = g(PW, -PD, z1);
  const tbl = g(-PW, -PD, z1);
  // 上の面は少しふくらむ（上の辺のまん中を少し持ち上げる）
  const tfm = g(0, PD, z1 + 3);
  const tbm = g(0, -PD, z1 + 2);
  // しまの境目（上の辺 a0→a1 と 下の辺 b0→b1 のあいだの f の所。少し波打ち、厚みを切れごとに少し変える）
  const boundary = (a0: P, a1: P, b0: P, b1: P, f: number, k0: number, n: number): P[] =>
    Array.from({ length: n + 1 }, (_, k) => {
      const t = -0.1 + (1.2 * k) / n;
      const ff = f + 0.04 * Math.sin(t * 5.5 + i * 1.9 + f * 7) + jitter(s + k0 + k) * 0.015 + jitter(s + k0 + 40) * 0.025;
      return lerp(lerp(a0, a1, t), lerp(b0, b1, t), ff);
    });
  const bands = (a0: P, a1: P, b0: P, b1: P, k0: number, n: number) => {
    const bs = BANDS.map((f, j) => boundary(a0, a1, b0, b1, f, k0 + j * 10, n));
    return {
      fills: BAND_CLASS.map((cl, j) => ({ d: polygon([...bs[j], ...[...bs[j + 1]].reverse()]), c: cl })),
      lines: [smooth(bs[1]), smooth(bs[3])],
    };
  };
  const front = bands(tfl, tfr, bfl, bfr, 0, 7);
  const side = bands(tfr, tbr, bfr, bbr, 100, 4);
  const sh = (p: P): P => [p[0] + 7, p[1] + 4];
  return {
    top: roundPath([tbl, tbm, tbr, tfr, tfm, tfl], [7, 30, 7, 6, 30, 6]),
    front: roundPath([tfl, tfm, tfr, bfr, bfl], [6, 30, 6, 4, 4]),
    side: roundPath([tfr, tbr, bbr, bfr], [6, 6, 4, 4]),
    frontBands: front.fills,
    sideBands: side.fills,
    bandLines: [...front.lines, side.lines[0]],
    // つや（上の面の奥寄りに長い筋1本・短い筋1本。手前の上のふちにも1本）
    gloss: [
      smooth([g(-PW + 9, -7, z1 + 2), g(-2, -10, z1 + 3), g(PW - 10, -9, z1 + 2)]),
      smooth([g(-PW + 13, 5, z1 + 2), g(-PW + 25, 3, z1 + 2.5)]),
      smooth([down(g(-PW + 6, PD, z1 + 1), 3), down(g(2, PD, z1 + 3), 3.4)]),
    ],
    shadow: polygon([g(-PW, -PD, z0), bbr, bfr, bfl].map(sh).concat([bfl, g(-PW, -PD, z0)])),
  };
});

// ── 細切りの野菜（角煮の下から少しのぞく。紙の色の面と、細い線を3本ずつの束） ──
const SHRED_AREA = polygon(
  Array.from({ length: 26 }, (_, k) => {
    const t = (PI * 2 * k) / 26;
    const w = 1 + 0.1 * Math.sin(7 * t) + jitter(10600 + k) * 0.06;
    return pr(40 + 88 * w * Math.cos(t), -14 + 52 * w * Math.sin(t), 2);
  }),
);
// 束の置き場所（u・v）と向き。のぞく所：左・手前・右・奥
const SHRED_AT: readonly (readonly [number, number, number])[] = [
  [-46, -20, 1.25],
  [-38, 14, 0.7],
  [-16, 38, 0.15],
  [46, 40, -0.2],
  [64, 44, 0.3],
  [124, 16, 1.4],
  [116, -26, 1.0],
  [28, -70, 0.15],
];
const SHRED = SHRED_AT.flatMap(([u, v, a], k) =>
  [-1, 0, 1].map((m) => {
    const s = 10700 + k * 11 + m * 5;
    const len = 13 + jitter(s + 3) * 2;
    const ou = m * 3 * Math.sin(a);
    const ov = -m * 3 * Math.cos(a);
    const du = (len / 2) * Math.cos(a);
    const dv = (len / 2) * Math.sin(a);
    return smooth([
      pr(u + ou - du, v + ov - dv, 3),
      pr(u + ou + jitter(s) * 1.5, v + ov + jitter(s + 1) * 1.5, 3),
      pr(u + ou + du, v + ov + dv, 3),
    ]);
  }),
);

// ── 味玉（半分に切ったもの1つ。切り口を上に、角煮の左に） ──
const [EX, EY] = pr(-84, 26, 6);
const EA = (Math.atan2(SIN * SQ, COS) * 180) / PI; // お皿の向きに合わせて少し傾ける
const ER = 44; // 切り口の横の半径
const EH = 24; // 切り口の縦の半径
const EB = 13; // 切り口から下へ見える、卵の腹のふくらみ
// 卵の腹（切り口の左右の端から、下へふくらむ半分のだ円）
const EGG_DOME = `M${(EX - ER).toFixed(1)} ${EY.toFixed(1)} A${ER} ${EH + EB} 0 0 0 ${(EX + ER).toFixed(1)} ${EY.toFixed(1)} Z`;

// ── 湯気（2本。角煮の上から） ──
const STEAM = [steam(196, 196, 92, 0.8, 10, 10900), steam(266, 204, 108, 3.2, 11, 10920)];
const STEAM_SWAY = [sway(5.1, -0.4), sway(5.8, -2.0)];

export default function KakuniIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="34 60 332 332"
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
        <linearGradient id="kakuni-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1="204" x2="0" y2="92">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        {/* 黄身：中心を少し濃く、ふちを明るく */}
        <radialGradient id="kakuni-yolk" cx="0.46" cy="0.52" r="0.6">
          <stop offset="0" className="kakuni-yolk-in" />
          <stop offset="0.55" className="kakuni-yolk-mid" />
          <stop offset="1" className="kakuni-yolk-out" />
        </radialGradient>
        {/* 卵の腹の形（陰をこの形で切り取る） */}
        <clipPath id="kakuni-egg-dome">
          <path d={EGG_DOME} />
        </clipPath>
        {/* 角煮の断面と側面の形（しま模様をこの形で切り取る） */}
        {PIECES.map((p, i) => (
          <clipPath key={`f${i}`} id={`kakuni-front-${i}`}>
            <path d={p.front} />
          </clipPath>
        ))}
        {PIECES.map((p, i) => (
          <clipPath key={`s${i}`} id={`kakuni-side-${i}`}>
            <path d={p.side} />
          </clipPath>
        ))}
      </defs>

      {/* 1. お皿（落ち影 → ふちの厚み → 上の面 → 内側の底 → 線） */}
      <g className="kakuni-dish scene-anim" style={anim("scene-fade-up", 4, 12, { "--dy": "10px" })}>
        <path d={DISH_SHADOW} className="kakuni-shadow" stroke="none" />
        <path d={DISH_SIDE} className="kakuni-dish-face" stroke="none" />
        <path d={DISH_SIDE} className="kakuni-dish-side" stroke="none" />
        <path d={DISH_TOP} className="kakuni-dish-face" stroke="none" />
        <path d={DISH_WELL} className="kakuni-dish-well" stroke="none" />
        <path d={DISH_BOTTOM} className="scene-fine" />
        <path d={DISH_INNER} className="scene-fine" />
        <path d={DISH_RIM} className="scene-line" />
      </g>

      {/* 2. 細切りの野菜（角煮の下に敷く） */}
      <g className="kakuni-shred scene-anim" style={anim("scene-fade-up", 12, 18, { "--dy": "-6px" })}>
        <path d={SHRED_AREA} className="scene-paper" stroke="none" />
        {SHRED.map((d, k) => (
          <path key={k} d={d} className="kakuni-strand" />
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

      {/* 3. 角煮（奥から1切れずつ、上から置かれる。手前のものほど後に描くので、奥の切れに重なる） */}
      <g className="kakuni-pieces">
        {PIECES.map((p, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 18 + i * 6, 25 + i * 6, { "--dy": "-30px" })}>
            <path d={p.shadow} className="kakuni-shadow" stroke="none" />
            <path d={p.top} className="kakuni-sauce" stroke="none" />
            <g clipPath={`url(#kakuni-front-${i})`}>
              {p.frontBands.map((b, k) => (
                <path key={k} d={b.d} className={b.c} stroke="none" />
              ))}
              <path d={p.bandLines[0]} className="kakuni-band-line" />
              <path d={p.bandLines[1]} className="kakuni-band-line" />
            </g>
            <g clipPath={`url(#kakuni-side-${i})`}>
              {p.sideBands.map((b, k) => (
                <path key={k} d={b.d} className={b.c} stroke="none" />
              ))}
              <path d={p.bandLines[2]} className="kakuni-band-line" />
              <path d={p.side} className="kakuni-side-shade" stroke="none" />
            </g>
            <path d={p.side} className="kakuni-outline" />
            <path d={p.front} className="kakuni-outline" />
            <path d={p.top} className="kakuni-outline" />
            {/* 5. つや（白い細い筋） */}
            <g className="scene-anim" style={anim("scene-fade-up", 48 + i, 54 + i, { "--dy": "0px" })}>
              {p.gloss.map((d, k) => (
                <path key={`g${k}`} d={d} className="kakuni-gloss" />
              ))}
            </g>
          </g>
        ))}
      </g>

      {/* 4. 味玉（半分を1つ。白身の下のふくらみ → 切り口の茶色いふち → 白身 → 黄身 → つやの点） */}
      <g className="kakuni-egg scene-anim" style={anim("scene-fade-up", 42, 48, { "--dy": "-20px" })}>
        <g transform={`rotate(${EA.toFixed(1)} ${EX.toFixed(1)} ${EY.toFixed(1)})`}>
          <ellipse cx={EX + 6} cy={EY + 9} rx={ER + 1} ry={EH + EB - 4} className="kakuni-shadow" stroke="none" />
          <path d={EGG_DOME} className="kakuni-egg-body" stroke="none" />
          <g clipPath="url(#kakuni-egg-dome)">
            <ellipse cx={EX + 12} cy={EY + 10} rx={ER - 4} ry={EH + EB - 6} className="kakuni-egg-body-shade" stroke="none" />
          </g>
          <path d={EGG_DOME} className="kakuni-outline" />
          <ellipse cx={EX} cy={EY} rx={ER} ry={EH} className="kakuni-egg-rim" stroke="none" />
          <ellipse cx={EX + 0.5} cy={EY - 0.5} rx={ER - 5} ry={EH - 4} className="kakuni-egg-white" stroke="none" />
          <ellipse cx={EX + 2} cy={EY} rx={25} ry={14.5} fill="url(#kakuni-yolk)" className="kakuni-yolk-line" />
          <ellipse cx={EX} cy={EY} rx={ER} ry={EH} className="kakuni-outline" />
          <g className="scene-anim" style={anim("scene-pop", 48, 54)}>
            <ellipse cx={EX - 6} cy={EY - 5} rx={4} ry={2.4} className="kakuni-shine" stroke="none" />
            <circle cx={EX + 0.5} cy={EY - 7} r={1.5} className="kakuni-shine" stroke="none" />
          </g>
        </g>
      </g>
    </svg>
  );
}
