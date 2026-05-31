import EmailsClient from './EmailsClient'

export const metadata = {
  title: 'Admin — Email Previews',
  robots: 'noindex, nofollow',
}

export default function EmailPreviewsPage() {
  return (
    <div className="min-h-screen bg-cream pt-8 pb-12 px-5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif text-ink mb-2">Email Previews</h1>
        <p className="text-sm text-charcoal/60 mb-8">All automated emails the system sends. Click to preview with sample data.</p>
        <EmailsClient />
      </div>
    </div>
  )
}
