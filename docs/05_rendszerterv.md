# 3.2 RENDSZERTERV

## 3.2.1 Architektúra

### Háromrétegű architektúra

```
┌─────────────────────────────────────┐
│     Prezentációs réteg (Frontend)   │
│  Next.js + React + TypeScript       │
│  - Komponensek                      │
│  - UI/UX                            │
│  - State management                 │
└─────────────────────────────────────┘
              ↕ HTTP/HTTPS
┌─────────────────────────────────────┐
│     Üzleti logika réteg (API)       │
│  Next.js API Routes                 │
│  - Autentikáció                     │
│  - Adatvalidáció                    │
│  - Üzleti szabályok                 │
└─────────────────────────────────────┘
              ↕ Firebase SDK
┌─────────────────────────────────────┐
│     Adatréteg (Backend)             │
│  Firebase                           │
│  - Firestore Database               │
│  - Authentication                   │
│  - Storage                          │
└─────────────────────────────────────┘
```

## 3.2.2 Technológiai stack

### Frontend
- **Next.js 14**: React framework server-side rendering-gel
- **React 18**: UI komponensek építése
- **TypeScript**: Típusbiztonság
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Komponens könyvtár
- **Lucide React**: Ikonok

### Backend
- **Firebase Authentication**: Felhasználókezelés
- **Firestore**: NoSQL adatbázis
- **Firebase Storage**: Fájlok tárolása (profilképek, mellékletek)
- **Firebase Admin SDK**: Szerver oldali műveletek

### Fejlesztői eszközök
- **Vitest**: Unit és komponens tesztek
- **Playwright**: E2E tesztek
- **ESLint**: Kód minőség ellenőrzés
- **Prettier**: Kód formázás
- **Git**: Verziókezelés

### Külső szolgáltatások
- **Cloudinary**: Képfeltöltés és optimalizálás
- **Vercel**: Hosting és deployment

## 3.2.3 Komponens diagram

```
┌─────────────────────────────────────────────┐
│              Dashboard (Main)               │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Header   │  │  Tabs    │  │ Profile  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         Tab Content Area            │   │
│  │  ┌────────────┐  ┌────────────┐    │   │
│  │  │  Schedule  │  │   Grades   │    │   │
│  │  └────────────┘  └────────────┘    │   │
│  │  ┌────────────┐  ┌────────────┐    │   │
│  │  │ Attendance │  │  Homework  │    │   │
│  │  └────────────┘  └────────────┘    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │           Modals                    │   │
│  │  - AttendanceModal                  │   │
│  │  - HomeworkModal                    │   │
│  │  - ChartModal                       │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 3.2.4 Adatfolyam diagram

```
Felhasználó
    ↓
┌─────────────┐
│   Login     │
└─────────────┘
    ↓
Firebase Auth
    ↓
┌─────────────┐
│  Dashboard  │ ← Firestore (user data)
└─────────────┘
    ↓
┌─────────────────────────────────┐
│  Funkció kiválasztása           │
│  - Jegyek                       │
│  - Órarend                      │
│  - Mulasztások                  │
│  - Házi feladatok               │
└─────────────────────────────────┘
    ↓
API Route (/api/*)
    ↓
Firestore Query
    ↓
Adat visszaadása
    ↓
UI frissítése
```

## 3.2.5 Deployment folyamat

```
Developer
    ↓
Git commit & push
    ↓
GitHub Repository
    ↓
Vercel (CI/CD)
    ↓
Automatikus build
    ↓
Tesztek futtatása
    ↓
Production deployment
    ↓
Live alkalmazás
```

## 3.2.6 Skálázhatóság

### Horizontális skálázás
- Vercel automatikus skálázás
- Firebase automatikus replikáció
- CDN használata statikus tartalmakhoz

### Vertikális optimalizálás
- Code splitting
- Lazy loading
- Image optimization
- Cache stratégiák
- Database indexing
