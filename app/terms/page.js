import { OFFICE_PHONE, OFFICE_EMAIL, OFFICE_ADDRESS } from '@/lib/constants'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Inspectrum Inspections services and website.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  const lastUpdated = 'May 25, 2026'

  return (
    <div className="bg-cream pt-32 pb-20 px-5 lg:px-8">
      <div className="max-w-[720px] mx-auto">
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-serif text-ink mb-4">Terms of Service</h1>
        <p className="text-sm text-charcoal/60 mb-10">Last updated: {lastUpdated}</p>

        <div className="prose-inspectrum space-y-8 text-[0.95rem] text-charcoal leading-[1.7]">
          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Agreement to Terms</h2>
            <p>
              By accessing our website or scheduling an inspection with Inspectrum Inspections (&ldquo;Inspectrum,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Services</h2>
            <p>
              Inspectrum provides home inspection services including full home inspections, radon testing, mold assessments, pre-listing inspections, and commercial property inspections in the state of Colorado. Our inspections are performed in accordance with the International Association of Certified Home Inspectors (InterNACHI) Standards of Practice.
            </p>
            <p className="mt-2">
              A home inspection is a non-invasive, visual examination of a residential property. It is not a guarantee or warranty. The inspection report represents the inspector&apos;s professional opinion based on conditions observed at the time of the inspection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Booking and Scheduling</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Inspection appointments are confirmed upon scheduling through our website, phone, or third-party booking service.</li>
              <li>We will contact you by phone within a few hours of your online booking to confirm the appointment.</li>
              <li>Scheduling an inspection does not guarantee a specific inspector unless otherwise arranged.</li>
              <li>Inspection times are estimates and may vary slightly depending on property size and conditions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Cancellation Policy</h2>
            <p>
              We understand plans change. Please provide at least <span className="font-semibold text-ink">24 hours notice</span> if you need to cancel or reschedule your inspection. Cancellations made less than 24 hours before the scheduled appointment may be subject to a cancellation fee.
            </p>
            <p className="mt-2">
              You can cancel or reschedule through the manage booking link in your confirmation email, or by calling us at <a href={`tel:${OFFICE_PHONE.replace(/\D/g, '')}`} className="text-teal hover:text-amber">{OFFICE_PHONE}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Payment</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payment is due upon completion of the inspection unless otherwise arranged.</li>
              <li>We accept credit cards, debit cards, cash, check, Venmo, and Zelle.</li>
              <li>Invoices are sent electronically via Square and are due within 7 days of issuance.</li>
              <li>Prices are subject to change based on property size, age, location, and additional services requested.</li>
              <li>A trip charge may apply for properties beyond our base service radius.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Inspection Reports</h2>
            <p>
              Your inspection report will be delivered electronically on the same day as the inspection, typically within a few hours of completion. The report is for your personal use and includes photographs, descriptions of findings, and recommendations.
            </p>
            <p className="mt-2">
              Reports are stored securely and accessible through your customer portal at any time. You will receive an email notification when your report is available for download.
            </p>
            <p className="mt-2">
              The report is not a substitute for professional engineering, architectural, or other specialized evaluations. If the report identifies areas of concern, we recommend consulting with qualified specialists.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Customer Portal</h2>
            <p>
              When you book an inspection, a customer account is automatically created using your email address. You can access your customer portal to view past and upcoming inspections, download inspection reports, and manage appointments.
            </p>
            <p className="mt-2">
              Login is handled via secure magic links sent to your email — no password is required or stored. You are responsible for maintaining the security of the email account associated with your portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Limitation of Liability</h2>
            <p>
              Inspectrum&apos;s liability arising from the inspection and report shall be limited to the fee paid for the inspection. We are not responsible for conditions that were not visible or accessible at the time of inspection, or that develop after the inspection date.
            </p>
            <p className="mt-2">
              The inspection is not a guarantee that the property is free of defects. Concealed defects, latent conditions, and items specifically excluded from the scope of the inspection are not covered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Property Access</h2>
            <p>
              The client or their representative is responsible for ensuring the inspector has safe access to the property. All utilities (water, gas, electric) should be turned on at the time of inspection. The inspector will not turn on any utility that is shut off, and any systems that cannot be inspected due to lack of access will be noted in the report.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Website Use</h2>
            <p>
              The content on our website is provided for general information purposes only. While we strive to keep the information current and accurate, we make no warranties about the completeness, reliability, or accuracy of this information.
            </p>
            <p className="mt-2">
              You may not use our website for any unlawful purpose, to solicit others to perform unlawful acts, or to violate any regulations, rules, or laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Colorado, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-ink mb-3">Contact Us</h2>
            <p>
              Questions about these Terms of Service? Contact us:
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
