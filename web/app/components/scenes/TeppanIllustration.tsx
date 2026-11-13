// ─── 鉄鍋餃子の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の弐（鉄鍋餃子）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// トップでは使っていない（トップの名物の場面はせいろの絵）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：黒くて厚みのある丸い鉄のスキレット（ふちが厚く、太く短い取っ手が1本。
// 先に小さな穴）に、半月の餃子が8個、焼き目の面を上にして、鍋の中で輪を描くように並び、となりどうし少しずつ重なる。
// 鍋の下に薄い1枚の木の板。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （鍋・取っ手・餃子にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・鍋の黒さは塗りつぶさず、鍋の外側の側面の短い斜線で表す
// ・差し色は accent を1か所だけ（餃子の上の面の焼き色。面をうすい accent で塗り、焼けたしみを少し濃い accent で塗る。
//   scenes.css の .teppan-brown-wash・.teppan-brown-spot。しみは輪郭を描かない）
// ・部品ごとに g でまとめる：木の板（teppan-board）・取っ手（teppan-handle）・鍋（teppan-pan）・
//   餃子8個（teppan-gyoza。焼き色 teppan-brown は餃子ごとに中に入れる）・湯気（teppan-steam）
// ・見る角度は少し斜め上から。床の面の点を縦につぶして描く（pr()）
// ・動きの順番：木の板と鍋が現れる（ふちが描かれる）→ 餃子が輪の奥から時計回りに1つずつ置かれる
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

// ── 餃子（8個。焼き目の面を上に、鍋の中で輪を描くように並ぶ） ──
// 輪の中心は鍋の中心、輪の大きさは鍋の内側のふち（R_IN）の少し内側。輪のまん中は鍋の底が見える。
// 1つずつ半月の形：外側（輪の外に向く側）は大きくふくらんだ曲線、内側はゆるい曲線、両端は丸い。
// 長い向きは輪の接線の向き（円周に沿わせ、輪に合わせて少しだけ弓なりにする）。
// 上の面の下に、厚みを表す下のふちの線を見える側（手前）だけ細く入れる。
// 8個は 45° ずつを基本に、角度と中心からの距離を1つずつ手で決めてばらつかせる（乱数は使わない）。
// 並ぶ順（動きの順）：輪の奥から時計回り。となりどうし少しずつ重なり、重なる向きはすべて同じ回り方
// （時計回りに、前の餃子の上に次の餃子がのる。最後の1つの上に最初の1つがのる所は、
//   最後の1つから最初の1つの形をくりぬく（mask）。くりぬいたふちは最初の1つの輪郭の線の下に入るので、継ぎ目は見えない）
const GZ = DEPTH - 2; // 餃子の上の面の高さ（ふちと同じくらいまで、こんもり）
const GLEN = 39; // 長さの半分（床の面。円周に沿った長さ）
const GW = 44; // 幅（内側のふちから外側のふくらみのいちばん外まで）
const GROUND = 0.42; // 置く距離（下の表の値）を、幅のどこに合わせるか（0 が内側のふち、1 が外側のいちばん外）
const GT = 7; // ふっくらした厚み（上の面と下のふちの差。絵の座標）
const GBEND = 0.3; // 円周に沿わせて弓なりにする割合（0 はまっすぐ、1 は輪にぴったり沿う）
const DEG = PI / 180;

// [置く向き（度。-90 が奥、時計回りに増える）, 中心からの距離]。基本は 45° ずつ・距離 74
const GYOZA_AT: readonly [number, number][] = [
  [-86, 74.5], // 奥（-90 +4）
  [-49, 71], // 右奥（-45 -4）
  [3, 77], // 右（0 +3）
  [40, 72.5], // 右手前（45 -5）
  [94, 76], // 手前（90 +4）
  [132, 70.5], // 左手前（135 -3）
  [185, 77.5], // 左（180 +5）
  [221, 73], // 左奥（225 -4）
];

