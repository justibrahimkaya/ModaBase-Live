import Script from 'next/script'

// Güvenli external script yükleme
export function SecurityHeaders() {
  return (
    <>
      {/* Google Analytics - SRI ile */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}
    </>
  )
}

// Script güvenlik politikası
export const scriptSecurityPolicy = {
  // Trusted domains for scripts
  trustedDomains: [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://connect.facebook.net',
    'https://www.paytr.com'
  ],
  
  // Nonce generator for inline scripts
  generateNonce: () => {
    const array = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    }
    return Buffer.from(array).toString('base64');
  }
}
