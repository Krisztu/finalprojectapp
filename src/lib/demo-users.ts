// Demo felhasználók különböző szerepkörökkel
export const demoUsers = {
  // Diák
  student: {
    email: 'diak@gszi.hu',
    password: 'diak123456',
    role: 'student',
    name: 'Teszt Diák',
    class: '12.A'
  },
  
  // Tanár
  teacher: {
    email: 'tanar@gszi.hu', 
    password: 'tanar123456',
    role: 'teacher',
    name: 'Kovács Péter',
    subject: 'Matematika',
    classes: ['9.A', '10.B', '12.A']
  },
  
  // Admin
  admin: {
    email: 'admin@gszi.hu',
    password: 'admin123456', 
    role: 'admin',
    name: 'Admin Felhasználó'
  },
  
  // DJ
  dj: {
    email: 'dj@gszi.hu',
    password: 'dj123456',
    role: 'dj', 
    name: 'DJ Zoli'
  }
}

// Tanári órarend demo adatok
export const teacherLessons = [
  { Day: 'Hétfő', StartTime: '7:45', Subject: 'Matematika', Class: '9.A', Room: '101' },
  { Day: 'Hétfő', StartTime: '8:45', Subject: 'Matematika', Class: '10.B', Room: '101' },
  { Day: 'Hétfő', StartTime: '9:45', Subject: 'Matematika', Class: '12.A', Room: '101' },
  { Day: 'Kedd', StartTime: '7:45', Subject: 'Matematika', Class: '9.A', Room: '101' },
  { Day: 'Kedd', StartTime: '10:45', Subject: 'Matematika', Class: '12.A', Room: '101' },
  { Day: 'Szerda', StartTime: '8:45', Subject: 'Matematika', Class: '10.B', Room: '101' },
  { Day: 'Szerda', StartTime: '11:45', Subject: 'Matematika', Class: '9.A', Room: '101' },
  { Day: 'Csütörtök', StartTime: '7:45', Subject: 'Matematika', Class: '12.A', Room: '101' },
  { Day: 'Csütörtök', StartTime: '9:45', Subject: 'Matematika', Class: '10.B', Room: '101' },
  { Day: 'Péntek', StartTime: '8:45', Subject: 'Matematika', Class: '9.A', Room: '101' }
]

// Osztályok listája
export const demoClasses = [
  { name: '9.A', students: 28 },
  { name: '9.B', students: 26 },
  { name: '10.A', students: 24 },
  { name: '10.B', students: 27 },
  { name: '11.A', students: 22 },
  { name: '11.B', students: 25 },
  { name: '12.A', students: 20 },
  { name: '12.B', students: 23 }
]