# 3.4 ADATBÁZIS LEÍRÁSA (folytatás)

### Justifications Collection

```typescript
justifications/{justificationId}
{
  id: string,              // Egyedi azonosító
  studentId: string,       // Diák ID
  studentName: string,     // Diák neve
  studentClass: string,    // Osztály
  date: string,            // Hiányzás dátuma
  reason: string,          // Indoklás
  proofUrls: string[],     // Bizonyítékok (orvosi igazolás stb.)
  status: string,          // 'pending' | 'approved' | 'rejected'
  reviewedBy?: string,     // Ki bírálta el
  reviewedAt?: timestamp,  // Elbírálás időpontja
  createdAt: timestamp
}
```

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
  createdAt: timestamp
}
```

**Megjegyzés**: A zene kéréseket bármelyik diák vagy DJ beküldheti, de csak a DJ szerepkörrel rendelkező felhasználók törölhetik azokat (lejátszás után).

### Chat Messages Collection

```typescript
chat_messages/{messageId}
{
  id: string,              // Egyedi azonosító
  message: string,         // Üzenet szövege
  userId: string,          // Küldő ID
  userName: string,        // Küldő neve
  createdAt: timestamp
}
```

### Schedule Changes Collection

```typescript
schedule_changes/{changeId}
{
  id: string,              // Egyedi azonosító
  teacherId: string,       // Érintett tanár ID
  date: string,            // Dátum (YYYY-MM-DD)
  timeSlot: string,        // Időpont (8:45)
  changeType: string,      // 'cancelled' | 'substituted' | 'added'
  newSubject?: string,     // Új tantárgy (helyettesítésnél)
  newTeacher?: string,     // Új tanár
  newClass?: string,       // Új osztály
  newRoom?: string,        // Új terem
  reason?: string,         // Indoklás
  createdAt: timestamp,
  createdBy: string        // Ki rögzítette
}
```

## 3.4.3 Adatbázis indexek

### Teljesítmény optimalizálás

```javascript
// Grades collection indexek
grades:
  - studentId (ASC), date (DESC)
  - teacherId (ASC), date (DESC)
  - studentClass (ASC), subject (ASC)

// Attendance collection indexek
attendance:
  - teacherId (ASC), date (DESC)
  - className (ASC), date (DESC)
  - date (ASC), startTime (ASC)

// Absences collection indexek
absences:
  - studentId (ASC), date (DESC)
  - excused (ASC), date (DESC)

// Homework collection indexek
homework:
  - teacherId (ASC), createdAt (DESC)
  - className (ASC), dueDate (ASC)

// Homework Submissions indexek
homework_submissions:
  - homeworkId (ASC), submittedAt (DESC)
  - studentId (ASC), status (ASC)
```

## 3.4.4 Adatbázis kapcsolatok

### Relációk (NoSQL környezetben)

```
users (1) ----< (N) grades
users (1) ----< (N) lessons
users (1) ----< (N) attendance
users (1) ----< (N) homework
users (1) ----< (N) homework_submissions
users (1) ----< (N) justifications

homework (1) ----< (N) homework_submissions
lessons (1) ----< (N) attendance
attendance (1) ----< (N) absences
```

## 3.4.5 Adatbázis műveletek

### CRUD műveletek példák

#### Create (Létrehozás)
```typescript
// Új jegy rögzítése
await db.collection('grades').add({
  studentId: 'user123',
  studentName: 'Kovács János',
  subject: 'Matematika',
  grade: 5,
  teacherId: 'teacher456',
  teacherName: 'Nagy Péter',
  date: new Date(),
  createdAt: new Date()
})
```

#### Read (Olvasás)
```typescript
// Diák jegyeinek lekérdezése
const gradesSnapshot = await db.collection('grades')
  .where('studentId', '==', userId)
  .orderBy('date', 'desc')
  .get()

const grades = gradesSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}))
```

#### Update (Módosítás)
```typescript
// Mulasztás igazolása
await db.collection('absences').doc(absenceId).update({
  excused: true,
  updatedAt: new Date()
})
```

#### Delete (Törlés)
```typescript
// Felhasználó törlése
await db.collection('users').doc(userId).delete()
```

## 3.4.6 Adatbázis biztonsági szabályok

### Firestore Rules összefoglalás

- **Users**: Csak saját adat olvasható/írható
- **Grades**: Diák látja sajátját, tanár/admin írhat
- **Attendance**: Tanár írhat, diák látja sajátját
- **Homework**: Mindenki látja, tanár írhat
- **Submissions**: Diák írhat sajátot, tanár látja mindet
- **Justifications**: Diák írhat, osztályfőnök bírál

## 3.4.7 Adatmigráció és verziókezelés

### Schema változások kezelése

```typescript
// Verzió követés
const SCHEMA_VERSION = '1.0.0'

// Migráció script példa
async function migrateToV2() {
  const usersSnapshot = await db.collection('users').get()
  
  const batch = db.batch()
  usersSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      schemaVersion: '2.0.0',
      newField: 'defaultValue'
    })
  })
  
  await batch.commit()
}
```

## 3.4.8 Backup stratégia

### Automatikus mentések
- **Napi backup**: Teljes adatbázis mentés
- **Inkrementális backup**: Óránkénti változások
- **Retention**: 30 napos megőrzés
- **Geo-redundancia**: Több régióban tárolva
