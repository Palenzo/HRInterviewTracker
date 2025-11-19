import * as React from 'react'
import { cn } from '@/utils/cn'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', className)} {...props} />
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Applied: 'bg-slate-100 text-slate-700 border-slate-200',
    Shortlisted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Interviewing: 'bg-blue-100 text-blue-700 border-blue-200',
    Selected: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Rejected: 'bg-rose-100 text-rose-700 border-rose-200'
  }
  return <Badge className={map[status] || 'bg-slate-100 text-slate-700 border-slate-200'}>{status}</Badge>
}
