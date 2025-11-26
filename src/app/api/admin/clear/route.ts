import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc } from 'firebase/firestore'

export async function DELETE(request: NextRequest) {
  try {
    // Töröljük az összes mulasztást
    const absencesSnapshot = await getDocs(collection(db, 'absences'))
    const absenceDeletePromises = absencesSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(absenceDeletePromises)
    
    // Töröljük az összes jelenléti adatot
    const attendanceSnapshot = await getDocs(collection(db, 'attendance'))
    const attendanceDeletePromises = attendanceSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(attendanceDeletePromises)
    
    // Töröljük az összes órát
    const lessonsSnapshot = await getDocs(collection(db, 'lessons'))
    const lessonDeletePromises = lessonsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(lessonDeletePromises)
    
    return NextResponse.json({ 
      success: true, 
      message: `Adatbázis törölve: ${absencesSnapshot.docs.length} mulasztás, ${attendanceSnapshot.docs.length} jelenléti adat és ${lessonsSnapshot.docs.length} óra törölve`,
      absencesDeleted: absencesSnapshot.docs.length,
      attendanceDeleted: attendanceSnapshot.docs.length,
      lessonsDeleted: lessonsSnapshot.docs.length
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Adatbázis törlése sikertelen'
    }, { status: 500 })
  }
}