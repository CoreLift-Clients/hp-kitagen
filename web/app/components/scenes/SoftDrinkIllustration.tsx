// ─── ソフトドリンクの線画（背の高いグラス） ───
// ディナーメニューの「きたげんの名物」の欄の、お飲みものの参（ソフトドリンク）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （氷にだけ、後ろの線（ストロー）を隠すための塗り --scene-paper を付ける）
// ・色を塗るのは、グラスの中の飲み物だけ（ウーロン茶の淡い茶色のべた。scenes.css の .food-tea。
//   料理の絵の決まりは scenes.css の先頭）。ストローは線だけ
// ・部品ごとに g でまとめる：グラス（soft-glass。氷3個と飲みものの線も一緒）・ストロー（soft-straw）・泡の粒（soft-bubbles）
//   重なりの順：飲み物の面 → ストロー → 氷（ストローの一部を隠す）→ グラスの線 → 泡の粒
// ・動きの順番：グラスが現れる → ストローが上から入る → 泡の粒が下から上がる（1つずつ）
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arc, jitter, line, polygon, ring, smooth, type P } from "./draw";

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
  return { fill: polygon(pts), d: smooth(pts), shine };
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
      {/* 飲み物の面（グラスと一緒に現れる） */}
      <path d={DRINK_FILL} className="soft-drink food-tea scene-anim" stroke="none" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })} />
      {/* ストロー（上から入る） */}
      <g className="soft-straw scene-anim" style={anim("scene-fade-up", 18, 30, { "--dy": "-90px" })}>
        {STRAW.map((d, i) => (
          <path key={i} d={d} className={i < 2 ? "scene-line" : "scene-fine"} />
        ))}
      </g>

      <g className="soft-glass scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        {ICES.map((c, i) => (
          <g key={i}>
            <path d={c.fill} className="scene-paper" stroke="none" />
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
