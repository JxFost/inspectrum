import { sql } from '@/lib/db'
import CustomersClient from './CustomersClient'

export const metadata = {
  title: 'Customers — Admin',
  robots: 'noindex, nofollow',
}

export default async function CustomersPage() {
  const db = sql()

  const customers = await db`
    SELECT
      c.id, c.name, c.email, c.phone, c.created_at, c.last_login,
      COUNT(DISTINCT i.id) AS inspection_count,
      COUNT(DISTINCT ir.id) AS report_count,
      MAX(i.start_at) AS last_inspection
    FROM customers c
    LEFT JOIN inspections i ON LOWER(i.email) = LOWER(c.email) AND i.status != 'cancelled'
    LEFT JOIN inspection_reports ir ON ir.inspection_id = i.id
    WHERE c.email IS NOT NULL AND c.email != '' AND c.email LIKE '%@%.%'
      AND c.name IS NOT NULL AND c.name != '' AND LENGTH(c.name) < 50
    GROUP BY c.id
    ORDER BY c.name ASC
  `

  const serialized = customers.map((c) => ({
    id: c.id,
    name: c.name || '—',
    email: c.email,
    phone: c.phone || '',
    inspectionCount: parseInt(c.inspection_count, 10) || 0,
    reportCount: parseInt(c.report_count, 10) || 0,
    lastInspection: c.last_inspection?.toISOString?.() || c.last_inspection || null,
    createdAt: c.created_at?.toISOString?.() || c.created_at,
    lastLogin: c.last_login?.toISOString?.() || c.last_login || null,
  }))

  return (
    <div className="min-h-screen bg-cream pt-8 pb-12 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif text-ink mb-1">Customers</h1>
            <p className="text-sm text-charcoal/60">{serialized.length} customer{serialized.length !== 1 ? 's' : ''} on file</p>
          </div>
        </div>
        <CustomersClient customers={serialized} />
      </div>
    </div>
  )
}
