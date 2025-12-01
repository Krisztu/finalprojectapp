import { NextRequest, NextResponse } from 'next/server'
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role, subject, classes, studentId, class: userClass } = body
    
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Firebase Authentication felhasználó létrehozása
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Felhasználó adatok mentése Firestore-ba
    const userData: any = {
      uid: user.uid,
      email: user.email,
      fullName,
      role,
      createdAt: new Date().toISOString()
    }
    
    if (role === 'teacher') {
      userData.subject = subject || ''
      userData.classes = classes || []
    } else if (role === 'student' || role === 'dj') {
      userData.studentId = studentId || ''
      userData.class = userClass || '12.A'
    }
    
    await setDoc(doc(db, 'users', user.uid), userData)
    
    // Ha diák, másoljuk az órarendet az osztálytársaitól
    if ((role === 'student' || role === 'dj') && userData.class) {
      try {
        const { collection: firestoreCollection, getDocs, query, where, addDoc } = await import('firebase/firestore')
        
        // Keressünk egy osztálytársat
        const classStudentsQuery = query(
          firestoreCollection(db, 'users'),
          where('class', '==', userData.class),
          where('role', 'in', ['student', 'dj'])
        )
        const classStudentsSnapshot = await getDocs(classStudentsQuery)
        
        if (!classStudentsSnapshot.empty) {
          const classmate = classStudentsSnapshot.docs[0]
          
          // Másoljuk az osztálytárs óráit
          const lessonsQuery = query(
            firestoreCollection(db, 'lessons'),
            where('userId', '==', classmate.id)
          )
          const lessonsSnapshot = await getDocs(lessonsQuery)
          
          // Létrehozzuk az új diák óráit
          const lessonPromises = lessonsSnapshot.docs.map(lessonDoc => {
            const lesson = lessonDoc.data()
            return addDoc(firestoreCollection(db, 'lessons'), {
              userId: user.uid,
              day: lesson.day,
              startTime: lesson.startTime,
              subject: lesson.subject,
              teacherName: lesson.teacherName,
              className: lesson.className,
              room: lesson.room || '',
              createdAt: new Date().toISOString()
            })
          })
          
          await Promise.all(lessonPromises)
        }
      } catch (error) {
        // Órarend másolás sikertelen, de a regisztráció sikeres
        console.error('Schedule copy failed:', error)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      uid: user.uid,
      message: 'Felhasználó sikeresen regisztrálva' 
    })
  } catch (error: any) {
    
    let errorMessage = 'Failed to register user'
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Ez az email cím már használatban van'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'A jelszó túl gyenge (minimum 6 karakter)'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Érvénytelen email cím'
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}