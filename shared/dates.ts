import type { DateString } from "./types"

const fmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
export const toISO = (d: Date): DateString => d.toISOString().slice(0, 10) as DateString
export const fromISO = (s: DateString) => new Date(s + 'T00:00:00')
export const label = (d: Date) => fmt.format(d)
export const labelRange = (s: Date, e: Date) => `${label(s)} – ${label(e)}`
export const prevDay = (n: number) => {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - n)
}
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0)
