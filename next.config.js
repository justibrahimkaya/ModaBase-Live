/** @type {import('next').NextConfig} */
const path = require('path');
const crypto = require('crypto');

const nextConfig = {
  // Prisma için Vercel optimizasyonu
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common');
    } else {
      // Client-side bundle optimization
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
            },
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier())
              },
              name(module) {
                const hash = crypto.createHash('sha1')
                hash.update(module.identifier())
                return 'lib-' + hash.digest('hex').substring(0, 8)
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config;
  },
  // Prisma paketlerini server tarafında external tutma; Next 15 ile çakışıyor
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  images: {
    domains: ['localhost', 'modabase.com.tr', 'www.modabase.com.tr'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        port: '',
        pathname: '/**',
      },
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
    minimumCacheTTL: 604800,
    deviceSizes: [420, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  experimental: {
    optimizePackageImports: [
      '@headlessui/react',
      'lucide-react', 
      'react-hot-toast',
      'swiper'
    ],
  },

  // Modern JS target for smaller bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Prisma binary'lerini output tracing'e açıkça dahil et (root-level key)
  outputFileTracingIncludes: {
    '/**/*': [
      './node_modules/.prisma/client',
      './node_modules/@prisma/client'
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://*.google-analytics.com https://googletagmanager.com https://*.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://api.paytr.com https://www.paytr.com https://vitals.vercel-insights.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com",
              "frame-src 'self' https://www.paytr.com",
              "frame-ancestors 'none'",
              "object-src 'none'",
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
            value: 'strict-origin-when-cross-origin'
          },
                  {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin-allow-popups'
        },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          }
        ]
      }
    ]
  },

  async redirects() {
    return []
  },

  async rewrites() {
    return [
      {
        source: '/api/paytr/:path*',
        destination: '/api/paytr/:path*',
        has: [
          {
            type: 'header',
            key: 'origin',
            value: '(.*paytr\\.com.*)',
          },
        ],
      },
    ]
  },

  transpilePackages: [
    '@headlessui/react',
  ],

  env: {
    NEXT_BODY_SIZE_LIMIT: process.env.NEXT_BODY_SIZE_LIMIT || '50mb',
  },

  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig