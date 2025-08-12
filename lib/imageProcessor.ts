import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export async function processProductImages(images: string[]): Promise<string[]> {
  const processedImages: string[] = []
  
  // public/products klasörünü oluştur
  const productsDir = path.join(process.cwd(), 'public', 'products')
  try {
    await fs.mkdir(productsDir, { recursive: true })
  } catch (error) {
    console.error('Klasör oluşturma hatası:', error)
  }

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    
    // Undefined veya null kontrolü
    if (!image) {
      processedImages.push('/default-product.svg')
      continue
    }
    
    // Eğer zaten URL ise (http:// veya / ile başlıyorsa) direkt kullan
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
      processedImages.push(image)
      continue
    }
    
    // Base64 resim ise işle
    if (image.startsWith('data:image')) {
      try {
        // Base64 prefix'ini kaldır
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        
        // Benzersiz dosya adı oluştur
        const fileName = `${uuidv4()}.webp`
        const filePath = path.join(productsDir, fileName)
        
        // Sharp ile resmi optimize et ve WebP formatına çevir
        await sharp(buffer)
          .resize(800, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toFile(filePath)
        
        // URL olarak kaydet
        processedImages.push(`/products/${fileName}`)
        
        console.log(`✅ Resim ${i + 1} başarıyla işlendi: ${fileName}`)
      } catch (error) {
        console.error(`❌ Resim ${i + 1} işlenemedi:`, error)
        // Hata durumunda boş resim ekle
        processedImages.push('/default-product.svg')
      }
    } else {
      // Geçersiz format, varsayılan resim kullan
      processedImages.push('/default-product.svg')
    }
  }
  
  return processedImages
}
