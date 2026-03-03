# 🔔 Értesítési Rendszer Implementációs Útmutató

## 📋 Áttekintés

Az értesítési rendszer három csatornán működik:
1. **In-app értesítések** - Alkalmazáson belüli értesítések
2. **Email értesítések** - Email küldés
3. **Push értesítések** - Mobil push (Firebase Cloud Messaging)

---

## 🗄️ Adatbázis Séma

### Notifications Collection
```typescript
// Firestore: /notifications/{notificationId}
interface Notification {
  id: string
  userId: string
  type: 'grade' | 'absence' | 'homework' | 'message' | 'behavior' | 'event' | 'system'
  title: string
  message: string
  icon?: string
  color?: string
  
  // Adatok az értesítéshez
  data: {
    gradeId?: string
    absenceId?: string
    homeworkId?: string
    messageId?: string
    behaviorId?: string
    eventId?: string
  }
  
  // Csatornák
  channels: {
    inApp: boolean
    email: boolean
    push: boolean
  }
  
  // Státusz
  read: boolean
  readAt?: Date
  
  // Metaadatok
  createdAt: Date
  expiresAt?: Date // Automatikus törlés után
  actionUrl?: string
}
```

### User Notification Settings
```typescript
// Firestore: /users/{userId}/settings/notifications
interface NotificationSettings {
  userId: string
  
  // Email értesítések
  email: {
    onGrade: boolean
    onAbsence: boolean
    onHomework: boolean
    onMessage: boolean
    onBehavior: boolean
    onEvent: boolean
    digest: 'immediate' | 'daily' | 'weekly' | 'never'
  }
  
  // Push értesítések
  push: {
    onGrade: boolean
    onAbsence: boolean
    onHomework: boolean
    onMessage: boolean
    onBehavior: boolean
    onEvent: boolean
    enabled: boolean
  }
  
  // In-app értesítések
  inApp: {
    enabled: boolean
    sound: boolean
    badge: boolean
  }
  
  // Csendes órák
  quietHours: {
    enabled: boolean
    startTime: string // "22:00"
    endTime: string   // "08:00"
  }
  
  updatedAt: Date
}
```

### Notification Templates
```typescript
// Firestore: /notification_templates/{templateId}
interface NotificationTemplate {
  id: string
  type: 'grade' | 'absence' | 'homework' | 'message' | 'behavior' | 'event'
  
  // Sablonok
  templates: {
    title: string // pl. "Új jegy: {subject}"
    message: string // pl. "{studentName} új jegyet kapott: {grade}"
    icon: string
    color: string
  }
  
  // Csatornák
  channels: {
    inApp: boolean
    email: boolean
    push: boolean
  }
  
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔌 API Végpontok

### 1. Notification Management
```typescript
// GET /api/notifications
interface GetNotificationsRequest {
  limit?: number
  offset?: number
  read?: boolean
  type?: string
}

interface GetNotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

// PUT /api/notifications/:id/read
interface MarkAsReadRequest {
  notificationId: string
}

// PUT /api/notifications/read-all
interface MarkAllAsReadRequest {
  type?: string
}

// DELETE /api/notifications/:id
interface DeleteNotificationRequest {
  notificationId: string
}

// DELETE /api/notifications/delete-all
interface DeleteAllNotificationsRequest {
  type?: string
  olderThan?: Date
}
```

### 2. Notification Settings
```typescript
// GET /api/notifications/settings
interface GetSettingsResponse {
  settings: NotificationSettings
}

// PUT /api/notifications/settings
interface UpdateSettingsRequest {
  email?: {
    onGrade?: boolean
    onAbsence?: boolean
    onHomework?: boolean
    onMessage?: boolean
    onBehavior?: boolean
    onEvent?: boolean
    digest?: 'immediate' | 'daily' | 'weekly' | 'never'
  }
  push?: {
    onGrade?: boolean
    onAbsence?: boolean
    onHomework?: boolean
    onMessage?: boolean
    onBehavior?: boolean
    onEvent?: boolean
    enabled?: boolean
  }
  inApp?: {
    enabled?: boolean
    sound?: boolean
    badge?: boolean
  }
  quietHours?: {
    enabled?: boolean
    startTime?: string
    endTime?: string
  }
}
```

### 3. Push Notification Registration
```typescript
// POST /api/notifications/register-device
interface RegisterDeviceRequest {
  token: string // FCM token
  platform: 'web' | 'ios' | 'android'
  userAgent: string
}

