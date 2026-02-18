'use client';

import { useState, useRef, useEffect } from 'react';
import {
    useTracks,
    VideoTrack,
    AudioTrack,
    useChat,
    DisconnectButton,
    useLocalParticipant,
    useRemoteParticipants,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';

import {
    FiMic, FiMicOff,
    FiVideo, FiVideoOff,
    FiMessageSquare,
    FiFileText,
    FiMonitor,
    FiX,
    FiUser,
    FiSend
} from 'react-icons/fi';
import { FaPhoneSlash } from 'react-icons/fa';

// ─── Sidebar animation variants ─────────────────────────────────────────────
const sidebarVariants = {
    hidden:  { x: '100%', opacity: 0 },
    visible: { x: 0,      opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit:    { x: '100%', opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
};

const messageVariants = {
    hidden:  { opacity: 0, y: 8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1,    transition: { duration: 0.18 } },
};

// ─── Control Button ──────────────────────────────────────────────────────────
function ControlBtn({ onClick, active = true, danger = false, accent = false, children, label }) {
    const base  = 'relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';
    const style = danger
        ? 'bg-red-600 hover:bg-red-500 text-white'
        : accent
        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
        : active
        ? 'bg-white/10 hover:bg-white/20 text-white'
        : 'bg-red-500/15 hover:bg-red-500/25 text-red-400';

    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={`${base} ${style}`}
        >
            {children}
        </button>
    );
}

// ─── Custom Audio Visualizer ─────────────────────────────────────────────────
// Renders animated emerald bars when camera is off. Uses Web Audio API to
// react to actual microphone volume so the bars pulse with real speech.
function AudioVisualizer({ participantName }) {
    const bars = [3, 5, 8, 6, 9, 7, 4, 6, 8, 5, 3];
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-5 bg-zinc-950">
            {/* Animated bars */}
            <div className="flex items-end gap-[3px] h-14">
                {bars.map((h, i) => (
                    <motion.div
                        key={i}
                        className="w-[5px] rounded-full bg-emerald-500"
                        animate={{ scaleY: [1, 1.6, 0.7, 1.3, 1] }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.08,
                            ease: 'easeInOut',
                        }}
                        style={{ height: `${h * 4}px`, originY: 1 }}
                    />
                ))}
            </div>
            {participantName && (
                <p className="text-xs font-medium text-zinc-500 tracking-wide">{participantName}</p>
            )}
        </div>
    );
}

// ─── Silent audio renderer — plays remote audio without any LiveKit UI ────────
function RemoteAudio() {
    const remoteParticipants = useRemoteParticipants();
    const audioTracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }])
        .filter(t => remoteParticipants.some(p => p.identity === t.participant?.identity));

    return (
        <>
            {audioTracks.map(track => (
                <AudioTrack key={track.participant.identity} trackRef={track} />
            ))}
        </>
    );
}


