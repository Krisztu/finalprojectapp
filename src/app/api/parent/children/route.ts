import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json({ error: 'parentId szükséges' }, { status: 400 })
    }

    const snapshot = await db.collection('parent_children')
      .where('parentId', '==', parentId)
      .get()

    const children = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(children)
  } catch (error) {
    console.error('Get children error:', error)
    return NextResponse.json({ error: 'Gyermekek lekérése sikertelen' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentId, childStudentId, relationship } = body

    if (!parentId || !childStudentId || !relationship) {
      return NextResponse.json({ error: 'Hiányzó mezők' }, { status: 400 })
    }

    // Gyermek keresése OM azonosító alapján
    const childSnapshot = await db.collection('users')
      .where('studentId', '==', childStudentId)
      .where('role', 'in', ['student', 'dj'])
      .get()

    if (childSnapshot.empty) {
      return NextResponse.json({ error: 'Gyermek nem található' }, { status: 404 })
    }

    const childDoc = childSnapshot.docs[0]
    const childId = childDoc.id

    // Parent-child kapcsolat létrehozása
    await db.collection('parent_children').doc(`${parentId}__${childId}`).set({
      parentId,
      childId,
      childName: childDoc.data().fullName || childDoc.data().name,
      childClass: childDoc.data().class,
      childStudentId,
      relationship,
      linkedAt: new Date().toISOString(),
      verified: true
    })

    // Szülő children array frissítése
    const parentRef = db.collection('users').doc(parentId)
    await parentRef.update({
      children: db.FieldValue.arrayUnion(childId)
    })

    return NextResponse.json({ success: true, childId })
  } catch (error) {
    console.error('Link child error:', error)
    return NextResponse.json({ error: 'Gyermek összekapcsolása sikertelen' }, { status: 500 })
  }
}
