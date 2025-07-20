import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pbkdf2Sync, randomBytes } from 'crypto'

function hashPassword(password: string, salt?: string) {
  salt = typeof salt === 'string' ? salt : randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export async function POST(request: NextRequest) {
  const { token, password } = await request.json()
  if (!token || !password) {
    return NextResponse.json({ error: 'Token ve yeni şifre zorunlu.' }, { status: 400 })
  }
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  })
  if (!user) {
    return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş token.' }, { status: 400 })
  }
  const passwordHash = hashPassword(password)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null
    }
  })
  return NextResponse.json({ success: true })
}
