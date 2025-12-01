import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, query, where, getDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, studentName, studentClass, absenceIds, excuseType, description, submittedBy } = body
    
    if (!studentId || !absenceIds || !excuseType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const excuseDoc = await addDoc(collection(db, 'excuses'), {
      studentId,
      studentName,
      studentClass,
      absenceIds,
      excuseType,
      description: description || '',
      submittedBy,
      status: 'pending',
      submittedAt: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, id: excuseDoc.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit excuse' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classTeacher = searchParams.get('classTeacher')
    const studentId = searchParams.get('studentId')
    
    let excusesQuery = collection(db, 'excuses')
    
    if (classTeacher) {
      excusesQuery = query(collection(db, 'excuses'), where('studentClass', '==', classTeacher))
    } else if (studentId) {
      excusesQuery = query(collection(db, 'excuses'), where('studentId', '==', studentId))
    }
    
    const excusesSnapshot = await getDocs(excusesQuery)
    const excuses = excusesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(excuses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch excuses' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, reviewedBy } = body
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const excuseRef = doc(db, 'excuses', id)
    await updateDoc(excuseRef, {
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString()
    })
    
    if (status === 'approved') {
      const excuseDoc = await getDoc(excuseRef)
      const excuseData = excuseDoc.data()
      
      if (excuseData?.absenceIds) {
        for (const absenceId of excuseData.absenceIds) {
          const absenceRef = doc(db, 'absences', absenceId)
          await updateDoc(absenceRef, {
            excused: true,
            excusedBy: reviewedBy,
            excusedAt: new Date().toISOString()
          })
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update excuse' }, { status: 500 })
  }
}