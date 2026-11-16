// ─── 焼酎・日本酒の線画（徳利からお猪口へ日本酒を注ぐ所と、水差しからタンブラーへ水を注ぐ焼酎の水割り） ───
// ディナーメニューの「きたげんの名物」の欄の、お飲みものの弐（焼酎・日本酒）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・左に日本酒：こげ茶〜黒っぽい焼き物の徳利1本（首がすぼまり、胴がふくらんだ形）と、同じ焼き物のお猪口1つ。
//   徳利を右（内側）へ傾けて、お猪口へ注いでいる
//   右に焼酎の水割り：少し背の高いタンブラー1つ（わずかに口が広がる形。氷3個・マドラー1本・ほぼ透明の水割り）と、
//   右上から左（内側）へ傾けた、注ぎ口のある小ぶりのガラスの水差し。タンブラーへ水を注いでいる
//   2つの流れのあいだは 85 ほどあける（お猪口とタンブラーのあいだも少しあける）
// ・注がれる流れは、生ビールと同じ部品（Pour.tsx）：水彩の帯（輪郭は細い線）と、中を上から下へ流れ続ける明るい筋
//   ・日本酒 … 幅は徳利の口の下で 6、お猪口に入る所で 4。色はお猪口の中のお酒と同じ淡いクリーム色（.food-wash-sake）
//   ・水 … 幅は水差しの口の下で 5、グラスに入る所で 3.5。色は氷と同じ、ごく淡い水色（.food-wash-ice）
//   落ちる所に、日本酒は波紋の輪2本と小さなしずく3つ、水は小さなしずく2つと泡粒3つ
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。輪郭は scene-line、中の線は scene-fine
// ・色：飲み物は入れ物そのものが主役なので、入れ物にも水彩の色を付ける（料理の絵の決まり、scenes.css の先頭）。
//   塗り方は、料理と同じ水彩の決まり（線の内側だけ・ふちの濃さ・白い抜け・にじみ・ムラ。部品は Wash.tsx。
//   にじみのフィルタは sake-wash の1つを使い回す）
//   ・徳利・お猪口 … 焼き物の色（濃いこげ茶〜黒っぽい .food-wash-yakimono）。徳利の胴の左上に、つやの白い抜けを縦長に1つ
//   ・お猪口の中のお酒・注がれる日本酒 … ほぼ透明に近い、淡いクリーム色（.food-wash-sake）
//   ・タンブラー・水差し … ごく淡い色（ほぼ紙の色、ふちだけうすく .food-wash-glass）
//   ・氷・注がれる水・水差しの中の水 … ほんのり水色がかった白（.food-wash-ice）
//   ・焼酎の水割り … ほぼ透明に近い、ごく淡い琥珀色（.food-wash-shochu。グラスの中でじわっと出る）
// ・部品ごとに g でまとめる：徳利（sake-tokkuri）・日本酒の流れ（sake-pour）・お猪口（sake-choko）・波紋（sake-ripple）・
//   しずく（sake-drops）・タンブラー（sake-tumbler）・氷（sake-ice）・マドラー（sake-muddler）・水割り（sake-mizuwari）・
//   水差し（sake-pitcher）・水の流れ（sake-water）・しずくと泡粒（sake-bubbles）
// ・絵は viewBox を 350 の幅に切り出す（線の太さは --scene-z で 400 の幅の絵とそろえる）
// ・徳利・水差しは、まっすぐ立った形で描き、下の角を支点に傾けて置く（動き終わりの形。口がお猪口・タンブラーの上に来る）
// ・動きの順番：徳利とお猪口が現れる → 徳利が傾く → 日本酒の流れが伸びる → お猪口のお酒の色と波紋・しずく →
//   タンブラーと氷が現れる → 水差しが現れて傾く → 水の流れが伸びる → グラスの中の水割りの色がじわっと出る →
//   しずくと泡粒 → 2本の流れの中の筋が流れ続ける（動き終わりは、両方とも注いでいる途中の形）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css。傾きは toast-tilt、流れは pour-grow、しずくは pour-splash）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, arc, jitter, line, polygon, ring, smooth, type P } from "./draw";
import { Pour, pourShape } from "./Pour";
import { Wash, WashFilter } from "./Wash";

