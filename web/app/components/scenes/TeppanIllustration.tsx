// ─── 鉄鍋餃子の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の弐（鉄鍋餃子）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// トップでは使っていない（トップの名物の場面はせいろの絵）。
// 本物の盛り付け（代表者から届いた写真）をもとに、料理の絵の決まり（scenes.css の先頭）で線画にする：
// ・丸い鉄のスキレット（ふちが厚い。太く短い取っ手が1本）を、絵の幅いっぱい（約 92%）に大きく。取っ手は絵の端で切れる。鍋は線だけ
// ・餃子は8個。焼き目の面を上にして、鍋の中心に向けて放射状に、鍋いっぱいにぎっしり並び、となりどうし同じ向きに大きく重なる
// ・餃子1つは、ふっくら幅のある形（長さ：幅 ≒ 1.7：1）。片側が大きくふくらみ、両端は丸い
// ・色を塗るのは餃子だけ（ほかの絵と同じ水彩。部品は Wash.tsx。にじみのフィルタは teppan-wash の1つを使い回す）：
//   皮（上の面と、ひだの帯）… ごく淡いクリームの水彩（.food-wash-skin。しゅうまいの皮と同じ色）
//   焼き目 … きつね色の水彩（.food-wash-yaki）を上の面の大きな所に、そのまん中に、こげ茶の水彩（.food-wash-yaki-dark）を
//   もう1段重ねる（真ん中ほど濃く、ふちへ向かって淡い。ひだの側は皮の色が残る）。白い抜けを1か所。
//   8個とも、焼き目の大きさ・位置・形・濃さを少しずつ変える（GYOZA_YAKI。乱数なし）
// ・鍋・取っ手は入れ物なので線だけ（塗りは後ろを隠す紙の色だけ）
// ・重なった所では、上にのった餃子のふちから、ひだの皮が細い帯のようにのぞく（皮の色の帯と、波打つふちの線）
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。輪郭は scene-line、中の線は scene-fine
//   （鍋・取っ手・餃子の皮には、後ろの線を隠すための塗り --scene-paper を付ける）
// ・部品ごとに g でまとめる：取っ手（teppan-handle）・鍋（teppan-pan）・
//   餃子8個（teppan-gyoza。水彩は餃子ごとに中に入れる）・湯気（teppan-steam）
// ・見る角度は少し斜め上から。床の面の点を縦につぶして描く（pr()。写真の見え方に合わせて 0.64）
// ・動きの順番：鍋が現れる（ふちが描かれる）→ 餃子が奥から時計回りに1つずつ置かれる
//   → 皮と焼き目の水彩がじわっと出る → 湯気が3本、餃子の上から立ちのぼる（しゅうまい・からあげと同じ Steam.tsx）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// ・絵は viewBox を 360 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, animAt, cardTiming, jitter, line, polygon, smooth, sway, type P } from "./draw";
import { SteamFades, SteamWisps, mkWisp } from "./Steam";
import { Wash, WashFilter, type Hole } from "./Wash";

// ── 見る角度（床の面の点 u・v と高さ z を、絵の座標にする） ──
const CX = 202; // 絵の横のまん中（viewBox は x = 22〜382）
const CY = 322;
const SQ = 0.64; // 縦のつぶし（少し斜め上から見る。写真の見え方に合わせる）
const pr = (u: number, v: number, z = 0): P => [CX + u, CY + v * SQ - z];

// だ円（床の面の円を pr で描いたもの）の点。t0→t1（ラジアン）。y は下向きなので 0〜π が手前
function ovalPts(cu: number, cv: number, r: number, z: number, t0: number, t1: number, steps: number, amp: number, seed: number): P[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / steps;
    const [x, y] = pr(cu + r * Math.cos(t), cv + r * Math.sin(t), z);
    return [x + jitter(seed + i) * amp, y + jitter(seed + i + 40) * amp * 0.5] as const;
  });
}

