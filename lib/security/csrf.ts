import { randomBytes, createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export class CSRFProtection {
  private static secretKey = process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
  
  // Generate CSRF token
  static generateToken(sessionId?: string): string {
    const timestamp = Date.now().toString()
    const random = randomBytes(16).toString('hex')
    const data = `${sessionId || 'anonymous'}-${timestamp}-${random}`
    
    return createHash('sha256')
      .update(data + this.secretKey)
      .digest('hex')
      .substring(0, 32)
  }
  
  // Validate CSRF token
  static validateToken(token: string): boolean {
    if (!token || typeof token !== 'string' || token.length !== 32) {
      return false
    }
    
    // In a real implementation, you would store tokens in Redis/database
    // with expiration times and validate against that store
    // For now, we'll do a basic validation
    
    return /^[a-f0-9]{32}$/.test(token)
  }
  
  // Add CSRF token to response headers
  static addTokenToResponse(response: NextResponse, sessionId?: string): NextResponse {
    const token = this.generateToken(sessionId)
    response.headers.set('X-CSRF-Token', token)
    return response
  }
  
  // Validate CSRF token from request
  static validateRequest(request: NextRequest): boolean {
    // Skip CSRF for GET requests
    if (request.method === 'GET' || request.method === 'HEAD') {
      return true
    }
    
    const token = request.headers.get('X-CSRF-Token') || 
                 request.headers.get('x-csrf-token')
    
    if (!token) {
      return false
    }
    
    return this.validateToken(token)
  }
}

// CSRF middleware function
export function withCSRFProtection(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    // Validate CSRF token for state-changing requests
    if (!CSRFProtection.validateRequest(request)) {
      return NextResponse.json(
        { error: 'CSRF token invalid or missing' },
        { status: 403 }
      )
    }
    
    // Call the original handler
    const response = await handler(request, context)
    
    // Add CSRF token to response if it's a NextResponse
    if (response instanceof NextResponse) {
      return CSRFProtection.addTokenToResponse(response)
    }
    
    return response
  }
}
