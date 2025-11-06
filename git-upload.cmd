@echo off
cd /d "d:\finalproject"
"C:\Program Files\Git\cmd\git.exe" init
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Initial commit - GSZI APP"
"C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/Krisztu/finalprojectapp.git
"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" push -u origin main
pause