// ── 鍋（丸い鉄のスキレット。ふちが厚い。絵の幅の約 92%） ──
const PU = 0; // 鍋の中心
const PV = 0;
const R_OUT = 166; // ふちの外側（幅 332 ＝ 絵の幅 360 の 92%）
const R_IN = 145; // ふちの内側（ふちが厚い）
const R_BOT = 158; // 下のふち（底は少しすぼまる）
const DEPTH = 30; // 鍋の高さ（ふちの上の面まで）
const RIM_OUT = smooth(ovalPts(PU, PV, R_OUT, DEPTH, PI * 0.96, PI * 3.03, 34, 1, 7300));
const RIM_IN = smooth(ovalPts(PU, PV, R_IN, DEPTH, PI * 0.94, PI * 3.04, 32, 0.8, 7340));
const SIDE_L = line(pr(PU - R_OUT, PV, DEPTH), pr(PU - R_BOT, PV, 0), 7380, 0.3, 1);
const SIDE_R = line(pr(PU + R_OUT, PV, DEPTH), pr(PU + R_BOT, PV, 0), 7390, 0.3, 1);
const BOTTOM = smooth(ovalPts(PU, PV, R_BOT, 0, 0, PI, 24, 0.9, 7400));
// 鍋の後ろを隠す塗り：上のふちの奥の半分 → 手前の下のふち
const PAN_FILL = polygon([...ovalPts(PU, PV, R_OUT, DEPTH, PI, PI * 2, 28, 0, 0), ...ovalPts(PU, PV, R_BOT, 0, 0, PI, 28, 0, 0)]);
// 餃子を、鍋の内側のふちの中だけに見せる（手前の餃子のはしが、ふちの線にかからないように）
const [PCX, PCY] = pr(PU, PV, DEPTH);
const CLIP_R = R_IN - 1.5;

// ── 取っ手（右へ、少し奥に向けて出る。太くて短い。絵の右の端で切れる） ──
const HA = -0.32; // 向き（床の面。0 が真右、マイナスで奥へ）
const HZ = DEPTH - 3; // 高さ（ふちより少し下）
const HW0 = 22; // 根元の半分の幅
const HW1 = 18; // 先の半分の幅
const H0 = R_OUT - 14; // 根元（ふちの下にもぐる）
const H1 = R_OUT + 60; // 先（絵の外）
const HT = 9; // 取っ手の厚み（手前の下に見える分）
const hp = (r: number, w: number, z = HZ): P => {
  const c = Math.cos(HA);
  const s = Math.sin(HA);
  return pr(PU + r * c - w * s, PV + r * s + w * c, z);
};
const HANDLE_TOP: P[] = [hp(H0, -HW0), hp((H0 + H1) / 2, -(HW0 + HW1) / 2 + 0.6), hp(H1, -HW1), hp(H1, HW1), hp((H0 + H1) / 2, (HW0 + HW1) / 2 - 0.6), hp(H0, HW0)];
const HANDLE_SIDE_A = smooth(HANDLE_TOP.slice(0, 3));
const HANDLE_SIDE_B = smooth(HANDLE_TOP.slice(3));
// 厚み：手前の辺の下
const HANDLE_UNDER = smooth([hp(H0 + 8, HW0, HZ - HT), hp((H0 + H1) / 2, (HW0 + HW1) / 2, HZ - HT), hp(H1, HW1, HZ - HT)]);
const HANDLE_FILL = polygon([...HANDLE_TOP, hp(H1, HW1, HZ - HT), hp(H0, HW0, HZ - HT)]);

// ── 餃子（8個。焼き目の面を上に、鍋の中心に向けて放射状に、鍋いっぱいにぎっしり並ぶ） ──
// ・ぎっしり：となりどうし大きく重ね、すき間をなくす。外側の端は鍋の内側のふちまで届く（ふちで切れる）
// ・ふっくら：長さ：幅 ≒ 1.7：1。反時計回りの側（ys = +1）は大きくふくらみ、時計回りの側はゆるいふくらみ。両端は丸い
// ・皮：上の面と、ひだの帯を、ごく淡いクリームの水彩（.food-wash-skin）
// ・焼き目：上の面の、ひだの側を少し残した大きな所に、きつね色の水彩（.food-wash-yaki）。
//   そのまん中に、こげ茶の水彩（.food-wash-yaki-dark）をもう1段（真ん中ほど濃く、ふちへ向かって淡い）。
//   まだら・こげの点・質感の線・光と陰・落ち影は描かない
// ・ひだの皮：ふくらんだ側のふちに沿って、細い帯（外のふちは、ひだの小さな波の線）。
//   上にのった餃子のふちから、下の餃子の上にのぞく
// 餃子の中の座標：x … 長い向き（マイナスが中心側の端）、y … 幅の向き（プラスが反時計回りの側）。
// 重なり：あとに置く（時計回りの次の）餃子が上。上にのった餃子の、ふくらんだ側が、前の餃子の上にかぶさる。
// 最後の1つ（7）だけは、最初の1つ（0）の下にもぐらせる（7 から 0 の形をくりぬく。mask teppan-under-first）。
// 向き・大きさ・中心からの距離は、1つずつ手で決める（ずらしは jitter の決まった数。乱数は使わない）。
const GZ = DEPTH - 6; // 餃子の上の面の高さ（鍋の中に、ふちより少し低く）
// ふっくらした厚み（上の面と下のふちの差。絵の座標）。手前に見える皮の側面。
// 斜めから見ているので、手前の餃子ほど大きく（最大 GT_FRONT）、奥の餃子ほど小さく（GT_BACK）
const GT_FRONT = 10;
const GT_BACK = 2.5;
const GLEN = 72; // 長さの半分（床の面。長さ 144）
const GW = 84; // 幅（床の面。長さ：幅 ≒ 1.71：1）
const GA = 0.6; // ふくらんだ側の幅の割合（残りが、ゆるくふくらむ側）
const GBOW = 3; // 弓なりの反り（両端で、時計回りの側へ）
const GR = 80; // 餃子のまん中の、鍋の中心からの距離（外側の端が鍋の内側のふちに届く）
const SKIN = 7; // ひだの白い皮の帯の幅（床の面。小さい絵でもはっきり見える太さ）
const SKIN_WAVE = 3.2; // 帯の外のふちの、ひだの波の高さ
const SKIN_WAVES = 6; // 帯の、ひだの波の数
const DEG = PI / 180;

