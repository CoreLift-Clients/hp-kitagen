// ─── 肉みそ冷奴の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の陸（肉みそ冷奴）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：横長の角の丸い焼き物の皿に、白い四角い豆腐が4つ、
// 左奥から右手前へ斜めに、すき間を少しだけあけて一列。豆腐1つ1つのまん中に、こげ茶色の肉みそが、
// ひき肉のぽろぽろしたかたまりのままこんもりのり、その上に小口切りのねぎがたっぷり。
// たれ（オレンジ茶色の油）は豆腐の上の面ににじみ、お皿の上の豆腐のまわりに広がる。
// 形は写真を見て描いた形（ab2dae6）。色は、料理の絵の決まり（scenes.css の先頭）の「水彩の塗り方」で、
// 線画にうすく絵の具で塗ったように付ける（部品は Wash.tsx。にじみのフィルタは hiyayakko-wash の1つを使い回す。
// ムラの幅だけ、この絵は少し広く 0.55〜0.95 倍）：
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く
// ・お皿：線だけ（面は紙の色。落ち影や陰は付けない）
// ・豆腐：形全体を、ごく淡いクリーム色の水彩（.food-wash-tofu。ほとんど白）。手前と右の側面は、同じ色をもう1段重ねて陰に。
//   上の面に小さな白い抜けを1つ
// ・肉みそ：山の形を、角煮の肉と同じ茶色の水彩（.food-wash-kakuni）。ひき肉の小さなかたまりは、同じ色をうすく重ねた
//   小さな塗り（.food-wash-miso-crumb。重なった所ほど濃くなり、ぽろぽろして見える）。てかりは白い小さな点
// ・ねぎ：小口切りの輪を、肉みその上に 5個ずつ。輪の線は緑（--hiyayakko-negi）、中は同じ緑の水彩（.food-wash-negi）。
//   いくつかは豆腐の上とお皿にこぼれる
// ・たれ：お皿の上の広がりと、豆腐の上の面の肉みそのまわりを、オレンジ茶色の水彩（.food-wash-tare）。
//   豆腐の手前・すき間のたまりは、うすい同じ色（.food-wash-tare-pale）をもう1段重ねる。豆腐の上の面は、うすいほうだけ
// ・部品ごとに g でまとめる：お皿（hiyayakko-dish）・たれ（hiyayakko-tare）・豆腐（hiyayakko-tofu）・
//   肉みそ（hiyayakko-miso）・ねぎ（hiyayakko-negi）
// ・見る角度は少し斜め上から。お皿と豆腐の並びは、床の面の上で少し回してから縦につぶして描く（pr()）
// ・動きの順番：お皿のふちが描かれる → 豆腐が左奥から1つずつ置かれる → 肉みそが1つずつ、少し上からふわっとのる
//   → ねぎが散る（1つずつぽんと出る）→ たれの広がりがじわっと出る
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）。何も動かさないときの形が、動き終わった形
// ・絵は viewBox を 332 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, animAt, cardTiming, jitter, line, polygon, roundRectPts, smooth, type P } from "./draw";
import { Wash, WashFilter } from "./Wash";

// ── 見る角度（床の面の点 u・v を、絵の座標にする） ──
// u … お皿の長い向き（左奥 → 右手前）、v … 短い向き（奥 → 手前）、z … 高さ
const CX = 200;
const CY = 296;
const TH = 0.68; // 床の面での回し（ラジアン）。お皿と豆腐の並びが、左上から右下へ少し斜めになる
const SQ = 0.58; // 縦のつぶし（少し斜め上から見る）
const COS = Math.cos(TH);
const SIN = Math.sin(TH);
const pr = (u: number, v: number, z = 0): P => [CX + u * COS - v * SIN, CY + (u * SIN + v * COS) * SQ - z];

// 床の面（高さ z）の上の、ふちが不ぞろいな閉じた形（たれの広がり・豆腐の上のたれ）
function groundBlob(u0: number, v0: number, ru: number, rv: number, z: number, seed: number, amp: number, steps = 30): P[] {
  const pts: P[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (PI * 2 * i) / steps;
    const w = 1 + amp * (0.6 * Math.sin(5 * t + seed * 0.31) + 0.4 * Math.sin(11 * t + seed * 0.17)) + jitter(seed + (i % steps)) * amp * 0.3;
    pts.push(pr(u0 + ru * w * Math.cos(t), v0 + rv * w * Math.sin(t), z));
  }
  return pts;
}

