import * as React from 'react'
import { cn } from '@/utils/cn'

export function Dropdown({ trigger, children }: { trigger: React.ReactNode, children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">{trigger}</div>
      <div className={cn('absolute right-0 mt-2 min-w-[180px] rounded-2xl border bg-white p-1 shadow-lg', open ? 'block' : 'hidden')}>
        {children}
      </div>
    </div>
  )
}

export function DropdownItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('cursor-pointer rounded-xl px-3 py-2 text-sm hover:bg-slate-100', className)} {...props} />
}
