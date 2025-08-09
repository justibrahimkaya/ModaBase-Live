import { PrismaClient } from '@prisma/client'
import { createDatabaseProtectionMiddleware } from './security/databaseProtection'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Veritabanı koruma middleware'ini ekle (production'da devre dışı)
if (process.env.NODE_ENV === 'development') {
  prisma.$use(createDatabaseProtectionMiddleware())
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
