// ─── 席（2階の座敷の上がり口に、脱いだ靴が並んでいく）の線画 ───
// トップの「席」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// きたげんの2階の座敷は、靴を脱いで上がり、座布団がある。その上がり口を、少し上から見た形で描く：
//   横に長い木の段（上がりかまち。上の面と、木目の入った手前の面）・段の奥の畳（へりの帯と、一部にだけ薄い畳の目）
//   ・左奥に、ふっくらした四角い座布団の角（角の2辺と厚み）と房
//   ・段の手前（土間の側）に、脱いでそろえた靴が4足（つま先を手前に向けて、左右をそろえて置いた形。
//     間隔と向きを少しずつ変えて、人が脱いでそろえた感じにする）
//   左から、革靴・スニーカー・パンプス・小さな子どもの靴
//   ・子どもの靴をそろえ直す右手（手首から先と袖口。動きの途中だけ見える）
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りはなし
//   （手と袖口だけ、後ろの線を隠す塗り --scene-paper を付ける。描き方は店主紹介の手元の絵 OwnerHandsIllustration.tsx にそろえる）
// ・差し色は accent を1か所だけ（スニーカーの横の線）。手には使わない
// ・部品ごとに g でまとめる：段・畳・座布団（seat-room）・靴4足（seat-shoes。1足ごとに g）・
//   子どもの右の靴と手（seat-fix ＝ 靴 ＋ seat-hand）
// ・動きの順番：段・畳・座布団の線が描かれる → 1足目（革靴）が少し上から置かれるように現れる →
//   2足目・3足目が、間をあけて1足ずつ横に並んでいく → 4足目（子どもの靴）が、右の靴だけつま先が外へ開いて
//   少し前にずれた形で置かれる → 上（段の奥）から手が下りてきて、右の靴の横にふれる →
//   手と一緒に右の靴が回ってまっすぐになり、左の靴とそろう → 手が上へ引いて消える。
//   最後は手が見えず、4足がそろって並んだ形で止まる（何も動かさないときの形がこれ）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { type P, anim, jitter, line, polygon, r1, smooth } from "./draw";

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
// ふっくらした四角い座布団の角：上の面の2辺（手前の横の辺と、奥へ向かう右の辺。どちらも外へ少しふくらむ）と、
// その下の厚み（2本目の線。手前の辺の下から角を回って、右の辺の下へ）で描く。畳のへり（y 81）より奥に収める
const CUSHION = [
  smooth(
    (
      [
        [2, 50],
        [30, 51.6],
        [60, 51.8],
        [84, 50.2],
        [97, 47.4],
        [102.5, 42.5],
        [104.5, 32],
        [105, 18],
        [104, 2],
      ] as const
    ).map(([x, y], i) => [x + jitter(6100 + i) * 0.4, y + jitter(6110 + i) * 0.3] as const),
  ),
];
const CUSHION_FINE = [
  smooth(
    (
      [
        [2, 58],
        [30, 59.8],
        [60, 60],
        [86, 58.4],
        [101, 55],
        [108.5, 48],
        [111, 36],
        [111.5, 26],
        [111, 16],
      ] as const
    ).map(([x, y], i) => [x + jitter(6120 + i) * 0.4, y + jitter(6130 + i) * 0.3] as const),
  ),
  line([99.5, 46.5], [104.5, 53.5], 6140, 0.2, 1), // 角の厚み（上の面の角と、下の角をつなぐ短い線）
];
// 角の房（短い線4本を、角の先から束ねて垂らす）
const TASSEL = [
  line([105, 54], [107.6, 64.6], 6150, 0.3, 1),
  line([106, 53.6], [110.6, 64], 6155, 0.3, 1),
  line([107, 53], [113.6, 62.6], 6160, 0.3, 1),
  line([107.8, 52.2], [116, 60.6], 6165, 0.3, 1),
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
    cx: 340,
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
  [18, 23],
  [24, 29],
  [30, 35],
  [36, 41],
];

// ── 子どもの右の靴をそろえ直す（4足目） ──
// 子どもの右の靴は、置かれたときはつま先が外へ 22° 開き、少し前（手前）にずれている。
// 右上から右手が入ってきて靴のかかとをつまみ、手と一緒に靴が回ってまっすぐになり、手は右上へ引いて消える。
// 靴と手を1つの g（seat-fix）に入れ、靴のまん中を中心に回す（つまんだかかとは手からずれない）。
// 手（seat-hand）はその中で、腕の向きにそって入ってきて・引く
const CHILD = PAIRS[3];
const FIX_PIVOT = rot(
  [CHILD.cx + CHILD.w + 2.5, CHILD.heel + CHILD.len / 2],
  CHILD.cx,
  CHILD.heel + CHILD.len / 2,
  CHILD.ang + 0.6,
); // 右の靴のまん中（buildPair と同じまわし方）
const FIX_VARS = { "--o": `${r1(FIX_PIVOT[0])}px ${r1(FIX_PIVOT[1])}px`, "--fix-rot": "-22deg", "--fix-dy": "6px" };

