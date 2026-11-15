// ─── 串焼き（ぼんじり・鶏ハラミ・鶏皮）の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の伍（串焼き）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// 本物の串（代表者から届いたメニューの写真）に合わせる：白い楕円のお皿に、竹串を1本ずつ。持ち手は長く出る（この絵では右に出す）。
// ・ぼんじり … まるっとした、ふっくらしたかたまりが5個。つやのあるきつね色に、ところどころ濃い焼き目
// ・鶏ハラミ … 平たい身を折りたたんで刺した形が4個（少し傾いて重なり合う）。ぼんじりより赤みのある、濃い茶色
// ・鶏皮 … 皮を波のようにくねらせて刺した、1本の長いうねり（上と下のふちが、互い違いにふくらむ）。淡いきつね色で、ふちが焦げる
// 色は、料理の絵の決まり（scenes.css の先頭）の「水彩の塗り方」で、線画にうすく絵の具で塗ったように付ける
// （部品は Wash.tsx。にじみのフィルタは kushi-wash の1つを使い回す）：
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く
// ・お皿と竹串：線だけ（面は紙の色。後ろを隠す塗りだけ）
// ・ぼんじり：からあげと同じ色の水彩（.food-wash-karaage）。つやの白い抜けを1つ
// ・鶏ハラミ：赤みのある濃い茶色の水彩（.food-wash-harami）
// ・鶏皮：淡いきつね色の水彩で、ふちを濃く（.food-wash-kawa）
// ・焼き目：3本とも、濃い茶色の小さな水彩を 2〜3か所ずつ重ねる（.food-wash-koge）
// ・中の線は、1本の串に 5本まで（ぼんじりのふくらみ・ハラミの折り目・皮のうねりのしわ）
// ・部品ごとに g でまとめる：お皿（kushi-plate）・串3本（kushi-skewers。1本ずつ g）
// ・串は、奥から ぼんじり・鶏ハラミ・鶏皮。持ち手を右、先を左に、少し左上がりに、奥ほど右へずらして並べる。持ち手は串の長さの約3割
//   （串の形は、持ち手を左にした向きで計算し、at() の中で、お皿のまん中の縦の線 x = CX について左右を折り返す。
//   絵全体を CSS で反転しないので、水彩の塗りのずれ〈右下へ〉と白い抜けの考え方〈光は左上から〉は、ほかの絵と同じ向きのまま）
// ・動きの順番：お皿のふちが描かれる → 串が1本ずつ（奥から手前へ）上から置かれる → 水彩の塗りがじわっと出る
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）。何も動かさないときの形が、動き終わった形
// ・絵は viewBox を 360 の幅に切り出して大きく見せる（線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, anim, arc, jitter, polygon, ring, smooth, type P } from "./draw";
import { Wash, WashFilter, type Hole } from "./Wash";

// ── お皿（白い楕円の皿を斜め上から。ふちの外・内の2本と、手前の厚み） ──
const CX = 200;
const CY = 296;
const RX = 176;
const RY = 80;
const PLATE_FILL = polygon(Array.from({ length: 41 }, (_, i) => [CX + RX * Math.cos((PI * 2 * i) / 40), CY + RY * Math.sin((PI * 2 * i) / 40) + (Math.sin((PI * 2 * i) / 40) > 0 ? 8 : 0)] as const));
const PLATE_OUTER = ring(CX, CY, RX, RY, 9000, 0.9);
const PLATE_INNER = ring(CX, CY + 3, RX * 0.86, RY * 0.8, 9030, 0.7); // 見込み（内側の段）
const PLATE_SIDE = arc(CX, CY + 8, RX - 2, RY, PI * 0.06, PI * 0.94, 18, 0.6, 9060); // 厚み（手前の下のふち）

// ── 串（3本）。持ち手の端 from から長さ L。具は串の長さの U0〜U1 のあいだ ──
// 点は、持ち手を左にした向き（from から右上がり）で計算し、at() で左右を折り返して、持ち手を右・先を左にする
const L = 318;
const DIR: P = (() => {
  const dx = 1;
  const dy = -0.15;
  const n = Math.hypot(dx, dy);
  return [dx / n, dy / n];
})();
const NRM: P = [DIR[1], -DIR[0]]; // 串に直角で、上向き
const FROM: readonly P[] = [
  [22, 262], // 奥：ぼんじり
  [36, 306], // まん中：鶏ハラミ
  [50, 350], // 手前：鶏皮
];
// 串の上の点（u … 持ち手の端からの長さ、v … 串から上へ）。x は x = CX について折り返す（持ち手が右に来る）
const at = (k: number, u: number, v: number): P => [2 * CX - (FROM[k][0] + DIR[0] * u + NRM[0] * v), FROM[k][1] + DIR[1] * u + NRM[1] * v];
const U0 = 0.3 * L; // 具の始まり（ここまでが持ち手）
const U1 = 0.93 * L; // 具の終わり（ここから先に、竹串の先が少し出る）

