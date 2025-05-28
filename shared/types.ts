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
  timezone?: string
}

export type Contact = {
  id: string
  timezone?: string
  metadata: Record<string, any>
  retryLimit: number
  retryCount: number
  phone: string
  firstName: string
  lastName: string
  queuedAt: string
  scheduledAt?: string
  calls: CallMetadata[]
  rawJsonStr: string
  status: string
}

export type CallMessage = {
  content: string
  speaker: string
  timestamp: number
}