// 半月の形（餃子の中の座標。x … 円周に沿った向き、y … 0 が内側のふち、GW が外側のいちばん外）。
// 外側は大きなだ円の弧、内側はゆるい弧。2つの境の角を、なめらかに丸める（smax）
const smax = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + (h * h * k) / 4;
};
function moonInside(x: number, y: number): number {
  const ey0 = 3; // 外側のだ円の中心（内側のふちより少しだけ外）
  const ex = GLEN * 1.04;
  const ey = GW - ey0;
  const fo = (Math.hypot(x / ex, (y - ey0) / ey) - 1) * Math.min(ex, ey); // 外側（だ円）
  const fi = 4 * (1 - (x / GLEN) ** 2) - 4 - y; // 内側（まん中が少しだけ内へふくらむ、ゆるい弧）
  return smax(fo, fi, 20); // 0 より小さいと中
}
// 形のまわりの点（1周 n 個）。形の中の1点から、角度ごとに境までの長さを二分法で探す
function moonOutline(n: number): [number, number][] {
  const oy = GW * 0.42;
  return Array.from({ length: n }, (_, j) => {
    const t = (PI * 2 * j) / n;
    const dx = Math.cos(t);
    const dy = -Math.sin(t); // j が増えると、外側（y が大きい側）→ 左 → 内側 → 右 の順
    let lo = 0;
    let hi = GLEN * 2;
    for (let k = 0; k < 30; k++) {
      const m = (lo + hi) / 2;
      if (moonInside(m * dx, oy + m * dy) < 0) lo = m;
      else hi = m;
    }
    return [lo * dx, oy + lo * dy];
  });
}
const MOON = moonOutline(32);

// 焼き色のしみ（餃子ごとに 1〜2個）。[x, y, 大きさ]（x・y は餃子の中の座標）
const SPOTS: readonly (readonly [number, number, number])[][] = [
  [[-12, 20, 1]],
  [[8, 17, 0.9], [-15, 23, 0.7]],
  [[-4, 21, 1]],
  [[13, 19, 0.85], [-10, 16, 0.65]],
  [[2, 22, 0.95]],
  [[-14, 19, 0.9], [11, 24, 0.6]],
  [[9, 18, 1]],
  [[-6, 23, 0.85], [15, 17, 0.6]],
];

type Gyoza = { under: string; underLine: string; fill: string; line: string; brown: string; spots: string[] };

