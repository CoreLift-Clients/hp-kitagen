import type { ReactNode } from "react";

// セクションのコンテンツ幅・左右余白を一元管理するラッパー。
// 基準幅は max-w-6xl（≈1152px）／左右余白は px-6 md:px-8 に統一する。
// News など意図的に幅を絞りたい場合のみ maxW で上書きする（Tailwind の
// max-w 競合を避けるため className 追記ではなく maxW プロップで差し替える）。
export default function SectionInner({
  maxW = "max-w-6xl",
  className = "",
  children,
}: {
  maxW?: string;
  className?: string;
  children: ReactNode;
}) {
  return <div className={`mx-auto ${maxW} px-6 md:px-8 ${className}`}>{children}</div>;
}
