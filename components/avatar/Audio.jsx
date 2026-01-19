"use client";

import React from "react";
import { useAvatar } from "@/context/AvatarContext";

const MiniVisualizer = () => {
    const { isSpeaking, listening } = useAvatar();
    const isActive = isSpeaking || listening;

    const barCount = 14;
    const bars = Array.from({ length: barCount }, (_, i) => i);

    return (
        <div className="flex items-center justify-center gap-[2px] h-10 px-4 py-2 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-xl shadow-2xl shadow-emerald-900/10">
            <div className="flex items-end justify-center gap-[3px] h-full pt-1">
                {bars.map((bar) => {
                    const animationIndex = (bar % 5) + 1;
                    const isEven = bar % 2 === 0;

                    // Alternating Emerald Shades
                    let barColor = "bg-emerald-950/40"; // Idle

                    if (isSpeaking) {
                        barColor = isEven ? "bg-emerald-400" : "bg-emerald-500";
                    } else if (listening) {
                        barColor = isEven ? "bg-emerald-700" : "bg-emerald-800";
                    }

                    return (
                        <div
                            key={bar}
                            className={`w-[3px] rounded-full transition-all duration-500 ${barColor} 
                                ${isSpeaking ? "shadow-[0_0_10px_rgba(52,211,153,0.3)]" : ""} 
                                ${isActive ? `animate-sound-wave-${animationIndex}` : "h-[4px]"}`}
                            style={{
                                animationDelay: `${bar * 0.08}s`,
                                animationDuration: isSpeaking ? "0.7s" : "1.4s",
                                animationIterationCount: "infinite",
                                animationTimingFunction: "ease-in-out"
                            }}
                        />
                    );
                })}
            </div>

            {/* Status Text (Small) */}
            <div className="ml-4 flex flex-col justify-center border-l border-white/5 pl-4">
                <span className={`text-[8px] font-black uppercase tracking-widest ${isSpeaking ? "text-emerald-400" : listening ? "text-emerald-600" : "text-emerald-900"}`}>
                    {isSpeaking ? "Speaking" : listening ? "Listening" : "Idle"}
                </span>
                <div className={`w-full h-[1px] mt-1 ${isSpeaking ? "bg-emerald-400/50" : listening ? "bg-emerald-600/30" : "bg-emerald-900/20"} transition-all duration-500`} />
            </div>
        </div>
    );
};

export default MiniVisualizer;