// 竹串（太さ 5。持ち手の端は丸く、先はとがる）
function stick(k: number) {
  const s = 9100 + k * 40;
  const w = 2.6;
  const edge = (side: number) =>
    smooth(
      [0, 0.25, 0.5, 0.75, 0.97].map((f, i) => {
        const [x, y] = at(k, L * f, side * w);
        return [x + jitter(s + i + side * 7) * 0.3, y + jitter(s + i + 20 + side * 7) * 0.3] as const;
      }),
    );
  const tip = smooth([at(k, L * 0.97, w), at(k, L, 0), at(k, L * 0.97, -w)]);
  const end = smooth([at(k, 0, w), at(k, -2.6, 0), at(k, 0, -w)]);
  const fill = polygon([at(k, 0, w), at(k, L * 0.97, w), at(k, L, 0), at(k, L * 0.97, -w), at(k, 0, -w), at(k, -2.6, 0)]);
  return { lines: [edge(1), edge(-1), tip, end], fill };
}

// 串の座標で、ふちがでこぼこな閉じた形（中心 u・v、半径 ru・rv、回し rot）
function lump(k: number, u: number, v: number, ru: number, rv: number, rot: number, seed: number, amp = 0.06, n = 20): P[] {
  const pts: P[] = [];
  for (let j = 0; j < n; j++) {
    const t = (PI * 2 * j) / n;
    const w = 1 + amp * Math.sin(3 * t + seed * 0.3) + jitter(seed + j) * amp * 0.6;
    const eu = ru * w * Math.cos(t);
    const ev = rv * w * Math.sin(t);
    pts.push(at(k, u + eu * Math.cos(rot) - ev * Math.sin(rot), v + eu * Math.sin(rot) + ev * Math.cos(rot)));
  }
  return [...pts, pts[0], pts[1]];
}
// 串の座標の点を曲線に
const curve = (k: number, uv: readonly (readonly [number, number])[]) => smooth(uv.map(([u, v]) => at(k, u, v)));
// 焼き目（小さなでこぼこの丸）
const koge = (k: number, u: number, v: number, r: number, seed: number) => polygon(lump(k, u, v, r, r * 0.7, 0.3, seed, 0.15, 10));

type Part = { fill: string; outline: string };
type Kushi = { parts: Part[]; lines: string[]; tone: string; holes: Hole[]; koge: string[] };

// ── ぼんじり（奥）：まるっとしたかたまり 5個 ──
const BONJIRI: Kushi = (() => {
  const k = 0;
  const step = (U1 - U0) / 5;
  const parts = Array.from({ length: 5 }, (_, i) => {
    const u = U0 + step * (i + 0.5);
    const pts = lump(k, u + jitter(9200 + i) * 3, jitter(9210 + i) * 3, step * (0.6 + jitter(9240 + i) * 0.06), 19 + jitter(9220 + i) * 3, jitter(9250 + i) * 0.5, 9230 + i * 30, 0.11, 18);
    return { fill: polygon(pts), outline: smooth(pts) };
  });
  const u = (i: number) => U0 + step * (i + 0.5);
  // ふくらみの線（かたまりの左上の、まるい弧。3本）
  const lines = [0, 2, 4].map((i) => curve(k, [[u(i) - 13, 4], [u(i) - 9, 11], [u(i) - 1, 15]]));
  return {
    parts,
    lines,
    tone: "food-wash-karaage",
    holes: [[...at(k, u(2) + 2, 11), 4.6, 2.6] as const],
    koge: [koge(k, u(1) + 8, -11, 7.5, 9300), koge(k, u(3) + 4, 12, 6.75, 9310), koge(k, u(4) + 10, -6, 6, 9320)],
  };
})();

// ── 鶏ハラミ（まん中）：平たい身を折りたたんだ形 4個。互い違いに傾いて重なる ──
const HARAMI: Kushi = (() => {
  const k = 1;
  const step = (U1 - U0) / 4;
  const u = (i: number) => U0 + step * (i + 0.5);
  const parts = Array.from({ length: 4 }, (_, i) => {
    const pts = lump(k, u(i), jitter(9400 + i) * 1.5, step * 0.62, 19, i % 2 === 0 ? 0.22 : -0.2, 9410 + i * 30, 0.09, 16);
    return { fill: polygon(pts), outline: smooth(pts) };
  });
  // 折り目（身の上から下へ、くの字に。4本）
  const lines = [0, 1, 2, 3].map((i) => {
    const d = i % 2 === 0 ? 1 : -1;
    return curve(k, [[u(i) - 4 * d, 15], [u(i) + 4 * d, 2], [u(i) - 2 * d, -12]]);
  });
  return {
    parts,
    lines,
    tone: "food-wash-harami",
    holes: [],
    koge: [koge(k, u(0) + 10, 10, 7.5, 9500), koge(k, u(2) - 8, -10, 7.5, 9510), koge(k, u(3) + 6, 8, 6, 9520)],
  };
})();

