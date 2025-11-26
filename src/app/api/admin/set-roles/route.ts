import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export async function POST() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const results = []
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      if (userData.uid && userData.role) {
        try {
          await auth.setCustomUserClaims(userData.uid, { role: userData.role })
          results.push({ email: userData.email, role: userData.role, status: 'success' })
        } catch (error) {
          results.push({ email: userData.email, role: userData.role, status: 'failed' })
        }
      }
    }
    
    return NextResponse.json({ 
      message: 'Szerepkörök beállítva',
      count: results.length
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set roles' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}