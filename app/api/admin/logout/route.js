import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect(new URL('/admin/login', process.env.PUBLIC_SITE_URL || 'http://localhost:3000'))
  response.cookies.set('admin_session', '', { maxAge: 0, path: '/' })
  return response
}
