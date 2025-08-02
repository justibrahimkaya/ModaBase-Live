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
  
  // API rate limiting - PayTR notification hariç tüm endpoint'ler için
  if (pathname.startsWith('/api/') && !pathname.includes('/paytr/notification')) {
    // General API limit
    if (isRateLimited(`api_${ip}`, 200, 15 * 60 * 1000)) {
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
    
    // Stricter limits for auth endpoints
    if (pathname.includes('/auth/') || pathname.includes('/login') || pathname.includes('/register')) {
      if (isRateLimited(`auth_${ip}`, 5, 15 * 60 * 1000)) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Too Many Authentication Attempts',
            message: 'Please wait before trying again',
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
