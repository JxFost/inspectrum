import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validatePortalSession } from '@/lib/db-customers'
import ProfileClient from './ProfileClient'

export const metadata = {
  title: 'Your Profile — Inspectrum',
  robots: 'noindex, nofollow',
}

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('portal_session')?.value

  if (!sessionToken) redirect('/portal')
  const customer = await validatePortalSession(sessionToken)
  if (!customer) redirect('/portal?error=expired')

  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-12 px-5 lg:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="hero-eyebrow justify-center">Customer Portal</div>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] mb-4">
            Your <em className="italic text-amber">profile.</em>
          </h1>
        </div>
      </header>

      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[50vh]">
        <div className="max-w-[500px] mx-auto">
          <ProfileClient
            name={customer.name || ''}
            email={customer.email || ''}
            phone={customer.phone || ''}
          />
        </div>
      </section>
    </>
  )
}
