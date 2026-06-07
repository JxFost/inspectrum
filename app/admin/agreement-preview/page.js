import AgreementClient from '@/app/agreement/[token]/AgreementClient'

export const metadata = {
  title: 'Agreement Preview — Inspectrum Inspections',
  robots: 'noindex, nofollow',
}

// Admin-only preview of the client-facing agreement page, rendered with
// sample data so it can be viewed without a real DB record or token.
// Lives under /admin so the existing admin-session middleware gates it.
// Radon + sewer are enabled so every section (including the radon
// addendum) is visible. Signing here will fail harmlessly — the token
// is fake and has no matching agreement record.
export default function AgreementPreviewPage() {
  const data = {
    token: 'preview-sample-token',
    customerName: 'Jordan Sample',
    customerEmail: 'jordan@example.com',
    propertyAddress: '1732 N Marion St, Denver, CO 80218',
    service: 'Full Home Inspection',
    inspectionDate: '2026-07-30T14:00:00.000Z',
    inspectionNumber: '2026-0042',
    hasRadon: true,
    hasSewer: true,
    tripChargeCents: '3500',
    distanceMiles: '35',
  }

  return <AgreementClient data={data} />
}
