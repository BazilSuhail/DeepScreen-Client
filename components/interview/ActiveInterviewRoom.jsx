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
import { motion, AnimatePresence } from 'motion/react';

import {
    HiOutlineMicrophone,
    HiOutlineVideoCamera, HiOutlineVideoCameraSlash,
    HiOutlineChatBubbleLeftRight,
    HiOutlineDocumentText,
    HiOutlineComputerDesktop,
    HiOutlineXMark,
    HiOutlineUser,
    HiOutlinePaperAirplane,
    HiOutlinePhoneXMark,
    HiOutlineBriefcase,
    HiOutlineClock,
    HiOutlineCalendarDays,
} from 'react-icons/hi2';
import { base, fast, sheet, spring } from '@/constants/motion';

// ─── Sidebar animation variants ─────────────────────────────────────────────
const sidebarVariants = {
    hidden:  { x: '100%', opacity: 0 },
    visible: { x: 0,      opacity: 1, transition: sheet },
    exit:    { x: '100%', opacity: 0, transition: base },
};

const messageVariants = {
    hidden:  { opacity: 0, y: 8, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1,    transition: base },
};

// ─── Control Button ──────────────────────────────────────────────────────────
function ControlBtn({ onClick, active = true, danger = false, accent = false, pressed, children, label }) {
    const baseCls = 'relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full transition-[color,background-color,translate,scale] duration-150 active:scale-[0.95] motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';
    const style = danger
        ? 'bg-red-600 hover:bg-red-500 text-white'
        : accent
        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
        : active
        ? 'bg-white/10 hover:bg-white/20 text-white'
        : 'bg-red-500/15 hover:bg-red-500/25 text-red-400';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={pressed}
            title={label}
            className={`${baseCls} ${style}`}
        >
            {children}
        </button>
    );
}

