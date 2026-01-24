'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'motion/react';
import { HiOutlineCommandLine } from 'react-icons/hi2';

export default function CodeEditor({ 
    language = 'python', 
    value = '', 
    onChange, 
    theme = 'vs-dark',
    height = '60vh'
}) {
    const handleEditorChange = (value) => {
        onChange(value);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] overflow-hidden border border-emerald-500/10 shadow-2xl bg-[#1e1e1e]"
        >
            <div className="flex items-center justify-between px-6 py-4 bg-[#252525] border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500/80">
                        <HiOutlineCommandLine className="w-4 h-4" />
                        main.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'txt'}
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Monaco Engine v4.7
                </div>
            </div>

            <div style={{ height }}>
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    defaultValue={value}
                    theme={theme}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                        fontLigatures: true,
                        cursorSmoothCaretAnimation: "on",
                        smoothScrolling: true,
                        contextmenu: true,
                        padding: { top: 20, bottom: 20 },
                        lineNumbersMinChars: 3,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>
        </motion.div>
    );
}