function r(n: number) {
  return Math.round(n * 10) / 10;
}
// 点 p を、支点 c を中心に deg 度回す（プラスは右回り）
const rotAbout = ([x, y]: P, [cx, cy]: P, deg: number): P => {
  const a = (deg * PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
};

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

// ── 日本酒の流れ（傾いた徳利の口のふち（右）から、お猪口のお酒の面まで。部品は Pour.tsx） ──
const SPOUT = rotAbout(tk(214, 15), PIVOT, TILT);
const SAKE_LAND: P = [CH_CX + 1, CH_TOP + 1];
const SAKE_POUR = pourShape({
  from: [SPOUT[0] + 2, SPOUT[1] + 3],
  ctrl: [SPOUT[0] + 8, SPOUT[1] + 48],
  to: SAKE_LAND,
  w0: 6,
  w1: 4,
  steps: 14,
});
// 落ちる所の波紋（輪を2本。お酒の面の上に、流れを中心にして）
const RIPPLE = [ring(SAKE_LAND[0], SAKE_LAND[1] + 0.4, 8, 1.8, 9900, 0.15), ring(SAKE_LAND[0], SAKE_LAND[1] + 0.8, 15, 3.2, 9910, 0.2)];
// 小さなしずくのはね（[x, y, 半径]）
const SAKE_DROPS: readonly [number, number, number][] = [
  [202, 311, 2.2],
  [228, 309, 2],
  [210, 302, 1.7],
];

// ── タンブラー（少し背の高い、わずかに口が広がるグラス） ──
const T_CX = 308;
const T_TOP = 212;
const T_BOT = 356;
const T_RX = 33; // 口の半分の幅
const T_RXB = 29; // 底の半分の幅
const T_RY = 7;
const T_RYB = 6;
const rxAt = (y: number) => T_RX - ((T_RX - T_RXB) * (y - T_TOP)) / (T_BOT - T_RYB - T_TOP);
const TUMBLER_FILL = polygon([
  ...Array.from({ length: 17 }, (_, i) => [T_CX + T_RX * Math.cos(PI + (PI * i) / 16), T_TOP + T_RY * Math.sin(PI + (PI * i) / 16)] as const),
  ...Array.from({ length: 17 }, (_, i) => [T_CX + T_RXB * Math.cos((PI * i) / 16), T_BOT - T_RYB + T_RYB * Math.sin((PI * i) / 16)] as const),
]);
const TUMBLER = [
  ring(T_CX, T_TOP, T_RX, T_RY, 10300, 0.4), // 口
  line([T_CX - T_RX, T_TOP + 1], [T_CX - T_RXB, T_BOT - T_RYB], 10310, 0.5, 3), // 左
  line([T_CX + T_RX, T_TOP + 1], [T_CX + T_RXB, T_BOT - T_RYB], 10320, 0.5, 3), // 右
  arc(T_CX, T_BOT - T_RYB, T_RXB, T_RYB, PI * -0.02, PI * 1.02, 14, 0.4, 10330), // 底（手前）
];
const T_BASE_Y = T_BOT - 17; // 底の厚みの線
const TUMBLER_FINE = [arc(T_CX, T_BASE_Y, T_RXB - 1, T_RYB - 1, PI * 0.06, PI * 0.94, 12, 0.4, 10340)];
// 水割りの面（水面の線から、底の厚みの線まで）
const LEVEL_Y = 240;
const MIZUWARI_FILL = polygon([
  ...Array.from({ length: 13 }, (_, i) => [T_CX - rxAt(LEVEL_Y) + 1.5 + ((rxAt(LEVEL_Y) * 2 - 3) * i) / 12, LEVEL_Y] as const),
  ...Array.from({ length: 13 }, (_, i) => [T_CX + (T_RXB - 1.5) * Math.cos((PI * i) / 12), T_BASE_Y + (T_RYB - 1) * Math.sin((PI * i) / 12)] as const),
]);
const LEVEL = line([T_CX - rxAt(LEVEL_Y) + 2, LEVEL_Y], [T_CX + rxAt(LEVEL_Y) - 2, LEVEL_Y], 10350, 0.5, 3);

// ── 氷（角の丸い四角を、少し傾けて3個。奥から） ──
function ice([cx, cy]: P, hw: number, hh: number, rotRad: number, seed: number) {
  const c = Math.cos(rotRad);
  const s = Math.sin(rotRad);
  const k = 5; // 角の丸み
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
  const pts = local.map(([x, y], i) => [cx + x * c - y * s + jitter(seed + i) * 0.4, cy + x * s + y * c] as const);
  // 氷の角の稜線（短い線 1本）
  const edge = line(
    [cx + (-hw + 4) * c - (-hh + 6) * s, cy + (-hw + 4) * s + (-hh + 6) * c],
    [cx + (hw - 6) * c - (-hh + 6) * s, cy + (hw - 6) * s + (-hh + 6) * c],
    seed + 20,
    0.2,
    1,
  );
  return { fill: polygon(pts), d: smooth(pts), edge, hole: [r(cx - hw * 0.4), r(cy + hh * 0.2), 1.8, 3.6] as const };
}
const ICES = [ice([290, 252], 13, 12, -0.2, 10400), ice([325, 256], 12, 11.5, 0.24, 10440), ice([306, 282], 13.5, 12, 0.08, 10480)];

// ── マドラー（グラスの中に斜めに立てた細い棒。持ち手側はグラスの口の外へ出る） ──
const MUDDLER_A: P = [330, 336]; // 下の先（グラスの底の近く）
const MUDDLER_B: P = [276, 186]; // 上の先（グラスの外）
const MUDDLER = line(MUDDLER_A, MUDDLER_B, 10500, 0.3, 2);
const MUDDLER_KNOB = [MUDDLER_B[0] - 1, MUDDLER_B[1] - 2.5, 3] as const; // 持ち手の先の小さな玉

// ── 水差し（小ぶりのガラスの水差し。左に注ぎ口、右に取っ手。まっすぐ立った形で描き、左下の角を支点に左へ傾ける） ──
const P_TILT = 40; // 傾ける角度（度。左へ）
const P_PIVOT: P = [369.5, 214]; // 左下の角（動き終わりの位置）
const P_BC: P = [P_PIVOT[0] + 22, P_PIVOT[1]]; // 底のまん中（まっすぐ立った形）
const pt = (x: number, y: number): P => [P_BC[0] + x, P_BC[1] + y];
// 口のふち（左の先が注ぎ口）
const P_RIM: P[] = [
  pt(-30, -83),
  pt(-19, -83),
  pt(-3, -83.5),
  pt(12, -82),
  pt(20, -78),
  pt(12, -74.5),
  pt(-3, -74),
  pt(-17, -75.5),
  pt(-30, -83),
];
const P_LEFT: P[] = [pt(-30, -83), pt(-25, -77), pt(-22, -68), pt(-24, -50), pt(-25, -34), pt(-24, -12), pt(-22, 0)];
const P_RIGHT: P[] = [pt(20, -78), pt(21, -70), pt(24, -55), pt(25, -36), pt(24, -12), pt(22, 0)];
const P_BODY_PTS: P[] = [...P_RIM.slice(0, 5), ...P_RIGHT.slice(1), pt(0, 1.5), ...[...P_LEFT].reverse().slice(0, -1)];
const PITCHER_FILL = polygon(P_BODY_PTS);
const H_OUT: P[] = [pt(21, -68), pt(34, -70), pt(42, -60), pt(41, -40), pt(34, -28), pt(24, -22)];
const H_IN: P[] = [pt(23, -60), pt(31, -60), pt(34, -52), pt(33, -38), pt(29, -31), pt(24, -29)];
const HANDLE_FILL = polygon([...H_OUT, ...[...H_IN].reverse()]);
const PITCHER = [
  smooth(P_RIM), // 口のふちと注ぎ口
  smooth(P_LEFT), // 左
  smooth(P_RIGHT), // 右
  smooth([pt(-22, 0), pt(-12, 1.5), pt(12, 1.5), pt(22, 0)]), // 底
  smooth(H_OUT), // 取っ手（外）
  smooth(H_IN), // 取っ手（内）
];
const PITCHER_FINE = [smooth([pt(-21, -6), pt(0, -4.5), pt(21, -6)])]; // 底の厚み
// 動き終わりの（傾いた）形の点
const pRot = (p: P) => rotAbout(p, P_PIVOT, -P_TILT);
const P_SPOUT = pRot(pt(-30, -83));
// 水差しの中の水（傾いた形で、水面は水平。注ぎ口のすぐ下まで）。傾いた胴の形を、水面より下だけで切り取る
const P_WATER_Y = P_SPOUT[1] + 5;
function clipBelow(pts: readonly P[], y0: number): P[] {
  const out: P[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const ain = a[1] >= y0;
    const bin = b[1] >= y0;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (y0 - a[1]) / (b[1] - a[1]);
      out.push([a[0] + (b[0] - a[0]) * t, y0]);
    }
  }
  return out;
}
const P_WATER_FILL = polygon(clipBelow(P_BODY_PTS.map(pRot), P_WATER_Y));

