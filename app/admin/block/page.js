import AdminBlockClient from './AdminBlockClient'

export const metadata = {
  title: 'Admin — Block Time / Manual Booking',
  robots: 'noindex, nofollow',
}

export default function AdminBlockPage() {
  return (
    <div className="min-h-screen bg-cream pt-8 pb-12 px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-ink">New Booking</h1>
      </div>
      <AdminBlockClient />
    </div>
  )
}
