export function toICSDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

export function buildICS({
  title,
  start,
  end,
  description,
  location
}: {
  title: string
  start: Date
  end: Date
  description?: string
  location?: string
}) {
  const dtStamp = toICSDate(new Date())
  const dtStart = toICSDate(start)
  const dtEnd = toICSDate(end)
  const uid = `${Math.random().toString(36).slice(2)}@hr-interview-tracker`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HR Interview Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(title)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : undefined,
    location ? `LOCATION:${escapeICS(location)}` : undefined,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean) as string[]
  const content = lines.join('\r\n')
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  return { content, blob, url, filename: 'interview.ics' }
}

function escapeICS(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/, '\\,').replace(/;/g, '\\;')
}
