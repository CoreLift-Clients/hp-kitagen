// ─── 鉄鍋餃子の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の弐（鉄鍋餃子）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// トップでは使っていない（トップの名物の場面はせいろの絵）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：黒くて厚みのある丸い鉄のスキレット（ふちが厚く、太く短い取っ手が1本。
// 先に小さな穴）に、半月の餃子が8個、焼き目の面を上にして、鍋の中心に向けて花びらのように並び、となりどうし少しずつ重なる。
// 鍋の下に薄い1枚の木の板。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （鍋・取っ手・餃子にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・鍋の黒さは塗りつぶさず、鍋の外側の側面の短い斜線で表す
// ・差し色は accent を1か所だけ（餃子の焼き色。平らな側のふちに沿った帯だけで、外のふちが濃く（accent 60%）内へ淡くなる。
//   linearGradient ＋ scenes.css の .teppan-yaki-stop。上の面のほかは紙の色＝皮の色のまま）
// ・部品ごとに g でまとめる：木の板（teppan-board）・取っ手（teppan-handle）・鍋（teppan-pan）・
//   餃子8個（teppan-gyoza。焼き色の帯・ひだの折り目の線は餃子ごとに中に入れる）・湯気（teppan-steam）・ジュッの線（teppan-sizzle）
// ・見る角度は少し斜め上から。床の面の点を縦につぶして描く（pr()）
// ・動きの順番：木の板と鍋が現れる（ふちが描かれる）→ 餃子が奥から時計回りに1つずつ置かれる
//   → 平らな側のふちに焼き色の帯がじわっと出る
//   → 湯気が3本立つ → ジュッの線がぱっと出て、少し薄くなって残る
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

// ── 餃子（8個。焼き目の面を上に、鍋の中心に向けて花のように並ぶ） ──
// 1つずつ、長い向きを鍋の中心に向ける（放射状）。内側の端は鍋の中心のすぐ近くまで寄せ、まん中で少しずつ重ね合わせる
// （中央に鍋の底が見えるすき間はつくらない）。外側の端は鍋の内側のふち（R_IN）の少し内側まで。
// 1つずつ半月の形：ふくらんだ側は大きな曲線、平らな側はゆるい曲線、両端は丸い。中心側の端は少しだけ細くする（とがらせない）。
// ふくらんだ側のふちは、ひだの波（PLEATS）。波の谷から内へ、ひだの折り目の細い線を3本（FOLDS）。
// 上の面の下に、厚みを表す下のふちの線を見える側（手前）だけ細く入れる。
// 8個は 45° ずつを基本に、向きと大きさを1つずつ手で決めてばらつかせる（乱数は使わない）。
// 並ぶ順（動きの順）：奥から時計回り。花びらのように、前の餃子の平らな側に、次の餃子のふくらんだ側が少しかぶさる
// （ふくらんだ側は、すべて前の餃子の側＝反時計回りの側を向く。GSIDE）。
// 最後の1つの上に最初の1つがのる所は、最後の1つから最初の1つの形をくりぬく（mask）。
// くりぬいたふちは最初の1つの輪郭の線の下に入るので、継ぎ目は見えない。
// 中心の近くは、長い向きの線を少しずつずらして（GOFF）8個の端が1点に集まらないようにし、
// さらに下になる餃子の線を、中心のまわりの小さな範囲だけ隠す（mask teppan-center。塗りは残すので、すき間は見えない）
const GZ = DEPTH - 2; // 餃子の上の面の高さ（ふちと同じくらいまで、こんもり）
const GLEN = 50; // 長さの半分（床の面。中心に向かう長さ）
const GW = 52; // 幅（平らな側のふちから、ふくらみのいちばん外まで）
const GIN = 0; // 中心側の端の、鍋の中心からの距離
const GTAPER = 0.72; // 中心側の端の幅の割合（少し細く）
const GSIDE = -1; // ふくらんだ側の向き（-1 … 反時計回りの側＝前に置いた餃子の側、1 … 時計回りの側）
const PLEATS = 5; // ひだの波の数（ふくらんだ側のふち。両端の近くは波を小さくする）
const PLEAT_H = 3.6; // ひだの波の高さ（床の面。ひと目で波と分かる大きさ）
const FOLD_TO = 0.5; // ひだの折り目の線の内側の端（ふくらんだ側のふちから、上の面の半分くらいまで。平らな側には届かせない）
const YAKI_W = 0.3; // 焼き色の帯の幅（餃子の幅 GW に対する割合）
const GT = 7; // ふっくらした厚み（上の面と下のふちの差。絵の座標）
const DEG = PI / 180;
const [GCX, GCY] = pr(PU, PV, GZ); // 鍋の中心（餃子の上の面の高さ）
const G_CENTER = 5; // 下になる餃子の線を隠す、中心のまわりの半径（床の面）
const G_CENTER_TOP = 2; // 中心で線を隠さない、いちばん上になる餃子の数（最後に置く2つ）
const GOFF = 14; // 長い向きの線を、中心から平らな側へずらす長さ（8個の端が1点に集まらず、小さな渦のように重なる）