// [置く向き（度。-90 が奥、時計回りに増える）, 放射からのずらし（度。時計回り）, 大きさ, 中心からの距離のずれ]
const GYOZA_AT: readonly [number, number, number, number][] = [
  [-90, 3, 1.0, 0], // 奥
  [-49, 5, 0.97, -3],
  [-5, 2, 1.03, 3],
  [41, 6, 0.97, -1],
  [91, 3, 1.02, 2],
  [134, 5, 0.95, -3],
  [176, 2, 1.04, 3],
  [226, 4, 0.98, 0],
];

// 幅の形（t … -1 が中心側の端、1 が外側の端）。両端は丸く、中心側は少し細い
const sideW = (t: number, side: number) => {
  const base = Math.max(1 - t * t, 0);
  if (side > 0) return GW * GA * Math.pow(base, t < 0 ? 0.42 : 0.36);
  return -GW * (1 - GA) * Math.pow(base, t < 0 ? 0.38 : 0.32);
};
const bow = (t: number) => -GBOW * t * t;
// 形のまわり（1周 n 個）。ふくらんだ側を外側の端から中心側の端へ、もう片側を戻る
function boatOutline(n: number): [number, number][] {
  const half = n / 2;
  const pts: [number, number][] = [];
  for (let j = 0; j < half; j++) {
    const t = Math.cos((PI * j) / half); // 1 → -1（ふくらんだ側）
    pts.push([t * GLEN, sideW(t, 1) + bow(t)]);
  }
  for (let j = 0; j < half; j++) {
    const t = -Math.cos((PI * j) / half); // -1 → 1（もう片側）
    pts.push([t * GLEN, sideW(t, -1) + bow(t)]);
  }
  return pts;
}
const NB = 132;
const BOAT = boatOutline(NB);
// ひだの白い皮の帯（ふくらんだ側のふちの外に沿って。外のふちは、ひだの小さな波。両端は細くして消す）
const SKIN_BAND: [number, number][] = (() => {
  const steps = 44;
  const inner: [number, number][] = [];
  const outer: [number, number][] = [];
  for (let j = 0; j <= steps; j++) {
    const t = 0.86 - (1.72 * j) / steps; // 外側の端の近く → 中心側の端の近く
    const y = sideW(t, 1) + bow(t);
    const env = Math.pow(Math.max(1 - t * t, 0), 0.6);
    const wave = SKIN_WAVE * Math.abs(Math.sin((PI * SKIN_WAVES * (t + 0.86)) / 1.72));
    inner.push([t * GLEN, y - 1]);
    outer.push([t * GLEN, y + (SKIN + wave) * env]);
  }
  return [...inner, ...outer.reverse()];
})();
const SKIN_EDGE_N = 45; // 帯の点のうち、外のふち（後ろ半分）の数

