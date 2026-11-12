// ─── せいろ（自家製しゅうまい）の線画 ───
// トップの「名物」の欄の1品目（しゅうまい）で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
// ・差し色は accent を1か所だけ（まん中のしゅうまいの上の、にんじんのような点）
// ・ふたにだけ、後ろの線を隠すための塗り（欄の背景と同じ色。--scene-paper）を付ける
// ・部品ごとに g でまとめる：本体（seiro-body）・しゅうまい（seiro-shumai）・湯気（seiro-steam）・ふた（seiro-lid）。
//   重なりの順もこのとおり（湯気はふたの後ろ）。
//   動きの順番：ふた（開く）→ 湯気（下から立ちのぼる）→ しゅうまい（見える）。動きの名前と範囲はこのファイルの anim(...)、
//   動きそのもの（@keyframes）は scenes.css
// ・線の太さは scenes.css の .scene-line / .scene-fine（スマホでは絵が縮む分だけ太くする）
//
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arc, arcPts, jitter, line, polygon, ring, smooth, steam, sway, type P } from "./draw";

// ── 本体（竹のせいろの胴） ──
const BODY = [
  ring(200, 230, 150, 34, 1), // 上のふち（外）
  arc(200, 232, 139, 26, PI * 1.02, PI * 1.98, 14, 0.8, 40), // 上のふち（内側・奥）
  line([50, 231], [52.5, 321], 60), // 左の側面
  line([350, 231], [347.5, 321], 70), // 右の側面
  arc(200, 320, 148, 32, PI * -0.01, PI * 1.01, 16, 1, 80), // 下のふち（手前）
];
// 胴に巻いた竹の帯（2本）と、帯をとめる縦の綴じ目
const BODY_FINE = [
  arc(200, 262, 150, 34, PI * 0.02, PI * 0.98, 16, 0.9, 100),
  arc(200, 271, 150, 34, PI * 0.03, PI * 0.97, 16, 0.9, 120),
  ...[0.18, 0.34, 0.5, 0.66, 0.82].map((u, i) => {
    const t = PI * (1 - u);
    const x = 200 + 150 * Math.cos(t);
    const y = 262 + 34 * Math.sin(t);
    return line([x, y + 1], [x + jitter(140 + i) * 1.5, y + 8], 150 + i * 3, 0.3, 1);
  }),
];

// ── しゅうまい（3個）。上の口のひだ・中の具・胴・ひだの筋 ──
const SHUMAI_AT: readonly P[] = [
  [133, 219],
  [200, 223],
  [267, 219],
];
const SHUMAI = SHUMAI_AT.flatMap(([cx, ty], i) => {
  const s = 200 + i * 40;
  return [
    // 口のひだ（波打つ輪）
    smooth(arcPts(cx, ty, 18.5, 5.8, PI * 0.95, PI * 3.03, 40, 0.4, s, { k: 9, a: 0.14 })),
    // 中の具（奥側の小さな弧）
    arc(cx, ty + 0.5, 9, 2.6, PI * 1.12, PI * 1.88, 6, 0.3, s + 50),
    // 胴の左右（ふちの手前で切れる）
    smooth([
      [cx - 18, ty + 3],
      [cx - 24 + jitter(s + 61), ty + 14],
      [cx - 26, ty + 27],
      [cx - 25 + jitter(s + 62), ty + 38],
    ]),
    smooth([
      [cx + 18, ty + 3],
      [cx + 24 + jitter(s + 63), ty + 14],
      [cx + 26, ty + 27],
      [cx + 25 + jitter(s + 64), ty + 38],
    ]),
  ];
});
const SHUMAI_FINE = SHUMAI_AT.flatMap(([cx, ty], i) => {
  const s = 400 + i * 20;
  return [
    line([cx - 9, ty + 6], [cx - 12, ty + 22], s, 0.6, 1),
    line([cx + 1, ty + 7], [cx + 1.5, ty + 24], s + 5, 0.6, 1),
    line([cx + 10, ty + 6], [cx + 13, ty + 21], s + 10, 0.6, 1),
  ];
});

