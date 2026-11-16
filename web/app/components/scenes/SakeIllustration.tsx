// ─── 焼酎・日本酒の線画（徳利とお猪口、焼酎のロックグラス） ───
// ディナーメニューの「きたげんの名物」の欄の、お飲みものの弐（焼酎・日本酒）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・左に日本酒：こげ茶〜黒っぽい焼き物の徳利1本（首がすぼまり、胴がふくらんだ形）と、同じ焼き物のお猪口1つ
//   右に焼酎：背の低い、まっすぐなロックグラス1つ（大きな氷3個と、淡い琥珀色の焼酎）
//   徳利とロックグラスは、どちらが何か分かる大きさにそろえ、徳利の胴とグラスが少しだけ重なる（グラスが手前）
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。輪郭は scene-line、中の線は scene-fine
// ・色：飲み物は入れ物そのものが主役なので、入れ物にも水彩の色を付ける（料理の絵の決まり、scenes.css の先頭）。
//   塗り方は、料理と同じ水彩の決まり（線の内側だけ・ふちの濃さ・白い抜け・にじみ・ムラ。部品は Wash.tsx。
//   にじみのフィルタは sake-wash の1つを使い回す）
//   ・徳利・お猪口 … 焼き物の色（濃いこげ茶〜黒っぽい .food-wash-yakimono）。徳利の胴の左上に、つやの白い抜けを縦長に1つ
//   ・お猪口の中のお酒 … ほぼ透明に近い、淡いクリーム色（.food-wash-sake）
//   ・ロックグラス … ごく淡い色（ほぼ紙の色、ふちだけうすく .food-wash-glass）
//   ・氷 … ほんのり水色がかった白（.food-wash-ice）
//   ・焼酎 … 淡い琥珀色（.food-wash-shochu。いちばん最後にじわっと出る）
// ・部品ごとに g でまとめる：徳利（sake-tokkuri）・注がれる線（sake-pour）・お猪口（sake-choko）・お猪口の中の波（sake-ripple）・
//   ロックグラス（sake-rock）・氷（sake-ice）・焼酎（sake-shochu）
// ・絵は viewBox を 330 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる）
// ・徳利はまっすぐ立った形で描き、右下の角を支点に TILT 度傾けて置く（動き終わりの形。口がお猪口の上に来る）
// ・動きの順番：徳利とお猪口が現れる → 徳利が少し傾く（まっすぐ立った形から）→ お猪口へ注がれる線（上から下へ描く）→
//   お猪口のお酒の色と、中の波 → ロックグラスが現れる → 氷が1つずつ上から落ちる → 焼酎の色がじわっと出る
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css。傾きは toast-tilt を使う）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, arc, jitter, line, polygon, ring, smooth, type P } from "./draw";
import { Wash, WashFilter } from "./Wash";

// ── 徳利（まっすぐ立った形。底のまん中 (CX, BOT)。右下の角を支点に傾ける） ──
const TK_CX = 106;
const TK_BOT = 346;
const TILT = 26; // 傾ける角度（度。プラスは右へ）
// 右半分の形（上から。[高さ（底から）, 半分の幅]）：口のふち → すぼまった首 → 肩 → いちばんふくらんだ胴 → 高台
const TK_PROFILE: readonly [number, number][] = [
  [214, 15], // 口のふち（少し開く）
  [208, 11],
  [194, 8.5], // 首（いちばん細い）
  [170, 9],
  [152, 14], // 肩
  [136, 26],
  [116, 42],
  [90, 52], // 胴（いちばんふくらむ。下寄りに丸く）
  [60, 52],
  [34, 45],
  [14, 33],
  [4, 30], // 高台の上
  [0, 30],
];
const tk = (h: number, w: number): P => [TK_CX + w, TK_BOT - h];
const TK_RIGHT: P[] = TK_PROFILE.map(([h, w]) => tk(h, w));
const TK_LEFT: P[] = TK_PROFILE.map(([h, w], i) => tk(h, -w + jitter(9600 + i) * 0.5)).reverse();
const PIVOT: P = tk(0, 30); // 右下の角
const TK_FILL = polygon([...TK_RIGHT, ...TK_LEFT]);
const TOKKURI = [
  smooth(TK_PROFILE.slice(0, 11).map(([h, w]) => tk(h, -w))), // 左（口 → 胴の下）
  smooth(TK_PROFILE.slice(0, 11).map(([h, w]) => tk(h, w))), // 右
  smooth([tk(14, -33), tk(6, -31), tk(0, -30), tk(-0.5, 0), tk(0, 30), tk(6, 31), tk(14, 33)]), // 高台と底
  ring(TK_CX, TK_BOT - 214, 15, 4, 9620, 0.3), // 口
];
const TOKKURI_FINE = [arc(TK_CX, TK_BOT - 14, 34, 5, PI * 0.08, PI * 0.92, 10, 0.3, 9640)]; // 高台の上の境目
// つや（胴の左上の、縦長の白い抜け）
const TK_SHINE = [r(tk(100, -27)[0]), r(tk(100, -27)[1]), 4, 17] as const;
function r(n: number) {
  return Math.round(n * 10) / 10;
}

