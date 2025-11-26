# Komponens Registry - Luminé Projekt

## UI Komponensek (Shadcn/ui)

### Alapkomponensek
- **`src/components/ui/badge.tsx`** - Státusz címkék és kategória jelölők megjelenítése
- **`src/components/ui/button.tsx`** - Interaktív gombok különböző stílusokkal
- **`src/components/ui/card.tsx`** - Tartalmi kártyák header, content és footer részekkel
- **`src/components/ui/input.tsx`** - Szöveges beviteli mezők
- **`src/components/ui/label.tsx`** - Form címkék és leírások
- **`src/components/ui/select.tsx`** - Legördülő menük és opció választók
- **`src/components/ui/skeleton.tsx`** - Betöltési animációk és placeholder elemek
- **`src/components/ui/table.tsx`** - Adattáblázatok fejléccel és törzzsel
- **`src/components/ui/tabs.tsx`** - Füles navigáció és tartalom szervezés
- **`src/components/ui/textarea.tsx`** - Többsoros szövegbeviteli területek

## Üzleti Logika Komponensek

### Admin Komponensek
- **`src/components/admin/ScheduleManager.tsx`** - Órarend kezelő felület
  - Interaktív órarend rács
  - Drag & drop funkcionalitás
  - Óra hozzáadás/szerkesztés/törlés
  - Osztály és időpont alapú szűrés
  - Valós idejű adatbázis szinkronizáció

## Context Providers

### Autentikáció
- **`src/contexts/AuthContext.tsx`** - Firebase Authentication kezelés
  - Felhasználói állapot menedzsment
  - Bejelentkezés/kijelentkezés logika
  - Role-based hozzáférés vezérlés
  - Token frissítés automatizálás

## Oldalak (Pages)

### Főoldalak
- **`src/app/page.tsx`** - Kezdőlap és bejelentkezési felület
- **`src/app/layout.tsx`** - Globális layout és metadata
- **`src/app/dashboard/page.tsx`** - Főoldal role-based tartalommal
- **`src/app/dashboard/layout.tsx`** - Dashboard layout wrapper

### Speciális Oldalak
- **`src/app/qr-scan/page.tsx`** - QR kód olvasó felület (jelenleg nem használt)

## API Végpontok

### Autentikáció
- **`src/app/api/auth/register/route.ts`** - Felhasználó regisztráció Firebase Auth-al

### Felhasználó Kezelés
- **`src/app/api/users/route.ts`** - CRUD műveletek felhasználókkal
  - GET: Felhasználók listázása
  - POST: Új felhasználó létrehozása
  - PUT: Felhasználó adatok módosítása
  - DELETE: Felhasználó törlése

### Órarend Kezelés
- **`src/app/api/lessons/route.ts`** - Órarend műveletek
  - GET: Egyéni órarendek lekérdezése userId alapján
  - POST: Új óra hozzáadása
  - PUT: Óra módosítása
  - DELETE: Óra törlése

### Jegy Kezelés
- **`src/app/api/grades/route.ts`** - Jegy műveletek
  - GET: Jegyek lekérdezése (role-based szűréssel)
  - POST: Új jegy hozzáadása
  - PUT: Jegy módosítása
  - DELETE: Jegy törlése

### Admin Funkciók
- **`src/app/api/admin/schedule-changes/route.ts`** - Órarend módosítások kezelése
- **`src/app/api/admin/sync-schedules/route.ts`** - Tömeges órarend szinkronizáció
- **`src/app/api/admin/clear/route.ts`** - Adatbázis tisztítási műveletek

### Speciális Funkciók
- **`src/app/api/access/route.ts`** - QR alapú beléptetés rendszer
- **`src/app/api/chat/route.ts`** - Üzenőfal chat rendszer
- **`src/app/api/music/route.ts`** - Suli Rádió zene kérések

## Utility Fájlok

### Konfigurációk
- **`src/lib/firebase.ts`** - Firebase client konfiguráció
- **`src/lib/firebase-admin.ts`** - Firebase Admin SDK konfiguráció
- **`src/lib/utils.ts`** - Általános utility funkciók (cn, clsx)
- **`src/lib/auth-middleware.ts`** - Autentikációs middleware

### Adatok
- **`src/lib/demo-users.ts`** - Fix felhasználói adatok és alapértelmezett órarendek
- **`src/lib/demo-data.ts`** - Elavult demo adatok (üres)

### Törölve
- **`src/lib/kreta-token-manager.ts`** - Kréta API token kezelés (törölve)
- **`src/lib/demo-data.ts`** - Elavult demo adatok (törölve)
- **`src/app/api/kreta/*`** - Mock Kréta API végpontok (törölve)

## Stílusok

### CSS Fájlok
- **`src/app/globals.css`** - Globális stílusok és Tailwind importok
- **`tailwind.config.js`** - Tailwind CSS konfiguráció
- **`postcss.config.js`** - PostCSS konfiguráció

## Statikus Fájlok

### Ikonok
- **`public/favicon.ico`** - Alapértelmezett favicon
- **`public/favicon.svg`** - SVG favicon Luminé logóval

## Konfiguráció Fájlok

### Next.js
- **`next.config.js`** - Next.js konfiguráció
- **`next-env.d.ts`** - Next.js TypeScript definíciók
- **`tsconfig.json`** - TypeScript konfiguráció

### Package Management
- **`package.json`** - Projekt függőségek és scriptek
- **`package-lock.json`** - Függőség verzió lock fájl

### Linting és Formázás
- **`.gitignore`** - Git ignore szabályok
- **`.env.local`** - Környezeti változók (nem verziókövetett)

## Elavult/Törölhető Fájlok

### Script Fájlok
- **`create-fixed-users.js`** - Felhasználó létrehozó script (manuális)
- **`create-test-users.js`** - Test felhasználók (elavult)
- **`debug-teacher.txt`** - Debug információk (törölhető)
- **`CHANGES.md`** - Változások naplója (átkerült dokumentációba)

### Elavult Könyvtárak
- **`-p/`** - Ismeretlen könyvtár (törölhető)

---
*Utolsó frissítés: 2024-01-XX*
*Komponensek száma: 25+ aktív, 8 elavult*