import { Menu, Moon, Sun, Bell } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { Sheet } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { useState } from 'react'

export function Topbar({ onLogoClick }: { onLogoClick?: () => void }) {
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" aria-label="Open Menu" onClick={() => setOpen(true)}><Menu /></button>
        <button onClick={onLogoClick} className="text-sm font-semibold">Interview Drive Manager</button>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-2xl border border-[hsl(var(--border))] px-3 py-1.5 text-sm hover:bg-[hsl(var(--muted))]">Upload Sheet</button>
        <button onClick={toggle} className="rounded-2xl p-2 hover:bg-[hsl(var(--muted))]" aria-label="Toggle theme">{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button>
        <button className="rounded-2xl p-2 hover:bg-[hsl(var(--muted))]" aria-label="Notifications"><Bell size={18}/></button>
      </div>
      <Sheet open={open} onOpenChange={setOpen} side="left">
        <div className="p-3"><Sidebar /></div>
      </Sheet>
    </header>
  )
}
