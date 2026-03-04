'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { LogOut, Sun, Moon, Trash2 } from 'lucide-react'
import { CustomAlert } from '@/shared/components/ui/custom-alert'

export default function ParentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [childGrades, setChildGrades] = useState<any[]>([])
  const [childAttendance, setChildAttendance] = useState<any[]>([])
  const [childBehavior, setChildBehavior] = useState<any[]>([])
  const [alertData, setAlertData] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ isOpen: false, title: '', message: '', type: 'info' })

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title: string = 'Értesítés') => {
    setAlertData({ isOpen: true, title, message, type })
  }

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      const isDark = savedDarkMode === 'true'
      setDarkMode(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    }

    loadData()
  }, [user])

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild.childId)
    }
  }, [selectedChild])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/parent/children?parentId=${user?.uid}`)
      if (response.ok) {
        const childrenData = await response.json()
        setChildren(childrenData)
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0])
        }
      }
    } catch (error) {
      console.error('Adatok betöltési hiba:', error)
      showAlert('Hiba az adatok betöltésekor', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadChildData = async (childId: string) => {
    try {
      const [gradesRes, attendanceRes, behaviorRes] = await Promise.all([
        fetch(`/api/grades?studentId=${childId}`),
        fetch(`/api/attendance?studentId=${childId}`),
        fetch(`/api/behavior?studentId=${childId}`)
      ])

      if (gradesRes.ok) {
        const gradesData = await gradesRes.json()
        setChildGrades(gradesData)
      }

      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json()
        setChildAttendance(attendanceData)
      }

      if (behaviorRes.ok) {
        const behaviorData = await behaviorRes.json()
        setChildBehavior(behaviorData)
      }
    } catch (error) {
      console.error('Gyermek adatok betöltési hiba:', error)
    }
  }

  const handleUnlinkChild = async (childId: string) => {
    if (!confirm('Biztosan eltávolítja ezt a gyermeket?')) return

    try {
      const response = await fetch(`/api/parent/unlink-child?parentId=${user?.uid}&childId=${childId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showAlert('Gyermek eltávolítva', 'success')
        loadData()
      } else {
        showAlert('Hiba az eltávolításkor', 'error')
      }
    } catch (error) {
      console.error('Unlink child error:', error)
      showAlert('Szerver hiba', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Adatok betöltése...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors pb-20">
      <CustomAlert
        isOpen={alertData.isOpen}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />

      {/* Header */}
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
                  localStorage.setItem('darkMode', newDarkMode.toString())
                }}
                className="rounded-full hover:bg-white/10 w-8 h-8 sm:w-10 sm:h-10"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  {user?.email}
                </span>
                <span className="text-xs text-muted-foreground">Szülő</span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => { logout(); router.push('/'); }} className="rounded-full shadow-md text-xs sm:text-sm px-2 sm:px-4">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kilépés</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-8">
        {children.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <p className="text-center text-gray-600 dark:text-gray-400">Még nincs hozzáadott gyermek.</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Gyermek hozzáadásához lépjen az admin felhasználóhoz, és regisztrálja a diákot. Ezt követően a szülő fiók összekapcsolódik a diákkal.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Gyermekek választó */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-medium mb-2">Válasszon gyermeket:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {children.map(child => (
                  <Card
                    key={child.id}
                    className={`cursor-pointer transition-all border-none shadow-sm ${selectedChild?.id === child.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm sm:text-base">{child.childName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{child.childClass}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">OM: {child.childStudentId}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUnlinkChild(child.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Kiválasztott gyermek adatai */}
            {selectedChild && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="hidden md:flex overflow-x-auto w-full glass p-2 rounded-xl gap-1">
                  <TabsTrigger value="overview" className="text-sm whitespace-nowrap px-4">Áttekintés</TabsTrigger>
                  <TabsTrigger value="grades" className="text-sm whitespace-nowrap px-4">Jegyek</TabsTrigger>
                  <TabsTrigger value="attendance" className="text-sm whitespace-nowrap px-4">Mulasztások</TabsTrigger>
                  <TabsTrigger value="behavior" className="text-sm whitespace-nowrap px-4">Viselkedés</TabsTrigger>
                </TabsList>

                {/* Áttekintés */}
                <TabsContent value="overview">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="text-sm sm:text-lg">{selectedChild.childName} - Áttekintés</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Osztály</p>
                          <p className="font-bold">{selectedChild.childClass}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">OM Azonosító</p>
                          <p className="font-bold">{selectedChild.childStudentId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Jegyek száma</p>
                          <p className="font-bold">{childGrades.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Mulasztások</p>
                          <p className="font-bold">{childAttendance.filter((a: any) => !a.present).length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Jegyek */}
                <TabsContent value="grades">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="text-sm sm:text-lg">Jegyek</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      {childGrades.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">Nincs jegy</p>
                      ) : (
                        <div className="overflow-x-auto text-xs sm:text-sm">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Tárgy</TableHead>
                                <TableHead>Jegy</TableHead>
                                <TableHead>Típus</TableHead>
                                <TableHead>Dátum</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {childGrades.map((grade: any) => (
                                <TableRow key={grade.id}>
                                  <TableCell>{grade.subject}</TableCell>
                                  <TableCell className="font-bold">{grade.grade}</TableCell>
                                  <TableCell>{grade.title}</TableCell>
                                  <TableCell>{new Date(grade.createdAt || grade.date).toLocaleDateString('hu-HU')}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Mulasztások */}
                <TabsContent value="attendance">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="text-sm sm:text-lg">Mulasztások</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      {childAttendance.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">Nincs mulasztás</p>
                      ) : (
                        <div className="overflow-x-auto text-xs sm:text-sm">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Dátum</TableHead>
                                <TableHead>Tárgy</TableHead>
                                <TableHead>Státusz</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {childAttendance.map((att: any) => (
                                <TableRow key={att.id}>
                                  <TableCell>{new Date(att.date).toLocaleDateString('hu-HU')}</TableCell>
                                  <TableCell>{att.subject}</TableCell>
                                  <TableCell>
                                    <Badge variant={att.present ? 'default' : 'destructive'}>
                                      {att.present ? 'Jelen' : 'Hiányzó'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Viselkedés */}
                <TabsContent value="behavior">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="text-sm sm:text-lg">Viselkedés</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      {childBehavior.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">Nincs viselkedés bejegyzés</p>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {childBehavior.map((record: any) => (
                            <div key={record.id} className="border border-white/10 rounded-lg p-3 sm:p-4 glass-panel">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2">
                                  <Badge variant={record.type === 'dicseret' ? 'default' : 'destructive'} className="text-xs">
                                    {record.type === 'dicseret' ? 'Dicséret' : 'Figyelmeztetés'}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {record.level === 'szaktanari' ? 'Szaktanári' : record.level === 'osztalyfonoki' ? 'Osztályfőnöki' : 'Igazgatói'}
                                  </Badge>
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {new Date(record.createdAt).toLocaleDateString('hu-HU')}
                                </span>
                              </div>
                              <p className="font-medium text-sm">{record.description}</p>
                              {record.reason && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{record.reason}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </main>
    </div>
  )
}
