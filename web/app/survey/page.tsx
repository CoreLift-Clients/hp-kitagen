import { ClipboardList, MessageSquare, Sparkles, ExternalLink, CheckCircle } from "lucide-react";
import { pageMetadata } from "../lib/seo";

export const metadata = pageMetadata({
  title: "アンケート｜きたげん",
  description: "きたげんへのご来店ありがとうございます。ご感想・ご意見をお聞かせください。",
  path: "/survey",
});

const SURVEY_URL = "https://www.corelift-platform.com/s/PyqS2z2U";

export default function SurveyPage() {
  return (
    <div className="min-h-screen pt-16">

      {/* ── ページヘッダー ───────────────────────────────── */}
      <section className="section-warm py-16 px-4 text-center">
        <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">SURVEY</p>
        <h1 className="text-3xl font-bold">アンケート</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-8 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/70" />
          <div className="w-8 h-px bg-accent/50" />
        </div>
        <p className="text-sm text-muted mt-4">ご来店のご感想をお聞かせください</p>
      </section>

      {/* ── メインコンテンツ ──────────────────────────────── */}
      <section className="py-14 px-4 section-light">
        <div className="max-w-lg mx-auto space-y-6">

          {/* ── ごあいさつカード ──────────────────────────── */}
          <div className="rounded-xl border border-border bg-background p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-card-bg border border-border/60 flex items-center justify-center shrink-0">
                <ClipboardList size={17} strokeWidth={1.5} className="text-accent" />
              </div>
              <h2 className="font-bold text-base">ご来店ありがとうございます</h2>
            </div>
            <p className="text-sm text-muted leading-[1.9]">
              きたげんへのご来店、誠にありがとうございます。<br />
              お食事やサービスについて、ぜひご感想をお聞かせください。<br />
              いただいたご意見は、より良いお店づくりに活かしてまいります。
            </p>
          </div>

          {/* ── AI機能について（安心説明）カード ──────────── */}
          <div className="rounded-xl border border-border bg-background overflow-hidden">
            {/* ヘッダー行 */}
            <div className="flex items-center gap-3 px-7 pt-7 pb-5">
              <div className="w-9 h-9 rounded-lg bg-card-bg border border-border/60 flex items-center justify-center shrink-0">
                <Sparkles size={16} strokeWidth={1.5} className="text-accent" />
              </div>
              <h2 className="font-bold text-base">AI口コミサポートについて</h2>
            </div>

            {/* 区切り */}
            <div className="mx-7 border-t border-border/50" />

            {/* 説明本文 */}
            <div className="px-7 pt-5 pb-6">
              <p className="text-sm text-muted leading-[1.9] mb-5">
                このアンケートには、お客様の口コミ投稿をサポートする
                <strong className="text-foreground font-semibold">AI機能</strong>が搭載されています。
              </p>

              {/* ポイントリスト */}
              <ul className="space-y-3">
                {[
                  {
                    icon: CheckCircle,
                    text: "AIは口コミ文章の「下書き」を作るだけです。",
                  },
                  {
                    icon: CheckCircle,
                    text: "実際に投稿するかどうかは、お客様ご自身が決めます。",
                  },
                  {
                    icon: CheckCircle,
                    text: "AIが勝手にどこかへ投稿することはありません。",
                  },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5">
                    <Icon
                      size={15}
                      strokeWidth={2}
                      className="text-accent mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-foreground leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>

              {/* 補足 */}
              <p className="text-xs text-muted leading-relaxed mt-5 pt-5 border-t border-border/40">
                AIが生成した文章はご自身でご確認・編集いただいてから、
                任意のタイミングで口コミサイトへ投稿いただけます。
                もちろん、口コミ投稿なしにご感想だけお伝えいただいてもかまいません。
              </p>
            </div>
          </div>

          {/* ── 利用方法カード ────────────────────────────── */}
          <div className="rounded-xl border border-border bg-background p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-card-bg border border-border/60 flex items-center justify-center shrink-0">
                <MessageSquare size={16} strokeWidth={1.5} className="text-accent" />
              </div>
              <h2 className="font-bold text-base">アンケートの流れ</h2>
            </div>
            <ol className="space-y-3">
              {[
                "下のボタンからアンケートページへ進みます",
                "いくつかの質問にお答えください（約2〜3分）",
                "ご希望の方はAIサポートで口コミ文の下書きを作れます",
                "投稿するかどうかはご自由に決めていただけます",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-card-bg border border-border text-[10px] font-bold text-accent flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── CTAボタン ─────────────────────────────────── */}
          <div className="pt-4 pb-8 text-center">
            <a
              href={SURVEY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-10 py-4 bg-accent hover:bg-accent-dark text-[#f5eed8] font-semibold text-sm rounded-xl transition-colors duration-200 shadow-sm"
            >
              <ClipboardList size={16} strokeWidth={2} />
              アンケートに進む
              <ExternalLink size={13} strokeWidth={2} className="opacity-75" />
            </a>
            <p className="text-xs text-muted mt-4">
              別のタブで開きます。いつでも閉じてお戻りいただけます。
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
