import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, studentClass, subject, grade, title, description, teacherName } = body
    
    if (!studentName || !subject || !grade || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const gradeDoc = await addDoc(collection(db, 'grades'), {
      studentName,
      studentClass: studentClass || '',
      subject,
      grade: parseInt(grade),
      title,
      description: description || '',
      teacherName: teacherName || '',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, id: gradeDoc.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create grade' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('student')
    const studentClass = searchParams.get('class')
    
    let gradesQuery = collection(db, 'grades')
    
    if (studentName) {
      gradesQuery = query(collection(db, 'grades'), where('studentName', '==', studentName))
    } else if (studentClass) {
      gradesQuery = query(collection(db, 'grades'), where('studentClass', '==', studentClass))
    }
    
    const gradesSnapshot = await getDocs(gradesQuery)
    const grades = gradesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(grades)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Grade ID required' }, { status: 400 })
    }
    
    await deleteDoc(doc(db, 'grades', id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete grade' }, { status: 500 })
  }
}