import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, email, fullName, studentId, role } = body
    
    if (!uid || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const userDoc = await addDoc(collection(db, 'users'), {
      uid,
      email,
      fullName: fullName || '',
      studentId: studentId || '',
      role,
      createdAt: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, id: userDoc.id })
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
    const { id, role } = await request.json()
    
    await updateDoc(doc(db, 'users', id), {
      role,
      updatedAt: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}