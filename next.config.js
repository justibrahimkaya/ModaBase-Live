/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Prisma için Vercel optimizasyonu
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common');
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
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
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
              "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
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