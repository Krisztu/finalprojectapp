# 🚀 Gyors Referencia

## Alapvető Parancsok

```bash
npm run dev              # Dev szerver
npm run build            # Build
npm run start            # Production
npm run lint             # Linting
npm run test             # Unit tesztek
npm run test:e2e         # E2E tesztek
npm run test:all         # Összes teszt
npm run test:coverage    # Lefedettség
```

## Firebase Parancsok

```bash
firebase firestore:delete --all-collections
firebase firestore:indexes
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

## Git Workflow

```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: új funkció"
git push origin feature/new-feature
```

## Hasznos Snippetek

### Firebase Query
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const q = query(collection(db, 'users'), where('role', '==', 'student'))
const snapshot = await getDocs(q)
const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
```

### Cache Használat
```typescript
import { getCachedUsers, invalidateUsers } from '@/lib/dataCache'

const users = await getCachedUsers('student')
invalidateUsers()
```

### Custom Alert
```typescript
showAlert('Sikeres!', 'success')
showAlert('Hiba!', 'error')
showAlert('Figyelmeztetés!', 'warning')
showAlert('Információ', 'info')
```

## Tailwind Gyakori Osztályok

```css
flex items-center justify-between gap-4
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
p-4 px-6 py-2 m-4 mx-auto my-8
bg-white dark:bg-gray-800
text-gray-900 dark:text-white
rounded-lg shadow-md hover:shadow-lg
transition-all duration-300
```

## TypeScript Típusok

```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  class?: string
}

interface ComponentProps {
  title: string
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}
```

## Debug

```bash
F12                    # Chrome DevTools
npm run test:ui        # Vitest UI
npx playwright test --debug
```

## Gyakori Hibák

```bash
# Module not found
npm install

# Firebase not initialized
# Ellenőrizd a .env.local fájlt

# Type error
npx tsc --noEmit

# Port already in use
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Gyors Linkek

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Playwright Docs](https://playwright.dev)
- [NPM Registry](https://www.npmjs.com)

## Verzió Info

- Node.js: v18+
- NPM: v9+
- Next.js: 14.0.0
- React: 18
- TypeScript: 5
