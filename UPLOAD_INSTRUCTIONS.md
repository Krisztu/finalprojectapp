# GitHub Feltöltési Útmutató

A projekt feltöltéséhez a GitHub repository-ra kövesse az alábbi lépéseket:

## Előfeltételek
1. Telepítse a Git-et a gépére: https://git-scm.com/download/windows
2. Hozzon létre egy GitHub fiókot, ha még nincs: https://github.com
3. Győződjön meg róla, hogy a repository létezik: https://github.com/Krisztu/finalprojectapp.git

## Feltöltési lépések

1. Nyisson meg egy Command Prompt-ot vagy PowerShell-t a projekt mappájában (d:\finalproject)

2. Futtassa az alábbi parancsokat sorban:

```bash
# Git repository inicializálása
git init

# Minden fájl hozzáadása
git add .

# Első commit létrehozása
git commit -m "Initial commit - GSZI APP"

# Remote repository hozzáadása
git remote add origin https://github.com/Krisztu/finalprojectapp.git

# Main branch beállítása
git branch -M main

# Feltöltés GitHub-ra
git push -u origin main
```

## Alternatív módszer (ha a fenti nem működik)

Ha a repository már létezik és van benne tartalom:

```bash
git init
git add .
git commit -m "Initial commit - GSZI APP"
git remote add origin https://github.com/Krisztu/finalprojectapp.git
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Fontos megjegyzések

- A `.env.local` fájl tartalmazza a Firebase kulcsokat, ezek érzékeny adatok
- A `.gitignore` fájl már be van állítva, hogy kizárja a szükségtelen fájlokat
- Ha hibát kap, ellenőrizze, hogy van-e írási jogosultsága a repository-hoz

## Projekt struktúra

```
finalproject/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   └── ...
│   ├── components/
│   ├── contexts/
│   └── lib/
├── public/
├── .env.local
├── package.json
└── ...
```

A projekt feltöltése után elérhető lesz a GitHub-on: https://github.com/Krisztu/finalprojectapp