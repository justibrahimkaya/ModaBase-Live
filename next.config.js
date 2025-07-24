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
  
  // Image optimization settings
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
    minimumCacheTTL: 60,
    // Base64 resimler için
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
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com https://js.stripe.com https://www.paytr.com https://*.paytr.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://www.paytr.com https://*.paytr.com",
              "img-src 'self' data: https: blob: https://images.unsplash.com https://via.placeholder.com https://res.cloudinary.com https://www.paytr.com https://*.paytr.com",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://www.paytr.com https://*.paytr.com",
              "connect-src 'self' https://www.google-analytics.com https://api.stripe.com https://www.paytr.com https://*.paytr.com wss://localhost:*",
              "frame-src 'self' https://www.paytr.com https://*.paytr.com",
              "frame-ancestors 'self'",
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
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)'
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
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
