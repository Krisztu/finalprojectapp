# 📋 Viselkedési Értékelés & Admin Statisztikák - Teljes Terv

## 🎯 Cél

Két új funkció implementálása:
1. **Viselkedési Értékelés** - Tanárok rögzítik a diákok viselkedését
2. **Admin Statisztikák** - Admin látja az iskola teljes adatait

---

## 📊 Funkciók Összefoglalása

### 1️⃣ Viselkedési Értékelés

**Mit csinál**:
- Tanár rögzít viselkedést (pozitív/negatív)
- Diák látja saját viselkedési történetét
- Szülő értesítést kap negatív viselkedésről
- Trend követés (pontok, kategóriák)

**Felhasználók**:
- Tanár: Rögzít
- Diák: Megtekint
- Szülő: Értesítést kap

**Munkaóra**: ~20 óra

---

### 2️⃣ Admin Statisztikák

**Mit csinál**:
- Felhasználó statisztikák (diákok, tanárok, szülők)
- Jegy statisztikák (átlag, eloszlás, trend)
- Mulasztás statisztikák (jelenlét %)
- Viselkedés statisztikák (pozitív/negatív)
- Grafikonok (Recharts - ugyanaz mint jegyeknél)

**Felhasználók**:
- Admin: Megtekint

**Munkaóra**: ~15 óra

---

## 📁 Fájlok & Könyvtárak

### Viselkedési Értékelés
```
src/
├── app/
│   ├── api/behavior/route.ts
│   ├── dashboard/page.tsx (behavior tab)
│   └── behavior/page.tsx (diák nézet)
├── components/
│   ├── teacher/BehaviorRecorder.tsx
│   ├── BehaviorView.tsx
│   └── BehaviorChart.tsx
└── lib/
    └── behaviorService.ts

Firestore:
├── behavior_records/
└── users/{studentId}/behavior_summary/
```

### Admin Statisztikák
```
src/
├── app/
│   ├── api/admin/statistics/route.ts
│   └── admin/statistics/page.tsx
├── components/
│   └── admin/StatisticsCharts.tsx
└── lib/
    └── statisticsService.ts

Firestore:
└── system_statistics/
```

---

## 🔄 Implementációs Lépések

### FÁZIS 1: Viselkedési Értékelés (3 nap)

#### Nap 1: Backend
```bash
# 1. Behavior model
# 2. BehaviorService
# 3. API végpontok (POST, GET, PUT, DELETE)
# 4. Szülő értesítés trigger
```

**Fájlok**:
- `src/lib/behaviorService.ts`
- `src/app/api/behavior/route.ts`

#### Nap 2: Frontend
```bash
# 1. BehaviorRecorder komponens (tanár)
# 2. BehaviorView komponens (diák/szülő)
# 3. BehaviorChart komponens (trend)
# 4. Tanár dashboard tab
```

**Fájlok**:
- `src/components/teacher/BehaviorRecorder.tsx`
- `src/components/BehaviorView.tsx`
- `src/components/BehaviorChart.tsx`

#### Nap 3: Tesztelés
```bash
# 1. Unit tesztek
# 2. E2E tesztek
# 3. Manuális tesztelés
```

---

### FÁZIS 2: Admin Statisztikák (2 nap)

#### Nap 1: Backend
```bash
# 1. StatisticsService
# 2. API végpontok
# 3. Napi statisztikák generálása
```

**Fájlok**:
- `src/lib/statisticsService.ts`
- `src/app/api/admin/statistics/route.ts`

#### Nap 2: Frontend
```bash
# 1. Admin Statistics Dashboard
# 2. Grafikonok (Recharts)
# 3. Stat Cards
# 4. Tesztelés
```

**Fájlok**:
- `src/app/admin/statistics/page.tsx`

---

## 📊 Adatbázis Séma

### Viselkedési Értékelés
```typescript
// behavior_records
{
  id: string
  studentId: string
  studentName: string
  type: 'positive' | 'negative'
  category: 'discipline' | 'cooperation' | 'participation' | 'respect'
  description: string
  points: number // +1 vagy -1
  recordedBy: string
  createdAt: Date
  parentNotified: boolean
}

// users/{studentId}/behavior_summary
{
  totalPoints: number
  positiveCount: number
  negativeCount: number
  byCategory: { ... }
  thisMonth: number
  lastMonth: number
}
```

### Admin Statisztikák
```typescript
// system_statistics/{date}
{
  date: string
  users: { total, students, teachers, parents, admins, djs }
  grades: { total, average, byGrade: { 1, 2, 3, 4, 5 } }
  attendance: { total, present, absent, excused, percentage }
  homework: { total, submitted, pending, overdue }
  behavior: { positive, negative, average }
  system: { activeUsers, apiCalls, errors, uptime }
}
```

