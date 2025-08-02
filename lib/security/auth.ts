import { NextRequest } from 'next/server'
import { Logger } from '../utils/logger'

// Enhanced authentication utilities
export class AuthSecurity {
  // Validate user session with security logging
  static async validateSession(request: NextRequest): Promise<{ valid: boolean; userId?: string; role?: string }> {
    try {
      const cookie = request.cookies.get('session_user')
      if (!cookie?.value) {
        Logger.security('Session validation failed: No session cookie', {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent'),
          path: request.nextUrl.pathname
        })
        return { valid: false }
      }
      
      // Here you would validate the session and get user info
      // This is a simplified version - implement your actual validation logic
      
      return { valid: true, userId: cookie.value }
    } catch (error) {
      Logger.error('Session validation error', error)
      return { valid: false }
    }
  }
  
  // Check for suspicious activity
  static detectSuspiciousActivity(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    
    // Check for common bot patterns
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper',
      'wget', 'curl', 'python', 'postman'
    ]
    
    const isSuspicious = botPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    )
    
    if (isSuspicious) {
      Logger.security('Suspicious activity detected', {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent,
        referer,
        path: request.nextUrl.pathname
      })
    }
    
    return isSuspicious
  }
  
  // Sanitize user input
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return ''
    
    // Remove potential XSS patterns
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }
  
  // Validate email format with enhanced checks
  static validateEmail(email: string): { valid: boolean; reason?: string } {
    if (!email || typeof email !== 'string') {
      return { valid: false, reason: 'Email is required' }
    }
    
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { valid: false, reason: 'Invalid email format' }
    }
    
    // Additional security checks
    if (email.length > 254) {
      return { valid: false, reason: 'Email too long' }
    }
    
    // Check for dangerous characters
    const dangerousChars = /[<>\"'%;()&+]/
    if (dangerousChars.test(email)) {
      return { valid: false, reason: 'Email contains invalid characters' }
    }
    
    return { valid: true }
  }
  
  // Enhanced password validation
  static validatePassword(password: string): { valid: boolean; reason?: string; score: number } {
    if (!password || typeof password !== 'string') {
      return { valid: false, reason: 'Password is required', score: 0 }
    }
    
    let score = 0
    const checks = []
    
    // Length check
    if (password.length >= 8) {
      score += 1
      checks.push('length')
    } else {
      return { valid: false, reason: 'Password must be at least 8 characters', score }
    }
    
    // Complexity checks
    if (/[a-z]/.test(password)) { score += 1; checks.push('lowercase') }
    if (/[A-Z]/.test(password)) { score += 1; checks.push('uppercase') }
    if (/[0-9]/.test(password)) { score += 1; checks.push('numbers') }
    if (/[^a-zA-Z0-9]/.test(password)) { score += 1; checks.push('symbols') }
    
    // Check for common weak patterns
    const weakPatterns = [
      /^123456/,
      /^password/i,
      /^qwerty/i,
      /^admin/i,
      /(.)\1{3,}/ // repeated characters
    ]
    
    if (weakPatterns.some(pattern => pattern.test(password))) {
      return { valid: false, reason: 'Password too weak - avoid common patterns', score }
    }
    
    if (score < 3) {
      return { valid: false, reason: 'Password must contain uppercase, lowercase, numbers and symbols', score }
    }
    
    return { valid: true, score }
  }
}
