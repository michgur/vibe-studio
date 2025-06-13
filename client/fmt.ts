const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export function fmtDate(d?: string): string {
  if (!d) return 'N/A'

  const parts = Object.fromEntries(
    dateFormatter
      .formatToParts(new Date(d))
      .map(p => [p.type, p.value])
  )
  return `${parts.day} ${parts.month} ${parts.hour}:${parts.minute}`
}

export function fmtTimestamp(t?: number) {
  if (t === undefined) return '--:--'
  const m = Math.floor(t / 60 | 0), s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function fmtKey(k: string) {
  return k
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
    .replace(/_/g, ' ') // snake_case
    .replace(/\b\w/g, l => l.toUpperCase()) // capitalize
}

export function fmtValue(v: any) { return typeof v === 'object' ? JSON.stringify(v) : String(v) }

export function fmtName(firstName?: string, lastName?: string): string {
  if (!(firstName && lastName)) return "[Unnamed Contact]"
  if (!lastName) return firstName
  return `${firstName} ${lastName}`
}
