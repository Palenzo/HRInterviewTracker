import * as React from 'react'
import { cn } from '@/utils/cn'

export function Menubar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-2 rounded-2xl border bg-white p-1 shadow-sm', className)} {...props} />
}
