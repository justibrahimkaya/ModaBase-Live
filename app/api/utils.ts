import { NextRequest } from 'next/server'

export function getUserIdFromRequest(request: NextRequest): string | null {
  // Next.js 13+ API routes: request.cookies.get('cookieName')
  const cookie = request.cookies.get('session_user')
  if (!cookie) return null
  // .value ile erişiyoruz
  return typeof cookie === 'object' ? cookie.value : cookie
}
