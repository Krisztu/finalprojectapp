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

async function fixRoles() {
  try {
    console.log('🔍 Felhasználók ellenőrzése...\n');

    // 1. Töröljük a rossz igazgató fiókot
    try {
      const igazgatoUser = await auth.getUserByEmail('igazgato@lumine.edu.hu');
      await auth.deleteUser(igazgatoUser.uid);
      await db.collection('users').doc(igazgatoUser.uid).delete();
      console.log('✓ Rossz igazgató fiók törölve');
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        console.log('⚠ Igazgató fiók nem található vagy már törölve');
      }
    }

    // 2. Létrehozzuk az új igazgató fiókot
    const principalRecord = await auth.createUser({
      email: 'igazgato@lumine.edu.hu',
      password: 'Igazgato123456',
      displayName: 'Igazgató'
    });

    await auth.setCustomUserClaims(principalRecord.uid, {
      role: 'principal',
      name: 'Igazgató'
    });

    await db.collection('users').doc(principalRecord.uid).set({
      uid: principalRecord.uid,
      email: 'igazgato@lumine.edu.hu',
      fullName: 'Igazgató',
      role: 'principal',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✓ Új igazgató fiók létrehozva:', principalRecord.uid);

    // 3. Ellenőrizzük az összes felhasználót
    const usersSnapshot = await db.collection('users').get();
    console.log(`\n📊 Összes felhasználó: ${usersSnapshot.size}\n`);

    const roleCounts = {};
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const role = userData.role || 'nincs szerepkör';
      
      roleCounts[role] = (roleCounts[role] || 0) + 1;

      // Szinkronizáljuk a custom claims-t
      try {
        await auth.setCustomUserClaims(doc.id, {
          role: userData.role,
          name: userData.fullName
        });
      } catch (error) {
        console.log(`⚠ Nem sikerült frissíteni: ${userData.email}`);
      }
    }

    console.log('Szerepkörök megoszlása:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });

    console.log('\n✅ Szerepkörök javítva!');
    console.log('\n📝 Igazgató belépési adatok:');
    console.log('Email: igazgato@lumine.edu.hu');
    console.log('Jelszó: Igazgato123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hiba:', error.message);
    process.exit(1);
  }
}

fixRoles();
