import * as React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/context/ToastContext'
import { useCollection, addItem } from '@/hooks/useFirestore'
import { sendEmail, sendWhatsApp } from '@/services/notifications'
import { buildICS } from '@/utils/ics'
import { type Candidate } from '@/types'
import { useSearchParams } from 'react-router-dom'

function makeJitsiLink(topic?: string) {
  const random = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g,'')
  const name = (topic || 'Interview').replace(/\s+/g,'-').slice(0,32)
  return `https://meet.jit.si/${name}-${random.slice(0,8)}`
}

export default function SchedulePage() {
  const { data: candidates = [] } = useCollection<Candidate>('candidates')
  const [search] = useSearchParams()
  const [candidate, setCandidate] = React.useState('')
  const [interviewers, setInterviewers] = React.useState<string>('')
  const [date, setDate] = React.useState<string>('')
  const [start, setStart] = React.useState('10:00')
  const [end, setEnd] = React.useState('10:45')
  const [meet, setMeet] = React.useState('')
  const { toast } = useToast()

  React.useEffect(() => {
    const id = search.get('candidateId')
    if (id && !candidate) {
      // ensure it exists
      if (candidates.some((c: Candidate) => c.id === id)) setCandidate(id)
    }
  }, [search, candidates, candidate])

  const [provider, setProvider] = React.useState<'google'|'jitsi'>('jitsi')
  const generateMeet = () => {
    if (provider === 'google') {
      // Opens Meet quick-create in a new tab; user shares link back
      window.open('https://meet.new', '_blank', 'noopener,noreferrer')
    }
    const link = makeJitsiLink(candidates.find((c: Candidate)=>c.id===candidate)?.name)
    setMeet(link)
  }
  function downloadICS() {
    const cand = candidates.find((c: Candidate)=>c.id === candidate)
    if (!cand || !date) { toast({ title: 'Select candidate and date', variant: 'destructive' }); return }
    const [sh, sm] = (start || '10:00').split(':').map(Number)
    const [eh, em] = (end || '10:45').split(':').map(Number)
    const startDate = new Date(date + 'T00:00:00')
    startDate.setHours(sh, sm, 0, 0)
    const endDate = new Date(date + 'T00:00:00')
    endDate.setHours(eh, em, 0, 0)
    const { url, filename } = buildICS({
      title: `Interview – ${cand.name}`,
      start: startDate,
      end: endDate,
      description: `Round: ${cand.currentRound || '-'}\nMeet: ${meet || '-'}`,
      location: meet || 'Online'
    })
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(()=> URL.revokeObjectURL(url), 3000)
  }
  const confirm = async () => {
    const cand = candidates.find((c: Candidate)=>c.id === candidate)
    if (!cand) { toast({ title: 'Select a candidate', variant: 'destructive' }); return }
    await addItem('interviews', { candidateId: cand.id, candidateName: cand.name, date, start, end, round: cand.currentRound, meet } as any)
    toast({ title: 'Interview scheduled', description: 'Saved to calendar', variant: 'success' })
    // Try lightweight notifications
    if (cand.email) await sendEmail(cand.email, 'Interview Scheduled', `Hi ${cand.name}, your interview is scheduled on ${date} from ${start} to ${end}. Meet: ${meet}`)
    if (cand.phone) sendWhatsApp(cand.phone, `Interview scheduled on ${date} ${start}-${end}. Meet: ${meet}`)
  }

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Schedule Interview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-sm">Candidate</div>
                <Select value={candidate} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setCandidate(e.target.value)} aria-label="Select candidate">
                  <option value="">Select</option>
                  {candidates.map((c: Candidate) => <option key={c.id} value={c.id as string}>{c.name}</option>)}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-sm">Interviewers</div>
                <Input placeholder="Add interviewer emails" value={interviewers} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setInterviewers(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <div className="mb-1 text-sm">Date</div>
                <Calendar value={date} onChange={setDate} />
              </div>
              <div>
                <div className="mb-1 text-sm">Start</div>
                <Input type="time" value={start} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setStart(e.target.value)} />
              </div>
              <div>
                <div className="mb-1 text-sm">End</div>
                <Input type="time" value={end} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setEnd(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="meet-provider" className="text-sm text-slate-500">Provider</label>
                <select id="meet-provider" aria-label="Meeting provider" className="rounded-2xl border px-3 py-2 text-sm border-[hsl(var(--input))] bg-[hsl(var(--card))]" value={provider} onChange={(e)=> setProvider(e.target.value as any)}>
                  <option value="jitsi">Jitsi (free)</option>
                  <option value="google">Google Meet (manual)</option>
                </select>
              </div>
              <div className="flex grow items-center gap-2">
                <Button variant="secondary" onClick={generateMeet}>Generate meeting link</Button>
                <Input readOnly value={meet} placeholder="Meet link" />
                <Button variant="outline" onClick={downloadICS}>Download .ics</Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={confirm}>Confirm</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-slate-500">Candidate: </span>{candidates.find((c: Candidate)=>c.id===candidate)?.name || '-'}.</div>
            <div><span className="text-slate-500">Date: </span>{date || '-'}</div>
            <div><span className="text-slate-500">Time: </span>{start} - {end}</div>
            <div className="truncate"><span className="text-slate-500">Meet: </span>{meet || '-'}</div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
