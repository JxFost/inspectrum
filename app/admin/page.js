import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Admin — Inspectrum',
  robots: 'noindex, nofollow',
}

export default function AdminPage() {
  redirect('/admin/today')
}
