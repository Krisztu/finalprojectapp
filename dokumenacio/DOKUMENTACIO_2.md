### 3.4. Adatbázis leírása

#### 3.4.1. Firestore Collections

A Luminé rendszer 9 fő collection-t használ a Firebase Firestore adatbázisban:

**1. users - Felhasználók**

Tárolja az összes felhasználó adatait szerepkörtől függetlenül.

```typescript
{
  uid: string,              // Firebase Auth UID (egyedi azonosító)
  email: string,            // Email cím (egyedi)
  fullName: string,         // Teljes név
  role: string,             // 'admin' | 'teacher' | 'homeroom_teacher' | 'student' | 'dj'
  class?: string,           // Osztály (diákok esetén, pl. "12.A")
  subject?: string,         // Tantárgy (tanárok esetén)
  studentId?: string,       // Oktatási azonosító (11 számjegy)
  createdAt: string         // Létrehozás időpontja (ISO 8601)
}
```

**Indexek:**
- email (egyedi)
- role + class (összetett)

**2. lessons - Órarend bejegyzések**

Minden felhasználó személyre szabott órarendjét tárolja.

```typescript
{
  userId: string,           // Felhasználó ID (users.uid)
  day: string,              // Nap neve ("Hétfő", "Kedd", stb.)
  startTime: string,        // Kezdési idő ("7:45", "8:45", stb.)
  subject: string,          // Tantárgy neve
  teacherName: string,      // Tanár teljes neve
  className: string,        // Osztály neve
  room: string,             // Terem száma
  createdAt: string         // Létrehozás időpontja
}
```

**Indexek:**
- userId + day (összetett)
- teacherName + day (összetett)

**3. grades - Jegyek**

Diákok jegyeit tárolja tantárgyanként.

```typescript
{
  studentName: string,      // Diák teljes neve
  studentClass: string,     // Diák osztálya
  subject: string,          // Tantárgy
  grade: number,            // Jegy értéke (1-5)
  title: string,            // Jegy típusa ("Dolgozat", "Felelet", stb.)
  description?: string,     // Opcionális megjegyzés
  teacherName: string,      // Jegyet adó tanár neve
  date: string,             // Jegy dátuma (ISO 8601)
  createdAt: string         // Rögzítés időpontja
}
```

**Indexek:**
- studentName + subject (összetett)
- teacherName + date (összetett)

**4. homework - Házi feladatok**

Tanárok által kiadott házi feladatok.

```typescript
{
  title: string,            // Feladat címe
  description: string,      // Részletes leírás
  dueDate: string,          // Határidő (ISO 8601)
  teacherId: string,        // Tanár ID
  teacherName: string,      // Tanár neve
  subject: string,          // Tantárgy
  className: string,        // Osztály
  lessonId: string,         // Óra azonosító (day_time_class)
  attachments: string[],    // Mellékletek URL-jei
  createdAt: string         // Létrehozás időpontja
}
```

**Indexek:**
- className + dueDate (összetett)
- teacherId (egyszerű)

**5. homework-submissions - Házi feladat beadások**

Diákok által beadott házi feladatok.

```typescript
{
  homeworkId: string,       // Házi feladat ID (homework.id)
  studentId: string,        // Diák ID
  studentName: string,      // Diák neve
  content: string,          // Beadott tartalom
  attachments: string[],    // Mellékletek
  submittedAt: string,      // Beadás időpontja
  evaluated: boolean,       // Értékelve van-e
  grade?: string            // Értékelés ("Megcsinálva", "Hiányos")
}
```

**Indexek:**
- homeworkId + studentId (összetett, egyedi)

**6. attendance - Mulasztások**

Óránkénti jelenléti ívek.

```typescript
{
  lessonId: string,         // Óra azonosító
  teacherId: string,        // Tanár ID
  date: string,             // Dátum (YYYY-MM-DD)
  startTime: string,        // Óra kezdete
  subject: string,          // Tantárgy
  className: string,        // Osztály
  topic: string,            // Óra témája
  students: [{              // Diákok jelenléte
    studentId: string,
    studentName: string,
    present: boolean,       // Jelen volt-e
    excused: boolean        // Igazolt-e
  }],
  createdAt: string         // Rögzítés időpontja
}
```

