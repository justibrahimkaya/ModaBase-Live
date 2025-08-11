// DOM-based XSS Protection Utilities

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // HTML encode dangerous characters
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  // Remove any whitespace
  const cleaned = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (cleaned.startsWith('javascript:') || 
      cleaned.startsWith('data:') || 
      cleaned.startsWith('vbscript:')) {
    return '#';
  }
  
  return url;
}

/**
 * Create safe HTML from user input
 */
export function createSafeHTML(content: string): string {
  return sanitizeInput(content);
}

/**
 * Validate and sanitize search parameters
 */
export function sanitizeSearchParams(params: any): any {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
