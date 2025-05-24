export type CallMetadata = {
  id: string
  time: string
  result: string
  attempt_num: number
  duration: number
  recording_url?: string
  metadata: Record<string, any>
  from_number: string
  direction: string
  twilio_sid?: string
}

export type Contact = {
  id: string
  timezone_offset: number
  metadata: Record<string, any>
  retry_limit: number
  retry_count: number
  phone: string
  first_name: string
  last_name: string
  queue_time: string
  scheduled_time?: string
  calls: CallMetadata[]
  json_str: string
  status: string
}

export type CallMessage = {
  content: string
  speaker: string
  timestamp: number
}
