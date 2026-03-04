# 🚀 Implementációs Terv - 3 Új Funkció

## 📋 Áttekintés

**Implementálandó funkciók:**
1. **Igazgatói Role** - Csak olvasási jogosultság + igazgatói dicséret/figyelmeztetés
2. **Szülői Role** - Szülői portál OM azonosítóval
3. **Viselkedés Értékelés** - Magyar oktatási rendszer (szaktanári/osztályfőnöki/igazgatói)

**Becsült teljes idő: 45-50 óra (6 munkanap)**

**FONTOS:** Az OM azonosító (studentId) már létezik a rendszerben! A diák regisztrációnál "Oktatási azonosító" néven van bekérve.

---

## 🔍 Projekt Elemzés

### Jelenlegi Állapot
- ✅ Firebase Auth + Firestore adatbázis
- ✅ Role-based rendszer (admin, teacher, homeroom_teacher, student, dj)
- ✅ Dashboard komponens role alapú megjelenítéssel
- ✅ Auth middleware (verifyAuth, requireRole)
- ✅ User management API (/api/users)
- ✅ Grades, Attendance, Homework rendszerek működnek

### Hiányzó Elemek
- ❌ Principal (igazgató) role
- ❌ Parent (szülő) role
- ✅ OM azonosító mező (studentId) - már létezik a User modellben
- ❌ Parent-Child kapcsolótábla
- ❌ Behavior (viselkedés) adatbázis és API
- ❌ Igazgatói dashboard
- ❌ Szülői dashboard
- ❌ Viselkedés rögzítő komponensek

---

## 📦 1. FÁZIS: Adatbázis és Backend (15-18 óra)

### 1.1 User Model Bővítése (1 óra)

**Fájlok:**
- `src/shared/types/user.ts` (új fájl)
- `src/app/api/auth/register/route.ts` (módosítás - már tartalmazza a studentId-t)

**Megjegyzés:** Az OM azonosító (studentId) már létezik a rendszerben! A diák regisztrációnál "Oktatási azonosító" néven van bekérve (11 számjegy).

**Feladatok:**
```typescript
// User interface bővítése
interface User {
  id: string
  email: string
  role: 'admin' | 'principal' | 'teacher' | 'homeroom_teacher' | 'student' | 'parent' | 'dj'
  fullName: string
  name?: string
  
  // Diák specifikus
  studentId?: string // ✅ MÁR LÉTEZIK - OM azonosító (11 jegyű szám)
  class?: string
  
  // Szülő specifikus
  children?: string[] // childId-k
  phone?: string
  address?: string
  
  // Tanár specifikus
  subject?: string
  classes?: string[]
  
  // Közös
  profileImage?: string
  createdAt: Date
  updatedAt?: Date
}
```

**Firestore Rules frissítése:**
```javascript
// firestore.rules
match /users/{userId} {
  allow read: if request.auth != null && 
    (request.auth.token.role == 'admin' || 
     request.auth.token.role == 'principal' ||
     request.auth.uid == userId);
  
  allow write, delete: if request.auth != null && 
    request.auth.token.role == 'admin';
}
```

### 1.2 Parent-Child Kapcsolótábla (2 óra)

**Megjegyzés:** Az OM azonosító (studentId) már létezik, így a szülő-gyermek kapcsolat egyszerűbb lesz!

**Fájlok:**
- `src/app/api/parent/link-child/route.ts` (új)
- `src/app/api/parent/children/route.ts` (új)
- `src/lib/parentLinkService.ts` (új)

**Firestore Struktúra:**
```
/parent_children/{parentId}__{childId}
  - parentId: string
  - childId: string
  - childName: string
  - childClass: string
  - childStudentId: string // ✅ OM azonosító (már létező mező)
  - relationship: 'anya' | 'apa' | 'gyam' | 'egyeb'
  - linkedAt: Date
  - verified: boolean
```

