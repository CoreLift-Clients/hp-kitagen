import type { CSSProperties } from "react";
import { getImageProps } from "next/image";

interface Props {
  /** SP用画像パス（縦長構図） */
  srcSp: string;
  /** PC用画像パス（横長構図）。省略時は srcSp を使用 */
  srcPc?: string;
  /** SP用 object-position（デフォルト: "center 40%"） */
  positionSp?: string;
  /** PC用 object-position（デフォルト: "center 40%"） */
  positionPc?: string;
}

/** 写真の説明（店先の写真。看板に店名が写っている） */
const ALT = "桃谷の居酒屋 IZAKAYA きたげんの店先";

/**
 * トップのヒーロー写真（スマホ用・パソコン用の2枚を、1つの <picture> で出し分ける）。
 * 写真はスクロールしても動かさない（以前のパララックスはやめた）。
 * スクロールに合わせて、この入れ物（.hero-photo-blur）だけを少しずつぼかす（globals.css）。
 *
 * ・<picture> の <source media="(min-width: 768px)">（Tailwind の md と同じ境目）にパソコン用、<img> にスマホ用。
 *   ブラウザは画面の幅に合う1枚だけを読みこむ（以前は <Image> を2つ置いて CSS で隠していたので、
 *   スマホでもパソコン用の写真まで読みこんでいた）
 * ・写真は最初から見えている（以前は opacity-0 から、JS の onLoad で 0.7 秒かけて見せていた。
 *   JS が動くまで写真が出ず、LCP〈いちばん大きな絵が出るまでの時間〉が遅れていた）。フェードはやめた
 * ・写真の切り取り（object-position）は、スマホ用・パソコン用で違う値を CSS の変数で渡し、md で切り替える
 * ・fetchPriority="high"・loading="eager"：ファーストビューの写真なので、真っ先に読みこむ
 * ・写真がまだ無い・読みこめないときは、後ろの温かいグラデーションが見える（alt の字は、next/image が付ける
 *   color: transparent で見えない）
 * ・サーバーで作る部品（"use client" なし）。onLoad・onError の JS は持たない
 */
export default function HeroImage({
  srcSp,
  srcPc,
  positionSp = "center 40%",
  positionPc = "center 40%",
}: Props) {
  const common = { alt: ALT, fill: true, sizes: "100vw", fetchPriority: "high" as const, loading: "eager" as const };
  const {
    props: { srcSet: pcSrcSet },
  } = getImageProps({ ...common, src: srcPc ?? srcSp });
  const { props: spProps } = getImageProps({ ...common, src: srcSp });

  return (
    <div className="hero-photo-blur absolute inset-0">
      {/* ── フォールバック背景 ─────────────────────────────
          写真が未配置 / 読み込みエラーのときに表示される温かいグラデーション */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#2c2215] via-[#1e1a0e] to-[#181408]" />

      <picture>
        <source media="(min-width: 768px)" srcSet={pcSrcSet} sizes="100vw" />
        {/* alt・srcSet・sizes などは spProps に入っている（next/image の getImageProps。<picture> で出し分けるための書き方） */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...spProps}
          className="object-cover object-[var(--hero-pos-sp)] md:object-[var(--hero-pos-pc)]"
          style={
            {
              ...spProps.style,
              "--hero-pos-sp": positionSp,
              "--hero-pos-pc": positionPc,
            } as CSSProperties
          }
        />
      </picture>
    </div>
  );
}
