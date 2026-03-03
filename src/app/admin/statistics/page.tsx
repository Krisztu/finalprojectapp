'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp } from 'lucide-react'

export default function AdminStatistics() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    loadStatistics()
    return () => observer.disconnect()
  }, [])

  const loadStatistics = async () => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch('/api/admin/statistics', { signal: controller.signal })
      clearTimeout(timeout)
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Statisztikák hiba:', error)
      setStats({ error: 'Adatok betöltése sikertelen' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center" style={{ color: isDark ? '#fff' : '#000' }}>Betöltés...</div>
  if (!stats || !stats.today) return <div className="p-8 text-center" style={{ color: isDark ? '#fff' : '#000' }}>Hiba: {stats?.error || 'Adatok betöltése sikertelen'}</div>

  return (
    <div className="min-h-screen p-3 sm:p-6" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', minHeight: '100vh' }}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: isDark ? '#fff' : '#000' }}>Admin Statisztikák</h1>

      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-auto min-w-full" style={{ backgroundColor: isDark ? '#1e293b' : '#f3f4f6' }}>
            <TabsTrigger value="overview" style={{ color: isDark ? '#d1d5db' : '#000' }}>Áttekintés</TabsTrigger>
            <TabsTrigger value="users" style={{ color: isDark ? '#d1d5db' : '#000' }}>Felhasználók</TabsTrigger>
            <TabsTrigger value="grades" style={{ color: isDark ? '#d1d5db' : '#000' }}>Jegyek</TabsTrigger>
            <TabsTrigger value="attendance" style={{ color: isDark ? '#d1d5db' : '#000' }}>Mulasztások</TabsTrigger>
            <TabsTrigger value="behavior" style={{ color: isDark ? '#d1d5db' : '#000' }}>Viselkedés</TabsTrigger>
          </TabsList>
        </div>

        {/* ÁTTEKINTÉS */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard title="Összes Felhasználó" value={stats.today.users.total} color="blue" isDark={isDark} />
            <StatCard title="Diákok" value={stats.today.users.students} color="green" isDark={isDark} />
            <StatCard title="Tanárok" value={stats.today.users.teachers} color="orange" isDark={isDark} />
            <StatCard title="Szülők" value={stats.today.users.parents} color="purple" isDark={isDark} />
          </div>

          <Card style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl" style={{ color: isDark ? '#fff' : '#000' }}>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Felhasználók Trendje (30 nap)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users.total" stroke="#3b82f6" name="Összes" strokeWidth={2} />
                  <Line type="monotone" dataKey="users.students" stroke="#10b981" name="Diákok" strokeWidth={2} />
                  <Line type="monotone" dataKey="users.teachers" stroke="#f59e0b" name="Tanárok" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl" style={{ color: isDark ? '#fff' : '#000' }}>Top Osztályok (Átlag szerint)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topClasses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageGrade" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FELHASZNÁLÓK */}
        <TabsContent value="users" className="space-y-4 sm:space-y-6 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            <StatCard title="Összes" value={stats.today.users.total} color="blue" isDark={isDark} />
            <StatCard title="Diákok" value={stats.today.users.students} color="green" isDark={isDark} />
            <StatCard title="Tanárok" value={stats.today.users.teachers} color="orange" isDark={isDark} />
            <StatCard title="Szülők" value={stats.today.users.parents} color="purple" isDark={isDark} />
            <StatCard title="DJ" value={stats.today.users.djs} color="pink" isDark={isDark} />
          </div>

          <Card style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl" style={{ color: isDark ? '#fff' : '#000' }}>Felhasználók Eloszlása</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Diákok', value: stats.today.users.students },
                      { name: 'Tanárok', value: stats.today.users.teachers },
                      { name: 'Szülők', value: stats.today.users.parents },
                      { name: 'DJ', value: stats.today.users.djs }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {['#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* JEGYEK */}
        <TabsContent value="grades" className="space-y-4 sm:space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <StatCard title="Összes Jegy" value={stats.today.grades.total} color="blue" isDark={isDark} />
            <StatCard title="Átlag" value={stats.today.grades.average.toFixed(2)} color="green" isDark={isDark} />
            <StatCard title="5-ös Jegyek" value={stats.today.grades.byGrade[5]} color="purple" isDark={isDark} />
          </div>

          <Card style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl" style={{ color: isDark ? '#fff' : '#000' }}>Jegyek Eloszlása</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '1-es', value: stats.today.grades.byGrade[1] },
                      { name: '2-es', value: stats.today.grades.byGrade[2] },
                      { name: '3-as', value: stats.today.grades.byGrade[3] },
                      { name: '4-es', value: stats.today.grades.byGrade[4] },
                      { name: '5-ös', value: stats.today.grades.byGrade[5] }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl" style={{ color: isDark ? '#fff' : '#000' }}>Jegyek Trendje</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="grades.average" stroke="#3b82f6" name="Átlag" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MULASZTÁSOK */}
        <TabsContent value="attendance" className="space-y-4 sm:space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard title="Jelenlét %" value={`${stats.today.attendance.percentage.toFixed(1)}%`} color="green" isDark={isDark} />
            <StatCard title="Jelen" value={stats.today.attendance.present} color="blue" isDark={isDark} />
            <StatCard title="Hiányzó" value={stats.today.attendance.absent} color="red" isDark={isDark} />
            <StatCard title="Igazolt" value={stats.today.attendance.excused} color="orange" isDark={isDark} />
          </div>

          <Card style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl" style={{ color: isDark ? '#fff' : '#000' }}>Jelenlét Trendje</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendance.percentage" stroke="#10b981" name="Jelenlét %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl" style={{ color: isDark ? '#fff' : '#000' }}>Mulasztások Eloszlása</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance.present" fill="#10b981" name="Jelen" />
                  <Bar dataKey="attendance.absent" fill="#ef4444" name="Hiányzó" />
                  <Bar dataKey="attendance.excused" fill="#f59e0b" name="Igazolt" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISELKEDÉS */}
        <TabsContent value="behavior" className="space-y-4 sm:space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <StatCard title="Pozitív" value={stats.today.behavior.positive} color="green" isDark={isDark} />
            <StatCard title="Negatív" value={stats.today.behavior.negative} color="red" isDark={isDark} />
            <StatCard title="Átlag Pont" value={stats.today.behavior.average.toFixed(2)} color="blue" isDark={isDark} />
          </div>

          <Card style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl" style={{ color: isDark ? '#fff' : '#000' }}>Viselkedés Trendje</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="behavior.positive" fill="#10b981" name="Pozitív" />
                  <Bar dataKey="behavior.negative" fill="#ef4444" name="Negatív" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, color = 'blue', isDark }: any) {
  const colors = {
    blue: { light: '#eff6ff', dark: '#1e3a8a', border: isDark ? '#1e40af' : '#bfdbfe' },
    green: { light: '#f0fdf4', dark: '#15803d', border: isDark ? '#16a34a' : '#bbf7d0' },
    red: { light: '#fef2f2', dark: '#7f1d1d', border: isDark ? '#dc2626' : '#fecaca' },
    orange: { light: '#fff7ed', dark: '#92400e', border: isDark ? '#ea580c' : '#fed7aa' },
    purple: { light: '#faf5ff', dark: '#581c87', border: isDark ? '#a855f7' : '#e9d5ff' },
    pink: { light: '#fdf2f8', dark: '#831843', border: isDark ? '#ec4899' : '#fbcfe8' }
  }
  const c = colors[color as keyof typeof colors]

  return (
    <div style={{ backgroundColor: isDark ? c.dark : c.light, borderColor: c.border, border: '1px solid', borderRadius: '1rem', padding: '0.75rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <p className="text-xs sm:text-sm" style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>{title}</p>
      <p className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2" style={{ color: isDark ? '#fff' : '#000' }}>{value}</p>
    </div>
  )
}
