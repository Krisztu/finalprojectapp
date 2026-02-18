'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Calendar, Clock, User as UserIcon, Users, Plus, Edit, X } from 'lucide-react'
import { User } from '@/shared/types'

interface ScheduleManagerProps {
  allUsers: User[]
  availableClasses: { name: string }[]
}

export default function ScheduleManager({ allUsers, availableClasses }: ScheduleManagerProps) {
  const [selectedType, setSelectedType] = useState<'user' | 'class'>('user')
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [schedule, setSchedule] = useState<any[]>([])
  const [scheduleChanges, setScheduleChanges] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const timeSlots = ['7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45']
  const days = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek']

  const loadSchedule = async () => {
    if (!selectedUser && !selectedClass) return

    setLoading(true)
    try {
      let url = '/api/lessons'
      if (selectedType === 'user' && selectedUser) {
        url += `?userId=${encodeURIComponent(selectedUser)}`
      } else if (selectedType === 'class' && selectedClass) {
        url += `?class=${encodeURIComponent(selectedClass)}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const lessons = await response.json()
        setSchedule(lessons)
      }


      const changesResponse = await fetch(`/api/admin/schedule-changes?date=${selectedDate}`)
      if (changesResponse.ok) {
        const changes = await changesResponse.json()
        setScheduleChanges(changes)
      }
    } catch (error) {
      console.error('Failed to load schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [selectedUser, selectedClass, selectedDate, selectedType])

  const getDaySchedule = (day: string) => {
    const dayLessons = schedule.filter(lesson => lesson.day === day)
    const dayChanges = scheduleChanges.filter(change => {
      const changeDate = new Date(change.date)
      const currentDate = new Date(selectedDate)
      const changeDayName = changeDate.toLocaleDateString('hu-HU', { weekday: 'long' })
      const dayMap: Record<string, string> = { 'hétfő': 'Hétfő', 'kedd': 'Kedd', 'szerda': 'Szerda', 'csütörtök': 'Csütörtök', 'péntek': 'Péntek' }
      return dayMap[changeDayName.toLowerCase()] === day && changeDate.toDateString() === currentDate.toDateString()
    })

    return timeSlots.map(time => {
      const lesson = dayLessons.find(l => l.startTime === time)
      const change = dayChanges.find(c => c.timeSlot === time)

      if (change) {
        if (change.changeType === 'cancelled') {
          return { ...lesson, status: 'cancelled', change }
        } else if (change.changeType === 'substituted') {
          return {
            ...lesson,
            subject: change.newSubject || lesson?.subject,
            teacherName: change.newTeacher || lesson?.teacherName,
            className: change.newClass || lesson?.className,
            room: change.newRoom || lesson?.room,
            status: 'substituted',
            change
          }
        } else if (change.changeType === 'added') {
          return {
            startTime: time,
            subject: change.newSubject,
            teacherName: change.newTeacher,
            className: change.newClass,
            room: change.newRoom,
            status: 'added',
            change
          }
        }
      }

      return lesson || { startTime: time, status: 'free' }
    })
  }

  const handleLessonAction = async (day: string, timeSlot: string, action: 'cancel' | 'substitute' | 'add', lessonData?: any) => {
    try {
      const targetUserId = selectedType === 'user' ? selectedUser : null

      const changeData = {
        teacherId: targetUserId || 'class_' + selectedClass,
        date: selectedDate,
        timeSlot,
        changeType: action === 'cancel' ? 'cancelled' : action === 'substitute' ? 'substituted' : 'added',
        newSubject: lessonData?.subject || '',
        newTeacher: lessonData?.teacher || '',
        newClass: lessonData?.class || selectedClass,
        newRoom: lessonData?.room || ''
      }

      const response = await fetch('/api/admin/schedule-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changeData)
      })

      if (response.ok) {
        loadSchedule()
      }
    } catch (error) {
      console.error('Failed to update schedule:', error)
    }
  }

  const getLessonStatusColor = (status: string) => {
    switch (status) {
      case 'cancelled': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      case 'substituted': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
      case 'added': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
      case 'free': return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
      default: return 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100'
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            Interaktív Órarend Kezelő
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">Válassz felhasználót vagy osztályt az órarend megtekintéséhez és szerkesztéséhez</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Kezelés típusa</label>
              <Select value={selectedType} onValueChange={(value: 'user' | 'class') => setSelectedType(value)}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Egyéni órarend
                    </div>
                  </SelectItem>
                  <SelectItem value="class">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Osztály órarend
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedType === 'user' && (
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Felhasználó kiválasztása</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Válassz felhasználót" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.filter(u => u.role === 'teacher' || u.role === 'student' || u.role === 'dj').map((user, index) => (
                      <SelectItem key={index} value={user.id || user.email}>
                        <div className="flex items-center gap-2">
                          <span>{user.fullName || user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role === 'teacher' ? 'Tanár' : user.role === 'dj' ? 'DJ' : 'Diák'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedType === 'class' && (
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Osztály kiválasztása</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Válassz osztályt" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map(cls => (
                      <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Dátum</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      {(selectedUser || selectedClass) && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-green-600" />
              {new Date(selectedDate).toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kattints az órákra a szerkesztéshez • Üres cellákra kattintva új órát adhatsz hozzá
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              <div className="font-semibold text-center py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
                Időpont
              </div>
              {days.map(day => (
                <div key={day} className="font-semibold text-center py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300">
                  {day}
                </div>
              ))}

              {timeSlots.map(time => (
                <>
                  <div key={time} className="flex items-center justify-center font-medium text-sm bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-gray-700 dark:text-gray-300">
                    {time}
                  </div>
                  {days.map(day => {
                    const lesson = getDaySchedule(day).find(l => l.startTime === time)
                    return (
                      <div key={`${day}-${time}`} className={`p-3 rounded-lg border-2 min-h-[100px] transition-all hover:shadow-md ${getLessonStatusColor(lesson?.status || 'normal')}`}>
                        {lesson?.status === 'free' ? (
                          <div className="flex items-center justify-center h-full">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const subject = prompt('Tantárgy:')
                                const teacher = prompt('Tanár:')
                                const room = prompt('Terem:')
                                if (subject && teacher) {
                                  handleLessonAction(day, time, 'add', { subject, teacher, class: selectedClass, room })
                                }
                              }}
                              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="font-semibold text-sm leading-tight">{lesson?.subject}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{lesson?.teacherName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{lesson?.room}</div>
                            {lesson?.status && lesson.status !== 'normal' && (
                              <Badge variant="secondary" className="text-xs">
                                {lesson.status === 'cancelled' ? 'Elmaradt' :
                                  lesson.status === 'substituted' ? 'Helyettesítés' :
                                    lesson.status === 'added' ? 'Új óra' : ''}
                              </Badge>
                            )}
                            <div className="flex gap-1 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleLessonAction(day, time, 'cancel')}
                                className="p-1 h-7 w-7 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                                title="Óra lemondása"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const subject = prompt('Új tantárgy:', lesson?.subject)
                                  const teacher = prompt('Új tanár:', lesson?.teacherName)
                                  const room = prompt('Új terem:', lesson?.room)
                                  if (subject && teacher) {
                                    handleLessonAction(day, time, 'substitute', { subject, teacher, class: selectedClass, room })
                                  }
                                }}
                                className="p-1 h-7 w-7 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/20"
                                title="Óra módosítása"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedUser && !selectedClass && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Válassz felhasználót vagy osztályt</p>
              <p className="text-sm">Az órarend megtekintéséhez és szerkesztéséhez válassz egy felhasználót vagy osztályt a fenti menüből.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
