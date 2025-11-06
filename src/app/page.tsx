'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { demoUsers } from '@/lib/demo-users'

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
            await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: userCredential.user.uid,
                email: email,
                fullName: fullName,
                studentId: studentId,
                role: 'student'
              })
            })
          } catch (apiError) {
            console.log('API save failed, but user created')
          }
        }
      }
    } catch (error: any) {
      setError(isLogin ? 'Hibás email vagy jelszó' : 'Regisztráció sikertelen')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: string) => {
    const user = demoUsers[role as keyof typeof demoUsers]
    if (user) {
      setLoading(true)
      setError('')
      try {
        await signIn(user.email, user.password)
      } catch (error: any) {
        try {
          const userCredential = await signUp(user.email, user.password)
          if (userCredential.user) {
            try {
              await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uid: userCredential.user.uid,
                  email: user.email,
                  fullName: user.name,
                  studentId: role === 'student' ? '12345678901' : undefined,
                  role: user.role
                })
              })
            } catch (apiError) {
              console.log('API save failed, but user created')
            }
          }
        } catch (createError: any) {
          console.log('Demo user creation failed')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">GSZI APP</h1>
          <p className="mt-2 text-gray-600">Békéscsabai SZC Nemes Tihamér Technikum</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fiók</CardTitle>
            <CardDescription>Jelentkezz be vagy regisztrálj</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full bg-gray-100 rounded-lg p-1 mb-6">
              <button 
                type="button"
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Bejelentkezés
              </button>
              <button 
                type="button"
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Regisztráció
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Jelszó</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isLogin ? "Jelszó" : "Jelszó (min. 6 karakter)"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Teljes név</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Teljes név"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      required={!isLogin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Oktatási azonosító</Label>
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="Oktatási azonosító (11 számjegy)"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={loading}
                      required={!isLogin}
                    />
                  </div>
                </>
              )}
              {(error || authError) && (
                <div className="text-red-600 text-sm text-center">
                  {error || authError}
                </div>
              )}
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-md px-8 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-4"
              >
                {loading ? (isLogin ? 'Bejelentkezés...' : 'Regisztráció...') : (isLogin ? 'Bejelentkezés' : 'Regisztráció')}
              </button>
            </form>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3 text-center">Teszt fiókok:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  disabled={loading}
                  className="bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  Diák
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('teacher')}
                  disabled={loading}
                  className="bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  Tanár
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('dj')}
                  disabled={loading}
                  className="bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  DJ
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}