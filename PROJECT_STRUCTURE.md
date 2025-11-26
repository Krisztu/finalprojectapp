# Projekt Struktúra - Luminé

## Könyvtár Felépítés

```
d:\finalproject\
├── public/                          # Statikus fájlok
│   ├── favicon.ico                  # Alapértelmezett favicon
│   └── favicon.svg                  # SVG favicon Luminé logóval
├── src/                             # Forráskód
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API végpontok
│   │   │   ├── access/              # QR beléptetés API
│   │   │   │   └── route.ts
│   │   │   ├── admin/               # Admin funkciók
│   │   │   │   ├── clear/           # Adatbázis tisztítás
│   │   │   │   │   └── route.ts
│   │   │   │   ├── schedule-changes/ # Órarend módosítások
│   │   │   │   │   └── route.ts
│   │   │   │   └── sync-schedules/  # Órarend szinkronizáció
│   │   │   │       └── route.ts
│   │   │   ├── auth/                # Autentikáció
│   │   │   │   └── register/        # Felhasználó regisztráció
│   │   │   │       └── route.ts
│   │   │   ├── chat/                # Üzenőfal API
│   │   │   │   └── route.ts
│   │   │   ├── grades/              # Jegyek kezelése
│   │   │   │   └── route.ts
│   │   │   ├── lessons/             # Órarend kezelése
│   │   │   │   └── route.ts
│   │   │   ├── music/               # Suli Rádió API
│   │   │   │   └── route.ts
│   │   │   └── users/               # Felhasználók kezelése
│   │   │       └── route.ts
│   │   ├── dashboard/               # Főoldal
│   │   │   ├── layout.tsx           # Dashboard layout
│   │   │   └── page.tsx             # Dashboard komponens
│   │   ├── qr-scan/                 # QR kód olvasó
│   │   │   └── page.tsx
│   │   ├── globals.css              # Globális stílusok
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Kezdőlap
│   ├── components/                  # React komponensek
│   │   ├── admin/                   # Admin komponensek
│   │   │   └── ScheduleManager.tsx  # Órarend kezelő
│   │   └── ui/                      # Shadcn/ui komponensek
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── contexts/                    # React Context providers
│   │   └── AuthContext.tsx          # Firebase Auth context
│   └── lib/                         # Utility könyvtárak
│       ├── auth-middleware.ts       # API autentikáció
│       ├── demo-users.ts            # Fix felhasználók
│       ├── firebase-admin.ts        # Firebase Admin SDK
│       ├── firebase.ts              # Firebase Client SDK
│       └── utils.ts                 # Általános utilities
├── .env.local                       # Környezeti változók (gitignore)
├── .gitignore                       # Git ignore szabályok
├── firestore.rules                  # Firebase Firestore szabályok
├── next.config.js                   # Next.js konfiguráció
├── package.json                     # NPM függőségek
├── package-lock.json                # NPM lock fájl
├── postcss.config.js                # PostCSS konfiguráció
├── tailwind.config.js               # Tailwind CSS konfiguráció
├── tsconfig.json                    # TypeScript konfiguráció
├── COMPONENTS.md                    # Komponens registry
├── DOCUMENTATION.md                 # Projekt dokumentáció
├── PROJECT_STRUCTURE.md             # Ez a fájl
└── SECURITY.md                      # Biztonsági dokumentáció
```

## Fájl Típusok és Szerepük

### TypeScript Fájlok (.ts/.tsx)
- **API Routes**: Next.js API végpontok
- **React Components**: UI komponensek JSX-szel
- **Contexts**: React Context providers
- **Libraries**: Utility funkciók és konfigurációk

### Konfigurációs Fájlok
- **next.config.js**: Next.js beállítások
- **tailwind.config.js**: Tailwind CSS testreszabás
- **tsconfig.json**: TypeScript compiler beállítások
- **postcss.config.js**: CSS post-processing
- **firestore.rules**: Firebase biztonsági szabályok

### Stílus Fájlok
- **globals.css**: Globális CSS és Tailwind importok
- **Tailwind Classes**: Utility-first CSS framework

## Adatáramlás

### 1. Autentikáció
```
User Login → Firebase Auth → AuthContext → Dashboard
```

### 2. Adatlekérdezés
```
Dashboard → API Route → Firebase Admin → Firestore → Response
```

### 3. Szerepkör Ellenőrzés
```
API Request → Auth Middleware → Role Check → Handler Function
```

## Komponens Hierarchia

### Főoldal Struktúra
```
Dashboard (page.tsx)
├── Header (beépített)
├── Tabs Navigation
├── TabsContent
│   ├── Dashboard Tab
│   ├── Schedule Tab
│   ├── Grades Tab (student)
│   ├── Teacher Grades Tab (teacher)
│   ├── Radio Tab
│   ├── Chat Tab
│   ├── QR Tab
│   ├── Admin Tab (admin)
│   ├── Users Tab (admin)
│   └── Profile Tab
└── Footer (cookie consent)
```

### Admin Komponensek
```
ScheduleManager
├── Schedule Grid
├── Time Slots
├── Class Selection
├── Lesson Form
└── Change Management
```

## API Végpont Csoportosítás

### Nyilvános API-k
- `/api/auth/register` - Regisztráció

### Autentikált API-k
- `/api/users` - Felhasználók
- `/api/lessons` - Órarend
- `/api/grades` - Jegyek
- `/api/chat` - Üzenőfal
- `/api/music` - Zene kérések
- `/api/access` - QR beléptetés

### Admin API-k
- `/api/admin/clear` - Adatbázis tisztítás
- `/api/admin/schedule-changes` - Órarend módosítások
- `/api/admin/sync-schedules` - Szinkronizáció

## Adatbázis Kapcsolatok

### Firestore Collections
```
users/
├── {userId}
│   ├── email: string
│   ├── fullName: string
│   ├── role: string
│   ├── class?: string
│   └── subject?: string

lessons/
├── {lessonId}
│   ├── userId: string
│   ├── subject: string
│   ├── teacher: string
│   ├── dayOfWeek: number
│   └── timeSlot: string

grades/
├── {gradeId}
│   ├── studentId: string
│   ├── subject: string
│   ├── grade: number
│   ├── teacher: string
│   └── date: string

scheduleChanges/
├── {changeId}
│   ├── date: string
│   ├── timeSlot: string
│   ├── type: string
│   └── ...changes
```

## Deployment Struktúra

### Vercel Deployment
```
Build Process:
1. npm install
2. npm run build
3. Static generation
4. API routes compilation
5. Deployment to CDN
```

### Environment Variables
- Development: `.env.local`
- Production: Vercel dashboard
- Firebase: Console settings

## Fejlesztési Workflow

### 1. Feature Development
```
1. Create feature branch
2. Implement changes
3. Test locally
4. Create pull request
5. Code review
6. Merge to main
7. Auto-deploy
```

### 2. Database Changes
```
1. Update Firestore rules
2. Test in development
3. Deploy rules to production
4. Update API endpoints
5. Test end-to-end
```

---
*Utolsó frissítés: 2024-01-XX*
*Struktúra verzió: 1.0.0*