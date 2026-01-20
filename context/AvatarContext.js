"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";

const AvatarContext = createContext();

export const AvatarProvider = ({ children }) => {
    const [speak, setSpeak] = useState(false);
    const [say, setSay] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceReady, setVoiceReady] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef(null);
    const currentUtterance = useRef(null);

    // Load available voices
    useEffect(() => {
        const load = () => setVoiceReady(speechSynthesis.getVoices().length > 0);
        if (typeof window !== "undefined") {
            speechSynthesis.onvoiceschanged = load;
            load();
        }
    }, []);

    // --- Text-to-Speech ---
    const speakText = (text) => {
        if (!text || isSpeaking) return;
        if (typeof window === "undefined") return;

        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        utter.rate = 1.8;
        utter.pitch = 1.8;
        utter.volume = 0.9;
        const voice = speechSynthesis.getVoices().find((v) => v.name.includes("Mark"));
        //const voice = speechSynthesis.getVoices().find((v) => v.name.includes("Mark") || v.name.includes("Google US English") || v.default);
        if (voice) utter.voice = voice;

        currentUtterance.current = utter;

        utter.onstart = () => {
            setSay(text);
            setSpeak(true);
            setIsSpeaking(true);
        };

        utter.onend = () => {
            if (currentUtterance.current === utter) {
                setSay("");
                setSpeak(false);
                setIsSpeaking(false);
                currentUtterance.current = null;
            }
        };

        utter.onerror = () => {
            setSay("");
            setSpeak(false);
            setIsSpeaking(false);
            currentUtterance.current = null;
        };

        speechSynthesis.speak(utter);
    };

    const stopTTS = () => {
        if (typeof window !== "undefined" && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        setSay("");
        setSpeak(false);
        setIsSpeaking(false);
        currentUtterance.current = null;
    };

    // --- Speech-to-Text ---
    useEffect(() => {
        if (typeof window === "undefined") return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recog = new SpeechRecognition();
        recog.lang = "en-US";
        recog.interimResults = true;
        recog.continuous = true;

        let silenceTimer = null;

        const resetSilenceTimer = () => {
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                recog.stop();
            }, 8000);
        };

        recog.onstart = () => {
            setListening(true);
            resetSilenceTimer();
        };

        recog.onresult = (e) => {
            let text = "";
            for (let i = 0; i < e.results.length; i++) {
                text += e.results[i][0].transcript + " ";
            }
            setTranscript(text.trim());
            resetSilenceTimer();
        };

        recog.onend = () => {
            setListening(false);
            if (silenceTimer) clearTimeout(silenceTimer);
        };

        recog.onerror = () => {
            setListening(false);
            if (silenceTimer) clearTimeout(silenceTimer);
        };

        recognitionRef.current = recog;
    }, []);

    const startListening = () => {
        if (!recognitionRef.current || listening) return;
        setTranscript("");
        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current && listening) recognitionRef.current.stop();
    };

    return (
        <AvatarContext.Provider
            value={{
                say,
                speak,
                isSpeaking,
                speakText,
                stopTTS,
                setSpeak,
                setSay,
                setIsSpeaking,
                voiceReady,
                transcript,
                setTranscript,
                listening,
                startListening,
                stopListening,
            }}
        >
            {children}
        </AvatarContext.Provider>
    );
};

export const useAvatar = () => {
    const context = useContext(AvatarContext);
    if (!context) {
        throw new Error("useAvatar must be used within an AvatarProvider");
    }
    return context;
};
