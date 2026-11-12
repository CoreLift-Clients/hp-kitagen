// ─── 店主の手元（しゅうまいを包む両手）の線画 ───
// 店主紹介のページ（/owner）の、ページの見出しのすぐ下に置く飾りの絵（aria-hidden。意味は本文で伝える）。
// ・まな板の上で、しゅうまいの皮を包んでいる両手（手首から先。袖口が少し見える程度）。
//   まな板の奥に、包み終わったしゅうまいが3個
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。
//   重なった後ろの線を隠すための塗り（--scene-paper）を、袖・手・皮・しゅうまいに付ける
// ・差し色は accent を1か所だけ（奥のまん中のしゅうまいの上の点。トップのせいろの絵と同じ扱い）
// ・部品ごとに g でまとめる：まな板（hands-board）・両手（hands-hands ＝ 皮（hands-skin）＋ 袖と手）・
//   包み終わったしゅうまい（hands-done。1個ずつ）
// ・動きの順番（動きの名前と範囲は anim(...)、@keyframes は scenes.css）：
//   1) まな板と両手が現れる（4〜20）
//   2) 手の中の皮が、ひだを寄せるようにすぼまる（20〜36）。ひだの線が描かれていく（22〜40）
//   3) 包み終わったしゅうまいが、奥に左から1つずつ並んでいく（38〜58）
//   ページのいちばん上に置くので、スクロールの位置では進めず、画面に入ったときに1回だけ時間で進める
//   （app/owner/page.tsx の ScenePlayOnView の playOnce）。何も動かさないときの形が「動き終わった絵」
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arc, arcPts, line, polygon, smooth, type P } from "./draw";

// ── まな板（少し上から見た板。上の面と、手前の厚み） ──
const BOARD = [
  line([78, 141], [322, 140], 9000, 0.8, 4), // 奥のふち
  line([322, 140], [364, 236], 9010, 0.6, 3), // 右
  line([364, 236], [36, 237], 9020, 0.8, 4), // 手前のふち
  line([36, 237], [78, 141], 9030, 0.6, 3), // 左
  line([364, 236], [364, 247], 9040, 0.2, 1), // 厚み
  line([364, 247], [36, 248], 9050, 0.8, 4),
];
const BOARD_FINE = [
  line([108, 168], [196, 167], 9060, 0.6, 3), // 木目
  line([236, 204], [328, 205], 9070, 0.6, 3),
  line([92, 214], [146, 213], 9080, 0.4, 2),
];

// ── 包み終わったしゅうまい（小さめ。口のひだ・胴・底・ひだの筋） ──
function shumai(cx: number, ty: number, seed: number) {
  return {
    fill: polygon([
      ...arcPts(cx, ty, 11, 3.5, PI, PI * 2, 10, 0, 0),
      [cx + 12, ty + 8],
      [cx + 13.5, ty + 16],
      [cx + 12.5, ty + 21],
      [cx - 12.5, ty + 21],
      [cx - 13.5, ty + 16],
      [cx - 12, ty + 8],
    ]),
    lines: [
      smooth(arcPts(cx, ty, 11, 3.5, PI * 0.95, PI * 3.03, 28, 0.25, seed, { k: 9, a: 0.14 })),
      smooth([
        [cx - 10.5, ty + 2],
        [cx - 13.5, ty + 9],
        [cx - 14, ty + 16],
        [cx - 12.5, ty + 21],
      ]),
      smooth([
        [cx + 10.5, ty + 2],
        [cx + 13.5, ty + 9],
        [cx + 14, ty + 16],
        [cx + 12.5, ty + 21],
      ]),
      arc(cx, ty + 21, 12.5, 2.6, PI * 0.05, PI * 0.95, 8, 0.2, seed + 30),
    ],
    fine: [line([cx - 4, ty + 5], [cx - 5.5, ty + 16], seed + 40, 0.3, 1), line([cx + 4, ty + 5], [cx + 5.5, ty + 16], seed + 45, 0.3, 1)],
  };
}
const DONE_AT: readonly P[] = [
  [250, 158],
  [288, 155],
  [326, 159],
];
const DONE = DONE_AT.map(([cx, ty], i) => shumai(cx, ty, 9100 + i * 50));

// ── 手の中の皮（具を包み、口のまわりにひだを寄せている） ──
const SKIN_BODY: readonly P[] = [
  [154, 196],
  [152, 210],
  [160, 226],
  [175, 232],
  [190, 226],
  [198, 210],
  [196, 196],
];
const SKIN_FILL = polygon([...arcPts(175, 194, 21, 6, PI, PI * 2, 12, 0, 0), ...SKIN_BODY.slice().reverse()]);
const SKIN = [
  smooth(SKIN_BODY),
  smooth(arcPts(175, 194, 21, 6, PI * 0.95, PI * 3.03, 40, 0.4, 9300, { k: 12, a: 0.12 })), // 口のひだ（波打つ輪）
];
const SKIN_FINE = [arc(175, 195, 11, 3, PI * 1.1, PI * 1.9, 6, 0.3, 9320)]; // 中の具
// ひだの線（口から下へ、寄せるように）
const PLEATS = [-14, -7, 0, 7, 14].map((dx, i) =>
  line([175 + dx, 200 + Math.abs(dx) * -0.12], [175 + dx * 0.78, 215 - Math.abs(dx) * 0.2], 9340 + i * 4, 0.4, 1),
);

