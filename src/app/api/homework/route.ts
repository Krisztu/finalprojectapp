import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, dueDate, teacherId, teacherName, subject, className, lessonId, attachments } = body
    
    if (!title || !description || !dueDate || !teacherId || !className) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const homeworkDoc = await addDoc(collection(db, 'homework'), {
      title,
      description,
      dueDate,
      teacherId,
      teacherName: teacherName || '',
      subject: subject || '',
      className,
      lessonId: lessonId || '',
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      status: 'active'
    })
    
    return NextResponse.json({ success: true, id: homeworkDoc.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create homework' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const className = searchParams.get('class')
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')
    
    let homeworkQuery = collection(db, 'homework')
    
    if (className) {
      homeworkQuery = query(collection(db, 'homework'), where('className', '==', className))
    } else if (teacherId) {
      homeworkQuery = query(collection(db, 'homework'), where('teacherId', '==', teacherId))
    }
    
    const homeworkSnapshot = await getDocs(homeworkQuery)
    const homework = homeworkSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Ha diák kéri, akkor a beadásokat is betöltjük
    if (studentId) {
      const submissionsQuery = query(collection(db, 'homework-submissions'), where('studentId', '==', studentId))
      const submissionsSnapshot = await getDocs(submissionsQuery)
      const submissions = submissionsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data()
        acc[data.homeworkId] = { id: doc.id, ...data }
        return acc
      }, {} as any)
      
      return NextResponse.json({ homework, submissions })
    }
    
    return NextResponse.json(homework)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch homework' }, { status: 500 })
  }
}