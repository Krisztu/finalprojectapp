# LUMINÉ - ISKOLAI MENEDZSMENT RENDSZER
## SZAKMAI DOKUMENTÁCIÓ

---

**Készítette:** [Név]  
**Osztály:** [Osztály]  
**Konzulens:** [Tanár neve]  
**Intézmény:** Békéscsabai SZC Nemes Tihamér Technikum és Kollégium  
**Szakképesítés:** Szoftverfejlesztő és -tesztelő  
**Tanév:** 2024/2025  

---

## TARTALOMJEGYZÉK

1. Bevezető .......................................................... 3
2. Választott téma indoklása ........................................ 4
3. Téma kifejtése, fejlesztői dokumentáció ......................... 5
   3.1. Követelmények ............................................... 5
   3.2. Rendszerterv ................................................ 7
   3.3. Technológiai stack .......................................... 9
   3.4. Adatbázis leírása .......................................... 11
   3.5. Adatbázismodell-diagram .................................... 13
   3.6. Biztonsági kérdések ........................................ 15
   3.7. Navigáció és ergonómia ..................................... 17
   3.8. Funkcionális tesztesetek ................................... 19
4. Felhasználói dokumentáció ...................................... 21
   4.1. Telepítési útmutató ........................................ 21
   4.2. Használati útmutató ........................................ 23
   4.3. Szerepkörök és jogosultságok ............................... 25
5. Összegzés ...................................................... 27
6. Irodalomjegyzék ................................................ 28
7. Ábrajegyzék .................................................... 29

---

## 1. BEVEZETŐ

A digitalizáció korában az oktatási intézmények működésének hatékonyságát jelentősen növelheti egy jól megtervezett, átfogó iskolai menedzsment rendszer. A hagyományos papíralapú adminisztráció időigényes, hibalehetőségekkel teli, és nehezen átlátható mind a tanárok, mind a diákok számára.

A Luminé projekt célja egy modern, webalapú iskolai menedzsment rendszer létrehozása, amely valós időben kezeli az órarendeket, jegyeket, mulasztásokat, házi feladatokat és az iskolai kommunikációt. A rendszer Firebase technológiára épül, amely biztosítja az adatok valós idejű szinkronizációját és a megbízható működést.

### 1.1. A probléma

A magyar középiskolákban jelenleg használt rendszerek gyakran elavultak, nehezen használhatók, vagy nem fedik le az összes szükséges funkciót. A diákok és tanárok számára külön-külön kell kezelniük az órarendet, jegyeket, mulasztásokat és kommunikációt, ami időpocsékoláshoz és információvesztéshez vezet.

### 1.2. A megoldás

A Luminé egy egységes platformot biztosít, ahol minden iskolai adminisztrációs feladat egy helyen kezelhető. A rendszer szerepkör-alapú hozzáférés-vezérléssel rendelkezik, így minden felhasználó csak a számára releváns információkat látja és kezelheti.

---

## 2. VÁLASZTOTT TÉMA INDOKLÁSA

### 2.1. Személyes motiváció

Diákként magam is tapasztaltam a jelenlegi iskolai rendszerek hiányosságait. Az órarend változásokról gyakran csak szóbeli közléssel értesülünk, a jegyeket különböző platformokon kell keresni, és a házi feladatok követése is nehézkes. Ezért döntöttem úgy, hogy egy olyan rendszert fejlesztek, amely ezeket a problémákat megoldja.

### 2.2. Technológiai indoklás

A projekt során modern, iparági szabványnak számító technológiákat alkalmaztam:

**Next.js 14**: A React keretrendszer legújabb verziója, amely server-side renderinget és optimalizált teljesítményt biztosít.

**Firebase**: A Google felhőalapú platformja, amely valós idejű adatbázist, autentikációt és hostingot is nyújt egyetlen megoldásban.

**TypeScript**: Típusbiztonságot biztosít, amely csökkenti a hibák számát és javítja a kód karbantarthatóságát.

**Tailwind CSS**: Utility-first CSS framework, amely gyors és konzisztens UI fejlesztést tesz lehetővé.

### 2.3. Gyakorlati hasznosság

A rendszer azonnal használható valós iskolai környezetben. A szerepkör-alapú hozzáférés-vezérlés lehetővé teszi, hogy adminisztrátorok, tanárok, osztályfőnökök és diákok egyaránt használhassák a megfelelő jogosultságokkal.

---

## 3. TÉMA KIFEJTÉSE, FEJLESZTŐI DOKUMENTÁCIÓ

### 3.1. Követelmények

#### 3.1.1. Funkcionális követelmények

**Felhasználókezelés:**
- Regisztráció és bejelentkezés Firebase Authentication segítségével
- Szerepkör-alapú hozzáférés-vezérlés (Admin, Tanár, Osztályfőnök, Diák, DJ)
- Felhasználói profil megtekintése és szerkesztése

**Órarend kezelés:**
- Személyre szabott órarend megjelenítése
- Órarend módosítások kezelése (elmaradás, helyettesítés, új óra)
- Heti nézet dátumválasztóval
- Valós idejű jelzés az aktuális óráról

**Jegykezelés:**
- Tanári jegyadás tantárgy és osztály szerint
- Diák jegymegtekintés átlagokkal
- Grafikus megjelenítés (diagramok)
- Jegyek szűrése tantárgy szerint

