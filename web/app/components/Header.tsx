"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";
import { NAV_LINKS } from "@/app/lib/nav";
import { isNavActive } from "@/app/lib/navActive";
import { PHONE as TEL } from "@/app/lib/contact";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[var(--header-h)] transition-all duration-300 ${
        scrolled
          ? "bg-[#FBF8F2]/97 backdrop-blur-md border-b border-border shadow-[0_2px_24px_rgba(47,36,28,0.07)]"
          : "bg-[#FBF8F2]/90 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      {/* 高さは globals.css の --header-h（lg より狭い画面 64px・lg 以上 76px）。
          中身の最大幅は lg より狭い画面 1024px（max-w-5xl）、lg 以上 1200px（xl 以上で、ロゴと電話番号が左右に広がる）。
          lg 以上は字も大きくする（ロゴ 26px・IZAKAYA 10px・桃谷の居酒屋 12px・項目名 16px・電話番号 20px）。
          電話番号の上下の小さな説明は、md 以上どこでも 11px（以前は lg より狭い画面で 9px。読みにくかったので上げた）。
          lg より狭い画面は今までのまま。
          ・高さ：header に --header-h を付け、下の線（border-b）はその内側に入れる（box-sizing: border-box）。
            中身（nav）は h-full（線の 1px を除いた高さ）。以前は nav が --header-h で、線の分だけ header が 1px 高かった
          ・左右の余白：iPhone の横向きでは、丸い角・切り欠き（safe-area）の分より狭くしない（ほかの端末では env() は 0 で今までの 20px） */}
      <nav className="max-w-5xl lg:max-w-[1200px] mx-auto pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] h-full flex items-center justify-between">

        {/* ── ロゴ ─────────────────────────────────────────── */}
        <Link href="/" className="group flex items-center gap-3.5 shrink-0" aria-label="きたげん トップへ">
          <div className="flex flex-col leading-none gap-1">
            <span className="text-[8px] lg:text-[10px] tracking-[0.55em] text-accent/70 font-medium">
              IZAKAYA
            </span>
            <span className="font-serif text-xl lg:text-[26px] font-bold tracking-[0.08em] text-foreground group-hover:text-accent transition-colors duration-200">
              きたげん
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 lg:gap-4 ml-0.5">
            <div className="w-px h-7 lg:h-9 bg-border" />
            <span className="text-[10px] lg:text-[12px] text-muted/90 tracking-wide leading-[1.7]">
              桃谷の<br />居酒屋
            </span>
          </div>
        </Link>

        {/* ── デスクトップ: ナビ ＋ 電話番号 ────────────────── */}
        <div className="hidden md:flex items-center">

          {/* ナビリンク（lib/nav.ts の項目：はじめに・お品書き・ご案内・ごあいさつ）。
              項目の左右の余白は lg より狭い画面 10px（項目の字と字のあいだ 20px）、lg 以上 20px（あいだ 40px）。
              lg より狭い画面は、「はじめに」を足して4項目にしたとき、768px でロゴと項目のあいだが 6px と窮屈になったので、
              14px（あいだ 28px）から詰めた（768px でロゴと項目のあいだ 38px） */}
          <ul className="flex items-center">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isNavActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative px-2.5 lg:px-5 py-1.5 font-serif font-medium text-sm lg:text-base transition-colors duration-200 group whitespace-nowrap ${
                      active ? "text-accent" : "text-muted hover:text-accent"
                    }`}
                  >
                    {label}
                    <span
                      className={`absolute bottom-0 left-2.5 right-2.5 lg:left-5 lg:right-5 h-px bg-accent transition-transform duration-200 origin-left ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* 電話予約 — 縦区切り線 ＋ 番号 */}
          <div className="ml-4 pl-4 lg:ml-6 lg:pl-6 xl:ml-8 xl:pl-8 border-l border-border/60 flex flex-col justify-center">
            <p className="text-[11px] text-muted/90 tracking-wider leading-none mb-1.5">
              ご予約は、お電話で。
            </p>
            <a
              href={`tel:${TEL}`}
              className="font-serif text-[17px] lg:text-[20px] font-bold tracking-wide text-foreground hover:text-accent transition-colors duration-200 tabular-nums leading-none whitespace-nowrap"
            >
              {TEL}
            </a>
            <p className="text-[11px] text-muted/90 mt-1.5 leading-none whitespace-nowrap">
              「ホームページを見た」とお伝えください
            </p>
          </div>
        </div>

        {/* ── モバイル: ハンバーガー ───────────────────────── */}
        <MobileNav />

      </nav>
    </header>
  );
}
