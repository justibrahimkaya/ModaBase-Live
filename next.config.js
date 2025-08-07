/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Next.js 15 body size limits
  experimental: {
    optimizePackageImports: ['@headlessui/react', 'lucide-react', 'framer-motion'],
    // Body size limit for API routes
    serverComponentsExternalPackages: ['@prisma/client'],
    // Increase body size limit
    bodySizeLimit: '100mb',
  },
  
  // Image optimization settings - Enhanced performance
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600, // 1 hour cache
    deviceSizes: [640, 750, 828, 1080, 1200], // Mobile first sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Smaller image sizes
    // Base64 resimler için - güvenlik artırıldı
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https://www.paytr.com https://*.paytr.com",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com https://js.stripe.com https://www.paytr.com https://*.paytr.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://www.paytr.com https://*.paytr.com",
              "img-src 'self' data: https: blob: https://images.unsplash.com https://via.placeholder.com https://res.cloudinary.com https://www.paytr.com https://*.paytr.com",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://www.paytr.com https://*.paytr.com",
              "connect-src 'self' https://www.google-analytics.com https://api.stripe.com https://www.paytr.com https://*.paytr.com wss://localhost:*",
              "frame-src 'self' https://www.paytr.com https://*.paytr.com",
              "frame-ancestors 'self' https://www.paytr.com",
              "base-uri 'self'",
              "form-action 'self' https://www.paytr.com",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self), payment=(self)'
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          }
        ],
      },
    ]
  },
  
  // Webpack configuration for security and optimization
  webpack: (config, { isServer, dev }) => {
    // Security: Remove console.log in production
    if (!dev) {
      config.optimization.minimizer.forEach(minimizer => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true
          minimizer.options.terserOptions.compress.drop_debugger = true
        }
      })
    }
    
    // Performance: Bundle analyzer (optional)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    
    return config
  },
  
  // Disable X-Powered-By header
  poweredByHeader: false,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@headlessui/react', 'lucide-react', 'framer-motion'],
  },
  

  
  // Server external packages (Next.js 15 format)
  serverExternalPackages: ['@prisma/client'],
  
  // Redirects for legacy blog URLs
  async redirects() {
    return [
      // Blog URL redirects - Google'ın aradığı eski slug'ları yeni slug'lara yönlendir
      {
        source: '/blog/2024-kis-moda-trendleri-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/2024-kis-moda-trendleri-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      {
        source: '/blog/aksesuar-seciminde-dikkat-kurali-2024-en-populer-trendleri',
        destination: '/blog/aksesuar-seciminde-altin-kurallar-2024-un-en-populer-trendleri',
        permanent: true,
      },
      {
        source: '/blog/aksesuar-seciminde-dikkat-kuralı-2024-en-populer-trendleri',
        destination: '/blog/aksesuar-seciminde-altin-kurallar-2024-un-en-populer-trendleri',
        permanent: true,
      },
      {
        source: '/blog/aksesuar-seciminde-dikkat-kurallari-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/aksesuar-seciminde-altin-kurallar-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      {
        source: '/blog/cocuk-giyimde-konfor-ve-guvenlik-2024-en-populer-trendleri',
        destination: '/blog/cocuk-giyiminde-konfor-ve-guvenlik-2024-un-en-populer-trendleri',
        permanent: true,
      },
      {
        source: '/blog/erkek-giyimde-profesyonel-gorunum-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/erkek-giyimde-profesyonel-gorunum-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      {
        source: '/blog/evsekli-bakım-rehber-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/ev-tekstili-bakim-rehberi-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      {
        source: '/blog/kadin-giyimde-kombinleme-sanati-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/kadin-giyimde-kombinleme-sanati-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      {
        source: '/blog/luaks-girlerin-ozellikler-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/surdurulebilir-tekstil-uretimi-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      {
        source: '/blog/organik-kumaslar-avantajlari-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/organik-kumaslarin-faydalari-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      {
        source: '/blog/spor-giyiminde-teknoloji-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/spor-giyiminde-teknoloji-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      {
        source: '/blog/surdurulebilir-tekstil-uretimi-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/surdurulebilir-tekstil-uretimi-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      {
        source: '/blog/durdurulabilir-tekstil-uretimi-rehber-2024-trendi-ve-yenilikleri',
        destination: '/blog/surdurulebilir-tekstil-uretimi-rehberi-2024-trendleri-ve-oneriler',
        permanent: true,
      },
      
      // Category URL redirects - Google'ın aradığı kısa slug'ları uzun slug'lara yönlendir
      {
        source: '/products\\?category=çanta',
        destination: '/products?category=aksesuar-canta',
        permanent: true,
      },
      {
        source: '/products\\?category=canta',
        destination: '/products?category=aksesuar-canta',
        permanent: true,
      },
      {
        source: '/products\\?category=takı',
        destination: '/products?category=aksesuar-taki',
        permanent: true,
      },
      {
        source: '/products\\?category=taki',
        destination: '/products?category=aksesuar-taki',
        permanent: true,
      },
      {
        source: '/products\\?category=bluzler',
        destination: '/products?category=kadin-bluzler',
        permanent: true,
      },
      {
        source: '/products\\?category=pantolon',
        destination: '/products?category=erkek-pantolon',
        permanent: true,
      },
      {
        source: '/products\\?category=tshirt',
        destination: '/products?category=erkek-tshirt',
        permanent: true,
      },
      {
        source: '/products\\?category=elbiseler',
        destination: '/products?category=kadin-elbiseler',
        permanent: true,
      },
      {
        source: '/products\\?category=etekler',
        destination: '/products?category=kadin-etekler',
        permanent: true,
      },
      {
        source: '/products\\?category=pantolonlar',
        destination: '/products?category=kadin-pantolonlar',
        permanent: true,
      },
    ]
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
