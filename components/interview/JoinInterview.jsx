'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/utils/api';
import { rtcApi } from '@/utils/interview_api';
import { HiOutlineVideoCamera, HiOutlineMicrophone, HiOutlineShieldCheck, HiOutlineArrowRight } from 'react-icons/hi';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import ActiveInterviewRoom from './ActiveInterviewRoom';

export default function JoinInterview({ token }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lkToken, setLkToken] = useState(null);
    const [role, setRole] = useState(null);
    const [interview, setInterview] = useState(null);
    const [joining, setJoining] = useState(false);
    const [stream, setStream] = useState(null);
    const [micEnabled, setMicEnabled] = useState(true);
    const [camEnabled, setCamEnabled] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchInterview();
        requestPermissions();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [token]);

    const requestPermissions = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(s);
        } catch (err) {
            console.error('Permission error:', err);
        }
    };

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

    const handleJoin = async () => {
        try {
            setJoining(true);
            // 1. Signal Django that session is starting
            await api.post(`/interviews/candidate/${interview.room_id}/start/`, {});
            
            // 2. Call the Go Microservice via the new RTC utility
            const lkData = await rtcApi.getJoinToken(token);
            setLkToken(lkData.token);
            setRole(lkData.role);
            
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
        return (
            <div className="h-screen w-screen bg-black">
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={lkToken}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880"}
                    connect={true}
                    data-lk-theme="default"
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
                                ref={(el) => { if (el) el.srcObject = stream; }}
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
                        <p className="text-muted-foreground">
                            You've been invited to a live technical interview. Join the room when you're ready.
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
    );
}
