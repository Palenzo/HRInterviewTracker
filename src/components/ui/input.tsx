import * as React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn('h-10 w-full rounded-2xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm shadow-sm outline-none focus-visible:ring-2 placeholder:text-slate-400', className)}
      {...props}
    />
  )
})
Input.displayName = 'Input'
