export type CallMetadata = {
  id: string
  dialedAt: string
  result: string
  attempt: number
  duration: number
  metadata: Record<string, any>
  fromPhone: string
  direction: string
  recordingId?: string
}

export type Contact = {
  id: string
  timezone: string
  metadata: Record<string, any>
  retryLimit: number
  retryCount: number
  phone: string
  firstName: string
  lastName: string
  queuedAt: string
  scheduledAt?: string
  calls: CallMetadata[]
  status: string
}

export type CallMessage = {
  content: string
  speaker: string
  timestamp: number
  debugJSON?: string
}

export type ReportField = {
  id: string
  label: string
  type: 'row' | 'column' | 'custom'
}

export const PREDEFINED_FIELDS: ReportField[] = [
  { type: 'row', id: 'day', label: 'Day' },
  { type: 'row', id: 'day-of-week', label: 'Day of the week' },
  { type: 'row', id: 'hour-of-day', label: 'Hour of the day' },
  { type: 'row', id: 'attempt_num', label: 'Call attempt number' },
  { type: 'row', id: 'agent_number', label: "Agent's phone" },
  { type: 'row', id: 'contact_source', label: "Lead Source" },
  { type: 'column', id: 'answered', label: 'Answered' },
  { type: 'column', id: 'identified', label: 'Identified' },
  { type: 'column', id: 'converted', label: 'Converted' },
  { type: 'column', id: 'qualified', label: 'Qualified' },
  { type: 'column', id: 'contacts', label: 'Contacts' },
  { type: 'column', id: 'calls_made', label: 'Calls' },
  { type: 'column', id: 'calls_connected', label: 'Calls connected' },
]

export type DateString = `${number}-${string}-${string}`
export type DateRange = [DateString, DateString]
