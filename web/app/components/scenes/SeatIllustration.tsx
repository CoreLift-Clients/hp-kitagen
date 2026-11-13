// ─── 席（本物のきたげんのカウンター席）の線画 ───
// トップの「席」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// 店内の写真（public/images/about/shop.jpg・space/counter.jpg）をもとに、少し斜め上から見た形で描く：
//   黒い天板のカウンター（左手前から右奥へ）・背もたれ付きの四角いクッションの高い椅子3脚
//   （金属の細い脚、座面の下に荷物のかご）・右奥の2階へ上がる階段と手すり
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
//   （椅子のクッションとかごにだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（カウンターの上の小さなメニュー立て）
// ・部品ごとに g でまとめる：カウンターと床（seat-counter）・椅子3脚（seat-chairs）・
//   階段（seat-stairs）・メニュー立て（seat-menu）
// ・動きの順番：カウンターと床の線が描かれる → 椅子が左から1脚ずつ現れる →
//   右奥の階段が下から上へ描かれる → メニュー立てが現れる
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { type P, anim, line, polygon } from "./draw";

// 揺らぎのある直線をつないだ1本の線（描き進める向きは最初の点から）
function polyline(pts: readonly P[], seed: number, amp = 0.6): string {
  return pts
    .slice(1)
    .map((b, i) => {
      const d = line(pts[i], b, seed + i * 7, amp, 1);
      return i === 0 ? d : d.replace(/^M[^C]*/, "");
    })
    .join(" ");
}

// ── カウンター（左手前から右奥へ。奥行きの向きは DEPTH） ──
const DEPTH: P = [22, -20];
const SLOPE = (150 - 176) / (296 - 20); // 天板の前のふちの傾き
const frontY = (x: number) => 176 + SLOPE * (x - 20);
const A: P = [20, 176]; // 天板の前のふち（左）
const B: P = [296, 150]; // 天板の前のふち（右）
const add = (p: P, q: P): P => [p[0] + q[0], p[1] + q[1]];
const THICK = 12; // 天板の厚み
const A2: P = [A[0], A[1] + THICK];
const B2: P = [B[0], B[1] + THICK];

// 床の線（カウンターの腰の下から、右奥の階段の下まで）
const floorY = (x: number) => 322 + (280 - 322) * ((x - 8) / (396 - 8));

const COUNTER = [
  line(add(A, DEPTH), add(B, DEPTH), 3000, 0.8, 3), // 天板の奥のふち
  line(A, B, 3010, 0.8, 3), // 天板の前のふち（上）
  line(A2, B2, 3020, 0.8, 3), // 天板の前のふち（下）。2本で厚みを表す
  line(A, add(A, DEPTH), 3030, 0.3, 1), // 天板の左の端
  line(A, A2, 3035, 0.2, 1),
  line(B, add(B, DEPTH), 3040, 0.3, 1), // 天板の右の端（上）
  line(B2, add(B2, DEPTH), 3045, 0.3, 1), // 天板の右の端（下）
  line(add(B, DEPTH), add(B2, DEPTH), 3050, 0.2, 1),
  line([30, 189], [30, floorY(30)], 3060, 0.7, 2), // 腰の左
  line([286, B2[1] + SLOPE * -10 + 1], [286, floorY(286)], 3070, 0.7, 2), // 腰の右の角
  line([306, 146], [306, 274], 3080, 0.6, 2), // 腰の右奥
  line([286, floorY(286)], [306, 274], 3085, 0.3, 1),
  line([8, floorY(8)], [396, floorY(396)], 3090, 0.9, 5), // 床
];
// 天板の面の細い斜線（黒さを表す）
const COUNTER_HATCH = [58, 96, 214, 252].map((x, i) =>
  line([x, frontY(x) - 4], [x + 11, frontY(x) - 15], 3100 + i * 5, 0.2, 1),
);

