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
    
    // Ha diák, másoljuk az órarendet
    if ((role === 'student' || role === 'dj') && userData.class) {
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      } catch (error) {
        // Órarend másolás sikertelen
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