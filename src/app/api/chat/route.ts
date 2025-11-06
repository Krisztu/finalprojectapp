import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { message, userId, userName } = await request.json()
    
    const chatMessage = {
      message,
      userId,
      userName,
      createdAt: new Date().toISOString()
    }
    
    const docRef = await db.collection('chatMessages').add(chatMessage)
    
    return NextResponse.json({ id: docRef.id, ...chatMessage })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const snapshot = await db.collection('chatMessages')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse()
    
    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}