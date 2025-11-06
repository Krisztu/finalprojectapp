import { auth } from './firebase-admin'

export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    throw new Error('Invalid token')
  }
}