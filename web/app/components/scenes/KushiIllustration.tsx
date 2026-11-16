// ─── 串焼き（ぼんじり・鶏ハラミ・鶏皮）の線画 ───
// ディナーメニューの「きたげんの名物」の欄の、料理の伍（串焼き）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// 本物の串（代表者から届いたメニューの写真）に合わせる：竹串を1本ずつ。持ち手は長く出る（この絵では右に出す）。
// お皿は、肉みそ冷奴と同じ、横長の角の丸い長方形のお皿（ふちが少し立った形）。串は、お皿の長い向きに沿わせて並べる。
// ・ぼんじり … まるっとした、ふっくらしたかたまりが5個。つやのあるきつね色に、ところどころ濃い焼き目
// ・鶏ハラミ … 平たい身を折りたたんで刺した形が4個（少し傾いて重なり合う）。ぼんじりより赤みのある、濃い茶色
// ・鶏皮 … 皮を波のようにくねらせて刺した、1本の長いうねり（上と下のふちが、互い違いにふくらむ）。淡いきつね色で、ふちが焦げる
// 色は、料理の絵の決まり（scenes.css の先頭）の「水彩の塗り方」で、線画にうすく絵の具で塗ったように付ける
// （部品は Wash.tsx。にじみのフィルタは kushi-wash の1つを使い回す）：
// ・線は currentColor（＝ 呼び出し側の text-foreground）。端と角は丸く
// ・お皿と竹串：線だけ（面は紙の色。後ろを隠す塗りだけ）。お皿は外のふちと内の底のふちの2本（肉みそ冷奴と同じ）
// ・ぼんじり：からあげと同じ色の水彩（.food-wash-karaage）。つやの白い抜けを1つ
// ・鶏ハラミ：赤みのある濃い茶色の水彩（.food-wash-harami）
// ・鶏皮：淡いきつね色の水彩で、ふちを濃く（.food-wash-kawa）
// ・焼き目：6本とも、濃い茶色の小さな水彩を 3か所ずつ重ねる（.food-wash-koge）
// ・中の線は、1本の串に 5本まで（ぼんじりのふくらみ・ハラミの折り目・皮のうねりのしわ）
// ・湯気：串の具のあたり（いちばん奥の串の具の上）から3本、具の上に散らす（持ち手の上には立てない）。
//   しゅうまいと同じ描き方（共通の部品 Steam.tsx）。具から少し浮いた所から立ち、高さはからあげより少し短め。時間でゆっくり揺れる
// ・部品ごとに g でまとめる：お皿（kushi-plate）・串6本（kushi-skewers。1本ずつ g）・湯気（kushi-steam）
// ・串は 3種類を2本ずつ、6本。奥から ぼんじり2本 → 鶏ハラミ2本 → 鶏皮2本（同じ種類の2本を隣り合わせに）。
//   持ち手を右、先を左に、少し左上がりに、奥ほど右へずらして並べる。持ち手は串の長さの約3割。
//   具は3本のときの 0.87 倍（S）。手前の串が奥の串に少し重なる。同じ種類の2本は、具の大きさ・傾き・焼き目の位置を少しずつ変える
//   （串の形は、持ち手を左にした向きで計算し、at() の中で、お皿のまん中の縦の線 x = CX について左右を折り返す。
//   絵全体を CSS で反転しないので、水彩の塗りのずれ〈右下へ〉と白い抜けの考え方〈光は左上から〉は、ほかの絵と同じ向きのまま）
// ・動きの順番：お皿のふち（外 → 内）が描かれる → 串が1本ずつ（奥から手前へ）上から置かれる → 水彩の塗りがじわっと出る → 湯気が3本立ちのぼる
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css）。何も動かさないときの形が、動き終わった形
// ・絵は viewBox を 430 の幅にする（お皿と、少し出た持ち手の端まで入る幅。線の太さは --scene-z で 400 の幅の絵とそろえる。scenes.css）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import type { CSSProperties } from "react";
import { PI, animAt, cardTiming, jitter, polygon, roundRectPts, smooth, sway, type P } from "./draw";
import { SteamFades, SteamWisps, mkWisp } from "./Steam";
import { Wash, WashFilter, type Hole } from "./Wash";

