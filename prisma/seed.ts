import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'crypto'

const prisma = new PrismaClient()

// Şifre hash fonksiyonu
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  console.log('🌱 Seeding database...')

  // Ana kategoriler oluştur
  const mainCategories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'kadin' },
      update: {},
      create: {
        name: 'Kadın',
        slug: 'kadin',
        description: 'Kadın giyim ve aksesuarları',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'erkek' },
      update: {},
      create: {
        name: 'Erkek',
        slug: 'erkek',
        description: 'Erkek giyim ve aksesuarları',
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=500&fit=crop'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'cocuk' },
      update: {},
      create: {
        name: 'Çocuk',
        slug: 'cocuk',
        description: 'Çocuk giyim ve aksesuarları',
        image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'aksesuar' },
      update: {},
      create: {
        name: 'Aksesuar',
        slug: 'aksesuar',
        description: 'Giyim aksesuarları',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=500&fit=crop'
      }
    })
  ])

  // Alt kategoriler oluştur
  const subCategories = await Promise.all([
    // Kadın alt kategorileri
    prisma.category.upsert({
      where: { slug: 'kadin-elbiseler' },
      update: {},
      create: {
        name: 'Elbiseler',
        slug: 'kadin-elbiseler',
        description: 'Şık ve rahat kadın elbiseleri',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
        parentId: mainCategories[0].id
      }
    }),
    prisma.category.upsert({
      where: { slug: 'kadin-bluzler' },
      update: {},
      create: {
        name: 'Bluzler',
        slug: 'kadin-bluzler',
        description: 'Modern kadın bluzleri',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
        parentId: mainCategories[0].id
      }
    }),
    prisma.category.upsert({
      where: { slug: 'kadin-etekler' },
      update: {},
      create: {
        name: 'Etekler',
        slug: 'kadin-etekler',
        description: 'Şık kadın etekleri',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
        parentId: mainCategories[0].id
      }
    }),
    prisma.category.upsert({
      where: { slug: 'kadin-pantolonlar' },
      update: {},
      create: {
        name: 'Pantolonlar',
        slug: 'kadin-pantolonlar',
        description: 'Rahat kadın pantolonları',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
        parentId: mainCategories[0].id
      }
    }),
    
    // Erkek alt kategorileri
    prisma.category.upsert({
      where: { slug: 'erkek-tshirt' },
      update: {},
      create: {
        name: 'T-Shirt',
        slug: 'erkek-tshirt',
        description: 'Erkek t-shirt modelleri',
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=500&fit=crop',
        parentId: mainCategories[1].id
      }
    }),
    prisma.category.upsert({
      where: { slug: 'erkek-pantolon' },
      update: {},
      create: {
        name: 'Pantolon',
        slug: 'erkek-pantolon',
        description: 'Erkek pantolon modelleri',
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=500&fit=crop',
        parentId: mainCategories[1].id
      }
    }),
    
    // Çocuk alt kategorileri
    prisma.category.upsert({
      where: { slug: 'cocuk-elbiseler' },
      update: {},
      create: {
        name: 'Çocuk Elbiseler',
        slug: 'cocuk-elbiseler',
        description: 'Çocuk elbiseleri',
        image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop',
        parentId: mainCategories[2].id
      }
    }),
    
    // Aksesuar alt kategorileri
    prisma.category.upsert({
      where: { slug: 'aksesuar-canta' },
      update: {},
      create: {
        name: 'Çantalar',
        slug: 'aksesuar-canta',
        description: 'Şık çanta modelleri',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=500&fit=crop',
        parentId: mainCategories[3].id
      }
    }),
    prisma.category.upsert({
      where: { slug: 'aksesuar-taki' },
      update: {},
      create: {
        name: 'Takılar',
        slug: 'aksesuar-taki',
        description: 'Şık takı modelleri',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=500&fit=crop',
        parentId: mainCategories[3].id
      }
    })
  ])

  // Tüm kategorileri birleştir
  const categories = [...mainCategories, ...subCategories]
  if (!categories[0] || !categories[1] || !categories[2]) {
    throw new Error('Seed: Ana veya alt kategoriler eksik!')
  }

  // Ürünler oluştur
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'kadin-yaz-elbisesi-cicekli' },
      update: {},
      create: {
        name: 'Kadın Yaz Elbisesi - Çiçekli Desen',
        slug: 'kadin-yaz-elbisesi-cicekli',
        description: 'Bu şık yaz elbisesi, çiçekli deseni ve rahat kesimi ile günlük kullanım için tasarlanmıştır. %100 pamuklu kumaştan üretilen elbise, nefes alabilir yapısı sayesinde uzun süre rahatlık sağlar.',
        price: 299.99,
        originalPrice: 399.99,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&crop=right',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&crop=left'
        ]),
        stock: 50,
        categoryId: categories[0].id
      }
    }),
    prisma.product.upsert({
      where: { slug: 'kadin-bluz-pamuklu' },
      update: {},
      create: {
        name: 'Kadın Bluz - Pamuklu',
        slug: 'kadin-bluz-pamuklu',
        description: 'Rahat ve şık pamuklu bluz, günlük kullanım için ideal. Nefes alabilir kumaş yapısı ile uzun süre rahatlık sağlar.',
        price: 129.99,
        originalPrice: 159.99,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop',
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop&crop=right'
        ]),
        stock: 30,
        categoryId: categories[1].id
      }
    }),
    prisma.product.upsert({
      where: { slug: 'kadin-etek-midi' },
      update: {},
      create: {
        name: 'Kadın Etek - Midi Boy',
        slug: 'kadin-etek-midi',
        description: 'Şık midi boy etek, ofis ve günlük kullanım için uygun. Kaliteli kumaş ve rahat kesim ile mükemmel uyum.',
        price: 179.99,
        originalPrice: 219.99,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&crop=top'
        ]),
        stock: 25,
        categoryId: categories[2].id
      }
    }),
    prisma.product.upsert({
      where: { slug: 'kadin-gomlek-klasik' },
      update: {},
      create: {
        name: 'Kadın Gömlek - Klasik',
        slug: 'kadin-gomlek-klasik',
        description: 'Klasik kesim kadın gömleği, ofis ve resmi ortamlar için ideal. Kaliteli kumaş ve şık tasarım.',
        price: 159.99,
        originalPrice: 189.99,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&crop=left'
        ]),
        stock: 40,
        categoryId: categories[1].id
      }
    })
  ])

  // NOT: Admin hesabı manuel olarak oluşturulacak - güvenlik için burada tanımlanmıyor

  // Kullanıcılar oluştur
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ayse@example.com' },
      update: {},
      create: {
        email: 'ayse@example.com',
        name: 'Ayşe',
        surname: 'Kaya',
        phone: '05551234567',
        passwordHash: hashPassword('ayse123')
      }
    }),
    prisma.user.upsert({
      where: { email: 'fatma@example.com' },
      update: {},
      create: {
        email: 'fatma@example.com',
        name: 'Fatma',
        surname: 'Sarı',
        phone: '05551234568',
        passwordHash: hashPassword('fatma123')
      }
    })
  ])

  // Yorumlar oluştur
  await Promise.all([
    prisma.review.upsert({
      where: { id: 'review-1' },
      update: {},
      create: {
        id: 'review-1',
        userId: users[0].id,
        productId: products[0].id,
        rating: 5,
        comment: 'Çok güzel bir elbise, kalitesi gerçekten çok iyi. Beden tam olarak uydu ve rengi de çok güzel. Kesinlikle tavsiye ederim.'
      }
    }),
    prisma.review.upsert({
      where: { id: 'review-2' },
      update: {},
      create: {
        id: 'review-2',
        userId: users[1].id,
        productId: products[0].id,
        rating: 4,
        comment: 'Elbise çok güzel ama beden biraz büyük geldi. Bir beden küçük alsaydım daha iyi olurdu. Kalite gerçekten iyi.'
      }
    }),
    prisma.review.upsert({
      where: { id: 'review-3' },
      update: {},
      create: {
        id: 'review-3',
        userId: users[0].id,
        productId: products[1].id,
        rating: 5,
        comment: 'Çok rahat ve şık bir bluz. Yaz aylarında giymek için ideal. Kumaşı nefes alabilir ve yıkaması da kolay.'
      }
    })
  ])

  // Kargo firmaları oluştur - KARGONOMİ FIRMALARI
  await Promise.all([
    prisma.shippingCompany.upsert({
      where: { code: 'aras' },
      update: {},
      create: {
        name: 'Aras Kargo',
        code: 'aras',
        apiUrl: 'https://api.araskargo.com',
        isActive: true
      }
    }),
    prisma.shippingCompany.upsert({
      where: { code: 'surat' },
      update: {},
      create: {
        name: 'Sürat Kargo',
        code: 'surat',
        apiUrl: 'https://api.suratkargo.com',
        isActive: true
      }
    }),
    prisma.shippingCompany.upsert({
      where: { code: 'ptt' },
      update: {},
      create: {
        name: 'PTT Kargo',
        code: 'ptt',
        apiUrl: 'https://api.pttkargo.com',
        isActive: true
      }
    }),
    prisma.shippingCompany.upsert({
      where: { code: 'hepsijet' },
      update: {},
      create: {
        name: 'Hepsijet',
        code: 'hepsijet',
        apiUrl: 'https://api.hepsijet.com',
        isActive: true
      }
    }),
    prisma.shippingCompany.upsert({
      where: { code: 'ups' },
      update: {},
      create: {
        name: 'UPS Kargo',
        code: 'ups',
        apiUrl: 'https://api.ups.com',
        isActive: true
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
