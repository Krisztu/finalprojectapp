# 3.5 NAVIGÁCIÓ ÉS ERGONÓMIA

## 3.5.1 Navigációs struktúra

### Főmenü felépítése

```
Dashboard (Főoldal)
├── Főoldal (Áttekintés)
├── Órarend
├── Jegyek
├── Mulasztások
├── Házi feladatok
├── Igazolás
├── Rádió
├── Üzenőfal
├── QR kód
└── Profil
```

### Szerepkör alapú menü

#### Diák menü
- Főoldal
- Órarend
- Jegyek
- Mulasztások
- Házi feladatok
- Igazolás
- Rádió
- Üzenőfal
- QR kód
- Profil

#### Tanár menü
- Főoldal
- Órarend
- Jegyek (beírás)
- Mulasztások (rögzítés)
- Házi feladatok (kiadás)
- Rádió
- Üzenőfal
- Profil

#### Admin menü
- Főoldal
- Órarend kezelés
- Jegyek áttekintés
- Felhasználók kezelése
- Üzenőfal
- Profil

## 3.5.2 Felhasználói felület kialakítása

### Layout struktúra

```
┌─────────────────────────────────────────┐
│           Header (Fix)                  │
│  Logo | Navigáció | Dark Mode | Profil  │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│           Fő tartalom terület           │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Színséma

#### Light mode
- **Háttér**: Fehér (#FFFFFF)
- **Elsődleges**: Kék (#3B82F6)
- **Másodlagos**: Szürke (#6B7280)
- **Siker**: Zöld (#10B981)
- **Figyelmeztetés**: Sárga (#F59E0B)
- **Hiba**: Piros (#EF4444)

#### Dark mode
- **Háttér**: Sötétszürke (#1F2937)
- **Elsődleges**: Világoskék (#60A5FA)
- **Másodlagos**: Világosszürke (#9CA3AF)
- **Szöveg**: Fehér (#F9FAFB)

### Tipográfia

- **Címsorok**: Inter, 24-32px, Bold
- **Alcímek**: Inter, 18-20px, Semibold
- **Szövegtörzs**: Inter, 14-16px, Regular
- **Kis szöveg**: Inter, 12px, Regular

## 3.5.3 Ergonómiai szempontok

### Használhatósági elvek

#### 1. Konzisztencia
- Egységes gombok és UI elemek
- Következetes színhasználat
- Azonos interakciós minták

#### 2. Visszajelzés
- Betöltési indikátorok
- Sikeres/sikertelen műveletek jelzése
- Hover és focus állapotok

#### 3. Hibakezelés
- Érthető hibaüzenetek
- Validációs üzenetek valós időben
- Visszavonási lehetőség

#### 4. Hatékonyság
- Gyorsbillentyűk támogatása
- Keresési funkciók
- Szűrési lehetőségek

### Akadálymentesség (WCAG 2.1 AA)

#### Színkontrasztok
- Normál szöveg: minimum 4.5:1
- Nagy szöveg: minimum 3:1
- UI komponensek: minimum 3:1

#### Billentyűzet navigáció
- Tab sorrend logikus
- Focus indikátorok láthatók
- Skip to content link

#### Screen reader támogatás
- Szemantikus HTML
- ARIA attribútumok
- Alt szövegek képeknél

#### Responsive design
- Mobil: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## 3.5.4 Interakciós minták

### Gombok

```
Elsődleges gomb: Kék háttér, fehér szöveg
Másodlagos gomb: Fehér háttér, kék szöveg, kék border
Veszélyes gomb: Piros háttér, fehér szöveg
Letiltott gomb: Szürke háttér, átlátszó
```

### Űrlapok

- Címkék az input felett
- Placeholder szöveg segítségként
- Validáció valós időben
- Hibaüzenetek az input alatt
- Kötelező mezők jelölése (*)

### Modális ablakok

- Háttér elsötétítése
- Escape billentyűvel bezárható
- X gomb a jobb felső sarokban
- Kattintás a háttérre bezárja

### Értesítések (Toast)

- Jobb felső sarokban jelennek meg
- 3-5 másodperc után eltűnnek
- Színkódoltak (siker: zöld, hiba: piros)
- Bezárható X gombbal

## 3.5.5 Mobil optimalizálás

### Hamburger menü
- Mobil nézetben összecsukható menü
- Teljes képernyős overlay
- Animált átmenetek

### Touch-friendly
- Minimum 44x44px érintési terület
- Megfelelő távolság az elemek között
- Swipe gesture-ök támogatása

### Responsive táblázatok
- Horizontális görgetés
- Kártyás nézet mobil nézetben
- Összesített információk

## 3.5.6 Teljesítmény optimalizálás

### Betöltési idő
- Lazy loading képeknél
- Code splitting
- Optimalizált képek (WebP)
- CDN használata

### Animációk
- 60 FPS cél
- CSS transform használata
- Reduced motion támogatás

### Cache stratégia
- Service Worker
- Static asset cache
- API response cache (30s)
