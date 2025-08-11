export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Sayfası</h1>
        <p className="text-gray-600 mb-4">Bu sayfa çalışıyorsa, sorun ana sayfada.</p>
        <div className="space-y-2 text-sm">
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
          <p>DATABASE_URL: {process.env.DATABASE_URL ? 'VAR' : 'YOK'}</p>
          <p>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || 'YOK'}</p>
          <p>BASE_URL: {process.env.NEXT_PUBLIC_BASE_URL || 'YOK'}</p>
        </div>
      </div>
    </div>
  )
}