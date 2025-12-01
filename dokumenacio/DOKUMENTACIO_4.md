### 4.2. Használati útmutató

#### 4.2.1. Első lépések

**Bejelentkezés:**
1. Indítsd el a fejlesztői szervert: `npm run dev`
2. Nyisd meg a böngészőben: `http://localhost:3000`
3. Add meg az email címed és jelszavad
4. Kattints a "Bejelentkezés" gombra
5. Sikeres bejelentkezés után átirányítás a főoldalra

**Jelszó emlékeztető:**
- Ha elfelejtetted a jelszavad, kattints a "Jelszó visszaállítása" linkre
- Add meg az email címed
- Ellenőrizd a postaládád
- Kattints az emailben kapott linkre
- Állíts be új jelszót

#### 4.2.2. Diák funkciók

**Órarend megtekintése:**
1. Kattints az "Órarend" tabra
2. Válaszd ki a kívánt napot a heti naptárból
3. Az aktuális óra zöld háttérrel kiemelve
4. Lyukas órák szürke háttérrel jelölve
5. Órarend módosítások (elmaradás, helyettesítés) színkóddal

**Jegyek megtekintése:**
1. Kattints a "Jegyek" tabra
2. Bal oldalon látható az összátlag és tantárgyankénti átlagok
3. Jobb oldalon részletes jegylista tantárgyanként
4. Szűrés tantárgy szerint a gombok segítségével
5. Grafikon megtekintése: kattints a kis diagramra

**Házi feladatok:**
1. Kattints a "Házi" tabra
2. Látható az összes kiadott házi feladat
3. Zöld keret: beküldve
4. Piros keret: lejárt határidő
5. Kék keret: aktív, beküldésre vár

**Házi beadása:**
1. Kattints a házi melletti "Beküldés" gombra
2. Írd be a megoldást a szövegmezőbe
3. Opcionálisan csatolj fájlokat
4. Kattints a "Beküldés" gombra
5. Megerősítő üzenet jelenik meg

**Mulasztások:**
1. Kattints a "Mulasztások" tabra
2. Mulasztások dátum szerint csoportosítva
3. Zöld: igazolt mulasztás
4. Piros: igazolatlan mulasztás
5. Kattints egy dátumra a részletek kibontásához

**Igazolás beküldése:**
1. Kattints az "Igazolás" tabra
2. Jelöld be az igazolandó mulasztásokat
3. Válaszd ki az igazolás típusát
4. Írd be az indoklást
5. Kattints a "Beküldés" gombra
6. Várd meg az osztályfőnök jóváhagyását

**Zene kérés:**
1. Kattints a "Rádió" tabra
2. Másold be a Spotify vagy YouTube linket
3. Kattints a "Zene beküldése" gombra
4. A zene megjelenik a listában
5. DJ moderálja a kéréseket

**Chat használata:**
1. Kattints a "Chat" tabra
2. Írd be az üzeneted
3. Kattints a "Küldés" gombra
4. Üzeneted megjelenik a falon
5. Valós időben látod mások üzeneteit

**QR kód:**
1. Kattints a "QR" tabra
2. Mutasd fel a QR kódot a portásnak
3. Automatikus belépés rögzítése
4. Új QR kód generálása: "Új QR kód" gomb

**Profil:**
1. Kattints a "Profil" tabra
2. Látható a személyes adataid
3. Osztály, oktatási azonosító
4. Összátlag (ha van jegyed)

#### 4.2.3. Tanár funkciók

**Órarend:**
- Saját órarend megtekintése
- Órákra kattintva mulasztások rögzítése
- Házi feladatok kiadása óránként

**Jegy beírása:**
1. Kattints a "Jegyek" tabra
2. Válassz osztályt a legördülő menüből
3. Válassz diákot
4. Add meg a jegyet (1-5)
5. Válaszd ki a típust (Dolgozat, Felelet, stb.)
6. Opcionálisan írj megjegyzést
7. Kattints a "Jegy rögzítése" gombra