// [置く向き（度。-90 が奥、時計回りに増える）, 大きさ]。基本は 45° ずつ・大きさ 1
const GYOZA_AT: readonly [number, number][] = [
  [-86, 1.0], // 奥（-90 +4）
  [-49, 0.97], // 右奥（-45 -4）
  [3, 1.03], // 右（0 +3）
  [40, 0.96], // 右手前（45 -5）
  [94, 1.02], // 手前（90 +4）
  [132, 0.95], // 左手前（135 -3）
  [185, 1.04], // 左（180 +5）
  [221, 0.98], // 左奥（225 -4）
];

// 半月の形（餃子の中の座標。x … 長い向き（マイナスが中心側）、y … 0 が平らな側のふち、GW がふくらみのいちばん外）。
// ふくらんだ側は大きなだ円の弧、平らな側はゆるい弧。2つの境の角を、なめらかに丸める（smax）
const smax = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + (h * h * k) / 4;
};
function moonInside(x: number, y: number, pleatH = PLEAT_H): number {
  const ey0 = 3; // ふくらんだ側のだ円の中心（平らな側のふちより少しだけ内）
  const ex = GLEN * 1.04;
  const ey = GW - ey0;
  const fo = (Math.hypot(x / ex, (y - ey0) / ey) - 1) * Math.min(ex, ey); // ふくらんだ側（だ円）
  const fi = 4 * (1 - (x / GLEN) ** 2) - 4 - y; // 平らな側（まん中が少しだけふくらむ、ゆるい弧）
  // ひだ：ふくらんだ側のふちだけを、ひだの波にする（山は丸く、谷は内へ切れこむ）。両端の近くは波を小さく
  const u = Math.min(Math.max((x + GLEN) / (2 * GLEN), 0), 1);
  const env = Math.pow(Math.max(1 - (x / GLEN) ** 2, 0), 0.6) * Math.min(Math.max((y - GW * 0.3) / (GW * 0.3), 0), 1);
  const pleat = pleatH * env * Math.abs(Math.sin(PI * PLEATS * u));
  return smax(fo - pleat, fi, 20); // 0 より小さいと中
}
// 平らな側のふち（moonInside の fi が 0 になる所）
const flatY = (x: number) => -4 * (x / GLEN) ** 2;
// 焼き色の帯の中（平らな側のふちから YAKI_W × GW まで。両端は餃子の形に合わせて丸く）
const yakiInside = (x: number, y: number) => Math.max(moonInside(x, y), y - flatY(x) - YAKI_W * GW);
// 形のまわりの点（1周 n 個）。形の中の1点 (0, oy) から、角度ごとに境までの長さを二分法で探す
function moonOutline(n: number, inside = moonInside, oy = GW * 0.42): [number, number][] {
  return Array.from({ length: n }, (_, j) => {
    const t = (PI * 2 * j) / n;
    const dx = Math.cos(t);
    const dy = -Math.sin(t); // j が増えると、ふくらんだ側（y が大きい側）→ 中心側の端 → 平らな側 → 外側の端 の順
    let lo = 0;
    let hi = GLEN * 2;
    for (let k = 0; k < 30; k++) {
      const m = (lo + hi) / 2;
      if (inside(m * dx, oy + m * dy) < 0) lo = m;
      else hi = m;
    }
    return [lo * dx, oy + lo * dy];
  });
}
const MOON = moonOutline(96);
// 下のふち（厚み）は、ひだの波を付けない形で描く（上の面の波と二重になってごちゃつかないように）
const MOON_LOW = moonOutline(96, (x, y) => moonInside(x, y, 0));
const YAKI = moonOutline(64, yakiInside, YAKI_W * GW * 0.45);

