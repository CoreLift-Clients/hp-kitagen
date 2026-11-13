// ─── 席（2階の座敷の上がり口に、脱いだ靴が並んでいく）の線画 ───
// トップの「席」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// きたげんの2階の座敷は、靴を脱いで上がり、座布団がある。その上がり口を、少し上から見た形で描く：
//   横に長い木の段（上がりかまち。上の面と、木目の入った手前の面）・段の奥の畳（へりの帯と、一部にだけ薄い畳の目）
//   ・左奥に座布団の丸みのある角と房
//   ・段の手前（土間の側）に、脱いでそろえた靴が4足（つま先を手前に向けて、左右をそろえて置いた形。
//     間隔と向きを少しずつ変えて、人が脱いでそろえた感じにする）
//   左から、革靴・スニーカー・パンプス・小さな子どもの靴
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りはなし
//   （子どもの足だけ、後ろの線を隠す塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（スニーカーの横の線）
// ・部品ごとに g でまとめる：段・畳・座布団（seat-room）・靴4足（seat-shoes。1足ごとに g）・子どもの足（seat-feet）
// ・動きの順番：段・畳・座布団の線が描かれる → 1足目（革靴）が少し上から置かれるように現れる →
//   2足目・3足目・4足目が、間をあけて1足ずつ横に並んでいく →
//   子どもの靴下の足が、靴の中から少し持ち上がり、段の上へ一歩上がる（左足が先）。
//   最後は4足がそろって並び、子どもの両足が段の上に乗った形で止まる（脱いだ子どもの靴は元の場所に残る）
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

// ── 座敷の上がり口（段・畳・座布団） ──
// 段（上がりかまち）は、上の面と手前の面（木の板の正面）を描き分ける：
//   上の面 … 奥のふち（畳との境。細い線）と、手前のふち（段の鼻。太い線）のあいだ
//   手前の面 … 段の鼻と下のふちのあいだ。横の木目を、短く途切れ途切れに入れる
const STEP = [
  line([6, 127], [394, 125], 6000, 0.9, 5), // 段の鼻（上の面と手前の面の境）
  line([6, 146], [394, 144], 6010, 0.9, 5), // 手前の面の下のふち（土間との境）
];
const STEP_FINE = [
  line([6, 112.5], [394, 111], 6015, 0.6, 5), // 上の面の奥のふち（畳との境）
];
// 手前の面の木目（3本。それぞれ短い線を途切れ途切れに）
const GRAIN = [
  line([18, 133.5], [74, 133], 6050, 0.45, 2),
  line([102, 132.8], [158, 132.4], 6055, 0.45, 2),
  line([196, 137.6], [262, 137], 6060, 0.45, 2),
  line([304, 137], [338, 136.8], 6065, 0.45, 1),
  line([58, 141.2], [112, 140.8], 6070, 0.45, 2),
  line([254, 140.4], [352, 139.6], 6075, 0.45, 3),
];
const ROOM_FINE = [
  line([6, 90], [394, 88], 6020, 0.7, 5), // 畳のへり（手前）
  line([6, 83], [394, 81], 6030, 0.7, 5), // 畳のへり（奥）。細い線2本で、へりの帯を表す
  line([300, 74], [298, 16], 6040, 0.5, 2), // 畳と畳のつなぎめ（へりから離して短く。座布団・段とつながらない位置）
];
// 畳の目（へりの奥の一部にだけ、細い横線を薄く。濃さは g の opacity で控える）
const TATAMI = [
  line([138, 75.5], [232, 74.8], 6080, 0.35, 3),
  line([150, 70], [246, 69.3], 6085, 0.35, 3),
  line([142, 64.5], [224, 63.9], 6090, 0.35, 2),
  line([160, 59], [238, 58.4], 6095, 0.35, 2),
];
// 座布団（左奥。ほとんどは絵の外で、右手前の角とその近くだけがのぞく）。
// 角は、綿が入ってふっくらした丸みのある形にする
const CUSHION = [
  smooth(
    (
      [
        [2, 56],
        [40, 55.5],
        [72, 54.2],
        [92, 51.8],
        [103.5, 46.5],
        [109.5, 37],
        [111.5, 22],
        [110, 2],
      ] as const
    ).map(([x, y], i) => [x + jitter(6100 + i) * 0.5, y] as const),
  ),
];
// 座布団の厚み（手前のふちの下に1本。角の丸みの手前で止める）
const CUSHION_FINE = [
  smooth([
    [2, 63],
    [42, 62.4],
    [74, 61],
    [92, 58.6],
  ]),
];
// 角の房（短い線4本を、角の先から束ねて垂らす）
const TASSEL = [
  line([105.2, 48.6], [108.6, 59], 6150, 0.3, 1),
  line([106.2, 48], [111.8, 58.4], 6155, 0.3, 1),
  line([107.2, 47.2], [114.8, 56.8], 6160, 0.3, 1),
  line([108, 46.2], [117.2, 54.6], 6165, 0.3, 1),
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
  ang: number; // 1足の向き（度。＋で時計回り）。人が脱いでそろえた形に見えるよう、足ごとに 2〜4° ずらす
};

// 点を (px, py) を中心に deg 度まわす
function rot([x, y]: P, px: number, py: number, deg: number): P {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [px + (x - px) * c - (y - py) * s, py + (x - px) * s + (y - py) * c];
}

