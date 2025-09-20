import { NextRequest, NextResponse } from 'next/server';

// Kalıcı IP engelleme listesi (production'da Redis kullanılmalı)
const permanentBanList = new Set<string>();

// IP bazlı şüpheli aktivite takibi
const suspiciousActivity = new Map<string, {
  attempts: number;
  lastAttempt: number;
  blockCount: number;
  firstSeen: number;
}>();

interface ThreatLevel {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'WARN' | 'BLOCK' | 'PERMANENT_BAN';
  reason: string;
}

export class AdvancedProtection {
  // Şüpheli aktivite tespiti
  static detectSuspiciousActivity(ip: string, _endpoint: string): ThreatLevel {
    const now = Date.now();
    const activity = suspiciousActivity.get(ip) || {
      attempts: 0,
      lastAttempt: 0,
      blockCount: 0,
      firstSeen: now
    };

    // Kalıcı ban kontrolü
    if (permanentBanList.has(ip)) {
      return {
        level: 'CRITICAL',
        action: 'PERMANENT_BAN',
        reason: 'IP kalıcı olarak engellenmiş'
      };
    }

    // Çok hızlı denemeler (1 saniyede 5+ deneme)
    const timeDiff = now - activity.lastAttempt;
    if (timeDiff < 1000 && activity.attempts > 5) {
      return {
        level: 'CRITICAL',
        action: 'PERMANENT_BAN',
        reason: 'Çok hızlı deneme saldırısı'
      };
    }

    // Çok fazla blok yemiş IP
    if (activity.blockCount >= 5) {
      permanentBanList.add(ip);
      return {
        level: 'CRITICAL',
        action: 'PERMANENT_BAN',
        reason: '5 kez blok yemiş IP'
      };
    }

    // Şüpheli pattern (çok kısa sürede çok deneme)
    if (activity.attempts > 20 && (now - activity.firstSeen) < 300000) { // 5 dakika
      return {
        level: 'HIGH',
        action: 'BLOCK',
        reason: 'Şüpheli aktivite pattern\'i'
      };
    }

    // Normal aktivite
    return {
      level: 'LOW',
      action: 'WARN',
      reason: 'Normal aktivite'
    };
  }

  // IP'yi kalıcı engelle
  static banIP(ip: string, reason: string): void {
    permanentBanList.add(ip);
    console.log(`🚫 IP kalıcı olarak engellendi: ${ip} - Sebep: ${reason}`);
  }

  // IP'yi engelleme listesinden çıkar
  static unbanIP(ip: string): void {
    permanentBanList.delete(ip);
    suspiciousActivity.delete(ip);
    console.log(`✅ IP engelleme listesinden çıkarıldı: ${ip}`);
  }

  // Şüpheli aktivite kaydı
  static recordActivity(ip: string, _endpoint: string, success: boolean): void {
    const now = Date.now();
    const activity = suspiciousActivity.get(ip) || {
      attempts: 0,
      lastAttempt: 0,
      blockCount: 0,
      firstSeen: now
    };

    activity.attempts++;
    activity.lastAttempt = now;

    if (!success) {
      activity.blockCount++;
    }

    suspiciousActivity.set(ip, activity);
  }

  // Güvenlik kontrolü
  static securityCheck(request: NextRequest, endpoint: string): {
    allowed: boolean;
    threatLevel: ThreatLevel;
    message: string;
  } {
    const ip = this.getClientIP(request);
    const threatLevel = this.detectSuspiciousActivity(ip, endpoint);

    switch (threatLevel.action) {
      case 'PERMANENT_BAN':
        return {
          allowed: false,
          threatLevel,
          message: 'IP adresiniz kalıcı olarak engellenmiştir. Destek ile iletişime geçin.'
        };

      case 'BLOCK':
        return {
          allowed: false,
          threatLevel,
          message: 'Şüpheli aktivite tespit edildi. Lütfen daha sonra tekrar deneyin.'
        };

      case 'WARN':
        return {
          allowed: true,
          threatLevel,
          message: 'Normal aktivite'
        };

      default:
        return {
          allowed: true,
          threatLevel,
          message: 'Normal aktivite'
        };
    }
  }

  // Client IP alma
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      const ips = forwarded.split(',');
      if (ips.length > 0 && ips[0]) {
        return ips[0].trim();
      }
    }
    
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }
    
    const connection = (request as any).connection;
    if (connection && connection.remoteAddress) {
      return connection.remoteAddress;
    }
    
    return 'unknown';
  }

  // İstatistikler
  static getStats(): {
    bannedIPs: number;
    suspiciousIPs: number;
    totalActivity: number;
  } {
    return {
      bannedIPs: permanentBanList.size,
      suspiciousIPs: suspiciousActivity.size,
      totalActivity: Array.from(suspiciousActivity.values()).reduce((sum, activity) => sum + activity.attempts, 0)
    };
  }

  // Engellenen IP listesi
  static getBannedIPs(): string[] {
    return Array.from(permanentBanList);
  }
}

// Middleware için kullanım
export function advancedSecurityMiddleware(request: NextRequest, endpoint: string) {
  const securityCheck = AdvancedProtection.securityCheck(request, endpoint);
  
  if (!securityCheck.allowed) {
    return NextResponse.json(
      { 
        error: securityCheck.message,
        threatLevel: securityCheck.threatLevel.level,
        blocked: true
      },
      { status: 403 }
    );
  }

  return null; // Devam et
} 