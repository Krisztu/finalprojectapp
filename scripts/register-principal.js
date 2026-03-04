require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const auth = admin.auth();
const db = admin.firestore();

async function registerPrincipal() {
  try {
    const userRecord = await auth.createUser({
      email: 'igazgato@lumine.edu.hu',
      password: 'Igazgato123456',
      displayName: 'Igazgató'
    });

    console.log('✓ Firebase Auth user created:', userRecord.uid);

    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'principal',
      name: 'Igazgató'
    });

    console.log('✓ Custom claims set');

    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: 'igazgato@lumine.edu.hu',
      fullName: 'Igazgató',
      role: 'principal',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✓ Firestore document created');
    console.log('\n✅ Igazgató sikeresen regisztrálva!');
    console.log('Email: igazgato@lumine.edu.hu');
    console.log('Jelszó: Igazgato123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hiba:', error.message);
    process.exit(1);
  }
}

registerPrincipal();
