'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

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

export default function InspectionDetail({ inspection, reports, agreement }) {
  const [uploadState, setUploadState] = useState('idle') // idle | uploading | done | error
  const [notify, setNotify] = useState(true)
  const [uploadResult, setUploadResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [currentReports, setCurrentReports] = useState(reports)
  const fileRef = useRef(null)

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
          uploadedAt: new Date().toISOString(),
          notifiedAt: data.notified ? new Date().toISOString() : null,
        },
        ...prev,
      ])
      fileRef.current.value = ''
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
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-teal hover:text-amber no-underline">
                    {r.fileName}
                  </a>
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
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                className="block w-full text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-teal file:text-white hover:file:bg-teal-deep file:cursor-pointer"
              />
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

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/admin/inspections" className="text-sm text-teal hover:text-amber no-underline font-semibold">
          ← Back to dashboard
        </Link>
        <Link href={`/admin/inspections/${inspection.eventId}/invoice`} className="text-sm text-teal hover:text-amber no-underline font-semibold">
          Send Invoice
        </Link>
      </div>
    </>
  )
}