function gyoza([deg, dist]: readonly [number, number], i: number): Gyoza {
  const phi = deg * DEG;
  const ri = dist - GROUND * GW; // 内側のふちの、輪の中心からの距離
  const rm = dist; // 弓なりにするときの基準の半径
  // 餃子の中の点 → 床の面の点。まっすぐ（接線の向き）と、輪にぴったり沿う形の間をとる
  const ground = (x: number, y: number): [number, number] => {
    const r = ri + y;
    const sx = PU + r * Math.cos(phi) - x * Math.sin(phi);
    const sy = PV + r * Math.sin(phi) + x * Math.cos(phi);
    const a = phi + x / rm;
    const px = PU + r * Math.cos(a);
    const py = PV + r * Math.sin(a);
    return [sx + (px - sx) * GBEND, sy + (py - sy) * GBEND];
  };
  const s = 8000 + i * 60;
  const n = MOON.length;
  const outline = (z: number, amp: number, seed: number): P[] => {
    const pts: P[] = [];
    for (let j = 0; j <= n + 2; j++) {
      const [x, y] = MOON[j % n];
      const [gu, gv] = ground(x, y);
      const [px, py] = pr(gu, gv, z);
      pts.push([px + jitter(seed + (j % n)) * amp, py + jitter(seed + (j % n) + 7) * amp * 0.6]);
    }
    return pts;
  };
  const top = outline(GZ, 0.6, s);
  const low = outline(GZ - GT, 0.45, s + 30);
  // 下のふち：上の面より下に出る所（手前の側）だけ。両はしは上の面のふちへつなぐ
  const below = top.slice(0, n).map((p, j) => low[j][1] > p[1] + GT * 0.55);
  let start = below.findIndex((b, j) => b && !below[(j - 1 + n) % n]);
  if (start < 0) start = 0;
  const run: P[] = [top[(start - 1 + n) % n]];
  for (let j = 0; j < n && below[(start + j) % n]; j++) run.push(low[(start + j) % n]);
  run.push(top[(start + run.length - 1) % n]);
  // 焼き色（上の面の内側。ふちを少し残す）
  const brown: P[] = Array.from({ length: n }, (_, j) => {
    const [x, y] = MOON[j];
    const [gu, gv] = ground(x * 0.8, GW * 0.45 + (y - GW * 0.45) * 0.72);
    return pr(gu, gv, GZ);
  });
  // 焼き色のしみ（1〜2個。小さく、輪郭は描かず、少しだけ濃い accent の面だけ。やわらかい形）
  const spotAt = SPOTS[i];
  const spots = spotAt.map(([x, y, r], j) => {
    const [gu, gv] = ground(x, y);
    const [px, py] = pr(gu, gv, GZ);
    // 円周に沿った向きに少し長い形（絵の上では、置く向きで向きが変わる）
    const tx = -Math.sin(phi);
    const ty = Math.cos(phi) * SQ;
    const tl = Math.hypot(tx, ty);
    const rot = Math.atan2(ty / tl, tx / tl);
    const pts = blobPts(0, 0, 7.5 * r, 4.2 * r, s + 50 + j * 9, 3, 0.14, 14).map(
      ([bx, by]) => [px + bx * Math.cos(rot) - by * Math.sin(rot), py + bx * Math.sin(rot) + by * Math.cos(rot)] as const,
    );
    return polygon(pts);
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

// 餃子1つ（置かれる動きと、そのあと焼き色がじわっと出る動き）
function GyozaPiece({ g, i }: { g: Gyoza; i: number }) {
  return (
    <g className="scene-anim" style={anim("scene-fade-up", 20 + i * 2.6, 26 + i * 2.6, { "--dy": "-12px" })}>
      <path d={g.under} className="scene-paper" stroke="none" />
      <path d={g.underLine} className="scene-fine" />
      <path d={g.fill} className="scene-paper" stroke="none" />
      <g className="teppan-brown scene-anim" style={anim("scene-fade-up", 44 + i * 1.2, 51 + i * 1.2, { "--dy": "0px" })}>
        <path d={g.brown} className="teppan-brown-wash" stroke="none" />
        {g.spots.map((d, k) => (
          <path key={k} d={d} className="teppan-brown-spot" stroke="none" />
        ))}
      </g>
      <path d={g.line} className="scene-line" />
    </g>
  );
}

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
        {/* 最後の餃子から、最初の餃子の形（上の面・厚み・輪郭の線の太さ）をくりぬく */}
        <mask id="teppan-under-first" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="500">
          <rect x="0" y="0" width="400" height="500" fill="white" />
          <path d={GYOZA[0].under} fill="black" stroke="black" className="scene-line" />
          <path d={GYOZA[0].fill} fill="black" stroke="black" className="scene-line" />
        </mask>
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
          3. 差し色（accent）はここだけ：餃子の上の面の焼き色（うすい accent の面）と小さなしみ。置かれたあと、じわっと出る */}
      <g className="teppan-gyoza">
        {GYOZA.map((g, i) =>
          i === GYOZA.length - 1 ? (
            // 最後の1つは、最初の1つの下にもぐる（重なる向きを時計回りでそろえる）
            <g key={i} mask="url(#teppan-under-first)">
              <GyozaPiece g={g} i={i} />
            </g>
          ) : (
            <GyozaPiece key={i} g={g} i={i} />
          ),
        )}
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
