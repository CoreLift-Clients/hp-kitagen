import type { Metadata } from "next";
import { ShoppingBag, Phone } from "lucide-react";
import { getMenusForTakeout } from "../lib/menus";
import { listDocuments } from "../lib/adminDocuments";
import ImageGallery from "../components/ImageGallery";
import { PHONE } from "../lib/contact";

export const metadata: Metadata = {
  title: "テイクアウト｜きたげん",
  description: "きたげんの人気メニューをご自宅でもお楽しみいただけます。お電話でのご注文も可能です。",
};

export default async function TakeoutPage() {
  const [items, takeoutDocs] = await Promise.all([
    getMenusForTakeout(),
    listDocuments("takeout"),
  ]);
  const galleryImages = takeoutDocs
    .filter((d) => d.isActive && d.resourceType === "image")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d) => ({ url: d.fileUrl, alt: d.title }));

  return (
    <div className="min-h-screen pt-16">

      {/* ── ページヘッダー ───────────────────────────────── */}
      <section className="section-warm py-16 px-4 text-center">
        <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">
          TAKEOUT
        </p>
        <h1 className="text-3xl font-bold">テイクアウト</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-8 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/70" />
          <div className="w-8 h-px bg-accent/50" />
        </div>
        <p className="text-sm text-muted mt-4 leading-relaxed">
          きたげんの人気メニューをご自宅でも。
        </p>
      </section>

      {/* ── 説明 ─────────────────────────────────────────── */}
      <section className="py-14 px-4 section-light">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted leading-loose">
            きたげんの人気メニューをご自宅でもお楽しみいただけます。<br />
            お電話でのご注文も可能です。お気軽にご連絡ください。
          </p>
        </div>
      </section>

      {/* ── テイクアウトメニュー ──────────────────────────── */}
      <section className="py-14 px-4 section-warm">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-background border border-border/60 flex items-center justify-center shrink-0">
              <ShoppingBag size={17} strokeWidth={1.5} className="text-accent" />
            </div>
            <h2 className="font-bold text-lg">テイクアウトメニュー</h2>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-background p-5 flex items-start gap-4"
              >
                {/* アイコンドット */}
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <h3 className="font-bold text-base">{item.name}</h3>
                    {item.price && (
                      <span className="text-sm font-medium text-accent shrink-0 tabular-nums">
                        {item.price}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted text-center mt-6 leading-relaxed">
            ※ 表示価格は目安です。内容・サイズにより前後する場合がございます。<br />
            この他にもテイクアウトメニューがございます。詳細は下のメニューをご確認ください。
          </p>
        </div>
      </section>

      {/* ── メニュー画像ギャラリー ────────────────────────── */}
      {galleryImages.length > 0 && (
        <section className="py-16 px-4 section-warm border-t border-border">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.4em] text-accent/80 mb-3">MENU</p>
              <h2 className="text-xl font-bold text-foreground">テイクアウトメニューを見る</h2>
            </div>
            <ImageGallery images={galleryImages} />
          </div>
        </section>
      )}

            {/* ── ご注文方法 ───────────────────────────────────── */}
      <section className="py-14 px-4 section-light">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-card-bg border border-border/60 flex items-center justify-center shrink-0">
              <Phone size={17} strokeWidth={1.5} className="text-accent" />
            </div>
            <h2 className="font-bold text-lg">ご注文方法</h2>
          </div>

          <div className="rounded-xl border border-border bg-background p-6 text-center">
            <p className="text-sm text-muted mb-4">お電話でご注文ください</p>
            <a
              href={"tel:" + PHONE}
              className="block text-3xl font-bold tracking-wider text-foreground hover:text-accent transition-colors duration-200 tabular-nums"
            >
              {PHONE}
            </a>
            <p className="text-xs text-muted mt-3">タップで発信できます</p>
            <div className="border-t border-border/40 mt-5 pt-5 text-xs text-muted leading-relaxed">
              テイクアウトのご注文受付は、通常の営業時間内となります。<br />
              お時間に余裕を持ってご連絡いただけますと幸いです。
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}