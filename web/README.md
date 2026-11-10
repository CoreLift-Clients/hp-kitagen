# きたげん 公式サイト（web）

居酒屋「IZAKAYA きたげん」（大阪・桃谷）の公式サイトです。
https://www.kitagen-izakaya.com

- Next.js（App Router）/ TypeScript / Tailwind CSS。Vercel で公開
- 外部の API・DB には頼らず、単独で動く
- 管理画面は持たない

## 開発

```bash
npm install
npm run dev        # http://localhost:3002
npm run build      # 本番ビルド
npx tsc --noEmit   # 型の確認
```

## データの置き場所

| 内容 | 場所 |
|---|---|
| メニュー | `app/content/menus.ts` |
| お知らせ | `app/content/news.ts` |
| データの読み込み口 | `app/content/index.ts` |
| 写真 | `public/images/` |
| 営業時間・定休日 | `app/lib/businessHours.ts` |
| 電話番号・Instagram | `app/lib/contact.ts` |
| SEO（title・OGP など） | `app/lib/seo.ts`・`app/layout.tsx` |

## 更新のしかた

- メニューの変更は CoreLiftSystem がコードを直して反映する
- お知らせ・写真は Instagram につなぐ予定（第2段）。そのときは `app/content/index.ts` の中身を差し替える
