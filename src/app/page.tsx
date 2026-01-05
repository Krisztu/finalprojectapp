'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp, user, error: authError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Email és jelszó szükséges')
      return
    }

    if (!isLogin && (!fullName || !studentId)) {
      setError('Teljes név és oktatási azonosító szükséges')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        const userCredential = await signUp(email, password)
        if (userCredential.user) {
          try {
            const availableClasses = ['12.A', '12.B']
            const assignedClass = availableClasses[Math.floor(Math.random() * availableClasses.length)]

            const userData = {
              uid: userCredential.user.uid,
              email: email,
              fullName: fullName,
              studentId: studentId,
              role: 'student',
              class: assignedClass
            }

            const response = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData)
            })

            if (response.ok) {
              const result = await response.json()
              alert(`Regisztráció sikeres!\nOsztály: ${assignedClass}\n${result.lessonsAdded || ''}`)
            } else {
              alert('Felhasználó létrehozása sikertelen')
            }
          } catch (apiError) {
            alert('Felhasználó mentése sikertelen, de a fiók létrejött')
          }
        }
      }
    } catch (error: any) {
      setError(isLogin ? 'Hibás email vagy jelszó' : 'Regisztráció sikertelen')
    } finally {
      setLoading(false)
    }
  }

  if (user) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-4 group hover:scale-110 transition-transform duration-300">
            <GraduationCap className="h-10 w-10 text-primary group-hover:text-blue-500 transition-colors" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gradient pb-2">Luminé</h1>
          <p className="text-lg text-muted-foreground font-medium">Békéscsabai SZC Nemes Tihamér Technikum</p>
        </div>

        <GlassCard variant="panel" className="border-t-white/40">
          <div className="flex w-full bg-black/5 dark:bg-black/20 rounded-xl p-1 mb-8 backdrop-blur-sm">
            <button
              type="button"
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${isLogin
                  ? 'bg-white dark:bg-white/10 shadow-md text-primary dark:text-white scale-100'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              onClick={() => setIsLogin(true)}
            >
              Bejelentkezés
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${!isLogin
                  ? 'bg-white dark:bg-white/10 shadow-md text-primary dark:text-white scale-100'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              onClick={() => setIsLogin(false)}
            >
              Regisztráció
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 font-medium ml-1">Email cím</Label>
              <Input
                id="email"
                type="email"
                placeholder="pelda@iskola.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="glass-input h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80 font-medium ml-1">Jelszó</Label>
              <Input
                id="password"
                type="password"
                placeholder={isLogin ? "••••••••" : "Minimum 6 karakter"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
                className="glass-input h-11"
              />
            </div>
            {!isLogin && (
              <>
                <div className="space-y-2 animate-fade-in-up">
                  <Label htmlFor="fullName" className="text-foreground/80 font-medium ml-1">Teljes név</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Kovács Péter"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required={!isLogin}
                    className="glass-input h-11"
                  />
                </div>
                <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <Label htmlFor="studentId" className="text-foreground/80 font-medium ml-1">Oktatási azonosító</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="7xxxxxxxxxx"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={loading}
                    required={!isLogin}
                    className="glass-input h-11"
                  />
                </div>
              </>
            )}

            {(error || authError) && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center font-medium animate-shake">
                {error || authError}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-semibold glass-button mt-6 group"
            >
              {loading ? (
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center">
                  {isLogin ? 'Bejelentkezés' : 'Fiók létrehozása'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </GlassCard>

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Luminé Platform. Minden jog fenntartva.
        </p>
      </div>
    </div>
  )
}