export const metadata = {
  title: 'Admin — Email Previews',
  robots: 'noindex, nofollow',
}

const TEMPLATES = [
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
  {
    id: 'digest',
    name: 'Daily Morning Digest',
    description: "Sent to Harry each morning with today's schedule, addresses, access info, and distances.",
    trigger: 'Daily cron (12pm UTC / 6am MT)',
  },
]

export default function EmailPreviewsPage() {
  return (
    <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif text-ink mb-2">Email Previews</h1>
        <p className="text-sm text-charcoal/60 mb-8">Preview all automated emails with sample data. Click to open in a new tab.</p>

        <div className="space-y-4">
          {TEMPLATES.map((t) => (
            <a
              key={t.id}
              href={`/api/preview-email?template=${t.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-paper border border-line rounded-sm p-5 no-underline hover:border-teal hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-ink mb-1">{t.name}</h2>
                  <p className="text-sm text-charcoal/70 mb-2">{t.description}</p>
                  <span className="inline-block text-[0.7rem] uppercase tracking-wider text-teal font-semibold bg-teal/10 px-2 py-0.5 rounded">
                    {t.trigger}
                  </span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-charcoal/30 shrink-0 mt-1">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
