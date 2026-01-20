"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from 'next/navigation';
import {
    HiMicrophone,
    HiVideoCamera,
    HiPhone,
    HiChatAlt2,
    HiX,
} from "react-icons/hi";
import { MdSend, MdVolumeUp, MdStop } from "react-icons/md";
import { BiMessageDetail } from "react-icons/bi";
import axios from "axios";
import AvatarSetuUp from "@/components/avatar/Scene";
import MiniVisualizer from "@/components/avatar/Audio";
import { useAvatar } from "@/context/AvatarContext";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

// --- CAMERA SECTION ---
const CameraArea = () => (
    <motion.div
        animate={{ flex: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="border-[2px] border-white/10 rounded-2xl overflow-hidden relative bg-white/5 backdrop-blur-3xl shadow-inner"
    >
        <AvatarSetuUp />
    </motion.div>
);

// --- CHAT SECTION ---
const ChatArea = ({
    messages,
    transcript,
    setTranscript,
    listening,
    speakText,
    onSend,
    isCompleting,
    onComplete,
    isCandidate,
}) => {
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = (el.scrollHeight) + "px";
    }, [transcript]);

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
                <h2 className="text-white text-lg font-black tracking-tight">Neural Interview <span className="text-emerald-500 italic">Chat</span></h2>
                {isCandidate && (
                    <button
                        onClick={onComplete}
                        disabled={isCompleting || messages.length < 3}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${messages.length < 3
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            }`}
                    >
                        {isCompleting ? 'Finishing...' : 'End session'}
                    </button>
                )}
            </div>

            {/* Status Banner */}
            <AnimatePresence>
                {isBannerVisible && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="relative px-6 py-4 flex items-start justify-between bg-emerald-500/10 border-b border-emerald-500/20 group"
                    >
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <BiMessageDetail size={20} />
                            </div>
                            <div>
                                <p className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.1em]">
                                    Conversation active
                                </p>
                                <p className="text-emerald-400/50 text-[10px] font-bold">
                                    AI is currently listening to your input.
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
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-6 space-y-6 scrollbar-hide">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] px-5 py-3.5 rounded-2xl relative shadow-sm border ${msg.role === 'assistant'
                                ? 'bg-white/5 border-white/10 text-slate-300 rounded-tl-none'
                                : 'bg-emerald-700/50 border-emerald-600 text-white rounded-tr-none'
                                }`}
                        >
                            <p className="text-[13px] font-medium leading-relaxed">{msg.content}</p>

                            <div className="flex items-center justify-between mt-3">
                                <div className={`text-[9px] font-bold uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-white' : 'text-slate-500'}`}>
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                {msg.role === 'assistant' && (
                                    <button
                                        onClick={() => speakText(msg.content)}
                                        className="text-slate-400 hover:text-emerald-500 transition-colors"
                                    >
                                        <MdVolumeUp size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {listening && (
                    <div className="flex items-center gap-2 text-emerald-500 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Listening...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 border-t border-white/5 bg-[#0D0D0D] shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
                <div className="flex items-end gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus-within:border-emerald-500 transition-all">
                    <textarea
                        ref={textareaRef}
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                        placeholder="Type or speak your answer..."
                        rows={1}
                        className="flex-1 resize-none bg-transparent outline-none text-[13px] font-medium text-white placeholder-slate-500 overflow-hidden leading-relaxed max-h-32"
                    />
                    <button
                        onClick={onSend}
                        disabled={!transcript.trim()}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${!transcript.trim()
                            ? "text-slate-600"
                            : "text-emerald-500 hover:bg-emerald-500/10"
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
    listening,
    isSpeaking,
    onStopTTS,
    onSend,
    transcript,
    startListening,
    stopListening,
}) => {
    const router = useRouter();
    const [isVideoOff, setIsVideoOff] = useState(false);

    const toggleMic = () => {
        if (listening) stopListening();
        else startListening();
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 flex items-center justify-between px-10 z-50">
            <div className="flex items-center bg-gray-800/30 backdrop-blur-sm border border-gray-400/20 rounded-4xl py-2 px-8">
                <div className="flex flex-col">
                    <span className="text-white font-black text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Neural Stream</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10"></div>
                <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 tracking-wider">SEC-BETA-09</span>
            </div>

            <div className="flex items-center gap-3 bg-gray-800/40 backdrop-blur-sm border border-gray-400/20 rounded-4xl py-2 px-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsVideoOff(!isVideoOff)}
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
                    onClick={toggleMic}
                    className={`w-12 h-12 rounded-3xl flex items-center justify-center transition-all shadow-lg ${listening
                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5"
                        }`}
                >
                    <HiMicrophone className="w-6 h-6" />
                </motion.button>

                {(listening || isSpeaking) && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden md:block"
                    >
                        <MiniVisualizer />
                    </motion.div>
                )}

                {isSpeaking && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onStopTTS}
                        className="w-12 h-12 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20"
                    >
                        <MdStop size={22} />
                    </motion.button>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSend(transcript)}
                    disabled={!transcript.trim()}
                    className={`w-12 h-12 rounded-3xl flex items-center justify-center transition-all shadow-lg ${!transcript.trim()
                        ? "bg-white/5 text-slate-600 border border-white/5"
                        : "bg-emerald-500 text-white shadow-emerald-500/20"
                        }`}
                >
                    <MdSend className="w-6 h-6" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-3xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all"
                >
                    <HiPhone className="w-6 h-6 rotate-[135deg]" />
                </motion.button>
            </div>

            <div className="flex items-center gap-3 bg-gray-800/20 backdrop-blur-sm border border-gray-400/20 rounded-4xl py-2 px-8">
                <div className="text-right mr-4 hidden xl:block">
                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest leading-none mb-1">Grid Status</p>
                    <p className="text-white font-black text-[12px]">OPTIMIZED</p>
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

// --- MAIN COMPONENT ---
export default function InterviewSession() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const {
        stopTTS,
        isSpeaking,
        setIsSpeaking,
        listening,
        transcript,
        setTranscript,
        startListening,
        stopListening,
        setSay,
        setSpeak,
    } = useAvatar();

    // API State
    const [interviewId, setInterviewId] = useState(null); // candidate-interview UUID
    const [aiInterviewId, setAiInterviewId] = useState(null); // recruiter's setup UUID
    const [isCandidate, setIsCandidate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [voicesLoaded, setVoicesLoaded] = useState(false);

    useEffect(() => {
        // Load voices for TTS
        const checkVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) setVoicesLoaded(true);
            else setTimeout(checkVoices, 200);
        };
        if (typeof window !== "undefined") {
            window.speechSynthesis.onvoiceschanged = checkVoices;
            checkVoices();
        }

        // Initial data loading
        const init = async () => {
            const token = localStorage.getItem('access_token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                router.push('/auth/login');
                return;
            }

            const user = JSON.parse(userStr);
            const id = searchParams.get('id'); // ai_interview_id (candidate-setup)
            const cId = searchParams.get('candidate_interview_id'); // existing candidate interview

            try {
                if (cId) {
                    await loadExistingInterview(token, cId);
                } else if (id) {
                    if (user.role === 'candidate') {
                        await startNewInterview(token, id);
                    } else {
                        await loadRecruiterTest(token, id);
                    }
                } else {
                    router.push('/ai-interview');
                }
            } catch (err) {
                console.error("Init error:", err);
                router.push('/ai-interview');
            } finally {
                setIsLoading(false);
            }
        };

        if (voicesLoaded) {
            init();
        }
    }, [voicesLoaded]);

    const startNewInterview = async (token, aid) => {
        const response = await axios.post(
            `${SERVER_URL}/ai_interviews/candidate/start/`,
            { ai_interview_id: aid },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
            setInterviewId(response.data.interview_id);
            setAiInterviewId(response.data.ai_interview_id);
            setIsCandidate(true);
            setMessages([{ role: 'assistant', content: response.data.first_question }]);
            setTimeout(() => speakText(response.data.first_question), 1000);
        }
    };

    const loadExistingInterview = async (token, cid) => {
        const response = await axios.get(
            `${SERVER_URL}/ai_interviews/${cid}/candidate-results/`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
            const data = response.data.data;
            setInterviewId(data.id);
            setAiInterviewId(data.ai_interview_id);
            setIsCandidate(true);

            if (data.status === 'completed') {
                router.push(`/ai-interview/candidate-result?id=${cid}`);
                return;
            }

            if (data.conversation_data?.messages) {
                setMessages(data.conversation_data.messages);
            }
        }
    };

    const loadRecruiterTest = async (token, aid) => {
        const response = await axios.get(
            `${SERVER_URL}/ai_interviews/${aid}/`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
            const data = response.data.data;
            setAiInterviewId(data.id);
            setIsCandidate(false);
            const q = data.interview_config.first_question;
            setMessages([{ role: 'assistant', content: q }]);
            setTimeout(() => speakText(q), 1000);
        }
    };

    const speakText = (text) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const cleanText = text.replace(/\[TESTING MODE\]/g, "");
        const utter = new SpeechSynthesisUtterance(cleanText);
        utter.lang = "en-US";
        utter.rate = 1.8;
        utter.pitch = 1.8;

        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.name.includes("Mark") || v.name.includes("US English") || v.default);
        if (voice) utter.voice = voice;

        setSpeak(true);
        setSay(cleanText);
        setIsSpeaking(true);

        utter.onend = () => {
            setIsSpeaking(false);
            setSpeak(false);
            setSay("");
            stopTTS();
        };

        window.speechSynthesis.speak(utter);
    };

    const handleSendForChat = async (inputStr) => {
        const text = inputStr || transcript;
        if (!text.trim() || isLoading) return;

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setTranscript("");

        if (!isCandidate) {
            setTimeout(() => {
                const reply = "You are in recuiter testing mode. In a real candidate session, I would now evaluate your response against the job requirements.";
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
                speakText(reply);
            }, 1000);
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(
                `${SERVER_URL}/ai_interviews/${interviewId}/chat/`,
                { query: text },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
                speakText(response.data.answer);
            }
        } catch (err) {
            console.error("Chat error:", err);
        }
    };

    const handleComplete = async () => {
        if (!interviewId || isCompleting) return;
        setIsCompleting(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(
                `${SERVER_URL}/ai_interviews/${interviewId}/complete/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            router.push(`/ai-interview/candidate-result?id=${interviewId}`);
        } catch (err) {
            console.error("Completion error:", err);
            setIsCompleting(false);
        }
    };

    if (!voicesLoaded || isLoading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0A0A0A] font-poppins">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-white font-black text-sm uppercase tracking-[0.3em]">Neural Link Initializing</p>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">{!voicesLoaded ? "Calibrating Neural Voice..." : "Connecting to Node..."}</p>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-screen bg-[#0A0A0A] flex flex-col overflow-hidden font-poppins">
            <div className="flex flex-1 overflow-hidden gap-6 p-4 pb-24">
                <CameraArea />
                <AnimatePresence mode="wait">
                    {isChatOpen && (
                        <ChatArea
                            messages={messages}
                            transcript={transcript}
                            setTranscript={setTranscript}
                            listening={listening}
                            speakText={speakText}
                            onSend={() => handleSendForChat()}
                            isCompleting={isCompleting}
                            onComplete={handleComplete}
                            isCandidate={isCandidate}
                        />
                    )}
                </AnimatePresence>
            </div>

            <BottomBar
                onChatToggle={() => setIsChatOpen(!isChatOpen)}
                isChatOpen={isChatOpen}
                listening={listening}
                isSpeaking={isSpeaking}
                onStopTTS={stopTTS}
                onSend={(val) => handleSendForChat(val)}
                transcript={transcript}
                startListening={startListening}
                stopListening={stopListening}
            />
        </div>
    );
}
