// ─── ソフトドリンクの線画（背の高いグラスのコーラ） ───
// ディナーメニューの「きたげんの名物」の欄の、お飲みものの参（ソフトドリンク）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （グラスと氷に、後ろの線を隠すための塗り --scene-paper を付ける）
// ・色：飲み物は入れ物そのものが主役なので、入れ物にも水彩の色を付ける（料理の絵の決まり、scenes.css の先頭）。
//   塗り方は、料理と同じ水彩の決まり（部品は Wash.tsx。にじみのフィルタは soft-wash の1つを使い回す）。
//   日本酒・焼酎、生ビールのカードと、塗り方をそろえる
//   ・グラス … ごく淡い色（ほぼ紙の色、ふちだけうすく .food-wash-glass）
//   ・コーラ … こげ茶〜黒に近いカラメル色（.food-wash-cola）。グラスの中の全体に1段塗り、下の約 6 割（DRINK_DEEP）に
//     同じ色をもう1段重ねる（.cola-deep。ふちの濃い線は付けない）。上（水面の近く）が明るく、下ほど濃く見える。
//     グラデーションは使わない（水彩の決まり。ムラ・白い抜けは今までどおり）
//   ・水面の泡の帯 … 水面のすぐ下に、紙の色に近い白をうすく（.cola-foam）。下のふちを細かく波打たせる（FOAM）
//   ・氷 … ほんのり水色がかった白（.food-wash-ice。焼酎の水割りのタンブラーの氷と同じ）
//   ・ストロー … 淡い accent（.food-wash-straw）
//   ・炭酸の泡 … 紙の色に近い白をうすく（.cola-bubble。線なしの丸）
// ・部品ごとに g でまとめる：グラスの面（soft-glass-face。紙の色・グラスとコーラの水彩・水面の泡の帯）・炭酸の泡（soft-bubbles）・
//   ストロー（soft-straw）・グラス（soft-glass。氷3個と飲みものの線も一緒）
//   重なりの順：グラスの面 → 炭酸の泡 → ストロー → 氷（ストローの一部と泡を隠す）→ グラスの線
//   泡は液の形（DRINK_FILL）で切り抜くので、グラスの外・水面より上には出ない。氷とストローより後ろなので、氷の上にも出ない
// ・動きの順番：グラス（コーラの色・氷も一緒）が現れる → ストローが上から入る → 炭酸の泡が見え始める（スクロールの段）
// ・炭酸の泡は、見え始めたあと、時間でずっと下から上へ立ちのぼる（scenes.css の cola-rise。湯気の揺れと同じく、
//   場面が画面の外にあるあいだは止める）。粒ごとに、横の位置・大きさ・速さ・始まる時刻をずらす（BUBBLES。乱数なし）。
//   スクロールで進めるのは泡の囲み（.scene-anim）の現れ方だけで、立ちのぼる動きは iPhone の JS で進める形（sceneScroll.ts）でも時間のまま。
//   prefers-reduced-motion のときは止まった形で、液の中に散らばって見える（各粒の cy の位置）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, animAt, arc, cardTiming, jitter, line, polygon, ring, smooth, type P } from "./draw";
import { Wash, WashFilter } from "./Wash";

// ── グラス（上が少し広い、背の高いタンブラー） ──
const GLASS = [
  ring(200, 98, 58, 10, 10000, 0.5), // 口
  line([142, 99], [156, 344], 10010, 0.7, 3), // 左
  line([258, 99], [244, 344], 10020, 0.7, 3), // 右
  arc(200, 344, 44, 8, PI * -0.02, PI * 1.02, 12, 0.5, 10030), // 底（手前）
];
const GLASS_FINE = [
  arc(200, 330, 45, 8, PI * 0.05, PI * 0.95, 12, 0.5, 10040), // 底の厚み
  line([158, 134], [166, 300], 10050, 0.6, 2), // ガラスの光（左の縦の筋）
  line([200, 128], [258 - 14, 128], 10060, 0.6, 2), // 飲みものの線（右半分。左はストローと氷の後ろ）
  line([146, 128], [184, 128], 10070, 0.6, 2), // 飲みものの線（左）
];

// ── 飲み物の面（飲みものの線 y = 128 から底の厚みの線まで。グラスの内側。炭酸の泡の切り抜きにも使う） ──
const glassX = (y: number, side: number) => (side < 0 ? 142 + ((156 - 142) * (y - 99)) / 245 : 258 - ((258 - 244) * (y - 99)) / 245);
const DRINK_FILL = polygon([
  [glassX(128, -1) + 1.5, 128],
  [glassX(128, 1) - 1.5, 128],
  [glassX(328, 1) - 1.5, 332],
  [200, 338],
  [glassX(328, -1) + 1.5, 332],
]);