// ─── Main-stage placeholder ──────────────────────────────────────────────────
// Shown while the other side has no camera or screen track. Static on purpose: it must not look like someone is talking.
function StagePlaceholder({ participantName }) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <HiOutlineUser className="h-9 w-9 text-zinc-400" aria-hidden="true" />
            </span>
            <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-200">{participantName}</p>
                <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                    <HiOutlineVideoCameraSlash className="h-4 w-4" aria-hidden="true" /> Camera is off or not connected yet
                </p>
            </div>
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
        <div className="h-dvh w-full bg-black text-white flex flex-col lg:flex-row overflow-hidden">

            {/* ── Main video stage (fills entire space) ────────────────── */}
            <div className="flex-1 relative flex flex-col min-w-0 min-h-0">

                {/* Full-screen main stage */}
                <div className="flex-1 relative overflow-hidden">

                    {/* Main Stage fills the whole area */}
                    <div className="absolute inset-0">
                        {mainTrack ? (
                            <VideoTrack 
                                trackRef={mainTrack} 
                                className={`w-full h-full ${mainTrack.source === Track.Source.ScreenShare ? 'object-contain' : 'object-cover'}`} 
                            />
                        ) : (
                            <StagePlaceholder participantName={role === 'CANDIDATE' ? 'Interviewer' : 'Candidate'} />
                        )}

                        {/* Status badge */}
                        <div className="absolute top-3 left-3 sm:top-6 sm:left-6 flex items-center gap-2 px-2.5 py-1 rounded-sm bg-black/70 border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                            <span className="text-xs font-medium text-emerald-400 tracking-wide">
                                {mainTrack?.source === Track.Source.ScreenShare ? 'Live Presentation' : 'Live Connection'}
                            </span>
                        </div>

                        {/* Participant name chip */}
                        <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-black/70 border border-white/10">
                            {mainTrack?.source === Track.Source.ScreenShare
                                ? <HiOutlineComputerDesktop className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
                                : <HiOutlineUser className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />}
                            <span className="text-xs text-white/80 font-medium">
                                {mainTrack?.source === Track.Source.ScreenShare 
                                    ? `${mainTrack.participant.identity === localParticipant.identity ? 'Your' : 'Participant\'s'} Screen`
                                    : (role === 'CANDIDATE' ? 'Interviewer' : 'Candidate')
                                }
                            </span>
                        </div>
                    </div>

                    {/* Local PiP overlay — bottom-right corner on top of main stage */}
                    <motion.div
                        drag
                        dragMomentum={false}
                        aria-label="Your camera (drag to move)"
                        className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 w-28 sm:w-48 aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-white/15 cursor-grab active:cursor-grabbing group shadow-md z-10 touch-none"
                    >
                        {localCamera ? (
                            <VideoTrack
                                trackRef={localCamera}
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <HiOutlineVideoCameraSlash className="w-6 h-6 text-zinc-500" aria-hidden="true" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-sm bg-black/70 text-[10px] text-white/80">
                            You
                        </div>
                    </motion.div>
                </div>

                {/* ── Control bar ──────────────────────────────────────── */}
                <div className="min-h-20 flex-shrink-0 flex items-center justify-center md:justify-between gap-2 px-3 py-3 sm:px-8 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-zinc-950 border-t border-white/10">

                    {/* Left — time / job title */}
                    <div className="hidden md:flex w-48 min-w-0 items-center gap-2">
                        <HiOutlineBriefcase className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        <p className="text-xs text-zinc-400 truncate">
                            {interview?.job_application_details?.job_details?.job_title ?? interview?.title ?? 'Interview Session'}
                        </p>
                    </div>

                    {/* Center — primary controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <ControlBtn
                            label={micOn ? 'Mute' : 'Unmute'}
                            active={micOn}
                            pressed={!micOn}
                            onClick={() => localParticipant?.setMicrophoneEnabled(!micOn)}
                        >
                            <HiOutlineMicrophone className="w-5 h-5" aria-hidden="true" />
                            {!micOn && <span aria-hidden="true" className="absolute h-0.5 w-6 rotate-45 rounded-full bg-current" />}
                        </ControlBtn>

                        <ControlBtn
                            label={camOn ? 'Turn off camera' : 'Turn on camera'}
                            active={camOn}
                            pressed={camOn}
                            onClick={() => {
                                const enable = !camOn;
                                localParticipant?.setCameraEnabled(enable);
                                if (enable && shareOn) localParticipant?.setScreenShareEnabled(false);
                            }}
                        >
                            {camOn ? <HiOutlineVideoCamera className="w-5 h-5" aria-hidden="true" /> : <HiOutlineVideoCameraSlash className="w-5 h-5" aria-hidden="true" />}
                        </ControlBtn>

                        <ControlBtn
                            label={shareOn ? 'Stop sharing' : 'Share screen'}
                            active={true}
                            pressed={shareOn}
                            accent={shareOn}
                            onClick={() => {
                                const enable = !shareOn;
                                localParticipant?.setScreenShareEnabled(enable);
                                if (enable && camOn) localParticipant?.setCameraEnabled(false);
                            }}
                        >
                            <HiOutlineComputerDesktop className="w-5 h-5" aria-hidden="true" />
                        </ControlBtn>

                        <div className="w-px h-6 bg-white/10 sm:mx-1" />

                        {/* End call */}
                        <DisconnectButton aria-label="Leave interview" title="Leave interview" className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-red-600 hover:bg-red-500 transition-[background-color,scale] active:scale-[0.95] motion-reduce:transform-none border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
                            <HiOutlinePhoneXMark className="w-5 h-5 text-white" aria-hidden="true" />
                        </DisconnectButton>
                    </div>

                    {/* Right — sidebar toggles */}
                    <div className="md:w-48 flex justify-end gap-2">
                        <ControlBtn label="Open chat" pressed={sidebarOpen && sidebarTab === 'chat'} accent={sidebarOpen && sidebarTab === 'chat'} onClick={() => openSidebar('chat')}>
                            <HiOutlineChatBubbleLeftRight className="w-5 h-5" aria-hidden="true" />
                        </ControlBtn>
                        <ControlBtn label="Open instructions" pressed={sidebarOpen && sidebarTab === 'instructions'} accent={sidebarOpen && sidebarTab === 'instructions'} onClick={() => openSidebar('instructions')}>
                            <HiOutlineDocumentText className="w-5 h-5" aria-hidden="true" />
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
                        aria-label="Interview panel"
                        className="w-full h-[45dvh] lg:h-auto lg:w-80 2xl:w-96 flex-shrink-0 flex flex-col bg-zinc-950 border-t lg:border-t-0 lg:border-l border-white/10 overflow-hidden"
                    >
                        {/* Sidebar header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <div className="flex gap-1 p-1 rounded-md bg-white/5">
                                {['instructions', 'chat'].map(tab => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setSidebarTab(tab)}
                                        aria-pressed={sidebarTab === tab}
                                        className={`relative min-h-10 px-3 py-1.5 rounded-sm text-xs font-medium tracking-wide capitalize transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                            sidebarTab === tab
                                                ? 'text-white'
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {sidebarTab === tab && (
                                            <motion.span layoutId="interview-room-tab" transition={spring} aria-hidden="true"
                                                className="absolute inset-0 rounded-sm bg-emerald-600 shadow-sm" />
                                        )}
                                        <span className="relative flex items-center gap-1.5">
                                            {tab === 'chat' ? <HiOutlineChatBubbleLeftRight className="h-3.5 w-3.5" aria-hidden="true" /> : <HiOutlineDocumentText className="h-3.5 w-3.5" aria-hidden="true" />}
                                            {tab}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                aria-label="Close panel"
                                className="w-11 h-11 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                                <HiOutlineXMark className="w-5 h-5" aria-hidden="true" />
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
                                        transition={fast}
                                        className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                                    >
                                        {/* Role chip */}
                                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-medium text-emerald-400 capitalize">{role?.toLowerCase()}</span>
                                        </div>

                                        {/* Job title */}
                                        <div>
                                            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Position</p>
                                            <h2 className="text-base font-semibold text-white leading-snug">
                                                {interview?.job_application_details?.job_details?.job_title ?? interview?.title ?? '—'}
                                            </h2>
                                        </div>

                                        {/* Interview config summary */}
                                        {(interview?.interview_config_details?.title || interview?.default_duration_minutes || interview?.interview_config_details?.default_duration_minutes) && (
                                            <div className="space-y-3">
                                                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Interview Setup</p>
                                                <div className="space-y-2">
                                                    {interview?.interview_config_details?.title && (
                                                        <div className="flex justify-between gap-3 text-xs">
                                                            <span className="flex shrink-0 items-center gap-1.5 text-zinc-500"><HiOutlineDocumentText className="h-3.5 w-3.5" aria-hidden="true" />Title</span>
                                                            <span className="text-white font-medium">{interview.interview_config_details.title}</span>
                                                        </div>
                                                    )}
                                                    {interview?.interview_config_details?.description && (
                                                        <div className="text-xs text-zinc-400 leading-relaxed">
                                                            {interview.interview_config_details.description}
                                                        </div>
                                                    )}
                                                    {(interview?.interview_config_details?.default_duration_minutes || interview?.default_duration_minutes) && (
                                                        <div className="flex justify-between gap-3 text-xs">
                                                            <span className="flex items-center gap-1.5 text-zinc-500"><HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />Duration</span>
                                                            <span className="text-white font-medium">{interview?.interview_config_details?.default_duration_minutes || interview?.default_duration_minutes} min</span>
                                                        </div>
                                                    )}
                                                    {interview?.link_expires_at && (
                                                        <div className="flex justify-between gap-3 text-xs">
                                                            <span className="flex items-center gap-1.5 text-zinc-500"><HiOutlineCalendarDays className="h-3.5 w-3.5" aria-hidden="true" />Link expires</span>
                                                            <span className="text-white font-medium">{new Date(interview.link_expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })} UTC</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Hardware Requirements */}
                                        {(interview?.camera_required !== undefined || interview?.interview_config_details?.camera_required !== undefined) && (
                                            <div className="space-y-3">
                                                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Hardware Requirements</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(interview?.camera_required ?? interview?.interview_config_details?.camera_required) && (
                                                        <span className="px-2 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400 inline-flex items-center gap-1">
                                                            <HiOutlineVideoCamera className="h-3 w-3" aria-hidden="true" />Camera
                                                        </span>
                                                    )}
                                                    {(interview?.mic_required ?? interview?.interview_config_details?.mic_required) && (
                                                        <span className="px-2 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400 inline-flex items-center gap-1">
                                                            <HiOutlineMicrophone className="h-3 w-3" aria-hidden="true" />Microphone
                                                        </span>
                                                    )}
                                                    {(interview?.screen_share_enabled ?? interview?.interview_config_details?.screen_share_enabled) && (
                                                        <span className="px-2 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400 inline-flex items-center gap-1">
                                                            <HiOutlineComputerDesktop className="h-3 w-3" aria-hidden="true" />Screen Share
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Instructions / Notes */}
                                        <div>
                                            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                                {role === 'CANDIDATE' ? 'Your Instructions' : 'Interviewer Notes'}
                                            </p>
                                            <div className="text-sm text-zinc-400 leading-relaxed space-y-3">
                                                {(role === 'CANDIDATE'
                                                    ? (interview?.candidate_instructions || interview?.interview_config_details?.candidate_instructions)
                                                    : (interview?.interviewer_notes || interview?.interview_config_details?.interviewer_notes)
                                                ) || <span className="text-zinc-500">No instructions provided.</span>}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="chat"
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0  }}
                                        exit={{    opacity: 0, x: -12 }}
                                        transition={fast}
                                        className="flex-1 flex flex-col min-h-0"
                                    >
                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                                            {chatMessages.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-16">
                                                    <HiOutlineChatBubbleLeftRight className="w-8 h-8 text-zinc-600" aria-hidden="true" />
                                                    <p className="text-sm text-zinc-500">No messages yet</p>
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
                                                            <span className="text-[11px] text-zinc-500 px-1">
                                                                {isMe ? 'You' : 'Participant'}
                                                            </span>
                                                            <div className={`px-3.5 py-2.5 rounded-lg text-sm leading-relaxed max-w-[90%] break-words ${
                                                                isMe
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-zinc-800 text-zinc-200'
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
                                        <div className="p-3 sm:p-4 border-t border-white/10 flex gap-2">
                                            <input
                                                value={chatInput}
                                                onChange={e => setChatInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                                placeholder="Message…"
                                                aria-label="Chat message"
                                                className="flex-1 min-w-0 min-h-11 bg-zinc-900 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-600/50 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSend}
                                                disabled={!chatInput.trim()}
                                                aria-label="Send message"
                                                className="w-11 h-11 flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                            >
                                                <HiOutlinePaperAirplane className="w-4 h-4 text-white" aria-hidden="true" />
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