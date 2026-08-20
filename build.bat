@echo off
cd /d "c:\Users\Himanshu patidar\OneDrive\Desktop\sompro\frontend"
echo [LOG] Starting build script... > "c:\Users\Himanshu patidar\OneDrive\Desktop\sompro\frontend\build_output.txt"
set "PATH=%PATH%;C:\Program Files\nodejs"
echo [LOG] Running npm install... >> "c:\Users\Himanshu patidar\OneDrive\Desktop\sompro\frontend\build_output.txt"
call npm install >> "c:\Users\Himanshu patidar\OneDrive\Desktop\sompro\frontend\build_output.txt" 2>&1
echo [LOG] Running npm run build... >> "c:\Users\Himanshu patidar\OneDrive\Desktop\sompro\frontend\build_output.txt"
call npm run build >> "c:\Users\Himanshu patidar\OneDrive\Desktop\sompro\frontend\build_output.txt" 2>&1
echo [LOG] Build script finished. >> "c:\Users\Himanshu patidar\OneDrive\Desktop\sompro\frontend\build_output.txt"
