import { Metadata } from 'next'
import LoginForm from './LoginForm'

// Login Page Metadata - SEO optimized for auth page
export const metadata: Metadata = {
  title: 'Giriş Yap | ModaBase',
  description: 'ModaBase hesabınıza giriş yapın. Güvenli alışveriş, hızlı ödeme ve özel indirimler için üye girişi yapın.',
  robots: {
    index: true, // Login sayfası indexlenebilir
    follow: true,
  }
}

export default function LoginPage() {
  return <LoginForm />
}