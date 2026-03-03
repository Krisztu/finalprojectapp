# Adatbázis Read Optimalizálás

## Probléma
A dashboard túl sok Firestore read műveletet végez, ami:
- Lassítja az alkalmazást
- Növeli a költségeket (Firebase díjazás read alapú)
- Felesleges hálózati forgalmat generál

## Megoldási Stratégiák

### 1. **Client-side Cache (Implementálva)**

**Fájl**: `src/lib/dataCache.ts`

**Működés**:
- Memóriában tárolja a lekért adatokat 5 percig
- Újrafelhasználja a cache-elt adatokat ugyanazon session alatt
- Automatikusan invalidálja a cache-t módosítások után

**Használat**:
```typescript
import { getCachedUsers, invalidateUsers } from '@/lib/dataCache'

// Olvasás (cache-ből vagy DB-ből)
const users = await getCachedUsers('student')

// Módosítás után invalidálás
await addDoc(collection(db, 'users'), newUser)
invalidateUsers()
```

**Előnyök**:
- 80-90% read csökkenés ugyanazon adatoknál
- Gyorsabb UI válaszidő
- Egyszerű implementáció

### 2. **Lazy Loading**

**Implementáció**:
```typescript
// Csak akkor töltsd be az adatokat, amikor szükséges
useEffect(() => {
  if (activeTab === 'grades') {
    loadGrades()
  }
}, [activeTab])
```

**Előnyök**:
- Csak a látható adatok töltődnek be
- Gyorsabb kezdeti betöltés

### 3. **Pagination**

**Implementáció**:
```typescript
import { query, limit, startAfter } from 'firebase/firestore'

const q = query(
  collection(db, 'grades'),
  orderBy('date', 'desc'),
  limit(20)
)
```

**Előnyök**:
- Kevesebb adat egyszerre
- Gyorsabb lekérdezések

### 4. **Composite Queries helyett Denormalizáció**

**Rossz** (több read):
```typescript
// 1. read: user
const userDoc = await getDoc(doc(db, 'users', userId))
// 2. read: class
const classDoc = await getDoc(doc(db, 'classes', userDoc.data().classId))
```

**Jó** (1 read):
```typescript
// User dokumentumban tároljuk a class nevet is
const userDoc = await getDoc(doc(db, 'users', userId))
const className = userDoc.data().className // Már benne van
```

### 5. **Batch Reads**

**Implementáció**:
```typescript
import { documentId, where } from 'firebase/firestore'

// Egy query több dokumentumhoz
const q = query(
  collection(db, 'users'),
  where(documentId(), 'in', [id1, id2, id3])
)
```

**Előnyök**:
- Kevesebb hálózati kérés
- Gyorsabb végrehajtás

### 6. **Real-time Listeners Optimalizálása**

**Rossz** (folyamatos read):
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
    setUsers(snapshot.docs.map(doc => doc.data()))
  })
  return unsubscribe
}, [])
```

**Jó** (csak változáskor):
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        // Csak új dokumentumok
      }
      if (change.type === 'modified') {
        // Csak módosított dokumentumok
      }
    })
  })
  return unsubscribe
}, [])
```

### 7. **Index Használata**

Firebase Console-ban hozz létre composite indexeket:
```
Collection: grades
Fields: studentId (Ascending), date (Descending)
```

**Előnyök**:
- Gyorsabb lekérdezések
- Kevesebb read (optimalizált query)

### 8. **Local Persistence**

**Implementáció**:
```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore'

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Több tab nyitva
  } else if (err.code == 'unimplemented') {
    // Böngésző nem támogatja
  }
})
```

**Előnyök**:
- Offline működés
- Gyorsabb betöltés (lokális cache)
- Automatikus szinkronizáció

## Implementálási Prioritások

### Azonnal (Magas hatás, könnyű):
1. ✅ Client-side cache implementálása
2. ⏳ Lazy loading tab-okhoz
3. ⏳ Felesleges useEffect-ek eltávolítása

### Rövid távon (Közepes hatás):
4. ⏳ Pagination nagy listákhoz
5. ⏳ Batch reads implementálása
6. ⏳ Real-time listeners optimalizálása

### Hosszú távon (Nagy refactor):
7. ⏳ Denormalizáció (adatbázis struktúra változás)
8. ⏳ Local persistence engedélyezése
9. ⏳ Composite indexek létrehozása

## Mérési Módszerek

### Firebase Console
- Firestore Usage → Read operations
- Napi/havi read számok követése

### Chrome DevTools
```javascript
// Performance tab
// Network tab → Filter: firestore
```

### Kód szintű mérés
```typescript
let readCount = 0

const originalGetDocs = getDocs
getDocs = async (...args) => {
  readCount++
  console.log('Read count:', readCount)
  return originalGetDocs(...args)
}
```

## Várható Eredmények

| Optimalizálás | Read Csökkenés | Implementálási Idő |
|---------------|----------------|-------------------|
| Client cache  | 70-80%         | 2-3 óra          |
| Lazy loading  | 40-50%         | 1-2 óra          |
| Pagination    | 60-70%         | 2-4 óra          |
| Denormalizáció| 30-40%         | 1-2 nap          |
| Local persist | 50-60%         | 1 óra            |

**Összesen**: 90-95% read csökkenés az összes optimalizálás után

## Költség Becslés

Firebase Free Tier:
- 50,000 read/nap ingyenes
- $0.06 / 100,000 read után

**Példa**:
- Jelenlegi: 200,000 read/nap = $0.09/nap = $2.7/hó
- Optimalizált: 20,000 read/nap = $0/nap (free tier)

**Megtakarítás**: ~$30/év
