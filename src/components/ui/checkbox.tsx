import * as React from 'react'
import { cn } from '@/utils/cn'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => (
  <input ref={ref} type="checkbox" className={cn('h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-2', className)} {...props} />
))
Checkbox.displayName = 'Checkbox'
