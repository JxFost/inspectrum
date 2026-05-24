'use client'

import { useRouter } from 'next/navigation'

const OPTIONS = [
  { value: '2w', label: '2 Weeks' },
  { value: '1m', label: '1 Month' },
  { value: '2m', label: '2 Months' },
  { value: '3m', label: '3 Months' },
]

export default function RangeSelector({ currentRange }) {
  const router = useRouter()

  return (
    <select
      value={currentRange || '2w'}
      onChange={(e) => {
        const val = e.target.value
        router.push(val === '2w' ? '/admin/inspections' : `/admin/inspections?range=${val}`)
      }}
      className="bg-cream border border-line px-3 py-1.5 text-sm text-ink rounded-sm outline-none focus:border-teal cursor-pointer"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