**Jegyek megtekintése:**
- Bal oldali panel: jegy beírás
- Jobb oldali panel: diákjaim jegyei
- Szűrés osztály szerint
- Minden diák átlaga látható
- Jegyek törlése: "×" gomb

**Házi feladat kiadása:**
1. Kattints a "Házi" tabra
2. Válassz osztályt
3. Add meg a címet
4. Írd le a feladatot részletesen
5. Állítsd be a határidőt
6. Kattints a "Házi feladat kiadása" gombra

**Beadások megtekintése:**
1. Kattints a házi melletti "Beadások" gombra
2. Látható az összes diák beadása
3. Értékelés: "Megcsinálva" vagy "Hiányos" gomb
4. Visszajelzés írása (opcionális)

**Mulasztások rögzítése:**
1. Navigálj az "Órarend" tabra
2. Kattints egy órára
3. Automatikusan betöltődnek az osztály diákjai
4. Jelöld be a hiányzókat
5. Írd be az óra témáját
6. Kattints a "Rögzítés" gombra

**Mulasztások szerkesztése:**
1. Kattints a "Mulasztások" tabra
2. Válassz egy dátumot
3. Kattints a "Szerkesztés" gombra
4. Módosítsd a jelenléteket
5. Mentés

**Profil:**
- Személyes adatok
- Tantárgy
- Tanított osztályok listája

#### 4.2.4. Osztályfőnök funkciók

**Minden tanári funkció +**

**Igazolások kezelése:**
1. Kattints az "Igazolások" tabra
2. Látható az osztályod igazolási kérelmei
3. Sárga: függőben
4. Zöld: elfogadva
5. Piros: elutasítva

**Igazolás elbírálása:**
1. Olvasd el az indoklást
2. Kattints az "Elfogad" vagy "Elutasít" gombra
3. Automatikus értesítés a diáknak
4. Mulasztások státusza frissül

#### 4.2.5. Admin funkciók

**Felhasználókezelés:**

*Tanár regisztrálása:*
1. Kattints az "Userek" tabra
2. Bal oldali panel: Tanár regisztráció
3. Add meg az email címet
4. Állíts be jelszót (min. 6 karakter)
5. Teljes név
6. Tantárgy
7. Kattints a "Tanár regisztrálása" gombra

*Diák regisztrálása:*
1. Jobb oldali panel: Diák regisztráció
2. Add meg az email címet
3. Állíts be jelszót
4. Teljes név
5. Oktatási azonosító (11 számjegy)
6. Válassz osztályt
7. Kattints a "Diák regisztrálása" gombra

*Felhasználó módosítása:*
1. Görgess le a felhasználók listájához
2. Válassz osztályt vagy szerepkört a szűrőkből
3. Módosítsd a szerepkört vagy osztályt a legördülő menükből
4. Automatikus mentés

*Felhasználó törlése:*
1. Kattints a "Törlés" gombra
2. Erősítsd meg a műveletet
3. Felhasználó véglegesen törlődik

**Órarend kezelés:**

*ScheduleManager:*
1. Kattints az "Órarend" tabra
2. Bal oldalon látható a ScheduleManager
3. Drag & drop órarend szerkesztés
4. Tömeges szinkronizáció
5. Órarend módosítások kezelése

*Gyors óra hozzáadás:*
1. Jobb oldali panel
2. Válassz napot és időpontot
3. Tantárgy, tanár, osztály, terem
4. Kattints az "Óra rögzítése" gombra

**Jegyek kezelése:**
1. Kattints a "Jegyek" tabra
2. Szűrés osztály és diák szerint
3. Minden jegy látható
4. Jegyek törlése admin jogosultsággal

**Adatbázis karbantartás:**
1. Kattints a "Profil" tabra
2. Görgess le az "Adatbázis kezelés" részhez
3. "Mulasztások és órák törlése": törli az összes mulasztást
4. "Szinkronizálás": órarend hozzáadása diákokhoz
5. **FIGYELEM**: Ezek a műveletek visszavonhatatlanok!

