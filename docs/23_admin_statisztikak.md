# 📊 Admin Statisztikák Implementációs Terv

## 📋 Áttekintés

Admin dashboard a teljes iskola adataival: felhasználók, jegyek, mulasztások, viselkedés statisztikák.

---

## 🗄️ Adatbázis Séma

### System Statistics (Napi frissítés)
```typescript
// Firestore: /system_statistics/{date}
interface SystemStatistics {
  date: string // YYYY-MM-DD
  
  // Felhasználók
  users: {
    total: number
    students: number
    teachers: number
    parents: number
    admins: number
    djs: number
  }
  
  // Jegyek
  grades: {
    total: number
    average: number
    byGrade: {
      1: number
      2: number
      3: number
      4: number
      5: number
    }
  }
  
  // Mulasztások
  attendance: {
    total: number
    present: number
    absent: number
    excused: number
    percentage: number
  }
  
  // Házi feladatok
  homework: {
    total: number
    submitted: number
    pending: number
    overdue: number
  }
  
  // Viselkedés
  behavior: {
    positive: number
    negative: number
    average: number
  }
  
  // Rendszer
  system: {
    activeUsers: number
    apiCalls: number
    errors: number
    uptime: number
  }
}
```

---

## 🔌 API Végpontok

### 1. Teljes Statisztikák
```typescript
// GET /api/admin/statistics
interface AdminStatisticsResponse {
  today: SystemStatistics
  thisWeek: SystemStatistics
  thisMonth: SystemStatistics
  
  // Trend
  trend: {
    date: string
    users: number
    grades: number
    attendance: number
  }[]
  
  // Top/Bottom
  topStudents: {
    name: string
    averageGrade: number
    class: string
  }[]
  
  bottomStudents: {
    name: string
    averageGrade: number
    class: string
  }[]
  
  topClasses: {
    name: string
    averageGrade: number
    studentCount: number
  }[]
}
```

### 2. Felhasználó Statisztikák
```typescript
// GET /api/admin/statistics/users
interface UserStatisticsResponse {
  total: number
  byRole: {
    students: number
    teachers: number
    parents: number
    admins: number
    djs: number
  }
  byClass: {
    className: string
    studentCount: number
  }[]
  newUsersThisMonth: number
  activeUsersThisWeek: number
}
```

### 3. Jegy Statisztikák
```typescript
// GET /api/admin/statistics/grades
interface GradeStatisticsResponse {
  total: number
  average: number
  distribution: {
    grade: number
    count: number
    percentage: number
  }[]
  bySubject: {
    subject: string
    average: number
    count: number
  }[]
  byClass: {
    className: string
    average: number
    count: number
  }[]
  trend: {
    date: string
    average: number
  }[]
}
```

### 4. Mulasztás Statisztikák
```typescript
// GET /api/admin/statistics/attendance
interface AttendanceStatisticsResponse {
  total: number
  present: number
  absent: number
  excused: number
  percentage: number
  
  byClass: {
    className: string
    percentage: number
    absent: number
  }[]
  
  byStudent: {
    name: string
    class: string
    absences: number
    percentage: number
  }[]
  
  trend: {
    date: string
    percentage: number
  }[]
}
```

### 5. Viselkedés Statisztikák
```typescript
// GET /api/admin/statistics/behavior
interface BehaviorStatisticsResponse {
  positive: number
  negative: number
  average: number
  
  byClass: {
    className: string
    average: number
    positive: number
    negative: number
  }[]
  
  byStudent: {
    name: string
    class: string
    points: number
    positive: number
    negative: number
  }[]
  
  trend: {
    date: string
    points: number
  }[]
}
```

---

## 🛠️ Backend Implementáció

