import { Link, useLocation } from 'react-router-dom'
import { Calendar, Home, Upload, Users, ListChecks, Bell, Shield } from 'lucide-react'
import { cn } from '@/utils/cn'

const items = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/upload', label: 'Upload Sheet', icon: Upload },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/rounds', label: 'Rounds', icon: ListChecks },
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/notifications', label: 'Notifications', icon: Bell }
  ,{ to: '/admin/colleges', label: 'Admin', icon: Shield }
]

export function Sidebar() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 px-2">
          <div className="text-xs tracking-wide text-slate-500">Interview Drive Manager</div>
        </div>
        <nav className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={cn('flex items-center gap-3 rounded-2xl px-3 py-2 text-sm hover:bg-slate-100', pathname === to ? 'bg-slate-900 text-white hover:bg-slate-900' : 'text-slate-700')}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-2 text-xs text-slate-400">v0.1.0</div>
    </div>
  )
}
