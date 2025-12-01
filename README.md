# Luminé - Iskolai Menedzsment Rendszer

## 📋 Projekt Áttekintés

A **Luminé** egy modern, Firebase-alapú iskolai menedzsment rendszer, amely a GSZI alkalmazásból fejlődött ki. A rendszer role-based hozzáférés-vezérléssel, egyéni órarend kezeléssel és valós idejű adatszinkronizációval rendelkezik.

### 🎯 Főbb Funkciók
- **Szerepkör-alapú hozzáférés**: Admin, Tanár, Osztályfőnök, Diák, DJ
- **Egyéni órarendek**: Felhasználónkénti személyre szabott órarend
- **Jegy kezelés**: Tanári jegyadás és diák jegymegtekintés
- **Házi feladat rendszer**: Feladatkiadás és beadás kezelés
- **Mulasztás nyilvántartás**: Jelenléti ív és igazolások
- **Üzenőfal**: Valós idejű kommunikáció
- **Suli Rádió**: Zene kérések kezelése
- **QR beléptetés**: Digitális beléptetési rendszer

## 🏗️ Technológiai Stack

### Frontend
- **Next.js 14** - React framework App Router-rel
- **React 18** - UI könyvtár
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI komponensek

### Backend
- **Next.js API Routes** - Serverless API végpontok
- **Firebase Firestore** - NoSQL adatbázis
- **Firebase Authentication** - Felhasználó autentikáció
- **Firebase Admin SDK** - Server-side Firebase műveletek

### Deployment
- **Vercel** - Hosting és CI/CD
- **Firebase Hosting** - Alternatív hosting opció

## 📁 Projekt Struktúra

```
finalproject/
├── public/                          # Statikus fájlok
│   ├── favicon.ico                  # Alapértelmezett favicon
│   └── favicon.svg                  # SVG favicon Luminé logóval
├── src/                             # Forráskód
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API végpontok
│   │   │   ├── access/              # QR beléptetés
│   │   │   ├── admin/               # Admin funkciók
│   │   │   │   ├── clear/           # Adatbázis tisztítás
│   │   │   │   ├── schedule-changes/ # Órarend módosítások
│   │   │   │   └── sync-schedules/  # Órarend szinkronizáció
│   │   │   ├── attendance/          # Mulasztások
│   │   │   ├── auth/register/       # Regisztráció
│   │   │   ├── chat/                # Üzenőfal
│   │   │   ├── excuses/             # Igazolások
│   │   │   ├── grades/              # Jegyek
│   │   │   ├── homework/            # Házi feladatok
│   │   │   ├── homework-submissions/ # Beadások
│   │   │   ├── lessons/             # Órarend
│   │   │   ├── music/               # Suli Rádió
│   │   │   └── users/               # Felhasználók
│   │   ├── dashboard/               # Főoldal
│   │   ├── qr-scan/                 # QR kód olvasó
│   │   ├── globals.css              # Globális stílusok
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Kezdőlap
│   ├── components/                  # React komponensek
│   │   ├── admin/                   # Admin komponensek
│   │   │   └── ScheduleManager.tsx  # Órarend kezelő
│   │   └── ui/                      # Shadcn/ui komponensek
│   ├── contexts/                    # React Context providers
│   │   └── AuthContext.tsx          # Firebase Auth context
│   └── lib/                         # Utility könyvtárak
│       ├── auth-middleware.ts       # API autentikáció
│       ├── firebase-admin.ts        # Firebase Admin SDK
│       ├── firebase.ts              # Firebase Client SDK
│       └── utils.ts                 # Általános utilities
├── .env.local                       # Környezeti változók
├── firestore.rules                  # Firebase biztonsági szabályok
├── next.config.js                   # Next.js konfiguráció
├── package.json                     # NPM függőségek
├── tailwind.config.js               # Tailwind CSS konfiguráció
└── tsconfig.json                    # TypeScript konfiguráció
```

## 🚀 Telepítés és Indítás

