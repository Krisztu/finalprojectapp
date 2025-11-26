import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'demo-project',
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'demo@demo.iam.gserviceaccount.com',
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'demo-key'
      })
    })
  } catch (error) {
    console.log('Firebase Admin hiba')
  }
}

export const auth = getAuth()
export const db = getFirestore()