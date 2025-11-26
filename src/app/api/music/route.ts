import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, doc, deleteDoc, getDoc } from 'firebase/firestore'

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

    const docRef = await addDoc(collection(db, 'musicRequests'), musicRequest)

    return NextResponse.json({ id: docRef.id, ...musicRequest })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit music request' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Note: orderBy might still fail if index is missing, but let's try with it first.
    // If it fails, we can remove it or catch the specific error.
    // For now, I'll keep it simple and maybe remove orderBy if it persists.
    // Actually, let's try WITHOUT orderBy first to be safe, as we saw 500s before.
    // Or better, catch the error and try without it? No, that's complex.
    // Let's use the query without orderBy for now to ensure it works.

    const q = query(collection(db, 'musicRequests'), limit(50));
    const snapshot = await getDocs(q);

    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Sort manually in memory if needed
    requests.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Music GET Error:', error);
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

    const docRef = doc(db, 'musicRequests', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Music request not found' }, { status: 404 })
    }

    await deleteDoc(docRef)

    return NextResponse.json({ success: true, message: 'Music request deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete music request' }, { status: 500 })
  }
}