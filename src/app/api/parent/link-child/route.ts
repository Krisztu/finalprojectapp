import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'
import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp()
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await admin.auth().verifyIdToken(token)
    const parentId = decodedToken.uid

    const body = await request.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json({ error: 'OM azonosító szükséges' }, { status: 400 })
    }

    const childQuery = query(collection(db, 'users'), where('studentId', '==', studentId), where('role', 'in', ['student', 'dj']))
    const childSnapshot = await getDocs(childQuery)

    if (childSnapshot.empty) {
      return NextResponse.json({ error: 'Diák nem található' }, { status: 404 })
    }

    const childDoc = childSnapshot.docs[0]
    const childId = childDoc.id

    await addDoc(collection(db, 'parent_children'), {
      parentId,
      childId,
      childName: childDoc.data().fullName || childDoc.data().name,
      childClass: childDoc.data().class,
      childStudentId: studentId,
      relationship: 'egyeb',
      linkedAt: new Date().toISOString(),
      verified: true
    })

    await updateDoc(doc(db, 'users', parentId), {
      children: [childId]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Link child error:', error)
    return NextResponse.json({ error: 'Szerver hiba' }, { status: 500 })
  }
}}
