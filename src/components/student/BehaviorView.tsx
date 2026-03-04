'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'

export function StudentBehaviorView({ user, studentId }: any) {
  const [behavior, setBehavior] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBehavior = async () => {
      try {
        const token = await user?.getIdToken()
        const response = await fetch(`/api/behavior?studentId=${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          setBehavior(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        }
      } catch (error) {
        console.error('Behavior load error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      loadBehavior()
    }
  }, [user, studentId])

  if (loading) {
    return <div className="text-center py-8">Betöltés...</div>
  }

  if (behavior.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nincs viselkedés bejegyzés</div>
  }

  const dicseret = behavior.filter(b => b.type === 'dicseret')
  const figyelmezetes = behavior.filter(b => b.type === 'figyelmezetes')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{dicseret.length}</div>
              <div className="text-sm text-gray-600">Dicséret</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{figyelmezetes.length}</div>
              <div className="text-sm text-gray-600">Figyelmeztetés</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {behavior.map(record => (
          <div key={record.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Badge variant={record.type === 'dicseret' ? 'default' : 'destructive'}>
                  {record.type === 'dicseret' ? 'Dicséret' : 'Figyelmeztetés'}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  {record.level === 'szaktanari' ? 'Szaktanári' : record.level === 'osztalyfonoki' ? 'Osztályfőnöki' : 'Igazgatói'}
                </Badge>
              </div>
              <span className="text-xs text-gray-500">{new Date(record.createdAt).toLocaleDateString('hu-HU')}</span>
            </div>
            <p className="text-sm">{record.description}</p>
            {record.reason && <p className="text-xs text-gray-600 mt-1">{record.reason}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
