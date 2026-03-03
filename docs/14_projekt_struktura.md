# Projekt Struktúra

```
finalproject/
├── .next/                      # Next.js build output
├── docs/                       # Dokumentáció
│   ├── 01-12_szakdolgozat.md  # 12 rész szakdolgozat
│   ├── 13_e2e_tesztek.md      # E2E tesztek
│   ├── 14_projekt_struktura.md
│   ├── 15_fejlesztesi_utmutato.md
│   ├── 16_gyors_referencia.md
│   ├── 17_changelog.md
│   ├── DATABASE_OPTIMIZATION.md
│   ├── DJ_SZEREPKOR.md
│   └── README.md
├── e2e/                       # End-to-end tesztek
├── public/                    # Statikus fájlok
├── src/                       # Forráskód
├── .env.example
├── .env.local
├── .gitignore
├── firestore.rules
├── next.config.js
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vitest.config.ts
```

## Főbb Könyvtárak

### `/src/app`
Next.js 14 App Router struktúra.

### `/src/lib`
Utility könyvtárak és Firebase integrációk.

### `/src/shared`
Megosztott komponensek és típusok.

### `/e2e`
Playwright end-to-end tesztek (42 teszt).

### `/docs`
Teljes szakdolgozat dokumentáció.