**Indexek:**
- teacherId + date (összetett)
- lessonId + date (összetett, egyedi)

**7. excuses - Igazolások**

Diákok által beküldött igazolási kérelmek.

```typescript
{
  studentId: string,        // Diák ID
  studentName: string,      // Diák neve
  studentClass: string,     // Diák osztálya
  absenceIds: string[],     // Igazolandó mulasztások ID-i
  excuseType: string,       // Igazolás típusa
  description: string,      // Indoklás
  status: string,           // 'pending' | 'approved' | 'rejected'
  submittedAt: string,      // Beküldés időpontja
  submittedBy: string,      // Beküldő neve
  reviewedBy?: string,      // Elbíráló neve
  reviewedAt?: string       // Elbírálás időpontja
}
```

**Indexek:**
- studentId + status (összetett)
- studentClass + status (összetett)

**8. chat - Üzenőfal**

Iskolai üzenőfal üzenetei.

```typescript
{
  message: string,          // Üzenet szövege
  userId: string,           // Küldő ID
  userName: string,         // Küldő neve
  createdAt: string         // Küldés időpontja
}
```

**Indexek:**
- createdAt (csökkenő sorrend)

**9. music - Suli Rádió**

Zene kérések a suli rádióhoz.

```typescript
{
  url: string,              // Zene URL
  platform: string,         // Platform ('spotify', 'youtube')
  title?: string,           // Zene címe
  thumbnail?: string,       // Borítókép URL
  userId: string,           // Kérő ID
  userName: string,         // Kérő neve
  userClass: string,        // Kérő osztálya
  createdAt: string         // Kérés időpontja
}
```

**Indexek:**
- createdAt (csökkenő sorrend)

#### 3.4.2. Adatbázis kapcsolatok

**Egy-sok kapcsolatok:**
- users → lessons (egy felhasználónak több órája van)
- users → grades (egy diáknak több jegye van)
- users → homework (egy tanár több házi feladatot ad ki)
- homework → homework-submissions (egy házi feladathoz több beadás tartozik)
- users → attendance (egy tanár több jelenléti ívet rögzít)

**Sok-sok kapcsolatok:**
- users ↔ lessons (tanárok több osztályban tanítanak, diákok több tanártól tanulnak)

### 3.5. Adatbázismodell-diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK  uid: string                                                 │
│     email: string (UNIQUE)                                      │
│     fullName: string                                            │
│     role: enum                                                  │
│     class?: string                                              │
│     subject?: string                                            │
│     studentId?: string                                          │
│     createdAt: timestamp                                        │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ 1:N                │ 1:N                │ 1:N
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│     LESSONS      │  │      GRADES      │  │    HOMEWORK      │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ PK  id           │  │ PK  id           │  │ PK  id           │
│ FK  userId       │  │     studentName  │  │ FK  teacherId    │
│     day          │  │     studentClass │  │     title        │
│     startTime    │  │     subject      │  │     description  │
│     subject      │  │     grade        │  │     dueDate      │
│     teacherName  │  │     title        │  │     className    │
│     className    │  │     teacherName  │  │     lessonId     │
│     room         │  │     date         │  │     createdAt    │
│     createdAt    │  │     createdAt    │  └──────────────────┘
└──────────────────┘  └──────────────────┘           │
                                                      │ 1:N
                                                      ▼
                                          ┌──────────────────────┐
                                          │ HOMEWORK-SUBMISSIONS │
                                          ├──────────────────────┤
                                          │ PK  id               │
                                          │ FK  homeworkId       │
                                          │ FK  studentId        │
                                          │     studentName      │
                                          │     content          │
                                          │     submittedAt      │
                                          │     evaluated        │
                                          │     grade            │
                                          └──────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   ATTENDANCE     │  │     EXCUSES      │  │      CHAT        │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ PK  id           │  │ PK  id           │  │ PK  id           │
