import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/useDebounce'
import * as React from 'react'

export function FiltersBar({
  colleges,
  rounds,
  statuses,
  onChange
}: {
  colleges: string[]
  rounds: string[]
  statuses: string[]
  onChange: (f: { query: string; college: string; round: string; status: string }) => void
}) {
  const [query, setQuery] = React.useState('')
  const [college, setCollege] = React.useState('')
  const [round, setRound] = React.useState('')
  const [status, setStatus] = React.useState('')
  const debounced = useDebounce(query, 300)

  React.useEffect(() => {
    onChange({ query: debounced, college, round, status })
  }, [debounced, college, round, status, onChange])

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <Input placeholder="Search candidates" value={query} onChange={(e)=>setQuery(e.target.value)} />
      <Select value={college} onChange={(e)=>setCollege(e.target.value)}>
        <option value="">All Colleges</option>
        {colleges.map(c=> <option key={c}>{c}</option>)}
      </Select>
      <Select value={round} onChange={(e)=>setRound(e.target.value)}>
        <option value="">All Rounds</option>
        {rounds.map(r=> <option key={r}>{r}</option>)}
      </Select>
      <Select value={status} onChange={(e)=>setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        {statuses.map(s=> <option key={s}>{s}</option>)}
      </Select>
    </div>
  )
}
