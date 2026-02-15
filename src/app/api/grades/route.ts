import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, studentClass, subject, grade, title, description, teacherName } = body

    if (!studentName || !subject || !grade || !title) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const gradeDoc = await db.collection('grades').add({
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
    console.error('Grades POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült létrehozni a jegyet' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('student')
    const studentClass = searchParams.get('class')

    let gradesQuery: FirebaseFirestore.Query = db.collection('grades')

    if (studentName) {
      gradesQuery = gradesQuery.where('studentName', '==', studentName)
    } else if (studentClass) {
      gradesQuery = gradesQuery.where('studentClass', '==', studentClass)
    }

    const gradesSnapshot = await gradesQuery.get()
    const grades = gradesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(grades)
  } catch (error) {
    console.error('Grades GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni a jegyeket' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Jegy azonosító szükséges' }, { status: 400 })
    }

    await db.collection('grades').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Grades DELETE Error:', error)
    return NextResponse.json({ error: 'Nem sikerült törölni a jegyet' }, { status: 500 })
  }
}