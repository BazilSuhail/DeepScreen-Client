# 🚀 Quick Start Guide - P2P Video Meeting

## The Problem
The default PeerJS cloud server (`0.peerjs.com`) is no longer available, so you need to run your own PeerJS signaling server.

## The Solution (3 Easy Options)

### ✅ Option 1: Double-Click Start (Easiest - Windows Only)
1. Double-click `start-dev.bat` in the project root
2. Two terminal windows will open automatically
3. Wait for both servers to start
4. Navigate to `http://localhost:3000/interview`

### ✅ Option 2: NPM Scripts (Recommended)
```bash
# Terminal 1 - Start PeerJS Server
npm run peer-server

# Terminal 2 - Start Next.js App  
npm run dev
```

### ✅ Option 3: Manual NPX (No Installation)
```bash
# Terminal 1
npx -y peer --port 9000 --key peerjs --path /myapp

# Terminal 2
npm run dev
```

## How to Use the P2P Meeting

1. **Start both servers** (using any option above)
2. **Navigate to** `http://localhost:3000/interview`
3. **Create a room** → Click "Create New Room" → Click "Generate Room ID"
4. **Share your Room ID** → Click the copy icon in the bottom bar
5. **Have your peer join** → They paste your Room ID and click "Join Room"
6. **Enjoy your P2P video call!** 🎉

## Troubleshooting

### "WebSocket connection failed"
- ✅ Make sure the PeerJS server is running on port 9000
- ✅ Check if another application is using port 9000
- ✅ Try restarting both servers

### "Unable to connect to PeerJS server"
- ✅ Verify the PeerJS server terminal shows it's running
- ✅ Check your firewall isn't blocking port 9000
- ✅ Try using `localhost` instead of `127.0.0.1`

### "Failed to access camera/microphone"
- ✅ Grant browser permissions for camera and microphone
- ✅ Check if another app is using your camera
- ✅ Try refreshing the page

## What's Running?

- **PeerJS Server** (port 9000): Handles peer signaling and connection brokering
- **Next.js App** (port 3000): Your main application with the video meeting interface

## For Production

See `docs/PEERJS_SERVER_SETUP.md` for deployment options including:
- Heroku
- Railway/Render
- Docker
- Custom VPS

## Need More Help?

- 📖 [Full P2P Meeting Documentation](./docs/P2P_MEETING.md)
- 🔧 [PeerJS Server Setup Guide](./docs/PEERJS_SERVER_SETUP.md)
- 🌐 [PeerJS Official Docs](https://peerjs.com/docs/)