// ── 左手（下から皮の底を支え、親指を皮の左に添える） ──
const LEFT_HAND_PTS: readonly P[] = [
  [64, 236],
  [96, 226],
  [122, 218],
  [140, 210],
  [148, 200],
  [154, 192],
  [160, 195],
  [158, 206],
  [154, 218],
  [162, 230],
  [178, 238],
  [196, 236],
  [204, 230],
  [207, 239],
  [197, 249],
  [170, 256],
  [136, 262],
  [104, 268],
  [80, 273],
];
const LEFT_HAND_FILL = polygon(LEFT_HAND_PTS);
const LEFT_HAND = smooth([...LEFT_HAND_PTS, LEFT_HAND_PTS[0]]);
const LEFT_HAND_FINE = [
  line([140, 224], [151, 213], 9400, 0.3, 1), // 親指のつけ根
  line([181, 248], [199, 241], 9405, 0.3, 1), // 指の境
  line([170, 253], [190, 247], 9410, 0.3, 1),
];
// 左の袖口
const LEFT_SLEEVE_FILL = polygon([
  [62, 232],
  [80, 277],
  [40, 296],
  [0, 296],
  [0, 262],
]);
const LEFT_SLEEVE = [line([62, 232], [80, 277], 9420, 0.3, 1), line([62, 232], [0, 262], 9425, 0.5, 2), line([80, 277], [40, 296], 9430, 0.4, 1)];

// ── 右手（右から、人さし指で皮の口のひだを寄せ、親指を皮の手前に添える） ──
const RIGHT_HAND_PTS: readonly P[] = [
  [336, 236],
  [304, 222],
  [276, 208],
  [250, 198],
  [226, 190],
  [208, 185],
  [199, 188],
  [201, 193],
  [210, 198],
  [224, 204],
  [216, 209],
  [205, 213],
  [203, 219],
  [210, 223],
  [228, 224],
  [252, 228],
  [280, 238],
  [310, 252],
  [342, 259],
];
const RIGHT_HAND_FILL = polygon(RIGHT_HAND_PTS);
const RIGHT_HAND = smooth([...RIGHT_HAND_PTS, RIGHT_HAND_PTS[0]]);
const RIGHT_HAND_FINE = [
  smooth([
    [212, 193],
    [232, 200],
    [252, 207],
  ]), // 人さし指と中指の境
  line([246, 214], [236, 220], 9440, 0.3, 1), // 親指のつけ根
];
// 右の袖口
const RIGHT_SLEEVE_FILL = polygon([
  [338, 232],
  [400, 248],
  [400, 296],
  [346, 296],
  [345, 263],
]);
const RIGHT_SLEEVE = [
  line([338, 232], [345, 263], 9450, 0.3, 1),
  line([338, 232], [400, 250], 9455, 0.5, 2),
  line([345, 263], [400, 278], 9460, 0.5, 2),
];

const paths = (ds: readonly string[], className: string) => ds.map((d, i) => <path key={i} d={d} className={className} />);

export default function OwnerHandsIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 118 400 170"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 1) まな板が現れる */}
      <g className="hands-board scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "6px" })}>
        {paths(BOARD, "scene-line")}
        {paths(BOARD_FINE, "scene-fine")}
      </g>

      {/* 3) 包み終わったしゅうまいが、奥に1つずつ並ぶ */}
      {DONE.map((s, i) => (
        <g
          key={i}
          className="hands-done scene-anim"
          style={anim("scene-fade-up", 38 + i * 6, 46 + i * 6, { "--dy": "6px" })}
        >
          <path d={s.fill} className="scene-paper" stroke="none" />
          {paths(s.lines, "scene-line")}
          {paths(s.fine, "scene-fine")}
          {/* 差し色（accent）はここだけ：まん中のしゅうまいの上の点 */}
          {i === 1 && <circle cx={DONE_AT[1][0]} cy={DONE_AT[1][1] - 0.5} r={2.6} className="scene-accent-fill" stroke="none" />}
        </g>
      ))}

      {/* 1) 両手が現れる */}
      <g className="hands-hands scene-anim" style={anim("scene-fade-up", 8, 20, { "--dy": "10px" })}>
        {/* 2) 皮がひだを寄せるようにすぼまる（下を支点に、広く平たい形から） */}
        <g className="hands-skin scene-anim" style={anim("owner-gather", 20, 36, { "--o": "50% 100%" })}>
          <path d={SKIN_FILL} className="scene-paper" stroke="none" />
          {paths(SKIN, "scene-line")}
          {paths(SKIN_FINE, "scene-fine")}
          {PLEATS.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="scene-fine scene-stroke-draw scene-anim"
              style={anim("scene-draw", 22 + i * 2, 32 + i * 2)}
            />
          ))}
        </g>

        <path d={LEFT_SLEEVE_FILL} className="scene-paper" stroke="none" />
        {paths(LEFT_SLEEVE, "scene-line")}
        <path d={LEFT_HAND_FILL} className="scene-paper" stroke="none" />
        <path d={LEFT_HAND} className="scene-line" />
        {paths(LEFT_HAND_FINE, "scene-fine")}

        <path d={RIGHT_SLEEVE_FILL} className="scene-paper" stroke="none" />
        {paths(RIGHT_SLEEVE, "scene-line")}
        <path d={RIGHT_HAND_FILL} className="scene-paper" stroke="none" />
        <path d={RIGHT_HAND} className="scene-line" />
        {paths(RIGHT_HAND_FINE, "scene-fine")}
      </g>
    </svg>
  );
}
