export const demoGrades = [
  { Subject: 'Matematika', NumberValue: 5, Value: '5', Theme: 'Függvények', Date: '2024-01-15', Teacher: 'Nagy Péter', Type: 'Dolgozat' },
  { Subject: 'Fizika', NumberValue: 4, Value: '4', Theme: 'Elektromosság', Date: '2024-01-14', Teacher: 'Kiss Anna', Type: 'Felelet' },
  { Subject: 'Kémia', NumberValue: 3, Value: '3', Theme: 'Savak és bázisok', Date: '2024-01-13', Teacher: 'Tóth Béla', Type: 'Dolgozat' },
  { Subject: 'Történelem', NumberValue: 5, Value: '5', Theme: 'Világháború', Date: '2024-01-12', Teacher: 'Szabó Éva', Type: 'Felelet' },
  { Subject: 'Magyar irodalom', NumberValue: 4, Value: '4', Theme: 'Petőfi Sándor', Date: '2024-01-11', Teacher: 'Varga Zoltán', Type: 'Esszé' },
  { Subject: 'Angol', NumberValue: 5, Value: '5', Theme: 'Present Perfect', Date: '2024-01-10', Teacher: 'Smith John', Type: 'Teszt' },
  { Subject: 'Informatika', NumberValue: 4, Value: '4', Theme: 'Programozás', Date: '2024-01-09', Teacher: 'Kovács Gábor', Type: 'Projekt' },
  { Subject: 'Testnevelés', NumberValue: 5, Value: '5', Theme: 'Kosárlabda', Date: '2024-01-08', Teacher: 'Horváth Tamás', Type: 'Gyakorlat' },
  { Subject: 'Biológia', NumberValue: 3, Value: '3', Theme: 'Genetika', Date: '2024-01-07', Teacher: 'Molnár Ildikó', Type: 'Dolgozat' },
  { Subject: 'Földrajz', NumberValue: 4, Value: '4', Theme: 'Európa', Date: '2024-01-06', Teacher: 'Farkas Lajos', Type: 'Felelet' },
  { Subject: 'Matematika', NumberValue: 4, Value: '4', Theme: 'Integrálás', Date: '2024-01-05', Teacher: 'Nagy Péter', Type: 'Felelet' },
  { Subject: 'Fizika', NumberValue: 5, Value: '5', Theme: 'Optika', Date: '2024-01-04', Teacher: 'Kiss Anna', Type: 'Dolgozat' },
  { Subject: 'Kémia', NumberValue: 4, Value: '4', Theme: 'Szerves kémia', Date: '2024-01-03', Teacher: 'Tóth Béla', Type: 'Teszt' },
  { Subject: 'Történelem', NumberValue: 3, Value: '3', Theme: 'Trianon', Date: '2024-01-02', Teacher: 'Szabó Éva', Type: 'Dolgozat' },
  { Subject: 'Magyar irodalom', NumberValue: 5, Value: '5', Theme: 'Arany János', Date: '2024-01-01', Teacher: 'Varga Zoltán', Type: 'Esszé' },
  { Subject: 'Angol', NumberValue: 4, Value: '4', Theme: 'Conditional', Date: '2023-12-30', Teacher: 'Smith John', Type: 'Felelet' },
  { Subject: 'Informatika', NumberValue: 5, Value: '5', Theme: 'Adatbázis', Date: '2023-12-29', Teacher: 'Kovács Gábor', Type: 'Projekt' },
  { Subject: 'Testnevelés', NumberValue: 5, Value: '5', Theme: 'Futás', Date: '2023-12-28', Teacher: 'Horváth Tamás', Type: 'Gyakorlat' },
  { Subject: 'Biológia', NumberValue: 4, Value: '4', Theme: 'Evolúció', Date: '2023-12-27', Teacher: 'Molnár Ildikó', Type: 'Felelet' },
  { Subject: 'Földrajz', NumberValue: 3, Value: '3', Theme: 'Ázsia', Date: '2023-12-26', Teacher: 'Farkas Lajos', Type: 'Teszt' },
  { Subject: 'Matematika', NumberValue: 5, Value: '5', Theme: 'Deriválás', Date: '2023-12-25', Teacher: 'Nagy Péter', Type: 'Dolgozat' },
  { Subject: 'Fizika', NumberValue: 4, Value: '4', Theme: 'Mechanika', Date: '2023-12-24', Teacher: 'Kiss Anna', Type: 'Felelet' },
  { Subject: 'Kémia', NumberValue: 4, Value: '4', Theme: 'Reakciók', Date: '2023-12-23', Teacher: 'Tóth Béla', Type: 'Dolgozat' },
  { Subject: 'Történelem', NumberValue: 5, Value: '5', Theme: 'Reformkor', Date: '2023-12-22', Teacher: 'Szabó Éva', Type: 'Esszé' },
  { Subject: 'Magyar irodalom', NumberValue: 3, Value: '3', Theme: 'Jókai Mór', Date: '2023-12-21', Teacher: 'Varga Zoltán', Type: 'Felelet' },
  { Subject: 'Angol', NumberValue: 5, Value: '5', Theme: 'Passive Voice', Date: '2023-12-20', Teacher: 'Smith John', Type: 'Teszt' },
  { Subject: 'Informatika', NumberValue: 4, Value: '4', Theme: 'Hálózatok', Date: '2023-12-19', Teacher: 'Kovács Gábor', Type: 'Projekt' },
  { Subject: 'Testnevelés', NumberValue: 5, Value: '5', Theme: 'Gimnasztika', Date: '2023-12-18', Teacher: 'Horváth Tamás', Type: 'Gyakorlat' },
  { Subject: 'Biológia', NumberValue: 4, Value: '4', Theme: 'Ökológia', Date: '2023-12-17', Teacher: 'Molnár Ildikó', Type: 'Dolgozat' },
  { Subject: 'Földrajz', NumberValue: 5, Value: '5', Theme: 'Amerika', Date: '2023-12-16', Teacher: 'Farkas Lajos', Type: 'Felelet' }
]

