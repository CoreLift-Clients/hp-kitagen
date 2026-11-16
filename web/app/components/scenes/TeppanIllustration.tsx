// ─── 鉄鍋餃子の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の弐（鉄鍋餃子）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// トップでは使っていない（トップの名物の場面はせいろの絵）。
// 本物の盛り付け（代表者から届いた写真）をもとに、料理の絵の決まり（scenes.css の先頭）で線画にする：
// ・鍋：厚みのある丸い鉄のスキレット。ふちは外と内の2本の線で厚みを出し、ふちの厚みの帯にだけ、淡い墨色の水彩を1段
//   （.teppan-wash-rim。鉄鍋の例外。scenes.css の「料理の絵の決まり」）。取っ手は太く、右上へ伸び、先に穴がある。ほかは線だけ
// ・餃子は8個。焼き目の面を上にして、中心のまわりを渦を巻くように並ぶ（1つずつ少し斜めに傾け、中心で先が集まる）。
//   となりの餃子に少し重なる（手前の餃子が、奥の餃子に重なる）
// ・餃子1つは、ぷっくりした三日月形（背の側がふくらんだ弧、腹の側がゆるい弧。両端は丸い）。
//   手前に見える皮の側面（厚み）と、上の面の輪郭の線で、ふっくらした厚みを出す
// ・ひだ：背の側のふちだけ。白っぽい皮の帯に、やわらかい折り目の短い線を数本（ギザギザの線は使わない）。腹の側は、なめらかな線
// ・色は水彩（部品は Wash.tsx。にじみのフィルタは teppan-wash、焼き色と皮の境目だけ少しぼかした teppan-wash-soft）：
//   皮 … 餃子の上の面全体に、ごく淡いクリーム（.food-wash-skin。しゅうまいの皮と同じ色）
//   焼き色 … ひだの帯を残した上の面に、きつね色（.food-wash-yaki）。皮との境目は少しぼかす。
//   その上に、濃い焼き色（.food-wash-yaki-dark）を、大きさの違う小さな塊で斑点のように散らす（1つの餃子に 3〜6 個。8個とも違う）
//   羽根 … 餃子のすき間と鍋の内側のふちに沿って、こげ茶の網のような羽根（.food-wash-hane。小さな穴がいくつも空き、
//   ふちは細い線 .teppan-hane-line で不揃いに。餃子より目立たない濃さ）
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。輪郭は scene-line、中の線は scene-fine
//   （鍋・取っ手・餃子の皮には、後ろの線を隠すための塗り --scene-paper を付ける）
// ・部品ごとに g でまとめる：取っ手（teppan-handle）・鍋（teppan-pan）・羽根（teppan-hane）・
//   餃子8個（teppan-gyoza。水彩は餃子ごとに中に入れる）・湯気（teppan-steam）
// ・見る角度は少し斜め上から。床の面の点を縦につぶして描く（pr()。写真の見え方に合わせて 0.64）
// ・動きの順番：鍋が現れる（ふちが描かれる）→ 餃子が奥から手前へ1つずつ置かれる
//   → 皮・焼き色・羽根の水彩がじわっと出る → 湯気が3本、餃子の上から立ちのぼる（しゅうまい・からあげと同じ Steam.tsx）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// ・絵は viewBox を 360 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, animAt, blobPts, cardTiming, jitter, line, polygon, smooth, sway, type P } from "./draw";
import { SteamFades, SteamWisps, mkWisp } from "./Steam";
import { Wash, WashFilter, type Hole } from "./Wash";

// ── 見る角度（床の面の点 u・v と高さ z を、絵の座標にする） ──
const CX = 190; // 鍋のまん中の x（viewBox は x = 22〜382。右に取っ手の分をあける）
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
const DEG = PI / 180;