// ひだの折り目の線（波の谷から内へ。1本ずつ [始まり, 弧のなか, 終わり]。餃子の中の座標）
// 谷は x = -GLEN + 2GLEN·m/PLEATS。中心にいちばん近い谷（m = 1）は、となりの餃子と重なって込み合うので線を入れず、
// m = 2〜PLEATS-1 の3本。ふくらんだ側のふちの少し内から始め、上の面の半分くらい（FOLD_TO）まで。
// 少し中心側へ寄せながら、ゆるい弧を描く
const FOLDS: [number, number][][] = Array.from({ length: PLEATS - 2 }, (_, m) => {
  const x = -GLEN + (2 * GLEN * (m + 2)) / PLEATS;
  let lo = GW * 0.4;
  let hi = GW * 1.4;
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (moonInside(x, mid) < 0) lo = mid;
    else hi = mid;
  }
  const y0 = lo - 1.5; // 谷の少し内（線の丸い端がふちの線に重なる）
  const y1 = Math.max(lo * FOLD_TO, YAKI_W * GW + 4);
  const x1 = x * 0.84;
  const bend = 2.6; // 弧のふくらみ
  return [
    [x, y0],
    [(x + x1) / 2 + bend, (y0 + y1) / 2],
    [x1, y1],
  ];
});

// ふちの線の揺らぎ（点が多いので、1点ずつではなく 6点ごとの揺らぎをなめらかにつなぐ。ひだの波が埋もれないように）
function softJitter(seed: number, j: number, n: number): number {
  const seg = n / 6;
  const f = j / 6;
  const q = Math.floor(f);
  const t = f - q;
  const a = jitter(seed + (q % seg));
  const b = jitter(seed + ((q + 1) % seg));
  return a + (b - a) * t * t * (3 - 2 * t);
}

type Gyoza = {
  under: string;
  underLine: string;
  fill: string;
  line: string;
  yaki: string; // 焼き色の帯
  yakiFrom: P; // 帯の濃さの向き（外のふち → 内）
  yakiTo: P;
  folds: string[]; // ひだの折り目の線
};

function gyoza([deg, k]: readonly [number, number], i: number): Gyoza {
  const phi = deg * DEG;
  const rx = Math.cos(phi); // 中心から外への向き
  const ry = Math.sin(phi);
  // 餃子の中の点 → 床の面の点。x は中心からの距離に、y は向きに直角な横（GSIDE の側）に。
  // 中心側の端は幅を少し細くする（GTAPER）
  const ground = (x: number, y: number): [number, number] => {
    const inner = Math.min(Math.max(-x / GLEN, 0), 1);
    const w = 1 - (1 - GTAPER) * inner * inner;
    const r = GIN + (x + GLEN * 1.04) * k;
    const side = GSIDE * (y * w * k - GOFF);
    return [PU + r * rx - side * ry, PV + r * ry + side * rx];
  };
  const s = 8000 + i * 60;
  const n = MOON.length;
  const outline = (z: number, amp: number, seed: number, shape = MOON): P[] => {
    const pts: P[] = [];
    for (let j = 0; j <= n + 2; j++) {
      const [x, y] = shape[j % n];
      const [gu, gv] = ground(x, y);
      const [px, py] = pr(gu, gv, z);
      pts.push([px + softJitter(seed, j % n, n) * amp, py + softJitter(seed + 7, j % n, n) * amp * 0.6]);
    }
    return pts;
  };
  const top = outline(GZ, 0.6, s);
  const low = outline(GZ - GT, 0.45, s + 30, MOON_LOW);
  // 下のふち：上の面より下に出る所（手前の側）だけ。両はしは上の面のふちへつなぐ
  const below = top.slice(0, n).map((p, j) => low[j][1] > p[1] + GT * 0.55);
  let start = below.findIndex((b, j) => b && !below[(j - 1 + n) % n]);
  if (start < 0) start = 0;
  const run: P[] = [top[(start - 1 + n) % n]];
  for (let j = 0; j < n && below[(start + j) % n]; j++) run.push(low[(start + j) % n]);
  run.push(top[(start + run.length - 1) % n]);
  const at = (x: number, y: number): P => {
    const [gu, gv] = ground(x, y);
    return pr(gu, gv, GZ);
  };
  // 焼き色の帯（平らな側のふちに沿って。濃さは外のふち → 内へ、linearGradient で淡くする）
  const yaki = polygon(YAKI.map(([x, y]) => at(x, y)));
  // ひだの折り目の線（細め。筆ペンのような小さな揺らぎ）
  const folds = FOLDS.map((pts, f) =>
    smooth(
      pts.map(([x, y], m) => {
        const [px, py] = at(x, y);
        return [px + jitter(s + 120 + f * 7 + m) * 0.35, py + jitter(s + 140 + f * 7 + m) * 0.25] as const;
      }),
    ),
  );
  return {
    under: polygon(low),
    underLine: smooth(run),
    fill: polygon(top),
    line: smooth(top),
    yaki,
    yakiFrom: at(0, flatY(0) - 1),
    yakiTo: at(0, YAKI_W * GW),
    folds,
  };
}
const GYOZA = GYOZA_AT.map(gyoza);

