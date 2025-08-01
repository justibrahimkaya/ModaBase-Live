import { MetadataRoute } from 'next'

// Force cache refresh - updated v2
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '/temp/',
          '*.json',
        ],
      },
    ],
    sitemap: 'https://modabase.com.tr/sitemap.xml',
    host: 'https://modabase.com.tr',
  }
}