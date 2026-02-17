'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/utils/api';
import { rtcApi } from '@/utils/interview_api';
import { HiOutlineVideoCamera, HiOutlineMicrophone, HiOutlineShieldCheck, HiOutlineArrowRight } from 'react-icons/hi';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

export default function JoinInterview({ token }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lkToken, setLkToken] = useState(null);
    const [interview, setInterview] = useState(null);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        fetchInterview();
    }, [token]);

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
                >
                    <VideoConference />
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
                {/* Left Side: Preview & Controls (Mock) */}
                <div className="space-y-6">
                    <div className="aspect-video bg-secondary/80 rounded-3xl border border-border flex items-center justify-center overflow-hidden relative group">
                        <div className="text-muted-foreground text-center">
                            <HiOutlineVideoCamera className="w-16 h-16 mx-auto mb-2 opacity-20" />
                            <p className="text-sm font-medium">Camera Preview</p>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                            <button className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-110 transition-all">
                                <HiOutlineVideoCamera className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-110 transition-all">
                                <HiOutlineMicrophone className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-emerald-500/20">
                        <HiOutlineShieldCheck className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-sm">Secure Connection</p>
                            <p className="text-xs text-muted-foreground">Your interview is encrypted and private.</p>
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