// ── お皿（横長の、角の丸い長方形。ふちの外側と内側の線 2本で厚みを表す。点の作り方は draw.ts の roundRectPts） ──
const DISH_OUTER = smooth(roundRectPts(pr, 156, 62, 34, 0, 9300, 0.9));
const DISH_INNER = smooth(roundRectPts(pr, 143, 50, 26, -3, 9360, 0.7)); // 内側の底のふち（少し低い）

// ── 豆腐（4つの立方体。左奥から右手前へ、すき間を少しだけあけて一列） ──
const TOFU_U = [-99, -33, 33, 99];
const HS = 28; // 立方体の半分の幅（床の面）
const TH_Z = 38; // 高さ（絵の座標）
const TOFU = TOFU_U.map((u, i) => {
  const s = 9400 + i * 40;
  const bfl = pr(u - HS, HS); // 下・手前・左
  const bfr = pr(u + HS, HS); // 下・手前・右
  const bbr = pr(u + HS, -HS); // 下・奥・右
  const bbl = pr(u - HS, -HS);
  const tfl = pr(u - HS, HS, TH_Z);
  const tfr = pr(u + HS, HS, TH_Z);
  const tbr = pr(u + HS, -HS, TH_Z);
  const tbl = pr(u - HS, -HS, TH_Z);
  return {
    topFace: polygon([tbl, tbr, tfr, tfl]),
    front: polygon([tfl, tfr, bfr, bfl]),
    right: polygon([tfr, tbr, bbr, bfr]),
    // 水彩の塗り：形全体（外の輪郭）と、手前と右の側面（もう1段重ねる陰）
    whole: polygon([tbl, tbr, bbr, bfr, bfl, tfl]),
    sides: polygon([tfl, tfr, tbr, bbr, bfr, bfl]),
    // 上の面の白い抜け（左奥のすみ寄り）
    hole: [...pr(u - 15, -14, TH_Z), 3.2, 1.6] as const,
    // 上の面（太い線）
    top: [line(tfl, tfr, s, 0.5, 2), line(tfr, tbr, s + 4, 0.4, 1), line(tbr, tbl, s + 8, 0.5, 2), line(tbl, tfl, s + 12, 0.4, 1)],
    // 手前と右の側面（細い線）
    side: [
      line(tfl, bfl, s + 16, 0.4, 1),
      line(bfl, bfr, s + 20, 0.5, 2),
      line(tfr, bfr, s + 24, 0.3, 1),
      line(bfr, bbr, s + 28, 0.4, 1),
      line(bbr, tbr, s + 32, 0.4, 1),
    ],
  };
});

