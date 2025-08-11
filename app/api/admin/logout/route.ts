import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Site admin session cookie'sini temizle
  response.cookies.set('session_user', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  
  // Business admin session cookie'sini temizle
  response.cookies.set('session_business', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  
  // Ek güvenlik için diğer olası cookie'leri de temizle
  response.cookies.set('session_user', '', {
    httpOnly: false,
    path: '/',
    expires: new Date(0)
  })
  
  response.cookies.set('session_business', '', {
    httpOnly: false,
    path: '/',
    expires: new Date(0)
  })
  
  return response
}
