// Script to create test users in Firebase Auth
// Run this once: node create-test-users.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (add your service account key)
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const testUsers = [
  {
    email: 'diak@gszi.hu',
    password: 'diak123',
    displayName: 'Teszt Diák',
    customClaims: { role: 'student' }
  },
  {
    email: 'tanar@gszi.hu', 
    password: 'tanar123',
    displayName: 'Kovács Péter',
    customClaims: { role: 'teacher' }
  },
  {
    email: 'admin@gszi.hu',
    password: 'admin123',
    displayName: 'Admin Felhasználó',
    customClaims: { role: 'admin' }
  },
  {
    email: 'dj@gszi.hu',
    password: 'dj123',
    displayName: 'DJ Zoli',
    customClaims: { role: 'dj' }
  }
];

async function createTestUsers() {
  for (const user of testUsers) {
    try {
      const userRecord = await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName
      });
      
      await admin.auth().setCustomUserClaims(userRecord.uid, user.customClaims);
      
      console.log(`Created user: ${user.email} with role: ${user.customClaims.role}`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
}

createTestUsers().then(() => {
  console.log('All test users created successfully');
  process.exit(0);
});