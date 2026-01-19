# PeerJS Server Setup Guide

Since the default PeerJS cloud server (`0.peerjs.com`) is no longer available, you need to run your own PeerJS server. This guide provides multiple options for setting up a PeerJS server.

## Quick Start (Recommended)

### Option 1: Run PeerJS Server Locally with NPX

The fastest way to get started is using npx (no installation required):

```bash
npx peerjs --port 9000 --key peerjs --path /myapp
```

This will start a PeerJS server on `localhost:9000` with the path `/myapp`.

### Option 2: Install and Run Globally

```bash
# Install peerjs-server globally
npm install -g peer

# Run the server
peerjs --port 9000 --key peerjs --path /myapp
```

### Option 3: Add to Your Project

1. Install peerjs-server as a dev dependency:
```bash
npm install --save-dev peer
```

2. Add a script to your `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "peer-server": "peerjs --port 9000 --key peerjs --path /myapp",
    "dev:full": "concurrently \"npm run dev\" \"npm run peer-server\""
  }
}
```

3. Install concurrently to run both servers:
```bash
npm install --save-dev concurrently
```

4. Run both servers:
```bash
npm run dev:full
```

## Custom PeerJS Server (Advanced)

For more control, create a custom server:

### 1. Create `peerjs-server.js` in your project root:

```javascript
const { PeerServer } = require('peer');

const peerServer = PeerServer({
  port: 9000,
  path: '/myapp',
  proxied: false,
  allow_discovery: true
});

peerServer.on('connection', (client) => {
  console.log('Client connected:', client.getId());
});

peerServer.on('disconnect', (client) => {
  console.log('Client disconnected:', client.getId());
});

console.log('PeerJS server running on port 9000');
```

### 2. Install peer package:
```bash
npm install --save-dev peer
```

### 3. Add script to `package.json`:
```json
{
  "scripts": {
    "peer-server": "node peerjs-server.js"
  }
}
```

### 4. Run the server:
```bash
npm run peer-server
```

## Production Deployment

### Option 1: Deploy to Heroku

1. Create a `server.js` file:
```javascript
const express = require('express');
const { ExpressPeerServer } = require('peer');

const app = express();
const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  path: '/myapp',
  allow_discovery: true
});

app.use('/peerjs', peerServer);

peerServer.on('connection', (client) => {
  console.log('Client connected:', client.getId());
});
```

2. Create `Procfile`:
```
web: node server.js
```

3. Deploy to Heroku:
```bash
heroku create your-app-name
git push heroku main
```

### Option 2: Deploy to Railway/Render

1. Use the same `server.js` from above
2. Create a new project on Railway or Render
3. Connect your GitHub repository
4. Set the start command to `node server.js`
5. Deploy

### Option 3: Deploy with Docker

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

RUN npm install -g peer

EXPOSE 9000

CMD ["peerjs", "--port", "9000", "--key", "peerjs", "--path", "/myapp"]
```

2. Build and run:
```bash
docker build -t peerjs-server .
docker run -p 9000:9000 peerjs-server
```

## Update Frontend Configuration

Once your PeerJS server is running, update the peer configuration in `app/interview/page.jsx`:

### For Local Development:
```javascript
const peerOptions = {
    host: 'localhost',
    port: 9000,
    path: '/myapp',
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    }
};
```

### For Production:
```javascript
const peerOptions = {
    host: 'your-peerjs-server.herokuapp.com', // Your deployed server URL
    secure: true, // Use HTTPS
    port: 443,
    path: '/myapp',
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    }
};
```

## Public PeerJS Servers (Alternative)

If you don't want to run your own server, you can use these public alternatives:

### metered.ca (Free Tier Available)
```javascript
const peer = new Peer(myPeerId, {
    host: 'peerjs.92k.de',
    secure: true,
    port: 443,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    }
});
```

**Note:** Public servers may have rate limits and are not recommended for production.

## Troubleshooting

### Error: "Unable to connect to PeerJS server"
- Ensure the PeerJS server is running
- Check if the port (9000) is not blocked by firewall
- Verify the host and path match your server configuration

### Error: "WebSocket connection failed"
- Check if the server is running on the correct port
- Ensure CORS is properly configured if using a custom server
- Verify SSL/TLS certificates if using HTTPS

### Peers can't connect to each other
- Ensure both peers are connected to the same PeerJS server
- Check if STUN/TURN servers are properly configured
- Verify firewall settings allow WebRTC connections

## Testing Your Setup

1. Start the PeerJS server
2. Open your application in two different browser windows
3. Create a room in one window
4. Copy the Room ID
5. Join the room from the second window
6. You should see both video streams

## Environment Variables

For production, use environment variables:

```javascript
const PEER_HOST = process.env.NEXT_PUBLIC_PEER_HOST || 'localhost';
const PEER_PORT = process.env.NEXT_PUBLIC_PEER_PORT || 9000;
const PEER_PATH = process.env.NEXT_PUBLIC_PEER_PATH || '/myapp';
const PEER_SECURE = process.env.NEXT_PUBLIC_PEER_SECURE === 'true';

const peerOptions = {
    host: PEER_HOST,
    port: parseInt(PEER_PORT),
    path: PEER_PATH,
    secure: PEER_SECURE,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    }
};
```

Then create `.env.local`:
```
NEXT_PUBLIC_PEER_HOST=localhost
NEXT_PUBLIC_PEER_PORT=9000
NEXT_PUBLIC_PEER_PATH=/myapp
NEXT_PUBLIC_PEER_SECURE=false
```

## Resources

- [PeerJS Documentation](https://peerjs.com/docs/)
- [PeerJS Server GitHub](https://github.com/peers/peerjs-server)
- [WebRTC Documentation](https://webrtc.org/)
