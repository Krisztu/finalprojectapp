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
    console.error('Music POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült beküldeni a zenei kérést' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const snapshot = await db.collection('musicRequests')
      .limit(50)
      .get()

    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    requests.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Music GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni a zenei kéréseket' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Zenei kérés azonosító szükséges' }, { status: 400 })
    }

    const docRef = db.collection('musicRequests').doc(id)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Zenei kérés nem található' }, { status: 404 })
    }

    await docRef.delete()

    return NextResponse.json({ success: true, message: 'Zenei kérés sikeresen törölve' })
  } catch (error) {
    console.error('Music DELETE Error:', error)
    return NextResponse.json({ error: 'Nem sikerült törölni a zenei kérést' }, { status: 500 })
  }
}