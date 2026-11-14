// ─── 肉みそ冷奴の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の陸（肉みそ冷奴）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：横長の角の丸い焼き物の皿に、白い四角い豆腐が4つ、
// 左奥から右手前へ斜めに、すき間を少しだけあけて一列。豆腐1つ1つのまん中に、こげ茶色の肉みそが、
// ひき肉のぽろぽろしたかたまりのままこんもりのり、その上に小口切りのねぎがたっぷり。
// たれ（オレンジ茶色の油）は豆腐の上の面ににじみ、お皿の上の豆腐のまわりに広がる。
// 料理の絵の決まり（scenes.css の先頭）で線画にする：
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く。輪郭は scene-line、中の線は scene-fine
// ・豆腐とお皿は線だけ（豆腐の面は、後ろの線を隠すための紙の色 --scene-paper）
// ・色を塗るのは2か所：肉みそ（こげ茶のべた。scenes.css の .food-brown。ぽろぽろした感じは、輪郭のでこぼこで表す）と、
//   ねぎ（小口切りの輪を、豆腐1つに3個。輪の線は緑 .food-negi-ring、中は緑をうすく .food-negi）
// ・部品ごとに g でまとめる：お皿（hiyayakko-dish）・豆腐（hiyayakko-tofu）・肉みそ（hiyayakko-miso）・ねぎ（hiyayakko-negi）
// ・見る角度は少し斜め上から。お皿と豆腐の並びは、床の面の上で少し回してから縦につぶして描く（pr()）
// ・動きの順番：お皿のふちが描かれる → 豆腐が左奥から1つずつ置かれる → 肉みそが1つずつ、少し上からふわっとのる
//   → ねぎが散る（1つずつぽんと出る）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）。何も動かさないときの形が、動き終わった形
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

// ── 肉みそ（豆腐の上の面のまん中に、こんもり。こげ茶のべた1つ。ぽろぽろした感じは、輪郭のでこぼこで表す） ──
const MR = 21; // 山の下のふちの半径（床の面。上の面の半分の幅は 28）
const MH = 15; // 盛り上がりの高さ
const MISO = TOFU_U.map((u, i) => {
  const s = 9600 + i * 50;
  const base: P[] = [];
  const n = 40;
  for (let j = 0; j <= n; j++) {
    const t = (PI * 2 * j) / n;
    const bump = 1 + 0.09 * Math.sin(10 * t + i) + jitter(s + (j % n)) * 0.05;
    const gu = MR * bump * Math.cos(t);
    const gv = MR * bump * Math.sin(t);
    // 奥半分は盛り上がりの頂上の線まで持ち上げる（山の後ろの輪郭）
    const lift = Math.sin(t) < 0 ? MH * Math.pow(-Math.sin(t), 0.6) * 0.95 : 0;
    base.push(pr(u + gu, gv, TH_Z + lift));
  }
  return { base: `${smooth(base)} Z`, top: pr(u, 0, TH_Z + MH) };
});

// ── ねぎ（小口切りの輪。肉みその上に 3個ずつ） ──
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
  [-9, 4, 0.3],
  [3, -3, -0.4],
  [6, 10, 0.6],
];
const NEGI_TOP = MISO.map(({ top: [tx, ty] }, i) =>
  NEGI_ON.map(([dx, dy, a], k) => {
    // 豆腐ごとに少しずつ置き方を変える
    const ox = dx + jitter(9700 + i * 13 + k) * 1.5;
    const oy = dy + jitter(9760 + i * 13 + k) * 1.6;
    return negiRing(tx + ox, ty + oy, NEGI_R + jitter(9820 + i * 7 + k) * 0.4, a + i * 0.5, 9850 + i * 40 + k * 11);
  }),
);
// ねぎが散る動き（輪ごとに少しずつ遅らせる）
const negiAnim = (n: number) => anim("scene-pop", 44 + n * 0.35, 48 + n * 0.35);
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

      {/* 2. 豆腐（左奥から右手前へ、1つずつ上から置かれる。手前のものほど後に描くので、奥の豆腐に重なる）。
          豆腐ごとに、上の面の肉みそ・ねぎを重ねる（手前の豆腐が奥の豆腐の上の物を正しく隠すように） */}
      {TOFU.map((t, i) => (
        <g key={i}>
          <g className="hiyayakko-tofu scene-anim" style={anim("scene-fade-up", 17 + i * 4, 23 + i * 4, { "--dy": "-14px" })}>
            <path d={t.topFace} className="scene-paper" stroke="none" />
            <path d={t.front} className="scene-paper" stroke="none" />
            <path d={t.right} className="scene-paper" stroke="none" />
            {t.side.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
            {t.top.map((d, k) => (
              <path key={k} d={d} className="scene-line" />
            ))}
          </g>

          {/* 3. 肉みそ（こげ茶のべた）。少し上からふわっとのる */}
          <g className="hiyayakko-miso scene-anim" stroke="none" style={anim("scene-fade-up", 33 + i * 3, 39 + i * 3, { "--dy": "-10px" })}>
            <path d={MISO[i].base} className="food-brown" />
          </g>

          {/* 4. ねぎ（肉みその上に 3個ずつ） */}
          <g className="hiyayakko-negi">
            {NEGI_TOP[i].map((n, k) => (
              <g key={k} className="scene-anim" style={negiAnim(i * 3 + k)}>
                <path d={n.fill} className="food-negi" stroke="none" />
                <path d={n.line} className="scene-fine food-negi-ring" />
              </g>
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}
