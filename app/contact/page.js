import ContactClient from './ContactClient'

export const metadata = {
  title: 'Contact Inspectrum Inspections',
  description:
    'Schedule a home inspection in Evergreen, Denver Metro, or Boulder. Call (303) 697-0990 or fill out the form. We typically respond within a few hours.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Inspectrum Inspections',
    description: 'Call (303) 697-0990 or fill out the form. We typically respond within a few hours.',
    url: 'https://evergreeninspections.com/contact',
  },
}

export default function ContactPage() {
  return <ContactClient />
}
