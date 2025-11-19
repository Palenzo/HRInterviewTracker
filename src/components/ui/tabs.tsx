import * as React from 'react'
import { cn } from '@/utils/cn'

export function Tabs({ tabs, value, onChange }: { tabs: string[], value: string, onChange: (v:string)=>void }) {
  return (
    <div className="flex items-center gap-2">
      {tabs.map(t => (
        <button key={t} onClick={()=>onChange(t)} className={cn('rounded-2xl px-3 py-1.5 text-sm', value===t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}>
          {t}
        </button>
      ))}
    </div>
  )
}
