// ─── 焼酎・日本酒の線画（一升瓶とお猪口） ───
// ディナーメニューの「きたげんの名物」の欄の、お飲みものの弐（焼酎・日本酒）のカードで使う飾りの絵（aria-hidden。意味はカードの品名で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
//   （瓶とお猪口にだけ、後ろの線を隠すための塗り --scene-paper を付ける）
// ・差し色は accent を1か所だけ（瓶のラベルの四角）
// ・部品ごとに g でまとめる：お猪口（sake-choko）・一升瓶（sake-bottle）・注がれる線（sake-pour）・お猪口の中の波（sake-ripple）
// ・瓶はまっすぐ立った形で描き、左下の角を支点に 30 度傾けて置く（動き終わりの形）
// ・動きの順番：瓶とお猪口が現れる → 瓶が少し傾く（まっすぐ立った形から）→ お猪口へ注がれる線（上から下へ描く）→
//   お猪口の中に小さな波の線
//   （動きの名前と範囲は anim(...)、@keyframes は scenes.css。傾きは toast-tilt を使う）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { PI, anim, arc, line, polygon, ring, smooth, type P } from "./draw";

// ── 一升瓶（まっすぐ立った形。左下の角 (250, 352) を支点に傾ける） ──
const PIVOT: P = [250, 352];
const TILT = -30; // 傾ける角度（度。マイナスは左へ）
const BOTTLE_OUTLINE: P[] = [
  [253, 352], // 底の左（角は少し丸める）
  [250, 346],
  [250, 190], // 胴の左
  [252, 172],
  [262, 150], // 肩
  [272, 126],
  [275, 104], // 首の左
  [275, 62],
  [294, 62], // 首の右
  [294, 104],
  [297, 126],
  [307, 150],
  [317, 172],
  [319, 190], // 胴の右
  [319, 346],
  [316, 352],
];
const BOTTLE_FILL = polygon(BOTTLE_OUTLINE);
const BOTTLE = [
  smooth(BOTTLE_OUTLINE.slice(0, 8)), // 左（底 → 首）
  smooth(BOTTLE_OUTLINE.slice(8)), // 右（首 → 底）
  line([253, 352], [316, 352], 9700, 0.4, 2), // 底
  ring(284.5, 60, 11, 3.6, 9710, 0.3), // 口
];
const BOTTLE_FINE = [
  line([276, 74], [293, 74], 9720, 0.3, 1), // 口の下の帯
  line([253, 204], [253, 330], 9730, 0.6, 2), // ガラスの光（左の縦の筋）
];
// ラベル（差し色の四角）と、ラベルの中の字のような短い縦の筋（foreground）
const LABEL = smooth([
  [262, 212],
  [286, 211],
  [308, 212],
  [309, 250],
  [308, 290],
  [286, 291],
  [262, 290],
  [261, 250],
  [262, 212],
]);
const LABEL_FINE = [line([285, 224], [285, 262], 9740, 0.3, 1), line([296, 228], [296, 248], 9750, 0.3, 1)];

// ── お猪口（左下） ──
const CHOKO_CX = 120;
const CHOKO_TOP = 300;
const CHOKO_PTS: P[] = [
  [76, 300],
  [83, 328],
  [100, 348],
  [140, 348],
  [157, 328],
  [164, 300],
];
const CHOKO_FILL = polygon([...CHOKO_PTS, [120, 308]]);
const CHOKO = [
  ring(CHOKO_CX, CHOKO_TOP, 44, 12, 9800, 0.4), // 口
  smooth(CHOKO_PTS), // 胴
  line([105, 348], [107, 360], 9810, 0.2, 1), // 高台の左
  line([135, 348], [133, 360], 9820, 0.2, 1), // 高台の右
  arc(120, 360, 14, 3, PI * 0.05, PI * 0.95, 6, 0.2, 9830), // 高台の下
];
const CHOKO_FINE = [arc(CHOKO_CX, CHOKO_TOP + 1, 34, 8, PI * 1.05, PI * 1.95, 8, 0.3, 9840)]; // 内側の段（奥）

// 注がれる線：傾いた瓶の口（約 (132, 80)）から、お猪口の中まで。上から下へ描く
const POUR = smooth([
  [128, 86],
  [123, 116],
  [121, 170],
  [120, 236],
  [120, 298],
]);
// お猪口の中の小さな波（2本）
const RIPPLE = [arc(120, 302, 22, 4.6, PI * 0.1, PI * 0.9, 8, 0.2, 9900), arc(120, 301, 11, 2.6, PI * 1.1, PI * 1.9, 6, 0.2, 9910)];

export default function SakeIllustration({ className = "" }: { className?: string }) {
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
      {/* 瓶（現れる → 傾く）。外の g で、まっすぐ立った形を TILT 度傾けて置き、
          中の g で「まっすぐ立った形（--tilt）→ 傾いた形」へ動かす（支点はどちらも瓶の左下の角） */}
      <g className="sake-bottle scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        <g transform={`rotate(${TILT} ${PIVOT[0]} ${PIVOT[1]})`}>
          <g className="scene-anim" style={anim("toast-tilt", 16, 28, { "--tilt": `${-TILT}deg`, "--o": "0% 100%" })}>
            <path d={BOTTLE_FILL} className="scene-paper" stroke="none" />
            {BOTTLE.map((d, i) => (
              <path key={i} d={d} className="scene-line" />
            ))}
            {BOTTLE_FINE.map((d, i) => (
              <path key={i} d={d} className="scene-fine" />
            ))}
            {/* 差し色（accent）はここだけ：瓶のラベル */}
            <path d={LABEL} className="scene-line scene-accent" />
            {LABEL_FINE.map((d, i) => (
              <path key={i} d={d} className="scene-fine" />
            ))}
          </g>
        </g>
      </g>

      {/* 注がれる線は、お猪口の後ろ（お猪口の中へ入っていくように見せる） */}
      <path d={POUR} pathLength={1} className="sake-pour scene-fine scene-stroke-draw scene-anim" style={anim("scene-draw", 30, 42)} />

      <g className="sake-choko scene-anim" style={anim("scene-fade-up", 4, 14, { "--dy": "10px" })}>
        <path d={CHOKO_FILL} className="scene-paper" stroke="none" />
        {CHOKO.map((d, i) => (
          <path key={i} d={d} className="scene-line" />
        ))}
        {CHOKO_FINE.map((d, i) => (
          <path key={i} d={d} className="scene-fine" />
        ))}
      </g>

      <g className="sake-ripple">
        {RIPPLE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 42 + i * 4, 50 + i * 4)}
          />
        ))}
      </g>
    </svg>
  );
}
