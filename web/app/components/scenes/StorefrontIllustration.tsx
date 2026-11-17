// ─── 店の入口（店先）の線画 ───
// 店舗情報のページ（/info）の、ページの見出しのすぐ下に置く飾りの絵（aria-hidden。意味は本文で伝える）。
// 店の写真を使わない方針のため、以前ここにあった店の写真（/images/about/shop.jpg）の代わりに置く。
// ・形は、店先の写真（public/images/hero/hero-pc.jpg。トップのヒーローの写真）を見て描いた形を、
//   ひと目で「小さな居酒屋の入口」と分かる程度に抽象化したもの：
//   白いひさし（看板の帯。まん中に看板の板）・左右の柱・横の板張りの壁・
//   すりガラスの欄間と、すりガラスの帯の入った木の引き戸（2枚）・戸に掛けた「営業中」の札・
//   左ののぼり・右の立て看板
// ・料理の絵の決まり（scenes.css の先頭）に合わせる：線は1色（currentColor ＝ 呼び出し側の text-foreground）、
//   輪郭は .scene-line、中の線は .scene-fine。食材ではないので色は付けない（線だけ）。
//   塗りは、重なった後ろの線を隠す紙の色（.scene-paper）だけ（のぼり・立て看板・札）
// ・「営業中」の札の字だけは絵の中に小さく入れる（明朝体。線ではなく字）
// ・動きの順番（動きの名前と範囲は anim(...)、@keyframes は scenes.css）：
//   1) 地面・柱・ひさしが描かれる（4〜20）
//   2) 欄間と引き戸の枠（16〜32）→ 戸のガラスと帯・引き手（26〜40）
//   3) 壁の板張り（30〜46）
//   4) のぼりと立て看板が現れる（40〜52）
//   5) 「営業中」の札が掛かる（50〜58）
//   ページのいちばん上に置くので、スクロールの位置では進めず、画面に入ったときに1回だけ時間で進める
//   （app/info/page.tsx の ScenePlayOnView の playOnce。店主紹介のページの手元の絵と同じ）。
//   何も動かさないときの形が「動き終わった絵」（prefers-reduced-motion のときも、この形）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { anim, line, polygon, type P } from "./draw";

// 揺らぎのある四角（4辺を1本ずつ描いて、ひとつの path にする）
function box(x0: number, y0: number, x1: number, y1: number, seed: number, amp = 0.6): string {
  return [
    line([x0, y0], [x1, y0], seed, amp, 3),
    line([x1, y0], [x1, y1], seed + 10, amp, 2),
    line([x1, y1], [x0, y1], seed + 20, amp, 3),
    line([x0, y1], [x0, y0], seed + 30, amp, 2),
  ].join(" ");
}
const boxFill = (x0: number, y0: number, x1: number, y1: number) =>
  polygon([
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ] as P[]);

const GROUND_Y = 200;

// ── 1) 地面・柱・ひさし ──
const FRAME = [
  line([10, GROUND_Y], [390, GROUND_Y + 0.5], 12000, 0.8, 5), // 地面
  line([34, 60], [34, GROUND_Y], 12010, 0.6, 3), // 左の柱
  line([44, 60], [44, GROUND_Y], 12020, 0.6, 3),
  line([356, 60], [356, GROUND_Y], 12030, 0.6, 3), // 右の柱
  line([366, 60], [366, GROUND_Y], 12040, 0.6, 3),
  box(24, 22, 376, 56, 12050, 0.7), // ひさし（看板の帯）
];
const FRAME_FINE = [
  line([30, 62], [370, 62], 12100, 0.6, 4), // ひさしの下の影のふち
  box(158, 29, 242, 49, 12110, 0.4), // 看板の板
];

// ── 2) 欄間と引き戸 ──
const DOOR_L = 138;
const DOOR_R = 262;
const DOOR_MID = 200;
const DOOR_TOP = 94;
const DOOR = [
  line([DOOR_L - 4, 62], [DOOR_L - 4, GROUND_Y], 12200, 0.5, 3), // 戸口の左の枠
  line([DOOR_R + 4, 62], [DOOR_R + 4, GROUND_Y], 12210, 0.5, 3), // 右の枠
  box(DOOR_L, 70, DOOR_R, 88, 12220, 0.5), // 欄間（すりガラス）
  box(DOOR_L, DOOR_TOP, DOOR_MID, GROUND_Y - 2, 12230, 0.5), // 左の戸
  box(DOOR_MID, DOOR_TOP + 1, DOOR_R, GROUND_Y - 2, 12240, 0.5), // 右の戸
];
// 戸のガラス（上の大きいガラスと、その下のすりガラスの帯）と引き手。戸1枚に中の線3本
function panel(x0: number, x1: number, seed: number, handleX: number): string[] {
  return [
    box(x0 + 8, DOOR_TOP + 9, x1 - 8, 140, seed, 0.35),
    box(x0 + 8, 148, x1 - 8, 160, seed + 40, 0.3),
    line([handleX, 166], [handleX, 178], seed + 80, 0.2, 1),
  ];
}
const DOOR_FINE = [...panel(DOOR_L, DOOR_MID, 12300, DOOR_MID - 5), ...panel(DOOR_MID, DOOR_R, 12400, DOOR_MID + 5)];

