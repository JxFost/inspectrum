import { sql } from '@/lib/db'
import AssignClient from './AssignClient'

export const metadata = {
  title: 'Assign Report — Admin',
  robots: 'noindex, nofollow',
}

export default async function AssignReportPage({ params }) {
  const { reportId } = await params
  const db = sql()

  // Fetch the pending report
  const reports = await db`
    SELECT * FROM pending_reports WHERE id = ${reportId}
  `
  const report = reports[0]

  if (!report) {
    return (
      <div className="bg-cream pt-32 pb-20 px-5 min-h-screen">
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="text-2xl font-serif text-ink mb-4">Report not found.</h1>
          <a href="/admin/inspections" className="text-teal hover:text-amber">Back to dashboard</a>
        </div>
      </div>
    )
  }

  if (report.resolved_at) {
    return (
      <div className="bg-cream pt-32 pb-20 px-5 min-h-screen">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
          <h1 className="text-2xl font-serif text-ink mb-4">Already assigned.</h1>
          <a href="/admin/inspections" className="text-teal hover:text-amber">Back to dashboard</a>
        </div>
      </div>
    )
  }

  // Fetch recent inspections for the dropdown
  const inspections = await db`
    SELECT id, inspection_number, customer_name, address, service, start_at
    FROM inspections
    WHERE status != 'cancelled'
    ORDER BY start_at DESC
    LIMIT 50
  `

  const serialized = {
    reportId: report.id,
    fileName: report.file_name,
    fileUrl: report.file_url,
    recipientEmail: report.recipient_email,
    subject: report.subject,
    inspections: inspections.map((i) => ({
      id: i.id,
      inspectionNumber: i.inspection_number,
      customerName: i.customer_name,
      address: i.address,
      service: i.service,
      date: i.start_at?.toISOString?.() || i.start_at,
    })),
  }

  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-12 px-5 lg:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="hero-eyebrow justify-center">Admin</div>
          <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] mb-2">
            Assign <em className="italic text-amber">report.</em>
          </h1>
        </div>
      </header>

      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[50vh]">
        <div className="max-w-[600px] mx-auto">
          <AssignClient data={serialized} />
        </div>
      </section>
    </>
  )
}
