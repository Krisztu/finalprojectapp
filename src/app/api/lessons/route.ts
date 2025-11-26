import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, doc, deleteDoc, query, where, and } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { day, startTime, subject, teacherName, className, room } = body
    
    if (!day || !startTime || !subject || !teacherName || !className) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Lekérjük az összes felhasználót az adatbázisból
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Megkeressük a tanárt
    const teacher = allUsers.find(user => (user.fullName || user.name) === teacherName)
    if (!teacher) {
      return NextResponse.json({ error: 'Tanár nem található' }, { status: 400 })
    }
    
    // Megkeressük az osztály diákjait
    const classStudents = allUsers.filter(user => 
      (user.role === 'student' || user.role === 'dj') && user.class === className
    )
    
    // Összes érintett felhasználó (tanár + diákok)
    const affectedUsers = [teacher, ...classStudents]
    
    // Ellenőrizzük az ütközéseket minden érintett felhasználónál
    for (const user of affectedUsers) {
      const userId = user.id || user.email
      const conflictQuery = query(
        collection(db, 'lessons'),
        and(
          where('userId', '==', userId),
          where('day', '==', day),
          where('startTime', '==', startTime)
        )
      )
      
      const conflictSnapshot = await getDocs(conflictQuery)
      if (!conflictSnapshot.empty) {
        const conflictLesson = conflictSnapshot.docs[0].data()
        return NextResponse.json({ 
          error: `${user.fullName || user.name} már foglalt ezen az időponton: ${conflictLesson.subject} (${conflictLesson.teacherName})` 
        }, { status: 409 })
      }
    }
    
    // Ha nincs ütközés, létrehozzuk az órákat minden érintett felhasználónak
    const lessonPromises = affectedUsers.map(user => 
      addDoc(collection(db, 'lessons'), {
        day,
        startTime,
        subject,
        teacherName,
        className,
        room: room || '',
        userId: user.id || user.email,
        createdAt: new Date().toISOString()
      })
    )
    
    await Promise.all(lessonPromises)
    
    return NextResponse.json({ 
      success: true, 
      message: `Óra rögzítve ${affectedUsers.length} felhasználónak (1 tanár + ${classStudents.length} diák)` 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const className = searchParams.get('class')
    const teacherName = searchParams.get('teacher')
    const userId = searchParams.get('userId')
    
    let lessonsQuery = collection(db, 'lessons')
    
    if (userId) {
      // Minden felhasználónak egyedi órarend a userId alapján
      lessonsQuery = query(collection(db, 'lessons'), where('userId', '==', userId))
      
      const lessonsSnapshot = await getDocs(lessonsQuery)
      let lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Ha nincs óra az ID alapján, próbáljuk email alapján is
      if (lessons.length === 0) {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const user = usersSnapshot.docs.find(doc => doc.id === userId)
        if (user && user.data().email) {
          const emailQuery = query(collection(db, 'lessons'), where('userId', '==', user.data().email))
          const emailSnapshot = await getDocs(emailQuery)
          lessons = emailSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          

        }
      }

      return NextResponse.json(lessons)
    } else if (className) {
      // Osztály alapján - egy diák órarendjét veszük az osztályból
      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('class', '==', className)))
      if (!usersSnapshot.empty) {
        const firstStudentId = usersSnapshot.docs[0].id
        lessonsQuery = query(collection(db, 'lessons'), where('userId', '==', firstStudentId))
      }
    } else if (teacherName) {
      lessonsQuery = query(collection(db, 'lessons'), where('teacherName', '==', teacherName))
    }
    
    const lessonsSnapshot = await getDocs(lessonsQuery)
    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(lessons)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 })
    }
    
    await deleteDoc(doc(db, 'lessons', id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 })
  }
}