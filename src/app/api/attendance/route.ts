import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, query, where, and, getDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, teacherId, date, startTime, subject, className, topic, students } = body
    
    if (!lessonId || !teacherId || !date || !students) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Store individual absence records for each absent student
    const absencePromises = students
      .filter((student: any) => !student.present)
      .map((student: any) => 
        addDoc(collection(db, 'absences'), {
          studentId: student.studentId,
          studentName: student.studentName,
          lessonId,
          teacherId,
          date,
          startTime,
          subject,
          className,
          topic: topic || '',
          excused: student.excused || false,
          createdAt: new Date().toISOString()
        })
      )
    
    await Promise.all(absencePromises)
    
    // Also store the full attendance record
    const attendanceDoc = await addDoc(collection(db, 'attendance'), {
      lessonId,
      teacherId,
      date,
      startTime,
      subject,
      className,
      topic: topic || '',
      students,
      createdAt: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, id: attendanceDoc.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')
    const className = searchParams.get('class')
    const date = searchParams.get('date')
    
    if (studentId) {
      // For students, return individual absence records
      const absencesQuery = query(collection(db, 'absences'), where('studentId', '==', studentId))
      const absencesSnapshot = await getDocs(absencesQuery)
      const absences = absencesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return NextResponse.json(absences)
    }
    
    // For teachers, return full attendance records
    let attendanceQuery = collection(db, 'attendance')
    
    if (teacherId) {
      attendanceQuery = query(collection(db, 'attendance'), where('teacherId', '==', teacherId))
    } else if (className) {
      attendanceQuery = query(collection(db, 'attendance'), where('className', '==', className))
    }
    
    const attendanceSnapshot = await getDocs(attendanceQuery)
    const attendance = attendanceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, topic, students, studentId, excused, excusedBy } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const attendanceRef = doc(db, 'attendance', id)
    
    if (topic !== undefined && students) {
      // Update full attendance record
      await updateDoc(attendanceRef, { 
        topic,
        students,
        updatedAt: new Date().toISOString()
      })
      
      // Get original attendance data
      const attendanceDocRef = doc(db, 'attendance', id)
      const attendanceDoc = await getDoc(attendanceDocRef)
      const originalData = attendanceDoc.data()
      
      // Delete all absence records for this specific lesson
      const absencesQuery = query(
        collection(db, 'absences'), 
        and(
          where('lessonId', '==', originalData?.lessonId),
          where('date', '==', originalData?.date),
          where('startTime', '==', originalData?.startTime)
        )
      )
      const absencesSnapshot = await getDocs(absencesQuery)
      
      // Delete old records
      for (const docSnapshot of absencesSnapshot.docs) {
        await docSnapshot.ref.delete()
      }
      
      // Create new absence records for absent students
      for (const student of students) {
        if (!student.present) {
          await addDoc(collection(db, 'absences'), {
            studentId: student.studentId,
            studentName: student.studentName,
            lessonId: originalData?.lessonId,
            teacherId: originalData?.teacherId,
            date: originalData?.date,
            startTime: originalData?.startTime,
            subject: originalData?.subject,
            className: originalData?.className,
            topic: topic || originalData?.topic || '',
            excused: student.excused || false,
            createdAt: new Date().toISOString()
          })
        }
      }
    } else if (studentId) {
      // Update specific student excuse status
      const attendanceDocRef = doc(db, 'attendance', id)
      const attendanceDoc = await getDoc(attendanceDocRef)
      
      if (!attendanceDoc.exists()) {
        return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
      }
      
      const attendanceData = attendanceDoc.data()
      const updatedStudents = attendanceData.students.map((student: any) => {
        if (student.studentId === studentId) {
          return {
            ...student,
            excused: excused || false,
            excusedBy: excusedBy || '',
            excusedAt: excused ? new Date().toISOString() : null
          }
        }
        return student
      })
      
      await updateDoc(attendanceRef, { students: updatedStudents })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
  }
}