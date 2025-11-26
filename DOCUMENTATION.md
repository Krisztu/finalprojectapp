# Luminé - Iskolai Rendszer Dokumentáció

## Projekt Áttekintés
A Luminé egy modern iskolai menedzsment rendszer, amely a GSZI alkalmazásból fejlődött ki. A rendszer Firebase-alapú, role-based hozzáférés-vezérléssel és egyéni órarend kezeléssel.

## Architektúra

### Technológiai Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Adatbázis**: Firebase Firestore
- **Autentikáció**: Firebase Authentication
- **UI Framework**: Tailwind CSS + Shadcn/ui komponensek
- **Deployment**: Vercel (javasolt)

### Adatbázis Struktúra

#### Collections
1. **users** - Felhasználói adatok
   - `uid`: Firebase Auth UID
   - `email`: Email cím
   - `fullName`: Teljes név
   - `role`: Szerepkör (admin, teacher, student, dj)
   - `class`: Osztály (diákok és DJ esetén)
   - `subject`: Tantárgy (tanárok esetén)
   - `classes`: Tanított osztályok (tanárok esetén)
   - `studentId`: Diák azonosító (diákok esetén)

2. **lessons** - Órarend bejegyzések
   - `userId`: Felhasználó ID (egyéni órarend)
   - `subject`: Tantárgy
   - `teacher`: Tanár neve
   - `room`: Terem
   - `dayOfWeek`: Hét napja (0-6)
   - `timeSlot`: Időpont (0-7)
   - `class`: Osztály

3. **grades** - Jegyek
   - `studentId`: Diák ID
   - `subject`: Tantárgy
   - `grade`: Jegy (1-5)
   - `teacher`: Tanár neve
   - `date`: Dátum
   - `description`: Leírás

4. **scheduleChanges** - Órarend módosítások
   - `date`: Dátum (YYYY-MM-DD)
   - `timeSlot`: Időpont
   - `class`: Osztály
   - `type`: Típus (cancelled, substituted, added)
   - `originalSubject`: Eredeti tantárgy
   - `newSubject`: Új tantárgy (helyettesítés esetén)
   - `originalTeacher`: Eredeti tanár
   - `newTeacher`: Új tanár
   - `room`: Terem

### Szerepkörök és Jogosultságok

#### Admin
- Teljes hozzáférés minden funkcióhoz
- Felhasználók kezelése
- Órarend módosítások
- Jegyek megtekintése és módosítása
- Rendszer beállítások

#### Teacher (Tanár)
- Saját órarend megtekintése
- Jegyek adása saját diákjainak
- Osztálystatisztikák megtekintése
- Saját tanított órák kezelése

#### Student (Diák)
- Saját órarend megtekintése
- Saját jegyek megtekintése
- Órarend változások követése

#### DJ
- Saját órarend megtekintése
- Zene kérések kezelése (ha implementálva)

## Komponens Struktúra

