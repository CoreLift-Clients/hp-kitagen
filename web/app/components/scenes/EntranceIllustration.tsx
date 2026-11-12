// ─── お店の入口（引き戸と看板）の線画 ───
// トップの「結び」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
// ・看板には文字を描かない（線だけ）
// ・差し色は accent を1か所だけ（入口の中の明かり：引き戸のガラスの奥のうすい色と、足もとにこぼれる光）
// ・部品ごとに g でまとめる：明かり（entrance-light）・軒と壁（entrance-wall）・看板（entrance-sign）・
//   引き戸（entrance-door）。明かりは線の後ろ（いちばん下）に置く
// ・動き：入口の中に明かりがともる（明かりの g がうすい → はっきり）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { anim, line, type P } from "./draw";

// 四角（4本の少し揺れた線）
function rect(x0: number, y0: number, x1: number, y1: number, seed: number, amp = 0.6): string[] {
  const a: P = [x0, y0];
  const b: P = [x1, y0];
  const c: P = [x1, y1];
  const d: P = [x0, y1];
  return [line(a, b, seed, amp), line(b, c, seed + 10, amp), line(c, d, seed + 20, amp), line(d, a, seed + 30, amp)];
}

// ── 軒と壁 ──
const WALL = [
  line([24, 40], [376, 38], 4000, 1, 4), // 軒の上
  line([30, 54], [370, 53], 4010, 1, 4), // 軒の下
  line([24, 40], [30, 54], 4020, 0.2, 1),
  line([376, 38], [370, 53], 4030, 0.2, 1),
  line([44, 54], [45, 340], 4040, 0.8, 3), // 左の壁
  line([356, 53], [355, 340], 4050, 0.8, 3), // 右の壁
];
const WALL_FINE = [
  // 軒の下の垂木（短い縦の筋）
  ...Array.from({ length: 12 }, (_, i) => {
    const x = 58 + i * 26;
    return line([x, 55], [x, 62], 4060 + i * 2, 0.2, 1);
  }),
  line([14, 342], [386, 342], 4100, 0.8, 4), // 地面
  // 左右の格子窓
  ...rect(62, 170, 88, 262, 4110, 0.4),
  ...[70.5, 79.5].map((x, i) => line([x, 172], [x, 260], 4150 + i * 3, 0.3, 2)),
  ...rect(312, 170, 338, 262, 4160, 0.4),
  ...[320.5, 329.5].map((x, i) => line([x, 172], [x, 260], 4200 + i * 3, 0.3, 2)),
];

// ── 看板（文字は描かない） ──
const SIGN = rect(130, 74, 270, 120, 4300, 0.7);
const SIGN_FINE = [
  ...rect(137, 81, 263, 113, 4340, 0.4),
  // 看板を吊る短い線
  line([156, 55], [156, 74], 4380, 0.2, 1),
  line([244, 54], [244, 74], 4385, 0.2, 1),
];

// ── 引き戸（2枚。上はガラスの格子、下は縦の板） ──
const DOOR = [
  line([92, 136], [308, 135], 4400, 0.8, 3), // かもい（上）
  line([92, 145], [308, 144], 4410, 0.6, 3),
  line([98, 145], [98, 340], 4420, 0.6, 3), // 枠の左
  line([302, 144], [302, 340], 4430, 0.6, 3), // 枠の右
  ...rect(106, 150, 200, 338, 4440, 0.5), // 左の戸
  ...rect(200, 150, 294, 338, 4480, 0.5), // 右の戸
];
function panelFine(x0: number, x1: number, seed: number): string[] {
  const mid = (x0 + x1) / 2;
  return [
    line([x0, 252], [x1, 252], seed, 0.4, 2), // 腰の横木
    line([x0, 258], [x1, 258], seed + 5, 0.4, 2),
    line([mid, 150], [mid, 252], seed + 10, 0.4, 2), // ガラスの縦の桟
    line([x0, 184], [x1, 184], seed + 15, 0.4, 2), // ガラスの横の桟
    line([x0, 218], [x1, 218], seed + 20, 0.4, 2),
    // 下の縦の板
    ...Array.from({ length: 6 }, (_, i) => {
      const x = x0 + 12 + i * ((x1 - x0 - 24) / 5);
      return line([x, 262], [x, 334], seed + 30 + i * 3, 0.3, 2);
    }),
  ];
}
const DOOR_FINE = [...panelFine(106, 200, 4500), ...panelFine(200, 294, 4560), line([204, 152], [204, 336], 4620, 0.3, 2)];

// ── 明かり（差し色） ──
const GLASS: readonly [number, number, number, number][] = [
  [107, 151, 199, 251],
  [201, 151, 293, 251],
];
const SPILL = [
  line([130, 350], [170, 350], 4700, 0.4, 2),
  line([184, 354], [216, 354], 4705, 0.4, 2),
  line([230, 350], [270, 350], 4710, 0.4, 2),
];

export default function EntranceIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 20 400 345"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 差し色（accent）はここだけ：入口の中の明かり */}
      <g className="entrance-light scene-anim" style={anim("scene-on", 20, 42)}>
        {GLASS.map(([x0, y0, x1, y1], i) => (
          <rect
            key={i}
            x={x0}
            y={y0}
            width={x1 - x0}
            height={y1 - y0}
            className="scene-accent-fill"
            fillOpacity={0.2}
            stroke="none"
          />
        ))}
        {SPILL.map((d, i) => (
          <path key={i} d={d} className="scene-fine scene-accent" strokeOpacity={0.7} />
        ))}
      </g>

      <g className="entrance-wall">
        {WALL.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {WALL_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="entrance-sign">
        {SIGN.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {SIGN_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="entrance-door">
        {DOOR.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {DOOR_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>
    </svg>
  );
}
