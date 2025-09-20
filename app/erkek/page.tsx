import { redirect } from 'next/navigation'

// Erkek sayfası erkek-triko'ya yönlendir (şimdilik)
export default function ErkekPage() {
  redirect('/erkek-triko')
}
