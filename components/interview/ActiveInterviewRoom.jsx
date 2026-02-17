'use client';

import { useState } from 'react';
import {
    useTracks,
    VideoTrack,
    useChat,
    DisconnectButton,
    useLocalParticipant,
    useRemoteParticipants,
    AudioConference
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';

// Using Fi (Feather) for general UI and Fa (Font Awesome) for specific actions
import {
    FiMic,
    FiVideo,
    FiMessageSquare,
    FiFileText,
    FiMonitor,
    FiX,
    FiUser
} from 'react-icons/fi';
import { FaPhoneSlash } from 'react-icons/fa';
import { IoPaperPlaneOutline } from 'react-icons/io5'; // Using Ionicons for the send button

export default function ActiveInterviewRoom({ interview, role }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarTab, setSidebarTab] = useState('instructions');

    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ]);

    const { chatMessages, send } = useChat();
    const { localParticipant } = useLocalParticipant();

    const remoteTrack = tracks.find(t => t.participant.identity !== localParticipant?.identity);
    const localTrack = tracks.find(t => t.participant.identity === localParticipant?.identity);

    return (
        <div className="h-screen w-screen bg-slate-950 text-white flex overflow-hidden font-sans">
            {/* Main Stage */}
            <div className="flex-1 relative flex items-center justify-center bg-black/40 p-4">
                <div className="w-full h-full max-w-6xl max-h-[80vh] rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/5 relative">
                    {remoteTrack ? (
                        <VideoTrack
                            trackRef={remoteTrack}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center animate-pulse">
                            <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                                <FiUser className="w-16 h-16 text-emerald-500/40" />
                            </div>
                            <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">Waiting for Participant...</p>
                        </div>
                    )}

                    <div className="absolute top-8 left-8 flex items-center gap-3 px-6 py-3 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-3xl shadow-2xl">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <span className="font-black text-xs uppercase tracking-[0.2em]">Live Connection</span>
                    </div>
                </div>

                {/* Local Picture-in-Picture */}
                <motion.div
                    drag
                    dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
                    className="absolute bottom-12 right-12 w-72 aspect-video bg-slate-800 rounded-3xl border-2 border-emerald-500/30 overflow-hidden shadow-2xl cursor-move z-10 group"
                >
                    {localTrack && (
                        <VideoTrack
                            trackRef={localTrack}
                            className="w-full h-full object-cover scale-x-[-1]"
                        />
                    )}
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        You
                    </div>
                </motion.div>

                {/* Control Bar */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-6 bg-slate-900/80 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl">
                    <button 
                        onClick={() => localParticipant?.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)}
                        className={`p-5 rounded-2xl transition-all hover:scale-110 active:scale-95 group border border-white/5 ${
                            localParticipant?.isMicrophoneEnabled ? 'bg-white/5 text-white' : 'bg-red-500/20 text-red-500 border-red-500/50'
                        }`}
                    >
                        <FiMic className="w-7 h-7" />
                    </button>
                    <button 
                        onClick={() => localParticipant?.setCameraEnabled(!localParticipant.isCameraEnabled)}
                        className={`p-5 rounded-2xl transition-all hover:scale-110 active:scale-95 border border-white/5 ${
                            localParticipant?.isCameraEnabled ? 'bg-white/5 text-white' : 'bg-red-500/20 text-red-500 border-red-500/50'
                        }`}
                    >
                        <FiVideo className="w-7 h-7" />
                    </button>
                    <button 
                        onClick={() => localParticipant?.setScreenShareEnabled(!localParticipant.isScreenShareEnabled)}
                        className={`p-5 rounded-2xl transition-all hover:scale-110 active:scale-95 border border-white/5 ${
                            localParticipant?.isScreenShareEnabled ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50' : 'bg-white/5 text-white'
                        }`}
                    >
                        <FiMonitor className="w-7 h-7" />
                    </button>
                    <div className="w-px h-10 bg-white/10 mx-2" />
                    <button
                        onClick={() => { setSidebarOpen(true); setSidebarTab('chat'); }}
                        className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:scale-110 active:scale-95"
                    >
                        <FiMessageSquare className="w-7 h-7 text-white" />
                    </button>
                    <button
                        onClick={() => { setSidebarOpen(true); setSidebarTab('instructions'); }}
                        className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:scale-110 active:scale-95"
                    >
                        <FiFileText className="w-7 h-7 text-white" />
                    </button>
                    <div className="w-px h-10 bg-white/10 mx-2" />
                    <DisconnectButton className="p-5 bg-red-500 hover:bg-red-600 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-500/20 border-none cursor-pointer">
                        <FaPhoneSlash className="w-7 h-7 text-white" />
                    </DisconnectButton>
                </div>
                
                {/* Audio Engine */}
                <AudioConference />
            </div>

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        exit={{ x: 400 }}
                        className="w-[400px] bg-slate-900 border-l border-white/5 flex flex-col h-full shadow-2xl"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-white/5">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSidebarTab('instructions')}
                                    className={`text-sm font-black uppercase tracking-widest ${sidebarTab === 'instructions' ? 'text-emerald-500' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Instructions
                                </button>
                                <button
                                    onClick={() => setSidebarTab('chat')}
                                    className={`text-sm font-black uppercase tracking-widest ${sidebarTab === 'chat' ? 'text-emerald-500' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Chat
                                </button>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                                <FiX className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {sidebarTab === 'instructions' ? (
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Job Role</h4>
                                        <h2 className="text-2xl font-bold tracking-tight">
                                            {interview.job_application_details?.job_title}
                                        </h2>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">
                                            {role === 'CANDIDATE' ? 'Your Instructions' : 'Interviewer Notes'}
                                        </h4>
                                        <div className="prose prose-invert prose-emerald max-w-none text-slate-400 leading-relaxed">
                                            {role === 'CANDIDATE'
                                                ? interview.interview_config_details?.candidate_instructions
                                                : interview.interview_config_details?.interviewer_notes}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    <div className="flex-1 space-y-6">
                                        {chatMessages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                                <FiMessageSquare className="w-16 h-16 mb-4" />
                                                <p className="font-bold">No messages yet</p>
                                            </div>
                                        ) : (
                                            chatMessages.map((msg, i) => (
                                                <div key={i} className={`flex flex-col ${msg.from?.identity === localParticipant?.identity ? 'items-end' : 'items-start'}`}>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        {msg.from?.identity === localParticipant?.identity ? 'You' : 'Participant'}
                                                    </span>
                                                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${msg.from?.identity === localParticipant?.identity ? 'bg-emerald-500 text-white' : 'bg-white/5'}`}>
                                                        {msg.message}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const input = e.target.elements.chatInput;
                                                if (input.value.trim()) {
                                                    send(input.value);
                                                    input.value = '';
                                                }
                                            }}
                                            className="flex gap-3"
                                        >
                                            <input
                                                name="chatInput"
                                                autoComplete="off"
                                                placeholder="Type a message..."
                                                className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                                            />
                                            <button className="p-4 bg-emerald-500 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 border-none cursor-pointer">
                                                <IoPaperPlaneOutline className="w-6 h-6 text-white" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}