**API Végpontok:**
- `POST /api/parent/link-child` - Gyermek hozzákapcsolása OM azonosítóval (studentId alapján keresés)
- `GET /api/parent/children` - Szülő gyermekeinek lekérése
- `DELETE /api/parent/unlink-child/:childId` - Kapcsolat törlése

**Implementáció:**
```typescript
// POST /api/parent/link-child
// 1. Szülő megadja a gyermek OM azonosítóját (studentId)
// 2. Keresés a users táblában: studentId === input
// 3. Ha találat: parent_children rekord létrehozása
// 4. Szülő children[] array frissítése
```

### 1.3 Behavior (Viselkedés) Rendszer (5 óra)

**Fájlok:**
- `src/app/api/behavior/route.ts` (új)
- `src/lib/behaviorService.ts` (új)
- `src/shared/types/behavior.ts` (új)

**Firestore Struktúra:**
```
/behavior_records/{recordId}
  - id: string
  - studentId: string
  - studentName: string
  - studentClass: string
  - type: 'dicseret' | 'figyelmezetes'
  - level: 'szaktanari' | 'osztalyfonoki' | 'igazgatoi'
  - description: string
  - reason: string
  - recordedBy: string
  - recordedByName: string
  - recordedByRole: 'teacher' | 'class_teacher' | 'principal'
  - createdAt: Date
  - parentNotified: boolean
  - actionTaken?: string

/users/{studentId}/behavior_summary
  - dicseretCount: number
  - szaktanariDicseret: number
  - osztalyfonokiDicseret: number
  - igazgatoiDicseret: number
  - figyelmeztetesCount: number
  - szaktanariFigyelmezetes: number
  - osztalyfonokiFigyelmezetes: number
  - igazgatoiFigyelmezetes: number
  - updatedAt: Date
```

**API Végpontok:**
- `POST /api/behavior` - Viselkedés rögzítése (jogosultság ellenőrzéssel)
- `GET /api/behavior?studentId=xxx` - Diák viselkedéseinek lekérése
- `GET /api/behavior/class/:className` - Osztály statisztikák
- `PUT /api/behavior/:id` - Módosítás (csak admin)
- `DELETE /api/behavior/:id` - Törlés (csak admin)

### 1.4 Auth Middleware Bővítése (2 óra)

**Fájlok:**
- `src/lib/auth-middleware.ts` (módosítás)

**Új funkciók:**
```typescript
export function canModify(user: any) {
  return user.role === 'admin'
}

export function canDelete(user: any) {
  return user.role === 'admin'
}

export function canViewStats(user: any) {
  return ['admin', 'principal'].includes(user.role)
}

export function canGiveBehaviorRecord(user: any, level: string) {
  if (level === 'szaktanari') {
    return ['teacher', 'homeroom_teacher'].includes(user.role)
  }
  if (level === 'osztalyfonoki') {
    return user.role === 'homeroom_teacher'
  }
  if (level === 'igazgatoi') {
    return user.role === 'principal'
  }
  return false
}
```

### 1.5 Notification Service Bővítése (3 óra)

**Fájlok:**
- `src/lib/notificationService.ts` (új vagy módosítás)

**Funkciók:**
- Szülő értesítése figyelmeztetésről
- Email/push notification integráció (opcionális)

---

## 🎨 2. FÁZIS: Frontend Komponensek (20-25 óra)

### 2.1 Igazgatói Dashboard (6 óra)

**Fájlok:**
- `src/app/principal/dashboard/page.tsx` (új)
- `src/components/principal/StatisticsView.tsx` (új)
- `src/components/principal/TeachersView.tsx` (új)
- `src/components/principal/StudentsView.tsx` (új)
- `src/components/principal/BehaviorView.tsx` (új)

**Komponens Struktúra:**
```
/principal/dashboard
├── Statisztikák (readOnly)
├── Tanárok (readOnly)
├── Diákok (readOnly)
├── Osztályok (readOnly)
├── Jegyek (readOnly)
├── Mulasztások (readOnly)
└── Viselkedés (readOnly + igazgatói értékelés)
```

