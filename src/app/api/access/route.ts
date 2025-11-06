import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { studentId, action } = await request.json()

    if (!studentId || !action) {
      return NextResponse.json({ success: false, error: 'Hiányzó adatok' }, { status: 400 })
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    // Get student's access records for today
    const accessRef = db.collection('access').doc(`${studentId}_${today}`)
    const accessDoc = await accessRef.get()
    const accessData = accessDoc.data()

    if (action === 'entry') {
      // First scan - entry
      if (accessData?.entryTime) {
        return NextResponse.json({ 
          success: false, 
          error: 'Már beléptél ma!' 
        }, { status: 400 })
      }

      await accessRef.set({
        studentId,
        entryTime: now.toISOString(),
        date: today
      }, { merge: true })

      return NextResponse.json({
        success: true,
        action: 'entry',
        studentName: 'Demo Diák'
      })
    } else {
      // Second scan - exit
      if (!accessData?.entryTime) {
        return NextResponse.json({ 
          success: false, 
          error: 'Először be kell lépned!' 
        }, { status: 400 })
      }

      if (accessData?.exitTime) {
        return NextResponse.json({ 
          success: false, 
          error: 'Már kiléptél ma!' 
        }, { status: 400 })
      }

      // Check if student can exit (simplified - after 14:00)
      const currentHour = now.getHours()
      const canExit = currentHour >= 14

      if (canExit) {
        await accessRef.update({
          exitTime: now.toISOString()
        })

        return NextResponse.json({
          success: true,
          action: 'exit',
          canExit: true,
          studentName: 'Demo Diák'
        })
      } else {
        return NextResponse.json({
          success: true,
          action: 'exit',
          canExit: false,
          studentName: 'Demo Diák'
        })
      }
    }
  } catch (error) {
    console.error('Access API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Szerver hiba' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const accessDocs = await db.collection('access').orderBy('entryTime', 'desc').limit(50).get()
    const accessLogs = accessDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    return NextResponse.json(accessLogs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch access logs' }, { status: 500 })
  }
}