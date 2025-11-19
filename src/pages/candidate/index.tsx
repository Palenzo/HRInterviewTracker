import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type Candidate, type InterviewEvent, type Round } from '@/types'
import { useDocument, useCollection, setItem, addItem, deleteItem } from '@/hooks/useFirestore'
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { serverTimestamp, db } from '@/firebase'
import { where, orderBy, getDocs, collection, query as fsQuery, writeBatch, doc } from 'firebase/firestore'
import { sendEmail, sendWhatsApp } from '@/services/notifications'

function Steps({ steps, active, rejected }: { steps: string[]; active: number; rejected?: boolean }) {
  return (
    <div className="ml-2 pl-4">
      {steps.map((s: string, idx: number) => {
        const isDone = idx < active
        const isActive = idx === active
        const isRejected = !!rejected && isActive
        const dotColor = isRejected ? 'bg-red-600' : (isDone || isActive ? 'bg-blue-600' : 'bg-slate-300')
        const lineColor = isRejected ? 'bg-red-400' : (isDone ? 'bg-blue-400' : 'bg-slate-200')
        return (
          <div key={s} className="relative mb-4">
            <div className="flex items-center gap-2">
              <div className={`relative z-10 h-6 w-6 rounded-full ${dotColor}`} />
              <div className="text-sm font-medium">{s}</div>
            </div>
            {idx < steps.length - 1 && (
              <div className={`absolute left-[11px] top-6 h-8 w-[2px] ${lineColor}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CandidateProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: candidate } = useDocument<Candidate>('candidates', id)
  const { data: interviews = [] } = useCollection<InterviewEvent>('interviews', id ? [where('candidateId','==',id)] as any : [])
  const { data: rounds = [] } = useCollection<Round>('rounds', [orderBy('order','asc') as any])
  // Avoid composite index requirement by ordering client-side
  const { data: comments = [] } = useCollection<any>('comments', id ? [where('candidateId','==',id)] as any : [])
  const { data: history = [] } = useCollection<any>('candidateHistory', id ? [where('candidateId','==',id), orderBy('createdAt','desc') as any] as any : [])
  const { data: collegeBL = [] } = useCollection<any>('blacklistedColleges', candidate?.college ? [where('college','==', candidate.college)] as any : [])
  const defaultSteps = ['Technical 1','Technical 2','HR','Offer']
  const steps = (rounds.length ? rounds.map((r: { name: string }) => r.name) : defaultSteps)
  const activeIdx = Math.max(0, steps.indexOf(candidate?.currentRound || steps[0]))
  const isRejected = (candidate?.status === 'Rejected')
  const [openStatus, setOpenStatus] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [status, setStatus] = React.useState<Candidate['status']>('Applied')
  const [round, setRound] = React.useState<string>(steps[0])
  const [comment, setComment] = React.useState('')
  const isCollegeBlacklisted = (collegeBL?.length ?? 0) > 0
  const { data: hiddenForCollege = [] } = useCollection<any>('candidates', candidate?.college ? [where('college','==', candidate.college), where('collegeBlacklisted','==', true) as any] as any : [])

  async function batchSetCollegeFlag(college: string, flag: boolean) {
    const q = fsQuery(collection(db, 'candidates'), where('college','==', college)) as any
    const snap = await getDocs(q)
    const wb = writeBatch(db)
    snap.docs.forEach((d: any) => {
      wb.set(doc(db, 'candidates', d.id), { collegeBlacklisted: flag } as any, { merge: true })
    })
    await wb.commit()
  }

  React.useEffect(() => {
    if (candidate) {
      setStatus(candidate.status)
      setRound(candidate.currentRound)
    }
  }, [candidate])

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="text-xl font-semibold">{candidate?.name}</div>
            <div className="text-sm text-slate-600">{candidate?.email}</div>
            <div className="text-sm text-slate-600">{candidate?.phone || '+91 ••••••'}</div>
            {((candidate as any)?.resumeUrl || (candidate as any)?.Resume) ? (
              <a className="text-sm text-blue-600" href={(candidate as any).resumeUrl || (candidate as any).Resume} target="_blank" rel="noopener noreferrer">View Resume</a>
            ) : (
              <span className="text-sm text-slate-400">No resume provided</span>
            )}
            <div className="text-sm text-slate-600">
              {candidate?.college}
              {isCollegeBlacklisted && (
                <span className="ml-2 text-xs text-slate-500">Hidden: {hiddenForCollege.length}</span>
              )}
            </div>
            {(candidate as any)?.company && <div className="text-sm text-slate-600">Company: {(candidate as any).company}</div>}
            {(candidate as any)?.role && <div className="text-sm text-slate-600">Role: {(candidate as any).role}</div>}
            {(candidate as any)?.receivedAt?.toDate && (
              <div className="text-xs text-slate-500">Received: {new Date((candidate as any).receivedAt.toDate()).toLocaleString()}</div>
            )}
            {(candidate as any)?.blacklisted && <div className="text-xs text-red-600">Blacklisted</div>}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Interview Timeline</div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={()=>setOpenStatus(true)}>Update Status</Button>
                <Button variant="outline" onClick={()=> setOpenEdit(true)}>Edit Details</Button>
                <Button onClick={()=> navigate(`/schedule?candidateId=${id}`)}>Schedule Interview</Button>
                <Button variant="outline" onClick={async ()=>{
                  if (!candidate) return
                  const latest = interviews?.[0]
                  const dateStr = (latest as any)?.date || '-'
                  const startStr = (latest as any)?.start || '-'
                  const endStr = (latest as any)?.end || '-'
                  const meet = (latest as any)?.meet || ''
                  const text = `Hi ${candidate.name}, your interview is scheduled on ${dateStr} ${startStr}-${endStr}. ${meet ? 'Meet: ' + meet : ''}`
                  const proceed = window.confirm('Send notification to candidate via email/WhatsApp?')
                  if (!proceed) return
                  if ((candidate as any).email) await sendEmail((candidate as any).email, 'Interview Update', text)
                  if ((candidate as any).phone) sendWhatsApp((candidate as any).phone, text)
                }}>Notify</Button>
                <Button variant="destructive" onClick={async ()=>{ if(id){ await setItem<Candidate>('candidates', id, { status: 'Rejected' as any }); } }}>Reject</Button>
                <Button variant="destructive" onClick={async ()=>{ if(id){
                  // delete interviews for candidate then delete candidate
                  for (const ev of interviews) { if ((ev as any).id) await deleteItem('interviews', (ev as any).id) }
                  await deleteItem('candidates', id)
                  navigate('/candidates')
                }}}>Remove</Button>
                <Button variant="destructive" onClick={async ()=>{ if(id){ await setItem<Candidate>('candidates', id, { status: 'Rejected' as any, blacklisted: true as any }); } }}>Blacklist</Button>
              </div>
            </div>
            <Steps steps={steps} active={activeIdx} rejected={isRejected} />
            {history.length > 0 && (
              <div className="mt-4 space-y-1 text-sm">
                <div className="font-medium">Recent Updates</div>
                {history.slice(0,5).map((h: any) => (
                  <div key={h.id} className="text-slate-600">{new Date(h.createdAt?.toDate?.() || Date.now()).toLocaleString()} — {h.fromStatus}→{h.toStatus} • {h.fromRound}→{h.toRound}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-3 p-4">
            <div className="text-lg font-semibold">Comments</div>
            <div className="flex gap-2">
              <Input placeholder="Add a comment" value={comment} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setComment(e.target.value)} />
              <Button onClick={async ()=>{ if(id && comment.trim()){ await addItem('comments', { candidateId: id, text: comment.trim(), createdAt: serverTimestamp() }); setComment('') } }}>Add</Button>
            </div>
            <div className="space-y-2">
              {[...comments].sort((a: any, b: any)=> (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)).map((c: any)=> (
                <div key={c.id} className="rounded-xl border p-2 text-sm">
                  <div className="text-slate-600">{c.text}</div>
                  <div className="text-xs text-slate-400">{c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleString() : ''}</div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-sm text-slate-500">No comments yet.</div>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">College Actions</div>
              {isCollegeBlacklisted && (
                <div className="text-xs text-slate-500">Hidden candidates: {hiddenForCollege.length}</div>
              )}
            </div>
            {!isCollegeBlacklisted ? (
              <Button variant="destructive" onClick={async ()=>{
                if(candidate?.college){
                  const proceed = window.confirm(`Blacklist "${candidate.college}"? All its students will be hidden.`)
                  if (!proceed) return
                  await addItem('blacklistedColleges', { college: candidate.college, createdAt: serverTimestamp() })
                  if (id) await setItem<Candidate>('candidates', id, { collegeBlacklisted: true as any })
                  await batchSetCollegeFlag(candidate.college, true)
                }
              }}>Blacklist College</Button>
            ) : (
              <Button variant="secondary" onClick={async ()=>{
                if(candidate?.college){
                  const proceed = window.confirm(`Unblacklist "${candidate.college}"? All its students will become visible.`)
                  if (!proceed) return
                  for (const bl of collegeBL) { if (bl.id) await deleteItem('blacklistedColleges', bl.id) }
                  if (id) await setItem<Candidate>('candidates', id, { collegeBlacklisted: false as any })
                  await batchSetCollegeFlag(candidate.college, false)
                }
              }}>Unblacklist College</Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={openStatus} onOpenChange={setOpenStatus}>
        <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-sm">Status</div>
            <select aria-label="Select status" className="w-full rounded-xl border px-3 py-2 text-sm" value={status} onChange={(e)=> setStatus(e.target.value as Candidate['status'])}>
              <option>Applied</option>
              <option>Shortlisted</option>
              <option>Interviewing</option>
              <option>Selected</option>
              <option>Rejected</option>
            </select>
          </div>
          <div>
            <div className="mb-1 text-sm">Current Round</div>
            <select aria-label="Select current round" className="w-full rounded-xl border px-3 py-2 text-sm" value={round} onChange={(e)=> setRound(e.target.value)}>
              {steps.map((s: string) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={()=> setOpenStatus(false)}>Cancel</Button>
          <Button onClick={async ()=>{ if(id && candidate){ await setItem<Candidate>('candidates', id, { status, currentRound: round }); await addItem('candidateHistory', { candidateId: id, fromStatus: (candidate as any).status, toStatus: status, fromRound: (candidate as any).currentRound, toRound: round, createdAt: serverTimestamp() }); } setOpenStatus(false) }}>Save</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogHeader><DialogTitle>Edit Candidate</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-sm">Name</div>
            <Input value={(candidate as any)?.name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> candidate && setItem<Candidate>('candidates', candidate.id as any, { name: e.target.value } as any)} />
          </div>
          <div>
            <div className="mb-1 text-sm">Email</div>
            <Input value={(candidate as any)?.email || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> candidate && setItem<Candidate>('candidates', candidate.id as any, { email: e.target.value } as any)} />
          </div>
          <div>
            <div className="mb-1 text-sm">Phone</div>
            <Input value={(candidate as any)?.phone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> candidate && setItem<Candidate>('candidates', candidate.id as any, { phone: e.target.value } as any)} />
          </div>
          <div>
            <div className="mb-1 text-sm">College</div>
            <Input value={(candidate as any)?.college || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> candidate && setItem<Candidate>('candidates', candidate.id as any, { college: e.target.value } as any)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={()=> setOpenEdit(false)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </PageContainer>
  )
}
