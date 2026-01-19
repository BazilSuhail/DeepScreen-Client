"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from 'next/navigation';
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
                {messages.map((msg) => (
                    <div
                        key={msg.id}
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
                                    {msg.timestamp}
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
                        placeholder="Type or speak your answer..."
                        rows={1}
                        className="flex-1 resize-none bg-transparent outline-none text-[13px] font-medium text-white placeholder-slate-500 overflow-hidden leading-relaxed max-h-32"
                    />
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

    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [voicesLoaded, setVoicesLoaded] = useState(false);

    useEffect(() => {
        const checkVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                setVoicesLoaded(true);
            } else {
                setTimeout(checkVoices, 200);
            }
        };
        if (typeof window !== "undefined") {
            window.speechSynthesis.onvoiceschanged = checkVoices;
            checkVoices();
        }
        return () => {
            if (typeof window !== "undefined") window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const speakText = (text) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        utter.rate = 1.1;
        utter.pitch = 1.1;

        const voice = window.speechSynthesis.getVoices().find((v) => v.name.includes("Mark") || v.name.includes("US English") || v.default);
        if (voice) utter.voice = voice;

        setSpeak(true);
        setSay(text);
        setIsSpeaking(true);

        utter.onend = () => {
            setIsSpeaking(false);
            setSpeak(false);
            setSay("");
            stopTTS();
        };

        window.speechSynthesis.speak(utter);
    };

    const sendAnswer = async (answer) => {
        if (!answer) return;
        const userMsg = {
            role: "user",
            content: answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            id: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setTranscript("");

        try {
            // Mocking API for now since we don't have the backend endpoint details
            const reply = "That's a very insightful point. Can you elaborate on the technical challenges you faced during this project and how you overcame them?";
            const aiMsg = {
                role: "assistant",
                content: reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                id: Date.now() + 1,
            };
            setMessages((prev) => [...prev, aiMsg]);
            speakText(reply);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const initInterview = () => {
            const welcome = "Hello! I am your AI Interviewer. We are excited to learn more about your background. To start, could you please introduce yourself and tell me about your most significant achievement?";
            setMessages([
                {
                    role: "assistant",
                    content: welcome,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    id: Date.now(),
                },
            ]);
            setTimeout(() => speakText(welcome), 1000);
        };
        if (voicesLoaded) {
            initInterview();
        }
    }, [voicesLoaded]);

    if (!voicesLoaded) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0A0A0A] font-poppins">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-white font-black text-sm uppercase tracking-[0.3em]">Calibrating Neural Voice</p>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Connecting to vector collection node...</p>
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
                            key="chat"
                            messages={messages}
                            transcript={transcript}
                            setTranscript={setTranscript}
                            listening={listening}
                            speakText={speakText}
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
                onSend={sendAnswer}
                transcript={transcript}
                startListening={startListening}
                stopListening={stopListening}
            />
        </div>
    );
}