// ── 鍋（厚みのある丸い鉄のスキレット） ──
const PU = 0; // 鍋の中心
const PV = 0;
const R_OUT = 156; // ふちの外側
const R_IN = 133; // ふちの内側（ふちが厚い）
const R_BOT = 148; // 下のふち（底は少しすぼまる）
const DEPTH = 30; // 鍋の高さ（ふちの上の面まで）
const RIM_OUT = smooth(ovalPts(PU, PV, R_OUT, DEPTH, PI * 0.96, PI * 3.03, 34, 1, 7300));
const RIM_IN = smooth(ovalPts(PU, PV, R_IN, DEPTH, PI * 0.94, PI * 3.04, 32, 0.8, 7340));
const SIDE_L = line(pr(PU - R_OUT, PV, DEPTH), pr(PU - R_BOT, PV, 0), 7380, 0.3, 1);
const SIDE_R = line(pr(PU + R_OUT, PV, DEPTH), pr(PU + R_BOT, PV, 0), 7390, 0.3, 1);
const BOTTOM = smooth(ovalPts(PU, PV, R_BOT, 0, 0, PI, 24, 0.9, 7400));
// 鍋の後ろを隠す塗り：上のふちの奥の半分 → 手前の下のふち
const PAN_FILL = polygon([...ovalPts(PU, PV, R_OUT, DEPTH, PI, PI * 2, 28, 0, 0), ...ovalPts(PU, PV, R_BOT, 0, 0, PI, 28, 0, 0)]);
// ふちの厚みの帯（外のだ円と、逆向きの内のだ円の2つの輪。つなぎ目の線ができないよう、別々に閉じる。淡い墨色の水彩を1段）
const RIM_BAND = `${polygon(ovalPts(PU, PV, R_OUT, DEPTH, 0, PI * 2, 48, 0, 0).slice(0, 48))} ${polygon(ovalPts(PU, PV, R_IN, DEPTH, PI * 2, 0, 44, 0, 0).slice(0, 44))}`;
// 餃子と羽根を、鍋の内側のふちの中だけに見せる
const [PCX, PCY] = pr(PU, PV, DEPTH);
const CLIP_R = R_IN - 1.5;

// ── 取っ手（太く、右上へ伸びる。先は丸く、穴がある。先へ行くほど少し持ち上がる） ──
const HA = -0.72; // 向き（床の面。0 が真右、マイナスで奥へ）
const H0 = R_OUT - 18; // 根元（ふちの下にもぐる）
const H1 = R_OUT + 66; // 先の丸みのまん中
const HW0 = 28; // 根元の半分の幅
const HW1 = 18; // 先の半分の幅（先の丸みの半径）
const HT = 9; // 取っ手の厚み（手前の下に見える分）
const hz = (r: number) => DEPTH - 2 + (10 * (r - H0)) / (H1 - H0); // 高さ
const hw = (r: number) => HW0 + ((HW1 - HW0) * (r - H0)) / (H1 - H0); // 半分の幅
// 取っ手の面の点（r … 長い向き、w … 幅の向き。プラスが手前の側）
const hp = (r: number, w: number, dz = 0): P => {
  const c = Math.cos(HA);
  const s = Math.sin(HA);
  return pr(PU + r * c - w * s, PV + r * s + w * c, hz(Math.min(r, H1)) + dz);
};
// 上の面の輪郭：奥の辺（根元 → 先）→ 先の丸み → 手前の辺（先 → 根元）
const HANDLE_TOP: P[] = [
  ...Array.from({ length: 6 }, (_, i) => {
    const r = H0 + ((H1 - H0) * i) / 5;
    return hp(r, -hw(r));
  }),
  ...Array.from({ length: 11 }, (_, i) => {
    const a = -PI / 2 + (PI * (i + 1)) / 12;
    return hp(H1 + HW1 * Math.cos(a), HW1 * Math.sin(a));
  }),
  ...Array.from({ length: 6 }, (_, i) => {
    const r = H1 - ((H1 - H0) * i) / 5;
    return hp(r, hw(r));
  }),
];
const HANDLE_LINE = smooth(HANDLE_TOP);
// 厚み：手前の辺と先の丸みの手前の半分の下
const HANDLE_UNDER_PTS: P[] = [
  ...Array.from({ length: 5 }, (_, i) => {
    const r = H0 + 14 + ((H1 - H0 - 14) * i) / 4;
    return hp(r, hw(r), -HT);
  }),
  ...Array.from({ length: 5 }, (_, i) => {
    const a = PI / 2 - (PI * 0.42 * (i + 1)) / 5;
    return hp(H1 + HW1 * Math.cos(a), HW1 * Math.sin(a), -HT);
  }),
];
const HANDLE_UNDER = smooth(HANDLE_UNDER_PTS);
const HANDLE_FILL = polygon([...HANDLE_TOP, ...[...HANDLE_UNDER_PTS].reverse()]);
// 先の穴（長い向きに長いだ円）
const HANDLE_HOLE = smooth(
  Array.from({ length: 21 }, (_, i) => {
    const a = (PI * 2 * i) / 20 + 0.2;
    return hp(H1 - 4 + 11 * Math.cos(a), 5.5 * Math.sin(a));
  }),
);

