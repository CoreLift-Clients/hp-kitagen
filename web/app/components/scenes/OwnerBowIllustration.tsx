// ─── 店主のお辞儀の線画 ───
// トップの「結び」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・実在の店主なので、顔（目・鼻・口・メガネ）は描かない。顔は横顔の輪郭の線だけで、前髪の房で大部分が隠れる
// ・横から見た全身の立ち姿（右向き）。くせのある少し長めの髪（耳が隠れる）、濃い色の上着（背中側に短い斜線）、ズボン、
//   体の前で軽く重ねた手、足もとに短い地面の線
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。
//   重なった後ろの線を隠すための塗り（--scene-paper）を、上着・髪・腕・手・前髪に付ける
// ・差し色は accent を1か所だけ（上着の胸元の小さな点）
// ・部品ごとに g でまとめる：地面（bow-ground）・人（bow-figure）＝ 足もと（ズボン・靴・上着の裾）＋
//   上体（bow-upper ＝ 頭・腕・上着の上半分。腰を支点に回る）＋ 前髪（bow-hair。上体の中で、根元を支点に回る）
// ・動きの順番（スクロールの位置で進む。動きの名前と範囲は anim(...)、@keyframes は scenes.css）：
//   1) 地面の線が描かれ、店主がまっすぐ立った姿で現れる（4〜20）
//   2) 腰を支点に、上体がゆっくり前へ倒れ、35° のお辞儀になる（22〜44）
//   3) 前髪の先が少し前に垂れる（44〜54）
//   お辞儀の姿で止まる（戻らない）。何も動かさないときの形（scenes.css の .owner-bow・.owner-hair）がお辞儀の姿なので、
//   prefers-reduced-motion のときと、動かせないブラウザで動き終わったあとも、お辞儀の姿で見える
// ・回る部品の支点：transform-box は fill-box（scenes.css の .scene-anim）なので、
//   回る g の中に「支点をまん中にした見えない四角」（PivotBox）を入れ、g の大きさの中心を支点に合わせる
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arcPts, line, polygon, smooth, type P } from "./draw";

// 下の座標は、人を描きやすい位置で決めてから、横に DX だけずらして絵のまん中に置く
// （立ち姿とお辞儀の姿を合わせた横幅が、絵のまん中に来るように）
const DX = -17;
const ps = (pts: readonly P[]): P[] => pts.map(([x, y]) => [x + DX, y]);
const p = (x: number, y: number): P => [x + DX, y];
const sm = (pts: readonly P[]) => smooth(ps(pts));
const poly = (pts: readonly P[]) => polygon(ps(pts));

// ── 支点 ──
const HIP = p(175, 220); // 腰（上体が回る支点）
const HAIR_ROOT = p(185, 55); // 前髪の根元（前髪が回る支点）

// 回る g の大きさの中心を支点に合わせる、見えない四角（中身より大きく、支点がまん中）。
// 中に回る g（前髪）があるときは、その g の四角が回った形まで含む大きさにする
function PivotBox({ at, half }: { at: P; half: number }) {
  return <rect x={at[0] - half} y={at[1] - half} width={half * 2} height={half * 2} fill="none" stroke="none" />;
}

// ── 地面 ──
const GROUND = line(p(118, 361), p(300, 360), 8000, 0.8, 4);

// ── 足もと（動かない）：ズボン・靴・上着の裾 ──
const LEGS = [
  sm([
    [158, 212],
    [156, 240],
    [161, 280],
    [163, 320],
    [164, 350],
  ]), // ズボンの後ろ
  sm([
    [194, 214],
    [195, 250],
    [193, 290],
    [194, 325],
    [196, 350],
  ]), // ズボンの前
  sm([
    [163, 349],
    [161, 357],
    [188, 358.5],
    [211, 358],
    [213, 353],
    [204, 349],
    [195, 347.5],
  ]), // 靴
];
const LEGS_FINE = [
  sm([
    [178, 254],
    [177, 300],
    [179, 348],
  ]), // 奥の足との境
];
// 上着の裾（腰から下）。上の端は上体の塗りの後ろに隠れ、お辞儀をすると背中側が少し見える
const HEM_PTS: readonly P[] = [
  [161, 206],
  [157, 218],
  [156, 232],
  [157, 248],
  [198, 246],
  [197, 232],
  [195, 214],
];
const HEM_FILL = poly(HEM_PTS);
const HEM = [
  sm([
    [161, 206],
    [157, 218],
    [156, 232],
    [157, 248],
  ]), // 背中側（上の端は、お辞儀をしたときに上体の背中の線の終わりと出会う）
  sm([
    [195, 214],
    [197, 232],
    [198, 246],
  ]),
  line(p(157, 248), p(198, 246), 8020, 0.4, 2),
];
const HEM_FINE = [line(p(161, 244), p(168, 237), 8030, 0.2, 1), line(p(172, 245), p(179, 238), 8033, 0.2, 1)];