// 右手（手首から先）。段の奥（座敷の側、右上）から斜めに差し出し、手のひらを下に、手の甲をやや上に向けて少し寝かせた形。
// 子どもの右の靴の「かかとのふち」だけを、親指と人さし指の指先で軽くつまむ（靴を丸ごとつかまない）。
// 中指・薬指・小指は軽く曲げて手のひらの側へ寄せ、ひとかたまりに見せる（分かれ目は短い線2本だけ）。
// 指先は丸く、爪は描かない。
// 形は、手の向きにそった手の中の座標 [t, s] で決める（t … 手首 0 から指先へ。s … 横。＋が親指の側）。
// HAND_ANG だけ真下から右へ傾けた向き（＝左下へ差し出す向き）で、かかとのふちに指先を合わせて置く。
// 手と靴は回る g（seat-fix）の中にあるので、ゆがんだ靴をつまんでいる形では、手は 22° 立った向き（真下から 40°）に見える。
// 描き方は OwnerHandsIllustration.tsx の手と同じ：輪郭（scene-line）と、輪郭の中の塗り（scene-paper）
const HAND_ANG = 62; // 手の向き（真下から、度）。そろった靴のときの向き
const HAND_K = 1.08; // 手首から人さし指の先まで 約 62（子どもの靴の長さ 62 と同じくらい）
const HA: P = [-Math.sin((HAND_ANG * Math.PI) / 180), Math.cos((HAND_ANG * Math.PI) / 180)]; // 手首 → 指先
const HN: P = [Math.cos((HAND_ANG * Math.PI) / 180), Math.sin((HAND_ANG * Math.PI) / 180)]; // 横（＋が親指の側）
type L = readonly [number, number];
// 親指の先と人さし指の先のまん中（手の中の座標）を、かかとのふちに合わせる
const PINCH_LOCAL: L = [53.5, 12.4];
const HEEL_PINCH = rot(
  [CHILD.cx + CHILD.w + 2.5, CHILD.heel + 0.5],
  CHILD.cx,
  CHILD.heel + CHILD.len / 2,
  CHILD.ang + 0.6,
);
const HO: P = [
  HEEL_PINCH[0] - HAND_K * (PINCH_LOCAL[0] * HA[0] + PINCH_LOCAL[1] * HN[0]),
  HEEL_PINCH[1] - HAND_K * (PINCH_LOCAL[0] * HA[1] + PINCH_LOCAL[1] * HN[1]),
];
const hp = ([t, sx]: L, seed = 0, amp = 0): P => [
  HO[0] + HAND_K * (t * HA[0] + sx * HN[0]) + jitter(seed) * amp,
  HO[1] + HAND_K * (t * HA[1] + sx * HN[1]) + jitter(seed + 17) * amp,
];

// 指1本（つけ根 → まん中 → 先の中心線と、幅）。先は半円で丸く閉じる。つけ根は手の甲の下にかくれる
function finger(base: L, mid: L, tip: L, w: number): L[] {
  const dir = (a: L, b: L): L => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const m = Math.hypot(dx, dy);
    return [dx / m, dy / m];
  };
  const d0 = dir(base, mid);
  const d1 = dir(mid, tip);
  const side = (q: L, d: L, k: number): L => [q[0] - d[1] * k, q[1] + d[0] * k];
  const h = w / 2;
  const cap: L[] = [0.25, 0.5, 0.75].map((f) => {
    const a = Math.PI * f; // 先の半円
    return [tip[0] + d1[0] * h * Math.sin(a) - d1[1] * h * Math.cos(a), tip[1] + d1[1] * h * Math.sin(a) + d1[0] * h * Math.cos(a)];
  });
  return [side(base, d0, h), side(mid, d1, h), side(tip, d1, h), ...cap, side(tip, d1, -h), side(mid, d1, -h), side(base, d0, -h)];
}

// 手の甲（手首は細く、手のひらは広い）。小指の側の先は、曲げた中指・薬指・小指のかたまり（丸いふくらみ）
const PALM_L: readonly L[] = [
  [0, -7.5],
  [9, -10],
  [20, -12.2],
  [30, -12.5],
  [37.5, -11.5],
  [43, -9],
  [46, -5],
  [45.5, -0.5],
  [42.5, 3],
  [38, 5],
  [32, 9.5],
  [22, 11.5],
  [10, 10],
  [0, 8],
];
const PALM_PTS = PALM_L.map((q, i) => hp(q, 6900 + i, 0.2));
const PALM = { fill: polygon(PALM_PTS), line: closed(PALM_PTS) };
// 人さし指（まっすぐ前へ、先がかかとのふちにかかる）
const INDEX_PTS = finger([33, 4.5], [44, 7], [53.5, 9], 7.2).map((q, i) => hp(q, 6950 + i, 0.15));
const FINGERS = [{ fill: polygon(INDEX_PTS), line: closed(INDEX_PTS) }];
// 親指（手の甲の親指の側から、人さし指とは別の向きに出て、先が人さし指の先に寄る）
const THUMB_PTS = finger([17, 9], [31, 18.5], [49.5, 16], 8.4).map((q, i) => hp(q, 7050 + i, 0.15));
const THUMB = { fill: polygon(THUMB_PTS), line: closed(THUMB_PTS) };
// 曲げた3本の指の分かれ目（短い線2本）
const HAND_FINE = [line(hp([45, -6.9]), hp([38.6, -7.7]), 6880, 0.15, 1), line(hp([46, -2.6]), hp([39.4, -3.3]), 6885, 0.15, 1)];

