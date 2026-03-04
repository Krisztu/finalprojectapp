'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { BehaviorForm } from '@/features/behavior/components/BehaviorForm'
import { BehaviorList } from '@/features/behavior/components/BehaviorList'

export default function PrincipalDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [usersRes, gradesRes, attendanceRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/grades'),
        fetch('/api/attendance')
      ])
      if (usersRes.ok) setAllUsers(await usersRes.json())
      if (gradesRes.ok) setGrades(await gradesRes.json())
      if (attendanceRes.ok) setAttendance(await attendanceRes.json())
    } catch (error) {
      console.error('Failed to load data')
    }
  }

  const teachers = allUsers.filter(u => u.role === 'teacher' || u.role === 'homeroom_teacher')
  const students = allUsers.filter(u => u.role === 'student' || u.role === 'dj')

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Igazgatói Felület</h1>
          <Button onClick={() => logout()}>Kilépés</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tanárok</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{teachers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diákok</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{students.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jegyek</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">{grades.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tanárok listája</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {teachers.map(teacher => (
                  <div key={teacher.id} className="p-3 bg-gray-50 rounded">
                    <div className="font-semibold">{teacher.fullName}</div>
                    <div className="text-sm text-gray-600">{teacher.email}</div>
                    {teacher.subject && <div className="text-xs text-blue-600">Tantárgy: {teacher.subject}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diákok listája</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map(student => (
                  <div key={student.id} className="p-3 bg-gray-50 rounded">
                    <div className="font-semibold">{student.fullName}</div>
                    <div className="text-sm text-gray-600">{student.email}</div>
                    {student.class && <div className="text-xs text-green-600">Osztály: {student.class}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Igazgatói dicséret/figyelmeztetés</CardTitle>
          </CardHeader>
          <CardContent>
            <BehaviorForm />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Viselkedés értékelések</CardTitle>
          </CardHeader>
          <CardContent>
            <BehaviorList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statisztikák</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src={`/admin/statistics?dark=${darkMode}`}
              className="w-full h-screen border-0 rounded-lg"
              title="Statisztikák"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
