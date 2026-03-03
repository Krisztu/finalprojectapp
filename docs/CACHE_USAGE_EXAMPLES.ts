// PÉLDA: Hogyan cseréld le a jelenlegi read műveleteket cache-elt változatokra

// ============================================
// ELŐTTE (Sok read, lassú)
// ============================================

useEffect(() => {
  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'))
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }
  fetchUsers()
}, [])

useEffect(() => {
  const fetchGrades = async () => {
    const q = query(collection(db, 'grades'), where('studentId', '==', user.id))
    const snapshot = await getDocs(q)
    setGrades(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }
  fetchGrades()
}, [user.id])


// ============================================
// UTÁNA (Cache-elt, gyors)
// ============================================

import { getCachedUsers, getCachedGrades, invalidateUsers, invalidateGrades } from '@/lib/dataCache'

useEffect(() => {
  const fetchUsers = async () => {
    const users = await getCachedUsers() // Cache-ből vagy DB-ből
    setUsers(users)
  }
  fetchUsers()
}, [])

useEffect(() => {
  const fetchGrades = async () => {
    const grades = await getCachedGrades(user.id) // Cache-ből vagy DB-ből
    setGrades(grades)
  }
  if (user.id) {
    fetchGrades()
  }
}, [user.id])


// ============================================
// MÓDOSÍTÁS UTÁN INVALIDÁLÁS
// ============================================

// Új jegy hozzáadása
const handleAddGrade = async () => {
  await addDoc(collection(db, 'grades'), newGrade)
  invalidateGrades(studentId) // Cache törlése
  showAlert('Jegy sikeresen rögzítve!', 'success')
}

// Felhasználó törlése
const handleDeleteUser = async (userId: string) => {
  await deleteDoc(doc(db, 'users', userId))
  invalidateUsers() // Cache törlése
  showAlert('Felhasználó törölve!', 'success')
}


// ============================================
// LAZY LOADING (Csak aktív tab-nál töltsd be)
// ============================================

useEffect(() => {
  const loadTabData = async () => {
    switch (activeTab) {
      case 'grades':
        const grades = await getCachedGrades(user.id)
        setGrades(grades)
        break
      case 'homework':
        const homework = await getCachedHomework(user.class)
        setHomework(homework)
        break
      case 'schedule':
        const lessons = await getCachedLessons(user.class)
        setLessons(lessons)
        break
    }
  }
  loadTabData()
}, [activeTab]) // Csak activeTab változáskor


// ============================================
// REAL-TIME LISTENER OPTIMALIZÁLÁS
// ============================================

// ELŐTTE (Minden változásnál újratölt mindent)
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'grades'), (snapshot) => {
    setGrades(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  })
  return unsubscribe
}, [])

// UTÁNA (Csak változásokat kezeli)
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'grades'), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        setGrades(prev => [...prev, { id: change.doc.id, ...change.doc.data() }])
      }
      if (change.type === 'modified') {
        setGrades(prev => prev.map(g => 
          g.id === change.doc.id ? { id: change.doc.id, ...change.doc.data() } : g
        ))
      }
      if (change.type === 'removed') {
        setGrades(prev => prev.filter(g => g.id !== change.doc.id))
      }
    })
  })
  return unsubscribe
}, [])


// ============================================
// PAGINATION (Nagy listák esetén)
// ============================================

import { query, orderBy, limit, startAfter } from 'firebase/firestore'

const [lastVisible, setLastVisible] = useState(null)
const PAGE_SIZE = 20

const loadMoreGrades = async () => {
  let q = query(
    collection(db, 'grades'),
    orderBy('date', 'desc'),
    limit(PAGE_SIZE)
  )
  
  if (lastVisible) {
    q = query(q, startAfter(lastVisible))
  }
  
  const snapshot = await getDocs(q)
  setLastVisible(snapshot.docs[snapshot.docs.length - 1])
  setGrades(prev => [...prev, ...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))])
}


// ============================================
// BATCH READS (Több dokumentum egyszerre)
// ============================================

import { documentId, where } from 'firebase/firestore'

// ELŐTTE (3 külön read)
const user1 = await getDoc(doc(db, 'users', id1))
const user2 = await getDoc(doc(db, 'users', id2))
const user3 = await getDoc(doc(db, 'users', id3))

// UTÁNA (1 read)
const q = query(
  collection(db, 'users'),
  where(documentId(), 'in', [id1, id2, id3])
)
const snapshot = await getDocs(q)
const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))


// ============================================
// FELESLEGES useEffect-EK ÖSSZEVONÁSA
// ============================================

// ELŐTTE (3 külön useEffect, 3 külön read)
useEffect(() => {
  fetchUsers()
}, [])

useEffect(() => {
  fetchGrades()
}, [])

useEffect(() => {
  fetchLessons()
}, [])

// UTÁNA (1 useEffect, párhuzamos read-ek)
useEffect(() => {
  const fetchAllData = async () => {
    const [users, grades, lessons] = await Promise.all([
      getCachedUsers(),
      getCachedGrades(user.id),
      getCachedLessons(user.class)
    ])
    setUsers(users)
    setGrades(grades)
    setLessons(lessons)
  }
  fetchAllData()
}, [])


// ============================================
// LOCAL PERSISTENCE ENGEDÉLYEZÉSE
// ============================================

// src/lib/firebase.ts fájlban
import { enableIndexedDbPersistence } from 'firebase/firestore'

enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Offline persistence enabled')
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.log('Browser does not support persistence')
    }
  })
