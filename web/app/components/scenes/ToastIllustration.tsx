// ─── ビールとチューハイの乾杯の線画 ───
// トップの「宴」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
//   （ジョッキ・泡・グラス・氷・レモンにだけ、重なった後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（チューハイのグラスのふちのレモンの輪切り）
// ・手は描かない（グラスだけ）
// ・部品ごとに g でまとめる：ジョッキ（toast-mug）・泡（toast-foam）・泡のしぶき（toast-splash）・
//   グラス（toast-glass）・氷（toast-ice）・グラスの中の泡の粒（toast-bubbles）・レモン（toast-lemon）・
//   カチンの線（toast-clink）
// ・ジョッキとグラスは、まっすぐ立てた形で描き、外側の g の rotate で少し内側へ傾けて、
//   上のほうでぶつかる形にする（動き終わりの形。ジョッキの右上のふちが、グラスの左上の側面に当たる）
// ・動きの順番：ジョッキとグラスが左右の外側から寄ってくる → 少し内側へ傾き、上のほうでぶつかる →
//   ビールの泡がふわっとはねる（泡のしぶきの小さな輪が出る）→ ぶつかった所の上に「カチン」の線が出る →
//   チューハイの中の泡の粒が下から上へ少し上がる
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, jitter, line, polygon, ring, smooth, type P } from "./draw";

// 傾き（度）。ジョッキは右へ、グラスは左へ（どちらも内側へ）。支点はそれぞれの底のまん中
const MUG_TILT = 8;
const MUG_PIVOT: P = [120, 260];
const GLASS_TILT = -8;
const GLASS_PIVOT: P = [282, 330];

// ── ジョッキ（まっすぐ立てた形。取っ手は外側＝左） ──
const MUG_OUTLINE: readonly P[] = [
  [62, 72],
  [63, 160],
  [64, 248],
  [70, 259],
  [120, 260],
  [170, 259],
  [176, 248],
  [177, 160],
  [178, 72],
];
const MUG_FILL = polygon(MUG_OUTLINE);
const MUG = [
  smooth(MUG_OUTLINE.map(([x, y], i) => [x + jitter(8000 + i) * 0.6, y] as const)),
  line([62, 72], [177, 72], 8010, 0.5, 3), // ふち
  // 取っ手（外と内の2本）
  smooth([
    [63, 98],
    [36, 101],
    [22, 128],
    [22, 186],
    [34, 214],
    [64, 218],
  ]),
  smooth([
    [63, 118],
    [44, 121],
    [38, 146],
    [39, 180],
    [46, 196],
    [64, 198],
  ]),
];
const MUG_FINE = [
  line([67, 244], [173, 244], 8020, 0.5, 2), // 底の厚み
  // ガラスの面（縦の筋）
  line([94, 116], [95, 230], 8030, 0.6, 2),
  line([120, 118], [120, 232], 8035, 0.6, 2),
  line([146, 116], [145, 230], 8040, 0.6, 2),
  // ビールの線（泡とビールの境）
  line([65, 98], [175, 98], 8050, 1, 4),
];

// ── 泡（ふちの上にもこもこと盛り上がる。左はふちより少し外へはみ出し、右はぶつかる所の手前で下がる） ──
const FOAM_TOP: readonly P[] = [
  [60, 74],
  [53, 62],
  [61, 48],
  [78, 47],
  [90, 35],
  [110, 38],
  [128, 28],
  [148, 35],
  [164, 37],
  [176, 52],
  [178, 73],
];
const FOAM_FILL = polygon([...FOAM_TOP, [178, 74], [60, 74]]);
const FOAM = [smooth(FOAM_TOP.map(([x, y], i) => [x, y + jitter(8100 + i) * 0.8] as const))];
// 外側（左）へたれる泡
const FOAM_FINE = [
  smooth([
    [62, 70],
    [58, 82],
    [61, 90],
    [66, 85],
    [66, 74],
  ]),
];

// ── 泡のしぶき（小さな輪。泡の上。カチンの線と重ならないよう、まん中より左に） ──
const SPLASH: readonly [number, number, number][] = [
  [128, 14, 3.2],
  [144, 8, 2.6],
  [112, 18, 2.2],
  [98, 26, 2.4],
];

