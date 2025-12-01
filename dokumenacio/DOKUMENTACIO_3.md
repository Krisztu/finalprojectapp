### 3.7. Navigáció és ergonómia

#### 3.7.1. Felhasználói felület tervezése

**Design rendszer:**
- **Színpaletta**: Kék-indigo gradiens (professzionális, megbízható)
- **Tipográfia**: Inter font (olvashatóság)
- **Ikonográfia**: Lucide React ikonok (konzisztencia)
- **Spacing**: 8px grid rendszer (harmónia)

**Reszponzív breakpointok:**
```css
sm: 640px   /* Mobil landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Nagy desktop */
```

#### 3.7.2. Navigációs struktúra

**Desktop navigáció:**
- Vízszintes tab navigáció
- Összes funkció látható
- Gyors váltás tabok között
- Aktív tab kiemelése

**Mobil navigáció:**
- Hamburger menü
- Lenyíló lista ikonokkal
- Automatikus bezárás kiválasztáskor
- Touch-friendly gombok (min. 44x44px)

**Navigációs hierarchia:**
```
Főoldal (Dashboard)
├── Órarend
├── Jegyek
├── Házi feladatok
├── Mulasztások
├── Igazolások
├── Suli Rádió
├── Chat
├── QR kód
└── Profil
```

#### 3.7.3. Ergonómiai szempontok

**Olvashatóság:**
- Minimum 16px betűméret mobilon
- 1.5-ös sorköz
- Magas kontraszt (WCAG AA szint)
- Dark mode a szemkímélésért

**Interaktivitás:**
- Hover effektek desktop-on
- Touch feedback mobilon
- Loading állapotok (skeleton screens)
- Error üzenetek érthetően

**Akadálymentesség:**
- Szemantikus HTML
- ARIA attribútumok
- Keyboard navigáció
- Screen reader támogatás

#### 3.7.4. Felhasználói élmény (UX)

**Információ architektúra:**
- Legfontosabb funkciók elöl
- Logikus csoportosítás
- Breadcrumb navigáció
- Keresési funkciók

**Feedback mechanizmusok:**
- Sikeres műveletek: zöld toast üzenet
- Hibák: piros alert
- Folyamatban: loading spinner
- Megerősítő dialógok törlés előtt

**Performance optimalizáció:**
- Lazy loading komponensek
- Image optimization (Next.js Image)
- Code splitting
- Caching stratégia

### 3.8. Funkcionális tesztesetek

#### 3.8.1. Felhasználókezelés tesztek

**TC-001: Sikeres bejelentkezés**
- **Előfeltétel**: Létező felhasználó az adatbázisban
- **Lépések**:
  1. Navigálj a bejelentkezési oldalra
  2. Írd be: email: "diak@gszi.hu", jelszó: "diak123"
  3. Kattints a "Bejelentkezés" gombra
- **Elvárt eredmény**: Átirányítás a dashboard-ra, felhasználó neve megjelenik
- **Státusz**: ✅ SIKERES

**TC-002: Hibás jelszó**
- **Előfeltétel**: Létező felhasználó
- **Lépések**:
  1. Navigálj a bejelentkezési oldalra
  2. Írd be: email: "diak@gszi.hu", jelszó: "rossz"
  3. Kattints a "Bejelentkezés" gombra
- **Elvárt eredmény**: Hibaüzenet: "Hibás email vagy jelszó"
- **Státusz**: ✅ SIKERES

**TC-003: Kijelentkezés**
- **Előfeltétel**: Bejelentkezett felhasználó
- **Lépések**:
  1. Kattints a "Kilépés" gombra
  2. Erősítsd meg a műveletet
- **Elvárt eredmény**: Átirányítás a bejelentkezési oldalra, session törlése
- **Státusz**: ✅ SIKERES

#### 3.8.2. Órarend tesztek

**TC-004: Órarend megjelenítés**
- **Előfeltétel**: Bejelentkezett diák
- **Lépések**:
  1. Navigálj az "Órarend" tabra
  2. Válaszd ki a mai napot
- **Elvárt eredmény**: Mai órák megjelennek időrendben, aktuális óra kiemelve
- **Státusz**: ✅ SIKERES

**TC-005: Heti navigáció**
- **Előfeltétel**: Órarend oldalon
- **Lépések**:
  1. Kattints a "Következő hét" gombra
  2. Válassz egy napot
- **Elvárt eredmény**: Következő hét napjai megjelennek, kiválasztott nap órái láthatók
- **Státusz**: ✅ SIKERES

**TC-006: Lyukas óra megjelenítés**
- **Előfeltétel**: Órarend oldalon, van lyukas óra
- **Lépések**:
  1. Nézd meg a napi órarendet
- **Elvárt eredmény**: Lyukas órák "Lyukas óra" felirattal, szürke háttérrel
- **Státusz**: ✅ SIKERES

#### 3.8.3. Jegykezelés tesztek

**TC-007: Jegy beírása (tanár)**
- **Előfeltétel**: Bejelentkezett tanár
- **Lépések**:
  1. Navigálj a "Jegyek" tabra
  2. Válassz osztályt: "12.A"
  3. Válassz diákot: "Teszt Diák"
  4. Jegy: 5, Típus: "Dolgozat"
  5. Kattints "Jegy rögzítése"