#### 4.2.6. DJ funkciók

**Minden diák funkció +**

**Zene moderálás:**
1. Kattints a "Rádió" tabra
2. Látható az összes zene kérés
3. Kattints a "Törlés" gombra nem megfelelő zene esetén
4. Megerősítés után törlés

### 4.3. Szerepkörök és jogosultságok

#### 4.3.1. Szerepkör mátrix

| Funkció | Admin | Tanár | Osztályfőnök | Diák | DJ |
|---------|-------|-------|--------------|------|-----|
| Saját órarend | ✅ | ✅ | ✅ | ✅ | ✅ |
| Jegyek megtekintése (saját) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Jegy beírása | ✅ | ✅ | ✅ | ❌ | ❌ |
| Jegy törlése (bárki) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Házi kiadása | ✅ | ✅ | ✅ | ❌ | ❌ |
| Házi beadása | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mulasztás rögzítése | ✅ | ✅ | ✅ | ❌ | ❌ |
| Igazolás beküldése | ❌ | ❌ | ❌ | ✅ | ✅ |
| Igazolás elbírálása | ✅ | ❌ | ✅* | ❌ | ❌ |
| Felhasználó létrehozása | ✅ | ❌ | ❌ | ❌ | ❌ |
| Felhasználó törlése | ✅ | ❌ | ❌ | ❌ | ❌ |
| Órarend szerkesztése | ✅ | ❌ | ❌ | ❌ | ❌ |
| Chat használata | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat moderálás | ✅ | ❌ | ❌ | ❌ | ❌ |
| Zene kérés | ✅ | ✅ | ✅ | ✅ | ✅ |
| Zene moderálás | ✅ | ❌ | ❌ | ❌ | ✅ |
| QR kód | ❌ | ❌ | ❌ | ✅ | ✅ |

*Csak saját osztály igazolásai

#### 4.3.2. Gyakori hibák és megoldások

**Probléma: Nem tudok bejelentkezni**
- Ellenőrizd az email cím helyességét
- Bizonyosodj meg róla, hogy a jelszó helyes
- Próbáld meg a jelszó visszaállítást
- Ellenőrizd az internetkapcsolatot

**Probléma: Nem látom az órarendem**
- Frissítsd az oldalt (F5)
- Ellenőrizd, hogy be vagy-e jelentkezve
- Nézd meg, hogy a megfelelő napot választottad-e
- Ha továbbra sem látod, jelezd az adminnak

**Probléma: Nem tudok jegyet beírni**
- Ellenőrizd, hogy tanár vagy-e
- Bizonyosodj meg róla, hogy minden mezőt kitöltöttél
- Ellenőrizd, hogy a diák a te osztályodban van-e
- Próbáld újra betölteni az oldalt

**Probléma: Házi feladat nem jelenik meg**
- Ellenőrizd, hogy a megfelelő osztályhoz tartozol-e
- Nézd meg a határidőt (lejárt házi külön jelenik meg)
- Frissítsd az oldalt
- Jelezd a tanárnak

**Probléma: Dark mode nem működik**
- Fogadd el a cookie-kat
- Frissítsd az oldalt
- Töröld a böngésző cache-t
- Próbáld inkognitó módban

**Probléma: Mobil nézetben nem látom a menüt**
- Kattints a hamburger ikonra (☰)
- Ellenőrizd, hogy JavaScript engedélyezve van-e
- Próbáld meg más böngészőben
- Frissítsd az oldalt

#### 4.3.3. Tippek és trükkök

**Gyors navigáció:**
- Használd a Tab billentyűt a mezők közötti váltáshoz
- Enter billentyű a formok elküldéséhez
- Esc billentyű a modal ablakok bezárásához

**Hatékony jegykezelés:**
- Szűrd az osztályt először
- Használd a gyorsbillentyűket
- Csoportos jegyadás: több diáknak egyszerre

**Órarend tippek:**
- Mentsd el kedvencnek a gyakran használt nézeteket
- Használd a heti navigációt gyors váltáshoz
- Aktuális óra mindig kiemelve

