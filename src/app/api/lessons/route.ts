import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { day, startTime, subject, teacherName, className, room } = body

    if (!day || !startTime || !subject || !teacherName || !className) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const usersSnapshot = await db.collection('users').get()
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    const teacher = allUsers.find((user: any) => (user.fullName || user.name) === teacherName)
    if (!teacher) {
      return NextResponse.json({ error: 'Tanár nem található' }, { status: 400 })
    }

    const classStudents = allUsers.filter((user: any) =>
      (user.role === 'student' || user.role === 'dj') && user.class === className
    )

    const affectedUsers = [teacher, ...classStudents]

    for (const user of affectedUsers) {
      const userId = user.id || user.email
      const conflictSnapshot = await db.collection('lessons')
        .where('userId', '==', userId)
        .where('day', '==', day)
        .where('startTime', '==', startTime)
        .get()

      if (!conflictSnapshot.empty) {
        const conflictLesson = conflictSnapshot.docs[0].data()
        return NextResponse.json({
          error: `${user.fullName || user.name} már foglalt ezen az időponton: ${conflictLesson.subject} (${conflictLesson.teacherName})`
        }, { status: 409 })
      }
    }

    const batch = db.batch()

    affectedUsers.forEach(user => {
      const newLessonRef = db.collection('lessons').doc()
      batch.set(newLessonRef, {
        day,
        startTime,
        subject,
        teacherName,
        className,
        room: room || '',
        userId: user.id || user.email,
        createdAt: new Date().toISOString()
      })
    })

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: `Óra rögzítve ${affectedUsers.length} felhasználónak (1 tanár + ${classStudents.length} diák)`
    })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Nem sikerült létrehozni az órát' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const className = searchParams.get('class')
    const teacherName = searchParams.get('teacher')
    const userId = searchParams.get('userId')

    let lessonsQuery: FirebaseFirestore.Query = db.collection('lessons')

    if (userId) {
      lessonsQuery = db.collection('lessons').where('userId', '==', userId)

      const lessonsSnapshot = await lessonsQuery.get()
      let lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      if (lessons.length === 0) {
        const userDoc = await db.collection('users').doc(userId).get()
        if (userDoc.exists && userDoc.data()?.email) {
          const emailQuery = db.collection('lessons').where('userId', '==', userDoc.data()?.email)
          const emailSnapshot = await emailQuery.get()
          lessons = emailSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        }
      }

      return NextResponse.json(lessons)
    } else if (className) {
      const usersSnapshot = await db.collection('users').where('class', '==', className).get()
      if (!usersSnapshot.empty) {
        const firstStudentId = usersSnapshot.docs[0].id
        lessonsQuery = db.collection('lessons').where('userId', '==', firstStudentId)
      }
    } else if (teacherName) {
      lessonsQuery = db.collection('lessons').where('teacherName', '==', teacherName)
    }

    const lessonsSnapshot = await lessonsQuery.get()
    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni az órákat' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Óra azonosító szükséges' }, { status: 400 })
    }

    await db.collection('lessons').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Nem sikerült törölni az órát' }, { status: 500 })
  }
}