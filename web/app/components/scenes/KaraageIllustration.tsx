// ─── からあげの線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の参（からあげ）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// 本物の盛り付け（代表者から届いた写真）に合わせる：浅くて広い、無地の白い平鉢を、上からのぞき込む角度で。
// ふちは広く、ゆるやかに外へ開く（ふちの帯を、外のふちと、ふちが底へ下りはじめる内の線の2本で表す）。
// 深さは浅く、手前のふちの下に胴が少しだけのぞく。高台（器の足）は見えない。模様は付けない（無地）。
// からあげは 6個で、鉢のまん中にこんもり山に積む（奥のまん中の1個がいちばん高く、中の段に3個、手前に2個）。
// 1つ1つは、ごつごつ・でこぼこした不ぞろいな形。
// 色は、料理の絵の決まり（scenes.css の先頭）の「水彩の塗り方」で、線画にうすく絵の具で塗ったように付ける
// （部品は Wash.tsx。にじみのフィルタは karaage-wash の1つを使い回す）：
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く
// ・鉢：線だけ（面は紙の色。後ろを隠す塗りだけ）。ただし、この器だけの例外（scenes.css の「料理の絵の決まり」）として、
//   ふちの帯の奥側（内の線のすぐ外）に、ごく淡い陰を1段だけ（.karaage-wash-shade。foreground をうすく）
// ・線の太さ：器とからあげの輪郭は、角煮の輪郭と同じ細めの線（.scene-outline）。中の線（ふちの内の線・
//   衣のでこぼこ）は、それより少し細い .scene-outline-fine
// ・からあげ：赤みのあるきつね色の水彩（.food-wash-karaage）。ふちは同じ色が細く濃くたまる（.wash-edge）。
//   下のほう（右下）は、同じ色をもう1段重ねて陰に（.food-wash-karaage-dark）。山のいちばん上に白い抜けを1つ
// ・衣のでこぼこ：中の短い曲線を、1つに 2〜3本
// ・湯気：山のてっぺん（奥のまん中の1個）から2本。しゅうまいと同じ描き方（共通の部品 Steam.tsx）。
//   からあげから少し浮いた所から立ち、高さはしゅうまいの奥の湯気より少し短め。時間でゆっくり揺れる
// ・部品ごとに g でまとめる：鉢（karaage-bowl）・からあげ（karaage-pieces）・湯気（karaage-steam）
// ・見る角度は上からのぞき込む角度（鉢の丸を縦に 0.64 につぶす）
// ・動きの順番：鉢のふちが描かれる（ふちの奥の陰も出る）→ からあげが1つずつ上から積まれる（奥から手前へ）→
//   水彩の塗りがじわっと出る → 湯気が2本立ちのぼる
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）。何も動かさないときの形が、動き終わった形
// ・絵は viewBox を 380 の幅に切り出して大きく見せる（湯気の上の端から鉢の手前まで入るよう、上下を合わせる。
//   線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, jitter, polygon, ring, smooth, sway, type P } from "./draw";
import { SteamFades, SteamWisps, mkWisp } from "./Steam";
import { Wash, WashFilter } from "./Wash";

// ── 鉢（浅くて広い平鉢。中心と大きさ。SQ は縦のつぶし） ──
const CX = 200;
const CY = 290;
const RX = 166; // ふちの外の半径（横）
const SQ = 0.64;
const RY = RX * SQ;
// ふちの内の線（ふちが底へ下りはじめる所）。ふちの外の 0.78 の大きさで、少し下がる（ゆるやかに開いた広いふちの帯）
const IN_RX = RX * 0.78;
const IN_RY = RY * 0.77;
const IN_CY = CY + 5;

const RIM_OUTER = ring(CX, CY, RX, RY, 8000, 0.9); // ふちの外
const RIM_INNER = ring(CX, IN_CY, IN_RX, IN_RY, 8030, 0.7); // ふちの内
// 鉢の外側（手前のふちの下に、浅い胴が少しだけのぞく）。ふちの外の左右の端から、丸く下りて手前へまわる
const BODY_PTS: P[] = [
  [CX - RX + 1, CY + 1],
  ...Array.from({ length: 21 }, (_, i): P => {
    const t = PI * 0.97 - (PI * 0.94 * i) / 20;
    return [CX + RX * 0.97 * Math.cos(t), CY + 12 + RY * 0.97 * Math.sin(t)];
  }),
  [CX + RX - 1, CY + 1],
];
const BODY = smooth(BODY_PTS);
// 後ろの線を隠す紙の色（鉢の上の面と胴）
const BOWL_PAPER = polygon([
  ...Array.from({ length: 33 }, (_, i): P => [CX + RX * Math.cos(PI + (PI * i) / 32), CY + RY * Math.sin(PI + (PI * i) / 32)]),
  ...BODY_PTS.slice().reverse(),
]);
// ふちの帯の奥側の陰（ごく淡い水彩を1段。この器だけの例外）：ふちの内の線の奥の半分から、外へ少し広がる三日月の形。
// 奥のまん中でいちばん幅が広く（帯の約半分）、左右の端で細くなって、ふちの内の線に溶け込む
const SHADE_W = 13;
const SHADE_BACK = polygon([
  ...Array.from({ length: 25 }, (_, i): P => {
    const t = PI + (PI * i) / 24;
    return [CX + IN_RX * Math.cos(t), IN_CY + IN_RY * Math.sin(t)];
  }),
  ...Array.from({ length: 23 }, (_, i): P => {
    const t = PI * 2 - (PI * (i + 1)) / 24;
    return [CX + IN_RX * Math.cos(t), IN_CY + IN_RY * Math.sin(t) + SHADE_W * Math.sin(t)];
  }),
]);

