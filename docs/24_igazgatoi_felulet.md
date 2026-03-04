# 🏫 Igazgatói Felület - Csak Olvasási Jogosultság

## 📋 Áttekintés

Az igazgatói felület hasonló az admin felülethez, de csak olvasási jogosultságokkal rendelkezik.
Az igazgató láthatja a statisztikákat, tanárokat, diákokat, de nem módosíthat és nem törölhet adatokat.

---

## 🔐 Jogosultságok

### ✅ Mit LÁTHAT az igazgató:
- ✅ Statisztikák (felhasználók, jegyek, mulasztások, viselkedés)
- ✅ Tanárok listája és adatai
- ✅ Diákok listája és adatai
- ✅ Osztályok áttekintése
- ✅ Jegyek megtekintése
- ✅ Mulasztások megtekintése
- ✅ Viselkedési értékelések megtekintése
- ✅ Órarend megtekintése

### ❌ Mit NEM tehet az igazgató:
- ❌ Felhasználók törlése
- ❌ Jegyek törlése/módosítása
- ❌ Mulasztások törlése/módosítása
- ❌ Adatbázis műveletek (create, update, delete)
- ❌ Rendszer beállítások módosítása
- ❌ Felhasználói szerepkörök módosítása

### ⚠️ Kivétel - Mit TEHET az igazgató:
- ✅ Igazgatói dicséret/figyelmeztetés adása (csak ezt!)

---

## 🗄️ User Role

```typescript
// Firestore: /users/{userId}
interface User {
  role: 'admin' | 'principal' | 'teacher' | 'student' | 'parent'
  // principal = igazgató
}
```

---

## 🔌 API Jogosultság Ellenőrzés

### Middleware
```typescript
// src/lib/auth-middleware.ts
export async function verifyAuth(request: NextRequest) {
  const user = await getCurrentUser(request)
  return user
}

export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const user = await verifyAuth(request)
    
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Nincs jogosultság')
    }
    
    return user
  }
}

export function canModify(user: any) {
  // Csak admin módosíthat
  return user.role === 'admin'
}

export function canDelete(user: any) {
  // Csak admin törölhet
  return user.role === 'admin'
}

export function canViewStats(user: any) {
  // Admin és igazgató láthatja a statisztikákat
  return ['admin', 'principal'].includes(user.role)
}
```

---

## 📊 Igazgatói Dashboard Struktúra

### Oldal Elrendezés
```
/principal/dashboard
├── Statisztikák (csak olvasás)
├── Tanárok (csak olvasás)
├── Diákok (csak olvasás)
├── Osztályok (csak olvasás)
├── Jegyek (csak olvasás)
├── Mulasztások (csak olvasás)
├── Viselkedés (olvasás + igazgatói dicséret/figyelmeztetés)
└── Órarend (csak olvasás)
```

---

## 🎨 Frontend Komponensek

### 1. Principal Dashboard
```typescript
// src/app/principal/dashboard/page.tsx
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { StatisticsView } from '@/components/principal/StatisticsView'
import { TeachersView } from '@/components/principal/TeachersView'
import { StudentsView } from '@/components/principal/StudentsView'
import { GradesView } from '@/components/principal/GradesView'
import { AttendanceView } from '@/components/principal/AttendanceView'
import { BehaviorView } from '@/components/principal/BehaviorView'

export default function PrincipalDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Igazgatói Felület</h1>
      
      <Tabs defaultValue="statistics">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="statistics">Statisztikák</TabsTrigger>
          <TabsTrigger value="teachers">Tanárok</TabsTrigger>
          <TabsTrigger value="students">Diákok</TabsTrigger>
          <TabsTrigger value="classes">Osztályok</TabsTrigger>
          <TabsTrigger value="grades">Jegyek</TabsTrigger>
          <TabsTrigger value="attendance">Mulasztások</TabsTrigger>
          <TabsTrigger value="behavior">Viselkedés</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics">
          <StatisticsView readOnly={true} />
        </TabsContent>

        <TabsContent value="teachers">
          <TeachersView readOnly={true} />
        </TabsContent>

        <TabsContent value="students">
          <StudentsView readOnly={true} />
        </TabsContent>

        <TabsContent value="grades">
          <GradesView readOnly={true} />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceView readOnly={true} />
        </TabsContent>

        <TabsContent value="behavior">
          <BehaviorView 
            readOnly={false} 
            allowPrincipalActions={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 2. Statistics View (Csak Olvasás)
```typescript
// src/components/principal/StatisticsView.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