// ── 餃子（8個。焼き目の面を上に、中心のまわりを渦を巻くように並ぶ） ──
// 餃子の中の座標：x … 長い向き（マイナスが中心側の先）、y … 幅の向き（プラスが背〈ひだ〉の側）。
// 三日月形：背の側は大きくふくらんだ弧、腹の側はゆるい弧。真ん中の線が背の側へ弓なりに反る（両端が腹の側へ下がる）
const GZ = DEPTH - 6; // 餃子の上の面の高さ（鍋の中に、ふちより少し低く）
// ぷっくりした厚み（上の面と下のふちの差。絵の座標）。斜めから見ているので、手前の餃子ほど大きく、奥の餃子ほど小さく
const GT_FRONT = 11;
const GT_BACK = 3;
const GLEN = 60; // 長さの半分（床の面。長さ 120）
const GWB = 46; // 背の側のふくらみ（真ん中の線から）
const GWA = 15; // 腹の側のふくらみ
const GBOW = 15; // 弓なりの反り（両端で、腹の側へ）
const GR = 66; // 餃子のまん中の、鍋の中心からの距離
const PLEAT = 12; // ひだの帯の幅（背の側のふちから内側へ。両端ほど細い）

// [置く向き（度。-90 が奥、時計回りに増える）, 放射からの傾き（度。時計回り。渦の向き）, 大きさ, 中心からの距離のずれ]
const GYOZA_AT: readonly [number, number, number, number][] = [
  [-90, 22, 1.0, 0], // 奥
  [-45, 24, 0.97, -2],
  [0, 21, 1.03, 2],
  [45, 25, 0.98, -1],
  [90, 22, 1.03, 2],
  [135, 24, 0.96, -2],
  [180, 21, 1.04, 2],
  [225, 23, 0.98, 0],
];

const base = (t: number) => Math.max(1 - t * t, 0);
const yBack = (t: number) => GWB * Math.pow(base(t), 0.5) - GBOW * t * t;
const yBelly = (t: number) => -GWA * Math.pow(base(t), 0.5) - GBOW * t * t;
const yPleat = (t: number) => yBack(t) - PLEAT * Math.pow(base(t), 0.5); // ひだの帯の内側のふち
// 形のまわり（1周 NB 個）：背の側を外側の先から中心側の先へ、腹の側を戻る
const NB = 120;
const BOAT: [number, number][] = [
  ...Array.from({ length: NB / 2 }, (_, j): [number, number] => {
    const t = Math.cos((PI * j) / (NB / 2));
    return [t * GLEN, yBack(t)];
  }),
  ...Array.from({ length: NB / 2 }, (_, j): [number, number] => {
    const t = -Math.cos((PI * j) / (NB / 2));
    return [t * GLEN, yBelly(t)];
  }),
];
// 焼き色の所：腹の側のふち（線の外まで少し出して、mask で線の内側に切る）→ ひだの帯の内側のふちを戻る
const YAKI_AREA: [number, number][] = [
  ...Array.from({ length: 31 }, (_, j): [number, number] => {
    const t = -1.04 + (2.08 * j) / 30;
    return [t * GLEN, yBelly(Math.max(-1, Math.min(1, t))) - 4];
  }),
  ...Array.from({ length: 31 }, (_, j): [number, number] => {
    const t = 0.96 - (1.92 * j) / 30;
    return [t * GLEN, yPleat(t) - 1.5];
  }),
];

type Gyoza = {
  under: string; // 皮の側面（厚み）
  underLine: string; // 側面の下のふち
  fill: string; // 上の面
  line: string; // 上の面の輪郭
  yaki: string; // きつね色の焼き色
  spots: string[]; // 濃い焼き色の斑点
  folds: string[]; // ひだの折り目
  hole: Hole; // 白い抜け
  depth: number; // 奥ほど小さい（重ねる順に使う）
};

