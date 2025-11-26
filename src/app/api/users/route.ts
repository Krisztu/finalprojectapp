import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, email, fullName, studentId, role, subject, classes } = body
    

    
    if (!uid || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Osztály hozzárendelés
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
    
    // Add teacher-specific fields
    if (role === 'teacher') {
      if (subject) userData.subject = subject
      if (classes) userData.classes = classes
    }
    
    const userDoc = await addDoc(collection(db, 'users'), userData)
    
    // Ha van hozzárendelt osztály, másoljuk át a meglévő órarendet
    if (assignedClass && (role === 'student' || role === 'dj')) {
      const targetClass = assignedClass
      let sourceUserId = null
      
      // Először keressük a dinamikus felhasználók között
      const existingUsersQuery = query(
        collection(db, 'users'),
        where('class', '==', targetClass),
        where('role', 'in', ['student', 'dj'])
      )
      
      const existingUsersSnapshot = await getDocs(existingUsersQuery)
      
      if (!existingUsersSnapshot.empty) {
        sourceUserId = existingUsersSnapshot.docs[0].id
      } else {

      }
      
      if (sourceUserId) {
        // Keressük meg a forrás felhasználó óráit
        const existingLessonsQuery = query(
          collection(db, 'lessons'),
          where('userId', '==', sourceUserId)
        )
        
        const existingLessonsSnapshot = await getDocs(existingLessonsQuery)
        
        if (!existingLessonsSnapshot.empty) {
          // Másoljuk át az órákat az új felhasználónak
          const lessonPromises = existingLessonsSnapshot.docs.map(lessonDoc => {
            const lessonData = lessonDoc.data()
            return addDoc(collection(db, 'lessons'), {
              ...lessonData,
              userId: userDoc.id,
              createdAt: new Date().toISOString()
            })
          })
          
          await Promise.all(lessonPromises)
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      id: userDoc.id, 
      class: assignedClass,
      lessonsAdded: assignedClass ? 'Órarend automatikusan hozzáadva' : 'Nincs osztály' 
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, role, class: userClass, fullName } = await request.json()
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (role) updateData.role = role
    if (userClass) updateData.class = userClass
    if (fullName) updateData.fullName = fullName
    
    await updateDoc(doc(db, 'users', id), updateData)
    
    // Ha osztály változott, frissítsük az órarendet
    if (userClass) {
      // Töröljük a régi órákat
      const oldLessonsQuery = query(
        collection(db, 'lessons'),
        where('userId', '==', id)
      )
      
      const oldLessonsSnapshot = await getDocs(oldLessonsQuery)
      const deletePromises = oldLessonsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      let sourceUserId = null
      
      // Először keressük a dinamikus felhasználók között
      const newClassUsersQuery = query(
        collection(db, 'users'),
        where('class', '==', userClass),
        where('role', 'in', ['student', 'dj'])
      )
      
      const newClassUsersSnapshot = await getDocs(newClassUsersQuery)
      
      if (!newClassUsersSnapshot.empty) {
        sourceUserId = newClassUsersSnapshot.docs[0].id
      } else {

      }
      
      if (sourceUserId) {
        // Keressük meg a forrás felhasználó óráit
        const newLessonsQuery = query(
          collection(db, 'lessons'),
          where('userId', '==', sourceUserId)
        )
        
        const newLessonsSnapshot = await getDocs(newLessonsQuery)
        
        if (!newLessonsSnapshot.empty) {
          const lessonPromises = newLessonsSnapshot.docs.map(lessonDoc => {
            const lessonData = lessonDoc.data()
            return addDoc(collection(db, 'lessons'), {
              ...lessonData,
              userId: id,
              createdAt: new Date().toISOString()
            })
          })
          
          await Promise.all(lessonPromises)

        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    

    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    // Ellenőrizzük, hogy létezik-e a dokumentum és lekérjük az uid-t
    const userRef = doc(db, 'users', id)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const userData = userDoc.data()
    
    await deleteDoc(userRef)
    

    
    return NextResponse.json({ 
      success: true, 
      message: 'User deleted from Firestore', 
      deletedId: id
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to delete user'
    }, { status: 500 })
  }
}