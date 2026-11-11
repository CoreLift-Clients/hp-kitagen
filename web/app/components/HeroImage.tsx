"use client";

import { useState } from "react";
import Image from "next/image";

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

/**
 * トップのヒーロー写真（スマホ用・パソコン用の2枚）。
 * 写真はスクロールしても動かさない（以前のパララックスはやめた）。
 */
export default function HeroImage({
  srcSp,
  srcPc,
  positionSp = "center 40%",
  positionPc = "center 40%",
}: Props) {
  const [spLoaded, setSpLoaded] = useState(false);
  const [pcLoaded, setPcLoaded] = useState(false);
  const [spError, setSpError] = useState(false);
  const [pcError, setPcError] = useState(false);

  return (
    <div
      className="absolute inset-0"
      aria-hidden="true"
    >
      {/* ── フォールバック背景 ─────────────────────────────
          写真が未配置 / 読み込みエラーのときに表示される温かいグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2c2215] via-[#1e1a0e] to-[#181408]" />

      {/* ── SP用（md未満）：縦長構図 ─────────────────────────
          preload は SP画像側のみ（priority）に付与する。
          next/image の preload には media 属性が付かず、priority を両方に
          付けると全ビューポートで縦横2枚が二重に preload されてしまう。
          当サイトはスマホ優先（大半がモバイル流入）のため、モバイルLCPを
          守る観点で SP画像を優先読み込み対象にする。 */}
      {!spError && (
        <Image
          src={srcSp}
          alt=""
          fill
          className={`object-cover md:hidden transition-opacity duration-700 ${
            spLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: positionSp }}
          priority
          sizes="100vw"
          onLoad={() => setSpLoaded(true)}
          onError={() => setSpError(true)}
        />
      )}

      {/* ── PC用（md以上）：横長構図 ─────────────────────────
          priority は付けず（二重 preload を避ける）、代わりに loading="eager"
          でファーストビュー描画時に遅延なく読み込む。preload リンクは出さない。 */}
      {!pcError && (
        <Image
          src={srcPc ?? srcSp}
          alt=""
          fill
          className={`object-cover hidden md:block transition-opacity duration-700 ${
            pcLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: positionPc }}
          loading="eager"
          sizes="100vw"
          onLoad={() => setPcLoaded(true)}
          onError={() => setPcError(true)}
        />
      )}
    </div>
  );
}
