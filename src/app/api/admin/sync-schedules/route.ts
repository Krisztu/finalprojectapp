import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {

    
    // Lekérjük az összes diákot
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const students = usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => (user.role === 'student' || user.role === 'dj') && user.class)
    

    
    let updatedCount = 0
    
    for (const student of students) {

      
      // Ellenőrizzük, van-e már órarendje
      const existingLessonsQuery = query(
        collection(db, 'lessons'),
        where('userId', '==', student.id)
      )
      
      const existingLessonsSnapshot = await getDocs(existingLessonsQuery)
      
      if (existingLessonsSnapshot.empty) {

        
        let sourceUserId = null
        
        // Keressük meg az osztály más diákjait
        const classmatesQuery = query(
          collection(db, 'users'),
          where('class', '==', student.class)
        )
        
        const classmatesSnapshot = await getDocs(classmatesQuery)

        
        for (const classmateDoc of classmatesSnapshot.docs) {
          const classmateId = classmateDoc.id
          const classmateData = classmateDoc.data()
          
          if (classmateId !== student.id) {
            const classmateScheduleQuery = query(
              collection(db, 'lessons'),
              where('userId', '==', classmateId)
            )
            
            const classmateScheduleSnapshot = await getDocs(classmateScheduleQuery)
            
            if (!classmateScheduleSnapshot.empty) {
              sourceUserId = classmateId

              break
            }
          }
        }
        

        
        // Ha találtunk forrás órarendet, másoljuk át
        if (sourceUserId) {
          const sourceLessonsQuery = query(
            collection(db, 'lessons'),
            where('userId', '==', sourceUserId)
          )
          
          const sourceLessonsSnapshot = await getDocs(sourceLessonsQuery)
          
          if (!sourceLessonsSnapshot.empty) {
            const lessonPromises = sourceLessonsSnapshot.docs.map(lessonDoc => {
              const lessonData = lessonDoc.data()
              return addDoc(collection(db, 'lessons'), {
                ...lessonData,
                userId: student.id,
                createdAt: new Date().toISOString()
              })
            })
            
            await Promise.all(lessonPromises)
            updatedCount++

          } else {

          }
        } else {

        }
      } else {

      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Schedule sync completed: ${updatedCount} students updated`,
      studentsUpdated: updatedCount,
      totalStudents: students.length
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to sync schedules'
    }, { status: 500 })
  }
}