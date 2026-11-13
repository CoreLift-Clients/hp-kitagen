// ─── 席（2階の座敷の上がり口に、脱いだ靴が並んでいく）の線画 ───
// トップの「席」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// きたげんの2階の座敷は、靴を脱いで上がり、座布団がある。その上がり口を、少し上から見た形で描く：
//   横に長い木の段（上がりかまち。厚みを線2本で表す）・段の奥の畳のへりと、座布団の角が少しだけ
//   ・段の手前（土間の側）に、脱いでそろえた靴が4足（つま先を手前に向けて、左右をそろえて置いた形）
//   左から、革靴・スニーカー・パンプス・小さな子どもの靴
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りはなし
// ・差し色は accent を1か所だけ（スニーカーの横の線）
// ・部品ごとに g でまとめる：段・畳・座布団（seat-room）・靴4足（seat-shoes。1足ごとに g）
// ・動きの順番：段・畳のへり・座布団の角の線が描かれる → 1足目（革靴）が少し上から置かれるように現れる →
//   2足目・3足目・4足目が、間をあけて1足ずつ横に並んでいく。最後は4足がそろって並んだ形で止まる
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { type P, anim, jitter, line, r1, smooth } from "./draw";

// 閉じた形をなめらかな曲線でつなぐ（Catmull-Rom → 3次ベジェ。始めと終わりに角ができないように輪でつなぐ）
function closed(pts: readonly P[]): string {
  const n = pts.length;
  const at = (i: number) => pts[(i + n) % n];
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)}`;
    d += ` ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)}`;
    d += ` ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

// ── 座敷の上がり口（段・畳のへり・座布団の角） ──
const ROOM = [
  line([6, 127], [394, 125], 6000, 0.9, 5), // 上がりかまち（段）の上のふち
  line([6, 146], [394, 144], 6010, 0.9, 5), // 上がりかまちの下のふち。2本で木の段の厚みを表す
];
const ROOM_FINE = [
  line([6, 90], [394, 88], 6020, 0.7, 5), // 畳のへり（手前）
  line([6, 83], [394, 81], 6030, 0.7, 5), // 畳のへり（奥）。細い線2本で、へりの帯を表す
  line([262, 81], [258, 4], 6040, 0.5, 2), // 畳と畳のつなぎめ
];
// 座布団の角（左奥。ほとんどは絵の外で、右手前の角だけがのぞく）
const CUSHION = [
  smooth(
    (
      [
        [2, 55],
        [40, 54],
        [78, 52.5],
        [100, 50],
        [109, 44],
        [111, 32],
        [108, 2],
      ] as const
    ).map(([x, y], i) => [x + jitter(6100 + i) * 0.5, y] as const),
  ),
];
// 座布団の厚み（手前のふちの下に1本。角で上の線に寄っていく）
const CUSHION_FINE = [
  smooth([
    [2, 62],
    [44, 61],
    [84, 59],
    [104, 56],
    [114, 48],
  ]),
];

// ── 靴 ──
// 1つの靴の形は、かかと（v=0）→ つま先（v=1）の位置 v と、横の幅の割合 u（＋が外側）の点の並びで決める。
// 左右の靴は、この形を左右に返して並べる（内側どうしが向き合う）
type Shape = readonly (readonly [number, number])[];

// ふつうの靴の形（かかとから外側を通ってつま先へ、内側を通ってかかとへ戻る）
const BASE: Shape = [
  [0, 0],
  [0.03, 0.46],
  [0.13, 0.68],
  [0.32, 0.76],
  [0.52, 0.84],
  [0.7, 0.95],
  [0.85, 0.88],
  [0.95, 0.56],
  [1, 0.04],
  [0.97, -0.38],
  [0.87, -0.76],
  [0.7, -0.86],
  [0.5, -0.68],
  [0.3, -0.66],
  [0.13, -0.62],
  [0.03, -0.42],
];
// つま先が丸く広い形（スニーカー・子どもの靴）
const ROUND: Shape = [
  [0, 0],
  [0.03, 0.5],
  [0.13, 0.72],
  [0.34, 0.8],
  [0.55, 0.88],
  [0.74, 0.97],
  [0.9, 0.86],
  [0.98, 0.5],
  [1, 0],
  [0.98, -0.5],
  [0.9, -0.84],
  [0.74, -0.9],
  [0.55, -0.74],
  [0.34, -0.7],
  [0.13, -0.66],
  [0.03, -0.46],
];
// つま先が細くなる形（パンプス）
const POINTED: Shape = [
  [0, 0],
  [0.03, 0.46],
  [0.14, 0.7],
  [0.36, 0.78],
  [0.56, 0.9],
  [0.72, 0.9],
  [0.86, 0.66],
  [0.95, 0.36],
  [1, 0.04],
  [0.96, -0.26],
  [0.86, -0.56],
  [0.72, -0.76],
  [0.54, -0.72],
  [0.34, -0.64],
  [0.14, -0.62],
  [0.03, -0.42],
];

// 履き口（かかと寄りの、細長い輪）
function opening(v0: number, v1: number, u: number): Shape {
  const pts: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    pts.push([(v0 + v1) / 2 - ((v1 - v0) / 2) * Math.cos(t), u * Math.sin(t)]);
  }
  return pts;
}