**Implementáció:**
1. Tabs komponens 7 tabbal
2. Minden tab readOnly prop-pal
3. Viselkedés tab: form igazgatói dicséret/figyelmeztetéshez
4. Törlés/szerkesztés gombok elrejtése
5. Info banner: "Csak megtekintési jogosultság"

### 2.2 Szülői Dashboard (8 óra)

**Fájlok:**
- `src/app/parent/dashboard/page.tsx` (új)
- `src/components/parent/LinkChildForm.tsx` (új)
- `src/components/parent/ChildrenList.tsx` (új)
- `src/components/parent/ChildOverview.tsx` (új)
- `src/components/parent/ChildGrades.tsx` (új)
- `src/components/parent/ChildAttendance.tsx` (új)
- `src/components/parent/ChildBehavior.tsx` (új)

**Komponens Struktúra:**
```
/parent/dashboard
├── Gyermekeim (lista + hozzáadás OM azonosítóval)
├── Gyermek választó (dropdown)
└── Kiválasztott gyermek adatai:
    ├── Áttekintés (átlagok, statisztikák)
    ├── Jegyek
    ├── Mulasztások
    ├── Viselkedés
    └── Házi feladatok
```

**Implementáció:**
1. Gyermek hozzáadása form (OM azonosító + kapcsolat típusa)
2. Gyermekek listája (card-ok)
3. Gyermek választó dropdown
4. Tab rendszer a gyermek adataihoz
5. Minden adat csak olvasható

### 2.3 Viselkedés Komponensek (6 óra)

**Fájlok:**
- `src/components/behavior/BehaviorRecorder.tsx` (új)
- `src/components/behavior/BehaviorView.tsx` (új)
- `src/components/behavior/BehaviorList.tsx` (új)
- `src/components/behavior/BehaviorStats.tsx` (új)

**Komponensek:**

1. **BehaviorRecorder** (Tanár/Igazgató)
   - Diák választó
   - Típus: Dicséret/Figyelmeztetés
   - Szint: Szaktanári/Osztályfőnöki/Igazgatói (jogosultság alapján)
   - Leírás + Indoklás
   - Intézkedés (figyelmeztetésnél)

2. **BehaviorView** (Diák/Szülő)
   - Összefoglaló kártyák (dicséretek/figyelmeztetések száma)
   - Lista szintenkénti bontásban
   - Időrendi sorrend

3. **BehaviorStats** (Admin/Igazgató)
   - Osztály statisztikák
   - Top diákok (legtöbb dicséret)
   - Figyelmet igénylők (legtöbb figyelmeztetés)

### 2.4 Dashboard Integráció (5 óra)

**Fájlok:**
- `src/app/dashboard/page.tsx` (módosítás)
- `src/contexts/AuthContext.tsx` (módosítás)

**Feladatok:**
1. Principal és Parent role kezelése
2. Routing: `/principal/dashboard` és `/parent/dashboard`
3. Viselkedés tab hozzáadása tanári dashboardhoz
4. Role-based navigation
5. Header frissítése (role megjelenítés)

---

## 🧪 3. FÁZIS: Tesztelés és Finomítás (5-7 óra)

### 3.1 Backend Tesztelés (2 óra)

**Tesztelendő:**
- [ ] OM azonosító validálás (11 számjegy)
- [ ] Parent-Child kapcsolat létrehozása
- [ ] Behavior API jogosultság ellenőrzés
- [ ] Szülő értesítés figyelmeztetésről
- [ ] Behavior summary frissítés

### 3.2 Frontend Tesztelés (2 óra)

**Tesztelendő:**
- [ ] Igazgatói dashboard minden tab működik
- [ ] Szülői dashboard gyermek hozzáadás
- [ ] Viselkedés rögzítés jogosultság alapján
- [ ] Dark mode működik mindenhol
- [ ] Responsive design (mobil/tablet/desktop)

### 3.3 Integráció Tesztelés (1 óra)

**Tesztelendő:**
- [ ] Tanár ad szaktanári figyelmeztetést → Szülő értesítést kap
- [ ] Igazgató ad igazgatói dicséretet → Megjelenik diáknál
- [ ] Szülő látja gyermeke viselkedését
- [ ] Admin törölhet viselkedési rekordot

