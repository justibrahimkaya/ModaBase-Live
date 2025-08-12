import { NextAuthOptions } from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
// import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import { pbkdf2Sync } from 'crypto'

// PBKDF2 şifre doğrulama - register API ile aynı
function verifyPassword(password: string, passwordHash: string) {
  const [salt, hash] = passwordHash.split(':')
  if (!salt || !hash) return false
  const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return hash === hashToVerify
}

// Providers'ı env mevcutsa ekle
const dynamicProviders: any[] = []

// Sosyal sağlayıcılar tamamen kapatıldı (talep üzerine)
// İleride tekrar açmak için bu bloklar geri getirilebilir

dynamicProviders.push(
  CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Email normalize et - register ile aynı format
        const normalizedEmail = credentials.email.toLowerCase().trim()
        console.log('NextAuth login attempt:', credentials.email, '→', normalizedEmail)

        const user = await prisma.user.findUnique({
          where: {
            email: normalizedEmail
          }
        })

        if (!user || !user.passwordHash) {
          console.log('NextAuth: User not found or no password hash')
          return null
        }

        // PBKDF2 kullan - register API ile aynı
        const isPasswordValid = verifyPassword(credentials.password, user.passwordHash || '')
        console.log('NextAuth: Password valid?', isPasswordValid)

        if (!isPasswordValid) {
          console.log('NextAuth: Invalid password')
          return null
        }
        
        console.log('NextAuth: Login successful for user:', user.email)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null // Temporarily disabled until Prisma client recognizes the field
        }
      }
    })
)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: dynamicProviders,
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            // User exists, allow sign in
            return true
          }

          // Create new user with social account - PrismaAdapter will handle this
          return true
        } catch (error) {
          console.error('Error with social login:', error)
          return false
        }
      }
      return true
    }
  },
  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email)
    },
    async signIn({ user, account }) {
      console.log('User signed in:', user.email, 'Provider:', account?.provider)
    }
  },
  debug: process.env.NODE_ENV === 'development'
}
