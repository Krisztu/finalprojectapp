# Fejlesztési Útmutató

## 🚀 Gyors Kezdés

```bash
git clone <repo-url>
cd finalproject
npm install
cp .env.example .env.local
npm run dev
```

## 📋 Fejlesztési Workflow

### Branch Stratégia
```bash
main          # Production
develop       # Fejlesztés
feature/*     # Új funkciók
bugfix/*      # Hibajavítások
```

### Commit Üzenetek
```
feat: új funkció
fix: hibajavítás
docs: dokumentáció
style: formázás
refactor: refaktorálás
test: tesztek
chore: build, config
perf: teljesítmény
```

## 🧪 Tesztelés

```bash
npm run test              # Unit tesztek
npm run test:e2e          # E2E tesztek
npm run test:all          # Összes teszt
npm run test:coverage     # Lefedettség
```

## 🎨 Kód Stílus

### TypeScript
- Strict mode
- Interface-ek használata
- Type-safe kód

### React
- Functional components
- Named exports
- TypeScript props

### CSS
- Tailwind utility classes
- Dark mode support
- Responsive design

## 📁 Fájl Szervezés

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── types.ts
├── hooks.ts
└── utils.ts
```

## 🔧 Optimalizálási Checklist

- [ ] Lazy loading
- [ ] Image optimization
- [ ] Code splitting
- [ ] Memoization
- [ ] Cache használata
- [ ] Batch reads
- [ ] Pagination

## 🐛 Debug

```bash
F12                    # Chrome DevTools
npm run test:ui        # Vitest UI
npx playwright test --debug  # Playwright debug
```

## 📚 Hasznos Parancsok

```bash
npm run build          # Build
npm run start          # Production
npm run lint           # Linting
npx tsc --noEmit       # Type check
npm audit              # Dependency audit
```

## 🔒 Biztonsági Checklist

- [ ] Env variables
- [ ] Firebase rules
- [ ] Input validáció
- [ ] XSS védelem
- [ ] CSRF védelem
- [ ] Dependency audit

## 📖 További Források

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
