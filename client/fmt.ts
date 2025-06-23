import { getTimezoneFlag } from "@shared/dates"

type DateTimeParts = Record<Intl.DateTimeFormatPartTypes, string>

export function dateTimeParts(date: Date, timezone?: string): DateTimeParts {
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...(timezone && { timeZone: timezone }),
  })
  return Object.fromEntries(
    dateFormatter
      .formatToParts(date)
      .map(p => [p.type, p.value])
  ) as DateTimeParts
}

export function fmtDate(date: Date, timezone?: string): string {
  const parts = dateTimeParts(date, timezone)
  return `${parts.day} ${parts.month} ${parts.hour}:${parts.minute}`
}

export function fmtDateLong(date: Date, timezone?: string): string {
  const parts = dateTimeParts(date, timezone)
  let result = `${parts.weekday}, ${parts.day} ${parts.month} ${parts.hour}:${parts.minute}`
  if (timezone) result += ` (${getTimezoneFlag(timezone)} ${timezone})`
  return result
}

export function fmtTimestamp(t?: number) {
  if (t === undefined) return '--:--'
  const m = Math.floor(t / 60), s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function fmtDuration(t?: number) {
  if (t === undefined) return ''
  const m = Math.floor(t / 60), s = Math.floor(t % 60)
  return m > 0
    ? `${m} minute${m > 1 ? 's' : ''}`
    : `${s} second${s !== 1 ? 's' : ''}`
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
