'use client'

import { usePathname } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar />
      <main className="flex-1 lg:ml-56 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