function gyoza([deg, tilt, k, dr]: readonly [number, number, number, number], i: number): Gyoza {
  const phi = deg * DEG;
  const beta = (deg + tilt) * DEG;
  const ax = Math.cos(beta); // 長い向き（外側の先へ）
  const ay = Math.sin(beta);
  const nx = Math.sin(beta); // 背の側（長い向きを反時計回りに 90°）
  const ny = -Math.cos(beta);
  const cu = PU + (GR + dr) * Math.cos(phi); // 餃子のまん中
  const cv = PV + (GR + dr) * Math.sin(phi);
  const at = (x: number, y: number, z = GZ): P => pr(cu + k * (x * ax + y * nx), cv + k * (x * ay + y * ny), z);
  const s = 8000 + i * 60;
  const n = BOAT.length;
  const outline = (z: number): P[] => [...BOAT, BOAT[0], BOAT[1]].map(([x, y]) => at(x, y, z));
  // 厚み：手前（phi = 90°）ほど大きく、奥（phi = -90°）ほど小さく
  const GT = (GT_FRONT + GT_BACK) / 2 + ((GT_FRONT - GT_BACK) / 2) * Math.sin(phi);
  const top = outline(GZ);
  const low = outline(GZ - GT);
  // 下のふち：上の面の形の外に出ている所（手前の側）だけ
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

  // ひだの折り目：背の側のふちの少し内側から、帯の内側へ向かう、やわらかく弓なりに曲がった短い線（3〜4本）。
  // 線は背の側のふちにつけない（くしの歯に見えないように）。外側の先のほうへ、斜めに流れる
  const nf = 3 + (i % 2);
  const folds = Array.from({ length: nf }, (_, j) => {
    const t = -0.5 + (1.0 * (j + 0.5)) / nf + jitter(s + 700 + j) * 0.06;
    const x = t * GLEN;
    const y0 = yBack(t) - 3;
    const y1 = yPleat(t) + 0.5;
    const lean = 9 + jitter(s + 720 + j) * 2;
    return smooth([at(x, y0), at(x + lean * 0.35, y0 - (y0 - y1) * 0.55), at(x + lean, y1)]);
  });

  // 濃い焼き色の斑点（大きさの違う小さな塊を 3〜6 個。ひだの帯には寄せない）
  const ns = 3 + ((i * 5) % 4);
  const spots = Array.from({ length: ns }, (_, j) => {
    const t = -0.72 + (1.44 * (j + 0.5)) / ns + jitter(s + 800 + j) * 0.1;
    const ya = yBelly(t);
    const yk = yPleat(t);
    const f = 0.25 + 0.4 * ((jitter(s + 820 + j) + 1) / 2);
    const r = 3.2 + 3.8 * ((jitter(s + 840 + j) + 1) / 2);
    const pts = blobPts(t * GLEN, ya + (yk - ya) * f, r * 1.6, r, s + 860 + j * 7, 3, 0.12, 22);
    return polygon(pts.map(([x, y]) => at(x, y)));
  });
  // 白い抜け（焼き色の中の、斑点のないあたり）
  const ht = -0.72 + 1.44 / ns;
  const [hpx, hpy] = at(ht * GLEN, (yBelly(ht) + yPleat(ht)) / 2 + 2);

  return {
    under: polygon(low),
    underLine: smooth(run),
    fill: polygon(top),
    line: smooth(top),
    yaki: polygon(YAKI_AREA.map(([x, y]) => at(x, y))),
    spots,
    folds,
    hole: [hpx, hpy, 3.6 * k, 2 * k],
    depth: Math.sin(phi),
  };
}
const GYOZA = GYOZA_AT.map(gyoza);
// 重ねる順と置く順：奥から手前へ（手前の餃子が、奥の餃子に重なる）
const ORDER = GYOZA.map((_, i) => i).sort((a, b) => GYOZA[a].depth - GYOZA[b].depth);

