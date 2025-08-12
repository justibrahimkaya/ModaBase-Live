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
    sitemap: 'https://www.modabase.com.tr/sitemap.xml',
  }
}