type ShoeSpec = {
  cx: number; // 1足（左右2つ）のまん中
  heel: number; // かかとの y
  len: number; // 長さ
  w: number; // 半分の幅
  shape: Shape;
  open: Shape;
  // 細かい線（ひも・つま先の飾りなど）。[v, u] の点の並び（外側が ＋）
  details: Shape[];
  accent?: Shape; // 差し色の線（スニーカーの横の線だけ）
};

function buildPair(s: ShoeSpec, seed: number) {
  const gap = s.w + 2.5; // まん中から、それぞれの靴のまん中まで
  const shoes = [-1, 1].map((side, k) => {
    const cx = s.cx + side * gap;
    const sd = seed + k * 40;
    const at = ([v, u]: readonly [number, number], i: number, amp: number): P => [
      cx + side * u * s.w + jitter(sd + i) * amp,
      s.heel + v * s.len + jitter(sd + i + 17) * amp,
    ];
    return {
      outline: closed(s.shape.map((p, i) => at(p, i, 0.45))),
      open: closed(s.open.map((p, i) => at(p, i + 30, 0.25))),
      details: s.details.map((d) => smooth(d.map((p, i) => at(p, i + 50, 0.15)))),
      accent: s.accent ? smooth(s.accent.map((p, i) => at(p, i + 70, 0.15))) : null,
    };
  });
  return shoes;
}

const PAIRS: ShoeSpec[] = [
  // 1足目：革靴（つま先は少し丸く。つま先の切り替えの線と、履き口の前のひもの線）
  {
    cx: 62,
    heel: 166,
    len: 96,
    w: 18.5,
    shape: BASE,
    open: opening(0.07, 0.4, 0.5),
    details: [
      [
        [0.76, -0.74],
        [0.8, -0.3],
        [0.81, 0.1],
        [0.78, 0.6],
      ], // つま先の切り替え
      [
        [0.41, 0.02],
        [0.5, 0.04],
        [0.58, 0.02],
      ], // ひも
    ],
  },
  // 2足目：スニーカー（つま先は丸く広い。ひもは短い線3本、つま先のゴムの線、横に差し色の線）
  {
    cx: 164,
    heel: 164,
    len: 98,
    w: 21,
    shape: ROUND,
    open: opening(0.07, 0.36, 0.52),
    details: [
      [
        [0.45, -0.3],
        [0.455, 0.3],
      ],
      [
        [0.53, -0.32],
        [0.535, 0.32],
      ],
      [
        [0.61, -0.34],
        [0.615, 0.34],
      ],
      [
        [0.86, -0.8],
        [0.89, -0.2],
        [0.89, 0.3],
        [0.86, 0.8],
      ], // つま先のゴム
    ],
    accent: [
      [0.24, 0.5],
      [0.44, 0.56],
      [0.66, 0.64],
    ], // 横の線（外側に1本）
  },
  // 3足目：パンプス（つま先が細い。大きな履き口）
  {
    cx: 258,
    heel: 168,
    len: 92,
    w: 16,
    shape: POINTED,
    open: opening(0.06, 0.6, 0.6),
    details: [],
  },
  // 4足目：小さな子どもの靴（小さめ。丸いつま先と、甲のベルト）
  {
    cx: 340,
    heel: 166,
    len: 62,
    w: 14,
    shape: ROUND,
    open: opening(0.08, 0.4, 0.5),
    details: [
      [
        [0.5, -0.72],
        [0.53, 0],
        [0.5, 0.82],
      ],
      [
        [0.64, -0.8],
        [0.67, 0],
        [0.64, 0.88],
      ],
    ], // 甲のベルト
  },
];
const SHOES = PAIRS.map((s, i) => buildPair(s, 6200 + i * 100));

// 1足ずつ、間をあけて現れる（少し上から置かれるように）
const SHOE_RANGES: readonly [number, number][] = [
  [22, 29],
  [32, 39],
  [42, 49],
  [52, 59],
];

export default function SeatIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 280"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="seat-room">
        {ROOM.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 4 + i * 3, 16 + i * 3)}
          />
        ))}
        {ROOM_FINE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 7 + i * 3, 18 + i)}
          />
        ))}
        {CUSHION.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 10, 19)}
          />
        ))}
        {CUSHION_FINE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 13, 20)}
          />
        ))}
      </g>

      <g className="seat-shoes">
        {SHOES.map((pair, i) => (
          <g
            key={i}
            className="scene-anim"
            style={anim("scene-fade-up", SHOE_RANGES[i][0], SHOE_RANGES[i][1], { "--dy": "-12px" })}
          >
            {pair.map((shoe, k) => (
              <g key={k}>
                <path d={shoe.outline} className="scene-line" />
                <path d={shoe.open} className="scene-fine" />
                {shoe.details.map((d, j) => (
                  <path key={j} d={d} className="scene-fine" />
                ))}
                {/* 差し色（accent）はここだけ：スニーカーの横の線 */}
                {shoe.accent && <path d={shoe.accent} className="scene-fine scene-accent" />}
              </g>
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
