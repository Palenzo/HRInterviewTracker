import * as React from 'react'
import { cn } from '@/utils/cn'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn('h-10 w-full rounded-2xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm shadow-sm outline-none focus-visible:ring-2', className)} {...props}>
    {children}
  </select>
))
Select.displayName = 'Select'
