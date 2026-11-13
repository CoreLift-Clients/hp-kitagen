// ─── 肉みそ冷奴の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の陸（肉みそ冷奴）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：横長の角の丸い焼き物の皿に、小さな四角い豆腐が4つ、
// 左奥から右手前へ斜めに一列。豆腐1つ1つに肉みそがこんもりのり、その上に小口切りのねぎ。豆腐のまわりに少したれ。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （豆腐とねぎの輪にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（肉みそ。線を accent にし、面を accent でうすく塗る。scenes.css の .scene-accent-wash）
// ・部品ごとに g でまとめる：お皿（hiyayakko-dish）・たれ（hiyayakko-tare）・豆腐（hiyayakko-tofu）・
//   肉みそ（hiyayakko-miso）・ねぎ（hiyayakko-negi）
// ・見る角度は少し斜め上から。お皿と豆腐の並びは、床の面の上で少し回してから縦につぶして描く（pr()）。
//   豆腐は上の面（太い線）と、手前・右の側面（細い線）を描き分ける
// ・動きの順番：お皿のふちが描かれる → 豆腐が左奥から1つずつ置かれる → 肉みそが1つずつ、少し上からふわっとのる
//   → ねぎが散る（1つずつぽんと出る）→ たれの広がりが描かれる
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// ・絵は viewBox を 332 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, jitter, line, polygon, smooth, type P } from "./draw";

// ── 見る角度（床の面の点 u・v を、絵の座標にする） ──
// u … お皿の長い向き（左奥 → 右手前）、v … 短い向き（奥 → 手前）、z … 高さ
const CX = 200;
const CY = 296;
const TH = 0.68; // 床の面での回し（ラジアン）。お皿と豆腐の並びが、左上から右下へ少し斜めになる
const SQ = 0.58; // 縦のつぶし（少し斜め上から見る）
const COS = Math.cos(TH);
const SIN = Math.sin(TH);
const pr = (u: number, v: number, z = 0): P => [CX + u * COS - v * SIN, CY + (u * SIN + v * COS) * SQ - z];

// ── お皿（横長の、角の丸い長方形。ふちの外側と内側の線 2本で厚みを表す） ──
// 角の丸い長方形のまわりの点（床の面）。書き始めと書き終わりを少し重ねて、筆で描いた輪にする
function roundRectPts(hl: number, hw: number, r: number, z: number, seed: number, amp: number): P[] {
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
    // 次の角までの辺のまん中に1点（辺がふくらまないように）
    const [nx, ny, nt] = corners[(k + 1) % 4];
    const a: [number, number] = [cx + r * Math.cos(t0 + PI / 2), cy + r * Math.sin(t0 + PI / 2)];
    const b: [number, number] = [nx + r * Math.cos(nt), ny + r * Math.sin(nt)];
    ground.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
  });
  // 重ね：最初の2点をもう一度
  ground.push(ground[0], ground[1]);
  return ground.map(([u, v], i) => {
    const [x, y] = pr(u, v, z);
    return [x + jitter(seed + i) * amp, y + jitter(seed + i + 50) * amp * 0.6] as const;
  });
}
const DISH_OUTER = smooth(roundRectPts(156, 62, 34, 0, 9300, 0.9));
const DISH_INNER = smooth(roundRectPts(143, 50, 26, -3, 9360, 0.7)); // 内側の底のふち（少し低い）

