import * as React from 'react'
import { cn } from '@/utils/cn'

export function Calendar({ value, onChange, className }: { value?: string, onChange?: (v: string)=>void, className?: string }) {
  return (
    <input aria-label="Date"
      type="date"
      className={cn('h-10 w-full rounded-2xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm shadow-sm outline-none focus-visible:ring-2', className)}
      value={value}
      onChange={(e)=>onChange?.(e.target.value)}
    />
  )
}
