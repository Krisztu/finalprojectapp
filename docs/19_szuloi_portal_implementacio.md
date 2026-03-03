# 👨‍👩‍👧 Szülői Portál Implementációs Útmutató

## 📋 Tartalomjegyzék
1. [Adatbázis Séma](#adatbázis-séma)
2. [API Végpontok](#api-végpontok)
3. [Frontend Komponensek](#frontend-komponensek)
4. [Autentikáció](#autentikáció)
5. [Implementációs Lépések](#implementációs-lépések)

---

## 🗄️ Adatbázis Séma

### 1. Parent-Child Relationship
```typescript
// Firestore: /parent_children/{parentId}/children/{childId}
interface ParentChild {
  parentId: string
  childId: string
  childName: string
  childClass: string
  relationship: 'mother' | 'father' | 'guardian' | 'other'
  addedAt: Date
  permissions: {
    viewGrades: boolean
    viewAttendance: boolean
    viewHomework: boolean
    viewMessages: boolean
    viewBehavior: boolean
  }
}

// Firestore: /users/{userId}
// Kiterjesztés szülőkre:
interface ParentUser extends User {
  role: 'parent'
  children: string[] // childId-k
  phone?: string
  address?: string
  emergencyContact?: string
}
```

### 2. Parent Notifications
```typescript
// Firestore: /parent_notifications/{notificationId}
interface ParentNotification {
  id: string
  parentId: string
  childId: string
  type: 'grade' | 'absence' | 'homework' | 'message' | 'behavior' | 'event'
  title: string
  message: string
  data: {
    gradeId?: string
    absenceId?: string
    homeworkId?: string
    messageId?: string
    behaviorId?: string
  }
  read: boolean
  readAt?: Date
  createdAt: Date
  actionUrl?: string
}
```

### 3. Parent Messages
```typescript
// Firestore: /parent_messages/{messageId}
interface ParentMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: 'teacher' | 'parent'
  recipientId: string
  recipientName: string
  subject: string
  content: string
  attachments?: {
    name: string
    url: string
    type: string
  }[]
  read: boolean
  readAt?: Date
  createdAt: Date
  updatedAt?: Date
  conversationId: string // Üzenetlánc azonosítása
}
```

---

## 🔌 API Végpontok

### 1. Parent Authentication
```typescript
// POST /api/auth/parent-register
interface ParentRegisterRequest {
  email: string
  password: string
  fullName: string
  phone: string
  address: string
}

// POST /api/auth/parent-login
interface ParentLoginRequest {
  email: string
  password: string
}

// POST /api/auth/link-child
interface LinkChildRequest {
  parentId: string
  childEmail: string
  relationship: 'mother' | 'father' | 'guardian' | 'other'
  verificationCode: string // Diák által kapott kód
}
```

### 2. Parent Dashboard Data
```typescript
// GET /api/parent/dashboard
interface ParentDashboardResponse {
  children: {
    id: string
    name: string
    class: string
    recentGrades: Grade[]
    recentAbsences: Attendance[]
    pendingHomework: Homework[]
    averageGrade: number
    absenceCount: number
  }[]
  notifications: ParentNotification[]
  unreadMessages: number
}

// GET /api/parent/child/:childId/overview
interface ChildOverviewResponse {
  child: {
    id: string
    name: string
    class: string
    email: string
  }
  stats: {
    averageGrade: number
    totalAbsences: number
    excusedAbsences: number
    pendingHomework: number
    completedHomework: number
  }
  recentGrades: Grade[]
  recentAbsences: Attendance[]
  recentMessages: ParentMessage[]
}
```

### 3. Parent Grades
```typescript
// GET /api/parent/child/:childId/grades
interface ParentGradesResponse {
  grades: Grade[]
  statistics: {
    average: number
    bySubject: {
      subject: string
      average: number
      count: number
    }[]
    trend: {
      date: Date
      average: number
    }[]
  }
}

// GET /api/parent/child/:childId/grades/trend
interface GradeTrendResponse {
  trend: {
    date: Date
    average: number
    subject: string
  }[]
  comparison: {
    childAverage: number
    classAverage: number
    difference: number
  }
}
```

### 4. Parent Attendance
```typescript
// GET /api/parent/child/:childId/attendance
interface ParentAttendanceResponse {
  attendance: {
    date: Date
    subject: string
    present: boolean
    excused: boolean
    reason?: string
  }[]
  statistics: {
    total: number
    present: number
    absent: number
    excused: number
    percentage: number
  }
}

// GET /api/parent/child/:childId/attendance/summary
interface AttendanceSummaryResponse {
  summary: {
    month: string
    total: number
    absent: number
    excused: number
    percentage: number
  }[]
}
```

### 5. Parent Homework
```typescript
// GET /api/parent/child/:childId/homework
interface ParentHomeworkResponse {
  homework: {
    id: string
    title: string
    subject: string
    dueDate: Date
    description: string
    submitted: boolean
    submittedAt?: Date
    grade?: number
    feedback?: string
  }[]
  statistics: {
    total: number
    submitted: number
    pending: number
    overdue: number
  }
}
```

### 6. Parent Messages
```typescript
// GET /api/parent/messages
interface ParentMessagesResponse {
  conversations: {
    id: string
    participantName: string
    participantRole: 'teacher' | 'parent'
    lastMessage: string
    lastMessageAt: Date
    unreadCount: number
  }[]
}

// GET /api/parent/messages/:conversationId
interface ConversationResponse {
  messages: ParentMessage[]
  participant: {
    id: string
    name: string
    role: 'teacher' | 'parent'
    email: string
  }
}

// POST /api/parent/messages
interface SendMessageRequest {
  recipientId: string
  subject: string
  content: string
  attachments?: File[]
}

// PUT /api/parent/messages/:messageId/read
interface MarkAsReadRequest {
  messageId: string
}
```

### 7. Parent Notifications
```typescript
// GET /api/parent/notifications
interface ParentNotificationsResponse {
  notifications: ParentNotification[]
  unreadCount: number
}

// PUT /api/parent/notifications/:notificationId/read
interface MarkNotificationAsReadRequest {
  notificationId: string
}

// PUT /api/parent/notifications/read-all
interface MarkAllNotificationsAsReadRequest {
  childId?: string
}

// DELETE /api/parent/notifications/:notificationId
interface DeleteNotificationRequest {
  notificationId: string
}
```

### 8. Parent Settings
```typescript
// GET /api/parent/settings
interface ParentSettingsResponse {
  notifications: {
    emailOnGrade: boolean
    emailOnAbsence: boolean
    emailOnHomework: boolean
    emailOnMessage: boolean
    emailOnBehavior: boolean
    pushNotifications: boolean
  }
  privacy: {
    shareGradesWithChild: boolean
    shareAbsencesWithChild: boolean
  }
}

// PUT /api/parent/settings
interface UpdateParentSettingsRequest {
  notifications?: {
    emailOnGrade?: boolean
    emailOnAbsence?: boolean
    emailOnHomework?: boolean
    emailOnMessage?: boolean
    emailOnBehavior?: boolean
    pushNotifications?: boolean
  }
  privacy?: {
    shareGradesWithChild?: boolean
    shareAbsencesWithChild?: boolean
  }
}
```

---

## 🎨 Frontend Komponensek

### 1. Parent Layout
```typescript
// src/app/parent/layout.tsx
export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ParentHeader />
      <div className="flex">
        <ParentSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 2. Parent Dashboard
```typescript
// src/app/parent/dashboard/page.tsx
export default function ParentDashboard() {
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/parent/dashboard')
      const data = await response.json()
      setChildren(data.children)
      if (data.children.length > 0) {
        setSelectedChild(data.children[0].id)
      }
    } catch (error) {
      console.error('Dashboard betöltés sikertelen:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Gyermek választó */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {children.map(child => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedChild === child.id
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {child.name} ({child.class})
          </button>
        ))}
      </div>

      {/* Gyermek áttekintés */}
      {selectedChild && (
        <ChildOverviewCards childId={selectedChild} />
      )}

      {/* Legutóbbi jegyek */}
      <RecentGradesCard childId={selectedChild} />

      {/* Mulasztások */}
      <AttendanceCard childId={selectedChild} />

      {/* Házi feladatok */}
      <HomeworkCard childId={selectedChild} />
    </div>
  )
}
```

### 3. Child Overview Cards
```typescript
// src/components/parent/ChildOverviewCards.tsx
export function ChildOverviewCards({ childId }: { childId: string }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadStats()
  }, [childId])

  const loadStats = async () => {
    const response = await fetch(`/api/parent/child/${childId}/overview`)
    const data = await response.json()
    setStats(data.stats)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Átlag */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Átlag</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.averageGrade.toFixed(2)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Mulasztások */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mulasztások</p>
              <p className="text-3xl font-bold text-red-600">{stats?.totalAbsences}</p>
              <p className="text-xs text-gray-500">({stats?.excusedAbsences} igazolt)</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Házi feladatok */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Házi feladatok</p>
              <p className="text-3xl font-bold text-green-600">{stats?.completedHomework}</p>
              <p className="text-xs text-gray-500">({stats?.pendingHomework} függőben)</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Viselkedés */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Viselkedés</p>
              <p className="text-3xl font-bold text-purple-600">4.5/5</p>
              <p className="text-xs text-gray-500">Jó</p>
            </div>
            <Smile className="h-8 w-8 text-purple-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 4. Grades Chart
```typescript
// src/components/parent/GradesChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function GradesChart({ childId }: { childId: string }) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    loadTrendData()
  }, [childId])

  const loadTrendData = async () => {
    const response = await fetch(`/api/parent/child/${childId}/grades/trend`)
    const result = await response.json()
    setData(result.trend)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jegyek Trendje</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="average" stroke="#3b82f6" name="Átlag" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### 5. Messages Component
```typescript
// src/components/parent/Messages.tsx
export function ParentMessages() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    const response = await fetch('/api/parent/messages')
    const data = await response.json()
    setConversations(data.conversations)
  }

  const loadMessages = async (conversationId: string) => {
    const response = await fetch(`/api/parent/messages/${conversationId}`)
    const data = await response.json()
    setMessages(data.messages)
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await fetch('/api/parent/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: conversations.find(c => c.id === selectedConversation)?.participantId,
          subject: 'Válasz',
          content: newMessage
        })
      })

      if (response.ok) {
        setNewMessage('')
        loadMessages(selectedConversation)
      }
    } catch (error) {
      console.error('Üzenet küldés sikertelen:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Beszélgetések listája */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Beszélgetések</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedConversation === conv.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <p className="font-medium">{conv.participantName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {conv.lastMessage}
                </p>
                {conv.unreadCount > 0 && (
                  <Badge className="mt-1">{conv.unreadCount}</Badge>
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Üzenetlánc */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Üzenetek</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-3 mb-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.senderId === 'currentUserId'
                      ? 'bg-blue-100 dark:bg-blue-900 ml-8'
                      : 'bg-gray-100 dark:bg-gray-800 mr-8'
                  }`}
                >
                  <p className="font-medium text-sm">{msg.senderName}</p>
                  <p className="text-sm mt-1">{msg.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleString('hu-HU')}
                  </p>
                </div>
              ))}
            </div>

            {/* Üzenet küldés */}
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Írj üzenetet..."
                rows={2}
              />
              <Button onClick={sendMessage} className="self-end">
                Küldés
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 🔐 Autentikáció

### 1. Parent Registration
```typescript
// src/app/parent/register/page.tsx
export default function ParentRegister() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/parent-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/parent/link-child')
      } else {
        const error = await response.json()
        alert(`Hiba: ${error.error}`)
      }
    } catch (error) {
      alert('Regisztráció sikertelen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Szülői Regisztráció</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Teljes név</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Jelszó</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Telefonszám</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Cím</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Regisztrálás...' : 'Regisztrálás'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2. Link Child
```typescript
// src/app/parent/link-child/page.tsx
export default function LinkChild() {
  const [childEmail, setChildEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/link-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childEmail,
          verificationCode
        })
      })

      if (response.ok) {
        router.push('/parent/dashboard')
      } else {
        alert('Gyermek összekapcsolása sikertelen')
      }
    } catch (error) {
      alert('Hiba történt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Gyermek Összekapcsolása</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Kérj egy ellenőrzési kódot a gyermekeddel, majd add meg itt.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLink} className="space-y-4">
            <div>
              <Label>Gyermek email</Label>
              <Input
                type="email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Ellenőrzési kód</Label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="6 számjegy"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Összekapcsolás...' : 'Összekapcsolás'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🛠️ Implementációs Lépések

### 1. Fázis: Adatbázis & API (1 hét)
- [ ] Firestore kollekciók létrehozása
- [ ] Parent user model
- [ ] Parent-child relationship
- [ ] API végpontok implementálása
- [ ] Autentikáció

### 2. Fázis: Frontend (1 hét)
- [ ] Parent layout
- [ ] Dashboard
- [ ] Gyermek áttekintés
- [ ] Jegyek nézet
- [ ] Mulasztások nézet

### 3. Fázis: Üzenetküldés (3-4 nap)
- [ ] Üzenetküldés komponens
- [ ] Beszélgetések listája
- [ ] Üzenet olvasás/írás

### 4. Fázis: Értesítések (3-4 nap)
- [ ] Értesítési rendszer
- [ ] Email értesítések
- [ ] Push értesítések
- [ ] Értesítési beállítások

### 5. Fázis: Tesztelés & Optimalizálás (3-4 nap)
- [ ] Unit tesztek
- [ ] E2E tesztek
- [ ] Teljesítmény optimalizálása
- [ ] Biztonsági audit

---

## 📊 Tesztelési Checklist

- [ ] Szülő regisztráció működik
- [ ] Gyermek összekapcsolása működik
- [ ] Dashboard betöltődik
- [ ] Jegyek megjelennek
- [ ] Mulasztások megjelennek
- [ ] Üzenetek küldhetők
- [ ] Értesítések érkeznek
- [ ] Mobil nézet működik
- [ ] Dark mode működik
- [ ] Teljesítmény >90 Lighthouse

---

*Utolsó frissítés: 2024*
