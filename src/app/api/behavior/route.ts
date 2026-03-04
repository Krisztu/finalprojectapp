import { NextRequest, NextResponse } from 'next/server'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc, increment, deleteDoc } from 'firebase/firestore'
import { BehaviorRecord } from '@/shared/types'

const canGiveBehaviorRecord = (userRole: string, level: string): boolean => {
  if (level === 'szaktanari') {
    return ['teacher', 'homeroom_teacher'].includes(userRole)
  }
  if (level === 'osztalyfonoki') {
    return userRole === 'homeroom_teacher'
  }
  if (level === 'igazgatoi') {
    return userRole === 'principal'
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await auth.verifyIdToken(token)
    const userRole = decodedToken.role as string

    const body = await request.json()
    const { studentId, studentName, studentClass, type, level, description, reason, actionTaken } = body

    if (!canGiveBehaviorRecord(userRole, level)) {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 })
    }

    if (!studentId || !type || !level || !description) {
      return NextResponse.json({ error: 'Hiányzó mezők' }, { status: 400 })
    }

    const behaviorRecord: BehaviorRecord = {
      studentId,
      studentName,
      studentClass,
      type,
      level,
      description,
      reason,
      recordedBy: decodedToken.uid,
      recordedByName: decodedToken.name || decodedToken.email,
      recordedByRole: userRole as 'teacher' | 'homeroom_teacher' | 'principal',
      createdAt: new Date(),
      parentNotified: false,
      actionTaken
    }

    const docRef = await addDoc(collection(db, 'behavior_records'), behaviorRecord)

    const summaryRef = doc(db, 'users', studentId, 'behavior_summary', 'summary')
    const summarySnap = await getDoc(summaryRef)

    if (summarySnap.exists()) {
      const updates: any = {}
      if (type === 'dicseret') {
        updates.dicseretCount = increment(1)
        if (level === 'szaktanari') updates.szaktanariDicseret = increment(1)
        if (level === 'osztalyfonoki') updates.osztalyfonokiDicseret = increment(1)
        if (level === 'igazgatoi') updates.igazgatoiDicseret = increment(1)
      } else {
        updates.figyelmeztetesCount = increment(1)
        if (level === 'szaktanari') updates.szaktanariFigyelmezetes = increment(1)
        if (level === 'osztalyfonoki') updates.osztalyfonokiFigyelmezetes = increment(1)
        if (level === 'igazgatoi') updates.igazgatoiFigyelmezetes = increment(1)
      }
      updates.updatedAt = new Date()
      await updateDoc(summaryRef, updates)
    } else {
      const summaryData: any = {
        studentId,
        dicseretCount: type === 'dicseret' ? 1 : 0,
        szaktanariDicseret: type === 'dicseret' && level === 'szaktanari' ? 1 : 0,
        osztalyfonokiDicseret: type === 'dicseret' && level === 'osztalyfonoki' ? 1 : 0,
        igazgatoiDicseret: type === 'dicseret' && level === 'igazgatoi' ? 1 : 0,
        figyelmeztetesCount: type === 'figyelmezetes' ? 1 : 0,
        szaktanariFigyelmezetes: type === 'figyelmezetes' && level === 'szaktanari' ? 1 : 0,
        osztalyfonokiFigyelmezetes: type === 'figyelmezetes' && level === 'osztalyfonoki' ? 1 : 0,
        igazgatoiFigyelmezetes: type === 'figyelmezetes' && level === 'igazgatoi' ? 1 : 0,
        updatedAt: new Date()
      }
      await addDoc(collection(db, 'users', studentId, 'behavior_summary'), summaryData)
    }

    return NextResponse.json({ id: docRef.id, ...behaviorRecord }, { status: 201 })
  } catch (error) {
    console.error('Behavior API error:', error)
    return NextResponse.json({ error: 'Szerver hiba' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await auth.verifyIdToken(authHeader.substring(7))

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const className = searchParams.get('className')

    if (studentId) {
      const q = query(collection(db, 'behavior_records'), where('studentId', '==', studentId))
      const snapshot = await getDocs(q)
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return NextResponse.json(records)
    }

    if (className) {
      const q = query(collection(db, 'behavior_records'), where('studentClass', '==', className))
      const snapshot = await getDocs(q)
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return NextResponse.json(records)
    }

    return NextResponse.json({ error: 'Hiányzó paraméterek' }, { status: 400 })
  } catch (error) {
    console.error('Behavior GET error:', error)
    return NextResponse.json({ error: 'Szerver hiba' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await auth.verifyIdToken(token)
    
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID szükséges' }, { status: 400 })
    }

    await updateDoc(doc(db, 'behavior_records', id), updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Behavior PUT error:', error)
    return NextResponse.json({ error: 'Szerver hiba' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await auth.verifyIdToken(token)
    
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID szükséges' }, { status: 400 })
    }

    await deleteDoc(doc(db, 'behavior_records', id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Behavior DELETE error:', error)
    return NextResponse.json({ error: 'Szerver hiba' }, { status: 500 })
  }
}