// ── お猪口（徳利の口の下。徳利と同じ焼き物） ──
const CH_CX = 214;
const CH_TOP = 318;
const CH_PTS: P[] = [
  [180, 318],
  [184, 334],
  [196, 346],
  [232, 346],
  [244, 334],
  [248, 318],
];
const CHOKO_FILL = polygon([...CH_PTS, [248, 320], [214, 326], [180, 320]]);
const CHOKO = [
  ring(CH_CX, CH_TOP, 34, 8, 9800, 0.4), // 口
  smooth(CH_PTS), // 胴
  smooth([
    [204, 346],
    [205, 352],
    [223, 352],
    [224, 346],
  ]), // 高台
];
// お猪口の中のお酒の面（口の輪の内側）
const SAKE_FILL = polygon(
  Array.from({ length: 32 }, (_, i) => {
    const t = (PI * 2 * i) / 32;
    return [CH_CX + 31 * Math.cos(t), CH_TOP + 0.8 + 6.4 * Math.sin(t)] as const;
  }),
);
// お猪口の中の小さな波（2本）
const RIPPLE = [arc(214, 319.5, 17, 3.4, PI * 0.1, PI * 0.9, 8, 0.2, 9900), arc(214, 318.5, 8, 2, PI * 1.1, PI * 1.9, 6, 0.2, 9910)];

