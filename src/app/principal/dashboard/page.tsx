'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { LogOut, Sun, Moon } from 'lucide-react'
import { CustomAlert } from '@/shared/components/ui/custom-alert'

export default function PrincipalDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [alertData, setAlertData] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ isOpen: false, title: '', message: '', type: 'info' })

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title: string = 'Értesítés') => {
    setAlertData({ isOpen: true, title, message, type })
  }

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      const isDark = savedDarkMode === 'true'
      setDarkMode(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    }

    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/statistics')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Adatok betöltési hiba:', error)
      showAlert('Hiba az adatok betöltésekor', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Adatok betöltése...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors pb-20">
      <CustomAlert
        isOpen={alertData.isOpen}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-bold text-sm sm:text-lg">L</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gradient">Luminé</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDarkMode = !darkMode
                  setDarkMode(newDarkMode)
                  document.documentElement.classList.toggle('dark', newDarkMode)
                  localStorage.setItem('darkMode', newDarkMode.toString())
                }}
                className="rounded-full hover:bg-white/10 w-8 h-8 sm:w-10 sm:h-10"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  {user?.email}
                </span>
                <span className="text-xs text-muted-foreground">Igazgató</span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => { logout(); router.push('/'); }} className="rounded-full shadow-md text-xs sm:text-sm px-2 sm:px-4">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kilépés</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="hidden md:flex overflow-x-auto w-full glass p-2 rounded-xl gap-1">
            <TabsTrigger value="overview" className="text-sm whitespace-nowrap px-4">Áttekintés</TabsTrigger>
            <TabsTrigger value="users" className="text-sm whitespace-nowrap px-4">Felhasználók</TabsTrigger>
            <TabsTrigger value="grades" className="text-sm whitespace-nowrap px-4">Jegyek</TabsTrigger>
            <TabsTrigger value="attendance" className="text-sm whitespace-nowrap px-4">Mulasztások</TabsTrigger>
            <TabsTrigger value="behavior" className="text-sm whitespace-nowrap px-4">Viselkedés</TabsTrigger>
          </TabsList>

          {/* Áttekintés */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Összes Felhasználó" value={stats.today.users.total} color="blue" />
                <StatCard title="Diákok" value={stats.today.users.students} color="green" />
                <StatCard title="Tanárok" value={stats.today.users.teachers} color="orange" />
                <StatCard title="Szülők" value={stats.today.users.parents} color="purple" />
              </div>
            )}
          </TabsContent>

          {/* Felhasználók */}
          <TabsContent value="users" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatCard title="Összes" value={stats.today.users.total} color="blue" />
                <StatCard title="Diákok" value={stats.today.users.students} color="green" />
                <StatCard title="Tanárok" value={stats.today.users.teachers} color="orange" />
                <StatCard title="Szülők" value={stats.today.users.parents} color="purple" />
                <StatCard title="DJ" value={stats.today.users.djs} color="pink" />
              </div>
            )}
          </TabsContent>

          {/* Jegyek */}
          <TabsContent value="grades" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Összes Jegy" value={stats.today.grades.total} color="blue" />
                <StatCard title="Átlag" value={stats.today.grades.average.toFixed(2)} color="green" />
                <StatCard title="5-ös Jegyek" value={stats.today.grades.byGrade[5]} color="purple" />
              </div>
            )}
          </TabsContent>

          {/* Mulasztások */}
          <TabsContent value="attendance" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Jelenlét %" value={`${stats.today.attendance.percentage.toFixed(1)}%`} color="green" />
                <StatCard title="Jelen" value={stats.today.attendance.present} color="blue" />
                <StatCard title="Hiányzó" value={stats.today.attendance.absent} color="red" />
                <StatCard title="Igazolt" value={stats.today.attendance.excused} color="orange" />
              </div>
            )}
          </TabsContent>

          {/* Viselkedés */}
          <TabsContent value="behavior" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Pozitív" value={stats.today.behavior.positive} color="green" />
                <StatCard title="Negatív" value={stats.today.behavior.negative} color="red" />
                <StatCard title="Átlag Pont" value={stats.today.behavior.average.toFixed(2)} color="blue" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatCard({ title, value, color = 'blue' }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800'
  }

  return (
    <Card className={`border ${colorClasses[color]} dark:bg-slate-800`}>
      <CardContent className="p-4">
        <p className="text-xs text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold mt-1 dark:text-white">{value}</p>
      </CardContent>
    </Card>
  )
}