- **Elvárt eredmény**: Sikeres üzenet, jegy megjelenik a listában
- **Státusz**: ✅ SIKERES

**TC-008: Jegyek megtekintése (diák)**
- **Előfeltétel**: Bejelentkezett diák, van jegye
- **Lépések**:
  1. Navigálj a "Jegyek" tabra
  2. Nézd meg az átlagokat
- **Elvárt eredmény**: Jegyek tantárgyanként csoportosítva, átlagok helyesen számolva
- **Státusz**: ✅ SIKERES

**TC-009: Jegy törlése**
- **Előfeltétel**: Bejelentkezett tanár, létező jegy
- **Lépések**:
  1. Navigálj a "Jegyek" tabra
  2. Kattints a jegy melletti "×" gombra
  3. Erősítsd meg a törlést
- **Elvárt eredmény**: Jegy eltűnik a listából, adatbázisból törölve
- **Státusz**: ✅ SIKERES

#### 3.8.4. Házi feladat tesztek

**TC-010: Házi feladat kiadása**
- **Előfeltétel**: Bejelentkezett tanár
- **Lépések**:
  1. Navigálj a "Házi" tabra
  2. Válassz osztályt: "12.A"
  3. Cím: "Matematika feladatok"
  4. Leírás: "Oldal 45, 1-10. feladat"
  5. Határidő: holnap dátuma
  6. Kattints "Házi feladat kiadása"
- **Elvárt eredmény**: Sikeres üzenet, házi megjelenik a listában
- **Státusz**: ✅ SIKERES

**TC-011: Házi feladat beadása**
- **Előfeltétel**: Bejelentkezett diák, kiadott házi
- **Lépések**:
  1. Navigálj a "Házi" tabra
  2. Kattints a házi melletti "Beküldés" gombra
  3. Írd be a megoldást
  4. Kattints "Beküldés"
- **Elvárt eredmény**: Sikeres üzenet, házi "Beküldve" státuszú
- **Státusz**: ✅ SIKERES

**TC-012: Lejárt házi jelzése**
- **Előfeltétel**: Bejelentkezett diák, lejárt határidejű házi
- **Lépések**:
  1. Navigálj a "Házi" tabra
- **Elvárt eredmény**: Lejárt házi piros kerettel, "Lejárt" badge
- **Státusz**: ✅ SIKERES

#### 3.8.5. Mulasztás tesztek

**TC-013: Mulasztás rögzítése**
- **Előfeltétel**: Bejelentkezett tanár
- **Lépések**:
  1. Navigálj az "Órarend" tabra
  2. Kattints egy órára
  3. Jelöld be a hiányzó diákokat
  4. Írd be a téma: "Függvények"
  5. Kattints "Rögzítés"
- **Elvárt eredmény**: Sikeres üzenet, mulasztások mentve
- **Státusz**: ✅ SIKERES

**TC-014: Mulasztások megtekintése (diák)**
- **Előfeltétel**: Bejelentkezett diák, van mulasztása
- **Lépések**:
  1. Navigálj a "Mulasztások" tabra
- **Elvárt eredmény**: Mulasztások dátum szerint csoportosítva, igazolt/igazolatlan jelzéssel
- **Státusz**: ✅ SIKERES

**TC-015: Igazolás beküldése**
- **Előfeltétel**: Bejelentkezett diák, igazolatlan mulasztás
- **Lépések**:
  1. Navigálj az "Igazolás" tabra
  2. Jelöld be a mulasztásokat
  3. Típus: "Orvosi igazolás"
  4. Indoklás: "Betegség"
  5. Kattints "Beküldés"
- **Elvárt eredmény**: Sikeres üzenet, igazolás "Függőben" státuszú
- **Státusz**: ✅ SIKERES

#### 3.8.6. Kommunikáció tesztek

**TC-016: Chat üzenet küldése**
- **Előfeltétel**: Bejelentkezett felhasználó
- **Lépések**:
  1. Navigálj a "Chat" tabra
  2. Írd be: "Teszt üzenet"
  3. Kattints "Küldés"
- **Elvárt eredmény**: Üzenet megjelenik a chat-ben, időbélyeggel és névvel
- **Státusz**: ✅ SIKERES

**TC-017: Zene kérés**
- **Előfeltétel**: Bejelentkezett diák
- **Lépések**:
  1. Navigálj a "Rádió" tabra
  2. Írd be egy Spotify URL-t
  3. Kattints "Zene beküldése"
- **Elvárt eredmény**: Zene megjelenik a listában, beágyazott lejátszóval
- **Státusz**: ✅ SIKERES

#### 3.8.7. Admin tesztek

**TC-018: Felhasználó létrehozása**
- **Előfeltétel**: Bejelentkezett admin
- **Lépések**:
  1. Navigálj az "Userek" tabra
  2. Töltsd ki a diák regisztrációs formot
  3. Kattints "Diák regisztrálása"
