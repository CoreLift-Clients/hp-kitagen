// ─── 串の盛り合わせの線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の伍（串の盛り合わせ）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （お皿と串の具にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・色を塗るのは、たれのかかったまん中の串のつくねだけ（たれの色のべた。scenes.css の .food-tare。料理の絵の決まりは scenes.css の先頭）
// ・部品ごとに g でまとめる：お皿（kushi-plate）・串3本（kushi-skewers。1本ずつ g）
// ・串は横長のお皿に、少し斜めに3本。具は1本に4個ずつで、丸（つくね）や四角（ねぎま）の形
// ・動きの順番：お皿が現れる → 串が1本ずつ（奥から手前へ）上から置かれていく
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { anim, jitter, line, polygon, smooth, type P } from "./draw";

// ── お皿（少し上から見た、横長の角の丸い長皿） ──
// 上の面のふち：奥の辺は短く、手前の辺は長い（台形）。角は丸める
const PLATE_TOP: P[] = [
  [50, 196],
  [120, 190],
  [200, 189],
  [280, 190],
  [350, 196],
  [368, 210],
  [384, 270],
  [380, 300],
  [362, 308],
  [280, 312],
  [200, 313],
  [120, 312],
  [38, 308],
  [20, 300],
  [16, 270],
  [32, 210],
  [50, 196],
];
const PLATE_FILL = polygon(PLATE_TOP);
const PLATE = [
  smooth(PLATE_TOP.map(([x, y], i) => [x + jitter(9000 + i) * 0.8, y + jitter(9020 + i) * 0.6] as const)),
  // 厚み（手前の下のふち）
  smooth([
    [20, 302],
    [26, 318],
    [44, 325],
    [200, 329],
    [356, 325],
    [374, 318],
    [380, 302],
  ]),
];
// 見込み（内側の段）
const PLATE_FINE = [
  smooth([
    [66, 208],
    [200, 203],
    [334, 208],
    [356, 262],
    [350, 296],
    [200, 301],
    [50, 296],
    [44, 262],
    [66, 208],
  ]),
];

// ── 串（3本）。竹串の左の先 → 右の持ち手、具の形と並び ──
// 奥から手前へ 36 ずつずらし、具どうしがほとんど重ならないようにする
type Shape = "round" | "square" | "slim";
type Skewer = { from: P; to: P; items: readonly Shape[] };
const SKEWERS: readonly Skewer[] = [
  { from: [58, 228], to: [344, 214], items: ["square", "slim", "square", "slim"] }, // 奥：ねぎま
  { from: [54, 263], to: [350, 251], items: ["round", "round", "round", "round"] }, // まん中：つくね
  { from: [50, 298], to: [354, 288], items: ["square", "round", "square", "round"] }, // 手前：いろいろ
];
// 具を並べる場所（串の長さのうち、この割合のところから先に、等しい間で並べる）
const ITEM_T0 = 0.1;
const ITEM_T1 = 0.62;

function skewer({ from, to, items }: Skewer, i: number) {
  const s = 9100 + i * 80;
  const at = (t: number): P => [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
  const stick = [line(from, to, s, 0.4, 3)];
  const shapes = items.map((shape, k) => {
    const [cx, cy] = at(ITEM_T0 + ((ITEM_T1 - ITEM_T0) * k) / (items.length - 1));
    const ks = s + 10 + k * 12;
    if (shape === "round") {
      // 丸（つくね）
      const pts: P[] = [];
      for (let j = 0; j <= 18; j++) {
        const t = -0.1 + ((Math.PI * 2 + 0.2) * j) / 18;
        const r = 15.5 + jitter(ks + (j % 18)) * 0.8;
        pts.push([cx + r * Math.cos(t), cy + r * 0.9 * Math.sin(t)]);
      }
      return { fill: polygon(pts), d: smooth(pts) };
    }
    // 四角（ねぎまの肉）と細い四角（ねぎ）。角を少し丸めた四角を、串の向きに合わせて少し傾ける
    const w = shape === "square" ? 15 : 8;
    const h = shape === "square" ? 14 : 13;
    const tilt = (to[1] - from[1]) / (to[0] - from[0]);
    const c = 4; // 角の丸み
    const corner = (x: number, y: number): P => [cx + x, cy + y + x * tilt];
    const pts: P[] = [
      corner(-w + c, -h),
      corner(w - c, -h + jitter(ks) * 0.6),
      corner(w, -h + c),
      corner(w, h - c),
      corner(w - c, h),
      corner(-w + c, h + jitter(ks + 1) * 0.6),
      corner(-w, h - c),
      corner(-w, -h + c),
      corner(-w + c, -h),
    ];
    return { fill: polygon(pts), d: smooth(pts) };
  });
  return { stick, shapes };
}
const SKEWER_PARTS = SKEWERS.map(skewer);


export default function KushiIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 58 400 400"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="kushi-plate scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        <path d={PLATE_FILL} className="scene-paper" stroke="none" />
        {PLATE.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {PLATE_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="kushi-skewers">
        {SKEWER_PARTS.map((sk, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 16 + i * 9, 26 + i * 9, { "--dy": "-30px" })}>
            {sk.stick.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
            {sk.shapes.map((sh, k) => (
              <g key={k}>
                {/* まん中の串（つくね）だけ、たれの色 */}
                <path d={sh.fill} className={i === 1 ? "food-tare" : "scene-paper"} stroke="none" />
                <path d={sh.d} className="scene-line" />
              </g>
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
