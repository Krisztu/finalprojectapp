import { NextRequest, NextResponse } from 'next/server'
import { auth, db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, email, fullName, studentId, role, subject, classes } = body

    if (!uid || !email || !role) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    let assignedClass = body.class

    if (role === 'student' && !assignedClass) {
      const availableClasses = ['12.A', '12.B']
      const randomIndex = Math.floor(Math.random() * availableClasses.length)
      assignedClass = availableClasses[randomIndex]
    }

    const userData: any = {
      uid,
      email,
      fullName: fullName || '',
      studentId: studentId || '',
      role,
      class: assignedClass,
      createdAt: new Date().toISOString()
    }

    if (role === 'teacher') {
      if (subject) userData.subject = subject
      if (classes) userData.classes = classes
    }

    const userRef = await db.collection('users').add(userData)

    if (assignedClass && (role === 'student' || role === 'dj')) {
      const targetClass = assignedClass
      let sourceUserId = null

      const existingUsersSnapshot = await db.collection('users')
        .where('class', '==', targetClass)
        .where('role', 'in', ['student', 'dj'])
        .get()

      if (!existingUsersSnapshot.empty) {
        sourceUserId = existingUsersSnapshot.docs[0].id
      }

      if (sourceUserId) {
        const existingLessonsSnapshot = await db.collection('lessons')
          .where('userId', '==', sourceUserId)
          .get()

        if (!existingLessonsSnapshot.empty) {
          const batch = db.batch()

          existingLessonsSnapshot.docs.forEach(lessonDoc => {
            const lessonData = lessonDoc.data()
            const newLessonRef = db.collection('lessons').doc()
            batch.set(newLessonRef, {
              ...lessonData,
              userId: userRef.id,
              createdAt: new Date().toISOString()
            })
          })

          await batch.commit()
        }
      }
    }

    return NextResponse.json({
      success: true,
      id: userRef.id,
      class: assignedClass,
      lessonsAdded: assignedClass ? 'Órarend automatikusan hozzáadva' : 'Nincs osztály'
    })
  } catch (error) {
    console.error('Error creating user FULL:', error)
    return NextResponse.json({
      error: 'Nem sikerült létrehozni a felhasználót',
      details: (error as any)?.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const role = searchParams.get('role')

    let query: FirebaseFirestore.Query = db.collection('users')

    if (email) {
      query = query.where('email', '==', email)
    }

    if (role) {
      query = query.where('role', '==', role)
    }

    const usersSnapshot = await query.get()
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users FULL:', error)
    return NextResponse.json({
      error: 'Nem sikerült lekérni a felhasználókat',
      details: (error as any)?.message || 'Ismeretlen hiba'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, role, class: userClass, fullName } = body

    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (role) updateData.role = role
    if (userClass) updateData.class = userClass
    if (fullName) updateData.fullName = fullName
    if (body.profileImage) updateData.profileImage = body.profileImage

    await db.collection('users').doc(id).update(updateData)

    if (role || fullName) {
      try {
        const userDoc = await db.collection('users').doc(id).get()
        const userData = userDoc.data()
        if (userData?.uid) {
          await auth.setCustomUserClaims(userData.uid, {
            role: role || userData.role,
            name: fullName || userData.fullName
          })
        }
      } catch (error) {
        console.error('Failed to update custom claims:', error)
      }
    }

    if (userClass) {
      const oldLessonsSnapshot = await db.collection('lessons')
        .where('userId', '==', id)
        .get()

      if (!oldLessonsSnapshot.empty) {
        const batch = db.batch()
        oldLessonsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref)
        })
        await batch.commit()
      }

      let sourceUserId = null

      const newClassUsersSnapshot = await db.collection('users')
        .where('class', '==', userClass)
        .where('role', 'in', ['student', 'dj'])
        .get()

      if (!newClassUsersSnapshot.empty) {
        sourceUserId = newClassUsersSnapshot.docs[0].id
      }

      if (sourceUserId) {
        const newLessonsSnapshot = await db.collection('lessons')
          .where('userId', '==', sourceUserId)
          .get()

        if (!newLessonsSnapshot.empty) {
          const batch = db.batch()

          newLessonsSnapshot.docs.forEach(lessonDoc => {
            const lessonData = lessonDoc.data()
            const newLessonRef = db.collection('lessons').doc()
            batch.set(newLessonRef, {
              ...lessonData,
              userId: id,
              createdAt: new Date().toISOString()
            })
          })

          await batch.commit()
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Nem sikerült frissíteni a felhasználót' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Felhasználó azonosító szükséges' }, { status: 400 })
    }

    const userRef = db.collection('users').doc(id)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Felhasználó nem található' }, { status: 404 })
    }

    await userRef.delete()

    return NextResponse.json({
      success: true,
      message: 'Felhasználó törölve a Firestore-ból',
      deletedId: id
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Nem sikerült törölni a felhasználót'
    }, { status: 500 })
  }
}