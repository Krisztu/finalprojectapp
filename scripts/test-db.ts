import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('Environment check:');
console.log('Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID ? 'Set' : 'Missing');
console.log('Client Email:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'Set' : 'Missing');
console.log('Private Key:', process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'Set' : 'Missing');

if (!getApps().length) {
    try {
        const serviceAccount = {
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
            console.error("Missing critical environment variables for Firebase Admin.");
        } else {
            initializeApp({
                credential: cert(serviceAccount)
            });
            console.log("Firebase Admin initialized.");
        }
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

const db = getFirestore();

async function test() {
    try {
        console.log('Attempting to fetch users...');
        const snapshot = await db.collection('users').get();
        console.log(`Success! Found ${snapshot.size} users.`);
        snapshot.docs.forEach(doc => {
            console.log(`- ${doc.id}: ${doc.data().email} (${doc.data().role})`);
        });
    } catch (e) {
        console.error('Failed to fetch users:', e);
    }
}

test();