// ── お皿（肉みそ冷奴と同じ、横長の角の丸い長方形のお皿。ふちが少し立った形を、外のふちと内の底のふちの2本で描く） ──
// 点の作り方は肉みそ冷奴と同じ draw.ts の roundRectPts。見る角度も冷奴と同じ縦のつぶし（SQ 0.58）で、
// お皿の長い向き（u）が串の向き（右の持ち手から左の先へ、少し左上がり ＝ 傾き 0.15）にそろうように、床の面で TH だけ回す
const CX = 200; // 串を左右に折り返す縦の線（at()）
const PX = 198; // お皿のまん中
const PY = 272;
const SQ = 0.58;
const TH = Math.atan(0.15 / SQ);
const COS = Math.cos(TH);
const SIN = Math.sin(TH);
const pr = (u: number, v: number, z = 0): P => [PX + u * COS - v * SIN, PY + (u * SIN + v * COS) * SQ - z];
const PLATE_HL = 168; // 半分の長さ
const PLATE_HW = 162; // 半分の幅（串6本と具が、内の底のふちの中に入る幅）
const PLATE_R = 40; // 角の丸み
const PLATE_PTS = roundRectPts(pr, PLATE_HL, PLATE_HW, PLATE_R, 0, 9000, 0.9);
const PLATE_FILL = polygon(PLATE_PTS);
const PLATE_OUTER = smooth(PLATE_PTS);
const PLATE_INNER = smooth(roundRectPts(pr, PLATE_HL - 13, PLATE_HW - 12, PLATE_R - 8, -3, 9030, 0.7)); // 内の底のふち（少し低い）

// ── 串（6本）。持ち手の端 from から長さ L。具は串の長さの U0〜U1 のあいだ ──
// 点は、持ち手を左にした向き（from から右上がり）で計算し、at() で左右を折り返して、持ち手を右・先を左にする。
// 奥から ぼんじり2本 → 鶏ハラミ2本 → 鶏皮2本。同じ種類の2本は間を詰め（24）、種類の境目は少し空ける（30）。
// 具の高さ（約 33）より間が狭いので、手前の串が奥の串に少し重なる
const L = 318;
const DIR: P = (() => {
  const dx = 1;
  const dy = -0.15;
  const n = Math.hypot(dx, dy);
  return [dx / n, dy / n];
})();
const NRM: P = [DIR[1], -DIR[0]]; // 串に直角で、上向き
const FROM: readonly P[] = [
  [20, 238], // 奥：ぼんじり
  [27, 262], //     ぼんじり
  [34, 292], // 鶏ハラミ
  [41, 316], //     鶏ハラミ
  [48, 346], // 手前：鶏皮
  [55, 370], //     鶏皮
];
// 串の上の点（u … 持ち手の端からの長さ、v … 串から上へ）。x は x = CX について折り返す（持ち手が右に来る）
const at = (k: number, u: number, v: number): P => [2 * CX - (FROM[k][0] + DIR[0] * u + NRM[0] * v), FROM[k][1] + DIR[1] * u + NRM[1] * v];
const U0 = 0.3 * L; // 具の始まり（ここまでが持ち手）
const U1 = 0.93 * L; // 具の終わり（ここから先に、竹串の先が少し出る）
// 具の大きさ（3本のときの形に対する倍率）。6本がお皿に収まるよう少し小さくする
const S = 0.87;

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
// 焼き目（小さなでこぼこの丸。r は 3本のときの大きさで、S を掛けて小さくする）
const koge = (k: number, u: number, v: number, r: number, seed: number) => polygon(lump(k, u, v, r * S, r * S * 0.7, 0.3, seed, 0.15, 10));

type Part = { fill: string; outline: string };
type Kushi = { parts: Part[]; lines: string[]; tone: string; holes: Hole[]; koge: string[] };

