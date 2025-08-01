'use client';

import Head from 'next/head';

interface ProductSEOHeadProps {
  product: {
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string;
    // SEO alanları
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string | null;
    altText?: string | null;
    brand?: string | null;
    sku?: string | null;
    gtin?: string | null;
    mpn?: string | null;
    condition?: string | null;
    availability?: string | null;
    material?: string | null;
    color?: string | null;
    size?: string | null;
    weight?: string | null;
    dimensions?: string | null;
    warranty?: string | null;
    countryOfOrigin?: string | null;
    // Sosyal medya
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
    ogType?: string | null;
    twitterCard?: string | null;
    twitterTitle?: string | null;
    twitterDescription?: string | null;
    twitterImage?: string | null;
    // Yapılandırılmış veri
    structuredData?: string | null;
    canonicalUrl?: string | null;
    hreflang?: string | null;
    // Arama motoru
    robotsMeta?: string | null;
    sitemapPriority?: number | null;
    changeFrequency?: string | null;
    lastModified?: string | null | Date;
  };
  category?: {
    name: string;
  };
}

export default function ProductSEOHead({ product, category }: ProductSEOHeadProps) {
  const images = JSON.parse(product.images || '[]');
  const mainImage = images[0] || '';
  
  // Varsayılan değerler
  const metaTitle = product.metaTitle || `${product.name} - ${category?.name || 'Ürün'} | ModaBase`;
  const metaDescription = product.metaDescription || product.description.substring(0, 160);
  const ogTitle = product.ogTitle || metaTitle;
  const ogDescription = product.ogDescription || metaDescription;
  const ogImage = product.ogImage || mainImage;
  const twitterTitle = product.twitterTitle || ogTitle;
  const twitterDescription = product.twitterDescription || ogDescription;
  const twitterImage = product.twitterImage || ogImage;
  const canonicalUrl = product.canonicalUrl || `https://modabase.com/product/${product.slug}`;
  const robotsMeta = product.robotsMeta || 'index,follow';
  const hreflang = product.hreflang || 'tr-TR';

  // Yapılandırılmış veri
  const structuredData = product.structuredData ? JSON.parse(product.structuredData) : {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": metaDescription,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "ModaBase"
    },
    "category": category?.name,
    "image": images,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "TRY",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün geçerli
      "availability": product.availability ? `https://schema.org/${product.availability}` : "https://schema.org/InStock",
      "condition": product.condition ? `https://schema.org/${product.condition}` : "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "ModaBase"
      }
    },
    "sku": product.sku,
    "mpn": product.mpn,
    "gtin": product.gtin,
    "weight": product.weight,
    "dimensions": product.dimensions,
    "material": product.material,
    "color": product.color,
    "size": product.size,
    "warranty": product.warranty,
    "countryOfOrigin": product.countryOfOrigin || "Türkiye"
  };

  return (
    <Head>
      {/* Temel Meta Tag'ler */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {product.keywords && <meta name="keywords" content={product.keywords} />}
      <meta name="robots" content={robotsMeta} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="hreflang" content={hreflang} />

      {/* Open Graph (Facebook) */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={product.ogType || "product"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="ModaBase" />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={product.twitterCard || "summary_large_image"} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:site" content="@modabase" />

      {/* Ürün Özel Meta Tag'ler */}
      <meta property="product:price:amount" content={product.price.toString()} />
      <meta property="product:price:currency" content="TRY" />
      {product.brand && <meta property="product:brand" content={product.brand} />}
      {product.condition && <meta property="product:condition" content={product.condition} />}
      {product.availability && <meta property="product:availability" content={product.availability} />}

      {/* Yapılandırılmış Veri */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      {/* Ek Meta Tag'ler */}
      <meta name="author" content="ModaBase" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      
      {/* Performans */}
      <link rel="preload" href={mainImage} as="image" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/icon-192x192.png" />
      
      {/* Manifest */}
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
} 