### Előfeltételek
- Node.js 18+ 
- npm vagy yarn
- Firebase projekt

### 1. Repository klónozása
```bash
git clone https://github.com/Krisztu/finalprojectapp.git
cd finalproject
```

### 2. Függőségek telepítése
```bash
npm install
```

### 3. Firebase projekt beállítása
1. Hozz létre egy Firebase projektet a [Firebase Console](https://console.firebase.google.com/)-ban
2. Engedélyezd a Firestore és Authentication szolgáltatásokat
3. Hozz létre egy Service Account kulcsot

### 4. Környezeti változók beállítása
Hozd létre a `.env.local` fájlt:

```env
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 5. Firestore szabályok telepítése
```bash
firebase deploy --only firestore:rules
```

### 6. Fejlesztői szerver indítása
```bash
npm run dev
```

Az alkalmazás elérhető lesz a `http://localhost:3000` címen.

## 👥 Felhasználói Szerepkörök

### 🔴 Admin
- **Teljes hozzáférés** minden funkcióhoz
- Felhasználók kezelése (létrehozás, módosítás, törlés)
- Órarend módosítások és szinkronizáció
- Jegyek megtekintése és kezelése
- Rendszer beállítások és karbantartás

### 🟣 Tanár
- Saját órarend megtekintése és kezelése
- Jegyek adása saját diákjainak
- Házi feladatok kiadása és értékelése
- Mulasztások rögzítése
- Osztálystatisztikák megtekintése

### 🔵 Osztályfőnök (Homeroom Teacher)
- Minden tanári funkció
- **Plusz**: Saját osztály igazolásainak kezelése
- Osztályfőnöki órák kezelése
- Osztály specifikus adminisztráció

### 🟢 Diák
- Saját órarend megtekintése
- Saját jegyek és átlagok megtekintése
- Házi feladatok megtekintése és beadása
- Mulasztások és igazolások követése
- Üzenőfal használata

### 🟡 DJ
- Diák jogosultságok
- **Plusz**: Suli Rádió zene kérések kezelése
- Zene kérések moderálása és törlése

## 🗄️ Adatbázis Struktúra

### Firestore Collections

#### `users` - Felhasználói adatok
```typescript
{
  uid: string,              // Firebase Auth UID
  email: string,            // Email cím
  fullName: string,         // Teljes név
  role: 'admin' | 'teacher' | 'homeroom_teacher' | 'student' | 'dj',
  class?: string,           // Osztály (diákok esetén)
  subject?: string,         // Tantárgy (tanárok esetén)
  studentId?: string,       // Diák azonosító
  createdAt: string         // Létrehozás dátuma
}
```

#### `lessons` - Órarend bejegyzések
```typescript
{
  userId: string,           // Felhasználó ID
  day: string,              // Nap neve (Hétfő, Kedd, stb.)
  startTime: string,        // Kezdési idő (7:45, 8:45, stb.)
  subject: string,          // Tantárgy
  teacherName: string,      // Tanár neve
  className: string,        // Osztály
  room: string,             // Terem
  createdAt: string         // Létrehozás dátuma
}
```

#### `grades` - Jegyek
```typescript
{
  studentName: string,      // Diák neve
  studentClass: string,     // Diák osztálya
  subject: string,          // Tantárgy
  grade: number,            // Jegy (1-5)
  title: string,            // Jegy típusa (Dolgozat, Felelet, stb.)
  description?: string,     // Megjegyzés
  teacherName: string,      // Tanár neve
  date: string,             // Dátum
  createdAt: string         // Létrehozás dátuma
}
```

#### `homework` - Házi feladatok
```typescript
{
  title: string,            // Feladat címe
  description: string,      // Részletes leírás
  dueDate: string,          // Határidő
  teacherId: string,        // Tanár ID
  teacherName: string,      // Tanár neve
  subject: string,          // Tantárgy
  className: string,        // Osztály
  lessonId: string,         // Óra azonosító
  attachments: string[],    // Mellékletek
  createdAt: string         // Létrehozás dátuma
}
```

#### `homework-submissions` - Házi feladat beadások
```typescript
{
  homeworkId: string,       // Házi feladat ID
  studentId: string,        // Diák ID
  studentName: string,      // Diák neve
  content: string,          // Beadott tartalom
  attachments: string[],    // Mellékletek
  submittedAt: string,      // Beadás dátuma
  evaluated: boolean,       // Értékelve van-e
  grade?: string            // Értékelés
}
```

#### `attendance` - Mulasztások
```typescript
{
  lessonId: string,         // Óra azonosító
  teacherId: string,        // Tanár ID
  date: string,             // Dátum
  startTime: string,        // Óra kezdete
  subject: string,          // Tantárgy
  className: string,        // Osztály
  topic: string,            // Óra témája
  students: [{              // Diákok jelenléte
    studentId: string,
    studentName: string,
    present: boolean,
    excused: boolean
  }],
  createdAt: string         // Létrehozás dátuma
}
```

#### `excuses` - Igazolások
```typescript
{
  studentId: string,        // Diák ID
  studentName: string,      // Diák neve
  absenceIds: string[],     // Mulasztás ID-k
  excuseType: string,       // Igazolás típusa
  description: string,      // Indoklás
  status: 'pending' | 'approved' | 'rejected',
  submittedAt: string,      // Beküldés dátuma
  reviewedBy?: string,      // Ki bírálta el
  reviewedAt?: string       // Elbírálás dátuma
}
```

#### `chat` - Üzenőfal
```typescript
{
  message: string,          // Üzenet szövege
  userId: string,           // Küldő ID
  userName: string,         // Küldő neve
  createdAt: string         // Küldés dátuma
}
```

#### `music` - Suli Rádió
```typescript
{
  url: string,              // Zene URL
  platform: string,        // Platform (spotify, youtube, stb.)
  title?: string,           // Cím
  userId: string,           // Kérő ID
  userName: string,         // Kérő neve
  userClass: string,        // Kérő osztálya
  createdAt: string         // Kérés dátuma
}
```

## 🔐 Biztonsági Funkciók

### Firebase Security Rules
- **Role-based hozzáférés vezérlés**
- **API middleware autentikáció**
- **Input validáció minden végponton**

### Adatvédelem
- **GDPR megfelelőség** - Cookie consent és adattörlési jogok
- **Titkosított kommunikáció** - HTTPS kényszerítés
- **Audit logging** - Felhasználói műveletek naplózása

### Környezeti Változók Biztonsága
- Private key-ek védett tárolása
- Production és development környezetek szétválasztása
- Regular key rotation

## 🎨 UI/UX Funkciók

### Reszponzív Design
- **Mobile-first** megközelítés
- **Tablet és desktop** optimalizáció
- **Dark mode** támogatás

### Accessibility
- **Keyboard navigáció**
- **Screen reader** támogatás
- **High contrast** módok

### Interaktív Elemek
- **Real-time updates** - Valós idejű adatfrissítés
- **Loading states** - Skeleton komponensek
- **Error handling** - Felhasználóbarát hibaüzenetek

## 📊 Admin Funkciók

### Felhasználó Kezelés
- Tanárok és diákok létrehozása
- Szerepkörök módosítása
- Osztályok átszervezése
- Felhasználók törlése

### Órarend Kezelés
- **ScheduleManager** komponens
- Drag & drop órarend szerkesztés
- Tömeges órarend szinkronizáció
- Órarend módosítások (elmaradás, helyettesítés)

### Adatbázis Karbantartás
- Mulasztások és órák törlése
- Házi feladatok tisztítása
- Backup és restore műveletek

## 🎓 Oktatási Funkciók

### Jegy Rendszer
- **Tanári jegyadás** - Tantárgy és osztály alapú
- **Diák jegymegtekintés** - Átlagokkal és statisztikákkal
- **Grafikus megjelenítés** - Interaktív diagramok

### Házi Feladat Rendszer
- **Feladatkiadás** - Határidővel és leírással
- **Beadás kezelés** - Szöveges válaszok
- **Értékelés** - Tanári visszajelzés

### Mulasztás Nyilvántartás
- **Jelenléti ív** - Óránkénti rögzítés
- **Igazolás rendszer** - Osztályfőnöki jóváhagyás
- **Statisztikák** - Mulasztási arányok

## 🎵 Speciális Funkciók

### Suli Rádió
- **Zene kérések** - Spotify, YouTube támogatás
- **DJ moderáció** - Kérések jóváhagyása/törlése
- **Platform integráció** - Beágyazott lejátszók

### QR Beléptetés
- **Digitális beléptetés** - QR kód generálás
- **Portás felület** - QR kód olvasás
- **Belépési napló** - Automatikus rögzítés

### Üzenőfal
- **Valós idejű chat** - Azonnali üzenetküldés
- **Admin moderáció** - Üzenetek törlése
- **Időbélyegek** - Pontos időrendi sorrend

## 🚀 Deployment

### Vercel Deployment (Ajánlott)
```bash
# Vercel CLI telepítés
npm i -g vercel

# Project deployment
vercel --prod
```

### Firebase Hosting
```bash
# Firebase CLI telepítés
npm install -g firebase-tools

# Build és deploy
npm run build
firebase deploy
```

### Environment Variables
Production környezetben állítsd be az összes szükséges környezeti változót a hosting szolgáltatónál.

## 🧪 Tesztelés

### Fejlesztői Tesztelés
```bash
# Fejlesztői szerver
npm run dev

# Build teszt
npm run build
npm run start
```

### Felhasználói Tesztelés
- **Admin teszt**: Teljes funkcionalitás
- **Tanár teszt**: Jegyadás és órarend
- **Diák teszt**: Adatok megtekintése
- **Cross-browser teszt**: Chrome, Firefox, Safari

## 📈 Performance Optimalizáció

### Next.js Optimalizációk
- **Static Site Generation** - Statikus oldalak
- **Image Optimization** - Automatikus képoptimalizáció
- **Code Splitting** - Lazy loading komponensek

### Firebase Optimalizációk
- **Query indexing** - Gyors adatlekérdezések
- **Connection pooling** - Hatékony kapcsolatkezelés
- **Caching stratégia** - Kliens oldali cache

## 🔧 Karbantartás

### Regular Updates
- **Dependency updates** - Havi frissítések
- **Security patches** - Azonnali javítások
- **Firebase SDK updates** - Negyedéves frissítések

### Monitoring
- **Error tracking** - Automatikus hibafigyelés
- **Performance monitoring** - Teljesítmény mérés
- **User analytics** - Használati statisztikák

## 🤝 Közreműködés

### Development Workflow
1. Fork a repository-t
2. Hozz létre egy feature branch-et
3. Implementáld a változtatásokat
4. Írj teszteket
5. Küldd be a pull request-et

### Coding Standards
- **TypeScript** használata kötelező
- **ESLint** és **Prettier** konfiguráció követése
- **Komponensek** funkcionális stílusban
- **Error handling** minden API végponton

## 📞 Támogatás

### Dokumentáció
- **README.md** - Ez a fájl
- **API dokumentáció** - Swagger/OpenAPI
- **Komponens dokumentáció** - Storybook

### Hibabejelentés
- GitHub Issues használata
- Részletes hibajelentés template
- Reprodukálható lépések megadása

## 📄 Licenc

Ez a projekt oktatási célokra készült. Minden jog fenntartva.

---

**Verzió**: 1.0.0  
**Utolsó frissítés**: 2024-01-XX  
**Fejlesztő**: Krisztu  
**Status**: Production Ready ✅

### 🎯 Következő Fejlesztések
- [ ] Mobile app fejlesztés
- [ ] Push notification rendszer
- [ ] Advanced analytics
- [ ] Multi-tenant architektúra
- [ ] Real-time collaboration
- [ ] API dokumentáció (Swagger)
- [ ] Unit és integration tesztek
- [ ] Performance monitoring dashboard