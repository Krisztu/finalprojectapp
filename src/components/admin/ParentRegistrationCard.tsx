import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Users } from 'lucide-react'

interface ParentRegistrationCardProps {
  parentForm: {
    email: string
    password: string
    fullName: string
    phone: string
    address: string
    childStudentId: string
    relationship: string
  }
  setParentForm: (form: any) => void
  onRegister: () => void
}

export function ParentRegistrationCard({ parentForm, setParentForm, onRegister }: ParentRegistrationCardProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg">Szülő regisztráció</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={parentForm.email}
              onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
              placeholder="szulo@lumine.edu.hu"
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jelszó</label>
            <Input
              type="password"
              value={parentForm.password}
              onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
              placeholder="min. 6 karakter"
              className="text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Teljes név</label>
          <Input
            type="text"
            value={parentForm.fullName}
            onChange={(e) => setParentForm({ ...parentForm, fullName: e.target.value })}
            placeholder="Szülő Név"
            className="text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Telefonszám</label>
            <Input
              type="tel"
              value={parentForm.phone}
              onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
              placeholder="+36 30 123 4567"
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cím</label>
            <Input
              type="text"
              value={parentForm.address}
              onChange={(e) => setParentForm({ ...parentForm, address: e.target.value })}
              placeholder="Budapest, Fő utca 1."
              className="text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gyermek OM azonosítója</label>
            <Input
              type="text"
              value={parentForm.childStudentId}
              onChange={(e) => setParentForm({ ...parentForm, childStudentId: e.target.value })}
              placeholder="11 számjegy"
              maxLength={11}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kapcsolat típusa</label>
            <select
              value={parentForm.relationship}
              onChange={(e) => setParentForm({ ...parentForm, relationship: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">Válassz...</option>
              <option value="anya">Anya</option>
              <option value="apa">Apa</option>
              <option value="gyam">Gyám</option>
              <option value="egyeb">Egyéb</option>
            </select>
          </div>
        </div>
        <Button
          onClick={onRegister}
          className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
          size="sm"
        >
          <Users className="h-4 w-4" />
          Szülő regisztrálása
        </Button>
      </CardContent>
    </Card>
  )
}
