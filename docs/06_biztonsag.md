# 3.3 BIZTONSÁGI KÉRDÉSEK

## 3.3.1 Autentikáció és Autorizáció

### Firebase Authentication
A rendszer a Firebase Authentication szolgáltatást használja, amely iparági szabványnak megfelelő biztonsági megoldásokat kínál:

- **Email/jelszó alapú bejelentkezés**: Biztonságos jelszótárolás bcrypt hash-eléssel
- **Session kezelés**: JWT tokenek használata
- **Token lejárat**: Automatikus kijelentkezés inaktivitás esetén
- **Jelszó követelmények**: Minimum 6 karakter hosszúság

### Szerepkör alapú hozzáférés (RBAC)

```typescript
Szerepkörök hierarchiája:
Admin > Osztályfőnök > Tanár > DJ/Diák

Jogosultságok:
- Admin: Teljes hozzáférés
- Osztályfőnök: Saját osztály kezelése + tanári jogok
- Tanár: Jegyek, mulasztások, házi feladatok kezelése
- DJ: Diák jogok + zene kérések kezelése (törlés)
- Diák: Csak saját adatok megtekintése
```

## 3.3.2 Adatvédelem (GDPR)

### Személyes adatok kezelése
- **Adatminimalizálás**: Csak szükséges adatok tárolása
- **Célhoz kötöttség**: Adatok csak meghatározott célra használhatók
- **Tárolási időkorlát**: Adatok törlése a szükséges időszak után
- **Hozzáférési jog**: Felhasználók megtekinthetik saját adataikat
- **Törléshez való jog**: Felhasználók kérhetik adataik törlését

### Tárolt személyes adatok
- Név
- Email cím
- Oktatási azonosító
- Osztály
- Jegyek
- Mulasztások
- Profilkép (opcionális)

### Cookie kezelés
- **Cookie consent**: Felhasználói beleegyezés kérése
- **Essential cookies**: Csak működéshez szükséges sütik
- **Analytics**: Opcionális, felhasználói beleegyezéssel

## 3.3.3 Adatbiztonság

### Titkosítás
- **HTTPS**: Minden kommunikáció titkosítva (TLS 1.3)
- **Jelszavak**: Bcrypt hash (salt + 10 rounds)
- **Adatbázis**: Firebase automatikus titkosítás rest-ben és transit-ben

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Felhasználók csak saját adataikat láthatják
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Jegyek: diák látja sajátját, tanár írhat
    match /grades/{gradeId} {
      allow read: if request.auth != null && (
        resource.data.studentId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['teacher', 'admin']
      );
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['teacher', 'admin'];
    }
    
    // Admin funkciók
    match /users/{userId} {
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 3.3.4 Sebezhetőségek elleni védelem

### XSS (Cross-Site Scripting) védelem
- React automatikus escape-elés
- DOMPurify használata HTML tartalomnál
- Content Security Policy (CSP) header

### CSRF (Cross-Site Request Forgery) védelem
- SameSite cookie attribútum
- CSRF token használata form-oknál
- Origin header ellenőrzés

### SQL Injection védelem
- NoSQL adatbázis (Firestore)
- Paraméteres lekérdezések
- Input validáció

### Rate Limiting
```typescript
// API védelem túlterhelés ellen
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 perc
  max: 100 // max 100 kérés
}
```

## 3.3.5 Biztonsági mentések

### Automatikus mentések
- **Firestore**: Automatikus replikáció több régióban
- **Daily backup**: Napi teljes mentés
- **Point-in-time recovery**: 7 napos visszaállítási lehetőség

### Disaster Recovery
- **RTO (Recovery Time Objective)**: 4 óra
- **RPO (Recovery Point Objective)**: 24 óra
- **Backup tesztelés**: Havi rendszerességgel

## 3.3.6 Audit log

### Naplózott események
- Bejelentkezések (sikeres/sikertelen)
- Jegy módosítások
- Felhasználó létrehozás/törlés
- Órarend változások
- Igazolások elfogadása/elutasítása

### Log tárolás
- Firebase Firestore collection
- 90 napos megőrzés
- Admin hozzáférés az audit loghoz

## 3.3.7 Biztonsági tesztelés

### Penetration testing
- OWASP Top 10 ellenőrzés
- Automatizált sebezhetőség szkennelés
- Manual security review

### Security headers
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```