// ── 羽根（餃子のすき間と、鍋の内側のふちに沿って。こげ茶の網のような形） ──
// 鍋の底いっぱいに広がり、ふちのあたりで不揃いに止まる（ふちに届く所と、少し手前で止まる所がある）。
// 小さな穴（紙の色の抜け）をいくつも空けて、レースのように見せる。ふちは細い線で、とぎれとぎれに
const HANE_Z = GZ - 6;
const HANE_N = 72;
const haneR = (j: number) => {
  const a = (PI * 2 * j) / HANE_N;
  const dip = 0.5 + 0.5 * Math.sin(5 * a + 1.3);
  return R_IN - 2 - 10 * dip * (0.6 + 0.4 * Math.sin(3 * a + 0.4)) - Math.abs(jitter(9100 + j)) * 3.5;
};
const HANE_PTS: P[] = Array.from({ length: HANE_N }, (_, j) => {
  const a = (PI * 2 * j) / HANE_N;
  const r = haneR(j);
  return pr(PU + r * Math.cos(a), PV + r * Math.sin(a), HANE_Z);
});
const HANE = polygon(HANE_PTS);
// ふちの線（とぎれとぎれ）
const HANE_EDGE_RUNS: readonly [number, number][] = [[2, 9], [13, 22], [27, 31], [36, 46], [51, 59], [63, 70]];
const HANE_EDGE = HANE_EDGE_RUNS.map(([a, b]) => smooth(HANE_PTS.slice(a, b + 1)));
// 小さな穴（ふちのあたりに 2 列。大きさは少しずつ違う）
const HANE_HOLES: Hole[] = Array.from({ length: 40 }, (_, j) => {
  const a = (PI * 2 * (j + 0.5 * (j % 2))) / 40 + jitter(9200 + j) * 0.05;
  const r = R_IN - 9 - (j % 2) * 9 + jitter(9240 + j) * 2.5;
  const [x, y] = pr(PU + r * Math.cos(a), PV + r * Math.sin(a), HANE_Z);
  const rx = 2.2 + 1.4 * ((jitter(9280 + j) + 1) / 2);
  return [x, y, rx, rx * 0.7] as const;
});

// ── 湯気（3本。餃子の上の、少し浮いた所から立ちのぼる） ──
// 描き方はしゅうまい・からあげと同じ（Steam.tsx。根元はふわっと消える）。まん中の1本がいちばん高い
const STEAM = [
  mkWisp(CX - 38, 262, 128, -3, 0.6, 6.5, 8600, 0.42),
  mkWisp(CX + 2, 250, 104, 2, 2.6, 6.5, 8620, 0.42),
  mkWisp(CX + 40, 264, 134, 3, 4.3, 6, 8640, 0.42),
];
const STEAM_SWAY = [sway(5.4, -0.8), sway(6.1, -2.4), sway(5.8, -1.6)];

// ── 動きの段（anim の from・to。4〜60。scenes.css の「名物の欄の決まり」） ──
// 主役は、餃子が奥から手前へ1つずつ置かれる所（19〜41 ＝ 全体の約 4 割）。段のあいだに短い間
const T = {
  rimOut: [4, 11], // 鍋のふちの外が描かれる
  rimIn: [6, 13], // ふちの内
  side: [8, 14], // 側面と下のふち
  rimBand: [9, 15], // ふちの厚みの帯の淡い墨色
  handle: [10, 16], // 取っ手
  handleUnder: [12, 17], // 取っ手の厚みと穴
  gyoza: [19, 24.2], // （間）餃子が置かれる（1つ目。1つずつ GYOZA_STEP ずらす。8つ目は 35.8〜41）
  yaki: [43, 48], // （間）皮・焼き色・羽根の水彩がじわっと出る（餃子は1つずつ 0.6 ずらす）
  steam: [[51, 56], [53, 58], [55, 60]], // 湯気が3本立ちのぼる（完成）
} as const;
const GYOZA_STEP = 2.4;
// 線のいちばん下は、絵の場所の上から 98.2%。主役が時間で動くとき (16.8 × 0.045 + 5.2 × 0.05) × 1.4 ≒ 1.4 秒
const CARD = cardTiming({ ink: 0.99, time: 1.4 });

// 水彩がじわっと出る動き（餃子ごと。rank は置く順）
const lateAnim = (rank: number) => animAt("scene-fade-up", T.yaki, { "--dy": "0px" }, rank * 0.6);

