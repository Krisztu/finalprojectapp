import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, and } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, date, timeSlot, changeType, newSubject, newTeacher, newClass, newRoom } = body
    
    if (!teacherId || !date || !timeSlot || !changeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Létrehozzuk az órarend módosítást
    const scheduleChange = {
      teacherId,
      date, // YYYY-MM-DD formátum
      timeSlot, // pl. "7:45"
      changeType, // "cancelled", "substituted", "added"
      newSubject: newSubject || '',
      newTeacher: newTeacher || '',
      newClass: newClass || '',
      newRoom: newRoom || '',
      createdAt: new Date().toISOString()
    }
    
    const changeDoc = await addDoc(collection(db, 'schedule-changes'), scheduleChange)
    
    return NextResponse.json({ success: true, id: changeDoc.id })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create schedule change' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const date = searchParams.get('date')
    
    let changesQuery = collection(db, 'schedule-changes')
    
    if (teacherId && date) {
      changesQuery = query(
        collection(db, 'schedule-changes'),
        and(
          where('teacherId', '==', teacherId),
          where('date', '==', date)
        )
      )
    } else if (date) {
      changesQuery = query(collection(db, 'schedule-changes'), where('date', '==', date))
    }
    
    const changesSnapshot = await getDocs(changesQuery)
    const changes = changesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(changes)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch schedule changes' }, { status: 500 })
  }
}