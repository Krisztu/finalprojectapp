# DJ SZEREPKÖR DOKUMENTÁCIÓ

## Áttekintés

A DJ szerepkör egy speciális diák szerepkör a Luminé rendszerben, amely az iskolai rádió működését támogatja. A DJ szerepkörrel rendelkező felhasználók az összes diák funkcióhoz hozzáférnek, plusz extra jogosultságokat kapnak a zene kérések kezeléséhez.

## Szerepkör hierarchia

```
Admin > Osztályfőnök > Tanár > DJ/Diák
```

A DJ és a Diák szerepkör azonos szinten van, de a DJ-nek extra jogosultságai vannak.

## Jogosultságok

### Diák jogosultságok (örökölt)
- ✅ Órarend megtekintése
- ✅ Jegyek megtekintése
- ✅ Mulasztások nyomon követése
- ✅ Házi feladatok megtekintése és beadása
- ✅ Igazolás beküldése
- ✅ Zene kérés beküldése
- ✅ Üzenőfal használata
- ✅ QR kód generálás
- ✅ Profil kezelése

### DJ specifikus jogosultságok
- ✅ Zene kérések megtekintése (összes diák kérése)
- ✅ Zene kérések törlése (lejátszás után)
- ✅ Zene kérések kezelése (Spotify, YouTube támogatás)

## Technikai implementáció

### User típus definíció

```typescript
interface User {
  id: string
  email: string
  fullName: string
  role: 'student' | 'teacher' | 'homeroom_teacher' | 'admin' | 'dj'
  class: string
  studentId?: string
  profileImage?: string
}
```

### Firestore Security Rules

```javascript
// DJ jogosultságok a musicRequests collection-höz
match /musicRequests/{requestId} {
  // Mindenki olvashatja
  allow read: if isAuthenticated();
  
  // Diákok és DJ-k küldhetnek be zenét
  allow create: if isStudent() &&
                   request.resource.data.userId == request.auth.uid;
  
  // Csak DJ és Admin törölhet
  allow delete: if isDJ() || isAdmin();
}

function isDJ() {
  return isAuthenticated() && request.auth.token.role == 'dj';
}

function isStudent() {
  return isAuthenticated() && 
    (request.auth.token.role == 'student' || 
     request.auth.token.role == 'dj');
}
```

### API Endpoint

**GET /api/music**
- Lekéri az összes zene kérést
- Hozzáférés: Minden bejelentkezett felhasználó

**POST /api/music**
- Új zene kérés beküldése
- Hozzáférés: Diák, DJ

**DELETE /api/music?id={requestId}**
- Zene kérés törlése
- Hozzáférés: DJ, Admin

### Frontend komponens

```typescript
// Dashboard.tsx részlet
{userRole === 'dj' && (
  <button
    onClick={async () => {
      if (confirm('Biztosan törlöd ezt a zenét?')) {
        const response = await fetch(`/api/music?id=${request.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          loadMusicRequests()
          alert('Zene törölve!')
        }
      }
    }}
    className="bg-red-500 text-white px-2 py-1 rounded"
  >
    Törlés
  </button>
)}
```

## Használati útmutató

### DJ számára

#### 1. Zene kérések megtekintése
1. Jelentkezz be DJ fiókkal
2. Navigálj a "Rádió" menüpontra
3. Láthatod az összes beküldött zene kérést

#### 2. Zene lejátszása
1. Kattints a zene kérésre
2. A Spotify vagy YouTube embed player megjelenik
3. Játszd le a zenét az iskolai rádióban

#### 3. Zene kérés törlése
1. Kattints a "Törlés" gombra a zene kérésnél
2. Erősítsd meg a törlést
3. A zene kérés eltávolításra kerül

### Diákok számára

#### Zene kérés beküldése
1. Navigálj a "Rádió" menüpontra
2. Másold be a YouTube vagy Spotify linket
3. Kattints a "Zene beküldése" gombra
4. A DJ fogja kezelni a kérést

## Támogatott platformok

### YouTube
- YouTube videók
- YouTube Music
- URL formátumok:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://music.youtube.com/watch?v=VIDEO_ID`

### Spotify
- Spotify dalok
- URL formátum:
  - `https://open.spotify.com/track/TRACK_ID`

## Adatbázis struktúra

### Music Requests Collection

```typescript
music_requests/{requestId}
{
  id: string,              // Egyedi azonosító
  url: string,             // Zene URL
  platform: string,        // 'spotify' | 'youtube'
  title?: string,          // Zene címe
  thumbnail?: string,      // Borítókép
  userId: string,          // Kérő ID
  userName: string,        // Kérő neve
  userClass: string,       // Kérő osztálya
  createdAt: timestamp     // Beküldés időpontja
}
```

## Biztonsági megfontolások

### Jogosultság ellenőrzés
- A DJ szerepkör ellenőrzése minden törlési műveletnél
- Firebase Authentication token alapú ellenőrzés
- Firestore Security Rules szerver oldali védelem

### Rate Limiting
- Maximum 10 zene kérés / diák / nap
- Maximum 100 zene kérés törlés / DJ / nap

### Tartalom moderálás
- Csak YouTube és Spotify linkek engedélyezettek
- URL validáció szerver oldalon
- Spam védelem

## Tesztelés

### Unit tesztek
```typescript
describe('DJ Role', () => {
  it('should allow DJ to delete music requests', async () => {
    const dj = { role: 'dj', uid: 'dj123' }
    const result = await deleteMusicRequest('request123', dj)
    expect(result.success).toBe(true)
  })
  
  it('should not allow student to delete music requests', async () => {
    const student = { role: 'student', uid: 'student123' }
    const result = await deleteMusicRequest('request123', student)
    expect(result.success).toBe(false)
  })
})
```

### E2E tesztek
```typescript
test('DJ can delete music requests', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('text=Rádió')
  await page.click('button:has-text("Törlés")')
  await page.click('button:has-text("OK")')
  await expect(page.locator('.music-request')).toHaveCount(0)
})
```

## Gyakori problémák

### Nem tudok törölni zene kérést
- Ellenőrizd, hogy DJ szerepkörrel vagy-e bejelentkezve
- Frissítsd az oldalt (F5)
- Ellenőrizd az internet kapcsolatot

### A zene nem töltődik be
- Ellenőrizd a YouTube/Spotify URL-t
- Próbáld meg újra beküldeni
- Ellenőrizd, hogy a videó elérhető-e

### Túl sok zene kérés
- Töröld a lejátszott zenéket rendszeresen
- Kérd meg a diákokat, hogy csak releváns zenéket küldjenek be

## Jövőbeli fejlesztések

### Tervezett funkciók
- 🔄 Zene kérések sorrendezése (drag & drop)
- ⭐ Zene kérések értékelése (like/dislike)
- 📊 Statisztikák (legnépszerűbb zenék, legtöbb kérés)
- 🎵 Lejátszási lista mentése
- 🔔 Értesítések új zene kérésekről
- 🎨 Testreszabható rádió felület

## Kapcsolat

**Technikai támogatás**:
- Email: support@lumine.edu.hu
- Telefon: +36 1 234 5678

**Hibabejelentés**:
- Email: bugs@lumine.edu.hu
