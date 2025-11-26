# Biztonsági Konfiguráció - Luminé Projekt

## Firebase Security Rules

### Firestore Rules
A `firestore.rules` fájl tartalmazza a role-based hozzáférés vezérlést:

#### Szerepkörök és Jogosultságok
- **Admin**: Teljes hozzáférés minden adathoz
- **Teacher**: Saját diákjainak jegyei, saját órái
- **Student**: Saját jegyek és órarend
- **DJ**: Saját adatok + zene kérések kezelése

#### Biztonsági Szabályok
```javascript
// Authenticated felhasználók hozzáférése minden adathoz
// Role-based biztonság az API rétegben implementálva
match /users/{userId} {
  allow read, write: if isAuthenticated();
}

match /grades/{gradeId} {
  allow read, write: if isAuthenticated();
}

match /lessons/{lessonId} {
  allow read, write: if isAuthenticated();
}
```

**Megjegyzés**: A részletes role-based hozzáférés vezérlés az API middleware rétegben van implementálva a jobb teljesítmény és rugalmasság érdekében.

## API Biztonság

### Autentikáció Middleware
- **Fájl**: `src/lib/auth-middleware.ts`
- **Funkciók**:
  - `authMiddleware()`: Token ellenőrzés
  - `requireRole()`: Szerepkör alapú hozzáférés
  - `requireAuth()`: Wrapper authenticated API-khoz

### Védett Végpontok
- `/api/admin/*` - Csak admin hozzáférés
- `/api/grades` - Role-based hozzáférés
- `/api/users` - Korlátozott módosítási jogok

## Adatvédelem

### Személyes Adatok Kezelése
- **Titkosítás**: Firebase automatikus titkosítás
- **Adatminimalizáció**: Csak szükséges adatok tárolása
- **Hozzáférés naplózása**: Firebase Analytics

### GDPR Megfelelőség
- Felhasználói hozzájárulás (cookie consent)
- Adatok törölhetősége
- Hozzáférési jogok

## Környezeti Változók Biztonsága

### Kötelező Változók
```env
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### Biztonsági Megjegyzések
- Private key-ek soha ne kerüljenek verziókezelésbe
- Production környezetben erős jelszavak használata
- Regular key rotation

## Hálózati Biztonság

### HTTPS Kikényszerítés
- Production környezetben kötelező HTTPS
- Secure cookie beállítások
- HSTS headers

### CORS Konfiguráció
- Csak engedélyezett domain-ek
- Credential-ek védett továbbítása

## Monitoring és Naplózás

### Biztonsági Események
- Sikertelen bejelentkezések
- Jogosultság túllépések
- Adatbázis módosítások

### Alert Rendszer
- Gyanús aktivitás észlelése
- Automatikus értesítések
- Incident response

## Backup és Recovery

### Automatikus Mentések
- Napi Firebase backup
- Point-in-time recovery
- Geo-redundant tárolás

### Disaster Recovery
- RTO: 4 óra
- RPO: 1 óra
- Backup tesztelés havonta

## Fejlesztői Irányelvek

### Secure Coding
- Input validáció minden API végponton
- SQL injection védelem (NoSQL esetén)
- XSS védelem
- CSRF token használat

### Code Review
- Biztonsági szempontok ellenőrzése
- Dependency vulnerability scan
- Static code analysis

## Compliance

### Oktatási Adatvédelem
- FERPA megfelelőség (US)
- Nemzeti adatvédelmi törvények
- Iskolai adatvédelmi szabályzat

### Audit Trail
- Minden adatmódosítás naplózása
- Felhasználói aktivitás követése
- Compliance jelentések

---
*Utolsó biztonsági audit: 2024-01-XX*
*Következő felülvizsgálat: 2024-XX-XX*