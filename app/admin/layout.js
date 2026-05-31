'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const isLogin = pathname === '/admin/login'

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`flex-1 pt-14 lg:pt-0 transition-all duration-200 ${collapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        {children}
      </main>
    </div>
  )
}