---

## 🎨 UI Komponensek

### Viselkedési Értékelés

#### BehaviorRecorder (Tanár)
```
┌─────────────────────────────────┐
│ Viselkedés Rögzítése - Diák Név │
├─────────────────────────────────┤
│ [✅ Pozitív] [❌ Negatív]       │
│                                 │
│ Kategória: [Együttműködés ▼]   │
│                                 │
│ Leírás:                         │
│ [Szöveg mező...]                │
│                                 │
│ [Rögzítés gomb]                 │
└─────────────────────────────────┘
```

#### BehaviorView (Diák/Szülő)
```
┌──────────────────────────────────────┐
│ Viselkedési Összefoglalás            │
├──────────────────────────────────────┤
│ Pont: +5  │ Pozitív: 8 │ Negatív: 3 │
├──────────────────────────────────────┤
│ Viselkedési Történet                 │
│                                      │
│ ✅ Együttműködés +1                  │
│    Jó csapatmunka az órán            │
│    2024-01-15                        │
│                                      │
│ ❌ Fegyelem -1                       │
│    Késés az órára                    │
│    2024-01-14                        │
└──────────────────────────────────────┘
```

### Admin Statisztikák

#### Dashboard
```
┌─────────────────────────────────────────┐
│ Admin Statisztikák                      │
├─────────────────────────────────────────┤
│ [Áttekintés] [Felhasználók] [Jegyek]   │
│ [Mulasztások] [Viselkedés]              │
├─────────────────────────────────────────┤
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ 👥 250   │ │ 👨🎓 180 │ │ 👨🏫 50  │ │
│ │ Felhasználó│ │ Diák    │ │ Tanár    │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                         │
│ [Trend grafikon - Felhasználók]         │
│ [Jegyek eloszlása - Pie chart]          │
│ [Top osztályok - Bar chart]             │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔌 API Végpontok

### Viselkedési Értékelés
```
POST   /api/behavior                    # Rögzítés
GET    /api/behavior?studentId=xxx      # Lekérés
PUT    /api/behavior/:id                # Szerkesztés
DELETE /api/behavior/:id                # Törlés
GET    /api/behavior/class/:className   # Osztály statisztikák
GET    /api/behavior/trend?studentId=xxx # Trend
```

### Admin Statisztikák
```
GET    /api/admin/statistics            # Teljes statisztikák
GET    /api/admin/statistics/users      # Felhasználó statisztikák
GET    /api/admin/statistics/grades     # Jegy statisztikák
GET    /api/admin/statistics/attendance # Mulasztás statisztikák
GET    /api/admin/statistics/behavior   # Viselkedés statisztikák
```

---

## 📋 Tesztelési Checklist

### Viselkedési Értékelés
- [ ] Tanár rögzíthet viselkedést
- [ ] Diák látja saját viselkedését
- [ ] Szülő értesítést kap negatív viselkedésről
- [ ] Pontok helyesen számolódnak
- [ ] Trend grafikon működik
- [ ] Kategóriák szűrése működik
- [ ] Mobil nézet működik

### Admin Statisztikák
- [ ] Statisztikák helyesen számolódnak
- [ ] Grafikonok megjelennek
- [ ] Trend adatok helyesek
- [ ] Top/Bottom lista működik
- [ ] Szűrés működik
- [ ] Mobil nézet működik
- [ ] Napi statisztikák generálódnak

---

## ⏱️ Teljes Ütemterv

```
Nap 1:  Viselkedési Értékelés - Backend (8 óra)
Nap 2:  Viselkedési Értékelés - Frontend (8 óra)
Nap 3:  Viselkedési Értékelés - Tesztelés (4 óra)
Nap 4:  Admin Statisztikák - Backend (8 óra)
Nap 5:  Admin Statisztikák - Frontend (7 óra)

Összesen: ~35 óra
```

---

## 📚 Dokumentáció

Részletes útmutatók:
- `docs/22_viselkedes_ertekeles.md` - Viselkedési értékelés
- `docs/23_admin_statisztikak.md` - Admin statisztikák

---

## 🎯 Prioritás

| Funkció | Szükséges | Munkaóra | Prioritás |
|---------|-----------|----------|-----------|
| **Viselkedési értékelés** | ✅ | 20 | 🟡 7 |
| **Admin statisztikák** | ✅ | 15 | 🟡 10 |

---

## 💡 Megjegyzések

1. **Viselkedési értékelés**: Szülő értesítés csak negatív viselkedésre
2. **Admin statisztikák**: Napi automatikus generálás (cron job)
3. **Grafikonok**: Recharts (ugyanaz mint jegyeknél)
4. **Trend**: 30 napos adatok tárolása

---

*Utolsó frissítés: 2024*
