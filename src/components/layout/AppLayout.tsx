import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  if (loading) return <div className="grid h-screen place-items-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="grid h-screen grid-rows-[auto,1fr] lg:grid-cols-[260px,1fr] lg:grid-rows-1">
      <aside className="hidden lg:block border-r border-[hsl(var(--border))] bg-[hsl(var(--background))]"><Sidebar /></aside>
      <div className="flex flex-col">
        <Topbar onLogoClick={() => navigate('/')} />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full overflow-y-auto bg-[hsl(var(--background))] p-4 lg:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}

export default AppLayout