**Házi feladat rendszer:**
- Házi feladatok kiadása határidővel
- Diák beadások kezelése
- Tanári értékelés és visszajelzés
- Határidő figyelés

**Mulasztás nyilvántartás:**
- Óránkénti jelenléti ív
- Mulasztások rögzítése és megtekintése
- Igazolási rendszer osztályfőnöki jóváhagyással
- Statisztikák mulasztási arányokról

**Kommunikáció:**
- Valós idejű üzenőfal
- Admin moderáció
- Időbélyegek és felhasználói azonosítás

**Suli Rádió:**
- Zene kérések (Spotify, YouTube)
- DJ moderáció
- Beágyazott lejátszók

**QR beléptetés:**
- Egyedi QR kód generálás diákoknak
- Portás felület QR olvasáshoz
- Belépési napló

#### 3.1.2. Nem-funkcionális követelmények

**Teljesítmény:**
- Oldalbetöltési idő < 2 másodperc
- Valós idejű adatszinkronizáció < 1 másodperc késleltetéssel
- Optimalizált képek és asset-ek

**Biztonság:**
- HTTPS titkosítás
- Firebase Security Rules
- API middleware autentikáció
- Input validáció minden végponton

**Használhatóság:**
- Reszponzív design (mobil, tablet, desktop)
- Intuitív felhasználói felület
- Dark mode támogatás
- Akadálymentesség (WCAG 2.1 AA szint)

**Megbízhatóság:**
- 99.9% uptime (Firebase SLA)
- Automatikus backup
- Error handling és logging

**Karbantarthatóság:**
- Tiszta kód elvek
- Komponens alapú architektúra
- Részletes dokumentáció
- TypeScript típusbiztonság

### 3.2. Rendszerterv

#### 3.2.1. Architektúra

A Luminé egy háromrétegű architektúrát követ:

**Prezentációs réteg (Frontend):**
- Next.js 14 App Router
- React 18 komponensek
- Tailwind CSS stílusok
- Shadcn/ui komponenskönyvtár

**Üzleti logika réteg (Backend):**
- Next.js API Routes
- Firebase Admin SDK
- RESTful API végpontok
- Middleware autentikáció

**Adatréteg (Database):**
- Firebase Firestore NoSQL adatbázis
- Valós idejű adatszinkronizáció
- Firebase Authentication
- Firebase Security Rules

#### 3.2.2. Komponens diagram

```
┌─────────────────────────────────────────────────────────┐
│                    KLIENS OLDAL                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Dashboard  │  │   Schedule   │  │    Grades    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Homework   │  │  Attendance  │  │     Chat     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   API RÉTEG (REST)                      │
├─────────────────────────────────────────────────────────┤
│  /api/users  │  /api/lessons  │  /api/grades           │
│  /api/homework  │  /api/attendance  │  /api/chat       │
│  /api/excuses  │  /api/music  │  /api/admin/*          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              FIREBASE SERVICES                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Firestore   │  │     Auth     │  │   Hosting    │ │
│  │   Database   │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### 3.2.3. Adatfolyam

1. **Felhasználó bejelentkezés:**
   - Kliens → Firebase Auth → Token generálás
   - Token tárolása kliens oldalon
   - Minden API híváshoz token csatolása

2. **Adatlekérdezés:**
   - Kliens → API Route → Firebase Admin SDK → Firestore
   - Adatok visszaküldése JSON formátumban
   - Kliens oldali state frissítés

3. **Adatmódosítás:**
   - Kliens → API Route → Validáció → Firestore írás
   - Sikeres válasz → Kliens state frissítés
   - Valós idejű szinkronizáció más kliensekhez

### 3.3. Technológiai stack

#### 3.3.1. Frontend technológiák

**Next.js 14:**
- React-alapú full-stack framework
- App Router új routing rendszerrel
- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes backend funkcionalitáshoz

**React 18:**
- Komponens alapú UI fejlesztés
- Hooks (useState, useEffect, useContext)
- Virtual DOM optimalizáció
- Concurrent rendering

**TypeScript:**
- Statikus típusellenőrzés
- IntelliSense támogatás
- Interfészek és típusok
- Csökkentett futásidejű hibák

**Tailwind CSS:**
- Utility-first CSS framework
- Reszponzív design osztályok
- Dark mode támogatás
- Egyedi konfiguráció

**Shadcn/ui:**
- Előre elkészített React komponensek
- Radix UI primitívek
- Testreszabható stílusok
- Akadálymentesség beépítve

#### 3.3.2. Backend technológiák

**Next.js API Routes:**
- Serverless API végpontok
- RESTful architektúra
- Middleware támogatás
- Edge runtime opció

**Firebase Admin SDK:**
- Server-side Firebase műveletek
- Privilegizált hozzáférés
- Batch műveletek
- Tranzakciók

**Node.js:**
- JavaScript runtime
- Aszinkron I/O
- NPM package manager
- Event-driven architektúra

#### 3.3.3. Adatbázis és autentikáció

**Firebase Firestore:**
- NoSQL dokumentum adatbázis
- Valós idejű szinkronizáció
- Offline támogatás
- Automatikus skálázás

**Firebase Authentication:**
- Email/jelszó autentikáció
- Token-alapú session kezelés
- Biztonságos jelszó tárolás
- Custom claims szerepkörökhöz



