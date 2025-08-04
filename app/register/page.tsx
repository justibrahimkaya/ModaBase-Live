import { Metadata } from 'next'
import RegisterForm from './RegisterForm'

// Register Page Metadata
export const metadata: Metadata = {
  title: 'Üye Ol | ModaBase',
  description: 'ModaBase\'e ücretsiz üye olun. Güvenli alışveriş, özel indirimler ve hızlı teslimat avantajlarından yararlanın.',
  robots: {
    index: false, // Auth pages should not be indexed
    follow: true,
  }
}

export default function RegisterPage() {
  return <RegisterForm />
}