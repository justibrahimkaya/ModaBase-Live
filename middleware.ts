import { NextRequest, NextResponse } from 'next/server'

// Enhanced in-memory rate limiting with cleanup
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Enhanced rate limiting function
function isRateLimited(
  key: string, 
  limit: number = 100, 
  windowMs: number = 15 * 60 * 1000
): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return false
  }
  
  if (entry.count >= limit) {
    return true
  }
  
  entry.count++
  return false
}

// Security headers configuration
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
}

// Production security headers
const productionHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Get client IP with fallbacks
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // Enhanced rate limiting with different limits for different endpoints
  const pathname = request.nextUrl.pathname
  
  // 🛡️ BUSINESS HESABI KONTROLÜ - İşletme hesabı ile normal siteye erişimi engelle
  const businessCookie = request.cookies.get('session_business')
  const viewingAsCustomer = request.cookies.get('viewing_as_customer')
  
  // 🎭 URL parameter ile customer view kontrolü (fallback)
  const url = new URL(request.url)
  const customerModeParam = url.searchParams.get('customer_view')
  const hasCustomerMode = viewingAsCustomer?.value === 'true' || customerModeParam === 'true'
  
  // 🛡️ Business hesabı varsa /api/profile endpoint'ini tamamen blokla
  if (businessCookie && pathname === '/api/profile') {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Business account cannot access user profile endpoint',
        redirect: '/admin'
      }), 
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  // 🔧 SSR Hydration için business hesabı headers ekle
  if (businessCookie) {
    response.headers.set('X-Business-Account', 'true')
    response.headers.set('X-Viewing-As-Customer', hasCustomerMode ? 'true' : 'false')
    // Continue with middleware logic - no early return!
  }
  
  // 🛡️ Business hesabı varsa profile sayfalarına HİÇBİR ZAMAN erişim yok
  if (businessCookie && pathname.startsWith('/profile')) {
    // Business hesabı profile sayfasına erişim engellendi
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (businessCookie && !hasCustomerMode) {
    // İşletme hesabı ile giriş yapılmış VE müşteri görünümü aktif değil
    const isAdminPath = pathname.startsWith('/admin') || 
                       pathname.startsWith('/super-admin') ||
                       pathname.startsWith('/api/admin') ||
                       pathname.startsWith('/api/auth') ||
                       pathname.startsWith('/api/whatsapp') ||
                       pathname.startsWith('/api/products') ||
                       pathname.startsWith('/api/categories') ||
                       pathname.startsWith('/api/cart') ||
                       pathname.startsWith('/api/orders') ||
                       pathname.startsWith('/api/reviews') ||
                       pathname.startsWith('/api/favorites') ||
                       pathname.startsWith('/api/wishlist') ||
                       pathname.startsWith('/api/blog') ||
                       pathname.startsWith('/_next') ||
                       pathname.startsWith('/.well-known') ||
                       pathname === '/favicon.ico' ||
                       pathname === '/robots.txt' ||
                       pathname === '/sitemap.xml' ||
                       pathname === '/products' ||
                       pathname === '/triko' ||
                       pathname === '/kadin-elbise' ||
                       pathname === '/yazlik-elbise' ||
                       pathname === '/triko-elbise' ||
                       pathname === '/bluz-modelleri' ||
                       pathname === '/kadin-pantolon' ||
                       pathname === '/buyuk-beden' ||
                       pathname === '/siyah-elbise' ||
                       pathname === '/kadin-tisort' ||
                       pathname.startsWith('/product/') ||
                       pathname.startsWith('/blog/')
    
    if (!isAdminPath) {
      // Normal site sayfalarına erişim engelle - admin paneline yönlendir
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  
  // API rate limiting - PayTR notification ve NextAuth hariç tüm endpoint'ler için
  if (pathname.startsWith('/api/') && 
      !pathname.includes('/paytr/notification') &&
      !pathname.includes('/api/auth/session')) {
    // General API limit
    if (isRateLimited(`api_${ip}`, 500, 15 * 60 * 1000)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too Many Requests',
          message: 'Please try again later',
          retryAfter: 900
        }), 
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900'
          }
        }
      )
    }
    
    // User-friendly limits for auth endpoints 
    if (pathname.includes('/auth/') || pathname.includes('/login') || pathname.includes('/register')) {
      if (isRateLimited(`auth_${ip}`, 200, 60 * 60 * 1000)) {  // 200 requests/hour
        return new NextResponse(
          JSON.stringify({ 
            error: 'Çok fazla deneme yapıldı',
            message: 'Lütfen 1 saat sonra tekrar deneyin',
            retryAfter: 3600
          }), 
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '3600'
            }
          }
        )
      }
    }
    
    // Payment endpoints need extra protection (but not PayTR notifications)
    if (pathname.includes('/paytr/') || pathname.includes('/payment/')) {
      if (isRateLimited(`payment_${ip}`, 10, 15 * 60 * 1000)) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Too Many Payment Requests',
            message: 'Please contact support if this persists',
            retryAfter: 900
          }), 
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '900'
            }
          }
        )
      }
    }
  }
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Production-specific headers
  if (process.env.NODE_ENV === 'production') {
    Object.entries(productionHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }
  
  // Remove potentially sensitive headers
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')
  
  // Enhanced CORS for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
      'https://localhost:3000'
    ].filter(Boolean)
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    response.headers.set('Access-Control-Max-Age', '86400')
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }
  
  // Performance optimization: Cache static assets
  if (pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  // Cache HTML pages for a short time
  if (pathname === '/' || pathname.startsWith('/products/') || pathname.startsWith('/category/')) {
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