// ── グラス（背の高い、まっすぐなグラス。まっすぐ立てた形） ──
const GLASS_SIDE_L = line([244, 62], [246, 320], 8200, 0.6, 3);
const GLASS_SIDE_R = line([320, 62], [318, 320], 8210, 0.6, 3);
const GLASS_BOTTOM = smooth([
  [246, 320],
  [251, 329],
  [282, 330],
  [313, 329],
  [318, 320],
]);
const GLASS_FILL = polygon([
  [244, 60],
  [320, 60],
  [318, 320],
  [313, 329],
  [251, 329],
  [246, 320],
]);
const GLASS = [GLASS_SIDE_L, GLASS_SIDE_R, GLASS_BOTTOM, ring(282, 61, 38, 5, 8220, 0.4)];
const GLASS_FINE = [
  line([248, 312], [316, 312], 8230, 0.4, 2), // 底の厚み
  line([246, 88], [318, 88], 8240, 0.8, 4), // チューハイの水面
  line([308, 214], [307, 296], 8250, 0.4, 1), // ガラスの照り
];

// ── 氷（3個。角の丸い四角を少しずつ傾ける） ──
function ice(cx: number, cy: number, s: number, deg: number, seed: number) {
  const t = (deg * PI) / 180;
  const rot = ([x, y]: P): P => [cx + x * Math.cos(t) - y * Math.sin(t), cy + x * Math.sin(t) + y * Math.cos(t)];
  const h = s / 2;
  const corners: P[] = [
    [-h, -h],
    [h, -h],
    [h, h],
    [-h, h],
  ];
  const pts: P[] = [];
  for (let c = 0; c < 4; c++) {
    const p0 = corners[c];
    const p1 = corners[(c + 1) % 4];
    for (const u of [0.18, 0.5, 0.82]) {
      pts.push(rot([p0[0] + (p1[0] - p0[0]) * u + jitter(seed + c * 3) * 0.6, p0[1] + (p1[1] - p0[1]) * u]));
    }
  }
  pts.push(pts[0], pts[1]);
  return {
    fill: polygon(pts),
    outline: smooth(pts),
    // 氷の照り（左上の角の近くに短い線）
    shine: line(rot([-h * 0.55, -h * 0.15]), rot([-h * 0.15, -h * 0.55]), seed + 20, 0.2, 1),
  };
}
const ICE = [ice(266, 112, 26, 12, 8300), ice(298, 138, 24, -16, 8330), ice(270, 166, 25, 24, 8360)];

// ── グラスの中の泡の粒（下のほう） ──
const BUBBLES: readonly [number, number, number][] = [
  [262, 214, 2.4],
  [298, 226, 2.2],
  [276, 252, 2.6],
  [302, 270, 2],
  [258, 282, 2.2],
  [286, 296, 2.4],
];

// ── レモンの輪切り（差し色。グラスのふちの外側に掛ける。輪と、放射状の線） ──
const LEMON_C: P = [318, 64];
const LEMON_R = 21;
const LEMON = [
  ring(LEMON_C[0], LEMON_C[1], LEMON_R, LEMON_R, 8400, 0.4), // 皮
  ring(LEMON_C[0], LEMON_C[1], LEMON_R - 4.5, LEMON_R - 4.5, 8410, 0.3), // 皮の内側
];
const LEMON_SPOKES = Array.from({ length: 8 }, (_, i) => {
  const t = (i / 8) * PI * 2 + 0.2;
  const r0 = 3;
  const r1 = LEMON_R - 7;
  return line(
    [LEMON_C[0] + r0 * Math.cos(t), LEMON_C[1] + r0 * Math.sin(t)],
    [LEMON_C[0] + r1 * Math.cos(t), LEMON_C[1] + r1 * Math.sin(t)],
    8420 + i * 3,
    0.2,
    1,
  );
});

// ── カチン（ぶつかった所の上に、外へ向かう短い線3本。ぶつかった所の近くから描く） ──
const CLINK = [
  line([205, 40], [197, 19], 8500, 0.4, 1),
  line([214, 36], [216, 12], 8510, 0.4, 1),
  line([224, 42], [240, 26], 8520, 0.4, 1),
];

