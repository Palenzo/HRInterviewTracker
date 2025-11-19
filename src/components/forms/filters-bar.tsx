import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/useDebounce'
import * as React from 'react'

export function FiltersBar({
  colleges,
  rounds,
  statuses,
  companies,
  roles,
  initial,
  onChange
}: {
  colleges: string[]
  rounds: string[]
  statuses: string[]
  companies: string[]
  roles: string[]
  initial?: { query: string; college: string; round: string; status: string; company: string; role: string }
  onChange: (f: { query: string; college: string; round: string; status: string; company: string; role: string }) => void
}) {
  const [query, setQuery] = React.useState('')
  const [college, setCollege] = React.useState('')
  const [round, setRound] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [company, setCompany] = React.useState('')
  const [role, setRole] = React.useState('')
  const debounced = useDebounce(query, 300)

  // Sync from initial (e.g., URL) into local state when provided/changed
  React.useEffect(() => {
    if (!initial) return
    if (initial.query !== undefined && initial.query !== query) setQuery(initial.query)
    if (initial.college !== undefined && initial.college !== college) setCollege(initial.college)
    if (initial.round !== undefined && initial.round !== round) setRound(initial.round)
    if (initial.status !== undefined && initial.status !== status) setStatus(initial.status)
    if (initial.company !== undefined && initial.company !== company) setCompany(initial.company)
    if (initial.role !== undefined && initial.role !== role) setRole(initial.role)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.query, initial?.college, initial?.round, initial?.status, initial?.company, initial?.role])

  React.useEffect(() => {
    onChange({ query: debounced, college, round, status, company, role })
  }, [debounced, college, round, status, company, role, onChange])

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
      <Input placeholder="Search candidates" value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setQuery(e.target.value)} />
      <Select value={college} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setCollege(e.target.value)}>
        <option value="">All Colleges</option>
        {colleges.map(c=> <option key={c}>{c}</option>)}
      </Select>
      <Select value={round} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setRound(e.target.value)}>
        <option value="">All Rounds</option>
        {rounds.map(r=> <option key={r}>{r}</option>)}
      </Select>
      <Select value={status} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        {statuses.map(s=> <option key={s}>{s}</option>)}
      </Select>
      <Select value={company} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setCompany(e.target.value)}>
        <option value="">All Companies</option>
        {companies.map(c=> <option key={c}>{c}</option>)}
      </Select>
      <Select value={role} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setRole(e.target.value)}>
        <option value="">All Roles</option>
        {roles.map(r=> <option key={r}>{r}</option>)}
      </Select>
    </div>
  )
}
