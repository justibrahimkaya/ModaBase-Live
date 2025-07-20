// Production-safe logger utility
interface LogData {
  [key: string]: any
}

export class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development'
  
  static info(message: string, data?: LogData) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data ? this.sanitizeData(data) : '')
    }
  }
  
  static warn(message: string, data?: LogData) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data ? this.sanitizeData(data) : '')
    }
  }
  
  static error(message: string, error?: any) {
    // Always log errors but sanitize
    const sanitizedError = this.isDevelopment ? error : 'Error details hidden in production'
    console.error(`[ERROR] ${message}`, sanitizedError)
  }
  
  static debug(message: string, data?: LogData) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data ? this.sanitizeData(data) : '')
    }
  }
  
  // Remove sensitive information from logs
  private static sanitizeData(data: LogData): LogData {
    const sanitized = { ...data }
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'email', 'phone']
    
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]'
      }
    })
    
    return sanitized
  }
  
  // Log security events (always logged)
  static security(event: string, details?: LogData) {
    console.warn(`[SECURITY] ${new Date().toISOString()} - ${event}`, details ? this.sanitizeData(details) : '')
  }
}
