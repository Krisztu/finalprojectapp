'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LogOut, User, BookOpen, Calendar, Music, MessageCircle, QrCode } from 'lucide-react'
import { generateQRCode, detectMusicPlatform } from '@/lib/utils'
import { demoGrades, demoLessons } from '@/lib/demo-data'
import { demoUsers, teacherLessons, demoClasses } from '@/lib/demo-users'

const getYouTubeVideoId = (url: string): string => {
  if (url.includes('music.youtube.com')) {
    return url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || ''
  }
  return url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || ''
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [musicRequests, setMusicRequests] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [qrCode, setQrCode] = useState<string>('')
  const [musicUrl, setMusicUrl] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [cookieConsent, setCookieConsent] = useState(false)
  const [showChartModal, setShowChartModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [userRole, setUserRole] = useState('student')
  const [selectedClass, setSelectedClass] = useState('')
  const [gradeForm, setGradeForm] = useState({ student: '', grade: '', title: '', description: '' })
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    // Load cookie consent and dark mode from localStorage
    const consent = localStorage.getItem('cookieConsent')
    if (consent === 'true') {
      setCookieConsent(true)
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode) {
        setDarkMode(savedDarkMode === 'true')
      }
    }
    
    loadKretaData()
    loadMusicRequests()
    loadChatMessages()
    generateUserQR()
  }, [user])

  const loadKretaData = async () => {
    if (!user) return

    try {
      const idToken = await user.getIdToken()
      
      const headers = {
        'Authorization': `Bearer ${idToken}`
      }

      const [studentRes, gradesRes, lessonsRes] = await Promise.all([
        fetch('/api/kreta/student', { headers }),
        fetch('/api/kreta/grades', { headers }),
        fetch('/api/kreta/lessons', { headers })
      ])

      if (studentRes.ok) {
        const studentData = await studentRes.json()
        setStudent(studentData)
      }
      
      // Load current user data
      const email = user.email || ''
      let userData = null
      
      // Check if user exists in demo users
      const demoUser = Object.values(demoUsers).find(u => u.email === email)
      if (demoUser) {
        userData = demoUser
        setUserRole(demoUser.role)
      } else {
        // Try to load from API for registered users
        try {
          const response = await fetch('/api/users')
          if (response.ok) {
            const users = await response.json()
            const apiUser = users.find((u: any) => u.email === email)
            if (apiUser) {
              userData = apiUser
              setUserRole(apiUser.role)
            } else {
              setUserRole('student') // Default role
            }
          }
        } catch (error) {
          setUserRole('student')
        }
      }
      
      setCurrentUser(userData)
      
      // Load appropriate data based on role - everyone gets demo data
      if (userData?.role === 'teacher') {
        setLessons(teacherLessons)
        setGrades(demoGrades) // Teachers also get demo grades to manage
      } else {
        setGrades(demoGrades)
        setLessons(demoLessons)
      }
      
      // Load all users for admin and teachers
      if (userData?.role === 'admin' || userData?.role === 'teacher') {
        loadAllUsers()
      }
      
    } catch (error) {
      console.error('Failed to load Kreta data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMusicRequests = async () => {
    try {
      const response = await fetch('/api/music')
      if (response.ok) {
        const data = await response.json()
        setMusicRequests(data)
      }
    } catch (error) {
      console.error('Failed to load music requests:', error)
    }
  }

  const loadChatMessages = async () => {
    try {
      const response = await fetch('/api/chat')
      if (response.ok) {
        const data = await response.json()
        setChatMessages(data)
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error)
    }
  }

  const generateUserQR = async () => {
    if (!user) return
    try {
      const action = Math.random() > 0.5 ? 'entry' : 'exit'
      const qrData = `${window.location.origin}/qr-scan?student=${user.uid}&action=${action}`
      const qrCodeUrl = await generateQRCode(qrData)
      setQrCode(qrCodeUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const submitMusicRequest = async () => {
    if (!musicUrl || !user) return
    
    const platform = detectMusicPlatform(musicUrl)
    if (!platform) {
      alert('Nem támogatott platform!')
      return
    }

    try {
      const response = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: musicUrl,
          platform,
          userId: user.uid,
          userName: student?.Name || user.email,
          userClass: student?.Class || 'N/A'
        })
      })

      if (response.ok) {
        setMusicUrl('')
        loadMusicRequests()
      }
    } catch (error) {
      console.error('Failed to submit music request:', error)
    }
  }

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !user) return

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatMessage,
          userId: user.uid,
          userName: student?.Name || user.email
        })
      })

      if (response.ok) {
        setChatMessage('')
        loadChatMessages()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const loadAllUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const users = await response.json()
        setAllUsers([...Object.values(demoUsers), ...users])
      } else {
        // Fallback to demo users only if API fails
        setAllUsers(Object.values(demoUsers))
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      // Fallback to demo users only
      setAllUsers(Object.values(demoUsers))
    }
  }

  const fillEmptyPeriods = (dayLessons: any[]) => {
    if (dayLessons.length === 0) return []
    
    const timeSlots = [
      '7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45'
    ]
    
    const filledLessons = []
    const existingTimes = dayLessons.map(lesson => lesson.StartTime)
    const lastLessonIndex = Math.max(...existingTimes.map(time => timeSlots.indexOf(time)))
    
    for (let i = 0; i <= lastLessonIndex; i++) {
      const time = timeSlots[i]
      const existingLesson = dayLessons.find(lesson => lesson.StartTime === time)
      
      if (existingLesson) {
        filledLessons.push(existingLesson)
      } else {
        filledLessons.push({
          StartTime: time,
          Subject: 'Lyukas óra',
          Teacher: '',
          Class: '',
          Room: '',
          status: 'free'
        })
      }
    }
    
    return filledLessons
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">GSZI APP</h1>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const newDarkMode = !darkMode
                  setDarkMode(newDarkMode)
                  if (cookieConsent) {
                    localStorage.setItem('darkMode', newDarkMode.toString())
                  }
                }}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                {darkMode ? '☀️' : '🌙'}
              </Button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentUser?.name || currentUser?.fullName || user.email} 
                {userRole === 'dj' && ' (DJ)'}
                {userRole === 'teacher' && ' (Tanár)'}
                {userRole === 'admin' && ' (Admin)'}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="dark:border-gray-600 dark:text-gray-300">
                <LogOut className="h-4 w-4 mr-2" />
                Kilépés
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className={`grid w-full bg-white dark:bg-gray-800 border dark:border-gray-700 ${
            userRole === 'admin' ? 'grid-cols-8' : 
            userRole === 'teacher' ? 'grid-cols-6' : 'grid-cols-7'
          }`}>
            <TabsTrigger value="dashboard">Főoldal</TabsTrigger>
            <TabsTrigger value="schedule">Órarend</TabsTrigger>
            {(userRole === 'student' || userRole === 'teacher') && <TabsTrigger value="grades">Jegyek</TabsTrigger>}
            <TabsTrigger value="radio">Suli Rádió</TabsTrigger>
            <TabsTrigger value="chat">Üzenőfal</TabsTrigger>
            {userRole !== 'teacher' && <TabsTrigger value="qr">QR Kód</TabsTrigger>}
            {userRole === 'admin' && <TabsTrigger value="users">Felhasználók</TabsTrigger>}
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Mai órák - {new Date().toLocaleDateString('hu-HU', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Idő</TableHead>
                        <TableHead>Tantárgy</TableHead>
                        <TableHead>{userRole === 'teacher' ? 'Osztály' : 'Tanár'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const today = new Date().toLocaleDateString('hu-HU', { weekday: 'long' })
                        const dayMap = { 'hétfő': 'Hétfő', 'kedd': 'Kedd', 'szerda': 'Szerda', 'csütörtök': 'Csütörtök', 'péntek': 'Péntek' }
                        const dayLessons = lessons.filter(lesson => lesson.Day === dayMap[today.toLowerCase()])
                        const filledLessons = fillEmptyPeriods(dayLessons)
                        
                        return filledLessons.map((lesson, index) => (
                          <TableRow key={index}>
                            <TableCell>{lesson.StartTime || 'N/A'}</TableCell>
                            <TableCell className={
                              lesson.status === 'cancelled' ? 'text-red-500' : 
                              lesson.status === 'substituted' ? 'text-yellow-600' : 
                              lesson.status === 'free' ? 'text-gray-400 italic' : ''
                            }>
                              {lesson.Subject || 'N/A'}
                              {lesson.status === 'cancelled' && ' (Elmaradt)'}
                              {lesson.status === 'substituted' && ' (Helyettesítés)'}
                            </TableCell>
                            <TableCell className={lesson.status === 'free' ? 'text-gray-400' : ''}>
                              {lesson.status === 'free' ? '-' : (userRole === 'teacher' ? (lesson.Class || 'N/A') : (lesson.Teacher || 'N/A'))}
                            </TableCell>
                          </TableRow>
                        ))
                      })()}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Legutóbbi jegyek
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tantárgy</TableHead>
                        <TableHead>Jegy</TableHead>
                        <TableHead>Dátum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.slice(0, 5).map((grade, index) => (
                        <TableRow key={index}>
                          <TableCell>{grade.Subject || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-white ${
                              (grade.NumberValue || 0) >= 4 ? 'bg-green-500' : 
                              (grade.NumberValue || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                              {grade.NumberValue || grade.Value || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(grade.Date).toLocaleDateString('hu-HU')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Órarend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => setCurrentWeek(currentWeek - 1)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Előző hét
                    </button>
                    <div className="flex gap-2">
                      {['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'].map((day, index) => {
                        const dayDate = new Date()
                        dayDate.setDate(dayDate.getDate() - dayDate.getDay() + 1 + index + (currentWeek * 7))
                        const isSelected = selectedDate.toDateString() === dayDate.toDateString()
                        return (
                          <button
                            key={day}
                            onClick={() => setSelectedDate(dayDate)}
                            className={`px-3 py-2 rounded text-sm font-medium ${
                              isSelected 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <div>{day}</div>
                            <div className="text-xs">{dayDate.getDate()}</div>
                          </button>
                        )
                      })}
                    </div>
                    <button 
                      onClick={() => setCurrentWeek(currentWeek + 1)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Következő hét
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-center mb-3 text-gray-900 dark:text-white">
                    {selectedDate.toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      const selectedDay = selectedDate.toLocaleDateString('hu-HU', { weekday: 'long' })
                      const dayMap = { 'hétfő': 'Hétfő', 'kedd': 'Kedd', 'szerda': 'Szerda', 'csütörtök': 'Csütörtök', 'péntek': 'Péntek' }
                      const dayLessons = lessons.filter(lesson => lesson.Day === dayMap[selectedDay.toLowerCase()])
                      const filledLessons = fillEmptyPeriods(dayLessons)
                      
                      return filledLessons.map((lesson, index) => (
                        <div key={index} className={`rounded p-3 text-sm ${
                          lesson.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900 border-l-4 border-red-500' :
                          lesson.status === 'substituted' ? 'bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500' :
                          lesson.status === 'free' ? 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300' :
                          'bg-white dark:bg-gray-700'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-blue-600 dark:text-blue-400">{lesson.StartTime}</div>
                              <div className={`font-semibold ${
                                lesson.status === 'cancelled' ? 'text-red-700 dark:text-red-300' :
                                lesson.status === 'substituted' ? 'text-yellow-700 dark:text-yellow-300' :
                                lesson.status === 'free' ? 'text-gray-500 dark:text-gray-400 italic' :
                                'text-gray-900 dark:text-white'
                              }`}>
                                {lesson.Subject}
                                {lesson.status === 'cancelled' && ' (ELMARADT)'}
                                {lesson.status === 'substituted' && ' (HELYETTESÍTÉS)'}
                              </div>
                              {lesson.status !== 'free' && (
                                <>
                                  <div className="text-gray-600 dark:text-gray-300 text-xs">{userRole === 'teacher' ? lesson.Class : lesson.Teacher}</div>
                                  <div className="text-gray-500 dark:text-gray-400 text-xs">{lesson.Room}</div>
                                </>
                              )}
                            </div>
                            {lesson.note && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                {lesson.note}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {(userRole === 'student' || userRole === 'teacher') && (
          <TabsContent value="grades" className="space-y-6">
            {userRole === 'teacher' && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Jegy beírása</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Osztály</label>
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value="">Válassz osztályt</option>
                          {demoClasses.filter(cls => 
                            userRole === 'admin' || ['9.A', '10.B', '12.A'].includes(cls.name)
                          ).map(cls => (
                            <option key={cls.name} value={cls.name}>{cls.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Diák kiválasztása</label>
                        <select 
                          value={gradeForm.student}
                          onChange={(e) => setGradeForm({...gradeForm, student: e.target.value})}
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value="">Válassz diákot</option>
                          {allUsers.filter(user => 
                            user.role === 'student' && 
                            (userRole === 'admin' || 
                             (userRole === 'teacher' && selectedClass && 
                              (user.class === selectedClass || !user.class)))
                          ).map((student, index) => (
                            <option key={index} value={student.fullName || student.name}>
                              {student.fullName || student.name} ({student.class || 'Osztály nélkül'})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Jegy (1-5)</label>
                        <select 
                          value={gradeForm.grade}
                          onChange={(e) => setGradeForm({...gradeForm, grade: e.target.value})}
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value="">Válassz jegyet</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cím</label>
                        <input 
                          type="text"
                          value={gradeForm.title}
                          onChange={(e) => setGradeForm({...gradeForm, title: e.target.value})}
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                          placeholder="pl. Dolgozat, Felélés"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Leírás</label>
                        <textarea 
                          value={gradeForm.description}
                          onChange={(e) => setGradeForm({...gradeForm, description: e.target.value})}
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                          rows={3}
                          placeholder="Jegy leírása, megjegyzés"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button 
                          onClick={() => {
                            if (gradeForm.student && gradeForm.grade && gradeForm.title) {
                              alert(`Jegy rögzítve: ${gradeForm.student} - ${gradeForm.grade} (${gradeForm.title})`)
                              setGradeForm({ student: '', grade: '', title: '', description: '' })
                            } else {
                              alert('Töltsd ki az összes kötelező mezőt!')
                            }
                          }}
                          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                        >
                          Jegy rögzítése
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Osztályaim</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {demoClasses.filter(cls => ['9.A', '10.B', '12.A'].includes(cls.name)).map(cls => (
                        <div key={cls.name} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-semibold text-lg">{cls.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{cls.students} diák</p>
                          <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                            Jegyek megtekintése
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {userRole === 'student' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Átlagok
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {grades.length > 0 ? (grades.reduce((sum, grade) => sum + (grade.NumberValue || 0), 0) / grades.length).toFixed(2) : '0.00'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Összátlag</div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowChartModal(true)}>
                      <h4 className="font-medium mb-3 text-center">Tantárgyak átlagai (kattints a nagy nézethez)</h4>
                      <div className="relative h-48">
                        <svg viewBox="0 0 200 120" className="w-full h-full">
                          {Object.entries(
                            grades.reduce((acc, grade) => {
                              const subject = grade.Subject || 'Egyéb'
                              if (!acc[subject]) acc[subject] = []
                              acc[subject].push(grade)
                              return acc
                            }, {} as Record<string, any[]>)
                          ).map(([subject, subjectGrades], index) => {
                            const average = subjectGrades.reduce((sum, grade) => sum + (grade.NumberValue || 0), 0) / subjectGrades.length
                            const barHeight = (average / 5) * 80
                            const x = 20 + index * 30
                            const color = average >= 4 ? '#10b981' : average >= 3 ? '#f59e0b' : '#ef4444'
                            return (
                              <g key={subject}>
                                <rect
                                  x={x}
                                  y={100 - barHeight}
                                  width="20"
                                  height={barHeight}
                                  fill={color}
                                  rx="2"
                                />
                                <text
                                  x={x + 10}
                                  y={115}
                                  textAnchor="middle"
                                  fontSize="8"
                                  fill="currentColor"
                                  className="text-gray-600 dark:text-gray-400"
                                >
                                  {subject.slice(0, 4)}
                                </text>
                                <text
                                  x={x + 10}
                                  y={95 - barHeight}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="white"
                                  fontWeight="bold"
                                >
                                  {average.toFixed(1)}
                                </text>
                              </g>
                            )
                          })}
                          <line x1="15" y1="100" x2="185" y2="100" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
                          {[1, 2, 3, 4, 5].map(grade => (
                            <g key={grade}>
                              <line x1="10" y1={100 - (grade / 5) * 80} x2="15" y2={100 - (grade / 5) * 80} stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
                              <text x="8" y={100 - (grade / 5) * 80 + 3} textAnchor="end" fontSize="8" fill="currentColor" className="text-gray-600 dark:text-gray-400">{grade}</text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Szűrés tantárgy szerint:</h5>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedSubject(null)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              selectedSubject === null 
                                ? 'bg-blue-500 text-white shadow-sm' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            Összes
                          </button>
                          {Object.keys(
                            grades.reduce((acc, grade) => {
                              const subject = grade.Subject || 'Egyéb'
                              acc[subject] = true
                              return acc
                            }, {} as Record<string, boolean>)
                          ).map(subject => (
                            <button
                              key={subject}
                              onClick={() => setSelectedSubject(subject)}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                selectedSubject === subject 
                                  ? 'bg-blue-500 text-white shadow-sm' 
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              {subject.length > 8 ? subject.slice(0, 8) + '...' : subject}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(
                          grades.reduce((acc, grade) => {
                            const subject = grade.Subject || 'Egyéb'
                            if (!acc[subject]) acc[subject] = []
                            acc[subject].push(grade)
                            return acc
                          }, {} as Record<string, any[]>)
                        ).filter(([subject]) => selectedSubject === null || subject === selectedSubject).map(([subject, subjectGrades]) => {
                          const average = subjectGrades.reduce((sum, grade) => sum + (grade.NumberValue || 0), 0) / subjectGrades.length
                          return (
                            <div key={subject} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm text-gray-900 dark:text-white truncate block">{subject}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{subjectGrades.length} jegy</span>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      average >= 4 ? 'bg-green-500' : average >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} 
                                    style={{width: `${(average / 5) * 100}%`}}
                                  ></div>
                                </div>
                                <span className="font-bold text-lg text-gray-900 dark:text-white min-w-[2.5rem] text-right">{average.toFixed(1)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Jegyek részletesen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(
                      grades.reduce((acc, grade) => {
                        const subject = grade.Subject || 'Egyéb'
                        if (!acc[subject]) acc[subject] = []
                        acc[subject].push(grade)
                        return acc
                      }, {} as Record<string, any[]>)
                    ).filter(([subject]) => selectedSubject === null || subject === selectedSubject).map(([subject, subjectGrades]) => {
                      const average = subjectGrades.reduce((sum, grade) => sum + (grade.NumberValue || 0), 0) / subjectGrades.length
                      return (
                        <div key={subject} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{subject}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">{subjectGrades.length} jegy</span>
                              <span className={`px-3 py-1 rounded-full text-white font-bold text-sm ${
                                average >= 4 ? 'bg-green-500' : average >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}>
                                Átlag: {average.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-3">
                            {subjectGrades.map((grade, index) => (
                              <div key={index} className="group relative flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                                  (grade.NumberValue || 0) >= 4 ? 'bg-green-500 hover:bg-green-600' : 
                                  (grade.NumberValue || 0) >= 3 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'
                                }`}>
                                  {grade.NumberValue || grade.Value || 'N/A'}
                                </div>
                                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                  <div className="font-medium">{new Date(grade.Date).toLocaleDateString('hu-HU')}</div>
                                  <div className="text-gray-300">{grade.Type || 'Jegy'}</div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            )}
          </TabsContent>
          )}

          <TabsContent value="radio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music className="h-5 w-5 mr-2" />
                  Zene beküldése
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Zene URL (Spotify, YouTube, YouTube Music, Apple Music)"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                />
                <Button onClick={submitMusicRequest} className="w-full">
                  Zene beküldése
                </Button>
              </CardContent>
            </Card>

            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
              <div className="space-y-6">
                {musicRequests.map((request) => (
                  <div key={request.id} className="bg-white dark:bg-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="flex items-center p-6 gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex-shrink-0 relative overflow-hidden">
                        {request.thumbnail ? (
                          <img src={request.thumbnail} alt={request.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">
                          {request.title || 'Zene kérés'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{request.userName}</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">
                          {new Date(request.createdAt).toLocaleDateString('hu-HU')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {request.platform && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">
                            {request.platform}
                          </span>
                        )}
                        {userRole === 'dj' && (
                          <button
                            onClick={async () => {
                              if (confirm('Biztosan törlöd ezt a zenét?')) {
                                try {
                                  const response = await fetch(`/api/music?id=${request.id}`, {
                                    method: 'DELETE'
                                  })
                                  
                                  if (response.ok) {
                                    // Frissítjük a zene kérések listáját
                                    loadMusicRequests()
                                    alert(`Zene törölve: ${request.title || 'Zene kérés'}`)
                                  } else {
                                    const error = await response.json()
                                    alert(`Hiba a törlés során: ${error.error || 'Ismeretlen hiba'}`)
                                  }
                                } catch (error) {
                                  console.error('Delete error:', error)
                                  alert('Hiba történt a törlés során')
                                }
                              }
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            Törlés
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {request.platform === 'spotify' && request.url && (
                      <div className="px-6 pb-6">
                        <iframe
                          src={`https://open.spotify.com/embed/track/${request.url.split('/track/')[1]?.split('?')[0]}?utm_source=generator&theme=0`}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    
                    {request.platform === 'youtube' && request.url && (
                      <div className="px-6 pb-6">
                        <iframe
                          width="100%"
                          height="200"
                          src={`https://www.youtube.com/embed/${getYouTubeVideoId(request.url)}`}
                          frameBorder="0"
                          allowFullScreen
                          allow="autoplay; encrypted-media"
                          className="rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Üzenőfal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm">{message.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString('hu-HU')}
                        </span>
                      </div>
                      <p className="mt-1">{message.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Írj egy üzenetet..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={sendChatMessage}>Küldés</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  QR Kód belépéshez
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {qrCode ? (
                  <div className="space-y-4">
                    <img src={qrCode} alt="QR Code" className="mx-auto" />
                    <p className="text-sm text-gray-600">
                      Mutasd fel ezt a QR kódot a portásnál belépéskor
                    </p>
                    <Button onClick={generateUserQR} variant="outline">
                      Új QR kód generálása
                    </Button>
                  </div>
                ) : (
                  <Skeleton className="h-64 w-64 mx-auto" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {userRole === 'admin' && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Felhasználók kezelése</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.fullName || user.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        {user.studentId && <p className="text-xs text-gray-500 dark:text-gray-500">ID: {user.studentId}</p>}
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'dj' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' :
                           user.role === 'teacher' ? 'Tanár' :
                           user.role === 'dj' ? 'DJ' : 'Diák'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <select 
                          defaultValue={user.role}
                          onChange={(e) => {
                            const newRole = e.target.value
                            alert(`${user.name} szerepköre megváltoztatva: ${newRole}`)
                          }}
                          className="px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value="student">Diák</option>
                          <option value="teacher">Tanár</option>
                          <option value="dj">DJ</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button 
                          onClick={() => {
                            const action = prompt('Válassz műveletet:\n1 - Órarend szerkesztése\n2 - Jegyek kezelése\n3 - Felfüggesztés')
                            if (action === '1') {
                              alert(`${user.fullName || user.name} órarendjének szerkesztése`)
                            } else if (action === '2') {
                              alert(`${user.fullName || user.name} jegyeinek kezelése`)
                            } else if (action === '3') {
                              alert(`${user.fullName || user.name} felfüggesztve`)
                            }
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          Kezelés
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Név:</strong> {currentUser?.name || currentUser?.fullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    {currentUser?.studentId && <p><strong>Oktatási azonosító:</strong> {currentUser.studentId}</p>}
                    {currentUser?.role && <p><strong>Szerepkör:</strong> {
                      currentUser.role === 'student' ? 'Diák' :
                      currentUser.role === 'teacher' ? 'Tanár' :
                      currentUser.role === 'admin' ? 'Admin' :
                      currentUser.role === 'dj' ? 'DJ' : currentUser.role
                    }</p>}
                    {currentUser?.subject && <p><strong>Tantárgy:</strong> {currentUser.subject}</p>}
                    {currentUser?.classes && <p><strong>Osztályok:</strong> {currentUser.classes.join(', ')}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {!cookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Ez az oldal sütiket használ a beállítások mentéséhez (pl. sötét mód). 
              <a href="#" className="text-blue-600 dark:text-blue-400 underline ml-1">
                További információ
              </a>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  localStorage.setItem('cookieConsent', 'false')
                  setCookieConsent(true)
                }}
              >
                Elutasítás
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  localStorage.setItem('cookieConsent', 'true')
                  localStorage.setItem('darkMode', darkMode.toString())
                  setCookieConsent(true)
                }}
              >
                Elfogadás
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {showChartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-6xl w-full max-h-[95vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Tantárgyak átlagai</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Részletes diagram nézet</p>
              </div>
              <button 
                onClick={() => setShowChartModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
              <h5 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Szűrés tantárgy szerint:</h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSubject === null 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  Összes tantárgy
                </button>
                {Object.keys(
                  grades.reduce((acc, grade) => {
                    const subject = grade.Subject || 'Egyéb'
                    acc[subject] = true
                    return acc
                  }, {} as Record<string, boolean>)
                ).map(subject => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSubject === subject 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="w-full">
                <svg viewBox="0 0 700 450" className="w-full h-96">
                  {Object.entries(
                    grades.reduce((acc, grade) => {
                      const subject = grade.Subject || 'Egyéb'
                      if (!acc[subject]) acc[subject] = []
                      acc[subject].push(grade)
                      return acc
                    }, {} as Record<string, any[]>)
                  ).filter(([subject]) => selectedSubject === null || subject === selectedSubject).map(([subject, subjectGrades], index, filteredArray) => {
                    const average = subjectGrades.reduce((sum, grade) => sum + (grade.NumberValue || 0), 0) / subjectGrades.length
                    const barHeight = (average / 5) * 250
                    const chartWidth = 550
                    const barWidth = Math.min(70, (chartWidth / filteredArray.length) - 30)
                    const spacing = chartWidth / filteredArray.length
                    const x = 100 + index * spacing
                    const color = average >= 4 ? '#10b981' : average >= 3 ? '#f59e0b' : '#ef4444'
                    return (
                      <g key={subject}>
                        <rect
                          x={x - barWidth/2}
                          y={320 - barHeight}
                          width={barWidth}
                          height={barHeight}
                          fill={color}
                          rx="4"
                          className="hover:opacity-80 cursor-pointer"
                        />
                        <text
                          x={x}
                          y={340}
                          textAnchor="middle"
                          fontSize="12"
                          fill="currentColor"
                          className="text-gray-700 dark:text-gray-300 font-medium"
                        >
                          {subject.length > 10 ? subject.slice(0, 10) + '...' : subject}
                        </text>
                        <text
                          x={x}
                          y={310 - barHeight}
                          textAnchor="middle"
                          fontSize="14"
                          fill="white"
                          fontWeight="bold"
                        >
                          {average.toFixed(2)}
                        </text>
                        <text
                          x={x}
                          y={355}
                          textAnchor="middle"
                          fontSize="10"
                          fill="currentColor"
                          className="text-gray-500 dark:text-gray-400"
                        >
                          {subjectGrades.length} jegy
                        </text>
                      </g>
                    )
                  })}
                  <line x1="80" y1="320" x2="620" y2="320" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
                  <line x1="80" y1="70" x2="80" y2="320" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
                  {[1, 2, 3, 4, 5].map(grade => (
                    <g key={grade}>
                      <line x1="75" y1={320 - (grade / 5) * 250} x2="85" y2={320 - (grade / 5) * 250} stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
                      <text x="70" y={320 - (grade / 5) * 250 + 5} textAnchor="end" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium">{grade}</text>
                      <line x1="80" y1={320 - (grade / 5) * 250} x2="620" y2={320 - (grade / 5) * 250} stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" opacity="0.3" />
                    </g>
                  ))}
                  <text x="35" y="195" textAnchor="middle" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium" transform="rotate(-90 35 195)">Átlag</text>
                  <text x="350" y="385" textAnchor="middle" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium">Tantárgyak</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}