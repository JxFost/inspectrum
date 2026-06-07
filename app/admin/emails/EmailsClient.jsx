'use client'

import { useState } from 'react'

const CLIENT_EMAILS = [
  {
    id: 'receipt',
    name: 'Booking Confirmation',
    description: 'Sent immediately when a customer books. Includes agreement link and appointment details.',
    trigger: 'On booking',
  },
  {
    id: 'reminder',
    name: '24-Hour Reminder',
    description: 'Sent 24 hours before the inspection. Warns if agreement is unsigned.',
    trigger: 'Daily cron (9am MT)',
  },
  {
    id: 'followup',
    name: 'Post-Inspection Follow-Up',
    description: 'Sent 72 hours after the inspection with a Google review request.',
    trigger: 'Daily cron (11am MT)',
  },
  {
    id: 'report-ready',
    name: 'Report Ready',
    description: 'Sent when a report is uploaded. Includes download link and portal link.',
    trigger: 'On report upload',
  },
]

const ADMIN_EMAILS = [
  {
    id: 'digest',
    name: 'Daily Morning Digest',
    description: "Today's schedule with distances, drive times, unsigned agreements, and missing reports.",
    trigger: 'Daily cron (6am MT)',
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
    description: 'Last month summary: inspections, revenue, add-ons, sources, busiest days, top areas.',
    trigger: '1st of month (8am MT)',
  },
  {
    id: 'assign-report',
    name: 'Report Needs Assignment',
    description: 'Sent when an auto-imported report couldn\'t be matched to a customer.',
    trigger: 'On unmatched report import',
  },
]

const TABS = [
  { id: 'client', label: 'Client-Facing' },
  { id: 'admin', label: 'Admin / Inspector' },
]

// Client-facing pages worth previewing that aren't emails (rendered routes).
const CLIENT_PAGES = [
  {
    name: 'Service Agreement',
    description: 'The agreement clients review and sign. Preview shows every section, including the radon addendum.',
    trigger: 'Signed before inspection',
    href: '/admin/agreement-preview',
  },
]

function PreviewCard({ name, description, trigger, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-paper border border-line rounded-sm p-5 no-underline transition-all hover:border-teal hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink mb-1">{name}</h3>
          <p className="text-sm text-charcoal/70 mb-2">{description}</p>
          <span className="inline-block text-[0.7rem] uppercase tracking-wider text-amber font-semibold bg-amber/10 px-2 py-0.5 rounded">
            {trigger}
          </span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-charcoal/30 shrink-0 mt-1">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>
    </a>
  )
}

function EmailCard({ t }) {
  return (
    <a
      href={`/api/preview-email?template=${t.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-paper border border-line rounded-sm p-5 no-underline transition-all hover:border-teal hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink mb-1">{t.name}</h3>
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
  )
}

export default function EmailsClient() {
  const [tab, setTab] = useState('client')

  return (
    <>
      <div className="flex gap-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-sm border cursor-pointer transition-colors ${
              tab === t.id
                ? 'bg-teal text-white border-teal'
                : 'bg-transparent text-charcoal/60 border-line hover:border-teal hover:text-teal'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'client' && (
        <>
          <p className="text-xs text-charcoal/50 mb-4">Sent to customers who book inspections.</p>
          <div className="space-y-3">
            {CLIENT_EMAILS.map((t) => <EmailCard key={t.id} t={t} />)}
          </div>

          <p className="text-xs text-charcoal/50 mt-8 mb-4">Client-facing pages.</p>
          <div className="space-y-3">
            {CLIENT_PAGES.map((p) => <PreviewCard key={p.href} {...p} />)}
          </div>
        </>
      )}

      {tab === 'admin' && (
        <>
          <p className="text-xs text-charcoal/50 mb-4">Sent to Harry and the operations team.</p>
          <div className="space-y-3">
            {ADMIN_EMAILS.map((t) => <EmailCard key={t.id} t={t} />)}
          </div>
        </>
      )}
    </>
  )
}
