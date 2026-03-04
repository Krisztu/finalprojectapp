# 👨‍👩‍👧 Szülő-Diák Összekapcsolás - OM Azonosító Alapú

## 📋 Áttekintés

Szülők és diákok összekapcsolása a diák 11 jegyű OM (Oktatási Azonosító) száma alapján.

---

## 🔢 OM Azonosító

**Formátum**: 11 számjegy (pl: 12345678901)
- Minden magyar diáknak van egyedi OM azonosítója
- Az iskola rögzíti a diák profiljában
- Szülő ezzel köti össze magát a gyermekével

---

## 🗄️ Adatbázis Séma

### User (Diák)
```typescript
// Firestore: /users/{userId}
interface Student extends User {
  role: 'student'
  omAzonosito: string // 11 jegyű szám
  name: string
  class: string
  parents?: string[] // parentId-k
}
```

### User (Szülő)
```typescript
// Firestore: /users/{userId}
interface Parent extends User {
  role: 'parent'
  name: string
  email: string
  phone?: string
  children?: string[] // childId-k
}
```

### Parent-Child Kapcsolat
```typescript
// Firestore: /parent_children/{parentId}__{childId}
interface ParentChild {
  parentId: string
  parentName: string
  childId: string
  childName: string
  childClass: string
  childOmAzonosito: string
  relationship: 'anya' | 'apa' | 'gyam' | 'egyeb'
  linkedAt: Date
  verified: boolean
}
```

---

## 🔌 API Végpontok

### 1. Szülő Összekapcsolása Gyermekkel
```typescript
// POST /api/parent/link-child
interface LinkChildRequest {
  omAzonosito: string // 11 jegyű szám
  relationship: 'anya' | 'apa' | 'gyam' | 'egyeb'
}

interface LinkChildResponse {
  success: boolean
  childId: string
  childName: string
  childClass: string
  message: string
}
```

### 2. Szülő Gyermekeinek Lekérése
```typescript
// GET /api/parent/children
interface GetChildrenResponse {
  children: {
    id: string
    name: string
    class: string
    omAzonosito: string
    relationship: string
    linkedAt: Date
  }[]
}
```

### 3. Kapcsolat Törlése
```typescript
// DELETE /api/parent/unlink-child/:childId
interface UnlinkChildRequest {
  childId: string
}
```

---

## 🛠️ Backend Implementáció

### 1. Link Service
```typescript
// src/lib/parentLinkService.ts
import { db } from '@/lib/firebase-admin'

export class ParentLinkService {
  async linkChild(parentId: string, omAzonosito: string, relationship: string) {
    // OM azonosító validálás
    if (!/^\d{11}$/.test(omAzonosito)) {
      throw new Error('Érvénytelen OM azonosító formátum')
    }

    // Diák keresése OM azonosító alapján
    const studentsRef = await db
      .collection('users')
      .where('role', '==', 'student')
      .where('omAzonosito', '==', omAzonosito)
      .limit(1)
      .get()

    if (studentsRef.empty) {
      throw new Error('Nem található diák ezzel az OM azonosítóval')
    }

    const student = studentsRef.docs[0]
    const studentData = student.data()
    const childId = student.id

    // Ellenőrzés: már össze van-e kötve
    const existingLink = await db
      .collection('parent_children')
      .doc(`${parentId}__${childId}`)
      .get()

    if (existingLink.exists) {
      throw new Error('Ez a gyermek már hozzá van rendelve ehhez a szülőhöz')
    }

    // Szülő adatainak lekérése
    const parentDoc = await db.collection('users').doc(parentId).get()
    const parentData = parentDoc.data()

    // Kapcsolat létrehozása
    const linkData = {
      parentId,
      parentName: parentData?.name || parentData?.email,
      childId,
      childName: studentData.name,
      childClass: studentData.class,
      childOmAzonosito: omAzonosito,
      relationship,
      linkedAt: new Date(),
      verified: true
    }

    await db
      .collection('parent_children')
      .doc(`${parentId}__${childId}`)
      .set(linkData)

    // User dokumentumok frissítése
    await db.collection('users').doc(parentId).update({
      children: db.FieldValue.arrayUnion(childId)
    })

    await db.collection('users').doc(childId).update({
      parents: db.FieldValue.arrayUnion(parentId)
    })

    return {
      childId,
      childName: studentData.name,
      childClass: studentData.class
    }
  }

  async getChildren(parentId: string) {
    const linksRef = await db
      .collection('parent_children')
      .where('parentId', '==', parentId)
      .get()

    return linksRef.docs.map(doc => doc.data())
  }

  async unlinkChild(parentId: string, childId: string) {
    // Kapcsolat törlése
    await db
      .collection('parent_children')
      .doc(`${parentId}__${childId}`)
      .delete()

    // User dokumentumok frissítése
    await db.collection('users').doc(parentId).update({
      children: db.FieldValue.arrayRemove(childId)
    })

    await db.collection('users').doc(childId).update({
      parents: db.FieldValue.arrayRemove(parentId)
    })
  }
}
```

