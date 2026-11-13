// ─── 肉みそ冷奴の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の陸（肉みそ冷奴）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （小皿と豆腐にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（肉みそ。線を accent にし、面を accent でうすく塗る。scenes.css の .scene-accent-wash）
// ・部品ごとに g でまとめる：小皿と豆腐（hiyayakko-dish）・肉みそ（hiyayakko-miso）・ねぎ（hiyayakko-negi）
// ・豆腐は少し上から見た四角い塊（上の面・手前の面・横の面）。上に、こんもりした肉みそ、ねぎ（短い線の小さな輪切り）
// ・動きの順番：小皿と豆腐が現れる → 肉みそがのる（下を支点に、ふわっと盛り上がる）→ ねぎが散る（1つずつぽんと出る）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// ・絵は viewBox を 360 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, arc, blobPts, jitter, line, polygon, ring, smooth, type P } from "./draw";

// ── 小皿（少し上から見た丸い小皿） ──
const DCX = 200;
const DCY = 290;
const DISH_FILL = polygon(blobPts(DCX, DCY, 156, 50, 0, 0, 0, 32));
const DISH = [
  ring(DCX, DCY, 156, 50, 9300),
  arc(DCX, DCY + 11, 150, 48, PI * 0.04, PI * 0.96, 18, 0.9, 9340), // 厚み（手前の下のふち）
];
const DISH_FINE = [ring(DCX, DCY + 2, 120, 36, 9360, 0.8)];

// ── 豆腐（手前の面の左上の角と、幅・高さ・奥行き） ──
const X = 120;
const Y = 236;
const W = 132;
const H = 58;
const DX = 30;
const DY = -26;
const FL: P = [X, Y];
const FR: P = [X + W, Y + 2];
const BR: P = [X + W, Y + H + 2];
const BL: P = [X, Y + H];
const TL: P = [X + DX, Y + DY];
const TR: P = [X + W + DX, Y + DY + 2];
const SB: P = [X + W + DX, Y + H + DY + 2];
const TOFU_FILL = polygon([BL, FL, TL, TR, SB, BR]);
const TOFU = [
  line(FL, FR, 9400, 0.6, 3),
  line(FR, BR, 9410, 0.5, 1),
  line(BR, BL, 9420, 0.6, 3),
  line(BL, FL, 9430, 0.5, 1),
  line(FL, TL, 9440, 0.4, 1),
  line(TL, TR, 9450, 0.6, 3),
  line(TR, FR, 9460, 0.4, 1),
  line(TR, SB, 9470, 0.5, 1),
  line(SB, BR, 9480, 0.4, 1),
];
// 豆腐の手前の面の、やわらかい影の筋（短い線 2本）
const TOFU_FINE = [line([X + 14, Y + H - 12], [X + 40, Y + H - 11], 9490, 0.4, 1), line([X + W + 8, Y + 30], [X + W + 8, Y + 44], 9495, 0.3, 1)];

// ── 肉みそ（上の面の上に、こんもり） ──
// 下のふち（上の面にのる、ゆるい弧）→ 上のでこぼこの山
const MCX = 202;
const MBY = 228; // 下のふちの高さ（豆腐の上の面の、手前のふちより少し奥）
const MISO_PTS: P[] = (() => {
  const pts: P[] = [];
  const n = 16;
  // 山（左 → 右）
  for (let i = 0; i <= n; i++) {
    const t = PI + (PI * i) / n;
    const bump = 1 + 0.1 * Math.sin(i * 2.3 + 0.6) + jitter(9500 + i) * 0.05;
    pts.push([MCX + 60 * Math.cos(t) * (0.96 + 0.04 * bump), MBY + 34 * bump * Math.sin(t)]);
  }
  // 下のふち（右 → 左）
  pts.push([MCX + 40, MBY + 6], [MCX, MBY + 8], [MCX - 40, MBY + 6], [MCX - 60, MBY]);
  return pts;
})();
const MISO_FILL = polygon(MISO_PTS);
const MISO = smooth(MISO_PTS);
// 肉みその粒（中の小さな弧 3つ）
const MISO_FINE = [
  arc(MCX - 24, MBY - 12, 7, 4, PI * 1.1, PI * 1.9, 5, 0.3, 9540),
  arc(MCX + 14, MBY - 20, 7, 4, PI * 1.1, PI * 1.9, 5, 0.3, 9550),
  arc(MCX + 30, MBY - 4, 6, 3.5, PI * 1.1, PI * 1.9, 5, 0.3, 9560),
];

// ── ねぎ（小さな輪切り 7つ。肉みその上と、そのまわり） ──
const NEGI_AT: readonly P[] = [
  [178, 204],
  [210, 194],
  [236, 208],
  [194, 220],
  [156, 226],
  [256, 222],
  [226, 226],
];
const NEGI = NEGI_AT.map(([x, y], i) =>
  smooth(
    Array.from({ length: 9 }, (_, j) => {
      const t = -0.2 + ((PI * 2 + 0.4) * j) / 8;
      const r = 5.2 + jitter(9600 + i * 10 + (j % 8)) * 0.4;
      return [x + r * Math.cos(t), y + r * 0.7 * Math.sin(t)] as const;
    }),
  ),
);

export default function HiyayakkoIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="20 92 360 360"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 360 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="hiyayakko-dish scene-anim" style={anim("scene-fade-up", 4, 16, { "--dy": "10px" })}>
        <path d={DISH_FILL} className="scene-paper" stroke="none" />
        {DISH.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {DISH_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
        <path d={TOFU_FILL} className="scene-paper" stroke="none" />
        {TOFU.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {TOFU_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      {/* 差し色（accent）はここだけ：肉みそ（線は accent、面はうすい accent） */}
      <g className="hiyayakko-miso scene-anim" style={anim("scene-swell", 20, 32, { "--o": "50% 100%" })}>
        <path d={MISO_FILL} className="scene-accent-wash" stroke="none" />
        <path d={MISO} className="scene-line scene-accent" />
        {MISO_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine scene-accent" />
        ))}
      </g>

      <g className="hiyayakko-negi">
        {NEGI.map((d, i) => (
          <g key={i} className="scene-anim" style={anim("scene-pop", 34 + i * 2, 40 + i * 2)}>
            <path d={d} className="scene-fine" />
          </g>
        ))}
      </g>
    </svg>
  );
}