// ── からあげ（6個。ごつごつした不ぞろいな形。奥 → 手前の順に描き、手前が奥の線を隠す） ──
// [中心 x, 中心 y, 横の半径, 縦の半径, 回し]。山は鉢のまん中（見込みの上）に、こんもり盛る
const PIECE_AT: readonly (readonly [number, number, number, number, number])[] = [
  [204, 226, 48, 38, 0.15], // 奥のまん中（山のいちばん上）
  [266, 268, 48, 38, -0.35], // 中の段・右
  [140, 272, 50, 39, 0.3], // 中の段・左
  [204, 280, 50, 39, -0.1], // 中の段・まん中（上の1個の下）
  [160, 330, 52, 40, -0.2], // 手前の左
  [250, 332, 50, 39, 0.25], // 手前の右
];

// ごつごつの輪郭：角度ごとに半径を大きめに出し入れし、ところどころに、くぼみ（衣のすき間）を入れる。
// 書き始めと書き終わりを少し重ねて、筆で描いた輪にする
function cragPts(cx: number, cy: number, rx: number, ry: number, rot: number, seed: number): P[] {
  const n = 18;
  const base: P[] = [];
  for (let i = 0; i < n; i++) {
    const t = (PI * 2 * i) / n + jitter(seed + 40 + i) * 0.1;
    let w = 1 + 0.1 * jitter(seed + i) + 0.07 * Math.sin(2 * t + seed * 0.13);
    if (i % 5 === 2) w -= 0.13; // くぼみ
    if (i % 5 === 4) w += 0.06; // 出っぱり
    const ex = rx * w * Math.cos(t);
    const ey = ry * w * Math.sin(t);
    base.push([cx + ex * Math.cos(rot) - ey * Math.sin(rot), cy + ex * Math.sin(rot) + ey * Math.cos(rot)]);
  }
  return [...base, base[0], base[1]];
}

// 衣のでこぼこの中の線（短い曲線。1つに 2〜3本。からあげごとに場所と向きを変え、顔に見えないようにする）
// [中心からの横・縦の割合 x 3点]
const CRACKS: readonly (readonly (readonly [number, number])[])[][] = [
  [
    [[-0.55, -0.05], [-0.3, -0.3], [0.05, -0.38]],
    [[0.25, 0.2], [0.45, 0.05], [0.55, -0.2]],
    [[-0.2, 0.42], [0.05, 0.5]],
  ],
  [
    [[-0.45, -0.25], [-0.15, -0.42], [0.2, -0.35]],
    [[0.1, 0.15], [0.35, 0.35]],
  ],
  [
    [[-0.5, 0.15], [-0.4, -0.15], [-0.15, -0.35]],
    [[0.2, -0.1], [0.45, 0.1], [0.4, 0.4]],
  ],
  [
    [[-0.4, -0.2], [-0.1, -0.05], [0.15, -0.3]],
    [[0.35, 0.05], [0.5, 0.3]],
    [[-0.3, 0.35], [-0.05, 0.45]],
  ],
  [
    [[-0.55, -0.2], [-0.3, -0.4], [0, -0.42]],
    [[0.15, -0.05], [0.4, -0.15], [0.55, 0.1]],
    [[-0.35, 0.3], [-0.1, 0.45]],
  ],
  [
    [[-0.45, 0.1], [-0.3, -0.25], [0.05, -0.4]],
    [[0.2, 0.05], [0.5, -0.05]],
    [[0, 0.35], [0.3, 0.45]],
  ],
];

