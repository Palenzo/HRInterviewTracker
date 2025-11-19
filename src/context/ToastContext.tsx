import React, { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { X } from 'lucide-react'

export type Toast = {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'destructive' | 'info'
}

type ToastContextType = {
  toast: (t: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setItems((prev: Toast[]) => [...prev, { id, ...t }])
    setTimeout(() => setItems((prev: Toast[]) => prev.filter((i: Toast) => i.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map((t: Toast) => (
          <div key={t.id} className={cn(
            'glass rounded-2xl px-4 py-3 shadow-md min-w-[260px] border',
            t.variant === 'success' && 'border-emerald-200/60',
            t.variant === 'destructive' && 'border-rose-200/60',
            t.variant === 'info' && 'border-blue-200/60'
          )}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {t.title && <div className="font-medium text-slate-800">{t.title}</div>}
                {t.description && <div className="text-sm text-slate-600">{t.description}</div>}
              </div>
              <button aria-label="Dismiss toast" className="text-slate-500 hover:text-slate-700" onClick={() => setItems((prev: Toast[])=>prev.filter((i: Toast)=>i.id!==t.id))}>
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() { return useContext(ToastContext) }
