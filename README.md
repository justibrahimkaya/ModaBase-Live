# ModaBase - Profesyonel E-Ticaret Platformu

Modern, responsive ve tam özellikli e-ticaret platformu. Next.js 15, TypeScript, Tailwind CSS ve Prisma ile geliştirilmiş, production-ready sistem.

## 🌟 Canlı Demo

**Production Site**: [https://www.modabase.com.tr](https://www.modabase.com.tr)
**Vercel URL**: [https://moda-base-live.vercel.app](https://moda-base-live.vercel.app)

## 🚀 Tam Özellik Listesi

### ✅ Tamamlanan Özellikler

#### 🛍️ E-Ticaret Sistemi
- **Ürün Kataloğu**: Kategoriler, ürün detayları, gelişmiş filtreleme
- **Sepet Sistemi**: Global state, localStorage persistence, real-time güncelleme
- **Checkout Sistemi**: 3 adımlı ödeme süreci, kargo seçimi
- **Ödeme Entegrasyonu**: PayTR ile güvenli ödeme sistemi
- **Kargo Seçimi**: Standart, ekspres, ücretsiz kargo seçenekleri
- **Kupon Sistemi**: İndirim kodları (MODA10, MODA20)
- **Sipariş Takibi**: Misafir takip sistemi, detaylı sipariş geçmişi

#### 👥 Kullanıcı Yönetimi
- **Kayıt/Giriş Sistemi**: NextAuth.js ile güvenli kimlik doğrulama
- **Kullanıcı Profili**: Profil düzenleme, adres yönetimi
- **Şifre Sıfırlama**: E-posta ile güvenli şifre sıfırlama
- **Favoriler & İstek Listesi**: Ürün kaydetme sistemi
- **Stok Bildirimleri**: Ürün stoğa girince bildirim

#### 🎛️ Süper Admin Paneli
- **İşletme Onayları**: Business başvurularını onaylama/reddetme
- **Sistem Monitörü**: Real-time sistem durumu takibi
- **Kullanıcı Yönetimi**: Tüm kullanıcıları görüntüleme ve yönetme
- **Sistem Ayarları**: Platform geneli konfigürasyon

#### 🏢 İşletme Admin Paneli
- **Ürün Yönetimi**: CRUD işlemler, çoklu resim upload, kategori yönetimi
- **Sipariş Yönetimi**: Sipariş takibi, durum güncelleme, detaylı görüntüleme
- **Stok Yönetimi**: Stok uyarıları, hızlı güncelleme, CSV export
- **E-Fatura Sistemi**: Otomatik fatura oluşturma, e-posta gönderimi
- **İstatistikler**: Satış raporları, dashboard analytics
- **Ayarlar**: Güvenlik, bildirimler, API key yönetimi

#### 💻 Modern UI/UX
- **Glassmorphism Design**: Ultra modern arayüz tasarımı
- **Mobile-First**: %98 mobile uyumluluk skoru
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm
- **Dark/Light Mode**: Tema desteği
- **Animasyonlar**: Smooth geçişler ve hover efektleri

#### 🔒 Güvenlik & Performance
- **Security Headers**: CSRF koruması, XSS önleme
- **API Rate Limiting**: DDoS koruması
- **Image Optimization**: Next.js otomatik optimizasyon
- **Code Splitting**: Lazy loading ve performans optimizasyonu
- **SSL/TLS**: End-to-end şifreleme

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 15.4.1, React 18, TypeScript 5
- **Styling**: Tailwind CSS 3.4, Headless UI
- **Database**: PostgreSQL, Prisma ORM 5.21
- **Authentication**: NextAuth.js 4.24
- **State Management**: React Context API
- **Icons**: Lucide React, Heroicons
- **Email**: Nodemailer, SMTP
- **Payments**: PayTR API
- **Deployment**: Vercel, Supabase

## 📱 Mobile Optimizasyon

### Cihaz Uyumluluğu
- **iPhone**: Safari tam uyumluluk, notch desteği
- **Samsung**: Chrome, Samsung Internet optimizasyonu
- **iPad**: Tablet görünüm optimizasyonu
- **Cross-browser**: Chrome, Safari, Firefox, Edge

### Performance Metrikleri
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 📦 Kurulum

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/justibrahimkaya/ModaBase-Live.git
cd ModaBase-Live
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables
`.env.local` dosyası oluşturun:

```env
# Database (Supabase)
DATABASE_URL="postgresql://user:pass@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# PayTR
PAYTR_MERCHANT_ID="your-merchant-id"
PAYTR_MERCHANT_KEY="your-merchant-key"
PAYTR_MERCHANT_SALT="your-merchant-salt"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Veritabanı Setup
```bash
# Prisma migrate
npx prisma db push

# Seed data
npm run db:seed

# Admin hesabı oluştur
node scripts/create-secure-admin.js
```

### 5. Geliştirme Sunucusu
```bash
npm run dev
```

## 📚 API Dokümantasyonu

### Ürünler
```http
GET /api/products              # Tüm ürünler (sayfalama, filtreleme)
GET /api/products/[slug]       # Tek ürün detayı
POST /api/admin/products       # Yeni ürün oluştur
PUT /api/admin/products/[id]   # Ürün güncelle
DELETE /api/admin/products/[id] # Ürün sil
```

### Siparişler
```http
GET /api/orders                # Kullanıcı siparişleri
POST /api/orders               # Yeni sipariş oluştur
GET /api/admin/orders          # Admin sipariş listesi
PUT /api/admin/orders/[id]     # Sipariş durumu güncelle
```

### Kimlik Doğrulama
```http
POST /api/auth/register        # Kullanıcı kaydı
POST /api/auth/login           # Giriş yapma
POST /api/auth/logout          # Çıkış yapma
POST /api/auth/request-reset   # Şifre sıfırlama talebi
POST /api/auth/reset-password  # Şifre sıfırlama
```

## 🗄️ Veritabanı Şeması

### Ana Tablolar
- **User**: Kullanıcı hesapları ve profilleri
- **Category**: Ürün kategorileri (hiyerarşik)
- **Product**: Ürün bilgileri ve stok durumu
- **Order**: Sipariş başlıkları ve durumları
- **OrderItem**: Sipariş detay kalemleri
- **Address**: Teslimat ve fatura adresleri
- **Review**: Ürün değerlendirmeleri
- **Cart**: Sepet kalemleri
- **Favorite**: Favori ürünler
- **StockNotification**: Stok bildirim talepleri

## 🚀 Production Deployment

### Vercel Deployment
1. **Repository Bağlantısı**: GitHub repo'yu Vercel'e bağlayın
2. **Environment Variables**: Vercel dashboard'dan ekleyin
3. **Domain Setup**: Custom domain yapılandırması
4. **SSL Certificate**: Otomatik HTTPS

### Supabase Database
1. **Supabase Proje**: Yeni PostgreSQL projesi oluşturun
2. **Connection String**: Database URL'i environment'a ekleyin
3. **Migration**: `npx prisma db push` ile şemayı uygulayın
4. **Seed**: Initial data'yı yükleyin

### Email Configuration
1. **Gmail App Password**: 2FA aktif Gmail hesabı gerekli
2. **SMTP Settings**: Environment variables'ları yapılandırın
3. **Template Test**: Email gönderimini test edin

## 📊 Production Metrics

### Performance
- **Core Web Vitals**: Tüm metrikler green zone'da
- **Lighthouse Score**: 95+ performance skoru
- **Bundle Size**: Optimized code splitting
- **Image Optimization**: WebP, automatic sizing

### Security
- **OWASP Compliance**: Top 10 güvenlik açıklarına karşı korumalı
- **Rate Limiting**: API endpoint koruması
- **Input Validation**: SQL injection koruması
- **CSRF Protection**: Cross-site request forgery koruması

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 → #1D4ED8)
- **Secondary**: Purple accent (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Headers**: Inter font family
- **Body**: System font stack
- **Code**: JetBrains Mono

## 🔧 Development Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm run db:push      # Database migration
npm run db:seed      # Seed data
npm run db:studio    # Prisma Studio
```

## 📞 İletişim & Support

- **Developer**: İbrahim Kaya
- **GitHub**: [https://github.com/justibrahimkaya](https://github.com/justibrahimkaya)
- **Live Demo**: [https://moda-base-live.vercel.app](https://moda-base-live.vercel.app)
- **Issues**: GitHub Issues kullanın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

---

**ModaBase** - Modern E-Ticaret Çözümü 🛍️