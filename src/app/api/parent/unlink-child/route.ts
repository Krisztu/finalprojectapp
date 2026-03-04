import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const childId = searchParams.get('childId')

    if (!parentId || !childId) {
      return NextResponse.json({ error: 'parentId és childId szükséges' }, { status: 400 })
    }

    // Parent-child kapcsolat törlése
    await db.collection('parent_children').doc(`${parentId}__${childId}`).delete()

    // Szülő children array frissítése
    const parentRef = db.collection('users').doc(parentId)
    await parentRef.update({
      children: db.FieldValue.arrayRemove(childId)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unlink child error:', error)
    return NextResponse.json({ error: 'Gyermek leválasztása sikertelen' }, { status: 500 })
  }
}
