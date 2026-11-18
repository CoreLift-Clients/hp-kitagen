"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { NAV_LINKS } from "@/app/lib/nav";
import { isNavActive } from "@/app/lib/navActive";
import { PHONE as TEL } from "@/app/lib/contact";

// ─── スマホ（md より狭い画面）のメニュー ───
// ・右から出る板（ドロワー）。上に店名と閉じるボタン、まん中に項目、下に電話のかたまり
// ・板全体を縦にスクロールできる（overflow-y-auto）。背の低い画面（スマホの横向きなど）で、
//   項目と電話のかたまりが板に収まらないときは、板ごとスクロールする（項目が隠れないように、電話のかたまりは縮めない）。
//   縦向きのスマホでは中身が板より短いので、今までどおり、項目は上・電話のかたまりは下に置かれる（nav の flex-1）
// ・iPhone の画面の端（safe-area）：板の下はホームのバーの分、右は横向きのときの丸い角・切り欠きの分だけあける
//   （env() は layout.tsx の viewportFit: "cover" で効く。ほかの端末では 0）
// ・開け閉め：開くボタン・閉じるボタン・後ろの幕・Esc キーで開け閉めする。
//   開いているあいだは、Tab での移動を板の中だけで回し、後ろのページはスクロールしない（body の overflow）。
//   閉じたら、開くボタンにフォーカスを戻す。閉じている板は inert にして、Tab で入れないようにする
// ・開くボタン・閉じるボタンの押せる範囲は 44×44px。見た目の枠（40px・36px）は中の span で今までの大きさのまま

// 板の中で Tab で回る要素
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // 一度でも開いたか（最初の表示で、開くボタンにフォーカスを当てないため）
  const wasOpen = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // 開いたら閉じるボタンへ、閉じたら開くボタンへフォーカスを移す
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeButtonRef.current?.focus();
    } else if (wasOpen.current) {
      openButtonRef.current?.focus();
    }
  }, [open]);

  // Esc で閉じる。Tab は板の中だけを回る
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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

      {/* ドロワーパネル（板全体をスクロールできる。右と下は safe-area の分だけあける） */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="メニュー"
        inert={!open}
        className={`fixed top-0 right-0 h-full z-[90] w-[calc(82vw+env(safe-area-inset-right))] max-w-[calc(320px+env(safe-area-inset-right))] pr-[env(safe-area-inset-right)] bg-background border-l border-border shadow-[-6px_0_32px_rgba(90,65,30,0.1)] flex flex-col overflow-y-auto overscroll-contain transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 h-[57px] border-b border-border shrink-0">
          <span className="font-serif text-sm font-bold text-accent tracking-wider">きたげん</span>
          {/* 押せる範囲 44×44。見た目の枠は中の 36×36（右へ 4px はみ出す分は -mr-1 で戻す） */}
          <button
            ref={closeButtonRef}
            onClick={() => setOpen(false)}
            className="group -mr-1 w-11 h-11 flex items-center justify-center"
            aria-label="閉じる"
          >
            <span className="w-9 h-9 flex items-center justify-center rounded-lg border border-border group-hover:border-accent transition-colors">
              <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </button>
        </div>

        {/* ナビゲーション（flex-1：中身が短いときは、電話のかたまりを板の下へ押す。縮めない） */}
        <nav className="flex-1 shrink-0 flex flex-col px-7 py-8">
          <ul className="divide-y divide-border">
            {NAV_LINKS.map(({ href, label }, i) => {
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
                      className={`font-serif text-lg transition-colors duration-200 ${
                        active
                          ? "text-accent font-bold"
                          : "text-foreground font-medium group-hover:text-accent"
                      }`}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* フッター — 電話予約ボタン（唯一の予約導線）。下は iPhone のホームのバーの分だけあける */}
        <div className="px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-border/50 space-y-3">
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
          <p className="text-center font-serif text-sm font-bold text-muted/90 tabular-nums">{TEL}</p>
          {/* 「ホームページを見た」と後ろを分けて、それぞれ折り返さない（「くださ／い。」のように語の途中で折れないように） */}
          <p className="text-center text-xs text-muted/90 leading-relaxed">
            <span className="whitespace-nowrap">「ホームページを見た」</span>
            <span className="whitespace-nowrap">とお伝えください。</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 押せる範囲 44×44。見た目の枠は中の 40×40（右へ 2px はみ出す分は -mr-0.5 で戻す） */}
      <button
        ref={openButtonRef}
        onClick={() => setOpen(!open)}
        className="group md:hidden -mr-0.5 flex items-center justify-center w-11 h-11"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-lg border border-border group-hover:border-accent transition-all duration-200">
          <span className="flex flex-col gap-[5px] w-5">
            <span className={`block w-full h-[1.5px] bg-foreground origin-center transition-all duration-300 ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block w-full h-[1.5px] bg-foreground transition-all duration-200 ${open ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-full h-[1.5px] bg-foreground origin-center transition-all duration-300 ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </span>
        </span>
      </button>

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