export default function ToastIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-30 -6 400 352"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ジョッキ：左の外側から寄ってくる → 内側へ傾く */}
      <g className="scene-anim" style={anim("scene-slide-in", 4, 20, { "--dx": "-72px", "--rot": "0deg" })}>
        <g
          className="toast-tilt scene-anim"
          style={anim("toast-tilt", 18, 30, { "--tilt": `${-MUG_TILT}deg`, "--o": "50% 100%" })}
        >
          <g transform={`rotate(${MUG_TILT} ${MUG_PIVOT[0]} ${MUG_PIVOT[1]})`}>
            <g className="toast-mug">
              <path d={MUG_FILL} className="scene-paper" stroke="none" />
              {MUG_FINE.map((d, i) => (
                <path key={i} d={d} className="scene-fine" />
              ))}
              {MUG.map((d, i) => (
                <path key={i} d={d} className="scene-line" />
              ))}
            </g>
            <g className="toast-foam scene-anim" style={anim("toast-bounce", 28, 38, { "--o": "50% 100%" })}>
              <path d={FOAM_FILL} className="scene-paper" stroke="none" />
              {FOAM.map((d, i) => (
                <path key={i} d={d} className="scene-line" />
              ))}
              {FOAM_FINE.map((d, i) => (
                <path key={i} d={d} className="scene-fine" />
              ))}
            </g>
            <g className="toast-splash">
              {SPLASH.map(([x, y, r], i) => (
                <g key={i} className="scene-anim" style={anim("scene-pop", 29 + i * 1.5, 37 + i * 1.5)}>
                  <circle cx={x} cy={y} r={r} className="scene-fine" />
                </g>
              ))}
            </g>
          </g>
        </g>
      </g>

      {/* グラス：右の外側から寄ってくる → 内側へ傾く（ぶつかる所はグラスがジョッキの手前） */}
      <g className="scene-anim" style={anim("scene-slide-in", 4, 20, { "--dx": "72px", "--rot": "0deg" })}>
        <g
          className="toast-tilt scene-anim"
          style={anim("toast-tilt", 18, 30, { "--tilt": `${-GLASS_TILT}deg`, "--o": "50% 100%" })}
        >
          <g transform={`rotate(${GLASS_TILT} ${GLASS_PIVOT[0]} ${GLASS_PIVOT[1]})`}>
            <g className="toast-glass">
              <path d={GLASS_FILL} className="scene-paper" stroke="none" />
              {GLASS_FINE.map((d, i) => (
                <path key={i} d={d} className="scene-fine" />
              ))}
            </g>
            <g className="toast-bubbles">
              {BUBBLES.map(([x, y, r], i) => (
                <g
                  key={i}
                  className="scene-anim"
                  style={anim("scene-fade-up", 38 + (i % 3) * 2, 50 + (i % 3) * 2, { "--dy": "22px" })}
                >
                  <circle cx={x} cy={y} r={r} className="scene-fine" />
                </g>
              ))}
            </g>
            <g className="toast-ice">
              {ICE.map((c, i) => (
                <g key={i}>
                  <path d={c.fill} className="scene-paper" stroke="none" />
                  <path d={c.outline} className="scene-fine" />
                  <path d={c.shine} className="scene-fine" />
                </g>
              ))}
            </g>
            <g className="toast-glass">
              {GLASS.map((d, i) => (
                <path key={i} d={d} className="scene-line" />
              ))}
            </g>
            {/* 差し色（accent）はここだけ：レモンの輪切り */}
            <g className="toast-lemon">
              <circle cx={LEMON_C[0]} cy={LEMON_C[1]} r={LEMON_R} className="scene-paper" stroke="none" />
              {LEMON.map((d, i) => (
                <path key={i} d={d} className="scene-line scene-accent" />
              ))}
              {LEMON_SPOKES.map((d, i) => (
                <path key={i} d={d} className="scene-fine scene-accent" />
              ))}
            </g>
          </g>
        </g>
      </g>

      <g className="toast-clink">
        {CLINK.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 32 + i, 40 + i)}
          />
        ))}
      </g>
    </svg>
  );
}
