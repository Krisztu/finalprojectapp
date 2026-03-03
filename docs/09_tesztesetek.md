# 3.6 FŐBB FUNKCIONÁLIS TESZTESETEK

## 3.6.1 Tesztelési stratégia

### Tesztelési szintek

```
┌─────────────────────────────────┐
│     E2E Tesztek (Playwright)    │  ← Teljes user flow
├─────────────────────────────────┤
│  Integration Tesztek (Vitest)   │  ← Komponens + API
├─────────────────────────────────┤
│    Unit Tesztek (Vitest)        │  ← Komponensek, utils
└─────────────────────────────────┘
```

### Tesztelési eszközök
- **Vitest**: Unit és komponens tesztek
- **React Testing Library**: Komponens tesztelés
- **Playwright**: E2E tesztek
- **MSW**: API mockolás

## 3.6.2 Unit tesztek (Komponensek)

### TC-U01: Button komponens

**Cél**: Button komponens helyes működésének ellenőrzése

**Előfeltétel**: Komponens renderelhető

**Tesztlépések**:
1. Button renderelése szöveggel
2. onClick esemény kiváltása
3. Disabled állapot tesztelése

**Elvárt eredmény**:
- Szöveg megjelenik
- onClick meghívódik kattintásra
- Disabled állapotban nem kattintható

