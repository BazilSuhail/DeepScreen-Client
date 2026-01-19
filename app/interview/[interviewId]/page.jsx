"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    HiMicrophone,
    HiVideoCamera,
    HiPhone,
    HiChatAlt2,
    HiX,
} from "react-icons/hi";
import { MdSend, MdVideocamOff } from "react-icons/md";
import { BiMessageDetail } from "react-icons/bi";
import Peer from "peerjs";
import axios from "axios";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

// --- VIDEO AREA ---
const VideoArea = ({ localStream, remoteStream, isVideoOff, isRemoteVideoOff, otherParticipant }) => {
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
                                {otherParticipant?.name?.charAt(0).toUpperCase() || "👤"}
                            </span>
                        </div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                            {remoteStream ? "Camera Off" : `Waiting for ${otherParticipant?.name || 'participant'}...`}
                        </p>
                        {otherParticipant && (
                            <p className="text-slate-500 font-medium text-xs">
                                {otherParticipant.name} • {otherParticipant.role}
                            </p>
                        )}
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
                    Interview <span className="text-emerald-500 italic">Chat</span>
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
    interviewStatus,
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 flex items-center justify-between px-10 z-50">
            <div className="flex items-center bg-gray-800/30 backdrop-blur-sm border border-gray-400/20 rounded-4xl py-2 px-8 gap-4">
                <div className="flex flex-col">
                    <span className="text-white font-black text-sm">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                        {interviewStatus || 'Interview'}
                    </span>
                </div>
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

// --- LOADING/WAITING SCREEN ---
const WaitingScreen = ({ message, otherParticipant }) => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0A0A0A] font-poppins">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-white font-black text-sm uppercase tracking-[0.3em]">{message}</p>
            {otherParticipant && (
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">
                    Waiting for {otherParticipant.name}...
                </p>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function InterviewRoom() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const interviewId = params.interviewId;
    const role = searchParams.get('role'); // 'recruiter' or 'candidate'

    const [peer, setPeer] = useState(null);
    const [myPeerId, setMyPeerId] = useState('');
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [dataConnection, setDataConnection] = useState(null);

    // Interview state
    const [interviewData, setInterviewData] = useState(null);
    const [otherParticipant, setOtherParticipant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isWaiting, setIsWaiting] = useState(false);
    const [interviewStatus, setInterviewStatus] = useState('');
    const [error, setError] = useState(null);

    const callRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem('access_token');
    };

    // Get user info
    const getUserInfo = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

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
            setError('Failed to access camera/microphone. Please grant permissions.');
            return null;
        }
    };

    // Fetch interview details
    const fetchInterviewDetails = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(
                `${SERVER_URL}/interviews/${interviewId}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setInterviewData(response.data.data);
                setInterviewStatus(response.data.data.status);

                // Set other participant info
                const user = getUserInfo();
                if (user.role === 'recruiter') {
                    setOtherParticipant(response.data.data.candidate);
                } else {
                    setOtherParticipant(response.data.data.recruiter);
                }

                return response.data.data;
            }
        } catch (err) {
            console.error('Failed to fetch interview:', err);
            setError(err.response?.data?.error || 'Failed to load interview');
        }
    };

    // Join interview
    const joinInterview = async (stream) => {
        try {
            const user = getUserInfo();
            const token = getAuthToken();

            // Generate PeerJS ID
            const peerId = `peer-${user.id}-${Date.now()}`;
            setMyPeerId(peerId);

            // Initialize PeerJS
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

            const newPeer = new Peer(peerId, peerOptions);

            newPeer.on('open', async (id) => {
                console.log('PeerJS connected with ID:', id);
                setPeer(newPeer);

                // Register with backend
                const joinResponse = await axios.post(
                    `${SERVER_URL}/interviews/${interviewId}/join/`,
                    { peerId: id, role: user.role },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (joinResponse.data.success) {
                    const { otherParticipant: other, status } = joinResponse.data.data;
                    setInterviewStatus(status);

                    if (other.peerId) {
                        // Other participant already joined - connect immediately
                        connectToPeer(other.peerId, stream, newPeer);
                        setIsWaiting(false);
                    } else {
                        // Wait for other participant
                        setIsWaiting(true);
                        startPolling();
                    }

                    // Start heartbeat
                    startHeartbeat(id);
                }
            });

            newPeer.on('call', (call) => {
                console.log('Receiving call...');
                call.answer(stream);
                callRef.current = call;

                call.on('stream', (remoteStream) => {
                    console.log('Received remote stream');
                    setRemoteStream(remoteStream);
                    setIsWaiting(false);
                });
            });

            newPeer.on('connection', (conn) => {
                console.log('Data connection established');
                setDataConnection(conn);
                conn.on('data', handleDataMessage);
            });

            newPeer.on('error', (err) => {
                console.error('PeerJS Error:', err);
                if (err.type === 'network' || err.type === 'server-error') {
                    setError('Unable to connect to PeerJS server. Please ensure the server is running.');
                }
            });

        } catch (err) {
            console.error('Failed to join interview:', err);
            setError(err.response?.data?.error || 'Failed to join interview');
        }
    };

    // Connect to peer
    const connectToPeer = (remotePeerId, stream, peerInstance) => {
        console.log('Connecting to peer:', remotePeerId);
        const call = peerInstance.call(remotePeerId, stream);
        callRef.current = call;

        call.on('stream', (remoteStream) => {
            console.log('Received remote stream');
            setRemoteStream(remoteStream);
            setIsWaiting(false);
        });

        // Establish data connection
        const conn = peerInstance.connect(remotePeerId);
        setDataConnection(conn);
        conn.on('data', handleDataMessage);
    };

    // Handle incoming data messages
    const handleDataMessage = (data) => {
        if (data.type === 'message') {
            setMessages((prev) => [...prev, {
                sender: 'peer',
                text: data.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } else if (data.type === 'video-toggle') {
            setIsRemoteVideoOff(data.isOff);
        }
    };

    // Poll for other participant
    const startPolling = () => {
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const token = getAuthToken();
                const response = await axios.get(
                    `${SERVER_URL}/interviews/${interviewId}/status/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    const { recruiterPeerId, candidatePeerId, status } = response.data.data;
                    setInterviewStatus(status);

                    const user = getUserInfo();
                    const otherPeerId = user.role === 'recruiter' ? candidatePeerId : recruiterPeerId;

                    if (otherPeerId && !remoteStream) {
                        console.log('Other participant joined, connecting...');
                        stopPolling();
                        connectToPeer(otherPeerId, localStream, peer);
                    }
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 5000); // Poll every 5 seconds
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    // Send heartbeat
    const startHeartbeat = (peerId) => {
        heartbeatIntervalRef.current = setInterval(async () => {
            try {
                const token = getAuthToken();
                await axios.post(
                    `${SERVER_URL}/interviews/${interviewId}/heartbeat/`,
                    { peerId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error('Heartbeat error:', err);
            }
        }, 15000); // Every 15 seconds
    };

    const stopHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);

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
    const endCall = async () => {
        try {
            const token = getAuthToken();
            await axios.post(
                `${SERVER_URL}/interviews/${interviewId}/leave/`,
                { peerId: myPeerId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error('Failed to leave interview:', err);
        }

        // Cleanup
        if (callRef.current) callRef.current.close();
        if (dataConnection) dataConnection.close();
        if (peer) peer.destroy();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        stopPolling();
        stopHeartbeat();

        router.push('/');
    };

    // Initialize on mount
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);

            // Fetch interview details
            const interview = await fetchInterviewDetails();
            if (!interview) {
                setIsLoading(false);
                return;
            }

            // Initialize media
            const stream = await initMediaStream();
            if (!stream) {
                setIsLoading(false);
                return;
            }

            // Join interview
            await joinInterview(stream);
            setIsLoading(false);
        };

        init();

        // Cleanup
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peer) peer.destroy();
            stopPolling();
            stopHeartbeat();
        };
    }, []);

    // Error state
    if (error) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0A0A0A] font-poppins">
                <div className="text-red-500 text-6xl mb-6">⚠️</div>
                <p className="text-white font-black text-lg mb-2">Error</p>
                <p className="text-slate-400 font-medium text-sm max-w-md text-center">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all"
                >
                    Go Home
                </button>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return <WaitingScreen message="Loading Interview..." />;
    }

    // Waiting for other participant
    if (isWaiting) {
        return <WaitingScreen message="Interview Ready" otherParticipant={otherParticipant} />;
    }

    // Main interview UI
    return (
        <div className="relative h-screen w-screen bg-[#0A0A0A] flex flex-col overflow-hidden font-poppins">
            <div className="flex flex-1 overflow-hidden gap-6 p-4 pb-24">
                <VideoArea
                    localStream={localStream}
                    remoteStream={remoteStream}
                    isVideoOff={isVideoOff}
                    isRemoteVideoOff={isRemoteVideoOff}
                    otherParticipant={otherParticipant}
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
                interviewStatus={interviewStatus}
            />
        </div>
    );
}
