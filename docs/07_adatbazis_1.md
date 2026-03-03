# 3.4 ADATBÁZIS LEÍRÁSA

## 3.4.1 Adatbázis típusa

A Luminé rendszer **Firebase Firestore** NoSQL dokumentum-orientált adatbázist használ. A Firestore előnyei:
- Valós idejű szinkronizáció
- Automatikus skálázás
- Offline támogatás
- Beépített biztonság
- Egyszerű lekérdezések

## 3.4.2 Adatbázis struktúra

### Users Collection

```typescript
users/{userId}
{
  id: string,              // Firebase Auth UID
  email: string,           // Email cím
  fullName: string,        // Teljes név
  role: string,            // 'student' | 'teacher' | 'homeroom_teacher' | 'admin' | 'dj'
  class?: string,          // Osztály (diákoknál és DJ-knél)
  studentId?: string,      // Oktatási azonosító (diákoknál)
  subject?: string,        // Tantárgy (tanároknál)
  classes?: string[],      // Osztályok (tanároknál)
  profileImage?: string,   // Profilkép URL
  createdAt: timestamp,    // Létrehozás dátuma
  updatedAt: timestamp     // Utolsó módosítás
}
```

**Megjegyzés**: A DJ szerepkör egy speciális diák szerepkör, amely az összes diák jogosultságot tartalmazza, plusz a zene kérések kezelését (törlés).

### Grades Collection

```typescript
grades/{gradeId}
{
  id: string,              // Egyedi azonosító
  studentId: string,       // Diák ID (users referencia)
  studentName: string,     // Diák neve
  studentClass: string,    // Osztály
  teacherId: string,       // Tanár ID
  teacherName: string,     // Tanár neve
  subject: string,         // Tantárgy
  grade: number,           // Jegy (1-5)
  title: string,           // Típus (Dolgozat, Felelet, stb.)
  description?: string,    // Megjegyzés
  date: timestamp,         // Jegy dátuma
  createdAt: timestamp     // Rögzítés időpontja
}
```

### Lessons Collection

```typescript
lessons/{lessonId}
{
  id: string,              // Egyedi azonosító
  day: string,             // Nap (Hétfő, Kedd, stb.)
  startTime: string,       // Kezdés ideje (8:45)
  subject: string,         // Tantárgy
  teacherId: string,       // Tanár ID
  teacherName: string,     // Tanár neve
  className: string,       // Osztály
  room: string,            // Terem
  userId: string,          // Tulajdonos ID
  createdAt: timestamp     // Létrehozás
}
```

### Attendance Collection

```typescript
attendance/{attendanceId}
{
  id: string,              // Egyedi azonosító
  lessonId: string,        // Óra azonosító
  teacherId: string,       // Tanár ID
  date: string,            // Dátum (YYYY-MM-DD)
  startTime: string,       // Óra kezdete
  subject: string,         // Tantárgy
  className: string,       // Osztály
  topic?: string,          // Óra témája
  students: [              // Diákok listája
    {
      studentId: string,
      studentName: string,
      present: boolean,    // Jelen volt-e
      excused: boolean     // Igazolt-e
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Absences Collection

```typescript
absences/{absenceId}
{
  id: string,              // Egyedi azonosító
  studentId: string,       // Diák ID
  studentName: string,     // Diák neve
  lessonId: string,        // Óra azonosító
  teacherId: string,       // Tanár ID
  date: string,            // Dátum
  startTime: string,       // Óra kezdete
  subject: string,         // Tantárgy
  className: string,       // Osztály
  topic?: string,          // Óra témája
  excused: boolean,        // Igazolt-e
  createdAt: timestamp
}
```

### Homework Collection

```typescript
homework/{homeworkId}
{
  id: string,              // Egyedi azonosító
  title: string,           // Cím
  description: string,     // Leírás
  teacherId: string,       // Tanár ID
  teacherName: string,     // Tanár neve
  subject: string,         // Tantárgy
  className: string,       // Osztály
  lessonId: string,        // Óra azonosító
  dueDate: string,         // Határidő (YYYY-MM-DD)
  attachments: string[],   // Mellékletek URL-jei
  createdAt: timestamp,
  submissionCount: number  // Beadások száma
}
```

### Homework Submissions Collection

```typescript
homework_submissions/{submissionId}
{
  id: string,              // Egyedi azonosító
  homeworkId: string,      // Házi feladat ID
  studentId: string,       // Diák ID
  studentName: string,     // Diák neve
  content: string,         // Beadott tartalom
  attachments: string[],   // Mellékletek
  status: string,          // 'pending' | 'completed' | 'incomplete'
  submittedAt: timestamp,  // Beadás időpontja
  grade?: number,          // Értékelés (opcionális)
  feedback?: string        // Visszajelzés (opcionális)
}
```
