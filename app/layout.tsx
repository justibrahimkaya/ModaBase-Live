import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import AuthSessionProvider from '@/components/SessionProvider'
import MobileBottomNav from '@/components/MobileBottomNav'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://modabase.com'),
  title: {
    default: 'ModaBase - Modern E-Ticaret Platformu | En Yeni Moda Trendleri',
    template: '%s | ModaBase'
  },
  description: 'ModaBase ile en yeni moda trendlerini keşfedin. Kaliteli markalar, özel indirimler ve güvenli alışveriş deneyimi. 500+ marka, 50K+ mutlu müşteri. Ücretsiz kargo ve 30 gün iade garantisi.',
  keywords: [
    'moda', 'e-ticaret', 'alışveriş', 'giyim', 'aksesuar', 'kadın giyim', 'erkek giyim', 
    'çocuk giyim', 'ayakkabı', 'çanta', 'mücevher', 'kozmetik', 'trend', 'marka',
    'indirim', 'kampanya', 'online alışveriş', 'güvenli ödeme', 'hızlı teslimat',
    'ModaBase', 'kaliteli moda', 'uygun fiyat', 'fashion', 'style', 'designer'
  ],
  authors: [{ name: 'ModaBase Team' }],
  creator: 'ModaBase',
  publisher: 'ModaBase',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://modabase.com',
    title: 'ModaBase - Premium E-Ticaret Platformu',
    description: 'En yeni moda trendleri, premium markalar ve güvenli alışveriş deneyimi. 500+ marka, ücretsiz kargo ve 30 gün iade garantisi.',
    siteName: 'ModaBase',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ModaBase - Premium Moda E-Ticaret',
      },
      {
        url: '/og-image-square.jpg',
        width: 1200,
        height: 1200,
        alt: 'ModaBase Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModaBase - Premium E-Ticaret Platformu',
    description: 'En yeni moda trendleri, premium markalar ve güvenli alışveriş deneyimi.',
    creator: '@modabase',
    images: ['/twitter-image.jpg'],
  },
  verification: {
    google: 'tUYCoHd7hb1xR8MTLzvYAOZXgPtlO5TAIV-jkM3x6-E',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://modabase.com',
    languages: {
      'tr-TR': 'https://modabase.com',
      'en-US': 'https://en.modabase.com',
    },
  },
  category: 'E-Commerce',
  classification: 'Fashion & Lifestyle',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'ModaBase',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#6366f1',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#6366f1',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KGWT7HKF');`
        }} />
        
        {/* MOBILE OPTIMIZATION - Critical viewport and mobile meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, viewport-fit=cover, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* Favicon and app icons - ✨ MODABASE LOGO SİSTEMİ */}
        <link rel="icon" type="image/png" href="/ChatGPT Image 20 Haz 2025 14_16_10.png" />
        <link rel="shortcut icon" href="/ChatGPT Image 20 Haz 2025 14_16_10.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/ChatGPT Image 20 Haz 2025 14_16_10.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/ChatGPT Image 20 Haz 2025 14_16_10.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/ChatGPT Image 20 Haz 2025 14_16_10.png" />
        <link rel="mask-icon" href="/ChatGPT Image 20 Haz 2025 14_16_10.png" color="#000000" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ModaBase",
              "url": "https://modabase.com",
              "logo": "https://modabase.com/ChatGPT Image 20 Haz 2025 14_16_10.png",
              "description": "Premium moda e-ticaret platformu",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+90-212-XXX-XXXX",
                "contactType": "customer service",
                "areaServed": "TR",
                "availableLanguage": "Turkish"
              },
              "sameAs": [
                "https://www.facebook.com/modabase",
                "https://www.instagram.com/modabase",
                "https://www.twitter.com/modabase",
                "https://www.linkedin.com/company/modabase"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "50000"
              }
            })
          }}
        />
        
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ModaBase",
              "url": "https://modabase.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://modabase.com/products?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* E-commerce Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "ModaBase",
              "image": "https://modabase.com/store-image.jpg",
              "description": "Premium moda ürünleri ve aksesuarları",
              "url": "https://modabase.com",
              "telephone": "+90-212-XXX-XXXX",
              "priceRange": "₺₺₺",
              "paymentAccepted": ["Kredi Kartı", "Banka Kartı", "Havale", "Kapıda Ödeme"],
              "currenciesAccepted": "TRY",
              "openingHours": "Mo-Su 00:00-23:59",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "ModaBase Ürün Kataloğu",
                "itemListElement": [
                  {
                    "@type": "OfferCatalog",
                    "name": "Kadın Giyim",
                    "itemListElement": [
                      { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Elbiseler" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Bluzlar" } }
                    ]
                  }
                ]
              }
            })
          }}
        />
        
        {/* Performance and Security Headers */}
        <meta name="referrer" content="origin-when-cross-origin" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        
        {/* PWA Tags */}
        <meta name="application-name" content="ModaBase" />
        <meta name="apple-mobile-web-app-title" content="ModaBase" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Content Security Policy */}
        <meta httpEquiv="Content-Security-Policy" content="
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          img-src 'self' data: https: blob:;
          font-src 'self' https://fonts.gstatic.com;
          connect-src 'self' https://www.google-analytics.com;
        " />
        
        {/* Google Analytics (GA4) - Required in HEAD for Search Console verification */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-VL9KCLBV3R"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VL9KCLBV3R');
            `,
          }}
        />
        
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-KGWT7HKF"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50">
          Ana içeriğe geç
        </a>
        
        <AuthSessionProvider>
          <CartProvider>
            <div id="main-content" className="mobile-bottom-nav-space">
              {children}
            </div>
            <MobileBottomNav />
          </CartProvider>
        </AuthSessionProvider>

        {/* Schema for breadcrumbs - will be populated by individual pages */}
        <script id="breadcrumb-schema" type="application/ld+json"></script>
      </body>
    </html>
  )
}