// 袖（袖口のまわりだけ。絵の右上の外から入ってくる）。袖口の輪郭と、布のしわの短い曲線2本だけ
const WRIST: P = hp([-1, 0]);
const ARM_ANG = 28; // 腕の向き（手首から、右へ水平から上へ、度）。そろった靴のときの向き
const AD: P = [Math.cos((ARM_ANG * Math.PI) / 180), -Math.sin((ARM_ANG * Math.PI) / 180)]; // 手首 → ひじ
const AQ: P = [-AD[1], AD[0]]; // 袖の横
const ap = (along: number, across: number): P => [
  WRIST[0] + AD[0] * along + AQ[0] * across,
  WRIST[1] + AD[1] * along + AQ[1] * across,
];
const CUFF_W = 12.5; // 袖口の半分の幅（手首の半分の幅 約 8 より広い）
// 袖のふち（袖口で少し広がり、その先で一度すぼまってから、腕にそってゆるく太くなる）
const SLEEVE_SIDE = (k: number): P[] => [ap(-1.5, k * CUFF_W), ap(12, k * (CUFF_W - 1.4)), ap(36, k * (CUFF_W - 0.2)), ap(120, k * (CUFF_W + 3))];
const SLEEVE_FILL = polygon([ap(-3, 0), ...SLEEVE_SIDE(1), ...SLEEVE_SIDE(-1).reverse()]);
const SLEEVE = [
  smooth([ap(-1.5, -CUFF_W), ap(-3.2, 0), ap(-1.5, CUFF_W)]), // 袖口のふち
  smooth(SLEEVE_SIDE(-1)),
  smooth(SLEEVE_SIDE(1)),
];
// 布のしわ（短い曲線2本）
const SLEEVE_FINE = [
  smooth([ap(9, -CUFF_W + 1), ap(12.5, -CUFF_W + 4.5), ap(13, -CUFF_W + 8.5)]),
  smooth([ap(17, CUFF_W - 1), ap(20, CUFF_W - 4.5), ap(20.5, CUFF_W - 8.5)]),
];

// 4足目が置かれ終わる（41）と、手の動き（44〜60）。靴の回りと手は同じ範囲・同じ割合で進めるので、
// 時間で進めるとき（動かせないブラウザ）もずれない
const FIX_RANGE: readonly [number, number] = [44, 60];
// 手が入ってくる・引いていく向きと長さ（腕の向きにそって 70）
const HAND_VARS = { "--hand-out": `${r1(AD[0] * 70)}px, ${r1(AD[1] * 70)}px` };

const paths = (ds: readonly string[], className: string) => ds.map((d, i) => <path key={i} d={d} className={className} />);

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
            {pair.map((shoe, k) => {
              const body = (
                <g key={k}>
                  <path d={shoe.outline} className="scene-line" />
                  <path d={shoe.open} className="scene-fine" />
                  {shoe.details.map((d, j) => (
                    <path key={j} d={d} className="scene-fine" />
                  ))}
                  {/* 差し色（accent）はここだけ：スニーカーの横の線 */}
                  {shoe.accent && <path d={shoe.accent} className="scene-fine scene-accent" />}
                </g>
              );
              if (i !== 3 || k !== 1) return body;
              // 子どもの右の靴：ゆがんだ形で置かれ、手と一緒にまっすぐに戻る
              return (
                <g key={k} className="seat-fix scene-anim" style={anim("seat-fix", FIX_RANGE[0], FIX_RANGE[1], FIX_VARS)}>
                  {body}
                  {/* 手（何も動かさないときは見えない。opacity は動きで上書きされる） */}
                  <g className="seat-hand scene-anim" opacity={0} style={anim("seat-hand", FIX_RANGE[0], FIX_RANGE[1], HAND_VARS)}>
                    {[...FINGERS, THUMB].map((f, j) => (
                      <g key={j}>
                        <path d={f.fill} className="scene-paper" stroke="none" />
                        <path d={f.line} className="scene-line" />
                      </g>
                    ))}
                    <path d={PALM.fill} className="scene-paper" stroke="none" />
                    <path d={PALM.line} className="scene-line" />
                    {paths(HAND_FINE, "scene-fine")}
                    <path d={SLEEVE_FILL} className="scene-paper" stroke="none" />
                    {paths(SLEEVE, "scene-line")}
                    {paths(SLEEVE_FINE, "scene-fine")}
                  </g>
                </g>
              );
            })}
          </g>
        ))}
      </g>
    </svg>
  );
}
