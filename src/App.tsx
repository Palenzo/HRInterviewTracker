import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'
import UploadPage from '@/pages/upload'
import CandidatesPage from '@/pages/candidates'
import CandidateProfilePage from '@/pages/candidate'
import RoundsPage from '@/pages/rounds'
import SchedulePage from '@/pages/schedule'
import NotificationsPage from '@/pages/notifications'
import AdminCollegesPage from '@/pages/admin/colleges'

const Page = ({ children }: { children: React.ReactNode }) => <div className="h-full">{children}</div>

export default function App() {
  const location = useLocation()
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes location={location}>
            <Route path="/login" element={<Page><LoginPage /></Page>} />
            <Route path="/" element={<AppLayout />}> 
              <Route index element={<Page><DashboardPage /></Page>} />
              <Route path="upload" element={<Page><UploadPage /></Page>} />
              <Route path="candidates" element={<Page><CandidatesPage /></Page>} />
              <Route path="candidate/:id" element={<Page><CandidateProfilePage /></Page>} />
              <Route path="rounds" element={<Page><RoundsPage /></Page>} />
              <Route path="schedule" element={<Page><SchedulePage /></Page>} />
              <Route path="notifications" element={<Page><NotificationsPage /></Page>} />
              <Route path="admin/colleges" element={<Page><AdminCollegesPage /></Page>} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
