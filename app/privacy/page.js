import { OFFICE_PHONE, OFFICE_EMAIL, OFFICE_ADDRESS } from '@/lib/constants'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Inspectrum Inspections collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  const lastUpdated = 'May 25, 2026'

  return (
    <div className="bg-cream pt-32 pb-20 px-5 lg:px-8">
      <div className="max-w-[720px] mx-auto">
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-serif text-ink mb-4">Privacy Policy</h1>
        <p className="text-sm text-charcoal/60 mb-10">Last updated: {lastUpdated}</p>

        <div className="prose-inspectrum space-y-8 text-[0.95rem] text-charcoal leading-[1.7]">
          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Who We Are</h2>
            <p>
              Inspectrum Inspections (&ldquo;Inspectrum,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a home inspection company based in {OFFICE_ADDRESS}. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Information We Collect</h2>
            <p className="font-semibold text-ink mb-2">Information you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, phone number (when booking an inspection or contacting us)</li>
              <li>Property address and details (street address, city, state, ZIP code, square footage, year built)</li>
              <li>Payment information (processed securely through Square — we do not store credit card numbers)</li>
              <li>Real estate agent information (if booking through an agent)</li>
              <li>Any additional information you provide via our contact form or during the inspection process</li>
              <li>Customer portal account information (email address used for login)</li>
            </ul>
            <p className="font-semibold text-ink mt-4 mb-2">Information collected automatically:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browser type, operating system, and device information</li>
              <li>IP address and approximate location</li>
              <li>Pages visited, time spent on pages, and referring URLs</li>
              <li>Google Analytics data (anonymized usage patterns)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To schedule, confirm, and manage your home inspection appointment</li>
              <li>To send you booking confirmations, reminders, and follow-up communications</li>
              <li>To process payments and send invoices through Square</li>
              <li>To deliver your inspection report</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To improve our website and services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">How We Share Your Information</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium text-ink">Square</span> — for payment processing</li>
              <li><span className="font-medium text-ink">Resend</span> — for sending transactional emails</li>
              <li><span className="font-medium text-ink">Google</span> — for calendar scheduling, analytics, and address autocomplete</li>
              <li><span className="font-medium text-ink">Vercel</span> — for website hosting and secure file storage (inspection reports)</li>
              <li><span className="font-medium text-ink">Neon</span> — for secure database hosting (customer accounts and inspection records)</li>
              <li><span className="font-medium text-ink">Your real estate agent</span> — if they booked the inspection on your behalf</li>
              <li><span className="font-medium text-ink">Legal authorities</span> — if required by law, subpoena, or court order</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Data Security</h2>
            <p>
              We use industry-standard security measures to protect your information. Our website uses HTTPS encryption. Payment processing is handled entirely by Square — we never see or store your credit card information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Cookies and Tracking</h2>
            <p>
              We use Google Analytics to understand how visitors use our website. This service uses cookies to collect anonymized usage data. You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-teal hover:text-amber">Google Analytics Opt-out Browser Add-on</a>.
            </p>
            <p className="mt-2">
              We also use session cookies for admin authentication and customer portal login. These cookies are essential for accessing secure areas of the site and do not track visitors. Customer portal sessions use a secure, single-use magic link sent to your email — no password is stored.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at <a href={`mailto:${OFFICE_EMAIL}`} className="text-teal hover:text-amber">{OFFICE_EMAIL}</a> or call <a href={`tel:${OFFICE_PHONE.replace(/\D/g, '')}`} className="text-teal hover:text-amber">{OFFICE_PHONE}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Data Retention</h2>
            <p>
              We retain your booking and inspection records for a reasonable period to fulfill our business obligations and comply with applicable laws. Payment records are retained as required for tax and accounting purposes. Inspection reports are stored securely and remain accessible through your customer portal indefinitely. Customer portal accounts and session data are retained until you request deletion. You may request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page indicates when it was last revised. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none space-y-1 mt-2">
              <li>Email: <a href={`mailto:${OFFICE_EMAIL}`} className="text-teal hover:text-amber">{OFFICE_EMAIL}</a></li>
              <li>Phone: <a href={`tel:${OFFICE_PHONE.replace(/\D/g, '')}`} className="text-teal hover:text-amber">{OFFICE_PHONE}</a></li>
              <li>Address: {OFFICE_ADDRESS}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
