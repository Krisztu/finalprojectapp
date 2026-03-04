'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { dataCache } from '@/lib/dataCache'
import { useSearchParams } from 'next/navigation'

const STATS_CACHE_KEY = 'admin_statistics'

export default function AdminStatistics() {
  const searchParams = useSearchParams()
  const isDarkParam = searchParams.get('dark') === 'true'
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDarkParam) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkParam])

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const data = await dataCache.get(
        STATS_CACHE_KEY,
        async () => {
          const response = await fetch('/api/admin/statistics')
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          return response.json()
        }
      )
      setStats(data)
    } catch (error) {
      console.error('Statisztikák hiba:', error)
      setStats({ error: 'Adatok betöltése sikertelen' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center dark:text-white">Betöltés...</div>
  if (!stats) return <div className="p-8 text-center dark:text-white">Hiba az adatok betöltésekor</div>

  return (
    <div className="space-y-4 dark:bg-slate-950 dark:text-white min-h-screen p-4">
      <h2 className="text-2xl font-bold dark:text-white">Admin Statisztikák</h2>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 dark:bg-slate-800">
          <TabsTrigger value="overview" className="dark:text-white dark:data-[state=active]:bg-slate-700">Áttekintés</TabsTrigger>
          <TabsTrigger value="users" className="dark:text-white dark:data-[state=active]:bg-slate-700">Felhasználók</TabsTrigger>
          <TabsTrigger value="grades" className="dark:text-white dark:data-[state=active]:bg-slate-700">Jegyek</TabsTrigger>
          <TabsTrigger value="attendance" className="dark:text-white dark:data-[state=active]:bg-slate-700">Mulasztások</TabsTrigger>
          <TabsTrigger value="behavior" className="dark:text-white dark:data-[state=active]:bg-slate-700">Viselkedés</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Összes Felhasználó" value={stats.today.users.total} color="blue" />
            <StatCard title="Diákok" value={stats.today.users.students} color="green" />
            <StatCard title="Tanárok" value={stats.today.users.teachers} color="orange" />
            <StatCard title="Szülők" value={stats.today.users.parents} color="purple" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Osztályok (Átlag szerint)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={600}>
                <BarChart data={stats.topClasses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                  <Tooltip />
                  <Bar dataKey="averageGrade" fill="#3b82f6" animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard title="Összes" value={stats.today.users.total} color="blue" />
            <StatCard title="Diákok" value={stats.today.users.students} color="green" />
            <StatCard title="Tanárok" value={stats.today.users.teachers} color="orange" />
            <StatCard title="Szülők" value={stats.today.users.parents} color="purple" />
            <StatCard title="DJ" value={stats.today.users.djs} color="pink" />
          </div>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm dark:text-white">Felhasználók Eloszlása</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={600}>
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
                    outerRadius={250}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={600}
                  >
                    {['#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDarkParam ? '#1e293b' : '#fff', border: `1px solid ${isDarkParam ? '#475569' : '#ccc'}`, color: isDarkParam ? '#fff' : '#000' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Összes Jegy" value={stats.today.grades.total} color="blue" />
            <StatCard title="Átlag" value={stats.today.grades.average.toFixed(2)} color="green" />
            <StatCard title="5-ös Jegyek" value={stats.today.grades.byGrade[5]} color="purple" />
          </div>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm dark:text-white">Jegyek Eloszlása</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={600}>
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
                    outerRadius={250}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={600}
                  >
                    {['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDarkParam ? '#1e293b' : '#fff', border: `1px solid ${isDarkParam ? '#475569' : '#ccc'}`, color: isDarkParam ? '#fff' : '#000' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Jelenlét %" value={`${stats.today.attendance.percentage.toFixed(1)}%`} color="green" />
            <StatCard title="Jelen" value={stats.today.attendance.present} color="blue" />
            <StatCard title="Hiányzó" value={stats.today.attendance.absent} color="red" />
            <StatCard title="Igazolt" value={stats.today.attendance.excused} color="orange" />
          </div>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm dark:text-white">Jelenlét Trendje</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkParam ? '#475569' : '#ccc'} />
                  <XAxis dataKey="date" stroke={isDarkParam ? '#94a3b8' : '#666'} />
                  <YAxis domain={[0, 100]} stroke={isDarkParam ? '#94a3b8' : '#666'} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkParam ? '#1e293b' : '#fff', border: `1px solid ${isDarkParam ? '#475569' : '#ccc'}`, color: isDarkParam ? '#fff' : '#000' }} />
                  <Legend />
                  <Line type="monotone" dataKey="attendance.percentage" stroke="#10b981" name="Jelenlét %" strokeWidth={2} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm dark:text-white">Mulasztások Eloszlása</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkParam ? '#475569' : '#ccc'} />
                  <XAxis dataKey="date" stroke={isDarkParam ? '#94a3b8' : '#666'} />
                  <YAxis stroke={isDarkParam ? '#94a3b8' : '#666'} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkParam ? '#1e293b' : '#fff', border: `1px solid ${isDarkParam ? '#475569' : '#ccc'}`, color: isDarkParam ? '#fff' : '#000' }} />
                  <Legend />
                  <Bar dataKey="attendance.present" fill="#10b981" name="Jelen" animationDuration={600} />
                  <Bar dataKey="attendance.absent" fill="#ef4444" name="Hiányzó" animationDuration={600} />
                  <Bar dataKey="attendance.excused" fill="#f59e0b" name="Igazolt" animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Pozitív" value={stats.today.behavior.positive} color="green" />
            <StatCard title="Negatív" value={stats.today.behavior.negative} color="red" />
            <StatCard title="Átlag Pont" value={stats.today.behavior.average.toFixed(2)} color="blue" />
          </div>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm dark:text-white">Viselkedés Trendje</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkParam ? '#475569' : '#ccc'} />
                  <XAxis dataKey="date" stroke={isDarkParam ? '#94a3b8' : '#666'} />
                  <YAxis stroke={isDarkParam ? '#94a3b8' : '#666'} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkParam ? '#1e293b' : '#fff', border: `1px solid ${isDarkParam ? '#475569' : '#ccc'}`, color: isDarkParam ? '#fff' : '#000' }} />
                  <Legend />
                  <Bar dataKey="behavior.positive" fill="#10b981" name="Pozitív" animationDuration={600} />
                  <Bar dataKey="behavior.negative" fill="#ef4444" name="Negatív" animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
