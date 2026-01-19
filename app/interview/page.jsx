"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import {
    HiMicrophone,
    HiVideoCamera,
    HiPhone,
    HiChatAlt2,
    HiX,
    HiClipboardCopy,
    HiCheck,
} from "react-icons/hi";
import { MdSend, MdVideocamOff, MdMicOff } from "react-icons/md";
import { BiMessageDetail } from "react-icons/bi";
import Peer from "peerjs";

// --- VIDEO AREA ---
const VideoArea = ({ localStream, remoteStream, isVideoOff, isRemoteVideoOff }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <motion.div
            animate={{ flex: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="border-[2px] border-white/10 rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-900 to-slate-800 shadow-inner"
        >
            {/* Remote Video (Main) */}
            <div className="absolute inset-0 flex items-center justify-center">
                {remoteStream && !isRemoteVideoOff ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center">
                            <span className="text-white text-4xl font-black">
                                {remoteStream ? "📷" : "👤"}
                            </span>
                        </div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                            {remoteStream ? "Camera Off" : "Waiting for peer..."}
                        </p>
                    </div>
                )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute bottom-6 right-6 w-64 h-48 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
                {localStream && !isVideoOff ? (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <MdVideocamOff className="text-slate-600 w-12 h-12" />
                    </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <p className="text-white text-xs font-bold">You</p>
                </div>
            </div>
        </motion.div>
    );
};

// --- CHAT SECTION ---
const ChatArea = ({ messages, newMessage, setNewMessage, onSendMessage }) => {
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="h-full flex flex-col overflow-hidden rounded-2xl bg-white/5 backdrop-blur-3xl shadow-2xl border border-white/5"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/5">
                <h2 className="text-white text-lg font-black tracking-tight">
                    P2P <span className="text-emerald-500 italic">Chat</span>
                </h2>
            </div>

            {/* Status Banner */}
            <AnimatePresence>
                {isBannerVisible && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="relative px-6 py-4 flex items-start justify-between bg-emerald-500/10 border-b border-emerald-500/20"
                    >
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <BiMessageDetail size={20} />
                            </div>
                            <div>
                                <p className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.1em]">
                                    Encrypted Connection
                                </p>
                                <p className="text-emerald-400/50 text-[10px] font-bold">
                                    Your messages are peer-to-peer encrypted.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsBannerVisible(false)}
                            className="text-emerald-500/40 hover:text-emerald-500 transition-colors p-1"
                        >
                            <HiX size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] px-5 py-3.5 rounded-2xl relative shadow-sm border ${msg.sender === 'peer'
                                ? 'bg-white/5 border-white/10 text-slate-300 rounded-tl-none'
                                : 'bg-emerald-700/50 border-emerald-600 text-white rounded-tr-none'
                                }`}
                        >
                            <p className="text-[13px] font-medium leading-relaxed">{msg.text}</p>
                            <div className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-2">
                                {msg.timestamp}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 border-t border-white/5 bg-[#0D0D0D] shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 outline-none text-[13px] font-medium text-white placeholder-slate-500 transition-all"
                    />
                    <button
                        onClick={onSendMessage}
                        disabled={!newMessage.trim()}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${!newMessage.trim()
                            ? "bg-white/5 text-slate-600"
                            : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            }`}
                    >
                        <MdSend className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- BOTTOM BAR ---
const BottomBar = ({
    onChatToggle,
    isChatOpen,
    isVideoOff,
    isMuted,
    toggleVideo,
    toggleMute,
    onEndCall,
    peerId,
}) => {
    const [copied, setCopied] = useState(false);

    const copyPeerId = () => {
        navigator.clipboard.writeText(peerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 flex items-center justify-between px-10 z-50">
            <div className="flex items-center bg-gray-800/30 backdrop-blur-sm border border-gray-400/20 rounded-4xl py-2 px-8 gap-4">
                <div className="flex flex-col">
                    <span className="text-white font-black text-sm">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                        P2P Stream
                    </span>
                </div>
                {peerId && (
                    <>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <button
                            onClick={copyPeerId}
                            className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
                        >
                            <span className="text-slate-400 font-mono text-xs">
                                {peerId.substring(0, 8)}...
                            </span>
                            {copied ? (
                                <HiCheck className="text-emerald-500 w-4 h-4" />
                            ) : (
                                <HiClipboardCopy className="text-slate-500 w-4 h-4" />
                            )}
                        </button>
                    </>
                )}
            </div>

            <div className="flex items-center gap-3 bg-gray-800/40 backdrop-blur-sm border border-gray-400/20 rounded-4xl py-2 px-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-3xl flex items-center justify-center transition-all shadow-lg ${isVideoOff
                        ? "bg-red-500 text-white shadow-red-500/20"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5"
                        }`}
                >
                    <HiVideoCamera className="w-6 h-6" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMute}
                    className={`w-12 h-12 rounded-3xl flex items-center justify-center transition-all shadow-lg ${isMuted
                        ? "bg-red-500 text-white shadow-red-500/20"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5"
                        }`}
                >
                    <HiMicrophone className="w-6 h-6" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEndCall}
                    className="w-12 h-12 rounded-3xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all"
                >
                    <HiPhone className="w-6 h-6 rotate-[135deg]" />
                </motion.button>
            </div>

            <div className="flex items-center gap-3 bg-gray-800/20 backdrop-blur-sm border border-gray-400/20 rounded-4xl py-2 px-8">
                <div className="text-right mr-4 hidden xl:block">
                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest leading-none mb-1">
                        Connection
                    </p>
                    <p className="text-white font-black text-[12px]">SECURE</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onChatToggle}
                    className={`w-12 h-12 rounded-3xl flex items-center justify-center transition-all ${isChatOpen
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-white/5 text-slate-500 border border-white/5"
                        }`}
                >
                    <HiChatAlt2 className="w-6 h-6" />
                </motion.button>
            </div>
        </div>
    );
};

// --- ROOM SETUP MODAL ---
const RoomSetupModal = ({ onCreateRoom, onJoinRoom }) => {
    const [mode, setMode] = useState(null); // 'create' or 'join'
    const [roomId, setRoomId] = useState('');

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl max-w-md w-full border border-white/10 overflow-hidden"
            >
                <div className="p-8">
                    <h2 className="text-white text-3xl font-black tracking-tight mb-2">
                        P2P Video <span className="text-emerald-500 italic">Meeting</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-medium mb-8">
                        Create a new room or join an existing one
                    </p>

                    {!mode ? (
                        <div className="space-y-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setMode('create')}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all"
                            >
                                Create New Room
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setMode('join')}
                                className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold text-lg border border-white/10 transition-all"
                            >
                                Join Existing Room
                            </motion.button>
                        </div>
                    ) : mode === 'create' ? (
                        <div className="space-y-4">
                            <p className="text-slate-300 text-sm">
                                Click below to create a room. You'll receive a unique Room ID to share with others.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onCreateRoom}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                            >
                                Generate Room ID
                            </motion.button>
                            <button
                                onClick={() => setMode(null)}
                                className="w-full text-slate-400 hover:text-white text-sm font-semibold transition-colors"
                            >
                                ← Back
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm font-semibold mb-2">
                                    Enter Room ID
                                </label>
                                <input
                                    type="text"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    placeholder="paste-room-id-here"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 outline-none text-white font-mono text-sm transition-all"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onJoinRoom(roomId)}
                                disabled={!roomId.trim()}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${roomId.trim()
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                    }`}
                            >
                                Join Room
                            </motion.button>
                            <button
                                onClick={() => setMode(null)}
                                className="w-full text-slate-400 hover:text-white text-sm font-semibold transition-colors"
                            >
                                ← Back
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function P2PVideoMeeting() {
    const router = useRouter();
    const [peer, setPeer] = useState(null);
    const [peerId, setPeerId] = useState('');
    const [remotePeerId, setRemotePeerId] = useState('');
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showSetup, setShowSetup] = useState(true);
    const [dataConnection, setDataConnection] = useState(null);

    const callRef = useRef(null);

    // Initialize media stream
    const initMediaStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('Failed to get media stream:', err);
            alert('Failed to access camera/microphone. Please grant permissions.');
        }
    };

    // Generate a random peer ID
    const generatePeerId = () => {
        return 'peer-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    };

    // Create room (host)
    const handleCreateRoom = async () => {
        const stream = await initMediaStream();
        if (!stream) return;

        const myPeerId = generatePeerId();

        // Try to connect to local PeerJS server first, fallback to public server
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

        let newPeer;
        try {
            // Try local server first
            newPeer = new Peer(myPeerId, peerOptions);
        } catch (err) {
            console.log('Local PeerJS server not available, using public server...');
            // Fallback to public server (0.peerjs.com alternative)
            newPeer = new Peer(myPeerId, {
                host: '0.peerjs.com',
                secure: true,
                port: 443,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ]
                }
            });
        }

        newPeer.on('open', (id) => {
            setPeerId(id);
            setPeer(newPeer);
            setShowSetup(false);
        });

        newPeer.on('error', (err) => {
            console.error('PeerJS Error:', err);
            if (err.type === 'network' || err.type === 'server-error') {
                alert('Unable to connect to PeerJS server. Please ensure a PeerJS server is running on localhost:9000 or use a public alternative.');
            }
        });

        newPeer.on('call', (call) => {
            call.answer(stream);
            callRef.current = call;

            call.on('stream', (remoteStream) => {
                setRemoteStream(remoteStream);
            });
        });

        newPeer.on('connection', (conn) => {
            setDataConnection(conn);
            conn.on('data', (data) => {
                if (data.type === 'message') {
                    setMessages((prev) => [...prev, {
                        sender: 'peer',
                        text: data.text,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                } else if (data.type === 'video-toggle') {
                    setIsRemoteVideoOff(data.isOff);
                }
            });
        });
    };

    // Join room (guest)
    const handleJoinRoom = async (roomId) => {
        if (!roomId.trim()) return;

        const stream = await initMediaStream();
        if (!stream) return;

        const myPeerId = generatePeerId();

        // Try to connect to local PeerJS server first, fallback to public server
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

        let newPeer;
        try {
            // Try local server first
            newPeer = new Peer(myPeerId, peerOptions);
        } catch (err) {
            console.log('Local PeerJS server not available, using public server...');
            // Fallback to public server
            newPeer = new Peer(myPeerId, {
                host: '0.peerjs.com',
                secure: true,
                port: 443,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ]
                }
            });
        }

        newPeer.on('open', (id) => {
            setPeerId(id);
            setPeer(newPeer);
            setRemotePeerId(roomId);

            // Call the host
            const call = newPeer.call(roomId, stream);
            callRef.current = call;

            call.on('stream', (remoteStream) => {
                setRemoteStream(remoteStream);
            });

            // Establish data connection
            const conn = newPeer.connect(roomId);
            setDataConnection(conn);
            conn.on('data', (data) => {
                if (data.type === 'message') {
                    setMessages((prev) => [...prev, {
                        sender: 'peer',
                        text: data.text,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                } else if (data.type === 'video-toggle') {
                    setIsRemoteVideoOff(data.isOff);
                }
            });

            setShowSetup(false);
        });

        newPeer.on('error', (err) => {
            console.error('PeerJS Error:', err);
            if (err.type === 'network' || err.type === 'server-error') {
                alert('Unable to connect to PeerJS server. Please ensure a PeerJS server is running on localhost:9000 or use a public alternative.');
            }
        });
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);

            // Notify peer
            if (dataConnection) {
                dataConnection.send({ type: 'video-toggle', isOff: !videoTrack.enabled });
            }
        }
    };

    // Toggle mute
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    // Send message
    const sendMessage = () => {
        if (!newMessage.trim() || !dataConnection) return;

        const message = {
            sender: 'me',
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, message]);
        dataConnection.send({ type: 'message', text: newMessage });
        setNewMessage('');
    };

    // End call
    const endCall = () => {
        if (callRef.current) callRef.current.close();
        if (dataConnection) dataConnection.close();
        if (peer) peer.destroy();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        router.push('/');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peer) peer.destroy();
        };
    }, []);

    if (showSetup) {
        return <RoomSetupModal onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />;
    }

    return (
        <div className="relative h-screen w-screen bg-[#0A0A0A] flex flex-col overflow-hidden font-poppins">
            <div className="flex flex-1 overflow-hidden gap-6 p-4 pb-24">
                <VideoArea
                    localStream={localStream}
                    remoteStream={remoteStream}
                    isVideoOff={isVideoOff}
                    isRemoteVideoOff={isRemoteVideoOff}
                />
                <AnimatePresence mode="wait">
                    {isChatOpen && (
                        <ChatArea
                            key="chat"
                            messages={messages}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            onSendMessage={sendMessage}
                        />
                    )}
                </AnimatePresence>
            </div>

            <BottomBar
                onChatToggle={() => setIsChatOpen(!isChatOpen)}
                isChatOpen={isChatOpen}
                isVideoOff={isVideoOff}
                isMuted={isMuted}
                toggleVideo={toggleVideo}
                toggleMute={toggleMute}
                onEndCall={endCall}
                peerId={peerId}
            />
        </div>
    );
}
