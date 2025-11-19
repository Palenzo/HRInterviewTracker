import * as React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { FiltersBar } from '@/components/forms/filters-bar'
import { DataTable } from '@/components/table/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { type Candidate } from '@/types'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { useCollection } from '@/hooks/useFirestore'
import { where } from 'firebase/firestore'

function paramsToFilters(sp: URLSearchParams) {
  return {
    query: sp.get('q') || '',
    college: sp.get('college') || '',
    round: sp.get('round') || '',
    status: sp.get('status') || '',
    company: sp.get('company') || '',
    role: sp.get('role') || '',
  }
}

export default function CandidatesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const [filters, setFilters] = React.useState(() => paramsToFilters(searchParams))
  const navigate = useNavigate()
  const { data: candidates, loading } = useCollection<Candidate>('candidates')
  const { data: blColleges = [] } = useCollection<any>('blacklistedColleges')
  const blSet = React.useMemo(()=> new Set((blColleges || []).map((b: any)=> b.college)), [blColleges])
  const data = React.useMemo(() => (candidates || []).filter((c: Candidate) => {
    const q = filters.query.toLowerCase()
    return (
      (!filters.query || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) &&
      (!filters.college || c.college === filters.college) &&
      (!filters.round || c.currentRound === filters.round) &&
      (!filters.status || c.status === filters.status) &&
      (!filters.company || (c as any).company === filters.company) &&
      (!filters.role || (c as any).role === filters.role) &&
      !(c as any).blacklisted && !(c as any).collegeBlacklisted && !blSet.has(c.college)
    )
  }), [candidates, filters, blSet])

  const columns = React.useMemo<ColumnDef<Candidate>[]>(() => [
    { header: 'Name', accessorKey: 'name', cell: ({ row }) => <Link className="text-blue-600 underline-offset-2 hover:underline" to={`/candidate/${row.original.id}`}>{row.original.name}</Link> },
    { header: 'Company', accessorKey: 'company' as any },
    { header: 'Role', accessorKey: 'role' as any },
    { header: 'College', accessorKey: 'college' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Current Round', accessorKey: 'currentRound' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Actions', enableSorting: false as any, cell: ({ row }) => <div className="flex gap-2"><Link to={`/candidate/${row.original.id}`} className="rounded-2xl border px-3 py-1.5 text-sm hover:bg-[hsl(var(--muted))]">View</Link></div> }
  ], [navigate])

  const uniqueColleges = Array.from(new Set((candidates || []).map((c: Candidate)=>c.college))).filter(Boolean) as string[]
  const uniqueRounds = Array.from(new Set((candidates || []).map((c: Candidate)=>c.currentRound))).filter(Boolean) as string[]
  const uniqueCompanies = Array.from(new Set((candidates || []).map((c: any)=>c.company))).filter(Boolean) as string[]
  const uniqueRoles = Array.from(new Set((candidates || []).map((c: any)=>c.role))).filter(Boolean) as string[]
  // Keep URL in sync with filters so views are shareable
  React.useEffect(() => {
    if (location.pathname !== '/candidates') return
    const sp = new URLSearchParams()
    if (filters.query) sp.set('q', filters.query)
    if (filters.college) sp.set('college', filters.college)
    if (filters.round) sp.set('round', filters.round)
    if (filters.status) sp.set('status', filters.status)
    if (filters.company) sp.set('company', filters.company)
    if (filters.role) sp.set('role', filters.role)
    const next = sp.toString()
    const current = searchParams.toString()
    if (next !== current) {
      setSearchParams(sp, { replace: true })
    }
  }, [filters, searchParams, setSearchParams, location.pathname])

  return (
    <PageContainer>
      <div className="space-y-4">
        <FiltersBar
          colleges={uniqueColleges}
          rounds={uniqueRounds}
          statuses={["Applied","Shortlisted","Interviewing","Selected","Rejected"]}
          companies={uniqueCompanies}
          roles={uniqueRoles}
          initial={filters}
          onChange={(f: { query: string; college: string; round: string; status: string; company: string; role: string })=> setFilters(f)}
        />
        {/* Active filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {([['company','Company'],['role','Role'],['college','College'],['round','Round'],['status','Status']] as Array<[keyof typeof filters,string]>).map(([key,label])=>{
            const val = (filters as any)[key]
            if (!val) return null
            return (
              <button
                key={String(key)}
                className="inline-flex w-auto items-center gap-1 whitespace-nowrap rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                onClick={()=> setFilters(prev=> ({ ...prev, [key]: '' }))}
              >
                <span className="text-slate-600">{label}:</span>
                <span>{val}</span>
                <X size={12} aria-hidden className="text-slate-500" />
              </button>
            )
          })}
          {filters.query && (
            <button
              className="inline-flex w-auto items-center gap-1 whitespace-nowrap rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              onClick={()=> setFilters(prev=> ({ ...prev, query: '' }))}
            >
              <span className="text-slate-600">Search:</span>
              <span>{filters.query}</span>
              <X size={12} aria-hidden className="text-slate-500" />
            </button>
          )}
          {(filters.query || filters.college || filters.round || filters.status || filters.company || filters.role) && (
            <button className="rounded-full border px-3 py-1 text-xs" onClick={()=> setFilters({ query: '', college: '', round: '', status: '', company: '', role: '' })}>Clear all</button>
          )}
        </div>
        {loading ? <div>Loading...</div> : <DataTable columns={columns} data={data} />}
      </div>
    </PageContainer>
  )
}