// ── 肉みそ（豆腐の上の面のまん中に、こんもり。ひき肉の小さなかたまりが集まった形） ──
const MR = 21; // 山の下のふちの半径（床の面。上の面の半分の幅は 28）
const MH = 15; // 盛り上がりの高さ
const CRUMBS = 24; // かたまりの数（1つの山）
type Crumb = { d: string; depth: number; dark: boolean };
const MISO = TOFU_U.map((u, i) => {
  const s = 9600 + i * 50;
  // 下の濃い山（かたまりのすき間から見える色。輪郭は細かいでこぼこ）
  const base: P[] = [];
  const n = 36;
  for (let j = 0; j <= n; j++) {
    const t = (PI * 2 * j) / n;
    const bump = 1 + 0.07 * Math.sin(13 * t + i) + jitter(s + j) * 0.05;
    const gu = MR * bump * Math.cos(t);
    const gv = MR * bump * Math.sin(t);
    // 奥半分は盛り上がりの頂上の線まで持ち上げる（山の後ろの輪郭）
    const lift = Math.sin(t) < 0 ? MH * Math.pow(-Math.sin(t), 0.6) * 0.95 : 0;
    base.push(pr(u + gu, gv, TH_Z + lift));
  }
  // ひき肉のかたまり（ひまわりの種のように、まん中から外へ並べる。高さは山の形に合わせる）
  const crumbs: Crumb[] = [];
  for (let k = 0; k < CRUMBS; k++) {
    const rr = (MR - 2.5) * Math.sqrt((k + 0.5) / CRUMBS);
    const a = k * 2.39996 + i * 0.7;
    const gu = rr * Math.cos(a);
    const gv = rr * Math.sin(a);
    const h = MH * (1 - (rr / MR) ** 2) + 1.5;
    const [cx, cy] = pr(u + gu, gv, TH_Z + h);
    const r = 3.7 + jitter(s + 200 + k) * 0.8;
    const pts: P[] = Array.from({ length: 9 }, (_, j) => {
      const t = (PI * 2 * j) / 8;
      const w = 1 + 0.16 * Math.sin(3 * t + k) + jitter(s + 300 + k * 9 + (j % 8)) * 0.08;
      return [cx + r * w * Math.cos(t), cy + r * 0.82 * w * Math.sin(t)] as const;
    });
    crumbs.push({ d: smooth(pts), depth: cy, dark: k % 3 === 1 });
  }
  crumbs.sort((a, b) => a.depth - b.depth); // 奥のかたまりから描く
  // てかり（明るい小さな点。左上から光が当たる所に3つ）
  const shine: P[] = [
    pr(u - 6, -4, TH_Z + MH * 0.95),
    pr(u + 5, 5, TH_Z + MH * 0.8),
    pr(u - 12, 6, TH_Z + MH * 0.55),
  ];
  return { base: polygon(base), crumbs, shine, top: pr(u, 0, TH_Z + MH) };
});

// ── ねぎ（小口切りの輪。肉みその上に 5個ずつ。いくつかは豆腐の上とお皿にこぼれる） ──
// 輪1つ：床の面に寝かせた輪を、少しずつ違う向きに傾けた、だ円
function negiRing(x: number, y: number, r: number, tilt: number, seed: number) {
  const pts: P[] = Array.from({ length: 11 }, (_, j) => {
    const t = -0.2 + ((PI * 2 + 0.4) * j) / 10;
    const rr = r * (1 + jitter(seed + (j % 10)) * 0.06);
    const ex = rr * Math.cos(t);
    const ey = rr * 0.8 * Math.sin(t);
    return [x + ex * Math.cos(tilt) - ey * Math.sin(tilt), y + ex * Math.sin(tilt) + ey * Math.cos(tilt)] as const;
  });
  return { line: smooth(pts), fill: polygon(pts) };
}
const NEGI_R = 4.5;
// 肉みその頂上からの位置（絵の座標）と傾き
const NEGI_ON: readonly (readonly [number, number, number])[] = [
  [-10, 3, 0.3],
  [1, -3, -0.4],
  [11, 4, 0.6],
  [-3, 10, -0.1],
  [8, 13, 0.9],
];
const NEGI_TOP = MISO.map(({ top: [tx, ty] }, i) =>
  NEGI_ON.map(([dx, dy, a], k) => {
    // 豆腐ごとに少しずつ置き方を変える
    const ox = dx + jitter(9700 + i * 13 + k) * 1.5;
    const oy = dy + jitter(9760 + i * 13 + k) * 1.6;
    return negiRing(tx + ox, ty + oy, NEGI_R + jitter(9820 + i * 7 + k) * 0.4, a + i * 0.5, 9850 + i * 40 + k * 11);
  }),
);
// こぼれたねぎ（豆腐の上の面のすみ・お皿の上の手前）
const NEGI_SPILL = [
  negiRing(...pr(-99 - 20, 18, TH_Z), 4.3, 0.2, 9950),
  negiRing(...pr(33 + 19, -20, TH_Z), 4.3, -0.5, 9960),
  negiRing(...pr(-60, 50), 4.3, 0.4, 9970),
  negiRing(...pr(68, 52), 4.3, -0.3, 9980),
  negiRing(...pr(128, 32), 4.3, 0.8, 9990),
];

