// ─── 席（カウンターと丸椅子）の線画 ───
// トップの「席」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
//   （椅子の座面と明かりのかさにだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（吊り下げの明かりの、電球とまわりの光）
// ・部品ごとに g でまとめる：カウンター（seat-counter）・丸椅子4脚（seat-stools）・
//   明かり（seat-lamp）・光（seat-glow）
// ・動きの順番：椅子が左から順に現れる → 明かりがともる（電球が灯り、まわりにやわらかい光の線と輪が広がる）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arc, arcPts, jitter, line, polygon, ring, smooth } from "./draw";

// ── カウンター（正面から。天板と前の板） ──
const COUNTER = [
  line([28, 186], [372, 184], 2000, 1, 3), // 天板の上の線
  line([28, 200], [372, 199], 2010, 1, 3), // 天板の前の線
  line([28, 186], [28, 200], 2020, 0.3, 1), // 天板の左の端
  line([372, 184], [372, 199], 2030, 0.3, 1), // 天板の右の端
  line([42, 200], [43, 338], 2040, 0.8, 2), // 前の板の左
  line([358, 199], [357, 338], 2050, 0.8, 2), // 前の板の右
];
const COUNTER_FINE = [
  line([42, 212], [358, 211], 2060, 0.8, 3), // 天板の下の影の線
  line([14, 340], [386, 340], 2070, 0.8, 4), // 床
];

// ── 丸椅子（4脚） ──
const STOOL_X = [96, 168, 240, 312];
function stool(x: number, i: number) {
  const s = 2100 + i * 40;
  const y = 252; // 座面の上
  return {
    // 座面（上面の輪と、厚みの手前の弧）
    fill: polygon([...arcPts(x, y, 28, 8, PI, PI * 2, 12, 0, 0), ...arcPts(x, y + 8, 28, 8, 0, PI, 12, 0, 0)]),
    lines: [
      ring(x, y, 28, 8, s, 0.6),
      line([x - 28, y], [x - 28, y + 8], s + 5, 0.2, 1),
      line([x + 28, y], [x + 28, y + 8], s + 6, 0.2, 1),
      arc(x, y + 8, 28, 8, PI * -0.02, PI * 1.02, 10, 0.6, s + 8),
      // 脚（3本。外に少し開く）
      line([x - 18, y + 14], [x - 24, 338], s + 12, 0.6, 2),
      line([x + 18, y + 14], [x + 24, 338], s + 16, 0.6, 2),
      line([x - 2, y + 16], [x - 3 + jitter(s) * 0.8, 338], s + 20, 0.5, 2),
    ],
    fine: [
      // 足をかける輪（手前の弧）
      arc(x, 302, 23, 5, PI * 0.02, PI * 0.98, 8, 0.4, s + 24),
    ],
  };
}
const STOOLS = STOOL_X.map(stool);

// ── 吊り下げの明かり ──
const LX = 200;
const LAMP_CORD = line([LX, -4], [LX + 0.5, 54], 2300, 0.4, 2);
// かさ（上が細く、下に広がる。下のふちは少し奥行きのある弧）
const SHADE_TOP: readonly [number, number][] = [
  [LX - 38, 104],
  [LX - 33, 82],
  [LX - 18, 64],
  [LX - 7, 56],
  [LX + 7, 56],
  [LX + 18, 64],
  [LX + 33, 82],
  [LX + 38, 104],
];
const SHADE_FILL = polygon([...SHADE_TOP, ...arcPts(LX, 104, 38, 6, 0, PI, 10, 0, 0)]);
const SHADE = [
  smooth(SHADE_TOP.map(([x, y], i) => [x + jitter(2310 + i) * 0.5, y] as const)),
  ring(LX, 104, 38, 6, 2330, 0.5),
];
const SHADE_FINE = [line([LX - 8, 56], [LX + 8, 56], 2340, 0.2, 1)];

// 光（差し色）。電球の下に、やわらかい光の線と輪
const BULB = arc(LX, 110, 10, 9, PI * -0.05, PI * 1.05, 10, 0.2, 2400);
const GLOW_RAYS = [-62, -34, 0, 34, 62].map((deg, i) => {
  const t = ((90 + deg) * PI) / 180;
  const r0 = 26;
  const r1 = i === 2 ? 50 : 44;
  return line(
    [LX + r0 * Math.cos(t), 112 + r0 * Math.sin(t)],
    [LX + r1 * Math.cos(t), 112 + r1 * Math.sin(t)],
    2410 + i * 3,
    0.3,
    1,
  );
});
const GLOW_RING = arc(LX, 106, 62, 50, PI * 0.08, PI * 0.92, 14, 0.8, 2450);

export default function SeatIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -10 400 360"
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
          <path key={i} d={d} className="scene-line" />
        ))}
        {COUNTER_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="seat-stools">
        {STOOLS.map((s, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 4 + i * 6, 14 + i * 6, { "--dy": "10px" })}>
            <path d={s.fill} className="scene-paper" stroke="none" />
            {s.lines.map((d, k) => (
              <path key={k} d={d} className="scene-line" />
            ))}
            {s.fine.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
          </g>
        ))}
      </g>

      {/* 差し色（accent）はここだけ：明かりの電球と、まわりの光 */}
      <g className="seat-glow">
        <g className="scene-anim" style={anim("scene-on", 36, 42)}>
          <path d={BULB} className="scene-accent-fill scene-accent scene-fine" fillOpacity={0.85} />
        </g>
        <g className="scene-anim" style={anim("scene-pop", 40, 50, { "--o": "50% 0%" })}>
          {GLOW_RAYS.map((d, i) => (
            <path key={i} d={d} className="scene-fine scene-accent" strokeOpacity={0.75} />
          ))}
        </g>
        <g className="scene-anim" style={anim("scene-pop", 43, 53, { "--o": "50% 0%" })}>
          <path d={GLOW_RING} className="scene-fine scene-accent" strokeOpacity={0.45} />
        </g>
      </g>

      <g className="seat-lamp">
        <path d={LAMP_CORD} className="scene-fine" />
        <path d={SHADE_FILL} className="scene-paper" stroke="none" />
        {SHADE.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {SHADE_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>
    </svg>
  );
}
