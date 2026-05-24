import ContactClient from './ContactClient'
import { OFFICE_PHONE, OFFICE_EMAIL, OFFICE_ADDRESS } from '@/lib/constants'

export const metadata = {
  title: 'Contact Inspectrum Inspections',
  description:
    `Schedule a home inspection in Evergreen, Denver Metro, or Boulder. Call ${process.env.OFFICE_PHONE || '(303) 697-0990'} or fill out the form. We typically respond within a few hours.`,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Inspectrum Inspections',
    description: `Call ${process.env.OFFICE_PHONE || '(303) 697-0990'} or fill out the form. We typically respond within a few hours.`,
    url: 'https://evergreeninspections.com/contact',
  },
}

export default function ContactPage() {
  return <ContactClient officePhone={OFFICE_PHONE} officeEmail={OFFICE_EMAIL} officeAddress={OFFICE_ADDRESS} />
}