// 同じ種類の2本（n = 0・1）は、まったく同じ形にしない：
// 具の大きさ（g）・傾き・並びの位置（具の始まりを少しずらす）・揺らぎの種・焼き目の位置を、1本目と2本目で変える（乱数は使わない）

// ── ぼんじり（奥の2本）：まるっとしたかたまり 5個 ──
function bonjiri(k: number, n: number): Kushi {
  const g = S * (n === 0 ? 1 : 0.95);
  const z = n * 500; // 揺らぎの種をずらす
  const step = (U1 - U0) / 5;
  const u = (i: number) => U0 + step * (i + 0.5) + (n === 0 ? 0 : 4);
  const parts = Array.from({ length: 5 }, (_, i) => {
    const pts = lump(
      k,
      u(i) + jitter(9200 + z + i) * 3,
      jitter(9210 + z + i) * 3,
      step * (0.6 + jitter(9240 + z + i) * 0.06) * (g / S) * 0.98,
      (19 + jitter(9220 + z + i) * 3) * g,
      jitter(9250 + z + i) * 0.5 + (n === 0 ? 0 : 0.15),
      9230 + z + i * 30,
      0.11,
      18,
    );
    return { fill: polygon(pts), outline: smooth(pts) };
  });
  // ふくらみの線（かたまりの左上の、まるい弧。3本）
  const lines = (n === 0 ? [0, 2, 4] : [1, 2, 4]).map((i) =>
    curve(k, [
      [u(i) - 13 * g, 4 * g],
      [u(i) - 9 * g, 11 * g],
      [u(i) - 1 * g, 15 * g],
    ]),
  );
  const kg: [number, number, number][] = n === 0 ? [[1, 8, -11], [3, 4, 12], [4, 10, -6]] : [[0, 6, 10], [2, -6, -11], [3, 8, 9]];
  return {
    parts,
    lines,
    tone: "food-wash-karaage",
    holes: [[...at(k, u(2) + 2, 11 * g), 4.6 * g, 2.6 * g] as const],
    koge: kg.map(([i, du, v], j) => koge(k, u(i) + du * g, v * g, [7.5, 6.75, 6][j], 9300 + z + j * 10)),
  };
}

// ── 鶏ハラミ（まん中の2本）：平たい身を折りたたんだ形 4個。互い違いに傾いて重なる ──
function harami(k: number, n: number): Kushi {
  const g = S * (n === 0 ? 1 : 1.04);
  const z = n * 500;
  const step = (U1 - U0) / 4;
  const u = (i: number) => U0 + step * (i + 0.5) + (n === 0 ? 0 : -5);
  // 1本目は 1つ目が上に、2本目は 1つ目が下に傾く
  const tilt = (i: number) => ((i + n) % 2 === 0 ? 0.22 : -0.2);
  const parts = Array.from({ length: 4 }, (_, i) => {
    const pts = lump(k, u(i), jitter(9400 + z + i) * 1.5, step * 0.62 * (g / S) * 0.98, 19 * g, tilt(i), 9410 + z + i * 30, 0.09, 16);
    return { fill: polygon(pts), outline: smooth(pts) };
  });
  // 折り目（身の上から下へ、くの字に。4本）
  const lines = [0, 1, 2, 3].map((i) => {
    const d = (i + n) % 2 === 0 ? 1 : -1;
    return curve(k, [
      [u(i) - 4 * d * g, 15 * g],
      [u(i) + 4 * d * g, 2 * g],
      [u(i) - 2 * d * g, -12 * g],
    ]);
  });
  const kg: [number, number, number][] = n === 0 ? [[0, 10, 10], [2, -8, -10], [3, 6, 8]] : [[1, -6, 9], [2, 9, 8], [3, -4, -10]];
  return {
    parts,
    lines,
    tone: "food-wash-harami",
    holes: [],
    koge: kg.map(([i, du, v], j) => koge(k, u(i) + du * g, v * g, [7.5, 7.5, 6][j], 9500 + z + j * 10)),
  };
}