// ── 豆腐（4つの立方体。左奥から右手前へ、少しすき間をあけて一列） ──
const TOFU_U = [-102, -34, 34, 102];
const HS = 25; // 立方体の半分の幅（床の面）
const TH_Z = 40; // 高さ（絵の座標）
const TOFU = TOFU_U.map((u, i) => {
  const s = 9400 + i * 40;
  const bfl = pr(u - HS, HS); // 下・手前・左
  const bfr = pr(u + HS, HS); // 下・手前・右
  const bbr = pr(u + HS, -HS); // 下・奥・右
  const tfl = pr(u - HS, HS, TH_Z);
  const tfr = pr(u + HS, HS, TH_Z);
  const tbr = pr(u + HS, -HS, TH_Z);
  const tbl = pr(u - HS, -HS, TH_Z);
  return {
    fill: polygon([tbl, tbr, bbr, bfr, bfl, tfl]),
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

// ── 肉みそ（豆腐の上の面に、こんもり。上の面からはみ出さない大きさ） ──
const MR = 20; // 下のふちの半径（床の面。上の面の内側の円は 25）
const MH = 17; // 盛り上がりの高さ
const MISO = TOFU_U.map((u, i) => {
  const [mx, my] = pr(u, 0, TH_Z);
  const s = 9600 + i * 30;
  const pts: P[] = [];
  // 山（左 → 右）。ごつごつさせる
  const n = 14;
  for (let j = 0; j <= n; j++) {
    const t = PI + (PI * j) / n;
    const w = 1 + 0.06 * Math.sin(j * 2.6 + i * 1.7) + jitter(s + j) * 0.05;
    pts.push([mx + MR * Math.cos(t) * (0.97 + 0.03 * w), my + (MR * SQ * 0.4 + MH) * w * Math.sin(t)]);
  }
  // 下のふち（右 → 左）。上の面にのる、手前の弧
  for (let j = 1; j <= 4; j++) {
    const t = (PI * j) / 5;
    pts.push([mx + MR * Math.cos(t), my + MR * SQ * Math.sin(t)]);
  }
  pts.push(pts[0]);
  return { fill: polygon(pts), line: smooth(pts), at: [mx, my] as P };
});

// ── ねぎ（小口切りの輪。肉みその上に 2〜3個ずつ。小さいカードでも輪に見える大きさ） ──
// 肉みその下のふちの中心からの位置
const NEGI_OFF: readonly (readonly P[])[] = [
  [
    [-7, -12],
    [8, -17],
  ],
  [
    [-9, -10],
    [6, -18],
    [9, -4],
  ],
  [
    [-6, -16],
    [9, -9],
  ],
  [
    [-10, -9],
    [5, -18],
    [8, -4],
  ],
];
const NEGI_R = 7.2;
const NEGI = MISO.flatMap(({ at: [mx, my] }, i) =>
  NEGI_OFF[i].map(([dx, dy], k) => {
    const x = mx + dx;
    const y = my + dy;
    const pts: P[] = Array.from({ length: 10 }, (_, j) => {
      const t = -0.25 + ((PI * 2 + 0.5) * j) / 9;
      const r = NEGI_R + jitter(9700 + i * 10 + k * 3 + (j % 9)) * 0.4;
      return [x + r * Math.cos(t), y + r * 0.78 * Math.sin(t)] as const;
    });
    return { line: smooth(pts), fill: polygon(pts) };
  }),
);

// ── たれ（お皿の上、豆腐の下のあたりに広がる、ゆるい曲線のふち） ──
// 見えるのは豆腐の手前と両はしのふちだけなので、手前のふちだけを1本の線で描く。
// 書き始めと書き終わりは、左はしと右はしの豆腐の下（豆腐の塗りで隠れる）に置く
const TARE_PTS: P[] = Array.from({ length: 21 }, (_, j) => {
  const t = PI + 0.45 - ((PI + 0.9) * j) / 20; // 左奥 → 手前 → 右奥
  const w = 1 + 0.16 * Math.sin(7 * t + 0.8) + jitter(9800 + j) * 0.04;
  const u = 132 * Math.cos(t);
  const v = 32 * w * Math.sin(t) + 3;
  return pr(u, v);
});
const TARE = smooth(TARE_PTS);

export default function HiyayakkoIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="34 112 332 332"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 332 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 1. お皿（ふちの外側 → 内側の順に描かれる） */}
      <g className="hiyayakko-dish">
        <path d={DISH_OUTER} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 4, 14)} />
        <path d={DISH_INNER} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 8, 17)} />
      </g>

      {/* 5. たれ（いちばん最後に描かれる。豆腐の後ろに置き、両はしは豆腐の下に隠れる） */}
      <g className="hiyayakko-tare">
        <path d={TARE} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 54, 60)} />
      </g>

      {/* 2. 豆腐（左奥から右手前へ、1つずつ上から置かれる。手前のものほど後に描くので、奥の豆腐に重なる） */}
      <g className="hiyayakko-tofu">
        {TOFU.map((t, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 17 + i * 4, 23 + i * 4, { "--dy": "-14px" })}>
            <path d={t.fill} className="scene-paper" stroke="none" />
            {t.side.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
            {t.top.map((d, k) => (
              <path key={k} d={d} className="scene-line" />
            ))}
          </g>
        ))}
      </g>

      {/* 3. 差し色（accent）はここだけ：肉みそ（線は accent、面はうすい accent）。1つずつ、少し上からふわっとのる */}
      <g className="hiyayakko-miso">
        {MISO.map((m, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 33 + i * 3, 39 + i * 3, { "--dy": "-10px" })}>
            <path d={m.fill} className="scene-accent-wash" stroke="none" />
            <path d={m.line} className="scene-line scene-accent" />
          </g>
        ))}
      </g>

      {/* 4. ねぎ（輪の中は紙の色で塗り、肉みその上で輪に見せる） */}
      <g className="hiyayakko-negi">
        {NEGI.map((n, i) => (
          <g key={i} className="scene-anim" style={anim("scene-pop", 44 + i, 48 + i)}>
            <path d={n.fill} className="scene-paper" stroke="none" />
            <path d={n.line} className="scene-fine" />
          </g>
        ))}
      </g>
    </svg>
  );
}
