'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import { BehaviorList } from '@/features/behavior/components/BehaviorList'
import { uploadToCloudinary } from '@/lib/cloudinary'

export default function ParentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [justificationForm, setJustificationForm] = useState({ date: '', reason: '', proofUrl: '' })

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadChildren()
  }, [user])

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild.studentId)
    }
  }, [selectedChild])

  const loadChildren = async () => {
    try {
      const response = await fetch(`/api/users?email=${user?.email}`)
      if (response.ok) {
        const users = await response.json()
        const parent = users[0]
        if (parent?.children) {
          const childrenData = await Promise.all(
            parent.children.map(async (studentId: string) => {
              const res = await fetch(`/api/users?studentId=${studentId}`)
              const data = await res.json()
              return data[0]
            })
          )
          setChildren(childrenData.filter(Boolean))
          if (childrenData.length > 0) setSelectedChild(childrenData[0])
        }
      }
    } catch (error) {
      console.error('Failed to load children')
    }
  }

  const loadChildData = async (studentId: string) => {
    try {
      const [attendanceRes, gradesRes] = await Promise.all([
        fetch(`/api/attendance?studentId=${studentId}`),
        fetch(`/api/grades?studentId=${studentId}`)
      ])
      if (attendanceRes.ok) setAttendance(await attendanceRes.json())
      if (gradesRes.ok) setGrades(await gradesRes.json())
    } catch (error) {
      console.error('Failed to load child data')
    }
  }

  const handleSubmitJustification = async () => {
    if (!justificationForm.date || !justificationForm.reason || !selectedChild) return

    try {
      const response = await fetch('/api/justifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedChild.id,
          studentName: selectedChild.fullName,
          studentClass: selectedChild.class,
          date: justificationForm.date,
          reason: justificationForm.reason,
          proofUrls: justificationForm.proofUrl ? [justificationForm.proofUrl] : []
        })
      })

      if (response.ok) {
        alert('Igazolás sikeresen beküldve!')
        setJustificationForm({ date: '', reason: '', proofUrl: '' })
      }
    } catch (error) {
      alert('Hiba történt')
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Szülői Felület</h1>
          <Button onClick={() => logout()}>Kilépés</Button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Gyermek kiválasztása</label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => setSelectedChild(children.find(c => c.id === e.target.value))}
            className="w-full p-2 border rounded-md"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.fullName} - {child.class}</option>
            ))}
          </select>
        </div>

        {selectedChild && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Jegyek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {grades.map(grade => (
                    <div key={grade.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{grade.subject}</span>
                      <Badge className={grade.grade >= 4 ? 'bg-green-500' : grade.grade >= 3 ? 'bg-yellow-500' : 'bg-red-500'}>
                        {grade.grade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mulasztások</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attendance.map(record => (
                    <div key={record.id} className={`p-2 rounded ${record.excused ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex justify-between">
                        <span>{record.subject}</span>
                        <Badge className={record.excused ? 'bg-green-500' : 'bg-red-500'}>
                          {record.excused ? 'Igazolt' : 'Igazolatlan'}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('hu-HU')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Igazolás beküldése</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dátum</label>
                  <Input
                    type="date"
                    value={justificationForm.date}
                    onChange={e => setJustificationForm({ ...justificationForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Indoklás</label>
                  <Textarea
                    value={justificationForm.reason}
                    onChange={e => setJustificationForm({ ...justificationForm, reason: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Igazolás (kép)</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = await uploadToCloudinary(file)
                        setJustificationForm({ ...justificationForm, proofUrl: url })
                      }
                    }}
                  />
                </div>
                <Button onClick={handleSubmitJustification} className="w-full">Beküldés</Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Viselkedés értékelések</CardTitle>
              </CardHeader>
              <CardContent>
                <BehaviorList studentId={selectedChild.id} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
