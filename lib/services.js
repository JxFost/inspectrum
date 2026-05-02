/*
 * Service catalog for Inspectrum Inspections.
 *
 * Shared between the client UI and the booking API so that IDs, durations, and
 * names stay in sync. To add a service, add an entry here and redeploy.
 */

export const SERVICES = [
  {
    id: 'full',
    name: 'Full Home Inspection',
    desc: 'Top-to-bottom inspection of every major system. 3-4 hrs.',
    price: 'From $450',
    durationHours: 4,
  },
  {
    id: 'radon',
    name: 'Radon Testing Only',
    desc: '48-hour continuous monitor test. EPA-certified equipment.',
    price: 'From $150',
    durationHours: 1,
  },
  {
    id: 'mold',
    name: 'Mold Assessment',
    desc: 'Visual inspection with moisture mapping & thermal imaging.',
    price: 'From $250',
    durationHours: 2,
  },
  {
    id: 'pre-listing',
    name: 'Pre-Listing Inspection',
    desc: 'For sellers - find issues before buyers do.',
    price: 'From $400',
    durationHours: 3,
  },
]
