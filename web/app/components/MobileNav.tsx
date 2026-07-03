"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { NAV_LINKS } from "@/app/lib/nav";
import { isNavActive } from "@/app/lib/navActive";
import { PHONE as TEL } from "@/app/lib/contact";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const overlay = (
    <div className="md:hidden">
      {/* バックドロップ */}
      <div
        className={`fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ドロワーパネル */}
      <div
        className={`fixed top-0 right-0 h-full z-[90] w-[82vw] max-w-[320px] bg-background border-l border-border shadow-[-6px_0_32px_rgba(90,65,30,0.1)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 h-[57px] border-b border-border shrink-0">
          <span className="text-sm font-bold text-accent tracking-wider">きたげん</span>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-accent transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 overflow-y-auto flex flex-col px-7 py-8">
          <p className="text-[9px] tracking-[0.5em] text-accent/60 mb-7 font-medium">
            NAVIGATION
          </p>
          <ul className="divide-y divide-border">
            {NAV_LINKS.map(({ href, label, en }, i) => {
              const active = isNavActive(pathname, href);
              return (
                <li
                  key={href}
                  style={{ transitionDelay: open ? `${i * 40 + 60}ms` : "0ms" }}
                  className={`transition-all duration-300 ${open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
                >
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center justify-between py-4 group"
                  >
                    <span
                      className={`text-lg transition-colors duration-200 ${
                        active
                          ? "text-accent font-semibold"
                          : "text-foreground font-medium group-hover:text-accent"
                      }`}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-[10px] tracking-[0.3em] transition-colors duration-200 uppercase ${
                        active ? "text-accent/70" : "text-muted/50 group-hover:text-accent/60"
                      }`}
                    >
                      {en}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* フッター — 電話予約ボタン（唯一の予約導線） */}
        <div className="px-6 py-6 border-t border-border/50 space-y-3 shrink-0">
          <a
            href={`tel:${TEL}`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2.5 w-full py-4
                       bg-accent hover:bg-accent-dark text-white
                       rounded-sm font-bold text-base tracking-wider
                       transition-colors duration-200 active:scale-[0.98]"
          >
            <Phone size={18} strokeWidth={2} />
            電話で予約する
          </a>
          <p className="text-center text-xs text-muted/60 tabular-nums">{TEL}</p>
          <p className="text-center text-[11px] text-muted/50 leading-relaxed">
            「ホームページを見た」とお伝えいただくと<br />ご案内がスムーズです。
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:border-accent transition-all duration-200"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
      >
        <div className="flex flex-col gap-[5px] w-5">
          <span className={`block w-full h-[1.5px] bg-foreground origin-center transition-all duration-300 ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`block w-full h-[1.5px] bg-foreground transition-all duration-200 ${open ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-full h-[1.5px] bg-foreground origin-center transition-all duration-300 ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </div>
      </button>

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