// ── 鶏皮（手前）：皮を波のようにくねらせた、1本の長いうねり ──
const KAWA: Kushi = (() => {
  const k = 2;
  const folds = 9;
  const step = (U1 - U0) / folds;
  // 上のふち（左 → 右）。折り目ごとにふくらむ。下のふちは半分ずらして互い違いに
  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  for (let i = 0; i <= folds * 2; i++) {
    const uu = U0 + (step / 2) * i;
    const peak = i % 2 === 1;
    // 山は高さを不ぞろいに、谷は深く（皮が細かく折り重なって見えるように）
    top.push([uu + jitter(9660 + i) * 2, peak ? 21 + jitter(9600 + i) * 3.5 : 9 + jitter(9600 + i) * 1.5]);
    bottom.push([uu + step / 2 + jitter(9680 + i) * 2, peak ? -9 + jitter(9640 + i) * 1.5 : -20 + jitter(9640 + i) * 3.5]);
  }
  bottom.pop();
  const uv: [number, number][] = [[U0 - 3, 0], ...top, [U1 + 3, -2], ...bottom.reverse(), [U0 - 3, 0]];
  const pts = uv.map(([uu, v]) => at(k, uu, v));
  const outline = smooth([...pts, pts[1]]);
  // うねりのしわ（上のふちのくぼみから、ななめ下へ。折り重なりの境目。5本）
  const lines = [1, 3, 4, 6, 8].map((i) => {
    const uu = U0 + step * i;
    return curve(k, [[uu, 9], [uu + 4, 0], [uu + 7, -8]]);
  });
  return {
    parts: [{ fill: polygon(pts), outline }],
    lines,
    tone: "food-wash-kawa",
    holes: [],
    koge: [koge(k, U0 + step * 1.5, 16, 7.5, 9700), koge(k, U0 + step * 5, -15, 7.5, 9710), koge(k, U0 + step * 7.5, 16, 7, 9720)],
  };
})();

const KUSHI = [BONJIRI, HARAMI, KAWA];
const STICKS = KUSHI.map((_, k) => stick(k));

// 水彩がじわっと出る動き（いちばん最後。串ごとに少しずつずらす）
const washAnim = (i: number) => anim("scene-fade-up", 50 + i * 2, 57 + i, { "--dy": "0px" });

export default function KushiIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="20 108 360 360"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 360 / 400 } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。串で1つを使い回す） */}
        <WashFilter id="kushi-wash" seed={13} />
      </defs>

      {/* 1. お皿（線だけ。ふちの外 → 厚み → 内の順に描かれる） */}
      <g className="kushi-plate">
        <path d={PLATE_FILL} className="scene-paper scene-anim" stroke="none" style={anim("scene-fade-up", 4, 8, { "--dy": "0px" })} />
        <path d={PLATE_OUTER} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 4, 12)} />
        <path d={PLATE_SIDE} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={anim("scene-draw", 8, 14)} />
        <path d={PLATE_INNER} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 10, 16)} />
      </g>

      {/* 2. 串（奥から1本ずつ、上から置かれる）。
          1本ごとに：竹串 → 具の後ろを隠す紙の色 → 水彩（いちばん最後にじわっと出る）→ 具の輪郭と中の線 */}
      <g className="kushi-skewers">
        {KUSHI.map((ku, i) => (
          <g key={i} className="scene-anim" style={anim("scene-fade-up", 18 + i * 9, 28 + i * 9, { "--dy": "-30px" })}>
            <path d={STICKS[i].fill} className="scene-paper" stroke="none" />
            {STICKS[i].lines.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
            {/* 具は持ち手の側（右）のものから1つずつ（先の側〈左〉のものが、右のものの線と塗りに重なる） */}
            {ku.parts.map((p, k) => (
              <g key={k}>
                <path d={p.fill} className="scene-paper" stroke="none" />
                <g className="scene-anim" style={washAnim(i)}>
                  <g filter="url(#kushi-wash)">
                    <Wash d={p.fill} tone={ku.tone} id={`kushi-w-${i}-${k}`} shift={[2, 1.5]} holes={k === 2 ? ku.holes : []} />
                  </g>
                </g>
                <path d={p.outline} className="scene-line" />
              </g>
            ))}
            {/* 焼き目（濃い茶色の小さな水彩を重ねる） */}
            <g className="scene-anim" style={washAnim(i)}>
              <g filter="url(#kushi-wash)">
                {ku.koge.map((d, k) => (
                  <Wash key={k} d={d} tone="food-wash-koge" id={`kushi-w-koge-${i}-${k}`} shift={[1, 0.8]} />
                ))}
              </g>
            </g>
            {ku.lines.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
