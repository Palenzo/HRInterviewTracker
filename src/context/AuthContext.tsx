import * as React from 'react'
import { listenAuth, signInWithGoogle, signOut } from '@/firebase'
import type { User } from 'firebase/auth'

export const AuthContext = React.createContext<{ user: User | null; loading: boolean; signIn: () => Promise<void>; signOut: () => Promise<void> }>({ user: null, loading: true, signIn: async ()=>{}, signOut: async ()=>{} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const unsub = listenAuth((u) => { setUser(u); setLoading(false) })
    return () => unsub()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn: signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return React.useContext(AuthContext)
}