// 餃子1つ（置かれる動きと、そのあと水彩がじわっと出る動き）
function GyozaPiece({ g, i, rank }: { g: Gyoza; i: number; rank: number }) {
  return (
    <g className="scene-anim" style={animAt("scene-fade-up", T.gyoza, { "--dy": "-12px" }, rank * GYOZA_STEP)}>
      {/* 皮の側面（厚み）と上の面。後ろを隠す紙の色 */}
      <path d={g.under} className="scene-paper" stroke="none" />
      <path d={g.fill} className="scene-paper" stroke="none" />
      {/* 水彩：皮（上の面全体）→ きつね色の焼き色（ひだの帯を残す。境目は少しぼかす）→ 濃い焼き色の斑点 */}
      <g className="scene-anim" style={lateAnim(rank)}>
        <Wash filter="teppan-wash" d={g.fill} tone="food-wash-skin" id={`teppan-w-skin-${i}`} shift={[1, 0.75]} />
        {/* 焼き色は、上の面の線の内側だけに（皮の水彩の mask ＝ 線の太さの半分だけ内側に縮めた形を、もう一度使う） */}
        <g mask={`url(#teppan-w-skin-${i}-m)`}>
          <Wash filter="teppan-wash-soft" d={g.yaki} tone="food-wash-yaki" id={`teppan-w-yaki-${i}`} shift={[0.75, 0.6]} holes={[g.hole]} line={0} />
          {g.spots.map((d, j) => (
            <Wash key={j} filter="teppan-wash-spot" d={d} tone="food-wash-yaki-dark" id={`teppan-w-spot-${i}-${j}`} shift={[0.4, 0.3]} line={0} />
          ))}
        </g>
      </g>
      {/* ひだの折り目（背の側だけ）・側面の下のふち・上の面の輪郭 */}
      {g.folds.map((d, j) => (
        <path key={j} d={d} className="scene-fine" />
      ))}
      <path d={g.underLine} className="scene-fine" />
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
      style={{ "--scene-z": 360 / 400, ...CARD } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。餃子・羽根・鍋のふちで使い回す）。焼き色は、皮との境目を少しぼかしたもの */}
        <WashFilter id="teppan-wash" seed={11} />
        <WashFilter id="teppan-wash-soft" seed={11} blur={1.6} />
        <WashFilter id="teppan-wash-spot" seed={12} blur={0.7} />
        {/* 湯気の濃さ（1本ずつ。根元と上の端は透明） */}
        <SteamFades id="teppan-steam-fade" wisps={STEAM} />
        {/* 餃子と羽根は鍋の内側のふちの中だけに見せる */}
        <clipPath id="teppan-inside">
          <ellipse cx={PCX} cy={PCY} rx={CLIP_R} ry={CLIP_R * SQ} />
        </clipPath>
      </defs>

      {/* 1. 取っ手（太く、右上へ伸びる。根元は鍋のふちの下にもぐる。先に穴） */}
      <g className="teppan-handle">
        <path d={HANDLE_FILL} className="scene-paper" stroke="none" />
        <path d={HANDLE_LINE} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.handle)} />
        <path d={HANDLE_UNDER} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={animAt("scene-draw", T.handleUnder)} />
        <path d={HANDLE_HOLE} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={animAt("scene-draw", T.handleUnder)} />
      </g>

      {/* 1. 鍋（ふちの外側 → 内側 → 側面と下のふち。線と、ふちの厚みの帯の淡い墨色だけ） */}
      <g className="teppan-pan">
        <path d={PAN_FILL} className="scene-paper" stroke="none" />
        <g className="scene-anim" style={animAt("scene-fade-up", T.rimBand, { "--dy": "0px" })}>
          <Wash filter="teppan-wash" d={RIM_BAND} tone="teppan-wash-rim" id="teppan-w-rim" shift={[1, 0.75]} />
        </g>
        <path d={RIM_OUT} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.rimOut)} />
        <path d={RIM_IN} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.rimIn)} />
        {[SIDE_L, SIDE_R, BOTTOM].map((d, i) => (
          <path key={i} d={d} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.side)} />
        ))}
      </g>

      <g clipPath="url(#teppan-inside)">
        {/* 2. 羽根（焼き色の段で、焼き色と一緒にじわっと出る。餃子の下に敷く） */}
        <g className="teppan-hane scene-anim" style={animAt("scene-fade-up", T.yaki, { "--dy": "0px" })}>
          <Wash filter="teppan-wash" d={HANE} tone="food-wash-hane" id="teppan-w-hane" shift={[0.75, 0.6]} holes={HANE_HOLES} line={0} />
          {HANE_EDGE.map((d, j) => (
            <path key={j} d={d} className="teppan-hane-line" />
          ))}
        </g>

        {/* 3. 餃子（奥から手前へ、1つずつ上から置かれる。手前の餃子が、奥の餃子に少し重なる）。
            色：皮と焼き色の水彩。置かれたあと、じわっと出る */}
        <g className="teppan-gyoza">
          {ORDER.map((i, rank) => (
            <GyozaPiece key={i} g={GYOZA[i]} i={i} rank={rank} />
          ))}
        </g>
      </g>

      {/* 4. 湯気（水彩がじわっと出たあと、餃子の上から3本立ちのぼる。時間でゆっくり揺れる。画面の外では止まる） */}
      <SteamWisps className="teppan-steam" id="teppan-steam-fade" wisps={STEAM} sways={STEAM_SWAY} timing={T.steam} />
    </svg>
  );
}
