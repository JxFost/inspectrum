import { Suspense } from 'react'
import ManageClient from './ManageClient'

export const metadata = {
  title: 'Manage Your Booking — Inspectrum Inspections',
  description: 'View, cancel, or reschedule your home inspection appointment.',
  robots: { index: false },
}

export default function ManagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex items-center gap-3 text-charcoal/60">
          <div className="w-5 h-5 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    }>
      <ManageClient />
    </Suspense>
  )
}