### 2. API Route
```typescript
// src/app/api/parent/link-child/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ParentLinkService } from '@/lib/parentLinkService'
import { verifyAuth } from '@/lib/auth-middleware'

const linkService = new ParentLinkService()

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (user.role !== 'parent') {
      return NextResponse.json(
        { error: 'Csak szülők használhatják ezt a funkciót' },
        { status: 403 }
      )
    }

    const { omAzonosito, relationship } = await request.json()

    const result = await linkService.linkChild(
      user.uid,
      omAzonosito,
      relationship
    )

    return NextResponse.json({
      success: true,
      ...result,
      message: 'Gyermek sikeresen hozzárendelve'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}
```

---

## 🎨 Frontend Komponensek

### 1. Gyermek Hozzáadása (Szülő)
```typescript
// src/components/parent/LinkChildForm.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export function LinkChildForm({ onSuccess }: any) {
  const [omAzonosito, setOmAzonosito] = useState('')
  const [relationship, setRelationship] = useState<'anya' | 'apa' | 'gyam' | 'egyeb'>('anya')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!/^\d{11}$/.test(omAzonosito)) {
      setError('Az OM azonosító 11 számjegyből kell álljon')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/parent/link-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ omAzonosito, relationship })
      })

      const data = await response.json()

      if (data.success) {
        setOmAzonosito('')
        onSuccess?.(data)
      } else {
        setError(data.error || 'Hiba történt')
      }
    } catch (err) {
      setError('Hálózati hiba történt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gyermek Hozzáadása</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              OM Azonosító (11 jegyű szám)
            </label>
            <Input
              type="text"
              value={omAzonosito}
              onChange={(e) => setOmAzonosito(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="12345678901"
              maxLength={11}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              A gyermek oktatási azonosítója (11 számjegy)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Kapcsolat
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as any)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option value="anya">Édesanya</option>
              <option value="apa">Édesapa</option>
              <option value="gyam">Gyám</option>
              <option value="egyeb">Egyéb</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Hozzáadás...' : 'Gyermek Hozzáadása'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### 2. Gyermekek Listája (Szülő)
```typescript
// src/components/parent/ChildrenList.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'

export function ChildrenList() {
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      const response = await fetch('/api/parent/children')
      const data = await response.json()
      setChildren(data.children || [])
    } catch (error) {
      console.error('Hiba a gyermekek betöltésekor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlink = async (childId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a kapcsolatot?')) return

    try {
      await fetch(`/api/parent/unlink-child/${childId}`, {
        method: 'DELETE'
      })
      loadChildren()
    } catch (error) {
      alert('Hiba történt a törlés során')
    }
  }

  if (loading) return <div>Betöltés...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gyermekeim</CardTitle>
      </CardHeader>
      <CardContent>
        {children.length === 0 ? (
          <p className="text-gray-500">Még nincs hozzáadott gyermek</p>
        ) : (
          <div className="space-y-3">
            {children.map(child => (
              <div
                key={child.id}
                className="flex justify-between items-center p-4 border rounded"
              >
                <div>
                  <p className="font-medium">{child.name}</p>
                  <p className="text-sm text-gray-500">{child.class}</p>
                  <p className="text-xs text-gray-400">
                    OM: {child.omAzonosito} • {child.relationship}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleUnlink(child.id)}
                >
                  Törlés
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 🔒 Biztonsági Megfontolások

1. **OM Azonosító Validálás**: Pontosan 11 számjegy
2. **Duplikáció Ellenőrzés**: Egy szülő-gyermek pár csak egyszer köthető össze
3. **Jogosultság Ellenőrzés**: Csak parent role használhatja
4. **Adatvédelem**: OM azonosító nem publikus, csak összekapcsoláshoz

---

## ✅ Előnyök

- ✅ Egyszerű használat (csak 11 számjegy)
- ✅ Hivatalos azonosító
- ✅ Nincs szükség email meghívóra
- ✅ Azonnali összekapcsolás
- ✅ Biztonságos (csak az iskola rögzíti)

---

## 📝 Implementációs Lépések

1. **User modell bővítése**: `omAzonosito` mező hozzáadása
2. **Admin felület**: OM azonosító rögzítése diákoknál
3. **API végpontok**: Link/unlink funkciók
4. **Szülő UI**: Gyermek hozzáadása form
5. **Tesztelés**: OM azonosító validálás

---

*Becsült munkaóra: ~8 óra*