**Kommunikáció:**
- Chat üzenetek valós időben frissülnek
- @említés funkció (hamarosan)
- Emoji támogatás

---

## 5. ÖSSZEGZÉS

### 5.1. Projekt eredményei

A Luminé iskolai menedzsment rendszer sikeres fejlesztése során egy komplex, production-ready webalkalmazás jött létre, amely valós problémára nyújt gyakorlati megoldást. A projekt során alkalmazott modern technológiák és best practice-ek biztosítják a rendszer megbízható működését és jövőbeli bővíthetőségét.

**Elért célok:**
- ✅ Teljes körű iskolai adminisztráció digitalizálása
- ✅ Szerepkör-alapú hozzáférés-vezérlés implementálása
- ✅ Valós idejű adatszinkronizáció Firebase-zel
- ✅ Reszponzív, mobile-first design
- ✅ Biztonságos autentikáció és autorizáció
- ✅ Intuitív felhasználói felület
- ✅ Átfogó dokumentáció

### 5.2. Technológiai tanulságok

**Next.js 14 előnyei:**
- Server-side rendering gyors oldalbetöltést biztosít
- API Routes egyszerűsíti a backend fejlesztést
- App Router modern routing megoldás
- Beépített optimalizációk (képek, betűtípusok)

**Firebase tapasztalatok:**
- Firestore valós idejű szinkronizációja kiváló
- Authentication egyszerű és biztonságos
- Security Rules hatékony jogosultságkezelés
- Ingyenes tier elegendő kis-közepes projektekhez

**TypeScript értéke:**
- Típusbiztonság csökkenti a hibák számát
- IntelliSense növeli a fejlesztési sebességet
- Refaktorálás biztonságosabb
- Dokumentációs értéke magas

### 5.3. Kihívások és megoldások

**Kihívás 1: Komplex szerepkör-kezelés**
- Megoldás: Middleware-alapú autorizáció, Firebase Custom Claims

**Kihívás 2: Valós idejű adatszinkronizáció**
- Megoldás: Firestore real-time listeners, optimista UI frissítés

**Kihívás 3: Reszponzív design minden eszközön**
- Megoldás: Tailwind CSS utility osztályok, mobile-first megközelítés

**Kihívás 4: Teljesítmény optimalizáció**
- Megoldás: Code splitting, lazy loading, image optimization

### 5.4. Jövőbeli fejlesztési lehetőségek

**Rövid távú (1-3 hónap):**
- Push notification rendszer
- Email értesítések
- Fájl feltöltés házi feladatokhoz
- Exportálás PDF-be (jegyek, órarend)

**Középtávú (3-6 hónap):**
- Mobil alkalmazás (React Native)
- Szülői felület
- Statisztikák és riportok
- Integrációk (Google Calendar, Microsoft Teams)

**Hosszú távú (6-12 hónap):**
- AI-alapú javaslatok
- Prediktív analitika
- Multi-tenant architektúra (több iskola)
- API dokumentáció (Swagger)

### 5.5. Személyes tapasztalatok

A projekt fejlesztése során mélyreható ismereteket szereztem a modern webfejlesztés területén. A Next.js és Firebase kombinációja hatékony és skálázható megoldást nyújt, amely gyorsan piacra vihető alkalmazások készítésére alkalmas.

A legnagyobb tanulság számomra az volt, hogy egy jól megtervezett architektúra és tiszta kód mennyire megkönnyíti a fejlesztést és karbantartást. A TypeScript használata kezdetben lassította a fejlesztést, de hosszú távon jelentősen csökkentette a hibák számát.

### 5.6. Zárszó

A Luminé projekt demonstrálja, hogy modern technológiákkal hogyan lehet hatékony, felhasználóbarát alkalmazásokat fejleszteni. A rendszer azonnal használható valós iskolai környezetben, és a jövőben további funkciókkal bővíthető.

Remélem, hogy ez a projekt hozzájárul az oktatási intézmények digitális transzformációjához, és megkönnyíti mind a tanárok, mind a diákok mindennapi munkáját.

