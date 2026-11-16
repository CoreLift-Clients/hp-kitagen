// ─── 水彩の塗り（線画に、うすく絵の具で塗ったように見せる部品） ───
// 料理の絵の決まり（scenes.css の先頭）の「水彩の塗り方」を、SVG の部品にしたもの。食材の塗りにだけ使う（入れ物は線だけ）。
// ・Wash … 1つの塗り。線の形 d を、少し右下へずらして塗る（shift。0.75〜1.5 くらい）。
//   塗りは、にじみのフィルタ（filter）をかけた後で、線の内側だけの形で切り抜く（mask）。
//   mask は、線の形を白で塗り、その上に、線と同じ太さのふちを黒で重ねた形 ＝ 線の太さの半分だけ内側に縮めた形。
//   なので、塗りは線の内側のふちまでで止まり、線の外へは一切出ない（線の下にも入らない）。
//   line … その形の輪郭の線の太さ（400 の幅の絵での px。ふつうは .scene-line と同じ 2.6。
//   角煮の輪郭は 1.8、ねぎの輪は 1.5、輪郭の線が無い小さな塗り〈焼き目〉は .scene-fine と同じ 2.1）。
//   実際の太さは、線と同じく --scene-k・--scene-z を掛ける（scenes.css）
//   ふちの内側に沿って、同じ色を少し濃く細く重ねる（絵の具がたまった感じ。clipPath で内側だけに見せる）。
//   塗りの中に、紙の色がのぞく小さな抜けを1〜2か所（holes）
// ・WashFilter … にじみのフィルタ（feTurbulence ＋ feDisplacementMap。乱数なし＝ seed を決めておく）。
//   絵ごとに1つを defs に置き、Wash の filter にその id を渡して使い回す（切り抜きの前にかけるため、塗りごとにかける）。線にはかけない
// ・色と濃さは scenes.css の .food-wash-*（--wash・--wash-a・--wash-edge）と .wash・.wash-edge・.wash-hole

import type { P } from "./draw";

// 抜け：[中心 x, 中心 y, 横の半径, 縦の半径]
export type Hole = readonly [number, number, number, number];

export function Wash({
  d,
  tone,
  id,
  filter,
  shift = [1, 0.75],
  holes = [],
  line = 2.6,
}: {
  d: string;
  tone: string;
  id: string;
  filter?: string;
  shift?: P;
  holes?: readonly Hole[];
  line?: number;
}) {
  return (
    <g mask={`url(#${id}-m)`}>
      {/* 線の内側だけの形（ずらす前の、線と同じ位置）。白の塗りの上に、線と同じ太さの黒いふちを重ねて、太さの半分だけ内側に縮める */}
      <mask id={`${id}-m`} x="-50%" y="-50%" width="200%" height="200%">
        <path
          d={d}
          style={{
            fill: "#fff",
            stroke: "#000",
            strokeWidth: `calc(${line}px * var(--scene-k, 1) * var(--scene-z, 1))`,
            strokeLinejoin: "round",
          }}
        />
      </mask>
      <g filter={filter ? `url(#${filter})` : undefined}>
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
      </g>
    </g>
  );
}

// にじみのフィルタ。scale はゆれの大きさ（ずれは最大でその半分。3 なら ±1.5）。
// 塗りごとにかけるので、範囲は塗りの形の外へ 30% ずつ広げておく（小さなねぎの輪でも、揺れたふちが切れないように）。
// 1) ふちのにじみ：低い周波数の模様（feTurbulence）で、塗りの形をわずかに揺らす（feDisplacementMap）
// 2) 絵の具のムラ：少し細かい模様で、塗りの濃さを 0.65〜0.95 倍くらいの間でやわらかく変える
//    （feColorMatrix で模様の赤の明るさを濃さに変え、feComposite の in で塗りに掛ける）。
//    wide のときは、ムラの幅を少し広く 0.55〜0.95 倍くらいに（色を濃くしても水彩に見えるように。肉みそ冷奴）
// 3) blur を渡したときだけ、最後に塗りのふちを少しぼかす（feGaussianBlur。鉄鍋餃子の、焼き色と皮の境目）。
//    切り抜き（Wash の mask）はぼかしの後なので、線の側のふちはぼけない
export function WashFilter({ id, seed, scale = 3, wide = false, blur = 0 }: { id: string; seed: number; scale?: number; wide?: boolean; blur?: number }) {
  const mura = wide ? "-1 0 0 0 1.25" : "-0.75 0 0 0 1.2";
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={seed + 1} result="m" />
      <feColorMatrix in="m" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${mura}`} result="ma" />
      <feComposite in="d" in2="ma" operator="in" result="w" />
      {blur > 0 && <feGaussianBlur in="w" stdDeviation={blur} />}
    </filter>
  );
}
