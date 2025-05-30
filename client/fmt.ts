export function fmtDate(d?: string): string {
  if (!d) return 'N/A'
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function fmtTimestamp(t?: number) {
  if (t === undefined) return '--:--'
  const m = Math.floor(t / 60 | 0), s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function fmtKey(k: string) { return k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }

export function fmtValue(v: any) { return typeof v === 'object' ? JSON.stringify(v) : String(v) }

export function fmtName(firstName?: string, lastName?: string): string {
  if (!(firstName && lastName)) return "[Unnamed Contact]"
  if (!lastName) return firstName
  return `${firstName} ${lastName}`
}
