'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/utils/api';
import { rtcApi } from '@/utils/interview_api';
import { LIVEKIT_URL } from '@/utils/config';
import {
    HiOutlineVideoCamera,
    HiOutlineMicrophone,
    HiOutlineShieldCheck,
    HiOutlineArrowRight,
    HiOutlineLockClosed,
    HiOutlineCamera,
} from 'react-icons/hi';
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import ActiveInterviewRoom from './ActiveInterviewRoom';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function JoinInterview({ token }) {
    const router = useRouter();
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lkToken, setLkToken] = useState(null);
    const [lkData, setLkData] = useState(null);
    const [role, setRole] = useState(null);
    const [interview, setInterview] = useState(null);
    const [joining, setJoining] = useState(false);
    const [stream, setStream] = useState(null);
    const streamRef = useRef(null);
    const [micEnabled, setMicEnabled] = useState(true);
    const [camEnabled, setCamEnabled] = useState(true);

    // Permission states: 'idle' | 'checking' | 'granted' | 'denied'
    const [permState, setPermState] = useState('idle');
    const [permError, setPermError] = useState(null);
    const [showPermModal, setShowPermModal] = useState(true);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/interviews/candidate/join/${token}/`);
                setInterview(response.interview);
            } catch (err) {
                console.error('Error fetching interview:', err);
                setError(err.message || 'Invalid or expired interview link');
            } finally {
                setLoading(false);
            }
        };
        fetchInterview();
        return () => {
            const current = streamRef.current;
            if (current) current.getTracks().forEach(track => track.stop());
        };
    }, [token]);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const requestPermissions = async () => {
        setPermState('checking');
        setPermError(null);
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = s;
            setStream(s);
            setPermState('granted');
            setShowPermModal(false);
        } catch (err) {
            console.error('Permission error:', err);
            setPermState('denied');
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermError(
                    'Camera and microphone access was denied. Please allow access in your browser settings, then try again.'
                );
            } else if (err.name === 'NotFoundError') {
                setPermError('No camera or microphone found. Please connect a device and try again.');
            } else {
                setPermError('Could not access camera or microphone. Please check your devices and try again.');
            }
        }
    };

    const handleJoin = async () => {
        try {
            setJoining(true);
            
            // 1. Signal Django that session is starting
            console.log(`[Interview] Starting session for room: ${interview.room_id}`);
            await api.post(`/interviews/candidate/${interview.room_id}/start/`, {});
            
            // 2. Get LiveKit token from Django backend
            console.log(`[Interview] Fetching LiveKit token with access_token: ${token}`);
            const lkData = await rtcApi.getJoinToken(token);
            console.log('[Interview] LiveKit response:', lkData);
            
            // Decode JWT to inspect payload (for debugging)
            if (lkData.token) {
                try {
                    const parts = lkData.token.split('.');
                    if (parts.length === 3) {
                        const decoded = JSON.parse(atob(parts[1]));
                        console.log('[Interview] Token payload:', decoded);
                        console.log('[Interview] Room from payload:', decoded.video?.room);
                        console.log('[Interview] Identity from payload:', decoded.identity);
                    }
                } catch (decodeErr) {
                    console.warn('[Interview] Could not decode token for inspection:', decodeErr);
                }
            }
            
            setLkToken(lkData.token);
            setRole(lkData.role);
            setLkData(lkData); // Store full data including serverUrl
            
        } catch (err) {
            console.error('Join Error:', err);
            alert('Failed to join session: ' + err.message);
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-mesh p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass p-8 rounded-3xl border border-destructive/20 text-center"
                >
                    <div className="text-destructive text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-secondary rounded-xl font-bold"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    if (lkToken) {
        const serverUrl = lkData?.serverUrl || LIVEKIT_URL;
        
        if (!serverUrl.startsWith('ws://') && !serverUrl.startsWith('wss://')) {
            console.error('[LiveKit] Invalid serverUrl:', serverUrl);
            return (
                <div className="min-h-screen flex items-center justify-center bg-mesh p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full glass p-8 rounded-3xl border border-destructive/20 text-center"
                    >
                        <div className="text-destructive text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
                        <p className="text-muted-foreground mb-6">Invalid LiveKit URL: {serverUrl}</p>
                        <p className="text-xs text-slate-500 mb-4">Must start with ws:// or wss://</p>
                    </motion.div>
                </div>
            );
        }
        
        return (
            <div className="h-screen w-screen bg-black">
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={lkToken}
                    serverUrl={serverUrl}
                    connect={true}
                    data-lk-theme="default"
                    onError={(error) => {
                        console.error('[LiveKit] Connection error:', error);
                        setError(`LiveKit Connection Failed: ${error.message || 'Unknown error'}`);
                    }}
                    onDisconnected={() => {
                        router.push(role === 'CANDIDATE' ? '/candidate/interview' : '/recruiter/interview');
                    }}
                >
                    <ActiveInterviewRoom interview={interview} role={role} />
                </LiveKitRoom>
            </div>
        );
    }

    return (
        <>
            {/* Permission Grant Modal Overlay */}
            <AnimatePresence>
                {showPermModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl space-y-6"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <HiOutlineCamera className="w-7 h-7 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Camera & Microphone Access</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Required for the live interview session
                                    </p>
                                </div>
                            </div>

                            {/* Permission denied error */}
                            {permState === 'denied' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <FaExclamationTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                        <p className="text-sm font-bold text-red-500">Permission Denied</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{permError}</p>
                                    <div className="text-xs text-muted-foreground bg-black/10 rounded-xl p-3 space-y-1">
                                        <p className="font-bold text-foreground">How to enable:</p>
                                        <p>1. Click the camera/lock icon in your browser address bar</p>
                                        <p>2. Set Camera and Microphone to <strong>Allow</strong></p>
                                        <p>3. Reload the page and try again</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Checking spinner */}
                            {permState === 'checking' && (
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 shrink-0" />
                                    <p className="text-sm text-muted-foreground">Requesting camera and microphone access...</p>
                                </div>
                            )}

                            {/* Permissions list */}
                            {permState === 'idle' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/20 border border-border">
                                        <HiOutlineVideoCamera className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold">Camera</p>
                                            <p className="text-xs text-muted-foreground">Required for video feed</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/20 border border-border">
                                        <HiOutlineMicrophone className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold">Microphone</p>
                                            <p className="text-xs text-muted-foreground">Required for audio communication</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/20 border border-border">
                                        <HiOutlineLockClosed className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold">Secure Connection</p>
                                            <p className="text-xs text-muted-foreground">Encrypted end-to-end</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-3 pt-2">
                                {permState === 'denied' ? (
                                    <>
                                        <button
                                            onClick={requestPermissions}
                                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <HiOutlineArrowRight className="w-5 h-5" />
                                            Try Again
                                        </button>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="w-full py-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-2xl transition-all"
                                        >
                                            Reload Page
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={requestPermissions}
                                        disabled={permState === 'checking'}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20"
                                    >
                                        {permState === 'checking' ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                        ) : (
                                            <>
                                                <HiOutlineShieldCheck className="w-5 h-5" />
                                                Allow Camera & Microphone
                                            </>
                                        )}
                                    </button>
                                )}
                                <p className="text-center text-[10px] text-muted-foreground">
                                    Your browser will prompt you to allow camera and microphone access.
                                    This is required to participate in the live interview.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="min-h-screen flex flex-col items-center justify-center bg-mesh p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                >
                    {/* Left Side: Real Preview & Controls */}
                    <div className="space-y-6">
                        <div className="aspect-video bg-slate-900 rounded-3xl border border-border flex items-center justify-center overflow-hidden relative group shadow-2xl">
                            {stream && camEnabled ? (
                                <video 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    ref={videoRef}
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                            ) : (
                                <div className="text-muted-foreground text-center">
                                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                        <HiOutlineVideoCamera className="w-10 h-10 opacity-20" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Camera is Off</p>
                                </div>
                            )}
                            
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                                <button 
                                    onClick={() => setCamEnabled(!camEnabled)}
                                    className={`p-4 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 border ${
                                        camEnabled ? 'bg-white text-slate-900 border-white' : 'bg-destructive text-white border-destructive'
                                    }`}
                                >
                                    <HiOutlineVideoCamera className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={() => setMicEnabled(!micEnabled)}
                                    className={`p-4 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 border ${
                                        micEnabled ? 'bg-white text-slate-900 border-white' : 'bg-destructive text-white border-destructive'
                                    }`}
                                >
                                    <HiOutlineMicrophone className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-5 glass rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <HiOutlineShieldCheck className="w-7 h-7 text-emerald-500" />
                            </div>
                            <div>
                                <p className="font-black text-sm uppercase tracking-tight">Security Check Passed</p>
                                <p className="text-xs text-muted-foreground">Encrypted P2P connection initialized.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Info & Join */}
                    <div className="space-y-8">
                        <div>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                                Ready to start
                            </span>
                            <h1 className="text-4xl font-black mt-4 mb-2 tracking-tight">
                                Live Interview Session
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                {interview?.candidate_instructions || "You've been invited to a live technical interview. Join the room when you're ready."}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-2xl border border-border">
                                <span className="text-sm font-medium text-muted-foreground">Candidate</span>
                                <span className="font-bold">{interview.candidate_details?.email}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-2xl border border-border">
                                <span className="text-sm font-medium text-muted-foreground">Status</span>
                                <span className="text-emerald-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    {interview.status}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                        >
                            {joining ? 'Connecting...' : (
                                <>
                                    Join Interview Room
                                    <HiOutlineArrowRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                        
                        <p className="text-center text-xs text-muted-foreground">
                            By joining, you agree to our terms of service regarding recorded sessions.
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
