import * as React from 'react'
import { cn } from '@/utils/cn'

export function Avatar({ name, className }: { name: string, className?: string }) {
  const initials = name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()
  return (
    <div className={cn('flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700', className)} aria-label={`Avatar for ${name}`}>
      <span className="text-sm font-medium">{initials}</span>
    </div>
  )
}
