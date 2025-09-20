import { Metadata } from 'next'
import RegisterForm from './RegisterForm'

// Register Page Metadata
export const metadata: Metadata = {
  title: 'Üye Ol | ModaBase',
  description: 'ModaBase\'e ücretsiz üye olun. Güvenli alışveriş, özel indirimler ve hızlı teslimat avantajlarından yararlanın.',
  robots: {
    index: true, // Register sayfası indexlenebilir
    follow: true,
  }
}

export default function RegisterPage() {
  return <RegisterForm />
}