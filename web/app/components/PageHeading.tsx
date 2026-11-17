import type { ReactNode } from "react";
import SectionInner from "./SectionInner";

// ─── ページの見出しの帯（店舗情報・お品書きのページで共通） ───
// ・帯の色は section-warm、下に細い線。上の余白はスマホ 64px・md 以上 80px（固定ヘッダーの下で窮屈にならないように）、
//   下の余白はスマホ 48px・md 以上 64px
// ・見出し（h1）：スマホ 30px・md 以上 36px、太字。そのすぐ下に添え書き（1行。スマホ 14px・md 以上 16px、muted）
// ・children：添え書きの下に置くもの（お品書きの小さな注意書きなど）
// ・className：帯に足すクラス（今はどのページも使っていない）
export default function PageHeading({
  title,
  lead,
  children,
  className = "",
}: {
  title: string;
  lead: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${className} section-warm border-b border-border pt-16 pb-12 md:pt-20 md:pb-16 text-center`}>
      <SectionInner>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h1>
        <p className="text-sm md:text-base text-muted">{lead}</p>
        {children}
      </SectionInner>
    </section>
  );
}
