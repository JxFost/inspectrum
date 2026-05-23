import AdminLoginClient from './AdminLoginClient'

export const metadata = {
  title: 'Admin Login — Inspectrum',
  robots: 'noindex, nofollow',
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-serif text-ink mb-6 text-center">Admin Login</h1>
        <AdminLoginClient />
      </div>
    </div>
  )
}