// 焼き目の水彩（餃子1つずつ。乱数なし）。上の面の形を、まん中のあたりへ縮めた形にする（餃子の中の座標で）
// [きつね色の大きさ, こげ茶の大きさ, きつね色のまん中 x, y, こげ茶のまん中 x, y, こげ茶の濃さ（0〜1）, 抜けの x, y]
// y はマイナスほど、ひだと反対の側（ひだの側は皮の色を残す）
const GYOZA_YAKI: readonly (readonly [number, number, number, number, number, number, number, number, number])[] = [
  [0.88, 0.56, 4, 2, 10, 1, 1.0, -46, -6],
  [0.85, 0.5, 0, 3, -8, 3, 0.8, 44, 4],
  [0.9, 0.6, 6, 0, 14, -1, 0.95, -44, 2],
  [0.84, 0.48, -2, 4, 4, 4, 0.75, 46, -6],
  [0.88, 0.54, 2, 1, -6, 0, 0.9, -48, 0],
  [0.86, 0.52, 4, 3, 12, 3, 0.85, 44, -4],
  [0.9, 0.62, 0, 0, 6, -2, 1.0, -46, -2],
  [0.86, 0.5, -4, 2, -10, 2, 0.8, 48, 2],
];
// 上の面の形のまん中（幅の向き。ふくらんだ側が広いので、少しプラス）
const FACE_Y = (GW * GA - GW * (1 - GA)) / 2;

type Gyoza = {
  under: string;
  underLine: string;
  skin: string; // ひだの白い皮の帯
  skinLine: string; // 帯の外のふち
  fill: string;
  line: string;
  yaki: string; // 焼き目（きつね色）
  koge: string; // 焼き目のまん中（こげ茶）
  kogeA: number; // こげ茶の濃さ
  hole: Hole; // 白い抜け
};

function gyoza([deg, tilt, k, dr]: readonly [number, number, number, number], i: number): Gyoza {
  const phi = deg * DEG;
  const beta = (deg + tilt) * DEG;
  const ax = Math.cos(beta); // 長い向き（外側の端へ）
  const ay = Math.sin(beta);
  const nx = Math.sin(beta); // 反時計回りの側（長い向きを反時計回りに 90°）
  const ny = -Math.cos(beta);
  const cu = PU + (GR + dr) * Math.cos(phi); // 餃子のまん中
  const cv = PV + (GR + dr) * Math.sin(phi);
  const at = (x: number, y: number, z = GZ): P => pr(cu + k * (x * ax + y * nx), cv + k * (x * ay + y * ny), z);
  const s = 8000 + i * 60;
  const n = BOAT.length;
  // crisp … カリッとした小さなでこぼこ（1点ずつの細かい揺らぎ）の大きさ
  const outline = (z: number, crisp: number, seed: number): P[] => {
    const pts: P[] = [];
    for (let j = 0; j <= n + 2; j++) {
      const [x, y] = BOAT[j % n];
      const [px, py] = at(x, y, z);
      pts.push([px + jitter(seed + (j % n)) * crisp, py + jitter(seed + 300 + (j % n)) * crisp * 0.8]);
    }
    return pts;
  };
  // 厚み：手前（phi = 90°）ほど大きく、奥（phi = -90°）ほど小さく
  const GT = (GT_FRONT + GT_BACK) / 2 + ((GT_FRONT - GT_BACK) / 2) * Math.sin(phi);
  const top = outline(GZ, 0.85, s);
  const low = outline(GZ - GT, 0.4, s + 500);
  // 下のふち（白っぽい側面のすそ）：上の面の形の外に出ている所（手前の側）だけ
  const topRing = top.slice(0, n);
  const inside = ([x, y]: P) => {
    let c = false;
    for (let a = 0, b = n - 1; a < n; b = a++) {
      const [xa, ya] = topRing[a];
      const [xb, yb] = topRing[b];
      if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) c = !c;
    }
    return c;
  };
  const below = low.slice(0, n).map(([x, y]) => !inside([x, y - 1.6]));
  let start = below.findIndex((b, j) => b && !below[(j - 1 + n) % n]);
  if (start < 0) start = 0;
  const run: P[] = [];
  for (let j = 0; j < n && below[(start + j) % n]; j++) run.push(low[(start + j) % n]);
  // ひだの白い皮の帯
  const skinPts = SKIN_BAND.map(([x, y], m) => {
    const [px, py] = at(x, y);
    return [px + jitter(s + 900 + m) * 0.3, py + jitter(s + 960 + m) * 0.25] as const;
  });
  const skinEdge = skinPts.slice(skinPts.length - SKIN_EDGE_N);
  // 焼き目：上の面の形を (mx, my) のまわりに縮め、ふちを少しだけゆらす（jitter の決まった数）
  const [ys, ks, yx, yy, kx, ky, kogeA, hx, hy] = GYOZA_YAKI[i];
  const shrink = (sc: number, mx: number, my: number, seed: number, wob: number, long = 1.08): P[] => {
    const pts: P[] = [];
    for (let j = 0; j < n; j += 2) {
      const [x, y] = BOAT[j];
      // ゆるいうねり（1周に3回。位相は餃子ごとに jitter で変える）
      const w = 1 + wob * Math.sin((2 * PI * j * 3) / n + jitter(seed) * 3);
      // 長い向きは、幅の向きより少しだけ縮め方をゆるく（細長い焼き目にする）
      pts.push(at(mx + x * Math.min(0.94, sc * long) * w, my + (y - FACE_Y) * sc * w));
    }
    return pts;
  };
  const [hpx, hpy] = at(hx, hy);
  return {
    yaki: polygon(shrink(ys, yx, FACE_Y - 6 + yy, s + 1200, 0.05)),
    koge: polygon(shrink(ks, kx, FACE_Y - 12 + ky, s + 1400, 0.1, 1.25)),
    kogeA,
    hole: [hpx, hpy, 4.2 * k, 2.4 * k],
    under: polygon(low),
    underLine: smooth(run),
    skin: polygon(skinPts),
    skinLine: smooth(skinEdge),
    fill: polygon(top),
    line: smooth(top),
  };
}
const GYOZA = GYOZA_AT.map(gyoza);