// ── 上体（腰を支点に回る）：上着の上半分・首・顔の輪郭・髪・腕・手 ──
// 上着の背中の線は腰（y 214）まで。そこから下の背中の線は、裾（動かない）の線が受け持つ
// （お辞儀をしたとき、背中の線が腰より後ろへ突き出さないように）。
// 塗りは前のほうだけ腰より少し下（y 232）まで。立ち姿では裾の上の端を隠し、下の端の線は描かない
const TORSO_FILL = poly([
  [172, 110],
  [163, 122],
  [158, 145],
  [157, 180],
  [157, 214],
  [176, 226],
  [195, 232],
  [196, 200],
  [197, 160],
  [195, 132],
  [190, 114],
]);
const TORSO = [
  sm([
    [172, 111],
    [163, 123],
    [158, 146],
    [157, 185],
    [157, 214],
  ]), // 背中
  sm([
    [190, 114],
    [195, 132],
    [197, 160],
    [196, 200],
    [195, 232],
  ]), // 胸・おなか
];
const TORSO_FINE = [
  line(p(184, 110), p(191, 125), 8100, 0.2, 1), // えり
  // 濃い色の上着の斜線（背中側に短く）
  ...[150, 166, 182, 198].map((y, i) => line(p(159, y + 8), p(166, y), 8110 + i * 3, 0.2, 1)),
];
const NECK = [line(p(176, 98), p(174, 113), 8150, 0.3, 1), line(p(189, 104), p(190, 115), 8155, 0.3, 1)];
// 横顔の輪郭（額からあごまで、なだらかな線だけ。目・鼻・口は描かない）
const FACE = sm([
  [196, 63],
  [200, 71],
  [202, 81],
  [201, 91],
  [198, 99],
  [192, 103.5],
  [186, 104],
]);
// 髪（後ろ頭の外側は、くせのある波打つ線。下の端は耳を隠して、えり足まで）
const HAIR_PTS: P[] = [
  ...arcPts(178, 78, 21, 28, -0.2 * PI, -1.3 * PI, 22, 0.5, 8200, { k: 11, a: 0.05 }),
  [170, 106],
  [176, 103],
  [181, 107],
  [186, 100],
  [190, 90],
  [192, 80],
  [193, 70],
  [195, 61.5],
];
const HAIR_FILL = poly(HAIR_PTS);
const HAIR = sm(HAIR_PTS);
// 髪のくせ（小さな巻き）
const HAIR_FINE = [
  smooth(ps(arcPts(170, 66, 5, 3.5, PI * 0.9, PI * 2.2, 6, 0.2, 8250))),
  smooth(ps(arcPts(164, 84, 4, 4.5, PI * 1.6, PI * 2.9, 6, 0.2, 8260))),
  smooth(ps(arcPts(178, 92, 4, 3.5, PI * 0.1, PI * 1.3, 6, 0.2, 8270))),
];
// 腕（肩から下りて、手を体の前へ）
const ARM_TOP: readonly P[] = [
  [168, 131],
  [171, 123],
  [179, 119],
  [187, 127],
];
const ARM_FRONT: readonly P[] = [
  [187, 127],
  [188, 158],
  [189, 180],
  [194, 195],
  [199, 203],
];
const ARM_BACK: readonly P[] = [
  [168, 130],
  [166, 160],
  [169, 186],
  [179, 205],
  [188, 213],
];
const ARM_FILL = poly([...ARM_TOP, ...ARM_FRONT, ...[...ARM_BACK].reverse()]);
const ARM = [sm(ARM_TOP), sm(ARM_FRONT), sm(ARM_BACK)];
const ARM_FINE = [line(p(188, 213), p(199, 203), 8300, 0.2, 1)]; // 袖口
// 手（手前の手と、その奥から少しのぞく手。軽く重ねる）
const HAND_PTS: readonly P[] = [
  [189, 212],
  [192, 220],
  [199, 225],
  [207, 224],
  [211, 218],
  [208, 210],
  [200, 204],
  [189, 212],
];
const HAND_FILL = poly(HAND_PTS);
const HAND = sm(HAND_PTS);
const HAND_FINE = [
  sm([
    [201, 205],
    [209, 206],
    [213.5, 212],
    [212, 218],
  ]), // 奥の手の指先
  line(p(198, 210), p(205, 214), 8320, 0.2, 1), // 親指
];
// 前髪の房（額から顔の前に下りる。後ろの横顔の線を隠す）
const BANGS_PTS: readonly P[] = [
  [183, 54],
  [194, 56],
  [202, 64],
  [205, 74],
  [204, 84],
  [206.5, 90],
  [201, 92.5],
  [198, 86],
  [197, 76],
  [192, 66],
  [186, 60],
  [183, 54],
];
const BANGS_FILL = poly(BANGS_PTS);
const BANGS = sm(BANGS_PTS);
const BANGS_FINE = [
  sm([
    [188, 57],
    [197, 66],
    [201, 80],
  ]),
];