const PIECES = PIECE_AT.map(([cx, cy, rx, ry, rot], i) => {
  const s = 8300 + i * 70;
  const pts = cragPts(cx, cy, rx, ry, rot, s);
  const cracks = CRACKS[i].map((c, k) =>
    smooth(
      c.map(([fx, fy], j) => {
        const ex = rx * fx;
        const ey = ry * fy;
        return [
          cx + ex * Math.cos(rot) - ey * Math.sin(rot) + jitter(s + 20 + k * 5 + j) * 1.2,
          cy + ex * Math.sin(rot) + ey * Math.cos(rot) + jitter(s + 30 + k * 5 + j) * 1.2,
        ] as const;
      }),
    ),
  );
  // 陰（右下へずらした、ふちのでこぼこな丸。同じ色をもう1段。からあげの形で切り取る）
  const shade = polygon(
    Array.from({ length: 21 }, (_, j) => {
      const t = (PI * 2 * j) / 20;
      const w = 1 + 0.08 * jitter(s + 60 + (j % 20));
      return [cx + rx * 0.42 + rx * 0.95 * w * Math.cos(t), cy + ry * 0.5 + ry * 0.9 * w * Math.sin(t)] as const;
    }),
  );
  return { fill: polygon(pts), outline: smooth(pts), cracks, shade };
});
// 山のいちばん上（奥のまん中の1個）の白い抜け
const TOP_HOLE = [[190, 210, 6, 3.4]] as const;

// ── 湯気（2本。山のてっぺん〈奥のまん中の1個。上のふちは y 188 あたり〉から、少し浮いた所から立ちのぼる） ──
// 描き方はしゅうまいと同じ（Steam.tsx）。高さは、しゅうまいの奥の湯気（カードの高さの約 3割）より少し短め（約 2割強）
const STEAM = [
  mkWisp(191, 188, 90, -3, 0.6, 6.5, 8700, 0.42),
  mkWisp(221, 192, 102, 3, 3.4, 6.5, 8720, 0.42),
];
const STEAM_SWAY = [sway(5.0, -0.7), sway(5.7, -2.3)];

// 水彩がじわっと出る動き（からあげごとに少しずつずらす。このあとに湯気が立ちのぼる）
const washAnim = (i: number) => anim("scene-fade-up", 50 + i, 56 + i * 0.7, { "--dy": "0px" });

export default function KaraageIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="10 70 380 380"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 380 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。からあげで1つを使い回す） */}
        <WashFilter id="karaage-wash" seed={11} />
        {/* 湯気の濃さ（1本ずつ。根元と上の端は透明） */}
        <SteamFades id="karaage-steam-fade" wisps={STEAM} />
        {PIECES.map((p, i) => (
          <clipPath key={i} id={`karaage-clip-${i}`}>
            <path d={p.fill} />
          </clipPath>
        ))}
      </defs>

      {/* 1. 鉢（線だけ。ふちの外 → ふちの内 → 胴の順に描かれる。模様は付けない） */}
      <g className="karaage-bowl">
        <g className="scene-anim" style={anim("scene-fade-up", 4, 8, { "--dy": "0px" })}>
          <path d={BOWL_PAPER} className="scene-paper" stroke="none" />
        </g>
        {/* ふちの帯の奥側の、ごく淡い陰（この器だけの例外。水彩の塗り方で） */}
        <g className="scene-anim" style={anim("scene-fade-up", 9, 16, { "--dy": "0px" })}>
          <Wash filter="karaage-wash" d={SHADE_BACK} tone="karaage-wash-shade" id="karaage-w-back" shift={[1, 0.75]} line={1.45} />
        </g>
        <path d={RIM_OUTER} pathLength={1} className="scene-outline scene-stroke-draw scene-anim" style={anim("scene-draw", 4, 12)} />
        <path d={RIM_INNER} pathLength={1} className="scene-outline-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 7, 14)} />
        <path d={BODY} pathLength={1} className="scene-outline scene-stroke-draw scene-anim" style={anim("scene-draw", 9, 15)} />
      </g>

      {/* 2. からあげ（奥から1つずつ、上から積まれる）。
          1つごとに：後ろを隠す紙の色 → 水彩（いちばん最後にじわっと出る）→ 輪郭と衣の線 */}
      <g className="karaage-pieces">
        {PIECES.map((p, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 21 + i * 4, 28 + i * 4, { "--dy": "-44px" })}>
            <path d={p.fill} className="scene-paper" stroke="none" />
            <g className="scene-anim" style={washAnim(i)}>
              <g>
                <Wash filter="karaage-wash" d={p.fill} tone="food-wash-karaage" id={`karaage-w-${i}`} shift={[1, 0.75]} holes={i === 0 ? TOP_HOLE : []} line={1.8} />
                <g clipPath={`url(#karaage-clip-${i})`}>
                  <Wash filter="karaage-wash" d={p.shade} tone="food-wash-karaage-dark" id={`karaage-w-shade-${i}`} shift={[0.75, 0.75]} />
                </g>
              </g>
            </g>
            <path d={p.outline} className="scene-outline" />
            {p.cracks.map((d, k) => (
              <path key={k} d={d} className="scene-outline-fine" />
            ))}
          </g>
        ))}
      </g>

      {/* 3. 湯気（水彩がじわっと出たあと、山のてっぺんから2本立ちのぼる。時間でゆっくり揺れる） */}
      <SteamWisps className="karaage-steam" id="karaage-steam-fade" wisps={STEAM} sways={STEAM_SWAY} timing={[[54, 59], [56, 60]]} />
    </svg>
  );
}
