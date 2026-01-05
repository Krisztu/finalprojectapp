# 🚀 DEPLOYMENT ÚTMUTATÓ - Firebase Rules Optimalizálás

## ⚠️ FONTOS - Kövesd ezt a sorrendet!

### 1️⃣ Első Lépés: Custom Claims Szinkronizálás

**MIELŐTT** deploy-olnád a rules-t, állítsd be a custom claims-eket a meglévő felhasználóknál!

**Módszer 1 - Browser Console:**
1. Nyiss meg egy böngészőt és jelentkezz be **admin** fiókkal
2. Nyisd meg Developer Tools-t (F12 vagy Ctrl+Shift+I)
3. Console tab-ra válts
4. Másold be és futtasd:

```javascript
fetch('/api/admin/set-roles', { method: 'POST' })
  .then(r => r.json())
  .then(d => console.log('✅ Claims beállítva:', d))
  .catch(e => console.error('❌ Hiba:', e))
```

**Módszer 2 - Postman/Insomnia:**
```
POST http://localhost:3000/api/admin/set-roles
```

**Várt válasz:**
```json
{
  "message": "Szerepkörök beállítva",
  "count": 15
}
```

---

### 2️⃣ Második Lépés: Firebase Rules Deploy

**Opció A - Firebase CLI (ajánlott):**

```bash
# Ha nincs telepítve a Firebase CLI:
npm install -g firebase-tools

# Bejelentkezés (ha még nem vagy):
firebase login

# Firebase projekt inicializálás (ha még nem volt):
firebase init firestore

# Rules deploy:
firebase deploy --only firestore:rules
```

**Opció B - Firebase Console:**

1. Menj a [Firebase Console](https://console.firebase.google.com/)
2. Válaszd ki a projektet
3. **Firestore Database** → **Rules** tab
4. Másold be a teljes `firestore.rules` fájl tartalmát
5. Klikk a **Publish** gombra

---

### 3️⃣ Harmadik Lépés: Felhasználók Kijelentkeztetése

> ⚠️ **KRITIKUS**: A custom claims csak ÚJ bejelentkezéskor frissülnek!

**Minden felhasználónak ki kell jelentkeznie és újra be kell jelentkeznie.**

**Kommunikáció:**
- Discord/Email/Chat üzenet: "Kérlek jelentkezz ki és újra be a weboldalon a frissítések érvényesítéséhez!"

**VAGY - Automatikus Token Refresh (Fejlesztői Módszer):**

Szerkeszd: `src/contexts/AuthContext.tsx`

```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await user.getIdToken(true) // ⬅️ TRUE = force refresh!
        console.log('Token frissítve')
      } catch (error) {
        console.log('Token frissítés hiba')
      }
    }
    setUser(user)
    setLoading(false)
  })
  return unsubscribe
}, [])
```

---

### 4️⃣ Negyedik Lépés: Tesztelés

**Gyors Teszt Checklist:**

```bash
# Különböző szerepkörökkel:

[ ] Diák - Bejelentkezés sikeres
[ ] Diák - Órarend látható
[ ] Diák - Saját jegyek láthatók
[ ] Diák - Házi beadás működik
[ ] Diák - Chat működik

[ ] Tanár - Bejelentkezés sikeres  
[ ] Tanár - Saját órák láthatók
[ ] Tanár - Jegy adás működik
[ ] Tanár - Mulasztás rögzítés működik

[ ] Admin - Teljes hozzáférés
[ ] Admin - Felhasználó kezelés működik
```

**Ha MINDEN működik:** ✅ Kész vagy!

**Ha valami NEM működik:**
1. Ellenőrizd a Browser Console-ban a hibákat
2. Ellenőrizd a Firebase Console → Firestore → Rules → Logs
3. Győződj meg róla, hogy a `/api/admin/set-roles` sikeresen lefutott

---

## 📊 Teljesítmény Ellenőrzés (1 hét múlva)

**Firebase Console → Firestore → Usage:**

- **Reads**: ~50% csökkenés várható (getUserRole() megszűnés miatt)
- **Writes**: Változatlan
- **Rules evaluation time**: Gyorsabb

---

## 🔧 Rollback (ha valami elromlik)

**Vissza a régi rules-hoz:**

1. Firebase Console → Firestore → Rules → **Release history**
2. Válaszd ki az előző verziót
3. Klikk a **Rollback** gombra

**VAGY:**

```bash
firebase deploy --only firestore:rules
# Majd visszaállítod a régi firestore.rules fájl tartalmát
```

---

## ✅ Checklist - Minden kész?

- [ ] 1. Custom claims szinkronizálva (`/api/admin/set-roles`)
- [ ] 2. Firebase rules deploy-olva
- [ ] 3. Felhasználók kijelentkeztek/újra bejelentkeztek
- [ ] 4. Alapfunkciók tesztelve (órarend, jegyek, chat)
- [ ] 5. Nincsenek "Permission denied" hibák

**Ha minden kész:** 🎉 **Gratulálok! Az optimalizálás éles!**

---

## 💡 Pro Tippek

1. **Staging környezet**: Ha van staging Firebase project, először ott teszteld!
2. **Monitorozás**: Állíts be Firebase Alerts-et a Rules errors-re
3. **Dokumentáció**: Tartsd frissen az `implementation_plan.md` és `walkthrough.md` fájlokat
4. **Backup**: Mentsd el a régi rules fájlt (`firestore.rules.backup`)

Kellemes optimalizálást! 🚀
