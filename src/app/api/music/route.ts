import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { url, platform, userId, userName, userClass } = await request.json()
    
    const musicRequest = {
      url,
      platform,
      userId: userId || 'anonymous',
      userName: userName || 'Nevtelen diak',
      userClass: userClass || 'N/A',
      createdAt: new Date().toISOString()
    }
    
    const docRef = await db.collection('musicRequests').add(musicRequest)
    
    return NextResponse.json({ id: docRef.id, ...musicRequest })
  } catch (error) {
    console.error('Music API error:', error)
    return NextResponse.json({ error: 'Failed to submit music request' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const snapshot = await db.collection('musicRequests')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()
    
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Music GET API error:', error)
    return NextResponse.json({ error: 'Failed to fetch music requests' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Music request ID required' }, { status: 400 })
    }
    
    console.log('Deleting music request with ID:', id)
    
    // Ellenőrizzük, hogy létezik-e a dokumentum
    const docRef = db.collection('musicRequests').doc(id)
    const doc = await docRef.get()
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Music request not found' }, { status: 404 })
    }
    
    await docRef.delete()
    console.log('Music request deleted successfully:', id)
    
    return NextResponse.json({ success: true, message: 'Music request deleted successfully' })
  } catch (error) {
    console.error('Music DELETE API error:', error)
    return NextResponse.json({ error: 'Failed to delete music request' }, { status: 500 })
  }
}