# GSZI APP - Nemes Tihamér Technikum

Digitális diák alkalmazás a Békéscsabai SZC Nemes Tihamér Technikum és Kollégium számára.

## 🚀 Funkciók

### 🎓 Alapfunkciók (Kréta integráció)
- **Jegyek megtekintése** - Aktuális értékelések áttekintése
- **Órarend** - Heti órarend megtekintése
- **Kréta bejelentkezés** - Hivatalos Kréta fiókkal való belépés

### 🎵 Suli Rádió
- Zenék beküldése Spotify, YouTube, Apple Music linkekkel
- Platform automatikus felismerése
- Kérések státusz követése (függőben, jóváhagyva, elutasítva)
- DJ szerepkör zenék kezelésére

### 🔐 QR Kódos Belépés
- Egyéni QR kód generálása minden diáknak
- Belépés/kilépés rögzítése
- Órarend alapú kilépés ellenőrzés
- Automatikus hozzáférés-vezérlés

### 💬 Üzenőfal
- Valós idejű chat rendszer
- Szerepkör alapú megjelenítés (diák, tanár, DJ, portás, admin)
- Csatorna alapú kommunikáció

## 🛠️ Technológiák

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Adatbázis**: Firebase Firestore
- **Autentikáció**: Firebase Auth + Kréta API
- **Hosting**: Vercel

## 📦 Telepítés

1. **Projekt klónozása**
```bash
git clone https://github.com/Krisztu/finalprojectapp.git
cd finalprojectapp
```

2. **Függőségek telepítése**
```bash
npm install
```

3. **Környezeti változók beállítása**
```bash
cp .env.example .env.local
```
Töltsd ki a Firebase konfigurációs adatokat.

4. **Firebase projekt létrehozása**
- Hozz létre egy új Firebase projektet
- Engedélyezd a Firestore adatbázist
- Engedélyezd a Firebase Authentication-t
- Másold be a konfigurációs adatokat a `.env.local` fájlba

5. **Fejlesztői szerver indítása**
```bash
npm run dev
```

## 🔧 Használat

### Bejelentkezés
- Használd a Kréta fiókod adatait
- Intézmény kód: `bekescsaba-nemes-tihamer`

### Teszt fiókok
- **Diák**: `diak@gszi.hu` / `diak123456`
- **Tanár**: `tanar@gszi.hu` / `tanar123456`
- **Admin**: `admin@gszi.hu` / `admin123456`
- **DJ**: `dj@gszi.hu` / `dj123456`

### Funkciók használata
1. **Jegyek/Órarend**: Automatikusan betöltődnek a Kréta rendszerből
2. **Suli Rádió**: Küldd be kedvenc zenéidet a megfelelő linkekkel
3. **QR Belépés**: Mutasd fel a generált QR kódot a portásnál
4. **Üzenőfal**: Kommunikálj társaiddal és tanáraiddal

## 🔌 API Végpontok

- `POST /api/music` - Zene kérés beküldése
- `GET /api/music` - Zene kérések lekérése
- `DELETE /api/music?id={id}` - Zene kérés törlése
- `POST /api/access` - Belépés/kilépés rögzítése
- `GET /api/access` - Belépési naplók lekérése
- `POST /api/chat` - Üzenet küldése
- `GET /api/chat` - Üzenetek lekérése
- `POST /api/users` - Felhasználó létrehozása
- `GET /api/users` - Felhasználók lekérése

## 👥 Szerepkörök

- **Diák**: Alapfunkciók használata
- **Tanár**: Diák funkciók + jegyek beírása + moderálás
- **DJ**: Zene kérések kezelése és törlése
- **Portás**: Belépés ellenőrzés
- **Admin**: Teljes hozzáférés + felhasználó kezelés

## 🚀 Fejlesztés

```bash
# Fejlesztői szerver
npm run dev

# Build
npm run build

# Produkciós szerver
npm start

# Linting
npm run lint
```

## 📱 Deployment

A projekt Vercel-re van optimalizálva:

1. Csatold a GitHub repository-t Vercel-hez
2. Állítsd be a környezeti változókat
3. Deploy automatikusan megtörténik

### Környezeti változók (Vercel)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

KRETA_SCHOOL_CODE=your_school_code
KRETA_USERNAME=your_username
KRETA_PASSWORD=your_password
```

## 🔒 Biztonság

- Firebase Security Rules implementálva
- Szerepkör alapú hozzáférés-vezérlés
- Környezeti változók használata érzékeny adatokhoz
- HTTPS kötelező produkciós környezetben

## 📁 Projekt struktúra

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard oldal
│   ├── qr-scan/       # QR kód olvasó
│   ├── globals.css    # Globális stílusok
│   ├── layout.tsx     # Fő layout
│   └── page.tsx       # Bejelentkezési oldal
├── components/
│   └── ui/            # UI komponensek
├── contexts/
│   └── AuthContext.tsx # Autentikáció context
└── lib/
    ├── firebase.ts    # Firebase konfiguráció
    ├── demo-data.ts   # Demo adatok
    └── utils.ts       # Segédfunkciók
```

## 🤝 Támogatás

Kérdések esetén fordulj a fejlesztő csapathoz vagy nyiss egy issue-t a GitHub repository-ban.

## 📄 Licenc

Ez a projekt oktatási célokra készült a Békéscsabai SZC Nemes Tihamér Technikum és Kollégium számára.