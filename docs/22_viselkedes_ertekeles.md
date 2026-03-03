# 🎯 Viselkedési Értékelés - Magyar Oktatási Rendszer

## 📋 Áttekintés

Magyar oktatási rendszerhez igazított viselkedési értékelés rendszer.
Tanárok rögzítik a diákok viselkedését, szülőket értesítik, és trend követés.

---

## 🗄️ Adatbázis Séma

### Behavior Record
```typescript
// Firestore: /behavior_records/{recordId}
interface BehaviorRecord {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  
  // Viselkedés típusa (magyar oktatási rendszer)
  type: 'positive' | 'negative'
  category: 'fegyelem' | 'szorgalom' | 'közreműködés' | 'tisztelet' | 'tanulmányi' | 'egyéb'
  
  // Leírás
  description: string
  
  // Tanár
  recordedBy: string
  recordedByName: string
  
  // Pontok
  points: number // +1 vagy -1
  
  // Dátum
  createdAt: Date
  
  // Szülői értesítés
  parentNotified: boolean
  notifiedAt?: Date
}
```

### Behavior Summary (Diákonként)
```typescript
// Firestore: /users/{studentId}/behavior_summary
interface BehaviorSummary {
  studentId: string
  totalPoints: number
  positiveCount: number
  negativeCount: number
  
  // Kategóriánként
  byCategory: {
    discipline: number
    cooperation: number
    participation: number
    respect: number
    other: number
  }
  
  // Trend
  thisMonth: number
  lastMonth: number
  
  updatedAt: Date
}
```

---

## 🔌 API Végpontok

### 1. Viselkedés Rögzítése
```typescript
// POST /api/behavior
interface CreateBehaviorRequest {
  studentId: string
  studentName: string
  studentClass: string
  type: 'positive' | 'negative'
  category: string
  description: string
  points: number
}

interface CreateBehaviorResponse {
  id: string
  success: boolean
  message: string
}
```

### 2. Viselkedés Lekérése
```typescript
// GET /api/behavior?studentId=xxx&class=xxx&limit=50
interface GetBehaviorResponse {
  records: BehaviorRecord[]
  summary: BehaviorSummary
  total: number
}
```

### 3. Viselkedés Szerkesztése
```typescript
// PUT /api/behavior/:id
interface UpdateBehaviorRequest {
  description?: string
  points?: number
  category?: string
}
```

### 4. Viselkedés Törlése
```typescript
// DELETE /api/behavior/:id
interface DeleteBehaviorRequest {
  recordId: string
}
```

### 5. Osztály Viselkedés Statisztikái
```typescript
// GET /api/behavior/class/:className
interface ClassBehaviorStatsResponse {
  className: string
  students: {
    name: string
    totalPoints: number
    positiveCount: number
    negativeCount: number
  }[]
  averagePoints: number
  topStudents: string[]
  bottomStudents: string[]
}
```

---

## 📊 Magyar Oktatási Rendszer Kategóriák

### Fegyelem (Discipline)
- Késés az órára
- Hiányzás engedély nélkül
- Zavar az órán
- Szabályok megsértése

### Szorgalom (Diligence)
- Házi feladat elkészítése
- Felkészülés az órára
- Tanulási erőfeszítés
- Fejlődés mutatása

### Közreműködés (Cooperation)
- Csoportmunkában való részvétel
- Társaknak nyújtott segítség
- Osztálytársak támogatása
- Közös projektek

### Tisztelet (Respect)
- Tanár tisztelete
- Társak tisztelete
- Iskolai szabályok betartása
- Tulajdon megóvása

### Tanulmányi (Academic)
- Jó teljesítmény
- Fejlődés az előző időszakhoz képest
- Kitűnő munka
- Versenyeken való részvétel

---

## 🛠️ Backend Implementáció

