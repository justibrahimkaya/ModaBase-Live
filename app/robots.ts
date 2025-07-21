import { MetadataRoute } from 'next'

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
          '*.xml',
        ],
      },
    ],
    sitemap: 'https://www.modabase.com.tr/sitemap.xml',
    host: 'https://www.modabase.com.tr',
  }
} 