// ── 湯気（3本。餃子の上の、少し浮いた所から立ちのぼる） ──
// 描き方はしゅうまい・からあげと同じ（Steam.tsx。根元はふわっと消える）。まん中の1本がいちばん高い
const STEAM = [
  mkWisp(164, 262, 128, -3, 0.6, 6.5, 8600, 0.42),
  mkWisp(204, 250, 104, 2, 2.6, 6.5, 8620, 0.42),
  mkWisp(242, 264, 134, 3, 4.3, 6, 8640, 0.42),
];
const STEAM_SWAY = [sway(5.4, -0.8), sway(6.1, -2.4), sway(5.8, -1.6)];

// ── 動きの段（anim の from・to。4〜60。scenes.css の「名物の欄の決まり」） ──
// 主役は、餃子が奥から時計回りに1つずつ置かれる所（19〜41 ＝ 全体の約 4 割）。段のあいだに短い間
const T = {
  rimOut: [4, 11], // 鍋のふちの外が描かれる
  rimIn: [6, 13], // ふちの内
  side: [8, 14], // 側面と下のふち
  handle: [10, 16], // 取っ手
  handleUnder: [12, 17],
  gyoza: [19, 24.2], // （間）餃子が置かれる（1つ目。1つずつ GYOZA_STEP ずらす。8つ目は 35.8〜41）
  yaki: [43, 48], // （間）皮と焼き目の水彩がじわっと出る（1つずつ 0.6 ずらす）
  steam: [[51, 56], [53, 58], [55, 60]], // 湯気が3本立ちのぼる（完成）
} as const;
const GYOZA_STEP = 2.4;
// 線のいちばん下は、絵の場所の上から 98.2%。主役が時間で動くとき (16.8 × 0.045 + 5.2 × 0.05) × 1.4 ≒ 1.4 秒
const CARD = cardTiming({ ink: 0.99, time: 1.4 });

// 皮と焼き目の水彩がじわっと出る動き（餃子ごと）
const lateAnim = (i: number) => animAt("scene-fade-up", T.yaki, { "--dy": "0px" }, i * 0.6);

