'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, UserCredential, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<UserCredential>
  logout: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener')
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthProvider: Auth state changed', user ? 'User logged in' : 'User logged out')
      setUser(user)
      setLoading(false)
    }, (error) => {
      console.error('AuthProvider: Auth state change error', error)
      setError(error.message)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Attempting sign in for', email)
      setError(null)
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log('AuthProvider: Sign in successful', result.user.uid)
    } catch (error: any) {
      console.error('AuthProvider: Sign in error', error)
      setError(error.message)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Attempting sign up for', email)
      setError(null)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      console.log('AuthProvider: Sign up successful', result.user.uid)
      return result
    } catch (error: any) {
      console.error('AuthProvider: Sign up error', error)
      setError(error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      console.log('AuthProvider: Attempting logout')
      setError(null)
      await signOut(auth)
      console.log('AuthProvider: Logout successful')
    } catch (error: any) {
      console.error('AuthProvider: Logout error', error)
      setError(error.message)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)