---

## 6. IRODALOMJEGYZÉK

### 6.1. Könyvek és szakirodalom

[1] Flanagan, D. (2020). *JavaScript: The Definitive Guide, 7th Edition*. O'Reilly Media.

[2] Banks, A., Porcello, E. (2020). *Learning React, 2nd Edition*. O'Reilly Media.

[3] Larsen, R., Meeker, M. (2021). *Next.js Quick Start Guide*. Packt Publishing.

[4] Moroney, L. (2021). *Firebase Essentials*. Packt Publishing.

### 6.2. Online dokumentációk

[5] Next.js Documentation. (2024). https://nextjs.org/docs

[6] React Documentation. (2024). https://react.dev

[7] Firebase Documentation. (2024). https://firebase.google.com/docs

[8] TypeScript Documentation. (2024). https://www.typescriptlang.org/docs

[9] Tailwind CSS Documentation. (2024). https://tailwindcss.com/docs



### 6.3. Cikkek és blogok

[11] Osmani, A. (2023). "React Performance Optimization". web.dev

[12] Abramov, D. (2023). "A Complete Guide to useEffect". overreacted.io

[13] Next.js Team. (2023). "Next.js 14 Release Notes". nextjs.org/blog

[14] Firebase Team. (2023). "Firestore Best Practices". firebase.googleblog.com

### 6.4. Videók és kurzusok

[15] Schwarzmüller, M. (2023). "React - The Complete Guide". Udemy.

[16] Schmedtmann, J. (2023). "Advanced CSS and Sass". Udemy.

[17] Traversy Media. (2023). "Next.js Crash Course". YouTube.

### 6.5. Szabványok és irányelvek

[18] W3C. (2023). "Web Content Accessibility Guidelines (WCAG) 2.1". w3.org

[19] OWASP. (2023). "Top 10 Web Application Security Risks". owasp.org

[20] Google. (2023). "Material Design Guidelines". material.io

---

## 7. ÁBRAJEGYZÉK

1. ábra: Rendszer architektúra diagram ............................ 8
2. ábra: Komponens diagram ........................................ 9
3. ábra: Adatbázismodell-diagram ................................. 13
4. ábra: Felhasználói szerepkörök mátrix ......................... 16
5. ábra: Navigációs struktúra .................................... 17
6. ábra: Órarend nézet (desktop) ................................. 18
7. ábra: Órarend nézet (mobil) ................................... 18
8. ábra: Jegyek grafikus megjelenítése ........................... 19
9. ábra: Házi feladat beadási folyamat ........................... 20
10. ábra: Mulasztás rögzítési folyamat ........................... 21
11. ábra: Igazolási folyamat ..................................... 22
12. ábra: Admin felhasználókezelés ............................... 23
13. ábra: Dark mode összehasonlítás .............................. 24
14. ábra: Reszponzív breakpointok ................................ 25
15. ábra: Teszteredmények összegzése ............................. 26

---

**NYILATKOZAT**

Alulírott [NÉV] kijelentem, hogy ezt a szakdolgozatot magam készítettem, és abban csak a megadott forrásokat használtam fel. Minden olyan részt, amelyet szó szerint, vagy azonos tartalomban, de átfogalmazva más forrásból átvettem, egyértelműen, a forrás megadásával megjelöltem.

A szakdolgozat benyújtásával tudomásul veszem, hogy azt a Békéscsabai SZC Nemes Tihamér Technikum és Kollégium könyvtárában elhelyezik, és az elektronikus adathordozón rögzített változatát a plágiumellenőrző rendszerbe feltöltik.

Békéscsaba, 2024. [HÓNAP] [NAP].

                                                    _______________________
                                                         [NÉV]
                                                        diák aláírása

---

**DOKUMENTÁCIÓ VÉGE**

Oldalszám: 35
Karakterszám (szóközökkel): ~45 000
Verzió: 1.0
Utolsó frissítés: 2024. január
