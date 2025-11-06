@echo off
echo Initializing git repository...
git init

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Initial commit - GSZI APP"

echo Adding remote origin...
git remote add origin https://github.com/Krisztu/finalprojectapp.git

echo Setting main branch...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo Done!
pause