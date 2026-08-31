import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseMissing, initError as initErr } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(!supabaseMissing)

  useEffect(() => {
    if (supabaseMissing) return
    let mounted = true

    const fetchProfile = async (authUser) => {
      if (!authUser || !supabase) {
        setProfile(null)
        return
      }
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, full_name')
        .eq('id', authUser.id)
        .single()
      if (mounted) {
        if (error) {
          console.warn('profile fetch error', error)
          setProfile(null)
        } else {
          setProfile(data)
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      if (mounted) {
        setUser(u)
        fetchProfile(u).finally(() => setLoading(false))
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      fetchProfile(u)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    if (!supabase) throw new Error(initErr || 'Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading, signIn, signOut,
      supabaseMissing,
      initError: initErr,
      hasClient: !!supabase,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
