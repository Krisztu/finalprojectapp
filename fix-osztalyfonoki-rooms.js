const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const db = admin.firestore();

async function fixOsztalyfonokiRooms() {
  try {
    const lessonsRef = db.collection('lessons');
    const snapshot = await lessonsRef.where('subject', '==', 'Osztályfőnöki').get();
    
    console.log(`Találtam ${snapshot.size} Osztályfőnöki órát`);
    
    const batch = db.batch();
    const roomsByClass = {};
    let roomCounter = 101;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const className = data.className;
      
      if (!roomsByClass[className]) {
        roomsByClass[className] = `${roomCounter}`;
        roomCounter++;
      }
      
      batch.update(doc.ref, { room: roomsByClass[className] });
      console.log(`${className} -> Terem: ${roomsByClass[className]}`);
    });
    
    await batch.commit();
    console.log('Osztályfőnöki termek frissítve!');
    console.log('Terem elosztás:', roomsByClass);
    
  } catch (error) {
    console.error('Hiba:', error);
  } finally {
    process.exit();
  }
}

fixOsztalyfonokiRooms();