// ── 湯気（3本。少し太く、勢いよく立ちのぼり、上で左右にゆれる。餃子のまん中あたりから上へ） ──
const [STX, STY] = pr(PU, PV, GZ);
const STEAM_TOP = STY - 172; // 湯気のいちばん上
const STEAM = [
  steam(STX - 40, STY - 16, STY - 148, 0.8, 12, 8600),
  steam(STX + 2, STY - 22, STEAM_TOP, 2.3, 13, 8620),
  steam(STX + 40, STY - 14, STY - 140, 3.9, 11, 8640),
];
const STEAM_SWAY = [sway(5.4, -0.8), sway(6.1, -2.4), sway(5.8, -1.6)];

// ── ジュッという音の印（鍋のふちのあたり、2か所。ふちのすぐ外から、外へはねる向きの短い線。foreground の色） ──
// [ふちの上の向き（度。-90 が奥、時計回りに増える）, 線の長さ（本数分）]
const SIZZLE_AT: readonly (readonly [number, readonly number[]])[] = [
  [196, [13, 17, 12]], // 左
  [-64, [15, 12]], // 右奥（取っ手より奥）
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

// 餃子1つ（置かれる動きと、そのあと焼き色がじわっと出る動き）
function GyozaPiece({ g, i }: { g: Gyoza; i: number }) {
  // 中心で下になる餃子は、中心のまわりの線を隠す（端の線が重なってごちゃごちゃしないように）
  const lineMask = i < GYOZA_AT.length - G_CENTER_TOP ? "url(#teppan-center)" : undefined;
  return (
    <g className="scene-anim" style={anim("scene-fade-up", 20 + i * 2.2, 26 + i * 2.2, { "--dy": "-12px" })}>
      <path d={g.under} className="scene-paper" stroke="none" />
      <path d={g.underLine} className="scene-fine" mask={lineMask} />
      <path d={g.fill} className="scene-paper" stroke="none" />
      {/* 焼き色：平らな側のふちに沿った帯だけ。外のふちが濃く、内へ淡く。置かれたあと、じわっと出る */}
      <defs>
        <linearGradient
          id={`teppan-yaki-${i}`}
          gradientUnits="userSpaceOnUse"
          x1={g.yakiFrom[0]}
          y1={g.yakiFrom[1]}
          x2={g.yakiTo[0]}
          y2={g.yakiTo[1]}
        >
          <stop offset="0" className="teppan-yaki-stop" stopOpacity="0.6" />
          <stop offset="0.45" className="teppan-yaki-stop" stopOpacity="0.45" />
          <stop offset="1" className="teppan-yaki-stop" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={g.yaki}
        fill={`url(#teppan-yaki-${i})`}
        stroke="none"
        className="scene-anim"
        style={anim("scene-fade-up", 38 + i * 0.7, 43 + i * 0.7, { "--dy": "0px" })}
      />
      {/* ひだの折り目の線（波の谷から内へ。細め） */}
      {g.folds.map((d, k) => (
        <path key={k} d={d} className="teppan-pleat" />
      ))}
      <path d={g.line} className="scene-line" mask={lineMask} />
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
        <linearGradient id="teppan-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1={STY - 16} x2="0" y2={STEAM_TOP}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        {/* 中心で下になる餃子の線を、中心のまわりだけ隠す */}
        <mask id="teppan-center" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="500">
          <rect x="0" y="0" width="400" height="500" fill="white" />
          <ellipse cx={GCX} cy={GCY} rx={G_CENTER} ry={G_CENTER * SQ} fill="black" />
        </mask>
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

      {/* 2. 餃子（奥から時計回りに、1つずつ上から置かれる。後から置くものが前のものに少し重なる）
          3. 差し色（accent）はここだけ：餃子の平らな側のふちに沿った焼き色の帯（外が濃く、内へ淡く）。置かれたあと、じわっと出る */}
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

      {/* 4. 湯気（3本。時間でゆっくり揺れ続ける。画面の外では止まる） */}
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
              <path key={j} d={d} className="teppan-sizzle-line" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
