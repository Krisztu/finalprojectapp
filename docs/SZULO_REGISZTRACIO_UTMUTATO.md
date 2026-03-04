# Szülő Regisztráció Hozzáadása a Dashboard-hoz

## 1. State hozzáadása (dashboard/page.tsx)

A többi form state mellé add hozzá:
```typescript
const [parentForm, setParentForm] = useState({ email: '', password: '', fullName: '', phone: '', address: '' })
```

## 2. Szülő Regisztrációs Kártya (admin-users TabsContent-ben)

A Tanár és Diák regisztrációs kártyák mellé add hozzá harmadikként:

```tsx
<Card className="border-none shadow-sm">
  <CardHeader className="p-3 sm:p-6">
    <CardTitle className="text-sm sm:text-lg">Szülő regisztráció</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={parentForm.email}
          onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          placeholder="szulo@lumine.edu.hu"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Jelszó</label>
        <input
          type="password"
          value={parentForm.password}
          onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          placeholder="min. 6 karakter"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Teljes név</label>
      <input
        type="text"
        value={parentForm.fullName}
        onChange={(e) => setParentForm({ ...parentForm, fullName: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
        placeholder="Szülő Név"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Telefonszám</label>
        <input
          type="tel"
          value={parentForm.phone}
          onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          placeholder="+36 30 123 4567"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Cím (opcionális)</label>
        <input
          type="text"
          value={parentForm.address}
          onChange={(e) => setParentForm({ ...parentForm, address: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          placeholder="Budapest, ..."
        />
      </div>
    </div>
    <Button
      onClick={async () => {
        if (parentForm.email && parentForm.password && parentForm.fullName) {
          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: parentForm.email,
                password: parentForm.password,
                fullName: parentForm.fullName,
                role: 'parent',
                phone: parentForm.phone,
                address: parentForm.address
              })
            })

            if (response.ok) {
              showAlert(`Szülő regisztrálva: ${parentForm.fullName}`, 'success')
              setParentForm({ email: '', password: '', fullName: '', phone: '', address: '' })
              loadAllUsers()
            } else {
              const error = await response.json()
              showAlert(`Hiba: ${error.error || 'Ismeretlen hiba'}`, 'error')
            }
          } catch (error) {
            showAlert('Hiba történt', 'error')
          }
        } else {
          showAlert('Töltsd ki az összes kötelező mezőt!', 'warning')
        }
      }}
      className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
      size="sm"
    >
      <Users className="h-4 w-4" />
      Szülő regisztrálása
    </Button>
  </CardContent>
</Card>
```

## 3. Grid módosítás

Változtasd meg a grid-et 3 oszloposra:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
  {/* Tanár kártya */}
  {/* Diák kártya */}
  {/* Szülő kártya - ÚJ */}
</div>
```

## 4. Role filter frissítése

A Felhasználók kezelése részben add hozzá a parent opciót:
```tsx
<option value="parent">Szülő</option>
```

## 5. Role megjelenítés frissítése

A felhasználók listájában add hozzá:
```tsx
user.role === 'parent' ? 'bg-pink-100 text-pink-800' :
// ...
user.role === 'parent' ? 'Szülő' :
```

## 6. Alapértelmezett Igazgató létrehozása Firebase Console-ban

1. Menj a Firebase Console-ba: https://console.firebase.google.com
2. Válaszd ki a projektet (gsziapp)
3. Authentication > Users > Add user
   - Email: igazgato@lumine.edu.hu
   - Password: igazgato123
4. Firestore Database > users collection > Add document
   - Document ID: [az előbb létrehozott user UID-je]
   - Fields:
     - uid: [user UID]
     - email: "igazgato@lumine.edu.hu"
     - fullName: "Kovács István"
     - role: "principal"
     - createdAt: [current timestamp]
5. Authentication > Users > [az igazgató user] > Custom claims
   - Add: {"role": "principal", "name": "Kovács István"}