// ── たれ（オレンジ茶色の油。お皿の上の豆腐のまわりと、豆腐の上の面の肉みそのまわり） ──
const TARE_POOL = polygon(groundBlob(0, 8, 134, 40, 0, 9800, 0.1));
// 少し濃いたまり（豆腐の手前・すき間のあたり）
const TARE_DEEP = [
  polygon(groundBlob(-66, 30, 22, 9, 0, 9810, 0.18, 20)),
  polygon(groundBlob(0, 33, 26, 8, 0, 9820, 0.18, 20)),
  polygon(groundBlob(66, 32, 22, 9, 0, 9830, 0.18, 20)),
  polygon(groundBlob(124, 14, 12, 14, 0, 9840, 0.18, 20)),
];
const TARE_TOP = TOFU_U.map((u, i) => polygon(groundBlob(u + 1, 2, 25, 23, TH_Z, 9850 + i * 9, 0.08, 24)));
// お皿の上のたれの白い抜け（豆腐の手前の、見える所に2つ）
const TARE_HOLES = [
  [...pr(-100, 40), 4, 1.8],
  [...pr(36, 43), 3.6, 1.6],
] as const;

// ── 動きの段（anim の from・to。4〜60。scenes.css の「名物の欄の決まり」） ──
// 主役は、肉みそが1つずつ、少し上からふわっとのる所（28〜48.5 ＝ 全体の約 4 割弱）。段のあいだに短い間
const T = {
  dishOut: [4, 11], // お皿のふちの外が描かれる
  dishIn: [6, 13], // ふちの内
  tofu: [14, 19], // （間）豆腐が置かれる（1つ目。1つずつ 2.5 ずらす。4つ目は 21.5〜26.5）
  miso: [28, 35], // （間）肉みそがのる（1つ目。1つずつ MISO_STEP ずらす。4つ目は 41.5〜48.5）
  negi: [50, 53], // （間）ねぎが散る（輪ごとに 0.2 ずらす）
  tare: [53, 60], // たれがじわっと出る（始まりを 0.5 ずつずらす。終わりは 60 にそろえる。完成）
} as const;
const MISO_STEP = 4.5;
// 線のいちばん下は、絵の場所の上から 78.6%。主役が時間で動くとき (13.5 × 0.045 + 7 × 0.05) × 1.45 ≒ 1.4 秒
const CARD = cardTiming({ ink: 0.8, time: 1.45 });

// ねぎが散る動き（輪ごとに少しずつ遅らせる）
const negiAnim = (n: number) => animAt("scene-pop", T.negi, {}, n * 0.2);
// たれがじわっと出る動き（いちばん最後）
const tareAnim = (n: number) => anim("hiyayakko-spread", T.tare[0] + n * 0.5, T.tare[1]);

