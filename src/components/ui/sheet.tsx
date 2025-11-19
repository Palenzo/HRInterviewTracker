import * as React from 'react'
import { cn } from '@/utils/cn'

export function Sheet({ open, onOpenChange, side = 'right', children }: { open: boolean, onOpenChange: (v: boolean)=>void, side?: 'left' | 'right', children: React.ReactNode }) {
  return (
    <div className={cn('fixed inset-0 z-40 transition', open ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={open ? 'false' : 'true'}
    >
      <div className={cn('absolute inset-0 bg-slate-900/30 transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={() => onOpenChange(false)} />
      <div className={cn('absolute top-0 h-full w-80 glass shadow-soft transition-transform',
        side === 'right' ? 'right-0' : 'left-0',
        open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full'
      )}>
        {children}
      </div>
    </div>
  )
}