// ── 鶏皮（手前の2本）：皮を波のようにくねらせた、1本の長いうねり ──
function kawa(k: number, n: number): Kushi {
  const g = S * (n === 0 ? 1 : 0.94);
  const z = n * 500;
  const folds = n === 0 ? 9 : 8; // 2本目は折り目を1つ少なく（うねりが少し大きい）
  const u0 = U0 + (n === 0 ? 0 : 6);
  const step = (U1 - u0) / folds;
  // 上のふち（左 → 右）。折り目ごとにふくらむ。下のふちは半分ずらして互い違いに
  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  for (let i = 0; i <= folds * 2; i++) {
    const uu = u0 + (step / 2) * i;
    const peak = i % 2 === 1;
    // 山は高さを不ぞろいに、谷は深く（皮が細かく折り重なって見えるように）
    top.push([uu + jitter(9660 + z + i) * 2, (peak ? 21 + jitter(9600 + z + i) * 3.5 : 9 + jitter(9600 + z + i) * 1.5) * g]);
    bottom.push([uu + step / 2 + jitter(9680 + z + i) * 2, (peak ? -9 + jitter(9640 + z + i) * 1.5 : -20 + jitter(9640 + z + i) * 3.5) * g]);
  }
  bottom.pop();
  const uv: [number, number][] = [[u0 - 3, 0], ...top, [U1 + 3, -2 * g], ...bottom.reverse(), [u0 - 3, 0]];
  const pts = uv.map(([uu, v]) => at(k, uu, v));
  const outline = smooth([...pts, pts[1]]);
  // うねりのしわ（上のふちのくぼみから、ななめ下へ。折り重なりの境目。5本）
  const lines = (n === 0 ? [1, 3, 4, 6, 8] : [1, 2, 4, 5, 7]).map((i) => {
    const uu = u0 + step * i;
    return curve(k, [
      [uu, 9 * g],
      [uu + 4 * g, 0],
      [uu + 7 * g, -8 * g],
    ]);
  });
  const kg: [number, number][] = n === 0 ? [[1.5, 16], [5, -15], [7.5, 16]] : [[0.8, -15], [3.5, 16], [6.2, -14]];
  return {
    parts: [{ fill: polygon(pts), outline }],
    lines,
    tone: "food-wash-kawa",
    holes: [],
    koge: kg.map(([f, v], j) => koge(k, u0 + step * f, v * g, [7.5, 7.5, 7][j], 9700 + z + j * 10)),
  };
}

// 奥から ぼんじり2本 → 鶏ハラミ2本 → 鶏皮2本
const KUSHI = [bonjiri(0, 0), bonjiri(1, 1), harami(2, 0), harami(3, 1), kawa(4, 0), kawa(5, 1)];
const STICKS = KUSHI.map((_, k) => stick(k));

// ── 湯気（3本。いちばん奥の串〈ぼんじり〉の具の上から、少し浮いた所から立ちのぼる。持ち手〈右〉の上には立てない） ──
// 描き方はしゅうまいと同じ（Steam.tsx）。高さは、からあげより少し短め
const STEAM = [
  mkWisp(118, 182, 104, -3, 1.2, 6.5, 9500, 0.4),
  mkWisp(178, 192, 116, 2, 3.9, 6, 9520, 0.4),
  mkWisp(238, 200, 124, 3, 0.4, 6.5, 9540, 0.4),
];
const STEAM_SWAY = [sway(5.3, -1.1), sway(4.7, -2.6), sway(5.9, -0.3)];

// ── 動きの段（anim の from・to。4〜60。scenes.css の「名物の欄の決まり」） ──
// 主役は、串が奥から1本ずつ上から置かれる所（17〜40 ＝ 全体の約 4 割）。段のあいだに短い間
const T = {
  plateFill: [4, 8], // お皿の面
  plateOut: [4, 12], // お皿のふちの外が描かれる
  plateIn: [7, 15], // ふちの内
  skewer: [17, 23], // （間）串が置かれる（1本目。1本ずつ SKEWER_STEP ずらす。6本目は 34〜40）
  wash: [42, 47], // （間）水彩がじわっと出る（1本ずつ 1 ずらす。6本目は 47〜52）
  steam: [[51, 56], [53, 58], [55, 60]], // 湯気が3本立ちのぼる（完成）
} as const;
const SKEWER_STEP = 3.4;
// 線のいちばん下は、絵の場所の上から 74.2%。主役が時間で動くとき (17 × 0.045 + 6 × 0.05) × 1.35 ≒ 1.4 秒
const CARD = cardTiming({ ink: 0.75, time: 1.35 });

