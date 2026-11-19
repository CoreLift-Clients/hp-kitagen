// ─── 店主の判子（店主紹介のページの、縦長の画面の署名の右。app/owner/page.tsx） ───
// 四角い判子（角は少し丸く）。中の字は「北口」を縦に（明朝 700、紙の色で白抜き）。
// ・色は朱（落ち着いた、くすんだ朱 #AE4630。letter.css の --stamp-shu）。サイトで食材のほかに色を付ける、ただ1つの例外
//   （scenes.css の先頭の決まりに書いてある）
// ・押した判子らしく、水彩のムラ・かすれを少しだけ（下のフィルタ。乱数なし。seed を決めておく）：
//   ふちをわずかに揺らし（feDisplacementMap）、細かいノイズで、ところどころ朱がうすく抜ける
// ・大きさ・傾き・押される動きは letter.css（.note-stamp）
// ・飾りなので読み上げない（署名の「店主　北口 隆」で伝わる）
export default function OwnerStamp() {
  return (
    <span className="note-stamp scene-anim" aria-hidden="true">
      <svg viewBox="0 0 48 48" width="100%" height="100%" focusable="false">
        <defs>
          <filter id="owner-stamp-ink" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
            {/* ふちの揺れ（ゆるいノイズで、最大 ±0.9 ずらす） */}
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="11" result="wave" />
            <feDisplacementMap in="SourceGraphic" in2="wave" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="shape" />
            {/* かすれ（細かいノイズの濃い所だけ、朱をうすくする。不透明度 ＝ 4.5 − 5 × ノイズ。ノイズが 0.7 より小さい多くの所は 1 のまま） */}
            <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves="2" seed="5" result="grain" />
            <feColorMatrix
              in="grain"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -5 0 0 0 4.5"
              result="ink"
            />
            <feComposite in="shape" in2="ink" operator="in" />
          </filter>
        </defs>
        <g filter="url(#owner-stamp-ink)">
          <rect className="note-stamp-ink" x="3" y="3" width="42" height="42" rx="5" />
          {/* 「北口」を縦に（紙の色で白抜き） */}
          <text className="note-stamp-char" x="24" y="22.5" textAnchor="middle">
            北
          </text>
          <text className="note-stamp-char" x="24" y="40.5" textAnchor="middle">
            口
          </text>
        </g>
      </svg>
    </span>
  );
}