### 1. Statistics Service
```typescript
// src/lib/statisticsService.ts
import { db } from '@/lib/firebase-admin'

export class StatisticsService {
  async generateDailyStatistics() {
    const today = new Date().toISOString().split('T')[0]

    // Felhasználók
    const usersSnapshot = await db.collection('users').get()
    const users = usersSnapshot.docs.map(d => d.data())

    const userStats = {
      total: users.length,
      students: users.filter(u => u.role === 'student').length,
      teachers: users.filter(u => u.role === 'teacher').length,
      parents: users.filter(u => u.role === 'parent').length,
      admins: users.filter(u => u.role === 'admin').length,
      djs: users.filter(u => u.role === 'dj').length
    }

    // Jegyek
    const gradesSnapshot = await db.collection('grades').get()
    const grades = gradesSnapshot.docs.map(d => d.data())

    const gradeStats = {
      total: grades.length,
      average: grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
        : 0,
      byGrade: {
        1: grades.filter(g => g.grade === 1).length,
        2: grades.filter(g => g.grade === 2).length,
        3: grades.filter(g => g.grade === 3).length,
        4: grades.filter(g => g.grade === 4).length,
        5: grades.filter(g => g.grade === 5).length
      }
    }

    // Mulasztások
    const attendanceSnapshot = await db.collection('attendance').get()
    const attendance = attendanceSnapshot.docs.map(d => d.data())

    const totalRecords = attendance.reduce((sum, a) => sum + a.students.length, 0)
    const presentCount = attendance.reduce((sum, a) => 
      sum + a.students.filter((s: any) => s.present).length, 0
    )
    const absentCount = totalRecords - presentCount

    const attendanceStats = {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      excused: attendance.reduce((sum, a) =>
        sum + a.students.filter((s: any) => s.excused).length, 0
      ),
      percentage: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0
    }

    // Házi feladatok
    const homeworkSnapshot = await db.collection('homework').get()
    const homework = homeworkSnapshot.docs.map(d => d.data())

    const submissionsSnapshot = await db.collection('homework_submissions').get()
    const submissions = submissionsSnapshot.docs.map(d => d.data())

    const homeworkStats = {
      total: homework.length,
      submitted: submissions.length,
      pending: homework.filter(h => !submissions.find(s => s.homeworkId === h.id)).length,
      overdue: homework.filter(h => new Date(h.dueDate) < new Date()).length
    }

    // Viselkedés
    const behaviorSnapshot = await db.collection('behavior_records').get()
    const behavior = behaviorSnapshot.docs.map(d => d.data())

    const behaviorStats = {
      positive: behavior.filter(b => b.type === 'positive').length,
      negative: behavior.filter(b => b.type === 'negative').length,
      average: behavior.length > 0
        ? behavior.reduce((sum, b) => sum + b.points, 0) / behavior.length
        : 0
    }

    // Mentés
    const statistics = {
      date: today,
      users: userStats,
      grades: gradeStats,
      attendance: attendanceStats,
      homework: homeworkStats,
      behavior: behaviorStats,
      system: {
        activeUsers: 0, // Külön tracking szükséges
        apiCalls: 0,
        errors: 0,
        uptime: 99.9
      }
    }

    await db.collection('system_statistics').doc(today).set(statistics)
    return statistics
  }

  async getStatistics(days: number = 30) {
    const today = new Date()
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

    const snapshot = await db
      .collection('system_statistics')
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .orderBy('date', 'desc')
      .get()

    return snapshot.docs.map(d => d.data())
  }

  async getTopStudents(limit: number = 10) {
    const gradesSnapshot = await db.collection('grades').get()
    const grades = gradesSnapshot.docs.map(d => d.data())

    const studentAverages = new Map<string, { sum: number; count: number }>()

    grades.forEach(grade => {
      const key = grade.studentName
      if (!studentAverages.has(key)) {
        studentAverages.set(key, { sum: 0, count: 0 })
      }
      const current = studentAverages.get(key)!
      current.sum += grade.grade || 0
      current.count += 1
    })

    const students = Array.from(studentAverages.entries())
      .map(([name, data]) => ({
        name,
        averageGrade: data.sum / data.count,
        class: 'N/A'
      }))
      .sort((a, b) => b.averageGrade - a.averageGrade)
      .slice(0, limit)

    return students
  }

  async getClassStatistics() {
    const usersSnapshot = await db.collection('users').get()
    const users = usersSnapshot.docs.map(d => d.data())

    const classes = [...new Set(users.map(u => u.class).filter(Boolean))]

    const classStats = await Promise.all(
      classes.map(async (className) => {
        const classUsers = users.filter(u => u.class === className)
        const classGrades = await db
          .collection('grades')
          .where('studentClass', '==', className)
          .get()

        const grades = classGrades.docs.map(d => d.data())
        const average = grades.length > 0
          ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
          : 0

        return {
          name: className,
          averageGrade: average,
          studentCount: classUsers.filter(u => u.role === 'student').length
        }
      })
    )

    return classStats.sort((a, b) => b.averageGrade - a.averageGrade)
  }
}
```

