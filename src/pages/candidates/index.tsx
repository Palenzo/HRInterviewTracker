import * as React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { FiltersBar } from '@/components/forms/filters-bar'
import { DataTable } from '@/components/table/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { type Candidate } from '@/types'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '@/hooks/useFirestore'
import { where } from 'firebase/firestore'

export default function CandidatesPage() {
  const [filters, setFilters] = React.useState({ query: '', college: '', round: '', status: '' })
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
      !(c as any).blacklisted && !(c as any).collegeBlacklisted && !blSet.has(c.college)
    )
  }), [candidates, filters, blSet])

  const columns = React.useMemo<ColumnDef<Candidate>[]>(() => [
    { header: 'Name', accessorKey: 'name', cell: ({ row }) => <button className="text-blue-600" onClick={()=>navigate(`/candidate/${row.original.id}`)}>{row.original.name}</button> },
    { header: 'College', accessorKey: 'college' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Current Round', accessorKey: 'currentRound' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Actions', cell: ({ row }) => <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={()=>navigate(`/candidate/${row.original.id}`)}>View</Button></div> }
  ], [navigate])

  const uniqueColleges = Array.from(new Set((candidates || []).map((c: Candidate)=>c.college))).filter(Boolean) as string[]
  const uniqueRounds = Array.from(new Set((candidates || []).map((c: Candidate)=>c.currentRound))).filter(Boolean) as string[]
  return (
    <PageContainer>
      <div className="space-y-4">
        <FiltersBar colleges={uniqueColleges} rounds={uniqueRounds} statuses={["Applied","Shortlisted","Interviewing","Selected","Rejected"]} onChange={setFilters} />
        {loading ? <div>Loading...</div> : <DataTable columns={columns} data={data} />}
      </div>
    </PageContainer>
  )
}
