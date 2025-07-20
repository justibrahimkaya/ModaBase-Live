#!/usr/bin/env node

/**
 * Production Environment Variables Checker
 * Bu script production ortamındaki environment değişkenlerini kontrol eder
 */

console.log('🔍 ModaBase Production Environment Kontrolü\n');

// Kritik environment değişkenleri
const criticalVars = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'Production PostgreSQL Database URL',
    check: (value) => value && value.includes('postgresql://') && !value.includes('file:./temp.db')
  },
  
  // NextAuth
  NEXTAUTH_SECRET: {
    required: true,
    description: 'NextAuth Secret Key',
    check: (value) => value && value.length >= 32
  },
  NEXTAUTH_URL: {
    required: true,
    description: 'NextAuth URL',
    check: (value) => value && value.startsWith('https://')
  },
  
  // Email Configuration
  SMTP_HOST: {
    required: true,
    description: 'SMTP Host',
    check: (value) => value === 'smtp.gmail.com'
  },
  SMTP_PORT: {
    required: true,
    description: 'SMTP Port',
    check: (value) => value === '587'
  },
  SMTP_USER: {
    required: true,
    description: 'SMTP User Email',
    check: (value) => value && value.includes('@')
  },
  SMTP_PASS: {
    required: true,
    description: 'SMTP App Password',
    check: (value) => value && value.length >= 16 && value.includes(' ')
  },
  EMAIL_FROM: {
    required: true,
    description: 'Email From Address',
    check: (value) => value && value.includes('@')
  },
  
  // App Settings
  NODE_ENV: {
    required: true,
    description: 'Node Environment',
    check: (value) => value === 'production'
  },
  NEXT_PUBLIC_APP_URL: {
    required: true,
    description: 'Public App URL',
    check: (value) => value && value.startsWith('https://')
  },
  
  // Security
  ENCRYPTION_KEY: {
    required: true,
    description: 'Encryption Key',
    check: (value) => value && value.length >= 32
  },
  JWT_SECRET: {
    required: true,
    description: 'JWT Secret',
    check: (value) => value && value.length >= 32
  }
};

// Opsiyonel environment değişkenleri
const optionalVars = {
  PAYTR_MERCHANT_ID: 'PayTR Merchant ID',
  PAYTR_MERCHANT_KEY: 'PayTR Merchant Key',
  PAYTR_MERCHANT_SALT: 'PayTR Merchant Salt',
  CLOUDINARY_URL: 'Cloudinary URL',
  NEXT_PUBLIC_GA_ID: 'Google Analytics ID',
  SENTRY_DSN: 'Sentry DSN'
};

let totalChecks = 0;
let passedChecks = 0;
let criticalIssues = 0;

console.log('📋 KRİTİK DEĞİŞKENLER:');
console.log('=' .repeat(50));

// Kritik değişkenleri kontrol et
Object.entries(criticalVars).forEach(([varName, config]) => {
  totalChecks++;
  const value = process.env[varName];
  
  if (!value && config.required) {
    console.log(`❌ ${varName}: EKSİK`);
    console.log(`   📝 ${config.description}`);
    criticalIssues++;
  } else if (value && config.check(value)) {
    console.log(`✅ ${varName}: DOĞRU`);
    passedChecks++;
  } else {
    console.log(`⚠️  ${varName}: HATALI`);
    console.log(`   📝 ${config.description}`);
    console.log(`   💡 Mevcut: ${value ? value.substring(0, 20) + '...' : 'undefined'}`);
    criticalIssues++;
  }
  console.log('');
});

console.log('📋 OPSİYONEL DEĞİŞKENLER:');
console.log('=' .repeat(50));

// Opsiyonel değişkenleri kontrol et
Object.entries(optionalVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: MEVCUT`);
  } else {
    console.log(`⚪ ${varName}: YOK (opsiyonel)`);
  }
});

console.log('\n📊 SONUÇ:');
console.log('=' .repeat(50));
console.log(`✅ Geçen: ${passedChecks}/${totalChecks}`);
console.log(`❌ Kritik Sorunlar: ${criticalIssues}`);

if (criticalIssues === 0) {
  console.log('\n🎉 TEBRİKLER! Production ortamı hazır!');
  console.log('📧 Şifre sıfırlama sistemi çalışacak.');
} else {
  console.log('\n🚨 DİKKAT! Kritik sorunlar var:');
  console.log('📧 Şifre sıfırlama sistemi çalışmayabilir.');
  console.log('\n🔧 Çözüm için:');
  console.log('1. Vercel Dashboard → Settings → Environment Variables');
  console.log('2. Eksik/hatalı değişkenleri düzelt');
  console.log('3. Redeploy yap');
}

// Email sistemi özel kontrolü
console.log('\n📧 EMAİL SİSTEMİ KONTROLÜ:');
console.log('=' .repeat(50));

const emailVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
const emailIssues = emailVars.filter(varName => {
  const value = process.env[varName];
  return !value || !criticalVars[varName].check(value);
});

if (emailIssues.length === 0) {
  console.log('✅ Email sistemi tamamen hazır!');
  console.log('📧 Şifre sıfırlama emailleri gönderilecek.');
} else {
  console.log('❌ Email sistemi sorunlu:');
  emailIssues.forEach(varName => {
    console.log(`   - ${varName}: ${process.env[varName] ? 'Hatalı değer' : 'Eksik'}`);
  });
  console.log('\n🔧 Email için Gmail App Password gerekli:');
  console.log('1. Gmail → Google Account → Security');
  console.log('2. 2-Step Verification aktif et');
  console.log('3. App Passwords → ModaBase oluştur');
  console.log('4. 16 haneli kodu SMTP_PASS olarak set et');
}

console.log('\n' + '=' .repeat(50)); 