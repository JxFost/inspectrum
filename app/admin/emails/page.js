export const metadata = {
  title: 'Admin — Email Previews',
  robots: 'noindex, nofollow',
}

const CLIENT_EMAILS = [
  {
    id: 'receipt',
    name: 'Booking Receipt',
    description: 'Sent immediately when a customer books an inspection.',
    trigger: 'On booking confirmation',
  },
  {
    id: 'reminder',
    name: '48-Hour Reminder',
    description: 'Sent 48 hours before the scheduled inspection.',
    trigger: 'Daily cron (3pm UTC / 9am MT)',
  },
  {
    id: 'followup',
    name: 'Post-Inspection Follow-Up',
    description: 'Sent 72 hours after the inspection with a Google review request.',
    trigger: 'Daily cron (5pm UTC / 11am MT)',
  },
]

const INSPECTOR_EMAILS = [
  {
    id: 'digest',
    name: 'Daily Morning Digest',
    description: "Today's schedule with times, customer names, addresses, access info, and distances.",
    trigger: 'Daily cron (12pm UTC / 6am MT)',
  },
  {
    id: 'cancel-alert',
    name: 'Cancellation Alert',
    description: 'Immediate notification when a customer cancels. Warns if invoice was already paid.',
    trigger: 'On cancellation',
  },
  {
    id: 'monthly',
    name: 'Monthly Report',
    description: 'Last month summary: inspections, revenue, outstanding invoices, busiest days, top areas.',
    trigger: '1st of each month (2pm UTC / 8am MT)',
  },
]

function EmailCard({ t }) {
  const hasPreview = ['receipt', 'reminder', 'followup', 'digest'].includes(t.id)
  const Tag = hasPreview ? 'a' : 'div'
  const linkProps = hasPreview ? { href: `/api/preview-email?template=${t.id}`, target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Tag
      {...linkProps}
      className={`block bg-paper border border-line rounded-sm p-5 no-underline transition-all ${hasPreview ? 'hover:border-teal hover:-translate-y-0.5 cursor-pointer' : 'opacity-80'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink mb-1">{t.name}</h3>
          <p className="text-sm text-charcoal/70 mb-2">{t.description}</p>
          <span className="inline-block text-[0.7rem] uppercase tracking-wider text-teal font-semibold bg-teal/10 px-2 py-0.5 rounded">
            {t.trigger}
          </span>
        </div>
        {hasPreview && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-charcoal/30 shrink-0 mt-1">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        )}
      </div>
    </Tag>
  )
}

export default function EmailPreviewsPage() {
  return (
    <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif text-ink mb-2">Email Previews</h1>
        <p className="text-sm text-charcoal/60 mb-8">All automated emails the system sends. Click to preview with sample data.</p>

        <h2 className="text-lg font-serif text-ink mb-3 pb-2 border-b border-line">Client-Facing</h2>
        <p className="text-xs text-charcoal/50 mb-4">Sent to customers who book inspections through the website.</p>
        <div className="space-y-3 mb-10">
          {CLIENT_EMAILS.map((t) => <EmailCard key={t.id} t={t} />)}
        </div>

        <h2 className="text-lg font-serif text-ink mb-3 pb-2 border-b border-line">Inspector / Admin</h2>
        <p className="text-xs text-charcoal/50 mb-4">Sent to Harry and the operations team.</p>
        <div className="space-y-3">
          {INSPECTOR_EMAILS.map((t) => <EmailCard key={t.id} t={t} />)}
        </div>
      </div>
    </div>
  )
}
