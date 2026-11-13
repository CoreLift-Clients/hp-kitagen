// ─── からあげの線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の参（からあげ）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （からあげにだけ、重なった後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（油のパチパチの短い線）
// ・部品ごとに g でまとめる：お皿（karaage-plate）・からあげ5個（karaage-pieces）・油の線（karaage-oil）
// ・動きの順番：お皿が現れる → からあげが1つずつ上から落ちてくる（奥から手前へ）→
//   油の短い線がパチパチと出て消える（動き終わりは消えた形。動かないときは見えたまま）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arc, blobPts, jitter, line, polygon, ring, smooth, type P } from "./draw";

// お皿の中心と大きさ（少し上から見た丸いお皿）
const CX = 200;
const CY = 280;

// ── お皿 ──
const PLATE = [
  ring(CX, CY, 172, 62, 8000), // ふち（外）
  arc(CX, CY + 12, 166, 60, PI * 0.04, PI * 0.96, 18, 0.9, 8040), // お皿の厚み（手前の下のふち）
];
const PLATE_FINE = [ring(CX, CY + 2, 134, 46, 8060, 0.8)]; // 見込み（内側の段）

// ── からあげ（5個。ごつごつした丸。奥 → 手前の順に描き、手前が奥の線を隠す） ──
// [中心 x, 中心 y, 半径]
const PIECE_AT: readonly [number, number, number][] = [
  [200, 214, 44], // 奥のまん中（上に積む）
  [136, 248, 46], // 左
  [266, 246, 46], // 右
  [170, 294, 45], // 手前の左
  [242, 296, 43], // 手前の右
];

function piece([cx, cy, r]: readonly [number, number, number], i: number) {
  const s = 8100 + i * 60;
  const pts = blobPts(cx, cy, r, r * 0.82, s, 5, 0.065, 22);
  // 衣のでこぼこ（中の短い筋 2本。左右で形と向きを変え、顔に見えないようにする）
  const flip = i % 2 === 0 ? 1 : -1;
  const cracks = [
    smooth([
      [cx - r * 0.5 * flip, cy - r * 0.02],
      [cx - r * 0.3 * flip + jitter(s + 30) * 2, cy - r * 0.2],
      [cx - r * 0.02 * flip, cy - r * 0.3],
      [cx + r * 0.12 * flip, cy - r * 0.42],
    ]),
    line([cx + r * 0.16 * flip, cy + r * 0.38], [cx + r * 0.46 * flip, cy + r * 0.16], s + 40, 0.6, 1),
  ];
  return { fill: polygon(pts), outline: smooth(pts), cracks };
}
const PIECES = PIECE_AT.map(piece);

// ── 油のパチパチ（差し色。からあげのまわりに短い線） ──
const OIL: readonly [P, P][] = [
  [
    [84, 196],
    [70, 184],
  ],
  [
    [118, 162],
    [112, 146],
  ],
  [
    [200, 144],
    [200, 126],
  ],
  [
    [282, 160],
    [289, 144],
  ],
  [
    [318, 192],
    [332, 180],
  ],
  [
    [334, 234],
    [350, 230],
  ],
];
const OIL_LINES = OIL.map(([a, b], i) => line(a, b, 8400 + i * 5, 0.3, 1));

export default function KaraageIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 40 400 400"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="karaage-plate scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        <path d={polygon(blobPts(CX, CY, 172, 62, 0, 0, 0, 32))} className="scene-paper" stroke="none" />
        {PLATE.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {PLATE_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="karaage-pieces">
        {PIECES.map((p, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 14 + i * 5, 22 + i * 5, { "--dy": "-48px" })}>
            <path d={p.fill} className="scene-paper" stroke="none" />
            <path d={p.outline} className="scene-line" />
            {p.cracks.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
          </g>
        ))}
      </g>

      {/* 差し色（accent）はここだけ：油のパチパチ */}
      <g className="karaage-oil">
        {OIL_LINES.map((d, i) => (
          <g key={i} className="scene-anim" style={anim("scene-flicker", 42 + (i % 3) * 3, 52 + (i % 3) * 3)}>
            <path d={d} className="scene-fine scene-accent" />
          </g>
        ))}
      </g>
    </svg>
  );
}
