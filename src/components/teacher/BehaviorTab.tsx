'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/textarea'

export function TeacherBehaviorTab({ user, allUsers, selectedClass, showAlert }: any) {
  const [form, setForm] = useState({
    studentId: '',
    type: 'dicseret',
    level: 'szaktanari',
    description: ''
  })

  const handleSubmit = async () => {
    if (!form.studentId || !form.description) {
      showAlert('Töltsd ki az összes mezőt!', 'warning')
      return
    }

    try {
      const token = await user?.getIdToken()
      const student = allUsers.find(u => u.id === form.studentId)
      
      const response = await fetch('/api/behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: form.studentId,
          studentName: student?.fullName || student?.name,
          studentClass: student?.class,
          type: form.type,
          level: form.level,
          description: form.description,
          reason: ''
        })
      })

      if (response.ok) {
        showAlert('Viselkedés rögzítve!', 'success')
        setForm({ studentId: '', type: 'dicseret', level: 'szaktanari', description: '' })
      } else {
        showAlert('Hiba a rögzítés során', 'error')
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>Viselkedés Rögzítése</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Diák</label>
          <select
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="">Válassz diákot</option>
            {allUsers.filter(u => (u.role === 'student' || u.role === 'dj') && (!selectedClass || u.class === selectedClass)).map(student => (
              <option key={student.id} value={student.id}>{student.fullName || student.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Típus</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="dicseret">Dicséret</option>
              <option value="figyelmezetes">Figyelmeztetés</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Szint</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="szaktanari">Szaktanári</option>
              <option value="osztalyfonoki">Osztályfőnöki</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Leírás</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Rövid leírás..."
          />
        </div>

        <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
          Rögzítés
        </Button>
      </CardContent>
    </Card>
  )
}