// ── 椅子（3脚。背もたれ付きの四角いクッション、金属の細い脚、座面の下にかご） ──
const CW = 56; // クッションの幅
const CD: P = [10, -9]; // 椅子の奥行き
const CS = -0.1; // 椅子の横の線の傾き（カウンターにそろえる）
function chair(x0: number, i: number) {
  const s = 3200 + i * 60;
  const yT = frontY(x0) + 31; // クッションの上
  const yF = floorY(x0) + 24; // 手前の脚の下
  // u：横（0〜CW）、v：上からの下がり、w：奥行き（0 手前・1 奥）
  const p = (u: number, v: number, w = 0): P => [x0 + u + CD[0] * w, yT + v + CS * u + CD[1] * w];
  const H = 30; // クッションの高さ
  const F = 8; // クッションの下の枠の高さ
  const shelf = yF - yT - 40; // かごをのせる棚
  const bTop = shelf - 22; // かごの上
  return {
    fill: polygon([p(0, 0), p(0, 0, 1), p(CW, 0, 1), p(CW, H, 1), p(CW, H), p(0, H)]),
    basketFill: polygon([p(6, bTop), p(CW - 6, bTop), p(CW - 8, shelf), p(8, shelf)]),
    lines: [
      // クッション（手前の面・上の面・右の面）
      line(p(0, 0), p(CW, 0), s, 0.5, 2),
      line(p(0, 0), p(0, H), s + 3, 0.3, 1),
      line(p(CW, 0), p(CW, H), s + 5, 0.3, 1),
      line(p(0, H), p(CW, H), s + 7, 0.5, 2),
      line(p(0, 0), p(0, 0, 1), s + 9, 0.2, 1),
      line(p(0, 0, 1), p(CW, 0, 1), s + 11, 0.4, 2),
      line(p(CW, 0, 1), p(CW, 0), s + 13, 0.2, 1),
      line(p(CW, 0, 1), p(CW, H, 1), s + 15, 0.3, 1),
      line(p(CW, H, 1), p(CW, H), s + 17, 0.2, 1),
    ],
    // 背もたれの厚み（上の面に1本）
    seam: line(p(4, 0, 0.5), p(CW - 3, 0, 0.5), s + 18, 0.2, 1),
    fine: [
      // クッションの下の枠
      line(p(1, H + F), p(CW - 1, H + F), s + 20, 0.3, 1),
      line(p(CW - 1, H + F), p(CW - 1, H + F, 1), s + 22, 0.2, 1),
      // 脚（金属の細い線）
      line(p(2, H), p(2, yF - yT), s + 24, 0.3, 2),
      line(p(CW - 2, H), p(CW - 2, yF - yT), s + 26, 0.3, 2),
      line(p(CW - 2, H, 1), p(CW - 2, yF - yT, 1), s + 28, 0.3, 2),
      // 棚
      line(p(2, shelf), p(CW - 2, shelf), s + 30, 0.3, 1),
      line(p(CW - 2, shelf), p(CW - 2, shelf, 1), s + 32, 0.2, 1),
      // かご（ふちと、網目の線を少し）
      line(p(6, bTop), p(CW - 6, bTop), s + 34, 0.3, 1),
      line(p(6, bTop), p(8, shelf), s + 36, 0.2, 1),
      line(p(CW - 6, bTop), p(CW - 8, shelf), s + 38, 0.2, 1),
      ...[19, 28, 37].map((u, k) => line(p(u, bTop + 4), p(u + 0.5, shelf - 2), s + 40 + k * 2, 0.2, 1)),
      line(p(9, bTop + 11), p(CW - 9, bTop + 11), s + 48, 0.2, 1),
    ],
  };
}
const CHAIRS = [38, 124, 210].map(chair);

// ── 右奥の階段（下から上へ。段の線・下の線・手すり） ──
const STEPS = 6;
const RISE = 30;
const RUN = 13;
const S0: P = [316, floorY(316)];
const STAIR_PTS: P[] = [S0];
for (let k = 0; k < STEPS; k++) {
  const [x, y] = STAIR_PTS[STAIR_PTS.length - 1];
  STAIR_PTS.push([x, y - RISE], [x + RUN, y - RISE]);
}
const STAIR_TOP = STAIR_PTS[STAIR_PTS.length - 1];
const STAIRS = [
  polyline(STAIR_PTS, 3400, 0.25), // 段
  line([S0[0] + 16, S0[1] - 2], [STAIR_TOP[0] + 6, STAIR_TOP[1] + 26], 3450, 0.7, 3), // 階段の下の線
];
const RAIL_FROM: P = [S0[0] + 2, S0[1] - RISE - 44];
const RAIL_TO: P = [STAIR_TOP[0] - 1, STAIR_TOP[1] - 44];
const RAIL = [
  line(RAIL_FROM, RAIL_TO, 3470, 0.6, 3), // 手すり
  line([S0[0] + 2, S0[1] - RISE], RAIL_FROM, 3480, 0.2, 1), // 手すりの柱（下）
];

// ── メニュー立て（差し色。カウンターの上） ──
const MX = 158;
const MY = frontY(MX) - 9; // 置いてある位置（天板の面の上）
const MENU_FILL = polygon([
  [MX - 7, MY],
  [MX - 1, MY - 24],
  [MX + 8, MY - 1],
]);
const MENU = [
  polyline(
    [
      [MX - 7, MY],
      [MX - 1, MY - 24],
      [MX + 8, MY - 1],
    ],
    3500,
    0.2,
  ),
  line([MX - 3, MY - 9], [MX + 3, MY - 10], 3510, 0.1, 1),
];

export default function SeatIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 20 400 360"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="seat-counter">
        {COUNTER.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 4 + (i % 5) * 1.5, 14 + (i % 5) * 1.5)}
          />
        ))}
        {COUNTER_HATCH.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 12 + i, 17 + i)}
          />
        ))}
      </g>

      <g className="seat-chairs">
        {CHAIRS.map((c, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 18 + i * 6, 28 + i * 6, { "--dy": "10px" })}>
            <path d={c.basketFill} className="scene-paper" stroke="none" />
            {c.fine.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
            <path d={c.fill} className="scene-paper" stroke="none" />
            {c.lines.map((d, k) => (
              <path key={k} d={d} className="scene-line" />
            ))}
            <path d={c.seam} className="scene-fine" />
          </g>
        ))}
      </g>

      <g className="seat-stairs">
        {STAIRS.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className={`${i === 0 ? "scene-line" : "scene-fine"} scene-stroke-draw scene-anim`}
            style={anim("scene-draw", 36 + i * 2, 50)}
          />
        ))}
        {RAIL.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 42 - i * 4, 52 - i * 6)}
          />
        ))}
      </g>

      {/* 差し色（accent）はここだけ：カウンターの上の小さなメニュー立て */}
      <g className="seat-menu scene-anim" style={anim("scene-pop", 52, 60, { "--o": "50% 100%" })}>
        <path d={MENU_FILL} className="scene-accent-fill" stroke="none" fillOpacity={0.18} />
        {MENU.map((d, i) => (
          <path key={i} d={d} className="scene-fine scene-accent" />
        ))}
      </g>
    </svg>
  );
}