### 2. API Route
```typescript
// src/app/api/admin/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StatisticsService } from '@/lib/statisticsService'
import { verifyAuth } from '@/lib/auth-middleware'

const statisticsService = new StatisticsService()

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    // Admin ellenőrzés
    const userDoc = await db.collection('users').doc(user.uid).get()
    if (userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    if (type === 'all') {
      const stats = await statisticsService.getStatistics(30)
      const topStudents = await statisticsService.getTopStudents()
      const classStats = await statisticsService.getClassStatistics()

      return NextResponse.json({
        today: stats[0],
        thisWeek: stats.slice(0, 7),
        thisMonth: stats,
        topStudents,
        topClasses: classStats
      })
    }

    return NextResponse.json({ error: 'Ismeretlen típus' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}
```

---

## 🎨 Frontend Komponensek

### 1. Admin Statistics Dashboard
```typescript
// src/app/admin/statistics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function AdminStatistics() {
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

  if (loading) return <div>Betöltés...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Statisztikák</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Áttekintés</TabsTrigger>
          <TabsTrigger value="users">Felhasználók</TabsTrigger>
          <TabsTrigger value="grades">Jegyek</TabsTrigger>
          <TabsTrigger value="attendance">Mulasztások</TabsTrigger>
          <TabsTrigger value="behavior">Viselkedés</TabsTrigger>
        </TabsList>

        {/* Áttekintés */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Összes Felhasználó"
              value={stats.today.users.total}
              icon="👥"
            />
            <StatCard
              title="Diákok"
              value={stats.today.users.students}
              icon="👨‍🎓"
            />
            <StatCard
              title="Tanárok"
              value={stats.today.users.teachers}
              icon="👨‍🏫"
            />
            <StatCard
              title="Szülők"
              value={stats.today.users.parents}
              icon="👨‍👩‍👧"
            />
          </div>

          {/* Trend grafikon */}
          <Card>
            <CardHeader>
              <CardTitle>Felhasználók Trendje (30 nap)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users.total" stroke="#3b82f6" name="Összes" />
                  <Line type="monotone" dataKey="users.students" stroke="#10b981" name="Diákok" />
                  <Line type="monotone" dataKey="users.teachers" stroke="#f59e0b" name="Tanárok" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top osztályok */}
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

        {/* Jegyek */}
        <TabsContent value="grades" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Összes Jegy"
              value={stats.today.grades.total}
              icon="📊"
            />
            <StatCard
              title="Átlag"
              value={stats.today.grades.average.toFixed(2)}
              icon="📈"
            />
            <StatCard
              title="5-ös Jegyek"
              value={stats.today.grades.byGrade[5]}
              icon="⭐"
            />
          </div>

          {/* Jegyek eloszlása */}
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
                    {[
                      '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'
                    ].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mulasztások */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Jelenlét %"
              value={`${stats.today.attendance.percentage.toFixed(1)}%`}
              icon="✅"
            />
            <StatCard
              title="Jelen"
              value={stats.today.attendance.present}
              icon="👤"
            />
            <StatCard
              title="Hiányzó"
              value={stats.today.attendance.absent}
              icon="❌"
            />
            <StatCard
              title="Igazolt"
              value={stats.today.attendance.excused}
              icon="📝"
            />
          </div>

          {/* Mulasztás trend */}
          <Card>
            <CardHeader>
              <CardTitle>Jelenlét Trendje</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.thisMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="attendance.percentage"
                    stroke="#10b981"
                    name="Jelenlét %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Viselkedés */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Pozitív"
              value={stats.today.behavior.positive}
              icon="✅"
            />
            <StatCard
              title="Negatív"
              value={stats.today.behavior.negative}
              icon="❌"
            />
            <StatCard
              title="Átlag Pont"
              value={stats.today.behavior.average.toFixed(2)}
              icon="📊"
            />
          </div>

          {/* Viselkedés trend */}
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

// Stat Card komponens
function StatCard({ title, value, icon }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <span className="text-4xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## ⏱️ Implementációs Ütemterv

### Nap 1: Backend
- [ ] StatisticsService
- [ ] API végpontok
- [ ] Napi statisztikák generálása

### Nap 2: Frontend
- [ ] Admin Statistics Dashboard
- [ ] Grafikonok (Recharts)
- [ ] Stat Cards

### Nap 3: Tesztelés
- [ ] Unit tesztek
- [ ] E2E tesztek
- [ ] Manuális tesztelés

---

## 📋 Tesztelési Checklist

- [ ] Statisztikák helyesen számolódnak
- [ ] Grafikonok megjelennek
- [ ] Trend adatok helyesek
- [ ] Top/Bottom lista működik
- [ ] Szűrés működik
- [ ] Mobil nézet működik

---

*Munkaóra: ~15 óra*
