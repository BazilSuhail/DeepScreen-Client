# P2P Video Meeting

A secure, peer-to-peer video meeting application built with PeerJS and WebRTC.

## Features

- **🔒 End-to-End Encrypted**: Direct peer-to-peer connection with no server storage
- **📹 HD Video & Audio**: Crystal clear communication with low latency
- **💬 Real-time Chat**: Text messaging during video calls
- **🎨 Premium UI**: Matching the DeepScreen aesthetic with smooth animations
- **🔗 Simple Room System**: Create or join rooms with unique IDs

## How It Works

### Creating a Room

1. Navigate to `/interview` or click "Start Meeting" from `/p2p-meet`
2. Click "Create New Room"
3. Click "Generate Room ID"
4. Your unique Room ID will appear in the bottom bar
5. Click the copy icon to share the Room ID with others
6. Wait for someone to join using your Room ID

### Joining a Room

1. Navigate to `/interview` or click "Start Meeting" from `/p2p-meet`
2. Click "Join Existing Room"
3. Paste the Room ID you received
4. Click "Join Room"
5. You'll be connected to the host

## Controls

### Bottom Bar Controls

- **Video Toggle**: Turn your camera on/off (red = off)
- **Microphone Toggle**: Mute/unmute your microphone (red = muted)
- **Send Message**: Send text messages in the chat
- **End Call**: Disconnect and return to home
- **Chat Toggle**: Show/hide the chat panel

### Video Display

- **Main View**: Shows the remote peer's video
- **Picture-in-Picture**: Your own video in the bottom-right corner

## Technical Details

### Technology Stack

- **PeerJS**: Simplified WebRTC peer-to-peer connections
- **WebRTC**: Real-time communication protocol
- **Next.js**: React framework
- **Framer Motion**: Smooth animations
- **Tailwind CSS**: Styling

### STUN Servers

The application uses Google's public STUN servers for NAT traversal:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

### Data Channels

The application establishes two types of connections:

1. **Media Connection**: For video and audio streams
2. **Data Connection**: For text chat and control signals

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ⚠️ Requires HTTPS in production (or localhost for development)

## Permissions Required

- **Camera**: For video streaming
- **Microphone**: For audio streaming

## Limitations

- **Peer Limit**: Currently supports 1-to-1 connections only
- **Network**: Both peers must be able to establish a direct connection (may not work behind strict corporate firewalls)
- **Browser Tab**: Closing the tab will end the connection

## Troubleshooting

### "Failed to access camera/microphone"
- Grant browser permissions for camera and microphone
- Check if another application is using the camera
- Try refreshing the page

### "Connection Failed"
- Verify both peers have stable internet connections
- Check if firewall is blocking WebRTC
- Try using a different network

### "No Video/Audio"
- Check if camera/microphone is enabled in browser settings
- Verify the correct devices are selected
- Check if video/audio is muted

## Future Enhancements

- [ ] Group calls (3+ participants)
- [ ] Screen sharing
- [ ] Recording functionality
- [ ] Virtual backgrounds
- [ ] Noise cancellation
- [ ] Custom TURN server for better connectivity

## Security Notes

- All video, audio, and chat data is transmitted directly between peers
- No data is stored on any server
- Room IDs are temporary and only valid for the current session
- Use strong, unique Room IDs for sensitive conversations

## Development

The P2P meeting feature is located at:
- Landing Page: `/app/p2p-meet/page.jsx`
- Meeting Room: `/app/interview/page.jsx`

To modify the UI or add features, edit these files following the existing patterns.
