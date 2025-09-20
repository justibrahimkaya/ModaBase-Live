// API Helper Functions - JSON Parse Error Prevention

/**
 * Güvenli JSON parse utility - JSON parse hatalarını önler
 */
export async function safeJsonParse(response: Response) {
  const text = await response.text()
  
  if (!text || text.trim() === '') {
    throw new Error('Sunucudan boş yanıt alındı')
  }
  
  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('JSON parse hatası:', {
      responseStatus: response.status,
      responseStatusText: response.statusText,
      responseText: text.substring(0, 200) // İlk 200 karakter
    })
    throw new Error('Sunucudan geçersiz yanıt alındı')
  }
}

/**
 * Gelişmiş fetch wrapper - Otomatik error handling ile
 */
export async function apiRequest(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    // Response status kontrolü
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`, {
        url,
        status: response.status,
        statusText: response.statusText,
        responseText: errorText.substring(0, 200)
      })
      
      // JSON error message parse etmeyi dene
      try {
        const errorData = JSON.parse(errorText)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      } catch {
        // JSON değilse HTTP status message kullan
        throw new Error(`Sunucu hatası: ${response.status} ${response.statusText}`)
      }
    }

    // Başarılı response'u güvenli şekilde parse et
    return await safeJsonParse(response)

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network hatası: Sunucuya ulaşılamıyor')
    }
    throw error
  }
}

/**
 * Form data POST request helper
 */
export async function postFormData(url: string, data: Record<string, any>) {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Debug mode için detaylı fetch logging
 */
export async function debugFetch(url: string, options: RequestInit = {}) {
  console.log('🚀 API Request:', {
    url,
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body ? JSON.parse(options.body as string) : undefined
  })

  const startTime = performance.now()
  
  try {
    const result = await apiRequest(url, options)
    const endTime = performance.now()
    
    console.log('✅ API Success:', {
      url,
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      result
    })
    
    return result
  } catch (error) {
    const endTime = performance.now()
    
    console.error('❌ API Error:', {
      url,
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      error: error instanceof Error ? error.message : error
    })
    
    throw error
  }
}

// Development mode check
export const isDev = process.env.NODE_ENV === 'development'

/**
 * Production'da apiRequest, development'da debugFetch kullan
 */
export const safeFetch = isDev ? debugFetch : apiRequest