// 下の濃い所（y = 205 あたりから下。同じ色をもう1段重ねる）
const DRINK_DEEP = polygon([
  [glassX(205, -1) + 1.5, 207],
  [182, 203],
  [glassX(205, 1) - 1.5, 205],
  [glassX(328, 1) - 1.5, 332],
  [200, 338],
  [glassX(328, -1) + 1.5, 332],
]);

// 水面の泡の帯（飲みものの線 y = 128 のすぐ下。上は真っすぐ、下のふちは 5px ほどごとの細かい波）
const FOAM = (() => {
  const l = glassX(129, -1) + 2;
  const r = glassX(129, 1) - 2;
  let d = `M${l.toFixed(1)} 129 L${r.toFixed(1)} 129 L${r.toFixed(1)} 132.5`;
  const n = Math.round((r - l) / 5);
  const w = (r - l) / n;
  for (let i = 0; i < n; i++) {
    const x0 = r - w * i;
    const depth = 2.2 + ((i * 7) % 3) * 0.7; // 波の深さを少しずつ変える（乱数なし）
    d += ` Q${(x0 - w / 2).toFixed(1)} ${(132.5 + depth).toFixed(1)} ${(x0 - w).toFixed(1)} 132.5`;
  }
  return `${d} Z`;
})();

// グラスの面（口の輪の奥のふちから、底の手前のふちまで。グラスの水彩）
const GLASS_FILL = polygon([
  ...Array.from({ length: 17 }, (_, i) => [200 + 58 * Math.cos(PI + (PI * i) / 16), 98 + 10 * Math.sin(PI + (PI * i) / 16)] as const),
  [258, 99],
  ...Array.from({ length: 17 }, (_, i) => [200 + 44 * Math.cos((PI * i) / 16), 344 + 8 * Math.sin((PI * i) / 16)] as const),
  [142, 99],
]);
// ストローの面（2本の線のあいだ）
const STRAW_FILL = polygon([
  [196, 330],
  [214, 150],
  [222, 66],
  [226, 54],
  [252, 30],
  [259, 38],
  [236, 60],
  [233, 68],
  [225, 150],
  [207, 331],
]);

// ── 氷（3個。角の丸い四角を少し傾けて） ──
function ice([cx, cy]: P, half: number, rot: number, seed: number) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const r = 6; // 角の丸み
  const local: P[] = [
    [-half + r, -half],
    [half - r, -half],
    [half, -half + r],
    [half, half - r],
    [half - r, half],
    [-half + r, half],
    [-half, half - r],
    [-half, -half + r],
    [-half + r, -half],
  ];
  const pts = local.map(([x, y], i) => [cx + x * c - y * s + jitter(seed + i) * 0.6, cy + x * s + y * c] as const);
  // 氷の面の光（短い線 1本）
  const shine = line(
    [cx + (-half + 8) * c - (-half + 12) * s, cy + (-half + 8) * s + (-half + 12) * c],
    [cx + (-half + 8) * c - (half - 14) * s, cy + (-half + 8) * s + (half - 14) * c],
    seed + 20,
    0.3,
    1,
  );
  return { fill: polygon(pts), d: smooth(pts), shine, hole: [Math.round((cx + 6) * 10) / 10, Math.round((cy + 6) * 10) / 10, 2.4, 4.5] as const };
}
const ICES = [ice([182, 160], 24, -0.22, 10100), ice([224, 182], 22, 0.3, 10140), ice([190, 216], 21, 0.12, 10180)];

// ── ストロー（差し色。2本の線で太さを出し、上で曲がる） ──
const STRAW = [
  smooth([
    [196, 330],
    [214, 150],
    [222, 66],
    [226, 54],
    [252, 30],
  ]),
  smooth([
    [207, 331],
    [225, 150],
    [233, 68],
    [236, 60],
    [259, 38],
  ]),
  line([252, 30], [259, 38], 10200, 0.1, 1), // 先の口
  line([222, 66], [233, 68], 10210, 0.2, 1), // 曲がるところの筋
];

