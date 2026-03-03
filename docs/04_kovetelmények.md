# 3. TÉMA KIFEJTÉSE - FEJLESZTŐI DOKUMENTÁCIÓ

## 3.1 Követelmények

### 3.1.1 Funkcionális követelmények

#### Autentikáció és jogosultságkezelés
- **F01**: A rendszer támogatja a felhasználói regisztrációt és bejelentkezést
- **F02**: Öt különböző szerepkör kezelése: Diák, Tanár, Osztályfőnök, Admin, DJ
- **F03**: Szerepkör alapú hozzáférés-szabályozás (RBAC)
- **F04**: Jelszó-visszaállítási funkció

#### DJ funkciók
- **F13A**: Zene kérések megtekintése
- **F13B**: Zene kérések törlése (lejátszás után)
- **F13C**: Zene kérések kezelése (Spotify, YouTube támogatás)
- **F13D**: Diák jogosultságok (órarend, jegyek, mulasztások, házi feladatok)

#### Diák funkciók
- **F05**: Órarend megtekintése napi és heti bontásban
- **F06**: Jegyek megtekintése tantárgyanként és összesítve
- **F07**: Átlagok automatikus számítása
- **F08**: Mulasztások nyomon követése (igazolt/igazolatlan)
- **F09**: Házi feladatok megtekintése és beadása
- **F10**: Igazolás beküldése mulasztásokra
- **F11**: Zene kérés beküldése az iskolai rádióba
- **F12**: Üzenőfal használata
- **F13**: QR kód generálás be/kilépéshez

#### Tanár funkciók
- **F14**: Jegyek beírása egyénileg és osztályonként
- **F15**: Mulasztások rögzítése óránként
- **F16**: Óratéma rögzítése
- **F17**: Házi feladat kiadása
- **F18**: Beadott házi feladatok értékelése
- **F19**: Saját órarend megtekintése
- **F20**: Helyettesítések kezelése

#### Osztályfőnök funkciók
- **F21**: Osztály mulasztásainak áttekintése
- **F22**: Igazolások elfogadása/elutasítása
- **F23**: Osztály jegyeinek megtekintése
- **F24**: Szülői értesítések küldése

#### Admin funkciók
- **F25**: Felhasználók kezelése (létrehozás, módosítás, törlés)
- **F26**: Órarend szerkesztése
- **F27**: Osztályok kezelése
- **F28**: Rendszerbeállítások módosítása
- **F29**: Statisztikák megtekintése

#### Közös funkciók
- **F30**: Profil szerkesztése
- **F31**: Profilkép feltöltése
- **F32**: Dark mode támogatás
- **F33**: Responsive design (mobil/tablet/desktop)
- **F34**: Értesítések kezelése

### 3.1.2 Nem-funkcionális követelmények

#### Teljesítmény
- **NF01**: Az oldal betöltési ideje maximum 3 másodperc
- **NF02**: API válaszidő átlagosan 500ms alatt
- **NF03**: Támogatja minimum 500 egyidejű felhasználót
- **NF04**: Adatbázis lekérdezések optimalizálása cache-eléssel

#### Biztonság
- **NF05**: HTTPS protokoll használata
- **NF06**: Jelszavak bcrypt hash-eléssel tárolva
- **NF07**: Firebase Authentication használata
- **NF08**: GDPR megfelelőség
- **NF09**: XSS és CSRF védelem
- **NF10**: Rate limiting az API végpontokon

#### Használhatóság
- **NF11**: Intuitív, felhasználóbarát felület
- **NF12**: Magyar nyelvű felület
- **NF13**: Akadálymentesség (WCAG 2.1 AA szint)
- **NF14**: Konzisztens design rendszer
- **NF15**: Hibaüzenetek érthetőek és segítőek

#### Karbantarthatóság
- **NF16**: Moduláris kódstruktúra
- **NF17**: TypeScript típusbiztonság
- **NF18**: Komponens alapú architektúra
- **NF19**: Automatizált tesztek (unit, integration, E2E)
- **NF20**: Dokumentált kódbázis

#### Kompatibilitás
- **NF21**: Chrome, Firefox, Safari, Edge támogatás
- **NF22**: iOS és Android mobil böngészők
- **NF23**: Minimum 1280x720 felbontás támogatása
- **NF24**: Progressive Web App (PWA) képesség

### 3.1.3 Üzleti követelmények

- **B01**: A rendszer költséghatékony legyen (Firebase ingyenes tier)
- **B02**: Skálázható legyen nagyobb intézmények számára is
- **B03**: Könnyű legyen telepíteni és karbantartani
- **B04**: Adatok exportálhatók legyenek (Excel, PDF)
- **B05**: Biztonsági mentések automatikusan készüljenek
