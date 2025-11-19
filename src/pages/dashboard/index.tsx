import { PageContainer } from '@/components/layout/PageContainer'
import { useMemo } from 'react'
import { StatCard } from '@/components/cards/stat-card'
import { AnalyticsCard } from '@/components/cards/analytics-card'
import { type InterviewEvent, type Candidate } from '@/types'
import { useCollection } from '@/hooks/useFirestore'
import { CalendarDays, FileUp, ListChecks, Users } from 'lucide-react'

function WeekAgenda({ events }: { events: InterviewEvent[] }) {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const grouped = useMemo(() => {
    const m = new Map<string, InterviewEvent[]>()
    for (const ev of events) {
      const arr = m.get(ev.date) || []
      arr.push(ev)
      m.set(ev.date, arr)
    }
    return m
  }, [events])
  const fmt = (d: Date) => d.toISOString().slice(0,10)
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
      {days.map(d => (
        <div key={d.toISOString()} className="rounded-2xl border bg-white p-3 shadow-sm">
          <div className="mb-2 text-xs text-slate-500">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
          <div className="text-sm font-medium">{d.getDate()}</div>
          <div className="mt-2 space-y-2">
            {(grouped.get(fmt(d)) ?? []).map((ev: InterviewEvent) => (
              <div key={ev.id} className="rounded-xl border bg-slate-50 p-2 text-xs">
                <div className="font-medium">{ev.candidateName}</div>
                <div className="text-slate-600">{ev.start} - {ev.end} • {ev.round}</div>
              </div>
            ))}
            {!(grouped.get(fmt(d)) ?? []).length && (
              <div className="text-xs text-slate-400">No events</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data: candidates = [], loading: loadingC } = useCollection<Candidate>('candidates')
  const { data: interviews = [], loading: loadingI } = useCollection<InterviewEvent>('interviews')

  const totalCandidates = candidates.length
  const totalColleges = Array.from(new Set((candidates as Candidate[]).map((c: Candidate)=>c.college))).filter(Boolean).length
  const today = new Date()
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + (6 - today.getDay()))
  const fmt = (d: Date) => d.toISOString().slice(0,10)
  const upcomingWeek = interviews.filter((e: InterviewEvent) => e.date >= fmt(today) && e.date <= fmt(weekEnd))

  const byRound = candidates.reduce<Record<string, number>>((acc: Record<string, number>, c: Candidate) => { acc[c.currentRound] = (acc[c.currentRound]||0)+1; return acc }, {})
  const byStatus = candidates.reduce<Record<string, number>>((acc: Record<string, number>, c: Candidate) => { acc[c.status] = (acc[c.status]||0)+1; return acc }, {})

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Candidates" value={totalCandidates} icon={<Users/>} />
        <StatCard label="Total Colleges" value={totalColleges} icon={<CalendarDays/>} />
        <StatCard label="Upcoming Interviews" value={upcomingWeek.length} icon={<ListChecks/>} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsCard title="This Week" loading={loadingI}>
            <WeekAgenda events={interviews} />
          </AnalyticsCard>
        </div>
        <div className="space-y-4">
          <AnalyticsCard title="Candidates by Round" loading={loadingC}>
            <div className="text-sm text-slate-600">
              {Object.keys(byRound).length ? Object.entries(byRound).map(([k,v]) => `${k}: ${v}`).join(' • ') : 'No data'}
            </div>
          </AnalyticsCard>
          <AnalyticsCard title="Candidates by Status" loading={loadingC}>
            <div className="text-sm text-slate-600">
              {Object.keys(byStatus).length ? Object.entries(byStatus).map(([k,v]) => `${k}: ${v}`).join(' • ') : 'No data'}
            </div>
          </AnalyticsCard>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a href="/upload" className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3"><FileUp/><div className="font-medium">Upload Sheet</div></div>
          <div className="text-sm text-slate-600">Import candidate list</div>
        </a>
        <a href="/rounds" className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3"><ListChecks/><div className="font-medium">Manage Rounds</div></div>
          <div className="text-sm text-slate-600">Set up interview flow</div>
        </a>
        <a href="/schedule" className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3"><CalendarDays/><div className="font-medium">Schedule Interview</div></div>
          <div className="text-sm text-slate-600">Create meetings quickly</div>
        </a>
      </div>
    </PageContainer>
  )
}
