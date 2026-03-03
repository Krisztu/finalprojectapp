'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp } from 'lucide-react'

export function AdminStatistics() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/admin/statistics')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Statisztikák betöltése sikertelen:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Betöltés...</div>
  if (!stats) return <div className="p-8 text-center">Hiba az adatok betöltésekor</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Statisztikák</h2>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Áttekintés</TabsTrigger>
          <TabsTrigger value="users">Felhasználók</TabsTrigger>
          <TabsTrigger value="grades">Jegyek</TabsTrigger>
          <TabsTrigger value="attendance">Mulasztások</TabsTrigger>
          <TabsTrigger value="behavior">Viselkedés</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Összes Felhasználó" value={stats.today.users.total} color="blue" />
            <StatCard title="Diákok" value={stats.today.users.students} color="green" />
            <StatCard title="Tanárok" value={stats.today.users.teachers} color="orange" />
            <StatCard title="Szülők" value={stats.today.users.parents} color="purple" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
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

          <Card>
            <CardHeader>
              <CardTitle>Top Osztályok (Átlag szerint)</CardTitle>
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

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard title="Összes" value={stats.today.users.total} color="blue" />
            <StatCard title="Diákok" value={stats.today.users.students} color="green" />
            <StatCard title="Tanárok" value={stats.today.users.teachers} color="orange" />
            <StatCard title="Szülők" value={stats.today.users.parents} color="purple" />
            <StatCard title="DJ" value={stats.today.users.djs} color="pink" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Felhasználók Eloszlása</CardTitle>
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

        <TabsContent value="grades" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Összes Jegy" value={stats.today.grades.total} color="blue" />
            <StatCard title="Átlag" value={stats.today.grades.average.toFixed(2)} color="green" />
            <StatCard title="5-ös Jegyek" value={stats.today.grades.byGrade[5]} color="purple" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Jegyek Eloszlása</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Jegyek Trendje</CardTitle>
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

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Jelenlét %" value={`${stats.today.attendance.percentage.toFixed(1)}%`} color="green" />
            <StatCard title="Jelen" value={stats.today.attendance.present} color="blue" />
            <StatCard title="Hiányzó" value={stats.today.attendance.absent} color="red" />
            <StatCard title="Igazolt" value={stats.today.attendance.excused} color="orange" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Jelenlét Trendje</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Mulasztások Eloszlása</CardTitle>
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

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Pozitív" value={stats.today.behavior.positive} color="green" />
            <StatCard title="Negatív" value={stats.today.behavior.negative} color="red" />
            <StatCard title="Átlag Pont" value={stats.today.behavior.average.toFixed(2)} color="blue" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Viselkedés Trendje</CardTitle>
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
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  )
}
