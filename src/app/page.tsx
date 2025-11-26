'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GraduationCap } from 'lucide-react'
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
  const [darkMode, setDarkMode] = useState(false)
  const { signIn, signUp, user, error: authError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
    
    // Load dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      const isDark = savedDarkMode === 'true'
      setDarkMode(isDark)
      document.documentElement.classList.toggle('dark', isDark)
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
          } catch (apiError) {
            // API mentés sikertelen
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
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark' : ''}`} style={{background: darkMode ? 'linear-gradient(135deg, #1f2937, #111827)' : 'linear-gradient(135deg, #eff6ff, #e0e7ff)'}}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const newDarkMode = !darkMode
            setDarkMode(newDarkMode)
            document.documentElement.classList.toggle('dark', newDarkMode)
            localStorage.setItem('darkMode', newDarkMode.toString())
          }}
          className="fixed top-4 right-4 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800"
        >
          {darkMode ? '☀️' : '🌙'}
        </Button>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Luminé</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Békéscsabai SZC Nemes Tihamér Technikum</p>
          </div>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Fiók</CardTitle>
            <CardDescription className="dark:text-gray-300">Jelentkezz be vagy regisztrálj</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
              <button 
                type="button"
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin ? 'bg-white dark:bg-gray-600 shadow-sm dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Bejelentkezés
              </button>
              <button 
                type="button"
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin ? 'bg-white dark:bg-gray-600 shadow-sm dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Regisztráció
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
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
                <Label htmlFor="password" className="dark:text-gray-200">Jelszó</Label>
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
                    <Label htmlFor="fullName" className="dark:text-gray-200">Teljes név</Label>
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
                    <Label htmlFor="studentId" className="dark:text-gray-200">Oktatási azonosító</Label>
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
                <div className="text-red-600 dark:text-red-400 text-sm text-center">
                  {error || authError}
                </div>
              )}
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-md px-8 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-4"
              >
                {loading ? (isLogin ? 'Bejelentkezés...' : 'Regisztráció...') : (isLogin ? 'Bejelentkezés' : 'Regisztráció')}
              </button>
            </form>
            

            

          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}