// ── 3) 壁の板張り（横の線を、左右の壁に4本ずつ。端まで引ききらない） ──
const PLANK_Y = [88, 114, 140, 166];
const PLANKS = PLANK_Y.flatMap((y, i) => [
  line([50, y + (i % 2) * 0.6], [DOOR_L - 10, y], 12500 + i * 7, 0.5, 2),
  line([DOOR_R + 10, y], [350, y + ((i + 1) % 2) * 0.6], 12550 + i * 7, 0.5, 2),
]);

// ── 4) のぼり（左）と立て看板（右） ──
const NOBORI_POLE = line([62, GROUND_Y], [62, 70], 12600, 0.4, 3);
const NOBORI = { x0: 64, y0: 76, x1: 90, y1: 172 };
// のぼりの中の、字の気配の短い縦線2本（字は書かない）
const NOBORI_FINE = [line([77, 88], [77, 122], 12610, 0.4, 2), line([77, 132], [77, 156], 12615, 0.4, 1)];
const BOARD = { x0: 284, y0: 150, x1: 314, y1: 184 };
const BOARD_LEGS = [
  line([288, BOARD.y1], [286, GROUND_Y], 12700, 0.2, 1),
  line([310, BOARD.y1], [312, GROUND_Y], 12710, 0.2, 1),
];
const BOARD_FINE = [line([290, 162], [308, 162], 12720, 0.3, 1), line([290, 171], [304, 171], 12730, 0.3, 1)];

// ── 5) 「営業中」の札（右の戸に掛ける。縦長の板に、ひもを2本） ──
const FUDA = { x0: 214, y0: 110, x1: 232, y1: 144 };
const FUDA_STRING = [
  line([216, FUDA.y0], [223, 101], 12800, 0.15, 1),
  line([230, FUDA.y0], [223, 101], 12810, 0.15, 1),
];
const FUDA_CHARS = ["営", "業", "中"];

export default function StorefrontIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 212"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 1) 地面・柱・ひさし */}
      <g className="storefront-frame">
        {FRAME.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 4 + i * 1.5, 14 + i * 1.2)}
          />
        ))}
        {FRAME_FINE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 12 + i * 2, 20 + i * 2)}
          />
        ))}
      </g>

      {/* 2) 欄間と引き戸 */}
      <g className="storefront-door">
        {DOOR.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 16 + i * 2, 26 + i * 1.5)}
          />
        ))}
        {DOOR_FINE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 26 + (i % 3) * 2, 34 + (i % 3) * 2)}
          />
        ))}
      </g>

      {/* 3) 壁の板張り */}
      <g className="storefront-wall">
        {PLANKS.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 30 + Math.floor(i / 2) * 3, 38 + Math.floor(i / 2) * 2.5)}
          />
        ))}
      </g>

      {/* 4) のぼり（左）・立て看板（右）。後ろの壁の線を紙の色で隠す */}
      <g className="scene-anim" style={anim("scene-fade-up", 40, 50, { "--dy": "8px" })}>
        <path d={boxFill(NOBORI.x0, NOBORI.y0, NOBORI.x1, NOBORI.y1)} className="scene-paper" stroke="none" />
        <path d={NOBORI_POLE} className="scene-line" />
        <path d={box(NOBORI.x0, NOBORI.y0, NOBORI.x1, NOBORI.y1, 12620, 0.4)} className="scene-line" />
        {NOBORI_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>
      <g className="scene-anim" style={anim("scene-fade-up", 43, 52, { "--dy": "8px" })}>
        <path d={boxFill(BOARD.x0, BOARD.y0, BOARD.x1, BOARD.y1)} className="scene-paper" stroke="none" />
        <path d={box(BOARD.x0, BOARD.y0, BOARD.x1, BOARD.y1, 12740, 0.35)} className="scene-line" />
        {BOARD_LEGS.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {BOARD_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      {/* 5) 「営業中」の札（上から少し下りて掛かる） */}
      <g className="scene-anim" style={anim("scene-fade-up", 50, 58, { "--dy": "-6px" })}>
        {FUDA_STRING.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
        <path d={boxFill(FUDA.x0, FUDA.y0, FUDA.x1, FUDA.y1)} className="scene-paper" stroke="none" />
        <path d={box(FUDA.x0, FUDA.y0, FUDA.x1, FUDA.y1, 12820, 0.25)} className="scene-fine" />
        {FUDA_CHARS.map((c, i) => (
          <text
            key={c}
            x={(FUDA.x0 + FUDA.x1) / 2}
            y={FUDA.y0 + 10.5 + i * 9.5}
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            className="storefront-fuda-text"
          >
            {c}
          </text>
        ))}
      </g>
    </svg>
  );
}
