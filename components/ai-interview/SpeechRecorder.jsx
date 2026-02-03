'use client';

import { useState, useRef, useEffect } from 'react';
import { HiOutlineMicrophone, HiOutlineStop, HiOutlineVolumeUp } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function SpeechRecorder({ onAnswer, isRecording: externalRecording, disabled = false }) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const mediaRecorderRef = useRef(null);
    const recognitionRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        // Initialize Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'en-GB'; // British English (Mark)
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onstart = () => {
                setIsRecording(true);
            };

            recognitionRef.current.onresult = (event) => {
                let interim = '';
                let final = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        final += transcript + ' ';
                    } else {
                        interim += transcript;
                    }
                }

                setTranscript((prev) => prev + final);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.start();
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            setIsRecording(false);
        }
    };

    const speakQuestion = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSubmit = () => {
        if (transcript.trim()) {
            onAnswer(transcript.trim());
            setTranscript('');
        }
    };

    const handleClear = () => {
        setTranscript('');
    };

    return (
        <div className="w-full space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            {/* Transcript Display */}
            <div className="min-h-24 p-4 bg-white rounded-lg border-2 border-gray-200 font-medium text-gray-800">
                {transcript || <span className="text-gray-400 italic">Your answer will appear here...</span>}
            </div>

            {/* Recording Controls */}
            <div className="flex gap-3 flex-wrap">
                {!isRecording ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startRecording}
                        disabled={disabled}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 font-semibold shadow-lg"
                    >
                        <HiOutlineMicrophone className="w-5 h-5" />
                        Start Recording
                    </motion.button>
                ) : (
                    <motion.button
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold shadow-lg"
                    >
                        <HiOutlineStop className="w-5 h-5" />
                        Stop Recording
                    </motion.button>
                )}

                {transcript && (
                    <>
                        <button
                            onClick={handleClear}
                            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                        >
                            Clear
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold shadow-lg"
                        >
                            Submit Answer
                        </motion.button>
                    </>
                )}
            </div>

            {/* Status */}
            {isRecording && (
                <div className="text-sm text-red-600 font-semibold animate-pulse">
                    🎤 Recording in progress...
                </div>
            )}
        </div>
    );
}
