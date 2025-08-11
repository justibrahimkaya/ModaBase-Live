import { NextRequest, NextResponse } from 'next/server';

// Rate limit store (production'da Redis kullanılmalı)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Admin login - çok sıkı
  '/api/admin/login': {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 dakika
    blockDurationMs: 60 * 60 * 1000 // 1 saat blok
  },
  // Business login - çok sıkı
  '/api/admin/business-login': {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 dakika
    blockDurationMs: 60 * 60 * 1000 // 1 saat blok
  },
  // User login - kullanıcı dostu
  '/api/auth/login': {
    maxAttempts: 5,
    windowMs: 30 * 60 * 1000, // 30 dakika
    blockDurationMs: 30 * 60 * 1000 // 30 dakika blok
  },
  // Password reset - kullanıcı dostu
  '/api/auth/request-reset': {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 saat
    blockDurationMs: 30 * 60 * 1000 // 30 dakika blok
  },
  // Register - daha esnek
  '/api/auth/register': {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 saat
    blockDurationMs: 15 * 60 * 1000 // 15 dakika blok
  }
};

export function getClientIP(request: NextRequest): string {
  // X-Forwarded-For header'ından gerçek IP'yi al
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',');
    if (ips.length > 0 && ips[0]) {
      return ips[0].trim();
    }
  }
  
  // X-Real-IP header'ından al
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback - NextRequest'te ip property yok, connection'dan al
  const connection = (request as any).connection;
  if (connection && connection.remoteAddress) {
    return connection.remoteAddress;
  }
  
  return 'unknown';
}

export function rateLimit(request: NextRequest, endpoint: string): { 
  allowed: boolean; 
  remainingAttempts: number; 
  resetTime: number;
  blocked: boolean;
} {
  const config = rateLimitConfigs[endpoint];
  if (!config) {
    return { allowed: true, remainingAttempts: -1, resetTime: 0, blocked: false };
  }

  const clientIP = getClientIP(request);
  const now = Date.now();
  const key = `${clientIP}:${endpoint}`;
  
  const current = rateLimitStore.get(key);
  
  // Süre dolmuşsa sıfırla
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return { 
      allowed: true, 
      remainingAttempts: config.maxAttempts - 1, 
      resetTime: now + config.windowMs,
      blocked: false
    };
  }
  
  // Limit aşılmışsa
  if (current.count >= config.maxAttempts) {
    const blockUntil = current.resetTime + config.blockDurationMs;
    const isBlocked = now < blockUntil;
    
    if (isBlocked) {
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        resetTime: blockUntil,
        blocked: true
      };
    } else {
      // Blok süresi dolmuş, sıfırla
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { 
        allowed: true, 
        remainingAttempts: config.maxAttempts - 1, 
        resetTime: now + config.windowMs,
        blocked: false
      };
    }
  }
  
  // Sayacı artır
  current.count++;
  rateLimitStore.set(key, current);
  
  return { 
    allowed: true, 
    remainingAttempts: config.maxAttempts - current.count, 
    resetTime: current.resetTime,
    blocked: false
  };
}

export function createRateLimitResponse(
  allowed: boolean, 
  remainingAttempts: number, 
  resetTime: number,
  blocked: boolean
): NextResponse {
  const headers = {
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': remainingAttempts.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
    'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
  };

  if (!allowed) {
    const waitTimeMinutes = Math.ceil((resetTime - Date.now()) / (1000 * 60));
    const message = blocked 
      ? `Güvenlik nedeniyle hesabınız geçici kilitlendi. ${waitTimeMinutes} dakika sonra tekrar deneyin.`
      : `Çok fazla deneme yaptınız. ${waitTimeMinutes} dakika sonra tekrar deneyin.`;
      
    return NextResponse.json(
      { 
        error: message,
        blocked,
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        waitTimeMinutes
      },
      { 
        status: 429,
        headers
      }
    );
  }

  return NextResponse.next();
} 