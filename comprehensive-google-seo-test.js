const https = require('https');
const http = require('http');
const { URL } = require('url');

console.log('🔍 COMPREHENSIVE GOOGLE SEO TEST SUITE');
console.log('=====================================');
console.log('Google\'ın yaptığı TÜM SEO testlerini simüle ediyoruz...\n');

const BASE_URL = 'https://www.modabase.com.tr';

// Test sonuçlarını toplamak için
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

function logResult(test, status, message, details = '') {
  const symbols = { pass: '✅', fail: '❌', warn: '⚠️' };
  console.log(`${symbols[status]} ${test}: ${message}`);
  if (details) console.log(`   ${details}`);
  
  if (status === 'pass') testResults.passed++;
  else if (status === 'fail') {
    testResults.failed++;
    testResults.errors.push(`${test}: ${message}`);
  } else if (status === 'warn') testResults.warnings++;
}

// HTTP/HTTPS request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        ...options.headers
      },
      timeout: 10000
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.setTimeout(10000);
    req.end();
  });
}

// 1. ROBOTS.TXT TESTs
async function testRobotsTxt() {
  console.log('\n🤖 ROBOTS.TXT VALIDATION');
  console.log('========================');
  
  try {
    const response = await makeRequest(`${BASE_URL}/robots.txt`);
    
    if (response.statusCode === 200) {
      logResult('Robots.txt Accessibility', 'pass', 'Dosya erişilebilir');
      
      const content = response.body;
      console.log('\n📄 Robots.txt İçeriği:');
      console.log(content);
      
      // Syntax validation
      const lines = content.split('\n').filter(line => line.trim());
      let hasUserAgent = false;
      let hasSitemap = false;
      let hasValidDirectives = true;
      
      lines.forEach((line, index) => {
        line = line.trim();
        if (line.toLowerCase().startsWith('user-agent:')) hasUserAgent = true;
        if (line.startsWith('Sitemap:')) hasSitemap = true;
        
        // Basic syntax check
        if (!line.startsWith('#') && !line.match(/^(User-agent|Disallow|Allow|Sitemap|Crawl-delay):/i) && line !== '') {
          logResult('Robots.txt Syntax', 'warn', `Satır ${index + 1}: Geçersiz direktif "${line}"`);
          hasValidDirectives = false;
        }
      });
      
      if (hasUserAgent) {
        logResult('User-agent Directive', 'pass', 'User-agent direktifi mevcut');
      } else {
        logResult('User-agent Directive', 'fail', 'User-agent direktifi eksik');
      }
      
      if (hasSitemap) {
        logResult('Sitemap Reference', 'pass', 'Sitemap referansı mevcut');
      } else {
        logResult('Sitemap Reference', 'warn', 'Sitemap referansı önerilir');
      }
      
      if (hasValidDirectives) {
        logResult('Robots.txt Syntax', 'pass', 'Syntax geçerli');
      }
      
    } else {
      logResult('Robots.txt Accessibility', 'fail', `HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logResult('Robots.txt Test', 'fail', `Request hatası: ${error.message}`);
  }
}

// 2. SITEMAP.XML TESTS
async function testSitemap() {
  console.log('\n🗺️ SITEMAP.XML VALIDATION');
  console.log('=========================');
  
  try {
    const response = await makeRequest(`${BASE_URL}/sitemap.xml`);
    
    if (response.statusCode === 200) {
      logResult('Sitemap Accessibility', 'pass', 'Sitemap erişilebilir');
      
      const content = response.body;
      
      // XML syntax validation
      if (content.includes('<?xml')) {
        logResult('XML Declaration', 'pass', 'XML deklarasyonu mevcut');
      } else {
        logResult('XML Declaration', 'warn', 'XML deklarasyonu eksik');
      }
      
      // URL count
      const urlMatches = content.match(/<url>/g);
      const urlCount = urlMatches ? urlMatches.length : 0;
      console.log(`\n📊 Sitemap İstatistikleri:`);
      console.log(`   🔗 Toplam URL: ${urlCount}`);
      
      if (urlCount > 0) {
        logResult('URL Content', 'pass', `${urlCount} URL bulundu`);
      } else {
        logResult('URL Content', 'fail', 'Hiç URL bulunamadı');
      }
      
      if (urlCount > 50000) {
        logResult('URL Limit', 'warn', 'URL sayısı 50,000\'i aşıyor, sitemap index kullanın');
      } else {
        logResult('URL Limit', 'pass', 'URL sayısı limit dahilinde');
      }
      
      // Schema validation
      if (content.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
        logResult('Sitemap Schema', 'pass', 'Sitemap schema doğru');
      } else {
        logResult('Sitemap Schema', 'fail', 'Sitemap schema eksik/yanlış');
      }
      
      // Sample URLs from sitemap
      const sampleUrls = [];
      const locMatches = content.match(/<loc>(.*?)<\/loc>/g);
      if (locMatches && locMatches.length > 0) {
        // İlk 5 URL'yi test et
        for (let i = 0; i < Math.min(5, locMatches.length); i++) {
          const url = locMatches[i].replace(/<\/?loc>/g, '');
          sampleUrls.push(url);
        }
        
        console.log(`\n📋 Test edilecek örnek URL'ler:`);
        sampleUrls.forEach((url, index) => {
          console.log(`   ${index + 1}. ${url}`);
        });
        
        // URL'leri test et
        for (const url of sampleUrls) {
          try {
            const urlResponse = await makeRequest(url);
            if (urlResponse.statusCode === 200) {
              logResult('URL Accessibility', 'pass', `${url} erişilebilir`);
            } else if (urlResponse.statusCode >= 300 && urlResponse.statusCode < 400) {
              logResult('URL Redirect', 'warn', `${url} yönlendirme (${urlResponse.statusCode})`);
            } else {
              logResult('URL Accessibility', 'fail', `${url} erişilemez (${urlResponse.statusCode})`);
            }
          } catch (error) {
            logResult('URL Accessibility', 'fail', `${url} - ${error.message}`);
          }
        }
      }
      
    } else {
      logResult('Sitemap Accessibility', 'fail', `HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logResult('Sitemap Test', 'fail', `Request hatası: ${error.message}`);
  }
}

// 3. REDIRECT & URL VALIDATION TESTS
async function testRedirectsAndUrls() {
  console.log('\n🔄 REDIRECT & URL VALIDATION');
  console.log('=============================');
  
  // Google Search Console'da hata veren URL'ler
  const problematicUrls = [
    // Yönlendirme hataları
    `${BASE_URL}/triko`,
    `${BASE_URL}/products`, 
    `${BASE_URL}/triko-elbise`,
    `${BASE_URL}/kadin-elbise`,
    `${BASE_URL}/bluz-modelleri`,
    `${BASE_URL}/buyuk-beden`,
    `${BASE_URL}/yazlik-elbise`,
    
    // Problem ürünler
    `${BASE_URL}/product/mb-000057-yazlik-triko`,
    `${BASE_URL}/product/mb-000045-kurdele-detayli-triko-crop-suveter-yeni`,
    `${BASE_URL}/product/mb-000042fit-kesim-cizgili-triko-bluz`,
    `${BASE_URL}/product/mb-000041-duz-formlu-triko-maxi-elbise`,
    
    // Blog sayfaları
    `${BASE_URL}/blog`,
    
    // Ana sayfalar
    `${BASE_URL}`,
  ];
  
  for (const url of problematicUrls) {
    console.log(`\n🔍 Testing redirects for: ${url.replace(BASE_URL, '')}`);
    
    try {
      const response = await makeRequest(url, { method: 'HEAD' }); // Sadece header al
      
      if (response.statusCode === 200) {
        logResult('URL Status', 'pass', `${url.replace(BASE_URL, '')} - Direct access (200)`);
      } else if (response.statusCode >= 300 && response.statusCode < 400) {
        const location = response.headers.location;
        if (response.statusCode === 301) {
          logResult('Redirect Status', 'pass', `${url.replace(BASE_URL, '')} - 301 Permanent redirect to ${location}`);
        } else if (response.statusCode === 302 || response.statusCode === 307) {
          logResult('Redirect Status', 'warn', `${url.replace(BASE_URL, '')} - ${response.statusCode} Temporary redirect to ${location}`);
        } else {
          logResult('Redirect Status', 'warn', `${url.replace(BASE_URL, '')} - ${response.statusCode} redirect to ${location}`);
        }
      } else if (response.statusCode === 404) {
        logResult('URL Status', 'fail', `${url.replace(BASE_URL, '')} - 404 Not Found`);
      } else if (response.statusCode >= 500) {
        logResult('URL Status', 'fail', `${url.replace(BASE_URL, '')} - ${response.statusCode} Server Error`);
      } else {
        logResult('URL Status', 'warn', `${url.replace(BASE_URL, '')} - Unexpected ${response.statusCode}`);
      }
    } catch (error) {
      logResult('URL Test', 'fail', `${url.replace(BASE_URL, '')} - ${error.message}`);
    }
  }
}

// 4. STRUCTURED DATA TESTS (Enhanced for products)
async function testStructuredData() {
  console.log('\n📊 STRUCTURED DATA VALIDATION');
  console.log('==============================');
  
  const testUrls = [
    `${BASE_URL}`, // Homepage
    `${BASE_URL}/products`, // Products page
    `${BASE_URL}/blog`, // Blog page
    `${BASE_URL}/triko`, // Category page
    
    // GSC'de hata veren spesifik ürünler
    `${BASE_URL}/product/mb-000057-yazlik-triko`,
    `${BASE_URL}/product/mb-000045-kurdele-detayli-triko-crop-suveter-yeni`,
    `${BASE_URL}/product/mb-000042fit-kesim-cizgili-triko-bluz`,
    `${BASE_URL}/product/mb-000041-duz-formlu-triko-maxi-elbise`,
  ];
  
  for (const url of testUrls) {
    console.log(`\n🔍 Testing: ${url.replace(BASE_URL, '')}`);
    
    try {
      const response = await makeRequest(url);
      
      if (response.statusCode === 200) {
        const content = response.body;
        
        // JSON-LD scripts'i bul
        const jsonLdMatches = content.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gs);
        
        if (jsonLdMatches && jsonLdMatches.length > 0) {
          logResult('Structured Data Present', 'pass', `${jsonLdMatches.length} JSON-LD script bulundu`);
          
          jsonLdMatches.forEach((script, index) => {
            try {
              const jsonContent = script.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/s)[1].trim();
              
              if (jsonContent) {
                const jsonData = JSON.parse(jsonContent);
                const schemaType = jsonData['@type'];
                
                console.log(`   Script ${index + 1}: @type=${schemaType}`);
                
                // Schema-specific validation
                if (schemaType === 'Product') {
                  // Product schema validation
                  if (jsonData.name) {
                    logResult('Product Name', 'pass', 'Product name mevcut');
                  } else {
                    logResult('Product Name', 'fail', 'Product name eksik');
                  }
                  
                  if (jsonData.image) {
                    if (typeof jsonData.image === 'string' && jsonData.image.startsWith('http')) {
                      logResult('Product Image', 'pass', 'Product image URL geçerli');
                    } else {
                      logResult('Product Image', 'fail', 'Product image URL geçersiz');
                    }
                  } else {
                    logResult('Product Image', 'fail', 'Product image eksik (Google bu alanı istiyor!)');
                  }
                  
                  if (jsonData.offers) {
                    if (jsonData.offers.price && jsonData.offers.priceCurrency) {
                      logResult('Product Offers', 'pass', 'Price ve currency mevcut');
                    } else {
                      logResult('Product Offers', 'fail', 'Price veya currency eksik');
                    }
                  } else {
                    logResult('Product Offers', 'fail', 'Offers eksik');
                  }
                  
                  if (jsonData.brand) {
                    logResult('Product Brand', 'pass', 'Brand mevcut');
                  } else {
                    logResult('Product Brand', 'warn', 'Brand önerilir');
                  }
                }
                
                if (schemaType === 'Organization') {
                  if (jsonData.name && jsonData.url) {
                    logResult('Organization Schema', 'pass', 'Name ve URL mevcut');
                  } else {
                    logResult('Organization Schema', 'fail', 'Name veya URL eksik');
                  }
                }
                
                if (schemaType === 'WebSite') {
                  if (jsonData.potentialAction && jsonData.potentialAction['@type'] === 'SearchAction') {
                    logResult('WebSite SearchAction', 'pass', 'Site search mevcut');
                  } else {
                    logResult('WebSite SearchAction', 'warn', 'Site search önerilir');
                  }
                }
                
              } else {
                logResult('JSON-LD Parse', 'fail', `Script ${index + 1}: Boş içerik`);
              }
            } catch (parseError) {
              logResult('JSON-LD Parse', 'fail', `Script ${index + 1}: ${parseError.message}`);
            }
          });
        } else {
          logResult('Structured Data Present', 'warn', 'JSON-LD bulunamadı');
        }
        
        // Meta tags validation
        const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1].trim()) {
          logResult('Page Title', 'pass', `Title: "${titleMatch[1].trim()}"`);
        } else {
          logResult('Page Title', 'fail', 'Title tag eksik');
        }
        
        const metaDescMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*?)["'][^>]*>/i);
        if (metaDescMatch && metaDescMatch[1].trim()) {
          logResult('Meta Description', 'pass', `Description: "${metaDescMatch[1].trim().substring(0, 100)}..."`);
        } else {
          logResult('Meta Description', 'warn', 'Meta description eksik');
        }
        
      } else {
        logResult('Page Accessibility', 'fail', `${url} - HTTP ${response.statusCode}`);
      }
    } catch (error) {
      logResult('Page Test', 'fail', `${url} - ${error.message}`);
    }
  }
}

// 5. HTTPS & SECURITY TESTS
async function testHttpsSecurity() {
  console.log('\n🔒 HTTPS & SECURITY VALIDATION');
  console.log('===============================');
  
  try {
    // Test HTTP to HTTPS redirect
    const httpResponse = await makeRequest('http://modabase.com.tr');
    if (httpResponse.statusCode >= 300 && httpResponse.statusCode < 400) {
      logResult('HTTP to HTTPS Redirect', 'pass', 'HTTP automatically redirects to HTTPS');
    } else {
      logResult('HTTP to HTTPS Redirect', 'fail', 'HTTP redirect eksik');
    }
    
    // Test www redirect
    const wwwResponse = await makeRequest('https://modabase.com.tr');
    if (wwwResponse.statusCode >= 300 && wwwResponse.statusCode < 400) {
      logResult('WWW Redirect', 'pass', 'Non-www to www redirect mevcut');
    } else if (wwwResponse.statusCode === 200) {
      logResult('WWW Redirect', 'warn', 'Non-www redirect yok (www tercih edilebilir)');
    }
    
    // Test HTTPS security headers
    const response = await makeRequest(BASE_URL);
    const headers = response.headers;
    
    if (headers['strict-transport-security']) {
      logResult('HSTS Header', 'pass', 'HSTS header mevcut');
    } else {
      logResult('HSTS Header', 'warn', 'HSTS header eksik');
    }
    
    if (headers['x-content-type-options']) {
      logResult('Content Type Options', 'pass', 'X-Content-Type-Options mevcut');
    } else {
      logResult('Content Type Options', 'warn', 'X-Content-Type-Options eksik');
    }
    
  } catch (error) {
    logResult('HTTPS Test', 'fail', `Security test hatası: ${error.message}`);
  }
}

// 6. MOBILE & PERFORMANCE TESTS  
async function testMobilePerformance() {
  console.log('\n📱 MOBILE & PERFORMANCE VALIDATION');
  console.log('===================================');
  
  try {
    const response = await makeRequest(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      }
    });
    
    if (response.statusCode === 200) {
      const content = response.body;
      
      // Viewport meta tag
      if (content.includes('name="viewport"')) {
        logResult('Viewport Meta Tag', 'pass', 'Viewport meta tag mevcut');
      } else {
        logResult('Viewport Meta Tag', 'fail', 'Viewport meta tag eksik');
      }
      
      // Responsive images
      const imgTags = content.match(/<img[^>]*>/gi);
      if (imgTags) {
        let responsiveImages = 0;
        imgTags.forEach(img => {
          if (img.includes('sizes=') || img.includes('srcset=')) {
            responsiveImages++;
          }
        });
        
        if (responsiveImages > 0) {
          logResult('Responsive Images', 'pass', `${responsiveImages} responsive image bulundu`);
        } else {
          logResult('Responsive Images', 'warn', 'Responsive image önerilir');
        }
      }
      
      // Page size estimation
      const pageSize = Buffer.byteLength(content, 'utf8');
      console.log(`\n📏 Sayfa Boyutu: ${Math.round(pageSize / 1024)} KB`);
      
      if (pageSize < 500000) { // 500KB
        logResult('Page Size', 'pass', 'Sayfa boyutu uygun');
      } else if (pageSize < 1000000) { // 1MB
        logResult('Page Size', 'warn', 'Sayfa boyutu büyük');
      } else {
        logResult('Page Size', 'fail', 'Sayfa boyutu çok büyük');
      }
      
    }
  } catch (error) {
    logResult('Mobile Test', 'fail', `Mobile test hatası: ${error.message}`);
  }
}

// 7. CONTENT QUALITY TESTS
async function testContentQuality() {
  console.log('\n📝 CONTENT QUALITY VALIDATION');
  console.log('==============================');
  
  try {
    const response = await makeRequest(BASE_URL);
    
    if (response.statusCode === 200) {
      const content = response.body;
      
      // Remove HTML tags for text analysis
      const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Word count
      const wordCount = textContent.split(' ').length;
      console.log(`\n📊 İçerik İstatistikleri:`);
      console.log(`   📝 Kelime sayısı: ${wordCount}`);
      
      if (wordCount > 300) {
        logResult('Content Length', 'pass', 'Yeterli içerik mevcut');
      } else {
        logResult('Content Length', 'warn', 'Daha fazla içerik önerilir');
      }
      
      // Language detection
      if (content.includes('lang="tr"') || content.includes('lang="tr-TR"')) {
        logResult('Language Declaration', 'pass', 'Dil deklarasyonu mevcut');
      } else {
        logResult('Language Declaration', 'warn', 'Dil deklarasyonu eksik');
      }
      
      // Canonical URL
      if (content.includes('rel="canonical"')) {
        logResult('Canonical URL', 'pass', 'Canonical URL mevcut');
      } else {
        logResult('Canonical URL', 'warn', 'Canonical URL eksik');
      }
    }
  } catch (error) {
    logResult('Content Test', 'fail', `İçerik test hatası: ${error.message}`);
  }
}

// 8. ALL PRODUCTS COMPREHENSIVE TEST
async function testAllProducts() {
  console.log('\n🛍️ ALL PRODUCTS COMPREHENSIVE TEST');
  console.log('===================================');
  console.log('Sitemap\'ten TÜM ürünleri çekip test ediyoruz...\n');
  
  // Önce sitemap'i çek ve tüm product URL'lerini bul
  let allProductUrls = [];
  
  try {
    console.log('📋 Sitemap\'ten ürün URL\'leri çekiliyor...');
    
    // Multiple sitemap attempts
    let sitemapResponse = null;
    const sitemapUrls = [
      `${BASE_URL}/sitemap.xml`,
      `https://modabase.com.tr/sitemap.xml`, // Non-www version
      `${BASE_URL}/api/sitemap`, // Potential API endpoint
    ];
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        console.log(`   🔄 Trying: ${sitemapUrl}`);
        sitemapResponse = await makeRequest(sitemapUrl);
        if (sitemapResponse.statusCode === 200) {
          console.log(`   ✅ Success with: ${sitemapUrl}`);
          break;
        } else {
          console.log(`   ❌ ${sitemapUrl}: HTTP ${sitemapResponse.statusCode}`);
        }
      } catch (urlError) {
        console.log(`   ❌ ${sitemapUrl}: ${urlError.message}`);
      }
    }
    
    if (sitemapResponse && sitemapResponse.statusCode === 200) {
      const sitemapContent = sitemapResponse.body;
      const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      
      if (locMatches) {
        allProductUrls = locMatches
          .map(match => match.replace(/<\/?loc>/g, ''))
          .filter(url => url.includes('/product/'))
          .map(url => url.replace(BASE_URL, '').replace('/product/', ''));
        
        console.log(`✅ Sitemap\'te ${allProductUrls.length} ürün URL\'si bulundu`);
        
        // İlk 10 örnek göster
        if (allProductUrls.length > 0) {
          console.log('\n📋 Bulunan ürün slugları (ilk 10):');
          allProductUrls.slice(0, 10).forEach((slug, index) => {
            console.log(`   ${index + 1}. ${slug}`);
          });
          if (allProductUrls.length > 10) {
            console.log(`   ... ve ${allProductUrls.length - 10} tane daha`);
          }
        }
      } else {
        throw new Error('Sitemap XML\'de URL bulunamadı');
      }
    } else {
      throw new Error('Sitemap erişim başarısız');
    }
  } catch (error) {
    console.log(`❌ Sitemap hatası: ${error.message}`);
    console.log('🔄 API endpoint\'ten ürünleri çekmeye çalışılıyor...');
    
    try {
      const apiResponse = await makeRequest(`${BASE_URL}/api/products`);
      
      if (apiResponse.statusCode === 200) {
        const productsData = JSON.parse(apiResponse.body);
        
        if (Array.isArray(productsData)) {
          allProductUrls = productsData
            .filter(product => product.slug)
            .map(product => product.slug);
          
          console.log(`✅ API\'den ${allProductUrls.length} ürün bulundu`);
          
          // İlk 10 örnek göster
          if (allProductUrls.length > 0) {
            console.log('\n📋 API\'den alınan ürün slugları (ilk 10):');
            allProductUrls.slice(0, 10).forEach((slug, index) => {
              console.log(`   ${index + 1}. ${slug}`);
            });
            if (allProductUrls.length > 10) {
              console.log(`   ... ve ${allProductUrls.length - 10} tane daha`);
            }
          }
        } else if (productsData.products && Array.isArray(productsData.products)) {
          allProductUrls = productsData.products
            .filter(product => product.slug)
            .map(product => product.slug);
          
          console.log(`✅ API\'den ${allProductUrls.length} ürün bulundu`);
        } else {
          throw new Error('API response format unexpected');
        }
      } else {
        throw new Error(`API HTTP ${apiResponse.statusCode}`);
      }
    } catch (apiError) {
      console.log(`❌ API hatası: ${apiError.message}, fallback ürünleri kullanılıyor`);
      allProductUrls = [
        'mb-000057-yazlik-triko',
        'mb-000045-kurdele-detayli-triko-crop-suveter-yeni', 
        'mb-000042fit-kesim-cizgili-triko-bluz',
        'mb-000041-duz-formlu-triko-maxi-elbise'
      ];
    }
  }
  
  // Test statistics
  let totalProducts = allProductUrls.length;
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let imageFieldMissing = 0;
  let imageFieldPresent = 0;
  let validImageUrls = 0;
  let invalidImageUrls = 0;
  
  console.log(`\n🎯 ${totalProducts} ürün test edilecek...`);
  console.log('==========================================\n');
  
  // Her ürünü test et (performance için batch processing)
  const batchSize = 5; // Aynı anda 5 ürün test et
  
  for (let i = 0; i < allProductUrls.length; i += batchSize) {
    const batch = allProductUrls.slice(i, i + batchSize);
    
    console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allProductUrls.length/batchSize)} - Testing ${batch.length} products...`);
    
    const batchPromises = batch.map(async (productSlug) => {
      const url = `${BASE_URL}/product/${productSlug}`;
      
      try {
        const response = await makeRequest(url);
        processedCount++;
        
        if (response.statusCode === 200) {
          successCount++;
          const content = response.body;
          
          // JSON-LD kontrolü
          const jsonLdMatches = content.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gs);
          
          let productSchemaFound = false;
          let hasImageField = false;
          let imageUrl = null;
          let isValidImageUrl = false;
          
          if (jsonLdMatches && jsonLdMatches.length > 0) {
            jsonLdMatches.forEach((script) => {
              try {
                const jsonContent = script.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/s)[1].trim();
                
                if (jsonContent) {
                  const jsonData = JSON.parse(jsonContent);
                  
                  if (jsonData['@type'] === 'Product') {
                    productSchemaFound = true;
                    
                    // Image field kontrolü
                    if (jsonData.image) {
                      hasImageField = true;
                      imageUrl = jsonData.image;
                      
                      if (typeof jsonData.image === 'string' && 
                          jsonData.image.startsWith('http') && 
                          !jsonData.image.startsWith('data:image/')) {
                        isValidImageUrl = true;
                        validImageUrls++;
                      } else {
                        invalidImageUrls++;
                      }
                    }
                  }
                }
              } catch (parseError) {
                // Silent parse error for batch processing
              }
            });
          }
          
          if (hasImageField) {
            imageFieldPresent++;
            if (isValidImageUrl) {
              console.log(`   ✅ ${productSlug}: Image field OK (${imageUrl.substring(0, 50)}...)`);
            } else {
              console.log(`   ❌ ${productSlug}: Invalid image URL (${imageUrl ? imageUrl.substring(0, 50) + '...' : 'null'})`);
              logResult('Product Image Invalid', 'fail', `${productSlug} - Invalid image: ${imageUrl}`);
            }
          } else {
            imageFieldMissing++;
            console.log(`   🚨 ${productSlug}: IMAGE FIELD MISSING!`);
            logResult('Product Image Missing', 'fail', `${productSlug} - Image field completely missing`);
          }
          
          if (!productSchemaFound) {
            console.log(`   ⚠️ ${productSlug}: No Product schema found`);
            logResult('Product Schema Missing', 'fail', `${productSlug} - No Product structured data`);
          }
          
        } else {
          errorCount++;
          console.log(`   ❌ ${productSlug}: HTTP ${response.statusCode}`);
          logResult('Product Page Error', 'fail', `${productSlug} - HTTP ${response.statusCode}`);
        }
      } catch (error) {
        errorCount++;
        console.log(`   💥 ${productSlug}: ${error.message}`);
        logResult('Product Request Error', 'fail', `${productSlug} - ${error.message}`);
      }
    });
    
    // Batch'teki tüm istekleri parallel çalıştır
    await Promise.all(batchPromises);
    
    // Progress update
    console.log(`   📊 Progress: ${processedCount}/${totalProducts} (${Math.round(processedCount/totalProducts*100)}%)\n`);
    
    // Rate limiting - server'ı yormamak için
    if (i + batchSize < allProductUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
    }
  }
  
  // Final product statistics
  console.log('\n' + '='.repeat(50));
  console.log('🎯 ALL PRODUCTS TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`📊 Toplam ürün: ${totalProducts}`);
  console.log(`✅ Başarılı erişim: ${successCount}`);
  console.log(`❌ Erişim hatası: ${errorCount}`);
  console.log(`\n🖼️ IMAGE FIELD ANALYSIS:`);
  console.log(`✅ Image field mevcut: ${imageFieldPresent}`);
  console.log(`❌ Image field EKSİK: ${imageFieldMissing}`);
  console.log(`✅ Geçerli image URL: ${validImageUrls}`);
  console.log(`❌ Geçersiz image URL: ${invalidImageUrls}`);
  
  const imageFieldPercentage = totalProducts > 0 ? Math.round((imageFieldPresent / totalProducts) * 100) : 0;
  const validImagePercentage = totalProducts > 0 ? Math.round((validImageUrls / totalProducts) * 100) : 0;
  
  console.log(`\n📈 IMAGE FIELD COVERAGE: ${imageFieldPercentage}%`);
  console.log(`📈 VALID IMAGE URL RATE: ${validImagePercentage}%`);
  
  if (imageFieldMissing > 0) {
    console.log(`\n🚨 KRİTİK: ${imageFieldMissing} üründe image field eksik!`);
    console.log('   Google Search Console bu ürünlerde "image alanı eksik" hatası verecek!');
  }
  
  if (invalidImageUrls > 0) {
    console.log(`\n⚠️ UYARI: ${invalidImageUrls} üründe geçersiz image URL!`);
    console.log('   Bu ürünlerde Google "image URL geçersiz" hatası verebilir!');
  }
  
  if (imageFieldMissing === 0 && invalidImageUrls === 0) {
    console.log('\n🎉 MÜKEMMEL! Tüm ürünlerde image field mevcut ve geçerli!');
  }
  
  console.log('='.repeat(50));
}

// MAIN TEST RUNNER
async function runAllTests() {
  console.log(`🎯 Test başlıyor: ${new Date().toLocaleString()}\n`);
  
  await testRobotsTxt();
  await testSitemap();
  await testRedirectsAndUrls(); // YENİ: Redirect ve URL testleri
  await testStructuredData();
  await testAllProducts(); // YENİ: TÜM ÜRÜNLER comprehensive test
  await testHttpsSecurity();
  await testMobilePerformance();
  await testContentQuality();
  
  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('🎯 COMPREHENSIVE SEO TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Başarılı Test: ${testResults.passed}`);
  console.log(`❌ Başarısız Test: ${testResults.failed}`);
  console.log(`⚠️ Uyarı: ${testResults.warnings}`);
  console.log(`📊 Toplam Test: ${testResults.passed + testResults.failed + testResults.warnings}`);
  
  if (testResults.failed > 0) {
    console.log('\n🚨 KRİTİK HATALAR:');
    testResults.errors.forEach(error => {
      console.log(`   ❌ ${error}`);
    });
  }
  
  // SEO Score calculation
  const totalTests = testResults.passed + testResults.failed + testResults.warnings;
  const score = totalTests > 0 ? Math.round((testResults.passed / totalTests) * 100) : 0;
  
  console.log(`\n🏆 SEO SCORE: ${score}/100`);
  
  if (score >= 90) {
    console.log('🎉 MÜKEMMEL! Google\'ın beklentilerini karşılıyor!');
  } else if (score >= 75) {
    console.log('👍 İYİ! Birkaç iyileştirme yapılabilir.');
  } else if (score >= 50) {
    console.log('⚠️ ORTA! Önemli iyileştirmeler gerekli.');
  } else {
    console.log('🚨 KÖTÜ! Ciddi SEO sorunları var!');
  }
  
  console.log(`\n⏰ Test tamamlandı: ${new Date().toLocaleString()}`);
  console.log('📋 Bu raporu Google Search Console ile karşılaştırabilirsiniz!');
}

// Start the comprehensive test
runAllTests().catch(console.error);