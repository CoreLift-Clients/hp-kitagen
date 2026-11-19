import { MetadataRoute } from 'next'

// lastModified（<lastmod>）は書かない。以前はビルドの日時（new Date()）で、ページが変わっていなくても
// 出すたびに全部のページの日付が変わり、Google に当てにされなくなるため。
// 書くなら、ページの中身を変えた日をページごとに決まった日付で書き、変えるたびに直すこと

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.kitagen-izakaya.com',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://www.kitagen-izakaya.com/owner',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // /menu は /menu/dinner へ転送するだけのページなので載せない。
    {
      url: 'https://www.kitagen-izakaya.com/menu/dinner',
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // /menu/lunch はランチ臨時休業（lib/businessHours.ts の LUNCH_SUSPENDED）中のため、
    // クロール誘導を避ける目的で意図的に除外している。ランチ再開時に再追加を検討する。
    // /takeout はページをやめ、/menu/dinner#takeout へ転送するだけなので載せない。
    {
      url: 'https://www.kitagen-izakaya.com/info',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // お知らせのページはやめ、/info#news へ転送するだけなので載せない（next.config.ts）。
  ]
}
