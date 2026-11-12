// ─── 鉄鍋餃子の線画 ───
// トップの「鉄鍋餃子」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
//   （餃子にだけ、重なった後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（油はね）
// ・部品ごとに g でまとめる：鍋（teppan-pan）・取っ手（teppan-handle）・餃子6個（teppan-gyoza）・
//   油はね（teppan-splash）・湯気（teppan-steam）
// ・動きの順番：餃子が1つずつ鍋に並ぶ → 油がはねる（小さな点と短い線がぱっと出る）→ 湯気が立ちのぼる
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arc, arcPts, jitter, line, polygon, ring, smooth, steam, sway, type P } from "./draw";

// 鍋の中心と大きさ（少し上から見た丸い鉄鍋）
const CX = 180;
const CY = 226;
const RX = 140;
const RY = 58;
const DEPTH = 22; // 鍋のふちの厚み（側面の高さ）

// ── 鍋 ──
const PAN = [
  ring(CX, CY, RX, RY, 1000), // 上のふち（外）
  arc(CX, CY + 3, RX - 12, RY - 10, PI * 0.98, PI * 3.02, 26, 0.9, 1040), // ふちの内側（底との境）
  line([CX - RX, CY + 1], [CX - RX + 2, CY + DEPTH], 1080, 0.4, 1), // 左の側面
  line([CX + RX, CY + 1], [CX + RX - 2, CY + DEPTH], 1090, 0.4, 1), // 右の側面
  arc(CX, CY + DEPTH, RX - 2, RY, PI * -0.01, PI * 1.01, 18, 1, 1100), // 下のふち（手前）
];

// ── 取っ手（右に伸びる。先に吊るす穴） ──
const HANDLE = [
  line([CX + RX - 6, CY - 14], [392, CY - 40], 1200, 0.6, 2),
  line([CX + RX - 2, CY + 8], [394, CY - 18], 1210, 0.6, 2),
  smooth([
    [392, CY - 40],
    [397, CY - 32],
    [398, CY - 25],
    [394, CY - 18],
  ]),
];
const HANDLE_FINE = [ring(380, CY - 28, 5, 4, 1220, 0.3)];

// ── 餃子（6個。上から見た半月の形。弧の側にひだ） ──
// 並ぶ順（動きの順）：奥の左 → 奥の真ん中 → 奥の右 → 手前の左 → 手前の真ん中 → 手前の右
const GYOZA_AT: readonly P[] = [
  [112, 214],
  [180, 210],
  [248, 214],
  [114, 256],
  [182, 260],
  [250, 256],
];
const GW = 31; // 半分の幅
const GH = 24; // 弧の高さ

function gyoza([cx, by]: P, i: number) {
  const s = 1300 + i * 30;
  // 弧（ひだのある側）：左の端 → 上 → 右の端
  const top = arcPts(cx, by, GW, GH, PI, PI * 2, 12, 0.7, s);
  // 底（ほぼまっすぐ。少しふくらむ）
  const bottom: P[] = [
    [cx + GW, by],
    [cx + GW * 0.4, by + 4 + jitter(s + 20) * 0.6],
    [cx - GW * 0.4, by + 4 + jitter(s + 21) * 0.6],
    [cx - GW, by],
  ];
  // ひだ（弧から内へ向かう短い筋 4本）
  const pleats = [0.25, 0.42, 0.58, 0.75].map((u, k) => {
    const t = PI + PI * u;
    const x = cx + GW * Math.cos(t);
    const y = by + GH * Math.sin(t);
    return line([x, y], [x + (cx - x) * 0.18, y + 7], s + 40 + k * 3, 0.3, 1);
  });
  return {
    fill: polygon([...top, ...bottom]),
    outline: [smooth(top), smooth(bottom)],
    pleats,
  };
}
const GYOZA = GYOZA_AT.map(gyoza);

// ── 油はね（差し色。鍋のふちのまわりに小さな点と短い線） ──
const SPLASH_DOTS: readonly [number, number, number][] = [
  [62, 182, 3],
  [86, 160, 2.4],
  [292, 168, 2.8],
  [318, 190, 2.2],
  [214, 150, 2.2],
];
const SPLASH_DASHES = [
  line([48, 200], [36, 190], 1500, 0.3, 1),
  line([100, 150], [94, 138], 1505, 0.3, 1),
  line([270, 150], [276, 138], 1510, 0.3, 1),
  line([330, 172], [342, 162], 1515, 0.3, 1),
];

// ── 湯気（3本。餃子のあいだから上へ） ──
const STEAM = [steam(132, 196, 40, 0.6, 10, 1600), steam(184, 190, 8, 2.4, 12, 1620), steam(236, 196, 48, 4.2, 10, 1640)];
const STEAM_SWAY = [sway(5.2, -0.6), sway(4.6, -2.2), sway(5.9, -1.4)];

export default function TeppanIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -10 400 340"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 湯気は上のほうで薄くなる（線の色は同じ foreground のまま、濃さだけ変える） */}
        <linearGradient id="teppan-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="4">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="teppan-handle">
        {HANDLE.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {HANDLE_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="teppan-pan">
        {PAN.map((d, i) => (
          <path key={i} d={d} className={i === 1 ? "scene-fine" : "scene-line"} />
        ))}
      </g>

      {/* 湯気は餃子の後ろから立ちのぼる */}
      <g className="teppan-steam" stroke="url(#teppan-steam-fade)">
        {STEAM.map((d, i) => (
          <g key={i} className="scene-sway" style={STEAM_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-line scene-stroke-draw scene-anim"
              style={anim("scene-draw", 40 + i * 3, 56 + i * 2)}
            />
          </g>
        ))}
      </g>

      <g className="teppan-gyoza">
        {GYOZA.map((g, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 4 + i * 4, 12 + i * 4, { "--dy": "-16px" })}>
            <path d={g.fill} className="scene-paper" stroke="none" />
            {g.outline.map((d, k) => (
              <path key={k} d={d} className="scene-line" />
            ))}
            {g.pleats.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
          </g>
        ))}
      </g>

      {/* 差し色（accent）はここだけ：油はね */}
      <g className="teppan-splash">
        {SPLASH_DOTS.map(([x, y, r], i) => (
          <g key={i} className="scene-anim" style={anim("scene-pop", 32 + (i % 3) * 2, 38 + (i % 3) * 2)}>
            <circle cx={x} cy={y} r={r} className="scene-accent-fill" stroke="none" />
          </g>
        ))}
        {SPLASH_DASHES.map((d, i) => (
          <g key={i} className="scene-anim" style={anim("scene-pop", 33 + (i % 2) * 2, 39 + (i % 2) * 2)}>
            <path d={d} className="scene-fine scene-accent" />
          </g>
        ))}
      </g>
    </svg>
  );
}