// 注がれる線：傾いた徳利の口のふち（右）から、お猪口の中まで。上から下へ描く
const rot = ([x, y]: P): P => {
  const a = (TILT * PI) / 180;
  const dx = x - PIVOT[0];
  const dy = y - PIVOT[1];
  return [PIVOT[0] + dx * Math.cos(a) - dy * Math.sin(a), PIVOT[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
const SPOUT = rot(tk(214, 15));
const POUR = smooth([
  [SPOUT[0] + 2, SPOUT[1] + 3],
  [SPOUT[0] + 5, SPOUT[1] + 30],
  [CH_CX + 2, (SPOUT[1] + CH_TOP) / 2 + 10],
  [CH_CX + 1, CH_TOP - 1],
]);

// ── ロックグラス（背の低い、まっすぐなグラス） ──
const G_CX = 314;
const G_TOP = 242;
const G_BOT = 350;
const G_RX = 52;
const G_RY = 10;
const GLASS_FILL = polygon([
  ...Array.from({ length: 17 }, (_, i) => [G_CX + G_RX * Math.cos(PI + (PI * i) / 16), G_TOP + G_RY * Math.sin(PI + (PI * i) / 16)] as const),
  ...Array.from({ length: 17 }, (_, i) => [G_CX + (G_RX - 2) * Math.cos((PI * i) / 16), G_BOT - G_RY + G_RY * Math.sin((PI * i) / 16)] as const),
]);
const GLASS = [
  ring(G_CX, G_TOP, G_RX, G_RY, 10300, 0.4), // 口
  line([G_CX - G_RX, G_TOP + 1], [G_CX - G_RX + 2, G_BOT - G_RY], 10310, 0.5, 2), // 左
  line([G_CX + G_RX, G_TOP + 1], [G_CX + G_RX - 2, G_BOT - G_RY], 10320, 0.5, 2), // 右
  arc(G_CX, G_BOT - G_RY, G_RX - 2, G_RY, PI * -0.02, PI * 1.02, 14, 0.4, 10330), // 底（手前）
];
const GLASS_FINE = [arc(G_CX, G_BOT - 24, G_RX - 3, G_RY - 1, PI * 0.06, PI * 0.94, 12, 0.4, 10340)]; // 底の厚み
// 焼酎の面（水面の線から、底の厚みの線まで）
const LEVEL_Y = 290;
const SHOCHU_FILL = polygon([
  ...Array.from({ length: 13 }, (_, i) => [G_CX - G_RX + 1.5 + ((G_RX * 2 - 3) * i) / 12, LEVEL_Y] as const),
  ...Array.from({ length: 13 }, (_, i) => [G_CX + (G_RX - 3) * Math.cos((PI * i) / 12), G_BOT - 24 + (G_RY - 1) * Math.sin((PI * i) / 12)] as const),
]);
const LEVEL = line([G_CX - G_RX + 2, LEVEL_Y], [G_CX + G_RX - 2, LEVEL_Y], 10350, 0.6, 3);

// ── 氷（大きな角の丸い四角を、少し傾けて3個。奥から） ──
function ice([cx, cy]: P, hw: number, hh: number, rotRad: number, seed: number) {
  const c = Math.cos(rotRad);
  const s = Math.sin(rotRad);
  const k = 7; // 角の丸み
  const local: P[] = [
    [-hw + k, -hh],
    [hw - k, -hh],
    [hw, -hh + k],
    [hw, hh - k],
    [hw - k, hh],
    [-hw + k, hh],
    [-hw, hh - k],
    [-hw, -hh + k],
    [-hw + k, -hh],
  ];
  const pts = local.map(([x, y], i) => [cx + x * c - y * s + jitter(seed + i) * 0.5, cy + x * s + y * c] as const);
  // 氷の角の稜線（短い線 1本）
  const edge = line(
    [cx + (-hw + 6) * c - (-hh + 9) * s, cy + (-hw + 6) * s + (-hh + 9) * c],
    [cx + (hw - 9) * c - (-hh + 9) * s, cy + (hw - 9) * s + (-hh + 9) * c],
    seed + 20,
    0.3,
    1,
  );
  return { fill: polygon(pts), d: smooth(pts), edge, hole: [r(cx - hw * 0.4), r(cy + hh * 0.2), 2.4, 5] as const };
}
const ICES = [ice([292, 268], 22, 20, -0.2, 10400), ice([336, 266], 20, 19, 0.24, 10440), ice([312, 296], 23, 20, 0.08, 10480)];

export default function SakeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="46 80 330 330"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 330 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。絵の中で使い回す） */}
        <WashFilter id="sake-wash" seed={17} />
      </defs>

      {/* 徳利（現れる → 傾く）。外の g で、まっすぐ立った形を TILT 度傾けて置き、
          中の g で「まっすぐ立った形（--tilt）→ 傾いた形」へ動かす（支点はどちらも徳利の右下の角） */}
      <g className="sake-tokkuri scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        <g transform={`rotate(${TILT} ${PIVOT[0]} ${PIVOT[1]})`}>
          <g className="scene-anim" style={anim("toast-tilt", 16, 26, { "--tilt": `${-TILT}deg`, "--o": "100% 100%" })}>
            <path d={TK_FILL} className="scene-paper" stroke="none" />
            <Wash filter="sake-wash" d={TK_FILL} tone="food-wash-yakimono" id="sake-w-tokkuri" shift={[1.2, 0.9]} holes={[TK_SHINE]} />
            {TOKKURI_FINE.map((d, i) => (
              <path key={i} d={d} className="scene-fine" />
            ))}
            {TOKKURI.map((d, i) => (
              <path key={i} d={d} className="scene-line" />
            ))}
          </g>
        </g>
      </g>

      {/* 注がれる線は、お猪口の後ろ（お猪口の中へ入っていくように見せる） */}
      <path d={POUR} pathLength={1} className="sake-pour scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 26, 34)} />

      <g className="sake-choko scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        <path d={CHOKO_FILL} className="scene-paper" stroke="none" />
        <Wash filter="sake-wash" d={CHOKO_FILL} tone="food-wash-yakimono" id="sake-w-choko" shift={[1, 0.75]} holes={[[194, 330, 2, 4.5]]} />
        {/* お猪口のお酒（注がれたあと、じわっと出る） */}
        <g className="scene-anim" style={anim("scene-fade-up", 32, 40, { "--dy": "0px" })}>
          <Wash filter="sake-wash" d={SAKE_FILL} tone="food-wash-sake" id="sake-w-sake" shift={[0.6, 0.4]} line={2.1} />
        </g>
        {CHOKO.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
      </g>
      <g className="sake-ripple">
        {RIPPLE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 34 + i * 3, 40 + i * 3)}
          />
        ))}
      </g>

      {/* ロックグラス（徳利の胴の手前に、少し重なる）。重なりの順：紙の色 → グラスの水彩 → 氷 → 焼酎 → 水面の線・グラスの線 */}
      <g className="sake-rock scene-anim" style={anim("scene-fade-up", 38, 46, { "--dy": "10px" })}>
        <path d={GLASS_FILL} className="scene-paper" stroke="none" />
        <Wash filter="sake-wash" d={GLASS_FILL} tone="food-wash-glass" id="sake-w-glass" shift={[1, 0.75]} holes={[[G_CX - G_RX + 9, 300, 2.2, 14]]} />
      </g>
      {/* 氷（1つずつ、上から落ちる） */}
      <g className="sake-ice">
        {ICES.map((c, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 44 + i * 3, 49 + i * 3, { "--dy": "-70px" })}>
            <path d={c.fill} className="scene-paper" stroke="none" />
            <Wash filter="sake-wash" d={c.fill} tone="food-wash-ice" id={`sake-w-ice-${i}`} shift={[0.8, 0.6]} holes={[c.hole]} />
            <path d={c.edge} className="scene-fine" />
            <path d={c.d} className="scene-line" />
          </g>
        ))}
      </g>
      {/* 焼酎（いちばん最後に、じわっと出る。氷の沈んだところにも重なって、氷がほんのり色づく） */}
      <g className="sake-shochu scene-anim" style={anim("scene-fade-up", 53, 60, { "--dy": "0px" })}>
        <Wash filter="sake-wash" d={SHOCHU_FILL} tone="food-wash-shochu" id="sake-w-shochu" shift={[1, 0.75]} line={2.1} />
      </g>
      <g className="sake-rock scene-anim" style={anim("scene-fade-up", 38, 46, { "--dy": "10px" })}>
        <path d={LEVEL} className="scene-fine" />
        {GLASS_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
        {GLASS.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
      </g>
    </svg>
  );
}
