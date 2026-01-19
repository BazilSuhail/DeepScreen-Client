@echo off
echo Starting DeepScreen Development Environment...
echo.
echo Starting PeerJS Server on port 9000...
start "PeerJS Server" cmd /k "npx -y peer --port 9000 --key peerjs --path /myapp"
timeout /t 3 /nobreak >nul
echo.
echo Starting Next.js Development Server...
start "Next.js Dev" cmd /k "npm run dev"
echo.
echo Both servers are starting in separate windows.
echo - PeerJS Server: http://localhost:9000
echo - Next.js App: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
