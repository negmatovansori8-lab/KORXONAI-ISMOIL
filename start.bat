@echo off
echo Starting Oil Enterprise Management System...
cd /d "%~dp0backend"
call npx prisma generate
call npx prisma db push
call npm run seed
start "OEMS API" cmd /k npm run dev
cd /d "%~dp0frontend"
start "OEMS WEB" cmd /k npm run dev
echo Open http://localhost:3000
