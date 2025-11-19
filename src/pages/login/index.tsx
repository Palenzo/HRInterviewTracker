import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg"><path d="M21.35 11.1H12v2.9h5.3c-.23 1.5-1.8 4.3-5.3 4.3-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.3 14.7 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-8.8 0-.6-.07-1-.15-1.5Z" fill="#4285F4"/></svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, signIn } = useAuth()
  const { toast } = useToast()
  if (user) {
    // Already signed in -> go home
    navigate('/')
  }
  return (
    <div className="grid h-screen place-items-center bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md space-y-6 text-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-2">
          <div className="text-2xl font-semibold">Interview Drive Manager</div>
          <div className="text-slate-600">Manage, track and schedule interviews effortlessly.</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
          <Button className="w-full gap-2 rounded-2xl" onClick={async () => {
            try {
              await signIn()
              navigate('/')
            } catch (e: any) {
              const msg = e?.message || 'Google sign-in failed'
              toast({
                title: 'Sign-in error',
                description: msg + '\nCheck: Auth > Sign-in method (enable Google), Authorized domains include localhost, and .env has correct Firebase keys. Restart dev server after .env changes.',
                variant: 'destructive'
              })
            }
          }}> <GoogleIcon /> Continue with Google </Button>
        </motion.div>
        <motion.div initial={{ y: 0 }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
          <svg className="mx-auto h-24 w-24 text-blue-200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M50.6,-56.2C64.8,-44.6,74.6,-27.2,77.7,-8.7C80.7,9.8,77.1,29.5,66.2,43.6C55.3,57.7,37.1,66.2,18.2,73.1C-0.7,80.1,-20.4,85.5,-37,79.6C-53.7,73.8,-67.3,56.8,-74.2,38.3C-81,19.9,-81.1,0,-75.1,-16.8C-69.1,-33.6,-56.9,-47.3,-42.3,-59.3C-27.8,-71.2,-13.9,-81.4,2.1,-83.8C18.1,-86.2,36.2,-80.8,50.6,-56.2Z" transform="translate(100 100)" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
