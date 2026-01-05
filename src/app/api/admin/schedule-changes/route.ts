import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, date, timeSlot, changeType, newSubject, newTeacher, newClass, newRoom } = body

    if (!teacherId || !date || !timeSlot || !changeType) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const scheduleChange = {
      teacherId,
      date,
      timeSlot,
      changeType,
      newSubject: newSubject || '',
      newTeacher: newTeacher || '',
      newClass: newClass || '',
      newRoom: newRoom || '',
      createdAt: new Date().toISOString()
    }

    const changeDoc = await db.collection('schedule-changes').add(scheduleChange)

    return NextResponse.json({ success: true, id: changeDoc.id })
  } catch (error: any) {
    console.error('Schedule Changes POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült létrehozni az órarend változtatást' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const date = searchParams.get('date')

    let changesQuery = db.collection('schedule-changes')

    if (teacherId && date) {
      changesQuery = changesQuery
        .where('teacherId', '==', teacherId)
        .where('date', '==', date)
    } else if (date) {
      changesQuery = changesQuery.where('date', '==', date)
    }

    const changesSnapshot = await changesQuery.get()
    const changes = changesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(changes)
  } catch (error: any) {
    console.error('Schedule Changes GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni az órarend változtatásokat' }, { status: 500 })
  }
}