// 餃子1つ（置かれる動きと、そのあと水彩がじわっと出る動き）
function GyozaPiece({ g, i }: { g: Gyoza; i: number }) {
  return (
    <g className="scene-anim" style={animAt("scene-fade-up", T.gyoza, { "--dy": "-12px" }, i * GYOZA_STEP)}>
      {/* 皮の側面（厚み。紙の色）と、ひだの皮の帯（下の餃子の上にのぞく。紙の色の上に、皮の水彩） */}
      <path d={g.under} className="scene-paper" stroke="none" />
      <path d={g.skin} className="scene-paper" stroke="none" />
      <g className="scene-anim" style={lateAnim(i)}>
        <Wash filter="teppan-wash" d={g.skin} tone="food-wash-skin" id={`teppan-w-band-${i}`} shift={[0.75, 0.6]} line={2.1} />
      </g>
      <path d={g.skinLine} className="scene-fine" />
      {/* 上の面（紙の色）と、水彩（皮 → 焼き目のきつね色 → まん中のこげ茶。置かれたあと、じわっと出る） */}
      <path d={g.fill} className="scene-paper" stroke="none" />
      <g className="scene-anim" style={lateAnim(i)}>
        <Wash filter="teppan-wash" d={g.fill} tone="food-wash-skin" id={`teppan-w-skin-${i}`} shift={[1, 0.75]} />
        {/* 焼き目は、上の面の線の内側だけに（皮の水彩の mask ＝ 線の太さの半分だけ内側に縮めた形を、もう一度使う） */}
        <g mask={`url(#teppan-w-skin-${i}-m)`}>
          <Wash filter="teppan-wash" d={g.yaki} tone="food-wash-yaki" id={`teppan-w-yaki-${i}`} shift={[0.75, 0.6]} holes={[g.hole]} line={2.1} />
          <g opacity={g.kogeA}>
            <Wash filter="teppan-wash" d={g.koge} tone="food-wash-yaki-dark" id={`teppan-w-koge-${i}`} shift={[0.6, 0.5]} line={2.1} />
          </g>
        </g>
      </g>
      {/* 餃子の輪郭の線 */}
      <path d={g.underLine} className="scene-fine" />
      <path d={g.line} className="scene-line" />
    </g>
  );
}

export default function TeppanIllustration({ className = "" }: { className?: string }) {
  const last = GYOZA.length - 1;
  return (
    <svg
      viewBox="22 70 360 360"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 360 / 400, ...CARD } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。餃子で1つを使い回す） */}
        <WashFilter id="teppan-wash" seed={11} />
        {/* 湯気の濃さ（1本ずつ。根元と上の端は透明） */}
        <SteamFades id="teppan-steam-fade" wisps={STEAM} />
        {/* 餃子は鍋の内側のふちの中だけに見せる */}
        <clipPath id="teppan-inside">
          <ellipse cx={PCX} cy={PCY} rx={CLIP_R} ry={CLIP_R * SQ} />
        </clipPath>
        {/* 最後の餃子から、最初の餃子の形（上の面・厚み・輪郭の線の太さ）をくりぬく（最初の1つの下にもぐる） */}
        <mask id="teppan-under-first" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="500">
          <rect x="0" y="0" width="420" height="500" fill="white" />
          <path d={GYOZA[0].under} fill="black" stroke="black" className="scene-line" />
          <path d={GYOZA[0].fill} fill="black" stroke="black" className="scene-line" />
        </mask>
      </defs>

      {/* 1. 取っ手（根元は鍋のふちの下にもぐる。先は絵の右の端で切れる） */}
      <g className="teppan-handle">
        <path d={HANDLE_FILL} className="scene-paper" stroke="none" />
        <path d={HANDLE_SIDE_A} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.handle)} />
        <path d={HANDLE_SIDE_B} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.handle)} />
        <path d={HANDLE_UNDER} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={animAt("scene-draw", T.handleUnder)} />
      </g>

      {/* 1. 鍋（ふちの外側 → 内側 → 側面と下のふち。線だけ） */}
      <g className="teppan-pan">
        <path d={PAN_FILL} className="scene-paper" stroke="none" />
        <path d={RIM_OUT} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.rimOut)} />
        <path d={RIM_IN} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.rimIn)} />
        {[SIDE_L, SIDE_R, BOTTOM].map((d, i) => (
          <path key={i} d={d} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.side)} />
        ))}
      </g>

      {/* 2. 餃子（奥から時計回りに、1つずつ上から置かれる。あとに置く餃子が、前の餃子に少しかぶさる。
             最後の1つは、最初の1つの下にもぐる）
          3. 色はここだけ：餃子の皮と焼き目の水彩。置かれたあと、じわっと出る */}
      <g className="teppan-gyoza" clipPath="url(#teppan-inside)">
        {GYOZA.map((g, i) =>
          i === last ? (
            <g key={i} mask="url(#teppan-under-first)">
              <GyozaPiece g={g} i={i} />
            </g>
          ) : (
            <GyozaPiece key={i} g={g} i={i} />
          ),
        )}
      </g>

      {/* 4. 湯気（水彩がじわっと出たあと、餃子の上から3本立ちのぼる。時間でゆっくり揺れる。画面の外では止まる） */}
      <SteamWisps className="teppan-steam" id="teppan-steam-fade" wisps={STEAM} sways={STEAM_SWAY} timing={T.steam} />
    </svg>
  );
}
