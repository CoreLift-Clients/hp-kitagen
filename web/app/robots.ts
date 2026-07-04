import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 管理画面はクロール対象から除外する。
      disallow: ['/portal', '/portal/'],
    },
    sitemap: 'https://www.kitagen-izakaya.com/sitemap.xml',
  }
}
