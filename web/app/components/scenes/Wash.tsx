// ─── 水彩の塗り（線画に、うすく絵の具で塗ったように見せる部品） ───
// 料理の絵の決まり（scenes.css の先頭）の「水彩の塗り方」を、SVG の部品にしたもの。食材の塗りにだけ使う（入れ物は線だけ）。
// ・Wash … 1つの塗り。線の形 d を、少し右下へずらして塗る（shift。1.5〜3 くらい）。
//   ふちの内側に沿って、同じ色を少し濃く細く重ねる（絵の具がたまった感じ。clipPath で内側だけに見せる）。
//   塗りの中に、紙の色がのぞく小さな抜けを1〜2か所（holes）
// ・WashFilter … にじみのフィルタ（feTurbulence ＋ feDisplacementMap。乱数なし＝ seed を決めておく）。
//   絵ごとに1つを defs に置き、塗りをまとめた g に filter="url(#…)" で使い回す。線にはかけない
// ・色と濃さは scenes.css の .food-wash-*（--wash・--wash-a・--wash-edge）と .wash・.wash-edge・.wash-hole

import type { P } from "./draw";

// 抜け：[中心 x, 中心 y, 横の半径, 縦の半径]
export type Hole = readonly [number, number, number, number];

export function Wash({
  d,
  tone,
  id,
  shift = [2, 1.5],
  holes = [],
}: {
  d: string;
  tone: string;
  id: string;
  shift?: P;
  holes?: readonly Hole[];
}) {
  return (
    <g className={tone} transform={`translate(${shift[0]} ${shift[1]})`} stroke="none">
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <path d={d} className="wash" />
      <path d={d} className="wash-edge" clipPath={`url(#${id})`} />
      {holes.map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} className="wash-hole" />
      ))}
    </g>
  );
}

// にじみのフィルタ。scale はゆれの大きさ（ずれは最大でその半分。6 なら ±3）。
// 1) ふちのにじみ：低い周波数の模様（feTurbulence）で、塗りの形をわずかに揺らす（feDisplacementMap）
// 2) 絵の具のムラ：少し細かい模様で、塗りの濃さを 0.65〜0.95 倍くらいの間でやわらかく変える
//    （feColorMatrix で模様の赤の明るさを濃さに変え、feComposite の in で塗りに掛ける）
export function WashFilter({ id, seed, scale = 6 }: { id: string; seed: number; scale?: number }) {
  return (
    <filter id={id} x="-6%" y="-6%" width="112%" height="112%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={seed + 1} result="m" />
      <feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.75 0 0 0 1.2" result="ma" />
      <feComposite in="d" in2="ma" operator="in" />
    </filter>
  );
}