// DELETE /api/notifications/unregister-device
interface UnregisterDeviceRequest {
  token: string
}
```

---

## 🛠️ Backend Implementáció

### 1. Notification Service
```typescript
// src/lib/notifications.ts
import { db } from '@/lib/firebase-admin'
import nodemailer from 'nodemailer'
import admin from 'firebase-admin'

export class NotificationService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  // In-app értesítés létrehozása
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ) {
    const notification = {
      userId,
      type,
      title,
      message,
      data: data || {},
      channels: {
        inApp: true,
        email: true,
        push: true
      },
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 nap
    }

    const docRef = await db.collection('notifications').add(notification)
    
    // Csatornák szerinti küldés
    const settings = await this.getUserSettings(userId)
    
    if (settings.inApp.enabled) {
      await this.sendInAppNotification(userId, notification)
    }
    
    if (settings.email[`on${type}`]) {
      await this.sendEmailNotification(userId, notification, settings)
    }
    
    if (settings.push.enabled && settings.push[`on${type}`]) {
      await this.sendPushNotification(userId, notification)
    }

    return docRef.id
  }

  // Email értesítés
  private async sendEmailNotification(
    userId: string,
    notification: any,
    settings: any
  ) {
    try {
      const user = await db.collection('users').doc(userId).get()
      const userData = user.data()

      // Csendes órák ellenőrzése
      if (this.isInQuietHours(settings)) {
        return
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userData.email,
        subject: `Luminé: ${notification.title}`,
        html: this.generateEmailTemplate(notification)
      }

      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Email küldés sikertelen:', error)
    }
  }

  // Push értesítés
  private async sendPushNotification(userId: string, notification: any) {
    try {
      const devicesSnapshot = await db
        .collection('users')
        .doc(userId)
        .collection('devices')
        .get()

      const tokens = devicesSnapshot.docs.map(doc => doc.data().token)

      if (tokens.length === 0) return

      const message = {
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          type: notification.type,
          notificationId: notification.id
        }
      }

      await admin.messaging().sendMulticast({
        tokens,
        ...message
      })
    } catch (error) {
      console.error('Push értesítés sikertelen:', error)
    }
  }

  // Felhasználó beállítások lekérése
  private async getUserSettings(userId: string) {
    const settingsDoc = await db
      .collection('users')
      .doc(userId)
      .collection('settings')
      .doc('notifications')
      .get()

    return settingsDoc.data() || this.getDefaultSettings()
  }

  // Csendes órák ellenőrzése
  private isInQuietHours(settings: any): boolean {
    if (!settings.quietHours.enabled) return false

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const start = settings.quietHours.startTime
    const end = settings.quietHours.endTime

    if (start < end) {
      return currentTime >= start && currentTime < end
    } else {
      return currentTime >= start || currentTime < end
    }
  }

  // Email sablon generálása
  private generateEmailTemplate(notification: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }
            .content { padding: 20px; background: #f5f5f5; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${notification.title}</h2>
            </div>
            <div class="content">
              <p>${notification.message}</p>
              <a href="${process.env.APP_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                Megtekintés
              </a>
            </div>
            <div class="footer">
              <p>© 2024 Luminé Platform</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private getDefaultSettings() {
    return {
      email: {
        onGrade: true,
        onAbsence: true,
        onHomework: true,
        onMessage: true,
        onBehavior: true,
        onEvent: true,
        digest: 'immediate'
      },
      push: {
        onGrade: true,
        onAbsence: true,
        onHomework: true,
        onMessage: true,
        onBehavior: true,
        onEvent: true,
        enabled: true
      },
      inApp: {
        enabled: true,
        sound: true,
        badge: true
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    }
  }
}
```

### 2. Notification Triggers
```typescript
// src/lib/notificationTriggers.ts
import { NotificationService } from './notifications'

const notificationService = new NotificationService()

// Jegy beírása után
export async function triggerGradeNotification(grade: any) {
  await notificationService.createNotification(
    grade.studentId,
    'grade',
    `Új jegy: ${grade.subject}`,
    `${grade.grade} jegyet kaptál ${grade.subject}-ből (${grade.title})`,
    { gradeId: grade.id }
  )

  // Szülő értesítése
  const parentChildren = await db
    .collection('parent_children')
    .where('childId', '==', grade.studentId)
    .get()

  for (const doc of parentChildren.docs) {
    const parentId = doc.data().parentId
    await notificationService.createNotification(
      parentId,
      'grade',
      `${grade.studentName} új jegyet kapott`,
      `${grade.grade} jegyet kapott ${grade.subject}-ből`,
      { gradeId: grade.id }
    )
  }
}

// Mulasztás rögzítése után
export async function triggerAbsenceNotification(absence: any) {
  await notificationService.createNotification(
    absence.studentId,
    'absence',
    'Mulasztás rögzítve',
    `Mulasztás rögzítve: ${absence.subject} (${absence.date})`,
    { absenceId: absence.id }
  )

  // Szülő értesítése
  const parentChildren = await db
    .collection('parent_children')
    .where('childId', '==', absence.studentId)
    .get()

  for (const doc of parentChildren.docs) {
    const parentId = doc.data().parentId
    await notificationService.createNotification(
      parentId,
      'absence',
      `${absence.studentName} mulasztott`,
      `Mulasztás rögzítve: ${absence.subject}`,
      { absenceId: absence.id }
    )
  }
}

// Házi feladat kiadása után
export async function triggerHomeworkNotification(homework: any) {
  const classStudents = await db
    .collection('users')
    .where('class', '==', homework.className)
    .where('role', 'in', ['student', 'dj'])
    .get()

  for (const doc of classStudents.docs) {
    const studentId = doc.id
    await notificationService.createNotification(
      studentId,
      'homework',
      `Új házi feladat: ${homework.title}`,
      `${homework.subject}-ből új házi feladat. Határidő: ${homework.dueDate}`,
      { homeworkId: homework.id }
    )

    // Szülő értesítése
    const parentChildren = await db
      .collection('parent_children')
      .where('childId', '==', studentId)
      .get()

    for (const parentDoc of parentChildren.docs) {
      const parentId = parentDoc.data().parentId
      await notificationService.createNotification(
        parentId,
        'homework',
        `Új házi feladat: ${homework.title}`,
        `${homework.subject}-ből új házi feladat`,
        { homeworkId: homework.id }
      )
    }
  }
}

// Üzenet érkezése után
export async function triggerMessageNotification(message: any) {
  await notificationService.createNotification(
    message.recipientId,
    'message',
    `Új üzenet: ${message.senderName}`,
    message.content.substring(0, 100),
    { messageId: message.id }
  )
}
```

---

## 🎨 Frontend Implementáció

### 1. Notification Center
```typescript
// src/components/NotificationCenter.tsx
import { useState, useEffect } from 'react'
import { Bell, X, Check, Trash2 } from 'lucide-react'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000) // 30 másodpercenként
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10')
      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Értesítések betöltése sikertelen:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
      loadNotifications()
    } catch (error) {
      console.error('Hiba az olvasáskor:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      loadNotifications()
    } catch (error) {
      console.error('Hiba a törléskor:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT'
      })
      loadNotifications()
    } catch (error) {
      console.error('Hiba az olvasáskor:', error)
    }
  }

  return (
    <div className="relative">
      {/* Harang ikon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Értesítések panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold">Értesítések</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Összes olvasottnak jelölése
              </button>
            )}
          </div>

          <div className="divide-y dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nincsenek értesítések
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString('hu-HU')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                          title="Olvasottnak jelölés"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        title="Törlés"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t dark:border-gray-700 text-center">
            <a
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Összes értesítés megtekintése
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 2. Notification Settings
```typescript
// src/app/settings/notifications/page.tsx
export default function NotificationSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings')
      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error('Beállítások betöltése sikertelen:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Beállítások mentése sikertelen:', error)
    }
  }

  if (loading) return <div>Betöltés...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Értesítési Beállítások</h1>

      {/* Email értesítések */}
      <Card>
        <CardHeader>
          <CardTitle>Email Értesítések</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label>Új jegy</label>
            <input
              type="checkbox"
              checked={settings.email.onGrade}
              onChange={(e) => setSettings({
                ...settings,
                email: { ...settings.email, onGrade: e.target.checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label>Mulasztás</label>
            <input
              type="checkbox"
              checked={settings.email.onAbsence}
              onChange={(e) => setSettings({
                ...settings,
                email: { ...settings.email, onAbsence: e.target.checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label>Házi feladat</label>
            <input
              type="checkbox"
              checked={settings.email.onHomework}
              onChange={(e) => setSettings({
                ...settings,
                email: { ...settings.email, onHomework: e.target.checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label>Üzenet</label>
            <input
              type="checkbox"
              checked={settings.email.onMessage}
              onChange={(e) => setSettings({
                ...settings,
                email: { ...settings.email, onMessage: e.target.checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label>Viselkedés</label>
            <input
              type="checkbox"
              checked={settings.email.onBehavior}
              onChange={(e) => setSettings({
                ...settings,
                email: { ...settings.email, onBehavior: e.target.checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label>Esemény</label>
            <input
              type="checkbox"
              checked={settings.email.onEvent}
              onChange={(e) => setSettings({
                ...settings,
                email: { ...settings.email, onEvent: e.target.checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label>Összefoglalás</label>
            <select
              value={settings.email.digest}
              onChange={(e) => setSettings({
                ...settings,
                email: { ...settings.email, digest: e.target.value }
              })}
              className="border rounded px-2 py-1"
            >
              <option value="immediate">Azonnal</option>
              <option value="daily">Naponta</option>
              <option value="weekly">Hetente</option>
              <option value="never">Soha</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Push értesítések */}
      <Card>
        <CardHeader>
          <CardTitle>Push Értesítések</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label>Push értesítések engedélyezése</label>
            <input
              type="checkbox"
              checked={settings.push.enabled}
              onChange={(e) => setSettings({
                ...settings,
                push: { ...settings.push, enabled: e.target.checked }
              })}
            />
          </div>
          {settings.push.enabled && (
            <>
              <div className="flex items-center justify-between">
                <label>Új jegy</label>
                <input
                  type="checkbox"
                  checked={settings.push.onGrade}
                  onChange={(e) => setSettings({
                    ...settings,
                    push: { ...settings.push, onGrade: e.target.checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label>Mulasztás</label>
                <input
                  type="checkbox"
                  checked={settings.push.onAbsence}
                  onChange={(e) => setSettings({
                    ...settings,
                    push: { ...settings.push, onAbsence: e.target.checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label>Házi feladat</label>
                <input
                  type="checkbox"
                  checked={settings.push.onHomework}
                  onChange={(e) => setSettings({
                    ...settings,
                    push: { ...settings.push, onHomework: e.target.checked }
                  })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Csendes órák */}
      <Card>
        <CardHeader>
          <CardTitle>Csendes Órák</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label>Csendes órák engedélyezése</label>
            <input
              type="checkbox"
              checked={settings.quietHours.enabled}
              onChange={(e) => setSettings({
                ...settings,
                quietHours: { ...settings.quietHours, enabled: e.target.checked }
              })}
            />
          </div>
          {settings.quietHours.enabled && (
            <>
              <div className="flex items-center justify-between">
                <label>Kezdés</label>
                <input
                  type="time"
                  value={settings.quietHours.startTime}
                  onChange={(e) => setSettings({
                    ...settings,
                    quietHours: { ...settings.quietHours, startTime: e.target.value }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label>Vége</label>
                <input
                  type="time"
                  value={settings.quietHours.endTime}
                  onChange={(e) => setSettings({
                    ...settings,
                    quietHours: { ...settings.quietHours, endTime: e.target.value }
                  })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mentés gomb */}
      <div className="flex gap-4">
        <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
          Mentés
        </Button>
        {saved && (
          <span className="text-green-600 font-medium">✓ Beállítások mentve</span>
        )}
      </div>
    </div>
  )
}
```

---

## 📊 Implementációs Ütemterv

### 1. Hét: Backend
- [ ] Notification model
- [ ] NotificationService
- [ ] Email küldés
- [ ] Push értesítések
- [ ] API végpontok

### 2. Hét: Frontend
- [ ] Notification Center
- [ ] Notification Settings
- [ ] Notification List
- [ ] Tesztelés

---

*Utolsó frissítés: 2024*
