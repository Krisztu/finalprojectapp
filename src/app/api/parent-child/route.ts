import { NextRequest, NextResponse } from 'next/server'
import { db as adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { parentId, studentIds } = await request.json()

    if (!parentId || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json({ error: 'Hiányzó adatok' }, { status: 400 })
    }

    await adminDb.collection('users').doc(parentId).update({
      children: studentIds
    })

    return NextResponse.json({ success: true, message: 'Gyerekek hozzáadva' })
  } catch (error: any) {
    console.error('Parent-child error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const parentId = request.nextUrl.searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json({ error: 'Hiányzó parentId' }, { status: 400 })
    }

    const parentDoc = await adminDb.collection('users').doc(parentId).get()
    if (!parentDoc.exists) {
      return NextResponse.json({ error: 'Szülő nem található' }, { status: 404 })
    }

    const parentData = parentDoc.data()
    const childrenIds = parentData?.children || []

    const children = []
    for (const childId of childrenIds) {
      const childDoc = await adminDb.collection('users').doc(childId).get()
      if (childDoc.exists) {
        children.push({
          id: childDoc.id,
          ...childDoc.data()
        })
      }
    }

    return NextResponse.json(children)
  } catch (error: any) {
    console.error('Get children error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