// ── 水の流れ（水差しの注ぎ口から、タンブラーの水面まで。部品は Pour.tsx） ──
const WATER_LAND: P = [T_CX - 3, LEVEL_Y];
const WATER_POUR = pourShape({
  from: [P_SPOUT[0] - 0.5, P_SPOUT[1] + 2.5],
  ctrl: [P_SPOUT[0] - 8, P_SPOUT[1] + 26],
  to: WATER_LAND,
  w0: 5,
  w1: 3.5,
  steps: 12,
});
// 落ちる所の小さなしずく（水面の上）と、泡粒（水面の下）。[x, y, 半径]
const WATER_DROPS: readonly [number, number, number][] = [
  [WATER_LAND[0] - 11, LEVEL_Y - 8, 2],
  [WATER_LAND[0] + 11, LEVEL_Y - 9, 1.8],
];
const WATER_BUBBLES: readonly [number, number, number][] = [
  [WATER_LAND[0] - 5, LEVEL_Y + 10, 2.3],
  [WATER_LAND[0] + 5, LEVEL_Y + 16, 2],
  [WATER_LAND[0] - 1, LEVEL_Y + 25, 1.7],
];

// しずく・泡粒の、はねて出る動き（流れが当たる所から）
const splash = (at: P, [x, y]: readonly [number, number, number], from: number, to: number) =>
  anim("pour-splash", from, to, { "--sx": `${r(at[0] - x)}px`, "--sy": `${r(at[1] - y)}px` });