export const demoLessons = [
  // Hétfő - normál órák
  { Subject: 'Matematika', Teacher: 'Nagy Péter', Room: '101', StartTime: '07:45', Day: 'Hétfő', status: 'normal' },
  { Subject: 'Fizika', Teacher: 'Kiss Anna', Room: '201', StartTime: '08:45', Day: 'Hétfő', status: 'normal' },
  { Subject: 'Kémia', Teacher: 'Tóth Béla', Room: '301', StartTime: '09:45', Day: 'Hétfő', status: 'cancelled', note: 'Tanár beteg' },
  { Subject: 'Történelem', Teacher: 'Szabó Éva', Room: '102', StartTime: '10:45', Day: 'Hétfő', status: 'normal' },
  { Subject: 'Magyar irodalom', Teacher: 'Varga Zoltán', Room: '103', StartTime: '11:45', Day: 'Hétfő', status: 'substituted', note: 'Helyettes: Kovács Mária' },
  { Subject: 'Angol', Teacher: 'Smith John', Room: '104', StartTime: '12:45', Day: 'Hétfő', status: 'normal' },
  { Subject: 'Informatika', Teacher: 'Kovács Gábor', Room: '401', StartTime: '13:45', Day: 'Hétfő', status: 'normal' },
  
  // Kedd
  { Subject: 'Testnevelés', Teacher: 'Horváth Tamás', Room: 'Tornaterem', StartTime: '07:45', Day: 'Kedd', status: 'normal' },
  { Subject: 'Biológia', Teacher: 'Molnár Ildikó', Room: '202', StartTime: '08:45', Day: 'Kedd', status: 'normal' },
  { Subject: 'Földrajz', Teacher: 'Farkas Lajos', Room: '203', StartTime: '09:45', Day: 'Kedd', status: 'normal' },
  { Subject: 'Matematika', Teacher: 'Nagy Péter', Room: '101', StartTime: '10:45', Day: 'Kedd', status: 'cancelled', note: 'Iskolai program miatt' },
  { Subject: 'Fizika', Teacher: 'Kiss Anna', Room: '201', StartTime: '11:45', Day: 'Kedd', status: 'normal' },
  { Subject: 'Angol', Teacher: 'Smith John', Room: '104', StartTime: '12:45', Day: 'Kedd', status: 'substituted', note: 'Helyettes: Johnson Mary' },
  
  // Szerda
  { Subject: 'Magyar irodalom', Teacher: 'Varga Zoltán', Room: '103', StartTime: '07:45', Day: 'Szerda', status: 'normal' },
  { Subject: 'Történelem', Teacher: 'Szabó Éva', Room: '102', StartTime: '08:45', Day: 'Szerda', status: 'normal' },
  { Subject: 'Kémia', Teacher: 'Tóth Béla', Room: '301', StartTime: '09:45', Day: 'Szerda', status: 'normal' },
  { Subject: 'Informatika', Teacher: 'Kovács Gábor', Room: '401', StartTime: '10:45', Day: 'Szerda', status: 'substituted', note: 'Helyettes: Szabó Péter' },
  { Subject: 'Matematika', Teacher: 'Nagy Péter', Room: '101', StartTime: '11:45', Day: 'Szerda', status: 'normal' },
  { Subject: 'Testnevelés', Teacher: 'Horváth Tamás', Room: 'Tornaterem', StartTime: '12:45', Day: 'Szerda', status: 'cancelled', note: 'Rossz idő miatt' },
  
  // Csütörtök
  { Subject: 'Angol', Teacher: 'Smith John', Room: '104', StartTime: '07:45', Day: 'Csütörtök', status: 'normal' },
  { Subject: 'Biológia', Teacher: 'Molnár Ildikó', Room: '202', StartTime: '08:45', Day: 'Csütörtök', status: 'normal' },
  { Subject: 'Földrajz', Teacher: 'Farkas Lajos', Room: '203', StartTime: '09:45', Day: 'Csütörtök', status: 'normal' },
  { Subject: 'Fizika', Teacher: 'Kiss Anna', Room: '201', StartTime: '10:45', Day: 'Csütörtök', status: 'normal' },
  { Subject: 'Magyar irodalom', Teacher: 'Varga Zoltán', Room: '103', StartTime: '11:45', Day: 'Csütörtök', status: 'cancelled', note: 'Tanári értekezlet' },
  { Subject: 'Történelem', Teacher: 'Szabó Éva', Room: '102', StartTime: '12:45', Day: 'Csütörtök', status: 'normal' },
  { Subject: 'Informatika', Teacher: 'Kovács Gábor', Room: '401', StartTime: '13:45', Day: 'Csütörtök', status: 'normal' },
  
  // Péntek
  { Subject: 'Matematika', Teacher: 'Nagy Péter', Room: '101', StartTime: '07:45', Day: 'Péntek', status: 'normal' },
  { Subject: 'Kémia', Teacher: 'Tóth Béla', Room: '301', StartTime: '08:45', Day: 'Péntek', status: 'substituted', note: 'Helyettes: Dr. Varga István' },
  { Subject: 'Testnevelés', Teacher: 'Horváth Tamás', Room: 'Tornaterem', StartTime: '09:45', Day: 'Péntek', status: 'normal' },
  { Subject: 'Angol', Teacher: 'Smith John', Room: '104', StartTime: '10:45', Day: 'Péntek', status: 'normal' },
  { Subject: 'Biológia', Teacher: 'Molnár Ildikó', Room: '202', StartTime: '11:45', Day: 'Péntek', status: 'normal' }
]