// 水彩がじわっと出る動き（串ごとに少しずつずらす。このあとに湯気が立ちのぼる）
const washAnim = (i: number) => animAt("scene-fade-up", T.wash, { "--dy": "0px" }, i);

export default function KushiIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-17 64 430 430"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      style={{ "--scene-z": 430 / 400, ...CARD } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 水彩のにじみ（塗りにだけ。串で1つを使い回す） */}
        <WashFilter id="kushi-wash" seed={13} />
        {/* 湯気の濃さ（1本ずつ。根元と上の端は透明） */}
        <SteamFades id="kushi-steam-fade" wisps={STEAM} />
      </defs>

      {/* 1. お皿（線だけ。ふちの外 → 厚み → 内の順に描かれる） */}
      <g className="kushi-plate">
        <path d={PLATE_FILL} className="scene-paper scene-anim" stroke="none" style={animAt("scene-fade-up", T.plateFill, { "--dy": "0px" })} />
        <path d={PLATE_OUTER} pathLength={1} className="scene-line scene-stroke-draw scene-anim" style={animAt("scene-draw", T.plateOut)} />
        <path d={PLATE_INNER} pathLength={1} className="scene-fine scene-stroke-draw scene-anim" style={animAt("scene-draw", T.plateIn)} />
      </g>

      {/* 2. 串（6本。奥から1本ずつ、上から置かれる。手前の串が奥の串に重なる）。
          1本ごとに：竹串 → 具の後ろを隠す紙の色 → 水彩（いちばん最後にじわっと出る）→ 具の輪郭と中の線 */}
      <g className="kushi-skewers">
        {KUSHI.map((ku, i) => (
          <g key={i} className="scene-anim" style={animAt("scene-fade-up", T.skewer, { "--dy": "-30px" }, i * SKEWER_STEP)}>
            <path d={STICKS[i].fill} className="scene-paper" stroke="none" />
            {STICKS[i].lines.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
            {/* 具は持ち手の側（右）のものから1つずつ（先の側〈左〉のものが、右のものの線と塗りに重なる） */}
            {ku.parts.map((p, k) => (
              <g key={k}>
                <path d={p.fill} className="scene-paper" stroke="none" />
                <g className="scene-anim" style={washAnim(i)}>
                  <g>
                    <Wash filter="kushi-wash" d={p.fill} tone={ku.tone} id={`kushi-w-${i}-${k}`} shift={[1, 0.75]} holes={k === 2 ? ku.holes : []} />
                  </g>
                </g>
                <path d={p.outline} className="scene-line" />
              </g>
            ))}
            {/* 焼き目（濃い茶色の小さな水彩を重ねる） */}
            <g className="scene-anim" style={washAnim(i)}>
              <g>
                {ku.koge.map((d, k) => (
                  <Wash filter="kushi-wash" key={k} d={d} tone="food-wash-koge" id={`kushi-w-koge-${i}-${k}`} shift={[0.5, 0.4]} line={2.1} />
                ))}
              </g>
            </g>
            {ku.lines.map((d, k) => (
              <path key={k} d={d} className="scene-fine" />
            ))}
          </g>
        ))}
      </g>

      {/* 3. 湯気（水彩がじわっと出たあと、具の上から3本立ちのぼる。時間でゆっくり揺れる） */}
      <SteamWisps className="kushi-steam" id="kushi-steam-fade" wisps={STEAM} sways={STEAM_SWAY} timing={T.steam} />
    </svg>
  );
}