export default function HiyayakkoIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="34 112 332 332"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 332 / 400, ...CARD } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。絵の中で使い回す。ムラの幅は少し広く） */}
        <WashFilter id="hiyayakko-wash" seed={7} wide />
      </defs>

      {/* 1. お皿（線だけ。ふちの外側 → 内側の順に描かれる） */}
      <g className="hiyayakko-dish">
        <path d={DISH_OUTER} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.dishOut)} />
        <path d={DISH_INNER} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={animAt("scene-draw", T.dishIn)} />
      </g>

      {/* 5. たれ（お皿の上の水彩。いちばん最後にじわっと出る。豆腐の後ろに置く） */}
      <g className="hiyayakko-tare">
        <g className="scene-anim" style={tareAnim(0)}>
          <Wash filter="hiyayakko-wash" d={TARE_POOL} tone="food-wash-tare" id="hiyayakko-w-pool" shift={[1.25, 1]} holes={TARE_HOLES} />
        </g>
        {TARE_DEEP.map((d, k) => (
          <g key={k} className="scene-anim" style={tareAnim(1 + k)}>
            <Wash filter="hiyayakko-wash" d={d} tone="food-wash-tare-pale" id={`hiyayakko-w-deep-${k}`} shift={[0.75, 0.5]} />
          </g>
        ))}
      </g>

      {/* 2. 豆腐（左奥から右手前へ、1つずつ上から置かれる。手前のものほど後に描くので、奥の豆腐に重なる）。
          豆腐ごとに、上の面のたれ・肉みそ・ねぎを重ねる（手前の豆腐が奥の豆腐の上の物を正しく隠すように） */}
      {TOFU.map((t, i) => (
        <g key={i}>
          <g className="hiyayakko-tofu scene-anim" style={animAt("scene-fade-up", T.tofu, { "--dy": "-14px" }, i * 2.5)}>
            {/* 後ろの線とたれを隠す紙の色 → 水彩（形全体 → 側面にもう1段）→ 線 */}
            <path d={t.topFace} className="scene-paper" stroke="none" />
            <path d={t.front} className="scene-paper" stroke="none" />
            <path d={t.right} className="scene-paper" stroke="none" />
            <g>
              <Wash filter="hiyayakko-wash" d={t.whole} tone="food-wash-tofu" id={`hiyayakko-w-tofu-${i}`} shift={[1, 0.75]} holes={[t.hole]} />
              <Wash filter="hiyayakko-wash" d={t.sides} tone="food-wash-tofu" id={`hiyayakko-w-side-${i}`} shift={[0.75, 0.75]} />
            </g>
            {t.side.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
            {t.top.map((d, k) => (
              <path key={k} d={d} className="scene-line" />
            ))}
          </g>

          {/* 5. たれ（豆腐の上の面の、肉みそのまわり。うすいほうの水彩） */}
          <g className="hiyayakko-tare scene-anim" style={tareAnim(5 + i)}>
            <Wash filter="hiyayakko-wash" d={TARE_TOP[i]} tone="food-wash-tare-pale" id={`hiyayakko-w-top-${i}`} shift={[0.75, 0.5]} />
          </g>

          {/* 3. 肉みそ（茶色の山 → ひき肉のかたまりを同じ色でうすく重ねる → てかり）。少し上からふわっとのる */}
          <g className="hiyayakko-miso scene-anim" stroke="none" style={animAt("scene-fade-up", T.miso, { "--dy": "-10px" }, i * MISO_STEP)}>
            <g>
              <Wash filter="hiyayakko-wash" d={MISO[i].base} tone="food-wash-kakuni" id={`hiyayakko-w-miso-${i}`} shift={[0.75, 0.6]} />
              <g className="food-wash-miso-crumb" transform="translate(0.6 0.5)" filter="url(#hiyayakko-wash)">
                {MISO[i].crumbs.map((c, k) => (
                  <path key={k} d={c.d} className={c.dark ? "wash wash-crumb-dark" : "wash"} />
                ))}
              </g>
            </g>
            {MISO[i].shine.map(([x, y], k) => (
              <circle key={k} cx={x} cy={y} r={k === 0 ? 1.7 : 1.3} className="hiyayakko-miso-shine" />
            ))}
          </g>

          {/* 4. ねぎ（肉みその上に 5個ずつ。中の水彩 → 緑の輪） */}
          <g className="hiyayakko-negi">
            <g>
              {NEGI_TOP[i].map((n, k) => (
                <g key={k} className="scene-anim" style={negiAnim(i * 5 + k)}>
                  <Wash filter="hiyayakko-wash" d={n.fill} tone="food-wash-negi" id={`hiyayakko-w-negi-${i}-${k}`} shift={[0.4, 0.3]} line={1.5} />
                </g>
              ))}
            </g>
            {NEGI_TOP[i].map((n, k) => (
              <g key={k} className="scene-anim" style={negiAnim(i * 5 + k)}>
                <path d={n.line} className="hiyayakko-negi-ring" />
              </g>
            ))}
          </g>
        </g>
      ))}

      {/* 4. こぼれたねぎ（豆腐の上の面のすみと、お皿の上） */}
      <g className="hiyayakko-negi">
        <g>
          {NEGI_SPILL.map((n, k) => (
            <g key={k} className="scene-anim" style={negiAnim(20 + k)}>
              <Wash filter="hiyayakko-wash" d={n.fill} tone="food-wash-negi" id={`hiyayakko-w-spill-${k}`} shift={[0.4, 0.3]} line={1.5} />
            </g>
          ))}
        </g>
        {NEGI_SPILL.map((n, k) => (
          <g key={k} className="scene-anim" style={negiAnim(20 + k)}>
            <path d={n.line} className="hiyayakko-negi-ring" />
          </g>
        ))}
      </g>
    </svg>
  );
}