### 1. Behavior Service
```typescript
// src/lib/behaviorService.ts
import { db } from '@/lib/firebase-admin'
import { NotificationService } from './notifications'

export class BehaviorService {
  private notificationService = new NotificationService()

  async recordBehavior(data: any) {
    const record = {
      ...data,
      createdAt: new Date(),
      parentNotified: false
    }

    const docRef = await db.collection('behavior_records').add(record)

    // Szülő értesítése (negatív viselkedés)
    if (data.type === 'negative') {
      await this.notifyParent(data.studentId, data.description)
    }

    // Summary frissítése
    await this.updateBehaviorSummary(data.studentId)

    return docRef.id
  }

  private async notifyParent(studentId: string, description: string) {
    const parentChildren = await db
      .collection('parent_children')
      .where('childId', '==', studentId)
      .get()

    for (const doc of parentChildren.docs) {
      const parentId = doc.data().parentId
      await this.notificationService.createNotification(
        parentId,
        'behavior',
        'Viselkedési probléma',
        `Gyermekednél viselkedési probléma: ${description}`,
        { studentId }
      )
    }
  }

  private async updateBehaviorSummary(studentId: string) {
    const records = await db
      .collection('behavior_records')
      .where('studentId', '==', studentId)
      .get()

    const data = records.docs.map(d => d.data())
    
    const summary = {
      studentId,
      totalPoints: data.reduce((sum, r) => sum + r.points, 0),
      positiveCount: data.filter(r => r.type === 'positive').length,
      negativeCount: data.filter(r => r.type === 'negative').length,
      byCategory: {
        fegyelem: data.filter(r => r.category === 'fegyelem').length,
        szorgalom: data.filter(r => r.category === 'szorgalom').length,
        közreműködés: data.filter(r => r.category === 'közreműködés').length,
        tisztelet: data.filter(r => r.category === 'tisztelet').length,
        tanulmányi: data.filter(r => r.category === 'tanulmányi').length,
        egyéb: data.filter(r => r.category === 'egyéb').length
      },
      updatedAt: new Date()
    }

    await db
      .collection('users')
      .doc(studentId)
      .collection('behavior_summary')
      .doc('current')
      .set(summary, { merge: true })
  }
}
```

### 2. API Route
```typescript
// src/app/api/behavior/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { BehaviorService } from '@/lib/behaviorService'
import { verifyAuth } from '@/lib/auth-middleware'

const behaviorService = new BehaviorService()

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const data = await request.json()

    const recordId = await behaviorService.recordBehavior({
      ...data,
      recordedBy: user.uid,
      recordedByName: user.email
    })

    return NextResponse.json({ id: recordId, success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    const records = await db
      .collection('behavior_records')
      .where('studentId', '==', studentId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const summary = await db
      .collection('users')
      .doc(studentId)
      .collection('behavior_summary')
      .doc('current')
      .get()

    return NextResponse.json({
      records: records.docs.map(d => d.data()),
      summary: summary.data()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}
```

---

## 🎨 Frontend Komponensek

