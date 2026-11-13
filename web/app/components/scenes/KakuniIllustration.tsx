// ─── 豚の角煮の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の肆（豚の角煮）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （角煮と小鉢の手前にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（からしの小さな1点）
// ・部品ごとに g でまとめる：小鉢の奥（kakuni-bowl-back）・角煮2切れ（kakuni-pieces）・からし（kakuni-karashi）・
//   小鉢の手前（kakuni-bowl-front。角煮の下のほうを隠す）・湯気（kakuni-steam）
// ・角煮は少し上から見た四角い塊（上の面・手前の面・横の面）。手前と横の面に、脂の層の線を1本ずつ
// ・動きの順番：小鉢が現れる → 角煮が1切れずつ置かれる → 湯気が2本立つ（からしは湯気と一緒にぽんと出る）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// ・絵は viewBox を 320 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, arc, arcPts, line, polygon, smooth, steam, sway, type P } from "./draw";

// 小鉢の口の中心と大きさ
const CX = 200;
const CY = 230;
const RX = 124;
const RY = 36;

// ── 小鉢 ──
// 奥：口のふちの奥の弧と、内側の段
const BOWL_BACK = [arc(CX, CY, RX, RY, PI * 0.98, PI * 2.02, 18, 0.9, 8600)];
const BOWL_BACK_FINE = [arc(CX, CY + 4, RX - 13, RY - 9, PI * 1.02, PI * 1.98, 14, 0.6, 8620)];
// 手前：口のふちの手前の弧 → 胴のふくらみ → 高台
const BODY_PTS: P[] = [
  [CX - RX, CY],
  [CX - RX + 8, CY + 46],
  [CX - 82, CY + 86],
  [CX - 30, CY + 102],
  [CX + 30, CY + 102],
  [CX + 82, CY + 86],
  [CX + RX - 8, CY + 46],
  [CX + RX, CY],
];
// 塗り：口のふちの手前の弧（右 → 左）→ 胴（左 → 右）
const BOWL_FRONT_FILL = polygon([...arcPts(CX, CY, RX, RY, 0, PI, 20, 0, 0), ...BODY_PTS]);
const BOWL_FRONT = [
  arc(CX, CY, RX, RY, PI * -0.02, PI * 1.02, 18, 0.9, 8640), // 口のふち（手前）
  smooth(BODY_PTS), // 胴
  line([CX - 40, CY + 100], [CX - 38, CY + 116], 8660, 0.3, 1), // 高台の左
  line([CX + 40, CY + 100], [CX + 38, CY + 116], 8670, 0.3, 1), // 高台の右
  arc(CX, CY + 116, 38, 6, PI * 0.02, PI * 0.98, 8, 0.4, 8680), // 高台の下
];
// 胴の飾りの線（1本）
const BOWL_FRONT_FINE = [arc(CX, CY + 30, RX - 3, RY + 8, PI * 0.08, PI * 0.92, 16, 0.7, 8700)];

// ── 角煮（2切れ）。手前の面の左上の角 (x, y) と、幅・高さ・奥行き ──
function block([x, y]: P, w: number, h: number, i: number) {
  const s = 8800 + i * 50;
  const dx = 20; // 奥行き（右上へ）
  const dy = -16;
  const fl: P = [x, y];
  const fr: P = [x + w, y + 2];
  const br: P = [x + w, y + h + 2];
  const bl: P = [x, y + h];
  const tl: P = [x + dx, y + dy];
  const tr: P = [x + w + dx, y + dy + 2];
  const sb: P = [x + w + dx, y + h + dy + 2];
  const fill = polygon([bl, fl, tl, tr, sb, br]);
  const outline = [
    line(fl, fr, s, 0.6, 2), // 手前の面の上
    line(fr, br, s + 5, 0.5, 1), // 手前の面の右
    line(br, bl, s + 10, 0.6, 2), // 手前の面の下（小鉢に隠れる）
    line(bl, fl, s + 15, 0.5, 1), // 手前の面の左
    line(fl, tl, s + 20, 0.4, 1), // 上の面の左
    line(tl, tr, s + 25, 0.6, 2), // 上の面の奥
    line(tr, fr, s + 30, 0.4, 1), // 上の面の右
    line(tr, sb, s + 35, 0.5, 1), // 横の面の奥
    line(sb, br, s + 40, 0.4, 1), // 横の面の下
  ];
  // 脂の層の線（手前の面と横の面に1本ずつ、上の面から少し下）
  const fat = [
    smooth([
      [x + 2, y + 15],
      [x + w * 0.35, y + 17],
      [x + w * 0.7, y + 15.5],
      [x + w - 1, y + 17],
    ]),
    line([x + w + 1, y + 17], [x + w + dx - 1, y + dy + 18], s + 45, 0.3, 1),
  ];
  return { fill, outline, fat };
}
// 下のほうは小鉢の口のふち（手前）に隠れて、小鉢の中に入って見える
const PIECES = [block([118, 210], 72, 60, 0), block([204, 218], 70, 58, 1)];

// ── 湯気（2本。角煮の上から） ──
const STEAM = [steam(166, 192, 64, 0.8, 10, 8900), steam(240, 198, 78, 3.2, 11, 8920)];
const STEAM_SWAY = [sway(5.1, -0.4), sway(5.8, -2.0)];

export default function KakuniIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="40 42 320 320"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 320 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 湯気は上のほうで薄くなる（線の色は同じ foreground のまま、濃さだけ変える） */}
        <linearGradient id="kakuni-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1="198" x2="0" y2="58">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="kakuni-bowl-back scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        {BOWL_BACK.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {BOWL_BACK_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      {/* 湯気は角煮の後ろから立つ */}
      <g className="kakuni-steam" stroke="url(#kakuni-steam-fade)">
        {STEAM.map((d, i) => (
          <g key={i} className="scene-sway" style={STEAM_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-line scene-stroke-draw scene-anim"
              style={anim("scene-draw", 36 + i * 4, 50 + i * 4)}
            />
          </g>
        ))}
      </g>

      <g className="kakuni-pieces">
        {PIECES.map((p, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 14 + i * 9, 24 + i * 9, { "--dy": "-36px" })}>
            <path d={p.fill} className="scene-paper" stroke="none" />
            {p.outline.map((d, k) => (
              <path key={k} d={d} className="scene-line" />
            ))}
            {p.fat.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
          </g>
        ))}
      </g>

      {/* 差し色（accent）はここだけ：からし（小鉢の内側の左に、小さく1点） */}
      <g className="kakuni-karashi scene-anim" style={anim("scene-pop", 40, 46)}>
        <circle cx="104" cy="240" r="5.5" className="scene-accent-fill" stroke="none" />
      </g>

      <g className="kakuni-bowl-front scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        <path d={BOWL_FRONT_FILL} className="scene-paper" stroke="none" />
        {BOWL_FRONT.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {BOWL_FRONT_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>
    </svg>
  );
}
