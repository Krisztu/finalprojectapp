import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { homeworkId, studentId, studentName, content, attachments } = body
    
    if (!homeworkId || !studentId || !studentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const submissionDoc = await addDoc(collection(db, 'homework-submissions'), {
      homeworkId,
      studentId,
      studentName,
      content: content || '',
      attachments: attachments || [],
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      grade: null,
      feedback: '',
      evaluated: false
    })
    
    return NextResponse.json({ success: true, id: submissionDoc.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit homework' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const homeworkId = searchParams.get('homeworkId')
    const studentId = searchParams.get('studentId')
    
    let submissionsQuery = collection(db, 'homework-submissions')
    
    if (homeworkId) {
      submissionsQuery = query(collection(db, 'homework-submissions'), where('homeworkId', '==', homeworkId))
    } else if (studentId) {
      submissionsQuery = query(collection(db, 'homework-submissions'), where('studentId', '==', studentId))
    }
    
    const submissionsSnapshot = await getDocs(submissionsQuery)
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(submissions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, grade, feedback, status } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
    }
    
    const updateData: any = {
      evaluated: true,
      evaluatedAt: new Date().toISOString()
    }
    
    if (grade !== undefined) updateData.grade = grade
    if (feedback !== undefined) updateData.feedback = feedback
    if (status !== undefined) updateData.status = status
    
    await updateDoc(doc(db, 'homework-submissions', id), updateData)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to evaluate submission' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
    }
    
    await deleteDoc(doc(db, 'homework-submissions', id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
  }
}