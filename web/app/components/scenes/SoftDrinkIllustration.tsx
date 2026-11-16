// ─── ソフトドリンクの線画（背の高いグラス） ───
// ディナーメニューの「きたげんの名物」の欄の、お飲みものの参（ソフトドリンク）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （グラスと氷に、後ろの線を隠すための塗り --scene-paper を付ける）
// ・色：飲み物は入れ物そのものが主役なので、入れ物にも水彩の色を付ける（料理の絵の決まり、scenes.css の先頭）。
//   塗り方は、料理と同じ水彩の決まり（部品は Wash.tsx。にじみのフィルタは soft-wash の1つを使い回す）。
//   焼酎・日本酒、生ビールのカードと、塗り方をそろえる
//   ・グラス … ごく淡い色（ほぼ紙の色、ふちだけうすく .food-wash-glass）
//   ・ウーロン茶 … 淡い茶色（.food-wash-tea）
//   ・氷 … ほんのり水色がかった白（.food-wash-ice。焼酎のロックグラスの氷と同じ）
//   ・ストロー … 淡い accent（.food-wash-straw）
// ・部品ごとに g でまとめる：グラスの面（soft-glass-face。紙の色・グラスとウーロン茶の水彩）・ストロー（soft-straw）・
//   グラス（soft-glass。氷3個と飲みものの線も一緒）・泡の粒（soft-bubbles）
//   重なりの順：グラスの面 → ストロー → 氷（ストローの一部を隠す）→ グラスの線 → 泡の粒
// ・動きの順番：グラスが現れる → ストローが上から入る → 泡の粒が下から上がる（1つずつ）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arc, jitter, line, polygon, ring, smooth, type P } from "./draw";
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

// ── 飲み物の面（飲みものの線 y = 128 から底の厚みの線まで。グラスの内側） ──
const glassX = (y: number, side: number) => (side < 0 ? 142 + ((156 - 142) * (y - 99)) / 245 : 258 - ((258 - 244) * (y - 99)) / 245);
const DRINK_FILL = polygon([
  [glassX(128, -1) + 1.5, 128],
  [glassX(128, 1) - 1.5, 128],
  [glassX(328, 1) - 1.5, 332],
  [200, 338],
  [glassX(328, -1) + 1.5, 332],
]);

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

// ── 泡の粒（下から上がる） ──
const BUBBLES: readonly [number, number, number][] = [
  [176, 300, 4],
  [226, 284, 3.4],
  [168, 262, 3],
  [214, 250, 3.6],
  [236, 312, 3],
];

export default function SoftDrinkIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。絵の中で使い回す） */}
        <WashFilter id="soft-wash" seed={23} />
      </defs>
      {/* グラスの面とウーロン茶の水彩（グラスと一緒に現れる） */}
      <g className="soft-glass-face scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        <path d={GLASS_FILL} className="scene-paper" stroke="none" />
        <Wash filter="soft-wash" d={GLASS_FILL} tone="food-wash-glass" id="soft-w-glass" shift={[1, 0.75]} />
        <Wash filter="soft-wash" d={DRINK_FILL} tone="food-wash-tea" id="soft-w-tea" shift={[1, 0.75]} line={2.1} holes={[[232, 300, 2.4, 9]]} />
      </g>
      {/* ストロー（上から入る） */}
      <g className="soft-straw scene-anim" style={anim("scene-fade-up", 18, 30, { "--dy": "-90px" })}>
        <Wash filter="soft-wash" d={STRAW_FILL} tone="food-wash-straw" id="soft-w-straw" shift={[0.5, 0.4]} />
        {STRAW.map((d, i) => (
          <path key={i} d={d} className={i < 2 ? "scene-line" : "scene-fine"} />
        ))}
      </g>

      <g className="soft-glass scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
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

      <g className="soft-bubbles">
        {BUBBLES.map(([x, y, r], i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 32 + i * 4, 42 + i * 4, { "--dy": "40px" })}>
            <circle cx={x} cy={y} r={r} className="scene-fine" />
          </g>
        ))}
      </g>
    </svg>
  );
}
