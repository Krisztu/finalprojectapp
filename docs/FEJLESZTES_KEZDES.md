# 🚀 Luminé Fejlesztés - Gyors Kezdési Útmutató

## 📋 Dokumentáció

Olvass el ezeket a dokumentumokat a fejlesztés megkezdése előtt:

1. **docs/18_kreta_fejlesztes_ajanlasok.md** ⭐ START HERE
   - Teljes fejlesztési terv
   - Prioritások
   - Ütemterv

2. **docs/19_szuloi_portal_implementacio.md**
   - Szülői portál részletes útmutató
   - Adatbázis séma
   - API végpontok
   - Frontend komponensek

3. **docs/20_ertesitesi_rendszer.md**
   - Értesítési rendszer
   - Email, Push, In-app
   - Implementáció

4. **docs/21_fejlesztes_osszefoglalo.md**
   - Projekt összefoglalása
   - Ütemterv
   - Költségbecslés

---

## 🎯 FÁZIS 1: Szülői Portál + Értesítések (2 hét)

### 1. Hét: Szülői Portál

#### Nap 1-2: Adatbázis & API
```bash
# 1. Firestore kollekciók létrehozása
# - parent_children
# - parent_notifications
# - parent_messages

# 2. API végpontok
# POST   /api/auth/parent-register
# POST   /api/auth/parent-login
# POST   /api/auth/link-child
# GET    /api/parent/dashboard
# GET    /api/parent/child/:childId/overview
# GET    /api/parent/child/:childId/grades
# GET    /api/parent/child/:childId/attendance
# GET    /api/parent/child/:childId/homework
```

#### Nap 3-4: Frontend
```bash
# 1. Parent layout
# src/app/parent/layout.tsx

# 2. Parent pages
# src/app/parent/dashboard/page.tsx
# src/app/parent/register/page.tsx
# src/app/parent/link-child/page.tsx

# 3. Komponensek
# src/components/parent/ChildOverviewCards.tsx
# src/components/parent/GradesChart.tsx
# src/components/parent/AttendanceCard.tsx
# src/components/parent/HomeworkCard.tsx
```

#### Nap 5: Tesztelés
```bash
# 1. Unit tesztek
# src/tests/parent.test.ts

# 2. E2E tesztek
# e2e/parent.spec.ts

# 3. Manuális tesztelés
```

### 2. Hét: Értesítési Rendszer

#### Nap 1-2: Backend
```bash
# 1. Notification model
# src/lib/notifications.ts

# 2. Email service
# - Nodemailer beállítása
# - Email sablonok

# 3. Push service
# - Firebase Cloud Messaging
# - Device token management

# 4. API végpontok
# GET    /api/notifications
# PUT    /api/notifications/:id/read
# DELETE /api/notifications/:id
# GET    /api/notifications/settings
# PUT    /api/notifications/settings
```

#### Nap 3-4: Frontend
```bash
# 1. Notification Center
# src/components/NotificationCenter.tsx

# 2. Notification Settings
# src/app/settings/notifications/page.tsx

# 3. Notification List
# src/app/notifications/page.tsx
```

#### Nap 5: Tesztelés & Integrálás
```bash
# 1. Notification triggers
# - Jegy beírása után
# - Mulasztás rögzítése után
# - Házi feladat kiadása után

# 2. Tesztelés
# - Email küldés
# - Push értesítések
# - In-app értesítések
```

---

## 🛠️ Fejlesztési Lépések

### 1. Szülői Portál API Implementálása

```typescript
// src/app/api/parent/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    // Szülő gyermekeinek lekérése
    const childrenSnapshot = await db
      .collection('parent_children')
      .where('parentId', '==', user.uid)
      .get()

    const children = []
    for (const doc of childrenSnapshot.docs) {
      const childData = doc.data()
      const childUser = await db.collection('users').doc(childData.childId).get()
      
      // Legutóbbi jegyek
      const gradesSnapshot = await db
        .collection('grades')
        .where('studentId', '==', childData.childId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()

      children.push({
        id: childData.childId,
        name: childUser.data().fullName,
        class: childUser.data().class,
        recentGrades: gradesSnapshot.docs.map(d => d.data()),
        // ... további adatok
      })
    }

    return NextResponse.json({ children })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}
```

### 2. Szülői Portál Frontend

```typescript
// src/app/parent/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { ChildOverviewCards } from '@/components/parent/ChildOverviewCards'

export default function ParentDashboard() {
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/parent/dashboard')
      const data = await response.json()
      setChildren(data.children)
      if (data.children.length > 0) {
        setSelectedChild(data.children[0].id)
      }
    } catch (error) {
      console.error('Dashboard betöltés sikertelen:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Betöltés...</div>

  return (
    <div className="space-y-6">
      {/* Gyermek választó */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {children.map(child => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedChild === child.id
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-slate-800'
            }`}
          >
            {child.name} ({child.class})
          </button>
        ))}
      </div>

      {/* Gyermek áttekintés */}
      {selectedChild && (
        <>
          <ChildOverviewCards childId={selectedChild} />
          {/* További komponensek */}
        </>
      )}
    </div>
  )
}
```

### 3. Értesítési Rendszer Backend

```typescript
// src/lib/notifications.ts
import { db } from '@/lib/firebase-admin'
import nodemailer from 'nodemailer'

export class NotificationService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ) {
    // Notification létrehozása
    const notification = {
      userId,
      type,
      title,
      message,
      data: data || {},
      read: false,
      createdAt: new Date()
    }

    const docRef = await db.collection('notifications').add(notification)

    // Email küldés
    const user = await db.collection('users').doc(userId).get()
    const userData = user.data()

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: `Luminé: ${title}`,
      html: this.generateEmailTemplate(title, message)
    })

    return docRef.id
  }

  private generateEmailTemplate(title: string, message: string): string {
    return `
      <h2>${title}</h2>
      <p>${message}</p>
      <a href="${process.env.APP_URL}/dashboard">Megtekintés</a>
    `
  }
}
```

---

## 📊 Tesztelési Checklist

### Szülői Portál
- [ ] Szülő regisztráció működik
- [ ] Gyermek összekapcsolása működik
- [ ] Dashboard betöltődik
- [ ] Jegyek megjelennek
- [ ] Mulasztások megjelennek
- [ ] Házi feladatok megjelennek
- [ ] Mobil nézet működik

### Értesítési Rendszer
- [ ] Email értesítések érkeznek
- [ ] Push értesítések érkeznek
- [ ] In-app értesítések megjelennek
- [ ] Notification Center működik
- [ ] Beállítások mentődnek
- [ ] Csendes órák működnek

---

## 🚀 Deployment

### Staging
```bash
npm run build
npm run start
# Tesztelés: https://staging.lumine.hu
```

### Production
```bash
# 1. Backup készítése
npm run backup

# 2. Production build
npm run build

# 3. Deployment
npm run deploy

# 4. Monitoring
npm run monitor
```

---

## 📞 Támogatás

- **Dokumentáció**: docs/
- **Issues**: GitHub Issues
- **Chat**: Discord/Slack
- **Email**: dev@lumine.hu

---

## 🎯 Következő Lépések

1. [ ] Dokumentáció elolvasása
2. [ ] Fejlesztési környezet beállítása
3. [ ] FÁZIS 1 kezdése
4. [ ] Heti standup meetingek
5. [ ] Napi progress tracking

---

**Sok sikert a fejlesztéshez! 🚀**
