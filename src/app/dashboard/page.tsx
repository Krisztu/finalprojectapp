'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { uploadToCloudinary } from '@/lib/cloudinary'
import QRCode from 'qrcode'
import { LogOut, User as UserIcon, BookOpen, Calendar, Music, MessageCircle, QrCode, Camera, Upload } from 'lucide-react'
import { CustomAlert } from '@/shared/components/ui/custom-alert'
import { ChartModal } from '@/features/grades/components/ChartModal'
import { ClassGradeModal } from '@/features/grades/components/ClassGradeModal'
import { HomeworkModal } from '@/features/homework/components/HomeworkModal'
import { SubmissionModal } from '@/features/homework/components/SubmissionModal'
import { AttendanceModal } from '@/features/attendance/components/AttendanceModal'
import ScheduleManager from '@/components/admin/ScheduleManager'

const getYouTubeVideoId = (url: string): string => {
  if (url.includes('music.youtube.com')) {
    return url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || ''
  }
  return url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || ''
}

const detectMusicPlatform = (url: string): string | null => {
  if (url.includes('spotify.com')) {
    return 'spotify'
  }
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('music.youtube.com')) {
    return 'youtube'
  }
  return null
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
  const [showClassGradeModal, setShowClassGradeModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [userRole, setUserRole] = useState('student')
  const [selectedClass, setSelectedClass] = useState('')
  const [gradeForm, setGradeForm] = useState({ student: '', grade: '', title: '', description: '' })
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [availableClasses, setAvailableClasses] = useState<any[]>([{ name: '12.A' }, { name: '12.B' }])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(0)
  const [lessonForm, setLessonForm] = useState({ day: '', startTime: '', subject: '', teacher: '', class: '', room: '' })
  const [teacherForm, setTeacherForm] = useState({ email: '', password: '', fullName: '', subject: '', classes: [] as string[] })
  const [studentForm, setStudentForm] = useState({ email: '', password: '', fullName: '', studentId: '', class: '' })
  const [scheduleChangeForm, setScheduleChangeForm] = useState({
    teacherId: '',
    date: '',
    timeSlot: '',
    changeType: '',
    newSubject: '',
    newTeacher: '',
    newClass: '',
    newRoom: ''
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [homework, setHomework] = useState<any[]>([])
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<any>({})
  const [homeworkForm, setHomeworkForm] = useState({ title: '', description: '', dueDate: '', lessonId: '', attachments: [] as string[] })
  const [submissionForm, setSubmissionForm] = useState({ content: '', attachments: [] as string[] })
  const [selectedHomework, setSelectedHomework] = useState<any>(null)
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [attendance, setAttendance] = useState<any[]>([])
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [attendanceForm, setAttendanceForm] = useState({ topic: '', students: [] as any[] })
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})
  const [excuses, setExcuses] = useState<any[]>([])
  const [excuseForm, setExcuseForm] = useState({ absenceIds: [] as string[], excuseType: '', description: '' })
  const [showExcuseModal, setShowExcuseModal] = useState(false)
  const [selectedAbsences, setSelectedAbsences] = useState<any[]>([])
  const [teacherSearch, setTeacherSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [alertData, setAlertData] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' | 'default' }>({ isOpen: false, title: '', message: '', type: 'default' })
  const [justifications, setJustifications] = useState<any[]>([])
  const [justificationForm, setJustificationForm] = useState({ date: '', reason: '', proofUrl: '' })
  const [selectedJustification, setSelectedJustification] = useState<any>(null)
  const [showJustificationModal, setShowJustificationModal] = useState(false)

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default', title: string = 'Értesítés') => {
    setAlertData({ isOpen: true, title, message, type })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }


    const consent = localStorage.getItem('cookieConsent')
    if (consent === 'true') {
      setCookieConsent(true)
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode) {
        const isDark = savedDarkMode === 'true'
        setDarkMode(isDark)
        document.documentElement.classList.toggle('dark', isDark)
      }
    }

    loadUserData()
    loadMusicRequests()
    loadChatMessages()
    generateUserQR()
    setupUserRoles()
  }, [user])


  useEffect(() => {
    if (currentUser) {
      loadLessons(currentUser)
      loadHomework()
      loadAttendance()
      if (currentUser.role === 'homeroom_teacher' || currentUser.role === 'student' || currentUser.role === 'dj') {
        loadExcuses()
        loadJustifications()
      }
    }
  }, [selectedDate, currentUser])

  const loadUserData = async () => {
    if (!user) return

    try {
      const email = user.email || ''
      let userData = null

      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const users = await response.json()
        const apiUser = users[0]
        if (apiUser) {
          userData = apiUser
          if (apiUser.role === 'homeroom_teacher') {
            setUserRole('teacher')
          } else {
            setUserRole(apiUser.role)
          }
          setStudent({ Name: apiUser.fullName || apiUser.name, Class: apiUser.class })
          console.log('Felhasználó betöltve:', apiUser.role, '-> userRole:', apiUser.role === 'homeroom_teacher' ? 'teacher' : apiUser.role)
        } else {
          setUserRole('student')
          console.log('Alapértelmezett szerepkör: student')
        }
      }



      setCurrentUser(userData)


      await loadLessons(userData)


      await loadGrades(userData)

      if (userData?.role === 'admin' || userData?.role === 'teacher' || userData?.role === 'homeroom_teacher') {
        const effectiveRole = userData.role === 'homeroom_teacher' ? 'teacher' : userData.role
        await loadAllUsers(effectiveRole)
        console.log('Admin/tanár adatok betöltve')

        if (userData?.role === 'teacher' || userData?.role === 'homeroom_teacher') {
          const allLessonsResponse = await fetch('/api/lessons')
          if (allLessonsResponse.ok) {
            const allLessonsData = await allLessonsResponse.json()
            const formattedAllLessons = allLessonsData.map((lesson: any) => ({
              Day: lesson.day,
              StartTime: lesson.startTime,
              Subject: lesson.subject,
              Teacher: lesson.teacherName,
              Class: lesson.className,
              Room: lesson.room,
              status: 'normal',
              userId: lesson.userId
            }))
              ; (window as any).allLessonsForProfile = formattedAllLessons
            console.log('Tanári órák betöltve:', formattedAllLessons.length)
          }
        }
      }

    } catch (error) {
      console.log('Adatbetöltés hiba')
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
        console.log('Zene kérések betöltve')
      }
    } catch (error) {
      console.log('Zene kérések betöltése sikertelen')
    }
  }

  const loadChatMessages = async () => {
    try {
      const response = await fetch('/api/chat')
      if (response.ok) {
        const data = await response.json()
        setChatMessages(data)
        console.log('Üzenetek betöltve')
      }
    } catch (error) {
      console.log('Üzenetek betöltése sikertelen')
    }
  }

  const generateUserQR = async () => {
    if (!user) return
    try {
      const action = Math.random() > 0.5 ? 'entry' : 'exit'
      const qrData = `${window.location.origin}/qr-scan?student=${user.uid}&action=${action}`
      const qrCodeUrl = await QRCode.toDataURL(qrData)
      setQrCode(qrCodeUrl)
      console.log('QR kód generálva')
    } catch (error) {
      console.log('QR kód generálás sikertelen', error)
    }
  }

  const setupUserRoles = async () => {
    try {
      await fetch('/api/admin/set-roles', { method: 'POST' })
      console.log('Szerepkörök beállítva')
    } catch (error) {
      console.log('Szerepkör beállítás sikertelen')
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
      console.log('Zene kérés küldése sikertelen')
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
          userName: currentUser?.fullName || currentUser?.name || user.email
        })
      })

      if (response.ok) {
        setChatMessage('')
        loadChatMessages()
      }
    } catch (error) {
      console.log('Üzenet küldése sikertelen')
    }
  }

  const loadGrades = async (userData: any) => {
    try {
      if (userData?.role === 'student' || userData?.role === 'dj') {
        const url = `/api/grades?student=${encodeURIComponent(userData.fullName || userData.name)}`
        const response = await fetch(url)
        if (response.ok) {
          const gradesData = await response.json()
          gradesData.sort((a: any, b: any) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
          setGrades(gradesData)
        }
      } else if (userData?.role === 'teacher') {

        const response = await fetch('/api/grades')
        if (response.ok) {
          const allGrades = await response.json()
          allGrades.sort((a: any, b: any) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
          setGrades(allGrades)
        }
      } else {
        const response = await fetch('/api/grades')
        if (response.ok) {
          const gradesData = await response.json()
          gradesData.sort((a: any, b: any) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
          setGrades(gradesData)
        }
      }
    } catch (error) {
      console.log('Jegyek betöltése sikertelen')
    }
  }

  const loadLessons = async (userData: any) => {
    try {
      let url = '/api/lessons'
      let userId = null

      if (userData?.id) {
        url += `?userId=${encodeURIComponent(userData.id)}`
      } else if (user?.email) {
        url += `?userId=${encodeURIComponent(user.email)}`
      } else {
        return
      }

      const response = await fetch(url)
      if (response.ok) {
        const lessonsData = await response.json()


        const changesResponse = await fetch('/api/admin/schedule-changes')
        let scheduleChanges = []
        if (changesResponse.ok) {
          scheduleChanges = await changesResponse.json()
        }

        const formattedLessons = lessonsData.map((lesson: any) => {
          const baseLesson = {
            Day: lesson.day,
            StartTime: lesson.startTime,
            Subject: lesson.subject,
            Teacher: lesson.teacherName,
            Class: lesson.className,
            Room: lesson.room,
            status: 'normal',
            userId: lesson.userId
          }

          const selectedDateStr = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
          const userEmail = user?.email || ''


          const change = scheduleChanges.find((change: any) => {
            const matchesDate = change.date === selectedDateStr
            const matchesTime = change.timeSlot === lesson.startTime

            if (!matchesDate || !matchesTime) return false


            if (userRole === 'teacher') {
              return change.teacherId === userId || change.teacherId === userEmail
            }

            const teacherFromChanges = allUsers.find(u => u.id === change.teacherId || u.email === change.teacherId)
            const teacherName = teacherFromChanges?.fullName || teacherFromChanges?.name

            return teacherName === lesson.Teacher
          })

          if (change) {
            if (change.changeType === 'cancelled') {
              return {
                ...baseLesson,
                status: 'cancelled'
              }
            } else if (change.changeType === 'substituted') {
              return {
                ...baseLesson,
                Subject: change.newSubject || baseLesson.Subject,
                Teacher: change.newTeacher || baseLesson.Teacher,
                Class: change.newClass || baseLesson.Class,
                Room: change.newRoom || baseLesson.Room,
                status: 'substituted'
              }
            }
          }

          return baseLesson
        })


        const selectedDateStr = selectedDate.toISOString().split('T')[0]
        const userEmail = user?.email || ''

        const addedLessons = scheduleChanges
          .filter((change: any) => {
            const matchesDate = change.date === selectedDateStr
            const isAdded = change.changeType === 'added'

            if (!matchesDate || !isAdded) return false


            if (userRole === 'teacher') {
              return change.teacherId === userId || change.teacherId === userEmail
            }

            return change.newClass === currentUser?.class
          })
          .map((change: any) => ({
            Day: new Date(change.date).toLocaleDateString('hu-HU', { weekday: 'long' }),
            StartTime: change.timeSlot,
            Subject: change.newSubject,
            Teacher: change.newTeacher,
            Class: change.newClass,
            Room: change.newRoom,
            status: 'added'
          }))

        const allLessons = [...formattedLessons, ...addedLessons]
        setLessons(allLessons)
      }
    } catch (error) {
      console.log('Órák betöltése sikertelen')
    }
  }

  const loadAllUsers = async (currentRole?: string) => {
    try {
      const roleToCheck = currentRole || userRole
      if (roleToCheck === 'student' || roleToCheck === 'dj') {
        return
      }

      let url = '/api/users'

      if (roleToCheck === 'teacher' || roleToCheck === 'homeroom_teacher') {
        url += '?role=student'
      }



      const response = await fetch(url)
      if (response.ok) {
        const users = await response.json()
        setAllUsers(users)


        const classes = Array.from(new Set(users.filter((u: any) => u.class).map((u: any) => u.class)))
        if (classes.length > 0) {
          setAvailableClasses(classes.sort().map(name => ({ name })))
        }
        console.log('Felhasználók és osztályok betöltve')
      }
    } catch (error) {
      console.error('Failed to load all users:', error)
      setAllUsers([])
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

  const loadAttendance = async () => {
    if (!currentUser) return

    try {
      let url = '/api/attendance'

      if (currentUser.role === 'teacher') {
        url += `?teacherId=${encodeURIComponent(currentUser.id || user?.uid)}`
      } else if (currentUser.role === 'student' || currentUser.role === 'dj') {
        url += `?studentId=${encodeURIComponent(currentUser.id || user?.uid)}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setAttendance(data)
      }
    } catch (error) {
      console.log('Mulasztások betöltése sikertelen')
    }
  }

  const loadExcuses = async () => {
    if (!currentUser) return

    try {
      let url = '/api/excuses'

      if (currentUser.role === 'homeroom_teacher') {
        url += `?classTeacher=${encodeURIComponent(currentUser.class)}`
      } else if (currentUser.role === 'student' || currentUser.role === 'dj') {
        url += `?studentId=${encodeURIComponent(currentUser.id || user?.uid)}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setExcuses(data)
      }
    } catch (error) {
      console.log('Igazolások betöltése sikertelen')
    }
  }

  const loadHomework = async () => {
    if (!currentUser) return

    try {
      let url = '/api/homework'

      if (currentUser.role === 'student' || currentUser.role === 'dj') {
        url += `?class=${encodeURIComponent(currentUser.class)}&studentId=${encodeURIComponent(currentUser.id || user?.uid)}`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setHomework(data.homework || [])
          setHomeworkSubmissions(data.submissions || {})
        }
      } else if (currentUser.role === 'teacher' || currentUser.role === 'homeroom_teacher') {
        const teacherId = currentUser.id || user?.uid || user?.email
        url += `?teacherId=${encodeURIComponent(teacherId)}`
        console.log('Tanár ID:', teacherId)
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          console.log('Tanári házi feladatok betöltve:', data.length, 'db')
          setHomework(data)
        }
      }
    } catch (error) {
      console.log('Házi feladatok betöltése sikertelen')
    }
  }

  const handleUpdateSubmissionStatus = async (id: string, status: 'completed' | 'incomplete') => {
    try {
      await fetch('/api/homework-submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      showAlert(status === 'completed' ? 'Megcsináltnak jelölve!' : 'Hiányosnak jelölve!', status === 'completed' ? 'success' : 'info')
      loadHomework()
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  const handleSubmitHomework = async (content: string, attachments: string[] = []) => {
    if (!selectedHomework) return

    try {
      const response = await fetch('/api/homework-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeworkId: selectedHomework.id,
          studentId: currentUser?.id || user?.uid,
          studentName: currentUser?.fullName || currentUser?.name,
          content: content,
          attachments: attachments
        })
      })

      if (response.ok) {
        showAlert('Házi feladat sikeresen beküldve!', 'success')
        loadHomework()
      } else {
        showAlert('Hiba a beküldés során', 'error')
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  const handleExtensionAttendanceSave = async (data: { topic: string; students: any[] }, homeworkData?: any) => {
    if (!selectedLesson) return

    try {
      // Save Attendance
      let response;
      if (selectedLesson.id) {
        // Update
        response = await fetch('/api/attendance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedLesson.id,
            topic: data.topic,
            students: data.students
          })
        })
      } else {
        // Create
        response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId: currentUser?.id || user?.uid,
            date: selectedDate.toISOString().split('T')[0],
            startTime: selectedLesson.StartTime,
            subject: selectedLesson.Subject,
            className: selectedLesson.Class,
            topic: data.topic,
            students: data.students
          })
        })
      }

      if (!response.ok) {
        showAlert('Hiba a mulasztás rögzítése során', 'error')
        return
      }

      // Save Homework if present
      if (homeworkData) {
        const lessonId = `${selectedLesson.Day}_${selectedLesson.StartTime}_${selectedLesson.Class}`
        const teacherId = currentUser?.id || user?.uid || user?.email

        const hwResponse = await fetch('/api/homework', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: homeworkData.title,
            description: homeworkData.description,
            dueDate: homeworkData.dueDate,
            teacherId: teacherId,
            teacherName: currentUser?.fullName || currentUser?.name,
            subject: selectedLesson.Subject,
            className: selectedLesson.Class,
            lessonId: lessonId,
            attachments: []
          })
        })

        if (hwResponse.ok) {
          showAlert('Mulasztás és házi feladat rögzítve!', 'success')
        } else {
          showAlert('Mulasztás rögzítve, de a házi feladat létrehozása sikertelen', 'warning')
        }
      } else {
        showAlert('Mulasztások rögzítve!', 'success')
      }

      setShowAttendanceModal(false)
      setAttendanceForm({ topic: '', students: [] })
      loadAttendance()
      if (homeworkData) loadHomework()

    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }




  const loadJustifications = async () => {
    if (!currentUser) return
    try {
      let url = '/api/justifications'
      if (currentUser.role === 'student') {
        url += `?studentId=${currentUser.id || user?.uid}`
      } else if (currentUser.role === 'homeroom_teacher') {
        url += `?class=${currentUser.class || currentUser.classes?.[0] || '12.A'}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setJustifications(data)
      }
    } catch (error) {
      console.error('Failed to load justifications')
    }
  }

  const handleSubmitJustification = async () => {
    if (!justificationForm.date || !justificationForm.reason) {
      showAlert('Kérlek tölts ki minden mezőt!', 'warning')
      return
    }

    try {
      const response = await fetch('/api/justifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id || user?.uid,
          studentName: currentUser.name || currentUser.fullName,
          studentClass: currentUser.class,
          date: justificationForm.date,
          reason: justificationForm.reason,
          proofUrls: justificationForm.proofUrl ? [justificationForm.proofUrl] : []
        })
      })

      if (response.ok) {
        showAlert('Igazolás sikeresen beküldve!', 'success')
        setJustificationForm({ date: '', reason: '', proofUrl: '' })
        loadJustifications()
      } else {
        showAlert('Beküldés sikertelen', 'error')
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  const handleJustificationStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/justifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        showAlert('Státusz frissítve!', 'success')
        loadJustifications()
        setShowJustificationModal(false)
        loadAttendance()
      } else {
        showAlert('Frissítés sikertelen', 'error')
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  const openAttendanceModal = async (lesson: any) => {
    setSelectedLesson(lesson)


    if (lesson.id) {

      setAttendanceForm({
        topic: lesson.topic || '',
        students: lesson.students.map((s: any) => ({ ...s }))
      })
      setShowAttendanceModal(true)
      return
    }


    const lessonId = `${lesson.Day}_${lesson.StartTime}_${lesson.Class}`
    const existingRecord = attendance.find(record =>
      record.lessonId === lessonId &&
      record.date === selectedDate.toISOString().split('T')[0]
    )

    if (existingRecord) {
      alert('Ehhez az órához már rögzítettél mulasztásokat!')
      return
    }


    const classStudents = allUsers.filter(user =>
      (user.role === 'student' || user.role === 'dj') && user.class === lesson.Class
    )

    const studentsWithAttendance = classStudents.map(student => ({
      studentId: student.id || student.email,
      studentName: student.fullName || student.name,
      present: true,
      excused: false
    }))

    setAttendanceForm({ topic: '', students: studentsWithAttendance })
    setShowAttendanceModal(true)
  }



  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {

      const imageUrl = await uploadToCloudinary(file)


      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentUser?.id,
          profileImage: imageUrl
        }),
      })

      if (response.ok) {

        setCurrentUser(prev => prev ? { ...prev, profileImage: imageUrl } : null)
        showAlert('Profilkép sikeresen frissítve!', 'success')
      } else {
        throw new Error('Failed to update user profile')
      }
    } catch (error) {
      console.error('Profile upload error:', error)
      showAlert('Hiba a profilkép feltöltése során', 'error')
    }
  }

  const handleClassGradeSave = async (grades: { studentName: string; grade: string }[], title: string, description: string) => {
    try {
      for (const gradeData of grades) {
        await fetch('/api/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: gradeData.studentName,
            studentClass: selectedClass,
            subject: currentUser?.subject || 'Egyéb',
            grade: gradeData.grade,
            title: title,
            description: description,
            teacherName: currentUser?.fullName || currentUser?.name
          })
        })
      }
      showAlert(`${grades.length} jegy sikeresen rögzítve!`, 'success')
      setShowClassGradeModal(false)
      loadGrades(currentUser)
    } catch (error) {
      showAlert('Hiba történt a jegyek rögzítése során', 'error')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen transition-colors pb-20">
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-bold text-sm sm:text-lg">L</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gradient">Luminé</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDarkMode = !darkMode
                  setDarkMode(newDarkMode)
                  document.documentElement.classList.toggle('dark', newDarkMode)
                  if (cookieConsent) {
                    localStorage.setItem('darkMode', newDarkMode.toString())
                  }
                }}
                className="rounded-full hover:bg-white/10 w-8 h-8 sm:w-10 sm:h-10"
              >
                <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
              </Button>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  {currentUser?.name || currentUser?.fullName || user.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {userRole === 'dj' && 'DJ'}
                  {userRole === 'teacher' && 'Tanár'}
                  {userRole === 'admin' && 'Admin'}
                  {userRole === 'student' && 'Diák'}
                </span>
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout} className="rounded-full shadow-md text-xs sm:text-sm px-2 sm:px-4">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kilépés</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-8">
        <Tabs defaultValue="dashboard" className="w-full">

          <TabsList className="hidden md:flex overflow-x-auto w-full glass p-2 rounded-xl gap-1">
            <TabsTrigger value="dashboard" className="text-sm whitespace-nowrap px-4">Főoldal</TabsTrigger>
            {userRole !== 'admin' && <TabsTrigger value="schedule" className="text-sm whitespace-nowrap px-4">Órarend</TabsTrigger>}
            {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="grades" className="text-sm whitespace-nowrap px-4">Jegyek</TabsTrigger>}
            {userRole === 'teacher' && <TabsTrigger value="teacher-grades" className="text-sm whitespace-nowrap px-4">Jegyek</TabsTrigger>}
            {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="absences" className="text-sm whitespace-nowrap px-4">Mulasztások</TabsTrigger>}
            {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="homework" className="text-sm whitespace-nowrap px-4">Házi</TabsTrigger>}
            {userRole === 'teacher' && <TabsTrigger value="teacher-absences" className="text-sm whitespace-nowrap px-4">Mulasztások</TabsTrigger>}
            {userRole === 'teacher' && <TabsTrigger value="teacher-homework" className="text-sm whitespace-nowrap px-4">Házi</TabsTrigger>}
            {(currentUser?.role === 'homeroom_teacher') && <TabsTrigger value="class-excuses" className="text-sm whitespace-nowrap px-4">Igazolások</TabsTrigger>}
            {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="student-excuses" className="text-sm whitespace-nowrap px-4">Igazolás</TabsTrigger>}
            {userRole !== 'admin' && <TabsTrigger value="radio" className="text-sm whitespace-nowrap px-4">Rádió</TabsTrigger>}
            <TabsTrigger value="chat" className="text-sm whitespace-nowrap px-4">Üzenőfal</TabsTrigger>
            {userRole !== 'teacher' && userRole !== 'admin' && <TabsTrigger value="qr" className="text-sm whitespace-nowrap px-4">QR</TabsTrigger>}
            {userRole === 'admin' && <TabsTrigger value="admin-schedule" className="text-sm whitespace-nowrap px-4">Órarend</TabsTrigger>}
            {userRole === 'admin' && <TabsTrigger value="admin-grades" className="text-sm whitespace-nowrap px-4">Jegyek</TabsTrigger>}
            {userRole === 'admin' && <TabsTrigger value="admin-users" className="text-sm whitespace-nowrap px-4">Userek</TabsTrigger>}
            <TabsTrigger value="profile" className="text-sm whitespace-nowrap px-4">Profil</TabsTrigger>
          </TabsList>


          <div className="md:hidden mb-4">
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Menü
              </span>
              <svg className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>


          {mobileMenuOpen && (
            <div className="md:hidden mb-4 glass-card overflow-hidden">
              <TabsList className="flex flex-col w-full h-auto bg-transparent gap-0 p-0">
                <TabsTrigger value="dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">🏠 Főoldal</TabsTrigger>
                {userRole !== 'admin' && <TabsTrigger value="schedule" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📅 Órarend</TabsTrigger>}
                {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="grades" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📊 Jegyek</TabsTrigger>}
                {userRole === 'teacher' && <TabsTrigger value="teacher-grades" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📊 Jegyek</TabsTrigger>}
                {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="absences" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📋 Mulasztások</TabsTrigger>}
                {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="homework" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📝 Házi</TabsTrigger>}
                {userRole === 'teacher' && <TabsTrigger value="teacher-absences" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📋 Mulasztások</TabsTrigger>}
                {userRole === 'teacher' && <TabsTrigger value="teacher-homework" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📝 Házi</TabsTrigger>}
                {(currentUser?.role === 'homeroom_teacher') && <TabsTrigger value="class-excuses" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">✅ Igazolások</TabsTrigger>}
                {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="student-excuses" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">✅ Igazolás</TabsTrigger>}
                {userRole !== 'admin' && <TabsTrigger value="radio" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">🎵 Rádió</TabsTrigger>}
                <TabsTrigger value="chat" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">💬 Üzenőfal</TabsTrigger>
                {userRole !== 'teacher' && userRole !== 'admin' && <TabsTrigger value="qr" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📱 QR</TabsTrigger>}
                {userRole === 'admin' && <TabsTrigger value="admin-schedule" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📅 Órarend</TabsTrigger>}
                {userRole === 'admin' && <TabsTrigger value="admin-grades" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">📊 Jegyek</TabsTrigger>}
                {userRole === 'admin' && <TabsTrigger value="admin-users" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors">👥 Userek</TabsTrigger>}
                <TabsTrigger value="profile" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none hover:bg-white/5 transition-colors">👤 Profil</TabsTrigger>
              </TabsList>
            </div>
          )}

          <TabsContent value="dashboard" className="space-y-6">
            {userRole === 'admin' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Tanárok
                    </CardTitle>
                    <Input
                      placeholder="Keresés név vagy email alapján..."
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      className="mt-2"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allUsers
                        .filter(user => user.role === 'teacher' || user.role === 'homeroom_teacher')
                        .filter(user =>
                          !teacherSearch ||
                          (user.fullName || user.name || '').toLowerCase().includes(teacherSearch.toLowerCase()) ||
                          (user.email || '').toLowerCase().includes(teacherSearch.toLowerCase())
                        )
                        .sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''))
                        .slice(0, 5)
                        .map((teacher, index) => (
                          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-sm transition-shadow">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{teacher.fullName || teacher.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.email}</p>
                            {teacher.subject && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Tantárgy: {teacher.subject}</p>}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                      Diákok
                    </CardTitle>
                    <Input
                      placeholder="Keresés név vagy email alapján..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="mt-2"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allUsers
                        .filter(user => user.role === 'student' || user.role === 'dj')
                        .filter(user =>
                          !studentSearch ||
                          (user.fullName || user.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                          (user.email || '').toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''))
                        .slice(0, 5)
                        .map((student, index) => (
                          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{student.fullName || student.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                                {student.class && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Osztály: {student.class}</p>}
                              </div>
                              {student.role === 'dj' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">DJ</Badge>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm sm:text-lg">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                      <span className="text-xs sm:text-base">Mai órák - {new Date().toLocaleDateString('hu-HU', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table className="text-xs sm:text-sm">
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
                          const dayLessons = lessons.filter(lesson => lesson.Day === dayMap[today.toLowerCase() as keyof typeof dayMap])
                          const filledLessons = fillEmptyPeriods(dayLessons)

                          return filledLessons.map((lesson, index) => (
                            <TableRow key={index}>
                              <TableCell>{lesson.StartTime || 'N/A'}</TableCell>
                              <TableCell className={
                                lesson.status === 'cancelled' ? 'text-red-500' :
                                  lesson.status === 'substituted' ? 'text-yellow-600' :
                                    lesson.status === 'added' ? 'text-green-600' :
                                      lesson.status === 'free' ? 'text-gray-400 italic' : ''
                              }>
                                {lesson.Subject || 'N/A'}
                                {lesson.status === 'cancelled' && ' (Elmaradt)'}
                                {lesson.status === 'substituted' && ' (Helyettesítés)'}
                                {lesson.status === 'added' && ' (Új óra)'}
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

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm sm:text-lg">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                      <span className="text-xs sm:text-base">{userRole === 'teacher' ? 'Általam adott jegyek' : 'Legutóbbi jegyek'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table className="text-xs sm:text-sm">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tantárgy</TableHead>
                          {userRole === 'teacher' && <TableHead>Diák</TableHead>}
                          {userRole === 'teacher' && <TableHead>Osztály</TableHead>}
                          <TableHead>Jegy</TableHead>
                          <TableHead>Dátum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          let displayGrades = grades
                          if (userRole === 'teacher') {
                            const teacherName = currentUser?.fullName || currentUser?.name
                            displayGrades = grades.filter(grade => grade.teacherName === teacherName)
                          }
                          return displayGrades.slice(0, 5).map((grade, index) => (
                            <TableRow key={index}>
                              <TableCell>{grade.subject || 'N/A'}</TableCell>
                              {userRole === 'teacher' && <TableCell>{grade.studentName || 'N/A'}</TableCell>}
                              {userRole === 'teacher' && <TableCell>{grade.studentClass || 'N/A'}</TableCell>}
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-white ${(grade.grade || 0) >= 4 ? 'bg-green-500' :
                                  (grade.grade || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}>
                                  {grade.grade || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(grade.date).toLocaleDateString('hu-HU')}</TableCell>
                            </TableRow>
                          ))
                        })()}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-3 sm:space-y-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-sm sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Órarend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="mb-3 sm:mb-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-4 gap-1 sm:gap-2">
                    <button
                      onClick={() => setCurrentWeek(currentWeek - 1)}
                      className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Előző hét</span>
                      <span className="sm:hidden">←</span>
                    </button>
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                      {['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'].map((day, index) => {
                        const dayDate = new Date()
                        dayDate.setDate(dayDate.getDate() - dayDate.getDay() + 1 + index + (currentWeek * 7))
                        const isSelected = selectedDate.toDateString() === dayDate.toDateString()
                        return (
                          <button
                            key={day}
                            onClick={() => setSelectedDate(dayDate)}
                            className={`px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm font-medium whitespace-nowrap ${isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                          >
                            <div className="text-xs sm:text-sm">{day.slice(0, 2)}<span className="hidden sm:inline">{day.slice(2)}</span></div>
                            <div className="text-xs">{dayDate.getDate()}</div>
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentWeek(currentWeek + 1)}
                      className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Következő hét</span>
                      <span className="sm:hidden">→</span>
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-4">
                  <h3 className="font-semibold text-center mb-2 sm:mb-3 text-gray-900 dark:text-white text-xs sm:text-base">
                    {selectedDate.toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="space-y-1 sm:space-y-2 relative">

                    {(() => {
                      const selectedDay = selectedDate.toLocaleDateString('hu-HU', { weekday: 'long' })
                      const dayMap = { 'hétfő': 'Hétfő', 'kedd': 'Kedd', 'szerda': 'Szerda', 'csütörtök': 'Csütörtök', 'péntek': 'Péntek' }
                      const dayLessons = lessons.filter(lesson => lesson.Day === dayMap[selectedDay.toLowerCase()])
                      const filledLessons = fillEmptyPeriods(dayLessons)

                      return filledLessons.map((lesson, index) => {
                        const isCurrentLesson = (() => {
                          const now = currentTime
                          const today = now.toLocaleDateString('hu-HU', { weekday: 'long' })
                          const selectedDay = selectedDate.toLocaleDateString('hu-HU', { weekday: 'long' })

                          if (today.toLowerCase() !== selectedDay.toLowerCase()) return false

                          const [hours, minutes] = lesson.StartTime.split(':').map(Number)
                          const lessonStart = new Date(now)
                          lessonStart.setHours(hours, minutes, 0, 0)
                          const lessonEnd = new Date(lessonStart)
                          lessonEnd.setMinutes(lessonEnd.getMinutes() + 45)

                          return now >= lessonStart && now <= lessonEnd
                        })()

                        const lessonId = `${lesson.Day}_${lesson.StartTime}_${lesson.Class}`
                        const attendanceRecord = attendance.find(record =>
                          record.lessonId === lessonId &&
                          record.date === selectedDate.toISOString().split('T')[0]
                        )

                        return (
                          <div
                            key={index}
                            className={`rounded p-3 text-sm relative group ${lesson.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900 border-l-4 border-red-500' :
                              lesson.status === 'substituted' ? 'bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500' :
                                lesson.status === 'free' ? 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300' :
                                  isCurrentLesson ? 'bg-green-100 dark:bg-green-900 border-l-4 border-green-500' :
                                    'bg-white dark:bg-gray-700'
                              } ${userRole === 'teacher' && lesson.status !== 'free' ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                              }`}
                            onClick={() => {
                              if (userRole === 'teacher' && lesson.status !== 'free') {
                                openAttendanceModal(lesson)
                              }
                            }}
                            title={attendanceRecord?.topic ? `Téma: ${attendanceRecord.topic}` : ''}
                          >
                            {attendanceRecord?.topic && (
                              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                Téma: {attendanceRecord.topic}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            )}
                            {isCurrentLesson && (
                              <div className="absolute top-2 right-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              </div>
                            )}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-blue-600 dark:text-blue-400">{lesson.StartTime}</div>
                                <div className={`font-semibold ${lesson.status === 'cancelled' ? 'text-red-700 dark:text-red-300' :
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
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const lessonId = `${lesson.Day}_${lesson.StartTime}_${lesson.Class}`
                                  const lessonHomework = homework.filter(hw => hw.lessonId === lessonId)
                                  return lessonHomework.length > 0 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedHomework(lessonHomework[0])
                                        setShowHomeworkModal(true)
                                      }}
                                      className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-orange-600 transition-colors"
                                      title="Házi feladat"
                                    >
                                      📝
                                    </button>
                                  )
                                })()}
                                {lesson.note && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                    {lesson.note}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {(userRole === 'student' || userRole === 'dj') && (
            <TabsContent value="grades" className="space-y-3 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="flex items-center text-sm sm:text-lg">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Átlagok
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {grades.length > 0 ? (grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length).toFixed(2) : '0.00'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Összátlag</div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowChartModal(true)}>
                        <h4 className="font-medium mb-3 text-center">Tantárgyak átlagai (kattints a nagy nézethez)</h4>
                        <div className="relative h-48">
                          <svg viewBox="0 0 200 120" className="w-full h-full">
                            {Object.entries(
                              grades.reduce((acc, grade) => {
                                const subject = grade.subject || 'Egyéb'
                                if (!acc[subject]) acc[subject] = []
                                acc[subject].push(grade)
                                return acc
                              }, {} as Record<string, any[]>)
                            ).map(([subject, subjectGrades]: [string, any[]], index: number) => {
                              const average = subjectGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / subjectGrades.length
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
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedSubject === null
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                }`}
                            >
                              Összes
                            </button>
                            {Object.keys(
                              grades.reduce((acc, grade) => {
                                const subject = grade.subject || 'Egyéb'
                                acc[subject] = true
                                return acc
                              }, {} as Record<string, boolean>)
                            ).map(subject => (
                              <button
                                key={subject}
                                onClick={() => setSelectedSubject(subject)}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedSubject === subject
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
                              const subject = grade.subject || 'Egyéb'
                              if (!acc[subject]) acc[subject] = []
                              acc[subject].push(grade)
                              return acc
                            }, {} as Record<string, any[]>)
                          ).filter(([subject]) => selectedSubject === null || subject === selectedSubject).map(([subject, subjectGrades]: [string, any[]]) => {
                            const average = subjectGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / subjectGrades.length
                            return (
                              <div key={subject} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-sm text-gray-900 dark:text-white truncate block">{subject}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{subjectGrades.length} jegy</span>
                                </div>
                                <div className="flex items-center gap-3 ml-4">
                                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${average >= 4 ? 'bg-green-500' : average >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                      style={{ width: `${(average / 5) * 100}%` }}
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
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-lg">Jegyek részletesen</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-6">
                      {Object.entries(
                        grades.reduce((acc, grade) => {
                          const subject = grade.subject || 'Egyéb'
                          if (!acc[subject]) acc[subject] = []
                          acc[subject].push(grade)
                          return acc
                        }, {} as Record<string, any[]>)
                      ).filter(([subject]) => selectedSubject === null || subject === selectedSubject).map(([subject, subjectGrades]: [string, any[]]) => {
                        const average = subjectGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / subjectGrades.length
                        return (
                          <div key={subject} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{subject}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{subjectGrades.length} jegy</span>
                                <span className={`px-3 py-1 rounded-full text-white font-bold text-sm ${average >= 4 ? 'bg-green-500' : average >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}>
                                  Átlag: {average.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-3">
                              {subjectGrades.map((grade, index) => (
                                <div key={index} className="group relative flex flex-col items-center">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${(grade.grade || 0) >= 4 ? 'bg-green-500 hover:bg-green-600' :
                                    (grade.grade || 0) >= 3 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'
                                    }`}>
                                    {grade.grade || 'N/A'}
                                  </div>
                                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                    <div className="font-medium">{new Date(grade.date).toLocaleDateString('hu-HU')}</div>
                                    <div className="text-gray-300">{grade.title || 'Jegy'}</div>
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
            </TabsContent>
          )}

          <TabsContent value="teacher-grades" className="space-y-3 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="lg:col-span-1">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Jegy beírása</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Osztály</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                      >
                        <option value="">Válassz osztályt</option>
                        {(() => {
                          const teacherName = currentUser?.fullName || currentUser?.name
                          const allLessonsForProfile = (window as any).allLessonsForProfile || []
                          let teacherLessons = allLessonsForProfile.filter((lesson: any) =>
                            lesson.Teacher === teacherName
                          )
                          if (teacherName === 'Nagy Péter') {
                            teacherLessons = teacherLessons.filter((l: any) => l.Class !== '12.B')
                          }
                          const teacherClasses = [...new Set(teacherLessons.map((lesson: any) => lesson.Class))].filter(Boolean)
                          return teacherClasses.map(className => (
                            <option key={className} value={className}>{className}</option>
                          ))
                        })()}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Diák</label>
                      <select
                        value={gradeForm.student}
                        onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                      >
                        <option value="">Válassz diákot</option>
                        {(() => {
                          const teacherName = currentUser?.fullName || currentUser?.name
                          const allLessonsForProfile = (window as any).allLessonsForProfile || []
                          let teacherLessons = allLessonsForProfile.filter((lesson: any) =>
                            lesson.Teacher === teacherName
                          )
                          if (teacherName === 'Nagy Péter') {
                            teacherLessons = teacherLessons.filter((l: any) => l.Class !== '12.B')
                          }
                          const teacherClasses = [...new Set(teacherLessons.map((lesson: any) => lesson.Class))].filter(Boolean)
                          return allUsers.filter(user =>
                            (user.role === 'student' || user.role === 'dj') &&
                            teacherClasses.includes(user.class) &&
                            (!selectedClass || user.class === selectedClass)
                          ).map((student, index) => (
                            <option key={index} value={student.fullName || student.name}>
                              {student.fullName || student.name}
                            </option>
                          ))
                        })()}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Jegy</label>
                        <select
                          value={gradeForm.grade}
                          onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                          <option value="">Jegy</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Típus</label>
                        <select
                          value={gradeForm.title}
                          onChange={(e) => setGradeForm({ ...gradeForm, title: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                          <option value="">Típus</option>
                          <option value="Dolgozat">Dolgozat</option>
                          <option value="Felelet">Felelet</option>
                          <option value="Házi dolgozat">Házi dolgozat</option>
                          <option value="Beadandó">Beadandó</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Megjegyzés</label>
                      <textarea
                        value={gradeForm.description}
                        onChange={(e) => setGradeForm({ ...gradeForm, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        rows={2}
                        placeholder="Opcionális megjegyzés"
                      />
                    </div>
                    <Button
                      onClick={async () => {
                        if (gradeForm.student && gradeForm.grade && gradeForm.title) {
                          try {
                            const response = await fetch('/api/grades', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                studentName: gradeForm.student,
                                studentClass: selectedClass,
                                subject: currentUser?.subject || 'Egyéb',
                                grade: gradeForm.grade,
                                title: gradeForm.title,
                                description: gradeForm.description,
                                teacherName: currentUser?.fullName || currentUser?.name
                              })
                            })
                            if (response.ok) {
                              alert(`Jegy rögzítve: ${gradeForm.student} - ${gradeForm.grade} (${gradeForm.title})`)
                              setGradeForm({ student: '', grade: '', title: '', description: '' })
                              loadGrades(currentUser)
                            } else {
                              alert('Hiba a jegy rögzítése során')
                            }
                          } catch (error) {
                            alert('Hiba történt')
                          }
                        } else {
                          alert('Töltsd ki az összes kötelező mezőt!')
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Jegy rögzítése
                    </Button>
                    <Button
                      onClick={() => {
                        if (!selectedClass) {
                          alert('Először válassz osztályt!')
                          return
                        }
                        setShowClassGradeModal(true)
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 mt-2"
                      size="sm"
                    >
                      📝 Osztály jegyírás
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Diákjaim jegyei
                      <div className="flex gap-2">
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                          <option value="">Összes osztály</option>
                          {(() => {
                            const teacherName = currentUser?.fullName || currentUser?.name
                            const allLessonsForProfile = (window as any).allLessonsForProfile || []
                            let teacherLessons = allLessonsForProfile.filter((lesson: any) =>
                              lesson.Teacher === teacherName
                            )
                            if (teacherName === 'Nagy Péter') {
                              teacherLessons = teacherLessons.filter((l: any) => l.Class !== '12.B')
                            }
                            const teacherClasses = [...new Set(teacherLessons.map((lesson: any) => lesson.Class))].filter(Boolean)
                            return teacherClasses.map(className => (
                              <option key={className} value={className}>{className}</option>
                            ))
                          })()}
                        </select>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const teacherName = currentUser?.fullName || currentUser?.name
                      const allLessonsForProfile = (window as any).allLessonsForProfile || []
                      let teacherLessons = allLessonsForProfile.filter((lesson: any) =>
                        lesson.Teacher === teacherName
                      )
                      if (teacherName === 'Nagy Péter') {
                        teacherLessons = teacherLessons.filter((l: any) => l.Class !== '12.B')
                      }
                      const teacherClasses = [...new Set(teacherLessons.map((lesson: any) => lesson.Class))].filter(Boolean)

                      const studentsInClasses = allUsers.filter(user =>
                        (user.role === 'student' || user.role === 'dj') &&
                        teacherClasses.includes(user.class) &&
                        (!selectedClass || user.class === selectedClass)
                      )

                      if (studentsInClasses.length === 0) {
                        return <div className="text-center py-8 text-gray-500">Nincs diák az osztályaidban.</div>
                      }

                      const teacherGrades = grades.filter(grade => grade.teacherName === teacherName)

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {studentsInClasses.map(student => {
                            const studentGrades = teacherGrades.filter(grade => grade.studentName === (student.fullName || student.name))
                            const average = studentGrades.length > 0 ?
                              (studentGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / studentGrades.length).toFixed(2) : '0.00'

                            return (
                              <div key={student.email} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{student.fullName || student.name}</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{student.class}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${parseFloat(average) >= 4 ? 'text-green-600' :
                                      parseFloat(average) >= 3 ? 'text-yellow-600' : 'text-red-600'
                                      }`}>
                                      {average}
                                    </div>
                                    <div className="text-xs text-gray-500">{studentGrades.length} jegy</div>
                                  </div>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {studentGrades.length === 0 ? (
                                    <div className="text-center text-xs text-gray-500 py-2">Nincs jegy</div>
                                  ) : (
                                    studentGrades.map(grade => (
                                      <div key={grade.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded text-xs">
                                        <div className="flex-1 min-w-0">
                                          <span className="font-medium truncate block">{grade.title}</span>
                                          <span className="text-gray-500">{new Date(grade.date).toLocaleDateString('hu-HU')}</span>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                          <span className={`px-2 py-1 rounded text-white font-bold text-xs ${(grade.grade || 0) >= 4 ? 'bg-green-500' :
                                            (grade.grade || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}>
                                            {grade.grade}
                                          </span>
                                          <button
                                            onClick={async () => {
                                              if (confirm(`Biztosan törlöd ezt a jegyet?\n\n${grade.studentName} - ${grade.title}: ${grade.grade}`)) {
                                                try {
                                                  const response = await fetch(`/api/grades?id=${grade.id}`, {
                                                    method: 'DELETE'
                                                  })
                                                  if (response.ok) {
                                                    alert('Jegy törölve!')
                                                    loadGrades(currentUser)
                                                  } else {
                                                    alert('Hiba a törlés során')
                                                  }
                                                } catch (error) {
                                                  alert('Hiba történt')
                                                }
                                              }
                                            }}
                                            className="px-1 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 w-6 h-6 flex items-center justify-center"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="radio" className="space-y-3 sm:space-y-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-sm sm:text-lg">
                  <Music className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Zene beküldése
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <Input
                  placeholder="Zene URL (Spotify, YouTube, stb.)"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  className="text-sm"
                />
                <Button onClick={submitMusicRequest} className="w-full text-sm">
                  Zene beküldése
                </Button>
              </CardContent>
            </Card>

            <div className="glass-panel p-8 rounded-lg">
              <div className="space-y-6">
                {musicRequests.map((request) => (
                  <div key={request.id} className="glass-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
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

          <TabsContent value="chat" className="space-y-3 sm:space-y-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-sm sm:text-lg">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Üzenőfal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-2 sm:space-y-4 max-h-60 sm:max-h-96 overflow-y-auto mb-3 sm:mb-4 text-xs sm:text-sm">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm">{message.userName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString('hu-HU')}
                          </span>
                          {userRole === 'admin' && (
                            <button
                              onClick={async () => {
                                if (confirm('Biztosan törlöd ezt az üzenetet?')) {
                                  try {
                                    const response = await fetch(`/api/chat?id=${message.id}`, {
                                      method: 'DELETE'
                                    })
                                    if (response.ok) {
                                      loadChatMessages()
                                    }
                                  } catch (error) {
                                    console.error('Failed to delete message:', error)
                                  }
                                }
                              }}
                              className="bg-red-500 text-white px-1 py-0.5 rounded text-xs hover:bg-red-600"
                            >
                              Törlés
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1">{message.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Textarea
                    placeholder="Írj egy üzenetet..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 text-sm"
                    rows={2}
                  />
                  <Button onClick={sendChatMessage} className="w-full sm:w-auto text-sm">Küldés</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-3 sm:space-y-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-sm sm:text-lg">
                  <QrCode className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  QR Kód belépéshez
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center p-3 sm:p-6">
                {qrCode ? (
                  <div className="space-y-3 sm:space-y-4">
                    <img src={qrCode} alt="QR Code" className="mx-auto w-48 sm:w-64" />
                    <p className="text-xs sm:text-sm text-gray-600">
                      Mutasd fel ezt a QR kódot a portásnál belépéskor
                    </p>
                    <Button onClick={generateUserQR} variant="outline" className="text-xs sm:text-sm">
                      Új QR kód
                    </Button>
                  </div>
                ) : (
                  <Skeleton className="h-64 w-64 mx-auto" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {userRole === 'admin' && (
            <TabsContent value="admin-schedule" className="space-y-3 sm:space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-6">
                <div className="xl:col-span-2">
                  <ScheduleManager allUsers={allUsers} availableClasses={availableClasses} />
                </div>

                <div className="space-y-6">


                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Gyors óra hozzáadás</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Nap</label>
                          <select
                            value={lessonForm.day}
                            onChange={(e) => setLessonForm({ ...lessonForm, day: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          >
                            <option value="">Nap</option>
                            <option value="Hétfő">Hétfő</option>
                            <option value="Kedd">Kedd</option>
                            <option value="Szerda">Szerda</option>
                            <option value="Csütörtök">Csütörtök</option>
                            <option value="Péntek">Péntek</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Időpont</label>
                          <select
                            value={lessonForm.startTime}
                            onChange={(e) => setLessonForm({ ...lessonForm, startTime: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          >
                            <option value="">Idő</option>
                            <option value="7:45">7:45</option>
                            <option value="8:45">8:45</option>
                            <option value="9:45">9:45</option>
                            <option value="10:45">10:45</option>
                            <option value="11:45">11:45</option>
                            <option value="12:45">12:45</option>
                            <option value="13:45">13:45</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Tantárgy</label>
                        <select
                          value={lessonForm.subject}
                          onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                          <option value="">Válassz tantárgyat</option>
                          <option value="Matematika">Matematika</option>
                          <option value="Magyar nyelv és irodalom">Magyar nyelv és irodalom</option>
                          <option value="Történelem">Történelem</option>
                          <option value="Angol nyelv">Angol nyelv</option>
                          <option value="Német nyelv">Német nyelv</option>
                          <option value="Biológia">Biológia</option>
                          <option value="Kémia">Kémia</option>
                          <option value="Fizika">Fizika</option>
                          <option value="Földrajz">Földrajz</option>
                          <option value="Informatika">Informatika</option>
                          <option value="Testnevelés">Testnevelés</option>
                          <option value="Rajz és vizuális kultúra">Rajz és vizuális kultúra</option>
                          <option value="Ének-zene">Ének-zene</option>
                          <option value="Etika">Etika</option>
                          <option value="Filozófia">Filozófia</option>
                          <option value="Pszichológia">Pszichológia</option>
                          <option value="Közgazdaságtan">Közgazdaságtan</option>
                          <option value="Jog">Jog</option>
                          <option value="Osztályfőnöki">Osztályfőnöki</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Tanár</label>
                        <select
                          value={lessonForm.teacher}
                          onChange={(e) => setLessonForm({ ...lessonForm, teacher: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                          <option value="">Válassz tanárt</option>
                          {allUsers.filter(user => user.role === 'teacher').map((teacher, index) => (
                            <option key={index} value={teacher.fullName || teacher.name}>
                              {teacher.fullName || teacher.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Osztály</label>
                          <select
                            value={lessonForm.class}
                            onChange={(e) => setLessonForm({ ...lessonForm, class: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          >
                            <option value="">Osztály</option>
                            {availableClasses.map(cls => (
                              <option key={cls.name} value={cls.name}>{cls.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Terem</label>
                          <input
                            type="text"
                            value={lessonForm.room}
                            onChange={(e) => setLessonForm({ ...lessonForm, room: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                            placeholder="101"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          if (lessonForm.day && lessonForm.startTime && lessonForm.subject && lessonForm.teacher && lessonForm.class) {
                            try {
                              const response = await fetch('/api/lessons', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  day: lessonForm.day,
                                  startTime: lessonForm.startTime,
                                  subject: lessonForm.subject,
                                  teacherName: lessonForm.teacher,
                                  className: lessonForm.class,
                                  room: lessonForm.room
                                })
                              })

                              if (response.ok) {
                                alert('Óra rögzítve!')
                                setLessonForm({ day: '', startTime: '', subject: '', teacher: '', class: '', room: '' })
                                loadLessons(currentUser)
                              } else {
                                const error = await response.json()
                                alert(`Hiba: ${error.error || 'Ismeretlen hiba'}`)
                              }
                            } catch (error) {
                              alert('Hiba történt')
                            }
                          } else {
                            alert('Töltsd ki az összes kötelező mezőt!')
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        Óra rögzítése
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {userRole === 'admin' && (
            <TabsContent value="admin-grades" className="space-y-3 sm:space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg">Jegyek kezelése</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Osztály szűrő</label>
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                          <option value="">Összes osztály</option>
                          {availableClasses.map(cls => (
                            <option key={cls.name} value={cls.name}>{cls.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Diák szűrő</label>
                        <select
                          value={gradeForm.student}
                          onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                          <option value="">Összes diák</option>
                          {allUsers.filter(user =>
                            (user.role === 'student' || user.role === 'dj') &&
                            (!selectedClass || user.class === selectedClass)
                          ).map((student, index) => (
                            <option key={index} value={student.fullName || student.name}>
                              {student.fullName || student.name} ({student.class})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {allUsers.filter(student => {
                        const matchesClass = !selectedClass || student.class === selectedClass
                        const matchesStudent = !gradeForm.student || (student.fullName || student.name) === gradeForm.student
                        return (student.role === 'student' || student.role === 'dj') && matchesClass && matchesStudent
                      }).map(student => {
                        const studentGrades = grades.filter(grade => grade.studentName === (student.fullName || student.name))
                        const average = studentGrades.length > 0 ?
                          (studentGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / studentGrades.length).toFixed(2) : '0.00'

                        return (
                          <div key={student.email} className="glass-card border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{student.fullName || student.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{student.class}</p>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${parseFloat(average) >= 4 ? 'text-green-600' :
                                  parseFloat(average) >= 3 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                  {average}
                                </div>
                                <div className="text-xs text-gray-500">{studentGrades.length} jegy</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {studentGrades.map(grade => (
                                <div key={grade.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                  <div>
                                    <span className="text-sm font-medium">{grade.title}</span>
                                    <span className="text-xs text-gray-500 ml-2">{new Date(grade.date).toLocaleDateString('hu-HU')}</span>
                                    <span className="text-xs text-gray-500 ml-2">({grade.teacherName})</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-white font-bold text-sm ${(grade.grade || 0) >= 4 ? 'bg-green-500' :
                                      (grade.grade || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}>
                                      {grade.grade}
                                    </span>
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Biztosan törlöd ezt a jegyet?\n\n${grade.studentName} - ${grade.title}: ${grade.grade}\nTanár: ${grade.teacherName}`)) {
                                          try {
                                            const response = await fetch(`/api/grades?id=${grade.id}`, {
                                              method: 'DELETE'
                                            })
                                            if (response.ok) {
                                              alert('Jegy törölve!')
                                              loadGrades(currentUser)
                                            } else {
                                              alert('Hiba a törlés során')
                                            }
                                          } catch (error) {
                                            alert('Hiba történt')
                                          }
                                        }
                                      }}
                                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {userRole === 'admin' && (
            <TabsContent value="admin-users" className="space-y-3 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-lg">Tanár regisztráció</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          placeholder="tanar@gszi.hu"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Jelszó</label>
                        <input
                          type="password"
                          value={teacherForm.password}
                          onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          placeholder="min. 6 karakter"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Teljes név</label>
                        <input
                          type="text"
                          value={teacherForm.fullName}
                          onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          placeholder="Tanár Név"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tantárgy</label>
                        <input
                          type="text"
                          value={teacherForm.subject}
                          onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          placeholder="pl. Matematika"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        if (teacherForm.email && teacherForm.password && teacherForm.fullName) {
                          try {
                            const response = await fetch('/api/auth/register', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                email: teacherForm.email,
                                password: teacherForm.password,
                                fullName: teacherForm.fullName,
                                role: 'teacher',
                                subject: teacherForm.subject,
                                classes: teacherForm.classes
                              })
                            })

                            if (response.ok) {
                              alert(`Tanár regisztrálva: ${teacherForm.fullName}`)
                              setTeacherForm({ email: '', password: '', fullName: '', subject: '', classes: [] })
                              loadAllUsers()
                            } else {
                              const error = await response.json()
                              alert(`Hiba: ${error.error || 'Ismeretlen hiba'}`)
                            }
                          } catch (error) {
                            alert('Hiba történt')
                          }
                        } else {
                          alert('Töltsd ki az összes kötelező mezőt!')
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Tanár regisztrálása
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-lg">Diák regisztráció</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          placeholder="diak@gszi.hu"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Jelszó</label>
                        <input
                          type="password"
                          value={studentForm.password}
                          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          placeholder="min. 6 karakter"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Teljes név</label>
                        <input
                          type="text"
                          value={studentForm.fullName}
                          onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          placeholder="Diák Név"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Oktatási azonosító</label>
                        <input
                          type="text"
                          value={studentForm.studentId}
                          onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                          placeholder="11 számjegy"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Osztály</label>
                      <select
                        value={studentForm.class}
                        onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                      >
                        <option value="">Válassz osztályt</option>
                        {availableClasses.map(cls => (
                          <option key={cls.name} value={cls.name}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={async () => {
                        if (studentForm.email && studentForm.password && studentForm.fullName && studentForm.studentId) {
                          try {
                            const response = await fetch('/api/auth/register', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                email: studentForm.email,
                                password: studentForm.password,
                                fullName: studentForm.fullName,
                                role: 'student',
                                studentId: studentForm.studentId,
                                class: studentForm.class || availableClasses[0]?.name
                              })
                            })

                            if (response.ok) {
                              alert(`Diák regisztrálva: ${studentForm.fullName}`)
                              setStudentForm({ email: '', password: '', fullName: '', studentId: '', class: '' })
                              loadAllUsers()
                            } else {
                              const error = await response.json()
                              alert(`Hiba: ${error.error || 'Ismeretlen hiba'}`)
                            }
                          } catch (error) {
                            alert('Hiba történt')
                          }
                        } else {
                          alert('Töltsd ki az összes kötelező mezőt!')
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Diák regisztrálása
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Felhasználók kezelése</CardTitle>
                  <div className="flex gap-4 mt-4">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                    >
                      <option value="">Összes osztály</option>
                      {availableClasses.map(cls => (
                        <option key={cls.name} value={cls.name}>{cls.name}</option>
                      ))}
                    </select>
                    <select
                      value={gradeForm.student}
                      onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                    >
                      <option value="">Összes szerepkör</option>
                      <option value="admin">Admin</option>
                      <option value="teacher">Tanár</option>
                      <option value="homeroom_teacher">Osztályfőnök</option>
                      <option value="student">Diák</option>
                      <option value="dj">DJ</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allUsers.filter(user => {
                      const matchesClass = !selectedClass || user.class === selectedClass
                      const matchesRole = !gradeForm.student || user.role === gradeForm.student ||
                        (gradeForm.student === 'teacher' && user.role === 'homeroom_teacher')
                      return matchesClass && matchesRole
                    })
                      .sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''))
                      .map((user, index) => (
                        <div key={user.id || index} className={`flex items-center justify-between p-4 rounded-lg ${user.id ? 'bg-primary/10 border border-primary/20' : 'glass-panel'
                          }`}>
                          <div>
                            <h3 className="font-semibold">{user.fullName || user.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            {user.studentId && <p className="text-xs text-gray-500 dark:text-gray-500">ID: {user.studentId}</p>}
                            {user.class && <p className="text-xs text-blue-600 dark:text-blue-400">Osztály: {user.class}</p>}
                            {user.subject && <p className="text-xs text-green-600 dark:text-green-400">Tantárgy: {user.subject}</p>}
                            <p className="text-xs text-gray-400">Firebase ID: {user.id || 'Nincs ID'}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'homeroom_teacher' ? 'bg-indigo-100 text-indigo-800' :
                                  user.role === 'dj' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                              }`}>
                              {user.role === 'admin' ? 'Admin' :
                                user.role === 'teacher' ? 'Tanár' :
                                  user.role === 'homeroom_teacher' ? 'Osztályfőnök' :
                                    user.role === 'dj' ? 'DJ' : 'Diák'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <select
                              value={user.class || ''}
                              onChange={async (e) => {
                                const newClass = e.target.value
                                if (user.id) {
                                  try {
                                    const response = await fetch('/api/users', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        id: user.id,
                                        class: newClass
                                      })
                                    })

                                    if (response.ok) {
                                      alert(`${user.fullName || user.name} áthelyezve: ${newClass}`)
                                      loadAllUsers()
                                    } else {
                                      const error = await response.json()
                                      alert(`Hiba: ${error.error || 'Ismeretlen hiba'}`)
                                    }
                                  } catch (error) {
                                    alert('Hiba történt a módosítás során')
                                  }
                                } else {
                                  alert('Csak dinamikus felhasználók módosíthatók')
                                }
                              }}
                              className="px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600"
                            >
                              <option value="">Osztály</option>
                              {availableClasses.map(cls => (
                                <option key={cls.name} value={cls.name}>{cls.name}</option>
                              ))}
                            </select>
                            <select
                              value={user.role}
                              onChange={async (e) => {
                                const newRole = e.target.value
                                if (user.id) {
                                  try {
                                    const response = await fetch('/api/users', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        id: user.id,
                                        role: newRole
                                      })
                                    })

                                    if (response.ok) {
                                      alert(`${user.fullName || user.name} szerepköre megváltoztatva: ${newRole}`)
                                      loadAllUsers()
                                    } else {
                                      const error = await response.json()
                                      alert(`Hiba: ${error.error || 'Ismeretlen hiba'}`)
                                    }
                                  } catch (error) {
                                    alert('Hiba történt a módosítás során')
                                  }
                                } else {
                                  alert('Csak dinamikus felhasználók módosíthatók')
                                }
                              }}
                              className="px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600"
                            >
                              <option value="student">Diák</option>
                              <option value="teacher">Tanár</option>
                              <option value="homeroom_teacher">Osztályfőnök</option>
                              <option value="dj">DJ</option>
                              <option value="admin">Admin</option>
                            </select>
                            {user.id && (
                              <button
                                onClick={async () => {
                                  console.log('Törlendő felhasználó ID:', user.id)
                                  if (confirm(`Biztosan törlöd ${user.fullName || user.name} felhasználót?\n\nID: ${user.id}\n\nEz véglegesen törli a felhasználót a Firebase adatbázisból is!`)) {
                                    try {
                                      const response = await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, {
                                        method: 'DELETE'
                                      })

                                      console.log('Törlés response status:', response.status)

                                      if (response.ok) {
                                        const result = await response.json()
                                        console.log('Törlés eredmény:', result)
                                        alert(`${user.fullName || user.name} felhasználó sikeresen törölve a Firebase adatbázisból`)
                                        loadAllUsers()
                                      } else {
                                        const error = await response.json()
                                        console.error('Törlés hiba:', error)
                                        alert(`Hiba: ${error.error || 'Törlés sikertelen'}`)
                                      }
                                    } catch (error) {
                                      console.error('Törlés exception:', error)
                                      alert('Hiba történt a törlés során')
                                    }
                                  }
                                }}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                Törlés
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(userRole === 'student' || userRole === 'dj') && (
            <TabsContent value="absences" className="space-y-3 sm:space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg">Mulasztásaim</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-4">
                    {(() => {
                      if (attendance.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <p>Nincsenek mulasztásaid.</p>
                          </div>
                        )
                      }


                      const absencesByDate = attendance.reduce((acc, record) => {
                        const date = record.date
                        if (!acc[date]) acc[date] = []
                        acc[date].push(record)
                        return acc
                      }, {} as Record<string, any[]>)

                      return Object.entries(absencesByDate)
                        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                        .map(([date, records]) => {
                          const isExpanded = expandedDates[date] || false

                          return (
                            <div key={date} className="border border-white/10 rounded-lg glass-panel">
                              <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedDates(prev => ({ ...prev, [date]: !isExpanded }))}
                              >
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(date).toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {records.length} hiányzás ezen a napon
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-red-500 text-white">
                                    {records.length}
                                  </Badge>
                                  <span className="text-gray-400">
                                    {isExpanded ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="border-t border-white/10 p-4 space-y-2">
                                  {records.map(record => {
                                    return (
                                      <div key={record.id} className={`border rounded-lg p-3 ${record.excused ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
                                        }`}>
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <h5 className="font-medium text-sm text-gray-900 dark:text-white">{record.subject}</h5>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                              {record.startTime}
                                            </p>
                                            {record.topic && (
                                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Téma: {record.topic}</p>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            {record.excused ? (
                                              <Badge className="bg-green-500 text-white text-xs">Igazolt</Badge>
                                            ) : (
                                              <Badge className="bg-red-500 text-white text-xs">Igazolatlan</Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(userRole === 'student' || userRole === 'dj') && (
            <TabsContent value="homework" className="space-y-3 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                {homework.map((hw) => {
                  const submission = homeworkSubmissions[hw.id]
                  const isOverdue = new Date(hw.dueDate) < new Date()
                  const isSubmitted = !!submission

                  return (
                    <Card key={hw.id} className={`border-l-4 ${isSubmitted ? 'border-green-500 bg-green-500/10' :
                      isOverdue ? 'border-red-500 bg-red-500/10' :
                        'border-blue-500 bg-blue-500/10'
                      }`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{hw.title}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {hw.subject} • {hw.teacherName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSubmitted && (
                              <Badge className="bg-green-500 text-white">Beküldve</Badge>
                            )}
                            {isOverdue && !isSubmitted && (
                              <Badge className="bg-red-500 text-white">Lejárt</Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedHomework(hw)
                                setShowHomeworkModal(true)
                              }}
                            >
                              📋 Részletek
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {hw.description.length > 100 ? hw.description.slice(0, 100) + '...' : hw.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Határidő: {new Date(hw.dueDate).toLocaleDateString('hu-HU')}
                          </span>
                          {!isSubmitted && !isOverdue && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedHomework(hw)
                                setShowSubmissionModal(true)
                              }}
                            >
                              📤 Beküldés
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {homework.length === 0 && (
                <Card className="border-none shadow-sm">
                  <CardContent className="text-center py-8 text-gray-500">
                    <p>Jelenleg nincsenek házi feladatok.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {userRole === 'teacher' && (
            <TabsContent value="teacher-absences" className="space-y-3 sm:space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg">Mulasztások kezelése</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Kattints egy órára az órarendben a mulasztások rögzítéséhez.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {

                      const attendanceByDate = attendance.reduce((acc, record) => {
                        const date = record.date
                        if (!acc[date]) acc[date] = []
                        acc[date].push(record)
                        return acc
                      }, {} as Record<string, any[]>)

                      return Object.entries(attendanceByDate)
                        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                        .map(([date, records]) => {
                          const isExpanded = expandedDates[date] || false

                          return (
                            <div key={date} className="border border-white/10 rounded-lg glass-panel">
                              <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedDates(prev => ({ ...prev, [date]: !isExpanded }))}
                              >
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(date).toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {records.length} óra rögzítve
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-blue-500 text-white">
                                    {records.length}
                                  </Badge>
                                  <span className="text-gray-400">
                                    {isExpanded ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="border-t border-white/10 p-4 space-y-3">
                                  {records.map(record => (
                                    <div key={record.id} className="border border-white/10 rounded-lg p-3 glass-panel">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h5 className="font-semibold text-gray-900 dark:text-white">{record.subject} - {record.className}</h5>
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {record.startTime}
                                          </p>
                                          {record.topic && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Téma: {record.topic}</p>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-gray-900 dark:text-white">
                                            Jelen: {record.students.filter((s: any) => s.present).length}/{record.students.length}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Hiányzó: {record.students.filter((s: any) => !s.present).length}
                                          </p>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedLesson(record)
                                              setAttendanceForm({
                                                topic: record.topic || '',
                                                students: record.students.map((s: any) => ({ ...s }))
                                              })
                                              setShowAttendanceModal(true)
                                            }}
                                            className="mt-2"
                                          >
                                            ✏️ Szerkesztés
                                          </Button>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {record.students.map((student: any) => (
                                          <div key={student.studentId} className={`text-xs p-2 rounded ${student.present ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                            student.excused ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                            {student.studentName}
                                            {!student.present && (
                                              <span className="block text-xs">
                                                {student.excused ? '(Igazolt)' : '(Hiányzó)'}
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })
                    })()}

                    {attendance.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Még nem rögzítettél mulasztásokat.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(currentUser?.role === 'homeroom_teacher') && (
            <TabsContent value="class-excuses" className="space-y-3 sm:space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg">Igazolások - {currentUser?.class}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-4">
                    {excuses.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Nincsenek igazolási kérelmek.</p>
                      </div>
                    )}
                    {excuses.map((excuse) => (
                      <div key={excuse.id} className={`border rounded-lg p-4 ${excuse.status === 'approved' ? 'border-green-500/30 bg-green-500/10' :
                        excuse.status === 'rejected' ? 'border-red-500/30 bg-red-500/10' :
                          'border-yellow-500/30 bg-yellow-500/10'
                        }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{excuse.studentName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Igazolás típusa: {excuse.excuseType}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Beküldve: {new Date(excuse.submittedAt).toLocaleDateString('hu-HU')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {excuse.status === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/excuses', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          id: excuse.id,
                                          status: 'approved',
                                          reviewedBy: currentUser?.fullName || currentUser?.name
                                        })
                                      })
                                      if (response.ok) {
                                        alert('Igazolás elfogadva!')
                                        loadExcuses()
                                      }
                                    } catch (error) {
                                      alert('Hiba történt')
                                    }
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Elfogad
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/excuses', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          id: excuse.id,
                                          status: 'rejected',
                                          reviewedBy: currentUser?.fullName || currentUser?.name
                                        })
                                      })
                                      if (response.ok) {
                                        alert('Igazolás elutasítva!')
                                        loadExcuses()
                                      }
                                    } catch (error) {
                                      alert('Hiba történt')
                                    }
                                  }}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  Elutasít
                                </Button>
                              </>
                            ) : (
                              <Badge className={excuse.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}>
                                {excuse.status === 'approved' ? 'Elfogadva' : 'Elutasítva'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {excuse.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            Indoklás: {excuse.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(userRole === 'student' || userRole === 'dj') && (
            <TabsContent value="student-excuses" className="space-y-3 sm:space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg">Igazolás beküldése</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">Válaszd ki a hiányzásokat, amelyeket igazolni szeretnél, és küldd be az osztályfőnöködnek jóváhagyásra.</p>
                    </div>
                    {(() => {
                      const unexcusedAbsences = attendance.filter(record => !record.excused)
                      if (unexcusedAbsences.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <p>Nincsenek igazolatlan hiányzásaid.</p>
                          </div>
                        )
                      }
                      return (
                        <div className="space-y-3">
                          {unexcusedAbsences.map(record => (
                            <div key={record.id} className="border border-white/10 rounded-lg p-3 glass-panel">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedAbsences.some(a => a.id === record.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAbsences([...selectedAbsences, record])
                                    } else {
                                      setSelectedAbsences(selectedAbsences.filter(a => a.id !== record.id))
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">{record.subject}</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(record.date).toLocaleDateString('hu-HU')} - {record.startTime}
                                  </div>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                    {selectedAbsences.length > 0 && (
                      <div className="space-y-3 border-t pt-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Igazolás típusa</label>
                          <select
                            value={excuseForm.excuseType}
                            onChange={(e) => setExcuseForm({ ...excuseForm, excuseType: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="">Válassz...</option>
                            <option value="Orvosi igazolás">Orvosi igazolás</option>
                            <option value="Szülői igazolás">Szülői igazolás</option>
                            <option value="Egyéb">Egyéb</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Indoklás</label>
                          <textarea
                            value={excuseForm.description}
                            onChange={(e) => setExcuseForm({ ...excuseForm, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                            rows={3}
                            placeholder="Írd le az indoklást..."
                          />
                        </div>
                        <Button
                          onClick={async () => {
                            if (!excuseForm.excuseType) {
                              alert('Válaszd ki az igazolás típusát!')
                              return
                            }
                            try {
                              const response = await fetch('/api/excuses', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  studentId: currentUser?.id || user?.uid,
                                  studentName: currentUser?.fullName || currentUser?.name,
                                  studentClass: currentUser?.class,
                                  absenceIds: selectedAbsences.map(a => a.id),
                                  excuseType: excuseForm.excuseType,
                                  description: excuseForm.description,
                                  submittedBy: currentUser?.fullName || currentUser?.name
                                })
                              })
                              if (response.ok) {
                                alert('Igazolás sikeresen beküldve!')
                                setSelectedAbsences([])
                                setExcuseForm({ absenceIds: [], excuseType: '', description: '' })
                                loadExcuses()
                              }
                            } catch (error) {
                              alert('Hiba történt')
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Igazolás beküldése ({selectedAbsences.length} hiányzás)
                        </Button>
                      </div>
                    )}
                    <div className="border-t pt-4 mt-6">
                      <h4 className="font-semibold mb-3">Beküldött igazolások</h4>
                      {excuses.length === 0 ? (
                        <p className="text-sm text-gray-500">Még nem küldted be igazolást.</p>
                      ) : (
                        <div className="space-y-2">
                          {excuses.map(excuse => (
                            <div key={excuse.id} className={`p-3 rounded-lg border ${excuse.status === 'approved' ? 'bg-green-500/10 border-green-500/30' :
                              excuse.status === 'rejected' ? 'bg-red-500/10 border-red-500/30' :
                                'bg-yellow-500/10 border-yellow-500/30'
                              }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-sm">{excuse.excuseType}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {excuse.absenceIds?.length || 0} hiányzás - {new Date(excuse.submittedAt).toLocaleDateString('hu-HU')}
                                  </div>
                                </div>
                                <Badge className={excuse.status === 'approved' ? 'bg-green-500' : excuse.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}>
                                  {excuse.status === 'approved' ? 'Elfogadva' : excuse.status === 'rejected' ? 'Elutasítva' : 'Függőben'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {userRole === 'teacher' && (
            <TabsContent value="teacher-homework" className="space-y-3 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                <Card className="lg:col-span-1 border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Házi feladat kiadása</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Osztály</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                      >
                        <option value="">Válassz osztályt</option>
                        {(() => {
                          const teacherName = currentUser?.fullName || currentUser?.name
                          const teacherLessons = lessons.filter(lesson => lesson.Teacher === teacherName)
                          const teacherClasses = [...new Set(teacherLessons.map(lesson => lesson.Class))]
                          return teacherClasses.map(className => (
                            <option key={className} value={className}>{className}</option>
                          ))
                        })()}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cím</label>
                      <input
                        type="text"
                        value={homeworkForm.title}
                        onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        placeholder="pl. Matematika feladatok"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Leírás</label>
                      <textarea
                        value={homeworkForm.description}
                        onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        rows={4}
                        placeholder="Részletes leírás a feladról..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Határidő</label>
                      <input
                        type="date"
                        value={homeworkForm.dueDate}
                        onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (!selectedClass) {
                          alert('Válassz osztályt!')
                          return
                        }
                        const dummyLesson = {
                          Subject: currentUser?.subject || 'Egyéb',
                          Class: selectedClass,
                          Day: 'Általános',
                          StartTime: '00:00'
                        }
                        createHomeworkForLesson(dummyLesson)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Házi feladat kiadása
                    </Button>
                  </CardContent>
                </Card>

                <div className="lg:col-span-2">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Kiadott házi feladatok</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {homework.map((hw) => (
                          <div key={hw.id} className="border border-white/10 rounded-lg p-4 glass-panel">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{hw.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {hw.className} • Határidő: {new Date(hw.dueDate).toLocaleDateString('hu-HU')}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/homework-submissions?homeworkId=${hw.id}`)
                                    if (response.ok) {
                                      const submissions = await response.json()
                                      setSelectedHomework({ ...hw, submissions })
                                      setShowHomeworkModal(true)
                                    }
                                  } catch (error) {
                                    alert('Hiba a beadások betöltése során')
                                  }
                                }}
                              >
                                📄 Beadások ({hw.submissionCount || 0})
                              </Button>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {hw.description.length > 150 ? hw.description.slice(0, 150) + '...' : hw.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      {homework.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Még nem adtál ki házi feladatot.</p>
                        </div>
                      )}
                    </CardContent>

                  </Card>
                </div>
              </div>
            </TabsContent>
          )}


          <TabsContent value="student-excuses" className="space-y-6">
            <Card className="glass-card border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Hiányzások összesen</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{attendance.length} / 250 óra</h3>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${attendance.length > 250 ? 'text-red-500' : attendance.length > 200 ? 'text-orange-500' : 'text-green-500'}`}>
                      {((attendance.length / 250) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${attendance.length > 250 ? 'bg-red-500' : attendance.length > 200 ? 'bg-orange-500' : 'bg-gradient-to-r from-green-400 to-blue-500'}`}
                    style={{ width: `${Math.min((attendance.length / 250) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Ha eléred a 250 órát, osztályozó vizsgát kell tenned minden tárgyból.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="p-2 bg-green-500/20 rounded-lg">✅</span>
                  Igazolás Benyújtása
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dátum (Egész nap)</label>
                    <Input
                      type="date"
                      value={justificationForm.date}
                      onChange={e => setJustificationForm({ ...justificationForm, date: e.target.value })}
                      className="bg-white/50 dark:bg-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Orvosi Igazolás / Bizonyíték (Kép)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            try {
                              const url = await uploadToCloudinary(file)
                              setJustificationForm({ ...justificationForm, proofUrl: url })
                              showAlert('Kép feltöltve!', 'success')
                            } catch (err) {
                              showAlert('Képfeltöltés sikertelen', 'error')
                            }
                          }
                        }}
                        className="bg-white/50 dark:bg-black/20"
                      />
                      {justificationForm.proofUrl && <span className="text-green-500">✓</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Indoklás</label>
                  <Textarea
                    placeholder="Kérlek írd le a hiányzás okát..."
                    value={justificationForm.reason}
                    onChange={e => setJustificationForm({ ...justificationForm, reason: e.target.value })}
                    className="bg-white/50 dark:bg-black/20 min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSubmitJustification} className="bg-green-600 hover:bg-green-700 text-white">
                    Beküldés
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Korábbi Kérelmek</h3>
              {justifications.length === 0 && <p className="text-gray-500">Még nincs benyújtott igazolásod.</p>}
              {justifications.map((just: any) => (
                <Card key={just.id} className="glass-card border-0 shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{new Date(just.date).toLocaleDateString('hu-HU')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{just.reason}</p>
                      {just.proofUrls?.length > 0 && (
                        <a href={just.proofUrls[0]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                          Melléklet megtekintése
                        </a>
                      )}
                    </div>
                    <div>
                      <Badge className={`${just.status === 'approved' ? 'bg-green-500' :
                        just.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                        } text-white`}>
                        {just.status === 'approved' ? 'Elfogadva' : just.status === 'rejected' ? 'Elutasítva' : 'Függőben'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="class-excuses" className="space-y-6">
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-white">Beérkezett Igazolások</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {justifications.filter((j: any) => j.status === 'pending').length === 0 && (
                    <p className="text-center text-gray-500 py-4">Nincs függőben lévő igazolás.</p>
                  )}
                  {justifications.filter((j: any) => j.status === 'pending').map((just: any) => (
                    <div key={just.id} className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg text-primary">{just.studentName}</span>
                          <Badge variant="outline" className="text-gray-400">{new Date(just.date).toLocaleDateString('hu-HU')}</Badge>
                        </div>
                        <p className="text-gray-300 mb-2">{just.reason}</p>
                        {just.proofUrls?.length > 0 && (
                          <div className="mb-2">
                            <img src={just.proofUrls[0]} alt="Proof" className="h-20 w-auto rounded border border-white/20 cursor-pointer" onClick={() => window.open(just.proofUrls[0], '_blank')} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-2">
                        <Button
                          onClick={() => handleJustificationStatusUpdate(just.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Elfogadás
                        </Button>
                        <Button
                          onClick={() => handleJustificationStatusUpdate(just.id, 'rejected')}
                          variant="destructive"
                        >
                          Elutasítás
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Elbírált Kérelmek Története</h3>
              <div className="space-y-2">
                {justifications.filter((j: any) => j.status !== 'pending').map((just: any) => (
                  <div key={just.id} className="glass-card p-3 rounded-lg flex justify-between items-center opacity-75">
                    <span>{just.studentName} - {new Date(just.date).toLocaleDateString('hu-HU')}</span>
                    <Badge className={`${just.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                      } text-white`}>
                      {just.status === 'approved' ? 'Elfogadva' : 'Elutasítva'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-3 sm:space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className={`relative overflow-hidden rounded-2xl shadow-xl ${currentUser?.role === 'admin' ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' :
                currentUser?.role === 'homeroom_teacher' ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700' :
                  currentUser?.role === 'teacher' ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700' :
                    currentUser?.role === 'dj' ? 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600' :
                      'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
                }`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative p-8 text-white">
                  <div className="flex items-center space-x-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold overflow-hidden border-4 border-white/30 shadow-2xl">
                        {currentUser?.profileImage ? (
                          <img
                            src={currentUser.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (currentUser?.name || currentUser?.fullName || user?.email || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer rounded-full hover:bg-black/60">
                        <Camera className="w-8 h-8 drop-shadow-lg" />
                        <span className="sr-only">Kép feltöltése</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{currentUser?.name || currentUser?.fullName || 'Felhasználó'}</h1>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${currentUser?.role === 'admin' ? 'bg-red-500/30 border border-red-300/50' :
                        currentUser?.role === 'homeroom_teacher' ? 'bg-purple-500/30 border border-purple-300/50' :
                          currentUser?.role === 'teacher' ? 'bg-indigo-500/30 border border-indigo-300/50' :
                            currentUser?.role === 'dj' ? 'bg-yellow-500/30 border border-yellow-300/50' :
                              'bg-blue-500/30 border border-blue-300/50'
                        }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${currentUser?.role === 'admin' ? 'bg-red-300' :
                          currentUser?.role === 'homeroom_teacher' ? 'bg-purple-300' :
                            currentUser?.role === 'teacher' ? 'bg-indigo-300' :
                              currentUser?.role === 'dj' ? 'bg-yellow-300' :
                                'bg-blue-300'
                          }`}></div>
                        {currentUser?.role === 'admin' ? 'Adminisztrátor' :
                          currentUser?.role === 'teacher' ? 'Tanár' :
                            currentUser?.role === 'homeroom_teacher' ? 'Osztályfőnök' :
                              currentUser?.role === 'dj' ? 'DJ' : 'Diák'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-8">
                <Card className="glass-card border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-800 dark:text-white">Személyes adatok</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Teljes név</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{currentUser?.name || currentUser?.fullName || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email cím</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{user?.email}</p>
                          </div>
                        </div>
                        {currentUser?.studentId && (
                          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0V5a2 2 0 014 0v1" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Oktatási azonosító</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{currentUser.studentId}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-800 dark:text-white">Iskolai információk</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(currentUser?.role === 'student' || currentUser?.role === 'dj') && currentUser?.class && (
                      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <BookOpen className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Osztály</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{currentUser.class}</p>
                        </div>
                      </div>
                    )}
                    {currentUser?.subject && (
                      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Tantárgy</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{currentUser.subject}</p>
                        </div>
                      </div>
                    )}

                    {currentUser?.role === 'admin' && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Adatbázis kezelés</h3>
                        <p className="text-sm text-red-600 dark:text-red-300 mb-2">
                          <strong>Mulasztások és órák törlése:</strong> Törli az összes mulasztást és órát az adatbázisból.
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
                          <strong>Órarend szinkronizálás:</strong> Hozzáadja az órarendet azoknak a diákoknak, akiknek nincs.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={async () => {
                              if (confirm('FIGYELEM!\n\nEz törli az összes mulasztást és órát az adatbázisból!\n\nBiztosan folytatod?')) {
                                if (confirm('UTOLSÓ FIGYELMEZTETÉS!\n\nEz a művelet visszavonhatatlan!\n\nTörlöd a mulasztásokat és órákat?')) {
                                  try {
                                    const response = await fetch('/api/admin/clear', {
                                      method: 'DELETE'
                                    })

                                    if (response.ok) {
                                      const result = await response.json()
                                      alert(`Adatok törölve!\n\nTörölt mulasztások: ${result.absencesDeleted}\nTörölt jelenléti adatok: ${result.attendanceDeleted}\nTörölt órák: ${result.lessonsDeleted}`)
                                      loadLessons(currentUser)
                                      loadAttendance()
                                    } else {
                                      const error = await response.json()
                                      alert(`Hiba: ${error.error || 'Törlés sikertelen'}`)
                                    }
                                  } catch (error) {
                                    alert('Hiba történt a törlés során')
                                  }
                                }
                              }
                            }}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 font-medium"
                          >
                            🗑️ Mulasztások és órák törlése
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm('Órarend szinkronizálás\n\nEz hozzáadja az órarendet azoknak a diákoknak, akiknek nincs.\n\nFolytatod?')) {
                                try {
                                  const response = await fetch('/api/admin/sync-schedules', {
                                    method: 'POST'
                                  })

                                  if (response.ok) {
                                    const result = await response.json()
                                    alert(`Órarend szinkronizálás kész!\n\nFrissített diákok: ${result.studentsUpdated}\nÖsszes diák: ${result.totalStudents}`)
                                    loadLessons(currentUser)
                                  } else {
                                    const error = await response.json()
                                    alert(`Hiba: ${error.error || 'Szinkronizálás sikertelen'}`)
                                  }
                                } catch (error) {
                                  alert('Hiba történt a szinkronizálás során')
                                }
                              }
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 font-medium"
                          >
                            🔄 Szinkronizálás
                          </button>
                        </div>
                      </div>
                    )}

                    {currentUser?.role === 'teacher' && (() => {
                      const teacherName = currentUser?.fullName || currentUser?.name
                      const allLessonsForProfile = (window as any).allLessonsForProfile || []

                      const filteredLessons = allLessonsForProfile.filter((lesson: any) =>
                        lesson.Teacher === teacherName
                      );

                      const finalLessons = teacherName === 'Nagy Péter'
                        ? filteredLessons.filter((l: any) => l.Class !== '12.B')
                        : filteredLessons;

                      const teacherClasses = [...new Set(finalLessons.map((lesson: any) => lesson.Class))].filter(Boolean)

                      return teacherClasses.length > 0 ? (
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tanított osztályok</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{teacherClasses.join(', ')}</p>
                          </div>
                        </div>
                      ) : null
                    })()}
                    {grades.length > 0 && (currentUser?.role === 'student' || currentUser?.role === 'dj') && (
                      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Összátlag</p>
                          <p className={`font-bold text-lg ${(grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length) >= 4 ? 'text-green-600' :
                            (grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length) >= 3 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {(grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {
        !cookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-3 sm:p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
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
      < CustomAlert
        open={alertData.isOpen}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />

      <ChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        grades={grades}
      />

      <HomeworkModal
        isOpen={showHomeworkModal}
        onClose={() => setShowHomeworkModal(false)}
        homework={selectedHomework}
        userRole={userRole}
        onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
      />

      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        homework={selectedHomework}
        onSubmit={handleSubmitHomework}
      />

      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        lesson={selectedLesson}
        date={selectedDate}
        initialTopic={attendanceForm.topic}
        initialStudents={attendanceForm.students}
        onSave={handleExtensionAttendanceSave}
        isEdit={!!selectedLesson?.id}
        availableDates={(() => {
          if (!selectedLesson || !lessons) return []

          const subjectDays = Array.from(new Set(
            lessons
              .filter(l => l.Class === selectedLesson.Class && l.Subject === selectedLesson.Subject)
              .map(l => l.Day)
          ))

          const dates: string[] = []
          const today = new Date()
          const dayMap: { [key: string]: number } = { 'Vasárnap': 0, 'Hétfő': 1, 'Kedd': 2, 'Szerda': 3, 'Csütörtök': 4, 'Péntek': 5, 'Szombat': 6 }

          for (let i = 0; i < 28; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            const dayName = new Intl.DateTimeFormat('hu-HU', { weekday: 'long' }).format(d)
            const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1)

            if (subjectDays.includes(formattedDayName)) {
              dates.push(d.toISOString().split('T')[0])
            }
          }

          return dates
        })()}
      />

      <ClassGradeModal
        isOpen={showClassGradeModal}
        onClose={() => setShowClassGradeModal(false)}
        className={selectedClass}
        students={allUsers.filter(u => (u.role === 'student' || u.role === 'dj') && u.class === selectedClass)}
        subject={currentUser?.subject || 'Egyéb'}
        teacherName={currentUser?.fullName || currentUser?.name || ''}
        onSave={handleClassGradeSave}
      />
    </div >
  )
}

