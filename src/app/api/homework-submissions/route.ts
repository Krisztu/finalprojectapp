import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { homeworkId, studentId, studentName, content, attachments } = body

    if (!homeworkId || !studentId || !studentName) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const submissionDoc = await db.collection('homework-submissions').add({
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
    console.error('Homework Submissions POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült beadni a házi feladatot' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const homeworkId = searchParams.get('homeworkId')
    const studentId = searchParams.get('studentId')

    let submissionsQuery: FirebaseFirestore.Query = db.collection('homework-submissions')

    if (homeworkId) {
      submissionsQuery = submissionsQuery.where('homeworkId', '==', homeworkId)
    } else if (studentId) {
      submissionsQuery = submissionsQuery.where('studentId', '==', studentId)
    }

    const submissionsSnapshot = await submissionsQuery.get()
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Homework Submissions GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni a beadásokat' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, grade, feedback, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Beadás azonosító szükséges' }, { status: 400 })
    }

    const updateData: any = {
      evaluated: true,
      evaluatedAt: new Date().toISOString()
    }

    if (grade !== undefined) updateData.grade = grade
    if (feedback !== undefined) updateData.feedback = feedback
    if (status !== undefined) updateData.status = status

    await db.collection('homework-submissions').doc(id).update(updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Homework Submissions PUT Error:', error)
    return NextResponse.json({ error: 'Nem sikerült értékelni a beadást' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Beadás azonosító szükséges' }, { status: 400 })
    }

    await db.collection('homework-submissions').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Homework Submissions DELETE Error:', error)
    return NextResponse.json({ error: 'Nem sikerült törölni a beadást' }, { status: 500 })
  }
}