import * as React from 'react'
import { cn } from '@/utils/cn'

export function PageContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-7xl space-y-6', className)} {...props} />
}
