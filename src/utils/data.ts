export type Candidate = {
  id: string
  name: string
  email: string
  phone?: string
  college: string
  currentRound: string
  status: 'Applied' | 'Shortlisted' | 'Interviewing' | 'Selected' | 'Rejected'
}

export const sampleCandidates: Candidate[] = [
  { id: '1', name: 'Aarav Patel', email: 'aarav.patel@example.com', college: 'IIT Bombay', currentRound: 'Technical 1', status: 'Interviewing' },
  { id: '2', name: 'Ananya Singh', email: 'ananya.singh@example.com', college: 'IIT Delhi', currentRound: 'HR', status: 'Shortlisted' },
  { id: '3', name: 'Rohan Mehta', email: 'rohan.mehta@example.com', college: 'BITS Pilani', currentRound: 'Technical 2', status: 'Interviewing' },
  { id: '4', name: 'Neha Gupta', email: 'neha.gupta@example.com', college: 'IIT Kanpur', currentRound: 'Offer', status: 'Selected' },
]

export const rounds = [
  'Aptitude', 'Technical 1', 'Technical 2', 'Managerial', 'HR', 'Offer'
]

export const colleges = [
  'IIT Bombay', 'IIT Delhi', 'IIT Kanpur', 'IIT Madras', 'BITS Pilani'
]

export const stats = {
  totalCandidates: 128,
  totalColleges: 18,
  upcomingInterviews: 12,
}

export type InterviewEvent = {
  id: string
  candidateId: string
  candidateName: string
  date: string // ISO
  start: string // HH:mm
  end: string // HH:mm
  round: string
}

export const sampleEvents: InterviewEvent[] = [
  { id: 'e1', candidateId: '1', candidateName: 'Aarav Patel', date: new Date().toISOString().slice(0,10), start: '10:00', end: '10:45', round: 'Technical 1' },
  { id: 'e2', candidateId: '2', candidateName: 'Ananya Singh', date: new Date().toISOString().slice(0,10), start: '11:30', end: '12:15', round: 'HR' },
]
