import * as React from 'react'
import { cn } from '@/utils/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2', className)} {...props} />
))
Textarea.displayName = 'Textarea'