const paths = (ds: readonly string[], className: string) => ds.map((d, i) => <path key={i} d={d} className={className} />);

export default function OwnerBowIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 34 400 336"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 1) 地面の線が描かれる */}
      <path
        d={GROUND}
        pathLength={1}
        className="bow-ground scene-fine scene-stroke-draw scene-anim"
        style={anim("scene-draw", 4, 14)}
      />

      {/* 1) まっすぐ立った姿で現れる */}
      <g className="bow-figure scene-anim" style={anim("scene-fade-up", 6, 20, { "--dy": "8px" })}>
        {/* 足もと（動かない） */}
        {paths(LEGS, "scene-line")}
        {paths(LEGS_FINE, "scene-fine")}
        <path d={HEM_FILL} className="scene-paper" stroke="none" />
        {paths(HEM, "scene-line")}
        {paths(HEM_FINE, "scene-fine")}

        {/* 2) 上体：腰を支点に前へ倒れる（何も動かさないときは、お辞儀の姿） */}
        <g className="bow-upper owner-bow scene-anim" style={anim("owner-bow", 22, 44)}>
          {/* 前髪の見えない四角（回った形でも 上の端が y −2 くらい）まで含む大きさにする（含まないと、まん中が腰からずれる） */}
          <PivotBox at={HIP} half={240} />
          {paths(NECK, "scene-fine")}
          <path d={TORSO_FILL} className="scene-paper" stroke="none" />
          {paths(TORSO, "scene-line")}
          {paths(TORSO_FINE, "scene-fine")}
          {/* 差し色（accent）はここだけ：上着の胸元の小さな点 */}
          <circle cx={192 + DX} cy={146} r={3} className="scene-accent-fill" stroke="none" />
          <path d={FACE} className="scene-fine" />
          <path d={HAIR_FILL} className="scene-paper" stroke="none" />
          <path d={HAIR} className="scene-line" />
          {paths(HAIR_FINE, "scene-fine")}
          <path d={ARM_FILL} className="scene-paper" stroke="none" />
          {paths(ARM, "scene-line")}
          {paths(ARM_FINE, "scene-fine")}
          <path d={HAND_FILL} className="scene-paper" stroke="none" />
          <path d={HAND} className="scene-line" />
          {paths(HAND_FINE, "scene-fine")}

          {/* 3) 前髪の先が少し前に垂れる（根元を支点に。何も動かさないときは、垂れた形） */}
          <g className="bow-hair owner-hair scene-anim" style={anim("owner-hair", 44, 54)}>
            <PivotBox at={HAIR_ROOT} half={50} />
            <path d={BANGS_FILL} className="scene-paper" stroke="none" />
            <path d={BANGS} className="scene-line" />
            {paths(BANGS_FINE, "scene-fine")}
          </g>
        </g>
      </g>
    </svg>
  );
}