function buildPair(s: ShoeSpec, seed: number) {
  const gap = s.w + 2.5; // まん中から、それぞれの靴のまん中まで
  const shoes = [-1, 1].map((side, k) => {
    const cx = s.cx + side * gap;
    const sd = seed + k * 40;
    // 1足のまん中を中心に s.ang だけまわす。左右の靴は、ほぼそろえたまま（右だけ 0.6° 足す）
    const ang = s.ang + k * 0.6;
    const at = ([v, u]: readonly [number, number], i: number, amp: number): P =>
      rot(
        [cx + side * u * s.w + jitter(sd + i) * amp, s.heel + v * s.len + jitter(sd + i + 17) * amp],
        s.cx,
        s.heel + s.len / 2,
        ang,
      );
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
    cx: 58,
    ang: -3,
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
    cx: 166,
    ang: 2.5,
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
    cx: 259,
    ang: -2,
    heel: 168,
    len: 92,
    w: 16,
    shape: POINTED,
    open: opening(0.06, 0.6, 0.6),
    details: [],
  },
  // 4足目：小さな子どもの靴（小さめ。丸いつま先と、甲のベルト）
  {
    cx: 346,
    ang: 3.5,
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
  [18, 24],
  [25, 31],
  [32, 38],
  [39, 45],
];

// ── 子どもの足（4足目の靴から抜けて、段の上へ一歩上がる） ──
// くるぶしから下の両足を、靴下をはいた形で描く（足の形の輪郭と、足首の口ゴムの線1本だけ。指は描かない）。
// 子どもは座敷のほうを向いているので、かかとが手前（下）、つま先が奥（上）。
// 足首から上は描かない（口ゴムの線で切れて、すねは見る人の側へ立ち上がる形）。
// 輪郭の中は場面の背景の色で塗り、後ろの線（段の奥のふち・靴）を隠す。
// 止まった形（動きのない形）は、段の上に両足が乗った形
const FOOT: Shape = [
  [0, 0],
  [0.04, 0.64],
  [0.2, 0.88],
  [0.45, 0.9],
  [0.7, 0.96],
  [0.88, 0.84],
  [0.98, 0.46],
  [1.02, -0.06],
  [0.97, -0.52],
  [0.84, -0.8],
  [0.64, -0.78],
  [0.44, -0.66],
  [0.2, -0.78],
  [0.04, -0.62],
];
const SOCK_CUFF: Shape = [
  [0.3, -0.84],
  [0.22, -0.24],
  [0.21, 0.3],
  [0.3, 0.88],
]; // 足首の口ゴム（かかとの側へふくらむ弧）
const FOOT_CX = 346; // 子どもの靴のまん中と同じ
const FOOT_HEEL = 125; // 段の上の面（鼻の少し奥）にかかとを置く
const FOOT_LEN = 40;
const FOOT_W = 12.5;
// 靴の中の位置（動き始め）から、段の上（止まった形）までの縦の差（px ＝ viewBox の1単位）
const FOOT_FROM_SHOE = 75;
const FEET = [-1, 1].map((side, k) => {
  const cx = FOOT_CX + side * (FOOT_W + 2);
  const sd = 6700 + k * 40;
  const at = ([v, u]: readonly [number, number], i: number, amp: number): P => [
    cx + side * u * FOOT_W + jitter(sd + i) * amp,
    FOOT_HEEL - v * FOOT_LEN + jitter(sd + i + 17) * amp,
  ];
  return {
    outline: closed(FOOT.map((p, i) => at(p, i, 0.35))),
    cuff: smooth(SOCK_CUFF.map((p, i) => at(p, i + 30, 0.15))),
  };
});
// 左足が先、右足があと。子どもの靴が置かれ終わって（45）、少し間をあけてから
const FOOT_RANGES: readonly [number, number][] = [
  [50, 58],
  [52, 60],
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
        {STEP.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 4 + i * 2, 12 + i * 2)}
          />
        ))}
        {STEP_FINE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 5, 12)}
          />
        ))}
        {GRAIN.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 10 + (i % 3), 14 + (i % 3))}
          />
        ))}
        {ROOM_FINE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 6 + i * 2, 13 + i)}
          />
        ))}
        {/* 畳の目は薄く（opacity は g に付ける。path の opacity は動きで上書きされるため） */}
        <g opacity={0.35}>
          {TATAMI.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="scene-fine scene-stroke-draw scene-anim"
              style={anim("scene-draw", 10 + i, 15 + i)}
            />
          ))}
        </g>
        {CUSHION.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 9, 15)}
          />
        ))}
        {CUSHION_FINE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 11, 16)}
          />
        ))}
        {TASSEL.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 13 + i * 0.5, 17 + i * 0.5)}
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

      {/* 子どもの足（靴の中 → 少し持ち上がる → 段の上へ。止まった形は段の上） */}
      <g className="seat-feet">
        {FEET.map((foot, i) => (
          <g
            key={i}
            className="scene-anim"
            style={anim("seat-step", FOOT_RANGES[i][0], FOOT_RANGES[i][1], { "--fy": `${FOOT_FROM_SHOE}px` })}
          >
            <path d={foot.outline} className="scene-line scene-paper" />
            <path d={foot.cuff} className="scene-fine" />
          </g>
        ))}
      </g>
    </svg>
  );
}