- **Elvárt eredmény**: Sikeres üzenet, új felhasználó megjelenik a listában
- **Státusz**: ✅ SIKERES

**TC-019: Szerepkör módosítása**
- **Előfeltétel**: Bejelentkezett admin, létező felhasználó
- **Lépések**:
  1. Navigálj az "Userek" tabra
  2. Válassz egy felhasználót
  3. Módosítsd a szerepkört "DJ"-re
- **Elvárt eredmény**: Szerepkör frissül, felhasználó új jogosultságokat kap
- **Státusz**: ✅ SIKERES

**TC-020: Felhasználó törlése**
- **Előfeltétel**: Bejelentkezett admin, létező felhasználó
- **Lépések**:
  1. Navigálj az "Userek" tabra
  2. Kattints a "Törlés" gombra
  3. Erősítsd meg a műveletet
- **Elvárt eredmény**: Felhasználó törlődik az adatbázisból és a listából
- **Státusz**: ✅ SIKERES

#### 3.8.8. Reszponzivitás tesztek

**TC-021: Mobil nézet**
- **Előfeltétel**: Bejelentkezett felhasználó
- **Lépések**:
  1. Nyisd meg az alkalmazást mobilon (vagy dev tools mobil nézetben)
  2. Navigálj végig az oldalakon
- **Elvárt eredmény**: Hamburger menü, reszponzív layout, minden funkció elérhető
- **Státusz**: ✅ SIKERES

**TC-022: Dark mode**
- **Előfeltétel**: Bejelentkezett felhasználó
- **Lépések**:
  1. Kattints a dark mode gombra (🌙)
  2. Navigálj végig az oldalakon
- **Elvárt eredmény**: Sötét téma aktiválódik, minden szöveg olvasható
- **Státusz**: ✅ SIKERES

#### 3.8.9. Teszteredmények összegzése

| Teszt kategória | Tesztek száma | Sikeres | Sikertelen | Sikerességi arány |
|----------------|---------------|---------|------------|-------------------|
| Felhasználókezelés | 3 | 3 | 0 | 100% |
| Órarend | 3 | 3 | 0 | 100% |
| Jegykezelés | 3 | 3 | 0 | 100% |
| Házi feladat | 3 | 3 | 0 | 100% |
| Mulasztás | 3 | 3 | 0 | 100% |
| Kommunikáció | 2 | 2 | 0 | 100% |
| Admin | 3 | 3 | 0 | 100% |
| Reszponzivitás | 2 | 2 | 0 | 100% |
| **ÖSSZESEN** | **22** | **22** | **0** | **100%** |

---

## 4. FELHASZNÁLÓI DOKUMENTÁCIÓ

### 4.1. Telepítési útmutató

#### 4.1.1. Rendszerkövetelmények

**Szerver oldal:**
- Node.js 18.0 vagy újabb
- npm 9.0 vagy újabb
- Firebase projekt (ingyenes Spark plan elegendő)
- 512 MB RAM minimum
- 1 GB szabad tárhely

**Kliens oldal:**
- Modern webböngésző:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- JavaScript engedélyezve
- Minimum 1024x768 felbontás (ajánlott: 1920x1080)
- Stabil internetkapcsolat (min. 2 Mbps)

#### 4.1.2. Telepítési lépések

**1. Repository klónozása:**
```bash
git clone https://github.com/Krisztu/finalprojectapp.git
cd finalproject
```

**2. Függőségek telepítése:**
```bash
npm install
```

**3. Firebase projekt létrehozása:**
- Látogass el a https://console.firebase.google.com oldalra
- Kattints az "Add project" gombra
- Add meg a projekt nevét (pl. "lumine-school")
- Engedélyezd a Google Analytics-et (opcionális)
- Kattints a "Create project" gombra

**4. Firebase szolgáltatások engedélyezése:**

*Firestore Database:*
- Navigálj a "Firestore Database" menüponthoz
- Kattints a "Create database" gombra
- Válaszd a "Start in production mode" opciót
- Válaszd ki a legközelebbi régiót (europe-west3)

*Authentication:*
- Navigálj az "Authentication" menüponthoz
- Kattints a "Get started" gombra
- Engedélyezd az "Email/Password" bejelentkezési módot

**5. Service Account kulcs létrehozása:**
- Navigálj a "Project settings" → "Service accounts" menüponthoz
- Kattints a "Generate new private key" gombra
- Mentsd el a letöltött JSON fájlt biztonságos helyre

**6. Környezeti változók beállítása:**

Hozd létre a `.env.local` fájlt a projekt gyökérkönyvtárában:

```env
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**7. Firestore Security Rules telepítése:**

Másold be a `firestore.rules` fájl tartalmát a Firebase Console-ban:
- Navigálj a "Firestore Database" → "Rules" menüponthoz
- Illeszd be a szabályokat
- Kattints a "Publish" gombra

**8. Fejlesztői szerver indítása:**
```bash
npm run dev
```

Az alkalmazás elérhető lesz a `http://localhost:3000` címen.

**Megjegyzés:** A rendszer fejlesztési és tesztelési célra készült. A fenti lépések elvégzése után az alkalmazás lokálisan futóképes és tesztelhető.