### 1. Viselkedés Rögzítés (Tanár)
```typescript
// src/components/teacher/BehaviorRecorder.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'

export function BehaviorRecorder({ studentId, studentName }: any) {
  const [type, setType] = useState<'positive' | 'negative'>('positive')
  const [category, setCategory] = useState('cooperation')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName,
          type,
          category,
          description,
          points: type === 'positive' ? 1 : -1
        })
      })

      if (response.ok) {
        setDescription('')
        alert('Viselkedés rögzítve!')
      }
    } catch (error) {
      alert('Hiba a rögzítés során')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viselkedés Rögzítése - {studentName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Típus választó */}
        <div className="flex gap-4">
          <button
            onClick={() => setType('positive')}
            className={`px-4 py-2 rounded ${
              type === 'positive'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            ✅ Pozitív
          </button>
          <button
            onClick={() => setType('negative')}
            className={`px-4 py-2 rounded ${
              type === 'negative'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            ❌ Negatív
          </button>
        </div>

        {/* Kategória */}
        <div>
          <label className="block text-sm font-medium mb-1">Kategória</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700"
          >
            <option value="fegyelem">Fegyelem (késés, hiányzás, zavar)</option>
            <option value="szorgalom">Szorgalom (házi feladat, felkészülés)</option>
            <option value="közreműködés">Közreműködés (csoportmunka, segítségnyújtás)</option>
            <option value="tisztelet">Tisztelet (tanár, társak, szabályok)</option>
            <option value="tanulmányi">Tanulmányi (teljesítmény, fejlődés)</option>
            <option value="egyéb">Egyébgyéb</option>
          </select>
        </div>

        {/* Leírás */}
        <div>
          <label className="block text-sm font-medium mb-1">Leírás</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Írj le a viselkedésről..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className={type === 'positive' ? 'bg-green-600' : 'bg-red-600'}
        >
          {loading ? 'Rögzítés...' : 'Rögzítés'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 2. Viselkedés Nézet (Diák/Szülő)
```typescript
// src/components/BehaviorView.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'

export function BehaviorView({ studentId }: any) {
  const [records, setRecords] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    loadBehavior()
  }, [studentId])

  const loadBehavior = async () => {
    const response = await fetch(`/api/behavior?studentId=${studentId}`)
    const data = await response.json()
    setRecords(data.records)
    setSummary(data.summary)
  }

  return (
    <div className="space-y-6">
      {/* Összefoglalás */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Összes pont</p>
              <p className={`text-3xl font-bold ${
                summary.totalPoints >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.totalPoints}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Pozitív</p>
              <p className="text-3xl font-bold text-green-600">
                {summary.positiveCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Negatív</p>
              <p className="text-3xl font-bold text-red-600">
                {summary.negativeCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Trend</p>
              <p className={`text-3xl font-bold ${
                summary.thisMonth >= summary.lastMonth ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.thisMonth > summary.lastMonth ? '📈' : '📉'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Viselkedés lista */}
      <Card>
        <CardHeader>
          <CardTitle>Viselkedési Történet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {records.map(record => (
            <div
              key={record.id}
              className={`p-4 rounded-lg border-l-4 ${
                record.type === 'positive'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex gap-2 items-center">
                    <span className={`text-2xl ${
                      record.type === 'positive' ? '✅' : '❌'
                    }`}></span>
                    <span className="font-medium">{record.category}</span>
                    <Badge className={
                      record.type === 'positive'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }>
                      {record.points > 0 ? '+' : ''}{record.points}
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">{record.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(record.createdAt).toLocaleDateString('hu-HU')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3. Viselkedés Trend Grafikon
```typescript
// src/components/BehaviorChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function BehaviorChart({ studentId }: any) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    loadTrendData()
  }, [studentId])

  const loadTrendData = async () => {
    const response = await fetch(`/api/behavior/trend?studentId=${studentId}`)
    const result = await response.json()
    setData(result.trend)
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="points" stroke="#3b82f6" name="Pontok" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

---

## 📊 Tanár Dashboard - Viselkedés Tab

```typescript
// src/app/dashboard/page.tsx - behavior tab
<TabsContent value="behavior" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Viselkedés Kezelése</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bal oldal: Rögzítés */}
        <div>
          <h3 className="font-semibold mb-4">Viselkedés Rögzítése</h3>
          <div className="space-y-4">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Válassz diákot</option>
              {classStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {selectedStudent && (
              <BehaviorRecorder
                studentId={selectedStudent}
                studentName={classStudents.find(s => s.id === selectedStudent)?.name}
              />
            )}
          </div>
        </div>

        {/* Jobb oldal: Nézet */}
        <div>
          <h3 className="font-semibold mb-4">Viselkedés Áttekintés</h3>
          {selectedStudent && (
            <BehaviorView studentId={selectedStudent} />
          )}
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

---

## ⏱️ Implementációs Ütemterv

### Nap 1-2: Backend
- [ ] Behavior model
- [ ] BehaviorService
- [ ] API végpontok
- [ ] Szülő értesítés

### Nap 3: Frontend
- [ ] BehaviorRecorder komponens
- [ ] BehaviorView komponens
- [ ] Tanár dashboard tab

### Nap 4: Tesztelés
- [ ] Unit tesztek
- [ ] E2E tesztek
- [ ] Manuális tesztelés

---

## 📋 Tesztelési Checklist

- [ ] Tanár rögzíthet viselkedést
- [ ] Diák látja saját viselkedését
- [ ] Szülő értesítést kap negatív viselkedésről
- [ ] Pontok helyesen számolódnak
- [ ] Trend grafikon működik
- [ ] Kategóriák szűrése működik

---

*Munkaóra: ~20 óra*