// ── ふた ──
// 塗り（後ろの線を隠す）：上面の奥の弧 → 右の側面 → 手前の下の弧 → 左の側面
const LID_FILL = polygon([...arcPts(200, 200, 153, 34, PI, PI * 2, 24, 0, 0), ...arcPts(200, 226, 153, 34, 0, PI, 24, 0, 0)]);
const LID = [
  ring(200, 200, 153, 34, 500), // 上面のふち
  line([47, 201], [47.5, 227], 540, 0.5, 1), // 左の側面
  line([353, 201], [352.5, 227], 550, 0.5, 1), // 右の側面
  arc(200, 226, 153, 34, PI * -0.01, PI * 1.01, 16, 1, 560), // 下のふち（手前）
];
// 上面の内側の枠と、編み目（横の筋）
const LID_FINE = [
  ring(200, 200, 138, 28, 600, 0.9),
  // 編み目は、ところどころ途切れる短い筋にする（まっすぐな線が並ぶと網のように見えるため）
  ...[-15, -5, 5, 14].flatMap((dy, i) => {
    const y = 200 + dy;
    const half = 138 * Math.sqrt(1 - (dy / 28) ** 2) - 14;
    const cut = 200 + jitter(610 + i) * 40;
    const x0 = 200 - half + Math.abs(jitter(615 + i)) * 12;
    const x1 = 200 + half - Math.abs(jitter(618 + i)) * 12;
    return [
      line([x0, y + jitter(620 + i) * 1.5], [cut - 9, y + jitter(625 + i) * 1.5], 630 + i * 7, 1.4, 3),
      line([cut + 9, y + jitter(640 + i) * 1.5], [x1, y + jitter(645 + i) * 1.5], 650 + i * 7, 1.4, 3),
    ];
  }),
];

// ── 湯気（4本）。下から上へ描くので、点は下から並べる ──
const STEAM = [
  steam(140, 206, 6, 0.2, 10, 700),
  steam(184, 212, -30, 2.1, 12, 720),
  steam(224, 210, -12, 4.0, 11, 740),
  steam(262, 205, 22, 1.0, 9, 760),
];
// 湯気の揺れ（時間で、ずっとゆっくり。スクロールとは別）。1本ずつ長さとずらしを変える
const STEAM_SWAY = [sway(4.8, 0), sway(5.6, -1.8), sway(4.2, -3.1), sway(6.1, -0.9)];

export default function SeiroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -40 400 412"
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
        <linearGradient id="seiro-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1="214" x2="0" y2="-34">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="seiro-body">
        {BODY.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {BODY_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="seiro-shumai scene-anim" style={anim("scene-fade-up", 36, 50, { "--dy": "5px" })}>
        {SHUMAI.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {SHUMAI_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
        {/* 差し色（accent）はここだけ */}
        <circle cx="200" cy="222.5" r="3.6" className="scene-accent-fill" stroke="none" />
      </g>

      {/* 湯気はふたの後ろ（ふたとふちのすき間から出て、ふたの上に立ちのぼるように見せる） */}
      <g className="seiro-steam" stroke="url(#seiro-steam-fade)">
        {STEAM.map((d, i) => (
          <g key={i} className="scene-sway" style={STEAM_SWAY[i]}>
            <path
              d={d}
              pathLength={1}
              className="scene-line scene-stroke-draw scene-anim"
              style={anim("scene-draw", 18 + i * 3, [38, 41, 44, 46][i])}
            />
          </g>
        ))}
      </g>
      <g className="seiro-lid scene-anim" style={anim("seiro-lid-open", 4, 22, { "--o": "100% 100%" })}>
        <path d={LID_FILL} className="scene-paper" stroke="none" />
        {LID.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {LID_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>
    </svg>
  );
}
