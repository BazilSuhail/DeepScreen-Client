'use client';

import React, { useState, useRef, useEffect } from 'react'; 
import dynamic from 'next/dynamic';
import { BiCheckCircle } from 'react-icons/bi'; 
import { CgCopy } from 'react-icons/cg';

// Dynamically import Monaco editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGE_TEMPLATES = {
    python: `def solution(x):
    # Write your solution here
    pass
`,
    javascript: `function solution(x) {
    // Write your solution here
    
}
`,
    java: `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}
`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}
`,
    go: `package main

import "fmt"

func main() {
    // Write your solution here
}
`,
    rust: `fn main() {
    // Write your solution here
}
`,
};

const LANGUAGE_COLORS = {
    python: 'from-blue-500 to-blue-600',
    javascript: 'from-yellow-400 to-yellow-600',
    java: 'from-red-500 to-red-600',
    cpp: 'from-blue-600 to-blue-700',
    go: 'from-cyan-500 to-cyan-600',
    rust: 'from-orange-600 to-orange-700',
};

const MONACO_LANGUAGE_MAP = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    go: 'go',
    rust: 'rust',
};

export function CodeEditor({ value, onChange, language = 'python', readOnly = false, height = '400px' }) {
    const [copied, setCopied] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInsertTemplate = () => {
        if (!readOnly) {
            const template = LANGUAGE_TEMPLATES[language] || '';
            onChange(template);
        }
    };

    const monacoLanguage = MONACO_LANGUAGE_MAP[language] || 'python';

    return (
        <div className="space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${LANGUAGE_COLORS[language] || 'from-gray-500 to-gray-600'}`}>
                        {language.toUpperCase()}
                    </div>
                    <span className="text-xs text-muted-foreground">{value.length} characters</span>
                </div>
                <div className="flex gap-2">
                    {!readOnly && (
                        <button
                            onClick={handleInsertTemplate}
                            className="text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all"
                        >
                            📋 Template
                        </button>
                    )}
                    <button
                        onClick={handleCopy}
                        className="text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border transition-all flex items-center gap-1"
                    >
                        {copied ? (
                            <>
                                <BiCheckCircle className="w-3 h-3 text-emerald-500" /> Copied!
                            </>
                        ) : (
                            <>
                                <CgCopy className="w-3 h-3" /> Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden border border-border/50 bg-[#0d1117] min-h-0">
                {isMounted ? (
                    <MonacoEditor
                        height="100%"
                        language={monacoLanguage}
                        value={value}
                        onChange={(val) => onChange(val || '')}
                        theme="vs-dark"
                        options={{
                            readOnly: readOnly,
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: '"Fira Code", "Monaco", monospace',
                            lineHeight: 1.5,
                            tabSize: 4,
                            wordWrap: 'on',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            padding: { top: 16, bottom: 16 },
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Loading editor...
                    </div>
                )}
            </div>

            <div className="text-xs text-muted-foreground flex gap-2 shrink-0">
                <span>💡 IDE shortcuts available</span>
                <span>•</span>
                <span>Ctrl+/ for comments</span>
            </div>
        </div>
    );
}