**Teszt kód**:
```typescript
it('onClick esemény működik', () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Kattints</Button>)
  fireEvent.click(screen.getByText('Kattints'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

**Státusz**: ✅ Sikeres

---

### TC-U02: Input komponens

**Cél**: Input mező validációjának tesztelése

**Tesztlépések**:
1. Input renderelése placeholder-rel
2. Szöveg beírása
3. onChange esemény ellenőrzése
4. Disabled állapot tesztelése

**Elvárt eredmény**:
- Placeholder látható
- onChange meghívódik
- Disabled állapotban nem írható

**Státusz**: ✅ Sikeres

---

### TC-U03: Card komponens

**Cél**: Card komponens tartalom megjelenítésének tesztelése

**Tesztlépések**:
1. Card renderelése címmel és tartalommal
2. Elemek láthatóságának ellenőrzése

**Elvárt eredmény**:
- Cím és tartalom megjelenik
- Megfelelő struktúra

**Státusz**: ✅ Sikeres

---

### TC-U04: Table komponens

**Cél**: Táblázat renderelésének tesztelése

**Tesztlépések**:
1. Táblázat renderelése fejléccel
2. Több sor hozzáadása
3. Adatok ellenőrzése

**Elvárt eredmény**:
- Fejléc megjelenik
- Sorok helyesen renderelődnek
- Adatok olvashatók

**Státusz**: ✅ Sikeres

## 3.6.3 E2E tesztek (Funkcionális)

### TC-E01: Bejelentkezés

**Teszt azonosító**: TC-E01  
**Prioritás**: Magas  
**Kategória**: Autentikáció

**Cél**: Sikeres bejelentkezés diákként

**Előfeltétel**: 
- Alkalmazás elérhető
- Teszt felhasználó létezik (viktorhorvath12@lumine.edu.hu)

**Tesztlépések**:
1. Navigálás a főoldalra (/)
2. Email cím beírása: viktorhorvath12@lumine.edu.hu
3. Jelszó beírása: diak123456
4. "Bejelentkezés" gomb kattintása

**Elvárt eredmény**:
- Átirányítás /dashboard oldalra
- "Főoldal" szöveg látható
- Felhasználó neve megjelenik a headerben

**Teszt kód**:
```typescript
test('sikeres bejelentkezés diákként', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[type="email"]', 'viktorhorvath12@lumine.edu.hu')
  await page.fill('input[type="password"]', 'diak123456')
  await page.click('button:has-text("Bejelentkezés")')
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('text=Főoldal')).toBeVisible()
})
```

**Státusz**: ✅ Sikeres  
**Futási idő**: 2.3s

---

### TC-E02: Sikertelen bejelentkezés

**Teszt azonosító**: TC-E02  
**Prioritás**: Magas  
**Kategória**: Autentikáció

**Cél**: Hibás jelszóval történő bejelentkezés elutasítása

**Tesztlépések**:
1. Navigálás a főoldalra
2. Helyes email beírása
3. Hibás jelszó beírása
4. Bejelentkezés gomb kattintása

**Elvárt eredmény**:
- Hibaüzenet megjelenik
- Nem történik átirányítás
- Felhasználó a login oldalon marad

**Státusz**: ✅ Sikeres  
**Futási idő**: 1.8s

---

### TC-E03: Jegyek megtekintése

**Teszt azonosító**: TC-E03  
**Prioritás**: Magas  
**Kategória**: Diák funkciók

**Cél**: Diák megtekinti saját jegyeit

**Előfeltétel**: Bejelentkezett diák

**Tesztlépések**:
1. Bejelentkezés diákként
2. "Jegyek" menüpont kattintása
3. Jegyek listájának ellenőrzése
4. Átlagok megjelenítésének ellenőrzése

**Elvárt eredmény**:
- Jegyek listája látható
- Összátlag megjelenik
- Tantárgyankénti átlagok láthatók
- Grafikon renderelődik

**Státusz**: ✅ Sikeres  
**Futási idő**: 3.1s

---

### TC-E04: Jegy beírása (Tanár)

**Teszt azonosító**: TC-E04  
**Prioritás**: Magas  
**Kategória**: Tanár funkciók

**Cél**: Tanár jegyet ír be diáknak

**Előfeltétel**: Bejelentkezett tanár

**Tesztlépések**:
1. Bejelentkezés tanárként
2. "Jegyek" menüpont kattintása
3. Osztály kiválasztása (12.A)
4. Diák kiválasztása
5. Jegy kiválasztása (5)
6. Típus kiválasztása (Dolgozat)
7. "Jegy rögzítése" gomb kattintása

**Elvárt eredmény**:
- Sikeres üzenet megjelenik
- Jegy megjelenik a listában
- Diák látja az új jegyet

**Státusz**: ✅ Sikeres  
**Futási idő**: 4.2s

---

### TC-E05: Mulasztás rögzítése

**Teszt azonosító**: TC-E05  
**Prioritás**: Magas  
**Kategória**: Tanár funkciók

**Cél**: Tanár rögzíti az órai mulasztásokat

**Előfeltétel**: 
- Bejelentkezett tanár
- Órarend tartalmaz órát

**Tesztlépések**:
1. Bejelentkezés tanárként
2. "Órarend" menüpont kattintása
3. Óra kiválasztása (kattintás)
4. Óratéma beírása
5. Diákok jelenlétének beállítása
6. "Mentés" gomb kattintása

**Elvárt eredmény**:
- Mulasztás rögzítve üzenet
- Hiányzó diákok listája frissül
- Diák látja a mulasztást

**Státusz**: ✅ Sikeres  
**Futási idő**: 5.1s

---

### TC-E06: Házi feladat kiadása

**Teszt azonosító**: TC-E06  
**Prioritás**: Közepes  
**Kategória**: Tanár funkciók

**Cél**: Tanár házi feladatot ad ki

**Tesztlépések**:
1. Bejelentkezés tanárként
2. "Házi" menüpont kattintása
3. Osztály kiválasztása
4. Cím beírása
5. Leírás beírása
6. Határidő beállítása
7. "Házi feladat kiadása" gomb

**Elvárt eredmény**:
- Sikeres üzenet
- Házi megjelenik a listában
- Diákok látják a házi feladatot

**Státusz**: ✅ Sikeres  
**Futási idő**: 3.8s

---

### TC-E07: Házi feladat beadása

**Teszt azonosító**: TC-E07  
**Prioritás**: Közepes  
**Kategória**: Diák funkciók

**Cél**: Diák beadja a házi feladatot

**Előfeltétel**: 
- Bejelentkezett diák
- Van kiadott házi feladat

**Tesztlépések**:
1. Bejelentkezés diákként
2. "Házi" menüpont kattintása
3. "Beküldés" gomb kattintása
4. Tartalom beírása
5. "Beküldés" gomb

**Elvárt eredmény**:
- Sikeres beküldés üzenet
- Házi "Beküldve" státuszú
- Tanár látja a beadást

**Státusz**: ✅ Sikeres  
**Futási idő**: 3.5s

---

### TC-E08: Igazolás beküldése

**Teszt azonosító**: TC-E08  
**Prioritás**: Közepes  
**Kategória**: Diák funkciók

**Cél**: Diák igazolást küld be mulasztásra

**Tesztlépések**:
1. Bejelentkezés diákként
2. "Igazolás" menüpont
3. Dátum kiválasztása
4. Indoklás beírása
5. Bizonyíték feltöltése (opcionális)
6. "Beküldés" gomb

**Elvárt eredmény**:
- Sikeres beküldés
- Igazolás "Függőben" státuszú
- Osztályfőnök látja a kérelmet

**Státusz**: ✅ Sikeres  
**Futási idő**: 4.0s
