// ─── 鉄鍋餃子の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の弐（鉄鍋餃子）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// トップでは使っていない（トップの名物の場面はせいろの絵）。
// 本物の盛り付け（代表者から届いた写真）をもとに、料理の絵の決まり（scenes.css の先頭）で線画にする：
// ・丸い鉄のスキレット（ふちが厚い。太く短い取っ手が1本）を、絵の幅いっぱい（約 92%）に大きく。取っ手は絵の端で切れる。鍋は線だけ
// ・餃子は8個。焼き目の面を上にして、鍋の中心に向けて放射状に、鍋いっぱいにぎっしり並び、となりどうし同じ向きに大きく重なる
// ・餃子1つは、ふっくら幅のある形（長さ：幅 ≒ 1.7：1）。片側が大きくふくらみ、両端は丸い
// ・色を塗るのは、餃子の焼き目（上の面）だけ（きつね色のべた。scenes.css の .food-yaki）
// ・重なった所では、上にのった餃子のふちから、ひだの皮が細い帯のようにのぞく（紙の色の帯と、波打つふちの線）
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。輪郭は scene-line、中の線は scene-fine
//   （鍋・取っ手・餃子の皮には、後ろの線を隠すための塗り --scene-paper を付ける）
// ・部品ごとに g でまとめる：取っ手（teppan-handle）・鍋（teppan-pan）・
//   餃子8個（teppan-gyoza。焼き目は餃子ごとに中に入れる）・湯気（teppan-steam）・ジュッの線（teppan-sizzle）
// ・見る角度は少し斜め上から。床の面の点を縦につぶして描く（pr()。写真の見え方に合わせて 0.64）
// ・動きの順番：鍋が現れる（ふちが描かれる）→ 餃子が奥から時計回りに1つずつ置かれる
//   → 焼き目がじわっと出る → 湯気が3本、鍋の奥から立つ → ジュッの線がぱっと出て、少し薄くなって残る
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// ・絵は viewBox を 360 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, jitter, line, polygon, smooth, steam, sway, type P } from "./draw";

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
// ・焼き目：上の面をきつね色のべた1色（.food-yaki）。まだら・こげの点・質感の線・光と陰・落ち影は描かない
// ・ひだの皮：ふくらんだ側のふちに沿って、細い帯（紙の色。外のふちは、ひだの小さな波の線）。
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

type Gyoza = {
  under: string;
  underLine: string;
  skin: string; // ひだの白い皮の帯
  skinLine: string; // 帯の外のふち
  fill: string;
  line: string;
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
  return {
    under: polygon(low),
    underLine: smooth(run),
    skin: polygon(skinPts),
    skinLine: smooth(skinEdge),
    fill: polygon(top),
    line: smooth(top),
  };
}
const GYOZA = GYOZA_AT.map(gyoza);

// ── 湯気（3本。鍋の奥側のふちのあたりから立ちのぼる。餃子の上にはあまりかからない） ──
// 鍋の内側のふちの奥の線の高さ（絵の座標）を、左右の位置ごとに求めて、そこから少し下から始める
const rimBackY = (dx: number) => pr(PU, PV - Math.sqrt(R_IN * R_IN - dx * dx), DEPTH)[1];
const STEAM_X = [-50, 0, 48];
const STEAM_Y0 = STEAM_X.map((dx) => rimBackY(dx) + 8);
const STEAM_TOP = 78; // 湯気のいちばん上
const STEAM = [
  steam(CX + PU + STEAM_X[0], STEAM_Y0[0], STEAM_TOP + 20, 0.8, 10, 8600),
  steam(CX + PU + STEAM_X[1], STEAM_Y0[1], STEAM_TOP, 2.3, 11, 8620),
  steam(CX + PU + STEAM_X[2], STEAM_Y0[2], STEAM_TOP + 26, 3.9, 9, 8640),
];
const STEAM_SWAY = [sway(5.4, -0.8), sway(6.1, -2.4), sway(5.8, -1.6)];
const STY = Math.max(...STEAM_Y0);