export function StatisticsView({ readOnly }: { readOnly: boolean }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    const response = await fetch('/api/admin/statistics')
    const data = await response.json()
    setStats(data)
  }

  if (!stats) return <div>Betöltés...</div>

  return (
    <div className="space-y-6">
      {/* Ugyanaz mint az admin, de nincs szerkesztés/törlés gomb */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Összes Felhasználó</p>
            <p className="text-3xl font-bold">{stats.today.users.total}</p>
          </CardContent>
        </Card>
        {/* További statisztikák... */}
      </div>

      {readOnly && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded">
          ℹ️ Csak megtekintési jogosultság
        </div>
      )}
    </div>
  )
}
```

### 3. Teachers View (Csak Olvasás)
```typescript
// src/components/principal/TeachersView.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

export function TeachersView({ readOnly }: { readOnly: boolean }) {
  const [teachers, setTeachers] = useState<any[]>([])

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    const response = await fetch('/api/users?role=teacher')
    const data = await response.json()
    setTeachers(data.users)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tanárok Listája</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teachers.map(teacher => (
            <div key={teacher.id} className="p-4 border rounded">
              <p className="font-medium">{teacher.name}</p>
              <p className="text-sm text-gray-500">{teacher.email}</p>
              <p className="text-xs text-gray-400">
                Tantárgyak: {teacher.subjects?.join(', ')}
              </p>
              {/* NINCS törlés/szerkesztés gomb */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 4. Students View (Csak Olvasás)
```typescript
// src/components/principal/StudentsView.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

export function StudentsView({ readOnly }: { readOnly: boolean }) {
  const [students, setStudents] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('all')

  useEffect(() => {
    loadStudents()
  }, [selectedClass])

  const loadStudents = async () => {
    const url = selectedClass === 'all' 
      ? '/api/users?role=student'
      : `/api/users?role=student&class=${selectedClass}`
    
    const response = await fetch(url)
    const data = await response.json()
    setStudents(data.users)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diákok Listája</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">Összes osztály</option>
            <option value="9A">9A</option>
            <option value="9B">9B</option>
            {/* További osztályok... */}
          </select>
        </div>

        <div className="space-y-3">
          {students.map(student => (
            <div key={student.id} className="p-4 border rounded">
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-500">{student.class}</p>
              <p className="text-xs text-gray-400">
                OM: {student.omAzonosito}
              </p>
              {/* NINCS törlés/szerkesztés gomb */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 5. Behavior View (Igazgatói Dicséret/Figyelmeztetés)
```typescript
// src/components/principal/BehaviorView.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'

export function BehaviorView({ 
  readOnly, 
  allowPrincipalActions 
}: { 
  readOnly: boolean
  allowPrincipalActions: boolean 
}) {
  const [selectedStudent, setSelectedStudent] = useState('')
  const [type, setType] = useState<'dicseret' | 'figyelmezetes'>('dicseret')
  const [description, setDescription] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = async () => {
    if (!allowPrincipalActions) return

    const response = await fetch('/api/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: selectedStudent,
        type,
        level: 'igazgatoi', // Csak igazgatói szint!
        description,
        reason
      })
    })

    if (response.ok) {
      alert('Igazgatói értékelés rögzítve!')
      setDescription('')
      setReason('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Viselkedési statisztikák megtekintése */}
      <Card>
        <CardHeader>
          <CardTitle>Viselkedési Statisztikák</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Csak olvasás - statisztikák */}
        </CardContent>
      </Card>

      {/* Igazgatói dicséret/figyelmeztetés */}
      {allowPrincipalActions && (
        <Card>
          <CardHeader>
            <CardTitle>Igazgatói Dicséret/Figyelmeztetés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Diák kiválasztása
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Válassz diákot</option>
                {/* Diákok listája */}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setType('dicseret')}
                className={`px-4 py-2 rounded ${
                  type === 'dicseret'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                Dicséret
              </button>
              <button
                onClick={() => setType('figyelmezetes')}
                className={`px-4 py-2 rounded ${
                  type === 'figyelmezetes'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                Figyelmeztetés
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Leírás
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Indoklás
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded"
                rows={2}
              />
            </div>

            <Button onClick={handleSubmit}>
              Igazgatói Értékelés Rögzítése
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

---

## 🔒 API Védelem

### Példa: Védett Endpoint
```typescript
// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, canDelete } from '@/lib/auth-middleware'

// GET - Igazgató is láthatja
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    
    // Admin és igazgató is láthatja
    if (!['admin', 'principal'].includes(user.role)) {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 })
    }

    const userData = await db.collection('users').doc(params.id).get()
    return NextResponse.json(userData.data())
  } catch (error) {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}

// DELETE - Csak admin törölhet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    
    // Csak admin törölhet
    if (!canDelete(user)) {
      return NextResponse.json(
        { error: 'Nincs jogosultság a törléshez' },
        { status: 403 }
      )
    }

    await db.collection('users').doc(params.id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}
```

---

## 🎯 Routing

```
/admin/dashboard     → Admin (teljes jogosultság)
/principal/dashboard → Igazgató (csak olvasás + igazgatói értékelés)
/teacher/dashboard   → Tanár
/student/dashboard   → Diák
/parent/dashboard    → Szülő
```

---

## 📋 Implementációs Checklist

### Backend
- [ ] Role-based middleware (canModify, canDelete, canViewStats)
- [ ] API végpontok védése role alapján
- [ ] Principal role hozzáadása User modellhez
- [ ] Behavior API - igazgatói szint engedélyezése

### Frontend
- [ ] /principal/dashboard oldal létrehozása
- [ ] StatisticsView komponens (readOnly prop)
- [ ] TeachersView komponens (readOnly prop)
- [ ] StudentsView komponens (readOnly prop)
- [ ] GradesView komponens (readOnly prop)
- [ ] AttendanceView komponens (readOnly prop)
- [ ] BehaviorView komponens (allowPrincipalActions prop)
- [ ] Törlés/szerkesztés gombok elrejtése readOnly módban

### Tesztelés
- [ ] Igazgató nem tud törölni
- [ ] Igazgató nem tud módosítani
- [ ] Igazgató látja a statisztikákat
- [ ] Igazgató adhat igazgatói dicséretet/figyelmeztetést
- [ ] API védelem működik

---

## 🔐 Biztonsági Szabályok

```typescript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - Admin és igazgató olvashatja
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.role == 'principal');
      
      // Csak admin módosíthat/törölhet
      allow write, delete: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
    
    // Behavior - Igazgató írhat (csak igazgatói szint)
    match /behavior_records/{recordId} {
      allow read: if request.auth != null;
      
      allow create: if request.auth != null && 
        (request.auth.token.role == 'teacher' ||
         request.auth.token.role == 'principal') &&
        (request.auth.token.role != 'principal' || 
         request.resource.data.level == 'igazgatoi');
      
      allow update, delete: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

---

## ✅ Összefoglalás

**Igazgató jogosultságai:**
- ✅ Minden adat megtekintése
- ✅ Statisztikák megtekintése
- ✅ Igazgatói dicséret/figyelmeztetés adása
- ❌ Adatok módosítása
- ❌ Adatok törlése
- ❌ Rendszer beállítások

**Implementáció:**
- Role-based middleware
- ReadOnly prop a komponensekben
- API védelem
- Firestore rules

---

*Becsült munkaóra: ~12 óra*
