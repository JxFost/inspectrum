import SchedulerClient from './SchedulerClient'

export const metadata = {
  title: 'Schedule a Home Inspection Online',
  description:
    'Book a home inspection online — pick a date, choose a time, and we\'ll confirm by phone within a few hours. Serving Evergreen, Denver Metro, and Boulder, CO.',
  alternates: { canonical: '/schedule' },
  openGraph: {
    title: 'Schedule a Home Inspection — Inspectrum Inspections',
    description: 'Pick a date, choose a time, and we\'ll confirm by phone. Serving Evergreen, Denver Metro, and Boulder.',
    url: 'https://evergreeninspections.com/schedule',
  },
}

export default function SchedulePage() {
  return <SchedulerClient />
}