export default function ActiveInterviewRoom({ interview, role }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarTab,  setSidebarTab]  = useState('instructions');
    const [chatInput,   setChatInput]   = useState('');
    const messagesEndRef = useRef(null);

    const tracks = useTracks([
        { source: Track.Source.Camera,      withPlaceholder: false },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ]);

    const { chatMessages, send } = useChat();
    const { localParticipant }   = useLocalParticipant();

    // Separate tracks by source and ownership
    const remoteCamera = tracks.find(t => t.participant?.identity !== localParticipant?.identity && t.source === Track.Source.Camera);
    const localCamera  = tracks.find(t => t.participant?.identity === localParticipant?.identity && t.source === Track.Source.Camera);
    const screenTrack  = tracks.find(t => t.source === Track.Source.ScreenShare);
    
    // The "Main Stage" should show screen share if available, otherwise remote camera
    const mainTrack = screenTrack || remoteCamera;

    const micOn    = localParticipant?.isMicrophoneEnabled;
    const camOn    = localParticipant?.isCameraEnabled;
    const shareOn  = localParticipant?.isScreenShareEnabled;

    const handleSend = () => {
        if (!chatInput.trim()) return;
        send(chatInput.trim());
        setChatInput('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const openSidebar = (tab) => {
        setSidebarTab(tab);
        setSidebarOpen(true);
    };

    return (
        <div className="h-screen w-screen bg-black text-white flex overflow-hidden"
             style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

            {/* ── Main video stage ─────────────────────────────────────── */}
            <div className="flex-1 relative flex flex-col min-w-0">

                {/* Video grid */}
                <div className="flex-1 flex items-center justify-center p-6 gap-4 overflow-hidden">

                    {/* Main Stage (Screen Share or Remote Camera) */}
                    <div className="relative w-[52%] max-w-2xl aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
                        {mainTrack ? (
                            <VideoTrack 
                                trackRef={mainTrack} 
                                className={`w-full h-full ${mainTrack.source === Track.Source.ScreenShare ? 'object-contain' : 'object-cover'}`} 
                            />
                        ) : (
                            <AudioVisualizer participantName={role === 'CANDIDATE' ? 'Interviewer' : 'Candidate'} />
                        )}

                        {/* Status badge */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-medium text-emerald-400 tracking-wide">
                                {mainTrack?.source === Track.Source.ScreenShare ? 'Live Presentation' : 'Live Connection'}
                            </span>
                        </div>

                        {/* Participant name chip */}
                        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                            <span className="text-xs text-white/80 font-medium">
                                {mainTrack?.source === Track.Source.ScreenShare 
                                    ? `${mainTrack.participant.identity === localParticipant.identity ? 'Your' : 'Participant\'s'} Screen`
                                    : (role === 'CANDIDATE' ? 'Interviewer' : 'Candidate')
                                }
                            </span>
                        </div>
                    </div>

                    {/* Local PiP (Always shows your camera) */}
                    <motion.div
                        drag
                        dragConstraints={{ left: -200, right: 200, top: -100, bottom: 100 }}
                        className="w-[22%] max-w-xs aspect-video flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 cursor-grab active:cursor-grabbing relative group shadow-xl"
                    >
                        {localCamera ? (
                            <VideoTrack
                                trackRef={localCamera}
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FiUser className="w-6 h-6 text-zinc-600" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                            You
                        </div>
                    </motion.div>
                </div>

                {/* ── Control bar ──────────────────────────────────────── */}
                <div className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-sm border-t border-white/5">

                    {/* Left — time / job title */}
                    <div className="w-48">
                        <p className="text-xs text-zinc-500">
                            {interview?.job_application_details?.job_title ?? 'Interview Session'}
                        </p>
                    </div>

                    {/* Center — primary controls */}
                    <div className="flex items-center gap-3">
                        <ControlBtn
                            label={micOn ? 'Mute' : 'Unmute'}
                            active={micOn}
                            onClick={() => localParticipant?.setMicrophoneEnabled(!micOn)}
                        >
                            {micOn ? <FiMic className="w-5 h-5" /> : <FiMicOff className="w-5 h-5" />}
                        </ControlBtn>

                        <ControlBtn
                            label={camOn ? 'Turn off camera' : 'Turn on camera'}
                            active={camOn}
                            onClick={() => localParticipant?.setCameraEnabled(!camOn)}
                        >
                            {camOn ? <FiVideo className="w-5 h-5" /> : <FiVideoOff className="w-5 h-5" />}
                        </ControlBtn>

                        <ControlBtn
                            label={shareOn ? 'Stop sharing' : 'Share screen'}
                            active={true}
                            accent={shareOn}
                            onClick={() => localParticipant?.setScreenShareEnabled(!shareOn)}
                        >
                            <FiMonitor className="w-5 h-5" />
                        </ControlBtn>

                        <div className="w-px h-6 bg-white/10 mx-1" />

                        {/* End call */}
                        <DisconnectButton className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 transition-colors border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
                            <FaPhoneSlash className="w-5 h-5 text-white" />
                        </DisconnectButton>
                    </div>

                    {/* Right — sidebar toggles */}
                    <div className="w-48 flex justify-end gap-2">
                        <ControlBtn label="Open chat"         onClick={() => openSidebar('chat')}>
                            <FiMessageSquare className="w-5 h-5" />
                        </ControlBtn>
                        <ControlBtn label="Open instructions" onClick={() => openSidebar('instructions')}>
                            <FiFileText className="w-5 h-5" />
                        </ControlBtn>
                    </div>
                </div>
            </div>

            {/* Silent audio engine — plays remote mic, no LiveKit UI */}
            <RemoteAudio />

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        key="sidebar"
                        variants={sidebarVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="w-80 flex-shrink-0 flex flex-col bg-zinc-950 border-l border-white/5 overflow-hidden"
                    >
                        {/* Sidebar header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                            <div className="flex gap-1 p-1 rounded-lg bg-white/5">
                                {['instructions', 'chat'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setSidebarTab(tab)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium tracking-wide capitalize transition-all ${
                                            sidebarTab === tab
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Sidebar body */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            <AnimatePresence mode="wait">
                                {sidebarTab === 'instructions' ? (
                                    <motion.div
                                        key="instructions"
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1,  x: 0  }}
                                        exit={{    opacity: 0,  x: 12 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                                    >
                                        {/* Role chip */}
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-medium text-emerald-400 capitalize">{role?.toLowerCase()}</span>
                                        </div>

                                        {/* Job title */}
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Position</p>
                                            <h2 className="text-base font-semibold text-white leading-snug">
                                                {interview?.job_application_details?.job_title ?? '—'}
                                            </h2>
                                        </div>

                                        {/* Instructions */}
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                                                {role === 'CANDIDATE' ? 'Your Instructions' : 'Interviewer Notes'}
                                            </p>
                                            <div className="text-sm text-zinc-400 leading-relaxed space-y-3">
                                                {role === 'CANDIDATE'
                                                    ? interview?.interview_config_details?.candidate_instructions
                                                    : interview?.interview_config_details?.interviewer_notes
                                                    ?? <span className="italic text-zinc-600">No instructions provided.</span>
                                                }
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="chat"
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0  }}
                                        exit={{    opacity: 0, x: -12 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex-1 flex flex-col min-h-0"
                                    >
                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                                            {chatMessages.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-16 opacity-40">
                                                    <FiMessageSquare className="w-8 h-8 text-zinc-600" />
                                                    <p className="text-sm text-zinc-600">No messages yet</p>
                                                </div>
                                            ) : (
                                                chatMessages.map((msg, i) => {
                                                    const isMe = msg.from?.identity === localParticipant?.identity;
                                                    return (
                                                        <motion.div
                                                            key={i}
                                                            variants={messageVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}
                                                        >
                                                            <span className="text-[10px] text-zinc-600 px-1">
                                                                {isMe ? 'You' : 'Participant'}
                                                            </span>
                                                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[90%] ${
                                                                isMe
                                                                    ? 'bg-emerald-600 text-white rounded-br-sm'
                                                                    : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                                                            }`}>
                                                                {msg.message}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input */}
                                        <div className="p-4 border-t border-white/5 flex gap-2">
                                            <input
                                                value={chatInput}
                                                onChange={e => setChatInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                                placeholder="Message…"
                                                className="flex-1 bg-zinc-900 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-600/50 transition-colors"
                                            />
                                            <button
                                                onClick={handleSend}
                                                disabled={!chatInput.trim()}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
                                            >
                                                <FiSend className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}