### Használt Komponensek
- **src/components/ui/**: Shadcn/ui alapkomponensek
  - `badge.tsx` - Címkék megjelenítése
  - `button.tsx` - Gombok
  - `card.tsx` - Kártya komponensek
  - `input.tsx` - Beviteli mezők
  - `label.tsx` - Címkék
  - `select.tsx` - Legördülő menük
  - `skeleton.tsx` - Betöltési animációk
  - `table.tsx` - Táblázatok
  - `tabs.tsx` - Fülek
  - `textarea.tsx` - Szövegterületek

- **src/components/admin/**: Admin specifikus komponensek
  - `ScheduleManager.tsx` - Órarend kezelő felület

### API Végpontok

#### Autentikáció
- `POST /api/auth/register` - Felhasználó regisztráció

#### Felhasználók
- `GET /api/users` - Felhasználók listázása
- `POST /api/users` - Új felhasználó létrehozása
- `PUT /api/users` - Felhasználó módosítása
- `DELETE /api/users` - Felhasználó törlése

#### Órák
- `GET /api/lessons` - Órák lekérdezése (userId alapján)
- `POST /api/lessons` - Új óra létrehozása
- `PUT /api/lessons` - Óra módosítása
- `DELETE /api/lessons` - Óra törlése

#### Jegyek
- `GET /api/grades` - Jegyek lekérdezése
- `POST /api/grades` - Új jegy létrehozása
- `PUT /api/grades` - Jegy módosítása
- `DELETE /api/grades` - Jegy törlése

#### Admin funkciók
- `GET/POST /api/admin/schedule-changes` - Órarend módosítások
- `POST /api/admin/sync-schedules` - Órarendek szinkronizálása
- `POST /api/admin/clear` - Adatbázis tisztítás

## Biztonsági Megfontolások

### Firebase Rules
- Role-based hozzáférés vezérlés
- Felhasználók csak saját adataikat módosíthatják
- Tanárok csak saját diákjaik jegyeit kezelhetik
- Admin teljes hozzáférés

### Adatvédelem
- Személyes adatok titkosítása
- Audit log minden módosításról
- GDPR megfelelőség

## Telepítés és Konfiguráció

### Környezeti Változók
```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Telepítési Lépések
1. `npm install` - Függőségek telepítése
2. Firebase projekt beállítása
3. Környezeti változók konfigurálása
4. `npm run dev` - Fejlesztői szerver indítása

## Fejlesztési Irányelvek

### Kódolási Szabályok
- TypeScript használata kötelező
- ESLint és Prettier konfiguráció követése
- Komponensek funkcionális stílusban
- Proper error handling minden API végponton

### Git Workflow
- Feature branch-ek használata
- Pull request review kötelező
- Commit message konvenciók követése

## Karbantartás és Monitoring

### Logolás
- API hívások naplózása
- Error tracking
- Performance monitoring

### Backup Stratégia
- Napi automatikus backup
- Point-in-time recovery
- Disaster recovery terv

## Biztonság és Megfelelőség

### Implementált Biztonsági Intézkedések
- **Firebase Security Rules**: Role-based hozzáférés vezérlés
- **API Authentication**: JWT token alapú autentikáció
- **Input Validation**: Minden API végponton
- **HTTPS Enforcement**: Titkosított kommunikáció
- **Audit Logging**: Felhasználói műveletek naplózása

### Adatvédelem
- **GDPR Compliance**: Cookie consent és adattörlési jogok
- **Data Minimization**: Csak szükséges adatok tárolása
- **Encryption**: Firebase automatikus titkosítás
- **Access Control**: Szerepkör alapú hozzáférés

## Projekt Tisztítás és Optimalizáció

### Eltávolított Komponensek
- **Kréta API integráció**: Mock adatok helyett valódi adatbázis
- **Elavult demo fájlok**: Tisztított kódstruktúra
- **Nem használt scriptek**: Fejlesztői segédeszközök eltávolítása

### Aktív Funkciók
- **Órarend kezelés**: Egyéni felhasználói órarendek
- **Jegy rendszer**: Role-based jegy kezelés
- **Üzenőfal**: Valós idejű chat rendszer
- **Suli Rádió**: Zene kérések kezelése
- **QR beléptetés**: Digitális beléptetési rendszer

## Dokumentáció Struktúra

### Fő Dokumentumok
- **DOCUMENTATION.md**: Teljes projekt dokumentáció
- **COMPONENTS.md**: Komponens registry és használat
- **SECURITY.md**: Biztonsági konfiguráció és irányelvek
- **PROJECT_STRUCTURE.md**: Fájl struktúra és architektúra

## Jövőbeli Fejlesztések
- Mobile app fejlesztés
- Push notification rendszer
- Advanced analytics és reporting
- Integration más iskolai rendszerekkel
- Multi-tenant architektúra
- Real-time collaboration features

---
*Utolsó frissítés: 2024-01-XX*
*Verzió: 1.0.0 - Production Ready*
*Biztonsági audit: Befejezve*
*Kód tisztítás: Befejezve*