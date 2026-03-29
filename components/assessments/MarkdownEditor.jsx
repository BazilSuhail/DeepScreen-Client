'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
    HiOutlineBold,
    HiOutlineItalic,
    HiOutlineListBullet,
    HiOutlineCodeBracket,
    HiOutlineEye,
    HiOutlinePencilSquare,
} from 'react-icons/hi2';

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderMarkdown(raw) {
    const lines = raw.split('\n');
    const out = [];
    let inCode = false;
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (line.startsWith('```')) {
            if (inCode) {
                out.push('</code></pre>');
                inCode = false;
            } else {
                if (inList) { out.push('</ul>'); inList = false; }
                out.push('<pre class="bg-secondary/50 border border-border rounded-2xl p-5 my-3 overflow-x-auto"><code>');
                inCode = true;
            }
            continue;
        }

        if (inCode) {
            out.push(escapeHtml(line) + '\n');
            continue;
        }

        const trimmed = line.trim();
        if (trimmed === '') {
            if (inList) { out.push('</ul>'); inList = false; }
            continue;
        }

        const escaped = escapeHtml(line);

        if (trimmed.startsWith('- ')) {
            if (!inList) { out.push('<ul class="space-y-1.5 list-disc list-inside marker:text-emerald-500">'); inList = true; }
            let content = trimmed.slice(2);
            content = content
                .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>');
            out.push(`<li class="text-sm leading-relaxed">${content}</li>`);
            continue;
        }

        if (inList) { out.push('</ul>'); inList = false; }

        let content = escaped;
        content = content
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>');

        out.push(`<p class="text-sm leading-relaxed">${content}</p>`);
    }

    if (inCode) out.push('</code></pre>');
    if (inList) out.push('</ul>');
    return out.join('\n');
}

function ToolbarButton({ icon: Icon, label, onClick }) {
    return (
        <button type="button" onClick={onClick} title={label}
            className="p-2.5 rounded-xl hover:bg-secondary border border-transparent hover:border-border transition-all text-muted-foreground hover:text-emerald-500">
            <Icon className="w-4 h-4" />
        </button>
    );
}

export default function MarkdownEditor({ value, onChange, placeholder, rows = 6, compact = false }) {
    const [mode, setMode] = useState('edit');
    const textareaRef = useRef(null);

    const insert = useCallback((before, after = '') => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = value.slice(start, end);
        const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
        onChange(newVal);
        requestAnimationFrame(() => {
            ta.focus();
            ta.selectionStart = ta.selectionEnd = start + before.length + selected.length + after.length;
        });
    }, [value, onChange]);

    const wrap = (before, after) => insert(before, after);
    const insertBlock = (text) => insert(text + '\n');

    return (
        <div className={`space-y-2 ${compact ? '' : ''}`}>
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-xl border border-border">
                    <ToolbarButton icon={HiOutlineBold} label="Bold (**)" onClick={() => wrap('**', '**')} />
                    <ToolbarButton icon={HiOutlineItalic} label="Italic (*)" onClick={() => wrap('*', '*')} />
                    <ToolbarButton icon={HiOutlineListBullet} label="Bullet (- )" onClick={() => insertBlock('- ')} />
                    <ToolbarButton icon={HiOutlineCodeBracket} label="Code Block (```)" onClick={() => insertBlock('```\n\n```')} />
                    <span className="w-px h-6 bg-border mx-1" />
                    <button type="button" onClick={() => setMode(m => m === 'edit' ? 'preview' : 'edit')}
                        className={`p-2.5 rounded-xl transition-all ${
                            mode === 'preview'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'hover:bg-secondary border border-transparent hover:border-border text-muted-foreground'
                        }`} title={mode === 'preview' ? 'Edit' : 'Preview'}>
                        {mode === 'preview' ? <HiOutlinePencilSquare className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                    </button>
                </div>
                {mode === 'preview' && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Preview</span>
                )}
            </div>

            <div className="relative">
                {mode === 'edit' ? (
                    compact ? (
                        <textarea ref={textareaRef} value={value} onChange={e => onChange(e.target.value)}
                            placeholder={placeholder}
                            className="w-full px-5 py-4 rounded-[1.5rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-medium resize-none leading-relaxed"
                            rows={rows} />
                    ) : (
                        <textarea ref={textareaRef} value={value} onChange={e => onChange(e.target.value)}
                            placeholder={placeholder}
                            className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-medium resize-none leading-relaxed"
                            rows={rows} />
                    )
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/10 border border-emerald-500/20 leading-relaxed"
                        style={{ minHeight: rows * 1.5 + 2 + 'rem' }}>
                        {value.trim() ? (
                            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
                        ) : (
                            <span className="opacity-30 italic">Nothing to preview</span>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