export default function SakeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="67 63 350 350"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 350 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。絵の中で使い回す） */}
        <WashFilter id="sake-wash" seed={17} />
      </defs>

      {/* ── 左：日本酒 ── */}
      {/* 徳利（現れる → 傾く）。外の g で、まっすぐ立った形を TILT 度傾けて置き、
          中の g で「少し傾いた形（12 度。--tilt で 14 度もどす）→ 傾いた形」へ動かす（支点はどちらも徳利の右下の角。
          まっすぐ立った形からにすると、胴の左が絵の外に出るため） */}
      <g className="sake-tokkuri scene-anim" style={anim("scene-fade-up", 4, 10, { "--dy": "10px" })}>
        <g transform={`rotate(${TILT} ${PIVOT[0]} ${PIVOT[1]})`}>
          <g className="scene-anim" style={anim("toast-tilt", 10, 16, { "--tilt": "-14deg", "--o": "100% 100%" })}>
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

      {/* 日本酒の流れは、お猪口の後ろ（お猪口の中へ入っていくように見せる） */}
      <Pour shape={SAKE_POUR} tone="food-wash-sake" filter="sake-wash" id="sake-w-pour" grow={[16, 22]} className="sake-pour pour-thin" />

      <g className="sake-choko scene-anim" style={anim("scene-fade-up", 4, 10, { "--dy": "10px" })}>
        <path d={CHOKO_FILL} className="scene-paper" stroke="none" />
        <Wash filter="sake-wash" d={CHOKO_FILL} tone="food-wash-yakimono" id="sake-w-choko" shift={[1, 0.75]} holes={[[194, 330, 2, 4.5]]} />
        {/* お猪口のお酒（注がれたあと、じわっと出る） */}
        <g className="scene-anim" style={anim("scene-fade-up", 21, 27, { "--dy": "0px" })}>
          <Wash filter="sake-wash" d={SAKE_FILL} tone="food-wash-sake" id="sake-w-sake" shift={[0.6, 0.4]} line={2.1} />
        </g>
        {CHOKO.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
      </g>
      {/* 落ちる所の波紋（内から外へ広がるように、順に描く） */}
      <g className="sake-ripple">
        {RIPPLE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 22 + i * 2, 26 + i * 2)}
          />
        ))}
      </g>
      {/* 小さなしずくのはね */}
      <g className="sake-drops">
        {SAKE_DROPS.map((b, i) => (
          <g key={i} className="scene-anim" style={splash(SAKE_LAND, b, 23 + (i % 2) * 2, 28 + (i % 2) * 2)}>
            <circle cx={b[0]} cy={b[1]} r={b[2]} className="scene-fine" />
          </g>
        ))}
      </g>

      {/* ── 右：焼酎の水割り ── */}
      {/* タンブラー。重なりの順：紙の色 → グラスの水彩 → 氷 → マドラー → 水割り → 水の流れ → 水面の線・グラスの線 */}
      <g className="sake-tumbler scene-anim" style={anim("scene-fade-up", 26, 32, { "--dy": "10px" })}>
        <path d={TUMBLER_FILL} className="scene-paper" stroke="none" />
        <Wash
          filter="sake-wash"
          d={TUMBLER_FILL}
          tone="food-wash-glass"
          id="sake-w-tumbler"
          shift={[1, 0.75]}
          holes={[[T_CX - T_RX + 8, 300, 2, 16]]}
        />
      </g>
      {/* 氷（1つずつ、上から落ちる） */}
      <g className="sake-ice">
        {ICES.map((c, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 28 + i * 2, 32 + i * 2, { "--dy": "-60px" })}>
            <path d={c.fill} className="scene-paper" stroke="none" />
            <Wash filter="sake-wash" d={c.fill} tone="food-wash-ice" id={`sake-w-ice-${i}`} shift={[0.6, 0.5]} holes={[c.hole]} />
            <path d={c.edge} className="scene-fine" />
            <path d={c.d} className="scene-line" />
          </g>
        ))}
      </g>
      {/* マドラー（タンブラーと一緒に出る） */}
      <g className="sake-muddler scene-anim" style={anim("scene-fade-up", 26, 32, { "--dy": "10px" })}>
        <path d={MUDDLER} className="scene-fine" />
        <circle cx={MUDDLER_KNOB[0]} cy={MUDDLER_KNOB[1]} r={MUDDLER_KNOB[2]} className="scene-paper scene-fine" />
      </g>
      {/* 水割りの色（水が注がれたあと、グラスの中でじわっと出る。氷にも重なって、氷がほんのり色づく） */}
      <g className="sake-mizuwari scene-anim" style={anim("scene-fade-up", 45, 52, { "--dy": "0px" })}>
        <Wash filter="sake-wash" d={MIZUWARI_FILL} tone="food-wash-shochu" id="sake-w-mizuwari" shift={[1, 0.75]} line={2.1} />
      </g>

      {/* 水差し（上から現れる → 左へ傾く）。外の g で P_TILT 度傾けて置き、中の g で少し起きた形から傾ける（支点は左下の角） */}
      <g className="sake-pitcher scene-anim" style={anim("scene-fade-up", 32, 36, { "--dy": "-10px" })}>
        <g transform={`rotate(${-P_TILT} ${P_PIVOT[0]} ${P_PIVOT[1]})`}>
          <g
            className="scene-anim sake-pitcher-tilt"
            style={anim("toast-tilt", 36, 41, { "--tilt": "20deg", "--o": `${P_PIVOT[0]}px ${P_PIVOT[1]}px` })}
          >
            <path d={PITCHER_FILL} className="scene-paper" stroke="none" />
            <path d={HANDLE_FILL} className="scene-paper" stroke="none" />
            <Wash
              filter="sake-wash"
              d={PITCHER_FILL}
              tone="food-wash-glass"
              id="sake-w-pitcher"
              shift={[0.8, 0.6]}
              holes={[[pt(14, -40)[0], pt(14, -40)[1], 2, 12]]}
            />
            <Wash filter="sake-wash" d={HANDLE_FILL} tone="food-wash-glass" id="sake-w-handle" shift={[0.6, 0.5]} />
            {PITCHER_FINE.map((d, i) => (
              <path key={i} d={d} className="scene-fine" />
            ))}
            {PITCHER.map((d, i) => (
              <path key={i} d={d} className="scene-line" />
            ))}
          </g>
        </g>
        {/* 水差しの中の水（傾いたあとに出る。水面は水平） */}
        <g className="scene-anim" style={anim("scene-fade-up", 40, 44, { "--dy": "0px" })}>
          <Wash filter="sake-wash" d={P_WATER_FILL} tone="food-wash-ice" id="sake-w-pwater" shift={[0.6, 0.5]} line={2.6} />
        </g>
      </g>

      {/* 水の流れ（グラスの口から水面まで見える。ガラスの線より後ろ） */}
      <Pour shape={WATER_POUR} tone="food-wash-ice" filter="sake-wash" id="sake-w-water" grow={[41, 46]} className="sake-water pour-thin" />

      <g className="sake-tumbler scene-anim" style={anim("scene-fade-up", 26, 32, { "--dy": "10px" })}>
        <path d={LEVEL} className="scene-fine" />
        {TUMBLER_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
        {TUMBLER.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
      </g>

      {/* 落ちる所のしずくと泡粒 */}
      <g className="sake-bubbles">
        {WATER_DROPS.map((b, i) => (
          <g key={`d${i}`} className="scene-anim" style={splash(WATER_LAND, b, 48 + i * 2, 53 + i * 2)}>
            <circle cx={b[0]} cy={b[1]} r={b[2]} className="scene-fine" />
          </g>
        ))}
        {WATER_BUBBLES.map(([x, y, rr], i) => (
          <g key={`b${i}`} className="scene-anim" style={anim("scene-pop", 50 + i * 2, 55 + i * 2)}>
            <circle cx={x} cy={y} r={rr} className="scene-fine" />
          </g>
        ))}
      </g>
    </svg>
  );
}