### 3.4 Dokumentáció (2 óra)

**Frissítendő:**
- [ ] README.md - új funkciók leírása
- [ ] API dokumentáció
- [ ] Felhasználói útmutató
- [ ] Changelog

---

## 📅 Implementációs Sorrend

### Nap 1-2: Backend Alapok (14 óra)
1. ✅ User model bővítése (parent role) - studentId már létezik! (1h)
2. ✅ Parent-Child kapcsolótábla (2h) API
3. ✅ Behavior adatbázis struktúra
4. ✅ Behavior API végpontok
5. ✅ Auth middleware bővítése
6. ✅ Firestore rules frissítése

### Nap 3: Igazgatói Felület (8 óra)
1. ✅ Principal dashboard layout
2. ✅ StatisticsView (readOnly)
3. ✅ TeachersView, StudentsView (readOnly)
4. ✅ BehaviorView (igazgatói értékelés)
5. ✅ Routing és navigation

### Nap 4: Szülői Felület (8 óra)
1. ✅ Parent dashboard layout
2. ✅ LinkChildForm (OM azonosító)
3. ✅ ChildrenList
4. ✅ ChildOverview, ChildGrades, ChildAttendance
5. ✅ ChildBehavior

### Nap 5: Viselkedés Komponensek (8 óra)
1. ✅ BehaviorRecorder (tanár/igazgató)
2. ✅ BehaviorView (diák/szülő)
3. ✅ BehaviorStats (admin/igazgató)
4. ✅ Dashboard integráció (viselkedés tab)
5. ✅ Notification service

### Nap 6: Tesztelés és Finomítás (7 óra)
1. ✅ Backend tesztelés
2. ✅ Frontend tesztelés
3. ✅ Integráció tesztelés
4. ✅ Bug fixes
5. ✅ Dokumentáció

---

## 🔗 Függőségek és Kapcsolatok

### Adatfolyam: Viselkedés Rögzítése

```
Tanár/Igazgató
    ↓
BehaviorRecorder komponens
    ↓
POST /api/behavior
    ↓
behaviorService.recordBehavior()
    ↓
├─→ Firestore: behavior_records/{id}
├─→ Firestore: users/{studentId}/behavior_summary
└─→ notificationService (ha figyelmeztetés)
    ↓
    Szülő értesítés
```

### Adatfolyam: Szülő-Gyermek Összekapcsolás

```
Szülő
    ↓
LinkChildForm (OM azonosító)
    ↓
POST /api/parent/link-child
    ↓
parentLinkService.linkChild()
    ↓
├─→ Keresés: users (omAzonosito)
├─→ Firestore: parent_children/{parentId}__{childId}
├─→ Firestore: users/{parentId} (children array)
└─→ Firestore: users/{childId} (parents array)
```

### Jogosultság Ellenőrzés

```
API Request
    ↓
verifyAuth(request)
    ↓
├─→ canModify(user) → csak admin
├─→ canDelete(user) → csak admin
├─→ canViewStats(user) → admin + principal
└─→ canGiveBehaviorRecord(user, level)
    ├─→ szaktanari → teacher + homeroom_teacher
    ├─→ osztalyfonoki → homeroom_teacher
    └─→ igazgatoi → principal
```

---

## ⚠️ Kritikus Pontok

### 1. OM Azonosító Validálás
```typescript
// Pontosan 11 számjegy
if (!/^\d{11}$/.test(omAzonosito)) {
  throw new Error('Érvénytelen OM azonosító')
}
```

### 2. Jogosultság Ellenőrzés
```typescript
// Viselkedés rögzítésnél
if (level === 'igazgatoi' && user.role !== 'principal') {
  return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 })
}
```

### 3. Szülő Értesítés
```typescript
// Csak figyelmeztetésnél
if (data.type === 'figyelmezetes') {
  await notifyParent(studentId, level, description)
}
```