// ── ジュッという音の印（鍋のふちの奥のあたり、2か所。ふちのすぐ外から、外へはねる向きの短い線。foreground の色） ──
// [ふちの上の向き（度。-90 が奥、時計回りに増える）, 線の長さ（本数分）]
const SIZZLE_AT: readonly (readonly [number, readonly number[]])[] = [
  [-148, [12, 16, 11]], // 左奥
  [-58, [14, 11]], // 右奥（取っ手より奥）
];
const SIZZLE = SIZZLE_AT.map(([deg, lens], c) => {
  const a = deg * DEG;
  const [bx, by] = pr(PU + R_OUT * Math.cos(a), PV + R_OUT * Math.sin(a), DEPTH);
  // 絵の上での外向き（少し上へ持ち上げる）
  const ox = Math.cos(a);
  const oy = Math.sin(a) * SQ - 0.55;
  const ol = Math.hypot(ox, oy);
  const base = Math.atan2(oy / ol, ox / ol);
  const spread = 0.42; // 線どうしの開き（ラジアン）
  return lens.map((len, j) => {
    const ang = base + (j - (lens.length - 1) / 2) * spread;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    const p0: P = [bx + dx * 8, by + dy * 8]; // ふちの線から少し離して始める
    const p1: P = [p0[0] + dx * len, p0[1] + dy * len];
    return line(p0, p1, 8700 + c * 20 + j * 5, 0.3, 1);
  });
});

// 焼き目がじわっと出る動き（餃子ごと）
const lateAnim = (i: number) => anim("scene-fade-up", 42 + i * 0.6, 47 + i * 0.6, { "--dy": "0px" });

// 餃子1つ（置かれる動きと、そのあと焼き目がじわっと出る動き）
function GyozaPiece({ g, i }: { g: Gyoza; i: number }) {
  return (
    <g className="scene-anim" style={anim("scene-fade-up", 20 + i * 2.2, 26 + i * 2.2, { "--dy": "-12px" })}>
      {/* 皮の側面（厚み）と、ひだの皮の帯（下の餃子の上にのぞく）。紙の色 */}
      <path d={g.under} className="scene-paper" stroke="none" />
      <path d={g.skin} className="scene-paper" stroke="none" />
      <path d={g.skinLine} className="scene-fine" />
      {/* 上の面（紙の色）と、焼き目（ここだけ色。置かれたあと、じわっと出る） */}
      <path d={g.fill} className="scene-paper" stroke="none" />
      <path d={g.fill} className="food-yaki scene-anim" stroke="none" style={lateAnim(i)} />
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
      style={{ "--scene-z": 360 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 湯気は上のほうで薄くなる（線の色は同じ foreground のまま、濃さだけ変える） */}
        <linearGradient id="teppan-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1={STY} x2="0" y2={STEAM_TOP}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
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
        <path d={HANDLE_SIDE_A} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 12, 19)} />
        <path d={HANDLE_SIDE_B} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 12, 19)} />
        <path d={HANDLE_UNDER} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 15, 20)} />
      </g>

      {/* 1. 鍋（ふちの外側 → 内側 → 側面と下のふち。線だけ） */}
      <g className="teppan-pan">
        <path d={PAN_FILL} className="scene-paper" stroke="none" />
        <path d={RIM_OUT} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 4, 13)} />
        <path d={RIM_IN} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 7, 15)} />
        {[SIDE_L, SIDE_R, BOTTOM].map((d, i) => (
          <path key={i} d={d} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 10, 16)} />
        ))}
      </g>

      {/* 2. 餃子（奥から時計回りに、1つずつ上から置かれる。あとに置く餃子が、前の餃子に少しかぶさる。
             最後の1つは、最初の1つの下にもぐる）
          3. 色はここだけ：餃子の焼き目。置かれたあと、じわっと出る */}
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

      {/* 4. 湯気（3本。鍋の奥から立ちのぼる。時間でゆっくり揺れ続ける。画面の外では止まる） */}
      <g className="teppan-steam" stroke="url(#teppan-steam-fade)">
        {STEAM.map((d, i) => (
          <g key={i} className="scene-sway" style={STEAM_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-line scene-stroke-draw scene-anim"
              style={anim("scene-draw", 49 + i * 2, 55 + i * 2)}
            />
          </g>
        ))}
      </g>

      {/* 5. ジュッという音の印（2か所。ぱっと出て、少し薄くなって残る） */}
      <g className="teppan-sizzle">
        {SIZZLE.map((lines, c) => (
          <g key={c} className="teppan-sizzle-mark scene-anim" style={anim("teppan-sizzle", 54 + c * 1.5, 59 + c)}>
            {lines.map((d, j) => (
              <path key={j} d={d} className="scene-fine" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
