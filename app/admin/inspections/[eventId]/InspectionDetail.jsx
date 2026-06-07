'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import PricingBlock from '@/components/PricingBlock'

const TIMEZONE = 'America/Denver'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 pb-3 border-b border-line last:border-0 last:pb-0">
      <div className="text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/60 font-semibold">{label}</div>
      <div className="text-ink font-medium text-sm">{value}</div>
    </div>
  )
}

const REPORT_TYPES = [
  { value: 'inspection', label: 'Inspection Report' },
  { value: 'radon', label: 'Radon Report' },
  { value: 'sewer', label: 'Sewer Scope Report' },
  { value: 'addendum', label: 'Addendum / Amendment' },
  { value: 'other', label: 'Other' },
]

const REPORT_TYPE_LABELS = Object.fromEntries(REPORT_TYPES.map((t) => [t.value, t.label]))

export default function InspectionDetail({ inspection, reports, agreement, emailLog = [] }) {
  const [uploadState, setUploadState] = useState('idle')
  const [reportType, setReportType] = useState('inspection')
  const [summary, setSummary] = useState('')
  const [notify, setNotify] = useState(true)
  const [uploadResult, setUploadResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [currentReports, setCurrentReports] = useState(reports)
  const fileRef = useRef(null)
  const [deleteState, setDeleteState] = useState('idle') // idle | confirming | deleting | deleted
  const [deleteError, setDeleteError] = useState(null)
  const [resendState, setResendState] = useState('idle') // idle | sending | sent | error
  const [resendError, setResendError] = useState(null)

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    if (!file.type.includes('pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setUploadState('uploading')
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('inspectionId', inspection.inspectionId)
    formData.append('reportType', reportType)
    formData.append('summary', summary)
    formData.append('notify', notify ? 'true' : 'false')

    try {
      const res = await fetch('/api/admin/upload-report', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Upload failed.')
        setUploadState('idle')
        return
      }

      setUploadResult(data)
      setUploadState('done')
      setCurrentReports((prev) => [
        {
          id: Date.now().toString(),
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSizeBytes: file.size,
          reportType,
          uploadedAt: new Date().toISOString(),
          notifiedAt: data.notified ? new Date().toISOString() : null,
        },
        ...prev,
      ])
      fileRef.current.value = ''
      setSummary('')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setUploadState('idle')
    }
  }

  return (
    <>
      {/* Inspection details */}
      <div className="bg-paper p-8 rounded-sm border border-line mb-8">
        <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">Inspection Details</div>
        <div className="space-y-3">
          <DetailRow label="Customer" value={inspection.customerName} />
          <DetailRow label="Service" value={inspection.service} />
          <DetailRow label="Date" value={formatDate(inspection.startISO)} />
          <DetailRow label="Time" value={`${formatTime(inspection.startISO)} – ${formatTime(inspection.endISO)}`} />
          <DetailRow label="Address" value={inspection.address} />
          <DetailRow label="Email" value={inspection.email} />
          <DetailRow label="Phone" value={inspection.phone} />
          <DetailRow label="Payment" value={inspection.paymentStatus} />
          <DetailRow label="Source" value={inspection.source} />
        </div>
      </div>

      {/* Listing Agent */}
      {(inspection.listingAgentName || inspection.orderedBy) && (
        <div className="bg-paper p-8 rounded-sm border border-line mb-8">
          <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">Agent Info</div>
          <div className="space-y-3">
            {inspection.orderedBy && <DetailRow label="Ordered By" value={inspection.orderedBy} />}
            {inspection.listingAgentName && <DetailRow label="Listing Agent" value={inspection.listingAgentName} />}
            {inspection.listingAgentPhone && (
              <DetailRow label="Phone" value={
                <a href={`tel:${inspection.listingAgentPhone.replace(/[^+\d]/g, '')}`} className="text-teal hover:text-amber no-underline">
                  {inspection.listingAgentPhone}
                </a>
              } />
            )}
            {inspection.listingAgentEmail && (
              <DetailRow label="Email" value={
                <a href={`mailto:${inspection.listingAgentEmail}`} className="text-teal hover:text-amber no-underline">
                  {inspection.listingAgentEmail}
                </a>
              } />
            )}
          </div>
        </div>
      )}

      {/* Agreement */}
      <div className="bg-paper p-8 rounded-sm border border-line mb-8">
        <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">Agreement</div>
        {agreement?.signedAt ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center text-sm font-bold">✓</div>
            <div>
              <div className="text-sm text-ink font-medium">Signed by {agreement.signatureName} ({agreement.initials})</div>
              <div className="text-xs text-charcoal/50">{new Date(agreement.signedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
        ) : agreement ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-amber font-medium">Sent — awaiting signature</div>
              <div className="text-xs text-charcoal/50">Sent {agreement.sentAt ? new Date(agreement.sentAt).toLocaleDateString('en-US') : ''}</div>
            </div>
            <a href={`/agreement/${agreement.token}`} target="_blank" rel="noopener noreferrer" className="text-xs text-teal hover:text-amber no-underline font-semibold">
              View link →
            </a>
          </div>
        ) : (
          <p className="text-sm text-charcoal/50">No agreement created for this inspection.</p>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-8">
        <PricingBlock
          service={inspection.service}
          radonAddOn={inspection.radonAddOn}
          sewerScope={inspection.sewerScope}
          tripChargeCents={inspection.tripChargeCents}
          distanceMiles={inspection.distanceMiles}
        />
      </div>

      {/* Reports */}
      <div className="bg-paper p-8 rounded-sm border border-line mb-8">
        <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">
          Reports {currentReports.length > 0 && `(${currentReports.length})`}
        </div>

        {currentReports.length > 0 && (
          <div className="space-y-3 mb-6">
            {currentReports.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-cream rounded-sm border border-line">
                <div>
                  <div className="flex items-center gap-2">
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-teal hover:text-amber no-underline">
                      {r.fileName}
                    </a>
                    <span className="text-[0.6rem] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-charcoal/10 text-charcoal/60">
                      {REPORT_TYPE_LABELS[r.reportType] || 'Report'}
                    </span>
                  </div>
                  <div className="text-xs text-charcoal/50 mt-1">
                    {formatBytes(r.fileSizeBytes)} · Uploaded {new Date(r.uploadedAt).toLocaleDateString('en-US')}
                    {r.notifiedAt && ' · Customer notified'}
                  </div>
                </div>
                <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal hover:text-amber no-underline font-semibold">
                  View
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Upload form */}
        {inspection.inspectionId && (
          <>
            {uploadState === 'done' && (
              <div className="bg-teal/10 border border-teal/30 rounded-sm p-4 mb-4 text-sm text-teal">
                Report uploaded{uploadResult?.notified ? ' and customer notified' : ''}.
              </div>
            )}

            {errorMsg && (
              <div className="bg-amber/10 border border-amber rounded-sm p-4 mb-4 text-sm text-ink">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="min-w-0 w-full sm:flex-1 text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-teal file:text-white hover:file:bg-teal-deep file:cursor-pointer"
                />
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-line rounded-sm text-sm text-ink bg-cream outline-none focus:border-teal"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal/60 uppercase tracking-wider mb-1.5">Key findings summary (optional)</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="A short, plain-English summary of the most important findings — shown to the customer in their portal."
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm text-ink bg-cream outline-none focus:border-teal resize-y"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-charcoal/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="accent-teal"
                />
                Email customer when uploaded
                {!inspection.email && <span className="text-amber text-xs">(no email on file)</span>}
              </label>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploadState === 'uploading'}
                className="w-full py-3 bg-teal text-white rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-teal-deep transition-colors disabled:opacity-50"
              >
                {uploadState === 'uploading' ? 'Uploading...' : 'Upload Report'}
              </button>
            </div>
          </>
        )}

        {!inspection.inspectionId && (
          <p className="text-sm text-charcoal/50">This inspection is not in the database yet. Run a backfill to enable uploads.</p>
        )}
      </div>

      {/* Emails */}
      <div className="bg-paper p-8 rounded-sm border border-line mb-8">
        <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">
          Emails {emailLog.length > 0 && `(${emailLog.length})`}
        </div>

        {emailLog.length > 0 && (
          <div className="space-y-2 mb-4">
            {emailLog.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 bg-cream rounded-sm text-sm">
                <div>
                  <span className="text-ink font-medium">{log.template || log.subject}</span>
                  <span className="text-charcoal/40 text-xs ml-2">→ {log.toEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    log.status === 'sent' ? 'bg-teal/15 text-teal'
                    : log.status === 'failed' ? 'bg-red-100 text-red-700'
                    : 'bg-charcoal/10 text-charcoal/50'
                  }`}>
                    {log.status === 'sent' ? 'Sent' : log.status === 'failed' ? 'Failed' : log.status}
                  </span>
                  <span className="text-xs text-charcoal/40">{new Date(log.sentAt).toLocaleDateString('en-US')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {emailLog.length === 0 && (
          <p className="text-sm text-charcoal/50 mb-4">No emails logged for this inspection.</p>
        )}

        {inspection.email && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={resendState === 'sending'}
              onClick={async () => {
                setResendState('sending')
                setResendError(null)
                try {
                  const res = await fetch('/api/admin/resend-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId: inspection.eventId }),
                  })
                  if (!res.ok) {
                    const d = await res.json()
                    setResendError(d.error || 'Failed to send.')
                    setResendState('idle')
                    return
                  }
                  setResendState('sent')
                  setTimeout(() => setResendState('idle'), 3000)
                } catch {
                  setResendError('Network error.')
                  setResendState('idle')
                }
              }}
              className="text-sm text-teal hover:text-amber cursor-pointer bg-transparent border border-teal rounded-sm px-3 py-1.5 font-semibold transition-colors disabled:opacity-50"
            >
              {resendState === 'sending' ? 'Sending...' : resendState === 'sent' ? 'Sent ✓' : 'Resend Confirmation Email'}
            </button>
            {resendError && <span className="text-xs text-red-600">{resendError}</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-12">
        <Link href="/admin/inspections" className="text-sm text-teal hover:text-amber no-underline font-semibold">
          ← Back to dashboard
        </Link>
        <Link href={`/admin/inspections/${inspection.eventId}/invoice`} className="text-sm text-teal hover:text-amber no-underline font-semibold">
          Send Invoice
        </Link>
      </div>

      {/* Remove inspection */}
      {deleteState === 'deleted' ? (
        <div className="bg-paper border border-line rounded-sm p-8 text-center">
          <p className="text-sm text-charcoal mb-4">Inspection removed.</p>
          <Link href="/admin/inspections" className="text-sm text-teal hover:text-amber no-underline font-semibold">
            Back to dashboard
          </Link>
        </div>
      ) : (
        <div className="border-t border-line pt-8">
          <div className="text-xs uppercase tracking-[0.28em] text-red-600 font-semibold mb-3">Danger Zone</div>
          <p className="text-sm text-charcoal/60 mb-4">
            Removing this inspection will delete it from the calendar and mark it as cancelled in the database. This cannot be undone.
          </p>

          {deleteState === 'idle' && (
            <button
              type="button"
              onClick={() => setDeleteState('confirming')}
              className="text-sm text-red-600 hover:text-red-800 cursor-pointer bg-transparent border border-red-200 rounded-sm px-4 py-2 transition-colors"
            >
              Remove this inspection
            </button>
          )}

          {deleteState === 'confirming' && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-6">
              <p className="text-sm text-ink font-medium mb-4">
                Are you sure you want to remove this inspection for <strong>{inspection.customerName}</strong>?
              </p>
              {deleteError && (
                <p className="text-sm text-red-600 mb-3">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setDeleteState('deleting')
                    setDeleteError(null)
                    try {
                      const res = await fetch('/api/admin/delete-inspection', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ eventId: inspection.eventId }),
                      })
                      if (!res.ok) {
                        const d = await res.json()
                        setDeleteError(d.error || 'Failed to remove.')
                        setDeleteState('confirming')
                        return
                      }
                      setDeleteState('deleted')
                    } catch {
                      setDeleteError('Network error.')
                      setDeleteState('confirming')
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-red-700 transition-colors"
                >
                  {deleteState === 'deleting' ? 'Removing...' : 'Yes, Remove It'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteState('idle')}
                  className="px-4 py-2 bg-transparent border border-line text-ink rounded-sm font-semibold text-sm cursor-pointer hover:bg-paper transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