### 4. Dark Mode Öröklés
```typescript
// Iframe-ben is működjön
const isDarkParam = searchParams.get('dark') === 'true'
useEffect(() => {
  document.documentElement.classList.toggle('dark', isDarkParam)
}, [isDarkParam])
```

---

## 📊 Becsült Időigény Részletesen

| Feladat | Becsült idő | Prioritás |
|---------|-------------|-----------|
| User model + OM azonosító | 2 óra | Magas |
| Parent-Child API | 3 óra | Magas |
| Behavior API | 5 óra | Magas |
| Auth middleware | 2 óra | Magas |
| Notification service | 3 óra | Közepes |
| Igazgatói dashboard | 6 óra | Magas |
| Szülői dashboard | 8 óra | Magas |
| Viselkedés komponensek | 6 óra | Magas |
| Dashboard integráció | 5 óra | Magas |
| Tesztelés | 5 óra | Magas |
| Dokumentáció | 2 óra | Közepes |
| **ÖSSZESEN** | **47 óra** | - |

---

## ✅ Ellenőrző Lista

### Backend
- [ ] User interface bővítve (omAzonosito, parent role)
- [ ] parent_children collection létrehozva
- [ ] behavior_records collection létrehozva
- [ ] behavior_summary subcollection létrehozva
- [ ] POST /api/parent/link-child
- [ ] GET /api/parent/children
- [ ] POST /api/behavior (jogosultság ellenőrzéssel)
- [ ] GET /api/behavior
- [ ] Auth middleware: canModify, canDelete, canViewStats
- [ ] Firestore rules frissítve
- [ ] Notification service működik

### Frontend - Igazgatói
- [ ] /principal/dashboard route
- [ ] StatisticsView (readOnly)
- [ ] TeachersView (readOnly)
- [ ] StudentsView (readOnly)
- [ ] BehaviorView (igazgatói értékelés)
- [ ] Törlés/szerkesztés gombok elrejtve
- [ ] Dark mode működik

### Frontend - Szülői
- [ ] /parent/dashboard route
- [ ] LinkChildForm (OM azonosító)
- [ ] ChildrenList
- [ ] Gyermek választó
- [ ] ChildOverview
- [ ] ChildGrades (readOnly)
- [ ] ChildAttendance (readOnly)
- [ ] ChildBehavior (readOnly)
- [ ] Dark mode működik

### Frontend - Viselkedés
- [ ] BehaviorRecorder (tanár/igazgató)
- [ ] BehaviorView (diák/szülő)
- [ ] BehaviorStats (admin/igazgató)
- [ ] Viselkedés tab a tanári dashboardon
- [ ] Jogosultság alapú szint választás
- [ ] Dark mode működik

### Tesztelés
- [ ] OM azonosító validálás
- [ ] Parent-Child kapcsolat
- [ ] Viselkedés rögzítés jogosultság
- [ ] Szülő értesítés
- [ ] Igazgatói dashboard minden funkció
- [ ] Szülői dashboard minden funkció
- [ ] Responsive design
- [ ] Dark mode mindenhol

---

## 🎯 Összefoglalás

**3 fő funkció implementálása:**
1. ✅ Igazgatói role (csak olvasás + igazgatói értékelés)
2. ✅ Szülői role (OM azonosítós összekapcsolás)
3. ✅ Viselkedés értékelés (magyar rendszer)

**Teljes becsült idő: 47 óra (6 munkanap)**

**Kritikus függőségek:**
- User model → Parent-Child → Szülői dashboard
- User model → Behavior → Viselkedés komponensek
- Auth middleware → Minden új funkció

**Ajánlott sorrend:**
1. Backend alapok (User, Parent-Child, Behavior)
2. Igazgatói felület (egyszerűbb, readOnly)
3. Viselkedés komponensek (közös tanár/igazgató/diák/szülő)
4. Szülői felület (összetettebb, több komponens)
5. Tesztelés és finomítás

---

*Készítette: AI Asszisztens*
*Dátum: 2024*
*Verzió: 1.0*