// ── 炭酸の泡（10 粒）：[x, 止まっているときの y（氷に隠れない、液の下の方と氷のすき間に散らす）, 半径, 立ちのぼる長さ（秒）, 始まる時刻（秒。負の数で途中から）] ──
// 立ちのぼる道すじは、どの粒も底の近く（y = 330）から水面（y = 132）まで（scenes.css の cola-rise。--from・--to）
const BUBBLE_BOTTOM = 330;
const BUBBLE_TOP = 132;
const BUBBLES: readonly [number, number, number, number, number][] = [
  [162, 292, 2.4, 3.4, 0],
  [172, 246, 1.7, 2.8, -1.1],
  [186, 318, 3.0, 3.9, -2.3],
  [198, 264, 2.0, 3.1, -0.6],
  [236, 248, 1.6, 2.6, -1.8],
  [222, 302, 2.6, 3.6, -2.9],
  [230, 272, 1.8, 2.9, -0.3],
  [240, 290, 2.2, 3.3, -1.5],
  [176, 280, 1.6, 2.7, -2.1],
  [156, 204, 2.0, 3.0, -0.9],
];

// ── 動きの段（anim の from・to。4〜60。scenes.css の「名物の欄の決まり」） ──
// 主役は、ストローが上からグラスへすっと入る所（14〜36 ＝ 全体の約 4 割）。段のあいだに短い間
const T = {
  glass: [4, 12], // グラス（面・氷・線）が現れる
  straw: [14, 36], // （間）ストローが上から入る
  bubble: [39, 56], // （間）炭酸の泡が見え始める（そのあとは時間でずっと立ちのぼる）
} as const;
// 線のいちばん下は、絵の場所の上から 88.2%。主役が時間で動くとき 22 × 0.05 × 1.3 ≒ 1.4 秒
const CARD = cardTiming({ ink: 0.89, time: 1.3 });

export default function SoftDrinkIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={CARD}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。絵の中で使い回す） */}
        <WashFilter id="soft-wash" seed={23} />
        {/* 炭酸の泡を、液の中だけに切り抜く */}
        <clipPath id="soft-cola-clip">
          <path d={DRINK_FILL} />
        </clipPath>
      </defs>
      {/* グラスの面とコーラの水彩・水面の泡の帯（グラスと一緒に現れる） */}
      <g className="soft-glass-face scene-anim" style={animAt("scene-fade-up", T.glass, { "--dy": "10px" })}>
        <path d={GLASS_FILL} className="scene-paper" stroke="none" />
        <Wash filter="soft-wash" d={GLASS_FILL} tone="food-wash-glass" id="soft-w-glass" shift={[1, 0.75]} />
        <Wash filter="soft-wash" d={DRINK_FILL} tone="food-wash-cola" id="soft-w-cola" shift={[1, 0.75]} line={2.1} holes={[[232, 300, 2.4, 9]]} />
        <Wash filter="soft-wash" d={DRINK_DEEP} tone="food-wash-cola cola-deep" id="soft-w-cola-deep" shift={[1, 0.75]} line={2.1} />
        <path d={FOAM} className="cola-foam" stroke="none" />
      </g>
      {/* 炭酸の泡（ストローのあとで見え始め、時間でずっと立ちのぼる。液の中だけ） */}
      <g className="soft-bubbles scene-anim" style={animAt("scene-fade-up", T.bubble, { "--dy": "0px" })}>
        <g clipPath="url(#soft-cola-clip)">
          {BUBBLES.map(([x, y, r, dur, delay], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              className="cola-bubble"
              stroke="none"
              style={
                {
                  "--from": `${BUBBLE_BOTTOM - y}px`,
                  "--to": `${BUBBLE_TOP - y}px`,
                  "--wx": `${i % 2 ? 1.5 : -1.5}px`,
                  "--rise-dur": `${dur}s`,
                  "--rise-delay": `${delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </g>
      </g>
      {/* ストロー（上から入る） */}
      <g className="soft-straw scene-anim" style={animAt("scene-fade-up", T.straw, { "--dy": "-90px" })}>
        <Wash filter="soft-wash" d={STRAW_FILL} tone="food-wash-straw" id="soft-w-straw" shift={[0.5, 0.4]} />
        {STRAW.map((d, i) => (
          <path key={i} d={d} className={i < 2 ? "scene-line" : "scene-fine"} />
        ))}
      </g>

      <g className="soft-glass scene-anim" style={animAt("scene-fade-up", T.glass, { "--dy": "10px" })}>
        {ICES.map((c, i) => (
          <g key={i}>
            <path d={c.fill} className="scene-paper" stroke="none" />
            <Wash filter="soft-wash" d={c.fill} tone="food-wash-ice" id={`soft-w-ice-${i}`} shift={[0.8, 0.6]} holes={[c.hole]} />
            <path d={c.d} className="scene-line" />
            <path d={c.shine} className="scene-fine" />
          </g>
        ))}
        {GLASS.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {GLASS_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

    </svg>
  );
}