│     lessonId     │  │ FK  studentId    │  │ FK  userId       │
│ FK  teacherId    │  │     studentName  │  │     userName     │
│     date         │  │     absenceIds[] │  │     message      │
│     startTime    │  │     excuseType   │  │     createdAt    │
│     subject      │  │     description  │  └──────────────────┘
│     className    │  │     status       │
│     topic        │  │     submittedAt  │  ┌──────────────────┐
│     students[]   │  │     reviewedBy   │  │      MUSIC       │
│     createdAt    │  │     reviewedAt   │  ├──────────────────┤
└──────────────────┘  └──────────────────┘  │ PK  id           │
                                             │ FK  userId       │
                                             │     url          │
                                             │     platform     │
                                             │     title        │
                                             │     userName     │
                                             │     userClass    │
                                             │     createdAt    │
                                             └──────────────────┘
```

### 3.6. Biztonsági kérdések

#### 3.6.1. Autentikáció

**Firebase Authentication:**
- Email/jelszó alapú bejelentkezés
- Minimum 6 karakteres jelszó követelmény
- Jelszó hash-elés bcrypt algoritmussal
- Session token 1 órás élettartammal
- Automatikus token refresh

**Implementáció:**
```typescript
// AuthContext.tsx
const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const token = await userCredential.user.getIdToken()
  // Token tárolása és használata API hívásokhoz
}
```

#### 3.6.2. Autorizáció

**Szerepkör-alapú hozzáférés-vezérlés (RBAC):**

| Szerepkör | Jogosultságok |
|-----------|---------------|
| Admin | Teljes hozzáférés, felhasználókezelés, rendszerbeállítások |
| Tanár | Saját órák, jegyadás, mulasztások, házi feladatok |
| Osztályfőnök | Tanári jogok + osztály igazolásai |
| Diák | Saját adatok megtekintése, házi beadás, igazolás kérés |
| DJ | Diák jogok + zene kérések moderálása |

**API Middleware:**
```typescript
// auth-middleware.ts
export async function verifyAuth(req: NextRequest) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token) throw new Error('Unauthorized')
  
  const decodedToken = await admin.auth().verifyIdToken(token)
  return decodedToken
}
```

#### 3.6.3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Felhasználók csak saját adataikat olvashatják
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Órarend csak saját userId-vel olvasható
    match /lessons/{lessonId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }
    
    // Jegyek: diákok csak sajátjukat, tanárok és adminok mindent
    match /grades/{gradeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }
  }
}
```

#### 3.6.4. Input validáció

**Kliens oldali validáció:**
- Email formátum ellenőrzés
- Jelszó erősség ellenőrzés
- Kötelező mezők kitöltése
- Dátum formátum validáció

**Szerver oldali validáció:**
```typescript
// API route példa
export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // Validáció
  if (!body.title || body.title.length < 3) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  }
  
  if (!body.grade || body.grade < 1 || body.grade > 5) {
    return NextResponse.json({ error: 'Invalid grade' }, { status: 400 })
  }
  
  // Folytatás...
}
```

#### 3.6.5. XSS és CSRF védelem

**XSS (Cross-Site Scripting) védelem:**
- React automatikus escape-elés
- DOMPurify használata HTML tartalomnál
- Content Security Policy (CSP) headerek

**CSRF (Cross-Site Request Forgery) védelem:**
- SameSite cookie attribútum
- Token-alapú autentikáció
- Origin header ellenőrzés

#### 3.6.6. HTTPS és adattitkosítás

**Átvitel közbeni titkosítás:**
- Kötelező HTTPS minden kommunikációhoz
- TLS 1.3 protokoll
- Vercel automatikus SSL tanúsítvány

**Nyugalmi állapotban:**
- Firebase automatikus adattitkosítás
- Környezeti változók titkosított tárolása
- Jelszavak hash-elése

#### 3.6.7. Rate limiting

**API védelem:**
- Firebase App Check
- Vercel rate limiting
- IP-alapú throttling

