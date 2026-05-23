import AdminBlockClient from './AdminBlockClient'

export const metadata = {
  title: 'Admin — Block Time / Manual Booking',
  robots: 'noindex, nofollow',
}

export default function AdminBlockPage() {
  return (
    <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-serif text-ink">Block Time / Manual Booking</h1>
          <a href="/admin/login" className="text-sm text-charcoal/60 hover:text-teal">Logout</a>
        </div>
        <AdminBlockClient />
      </div>
    </div>
  )
}
