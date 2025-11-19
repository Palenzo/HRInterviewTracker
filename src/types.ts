export type Candidate = {
  id?: string
  name: string
  email: string
  phone?: string
  college: string
  currentRound: string
  status: 'Applied' | 'Shortlisted' | 'Interviewing' | 'Selected' | 'Rejected'
  resumeUrl?: string
  blacklisted?: boolean
  collegeBlacklisted?: boolean
}

export type InterviewEvent = {
  id?: string
  candidateId: string
  candidateName: string
  date: string
  start: string
  end: string
  round: string
}

export type Round = {
  id?: string
  name: string
  order: number
}

export type NotificationSettings = {
  emailEnabled: boolean
  whatsappEnabled: boolean
  template: string
}
