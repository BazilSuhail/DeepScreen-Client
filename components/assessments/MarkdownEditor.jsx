'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineBold,
    HiOutlineItalic,
    HiOutlineListBullet,
    HiOutlineCodeBracket,
    HiOutlineCodeBracketSquare,
    HiOutlineLink,
    HiOutlineHashtag,
} from 'react-icons/hi2';

/* ═══════════════════════════════════════════════════════════════════
   Markdown → HTML rendering (display only)
   ═══════════════════════════════════════════════════════════════════ */

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function inlineFormat(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-secondary/70 border border-border px-1.5 py-0.5 rounded-md text-xs font-mono text-emerald-500">$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-500 underline decoration-emerald-500/30 hover:decoration-emerald-500 underline-offset-2 transition-all">$1</a>');
}

function renderMarkdown(raw) {
    const lines = raw.split('\n');
    const out = [];
    let inCode = false;
    let inList = false;
    let listType = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (line.startsWith('```')) {
            if (inCode) {
                out.push('</code></pre>');
                inCode = false;
            } else {
                if (inList) { out.push(listType === 'ol' ? '</ol>' : '</ul>'); inList = false; listType = null; }
                out.push('<pre class="bg-secondary/40 border border-border rounded-2xl p-5 my-3 overflow-x-auto"><code class="text-sm font-mono leading-relaxed">');
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
            if (inList) { out.push(listType === 'ol' ? '</ol>' : '</ul>'); inList = false; listType = null; }
            continue;
        }

        const escaped = escapeHtml(line);

        if (trimmed.startsWith('- ')) {
            if (!inList || listType !== 'ul') {
                if (inList) out.push(listType === 'ol' ? '</ol>' : '</ul>');
                out.push('<ul class="space-y-1.5 list-disc list-inside marker:text-emerald-500 my-2">');
                inList = true;
                listType = 'ul';
            }
            out.push(`<li class="text-sm leading-relaxed">${inlineFormat(escaped.slice(escaped.indexOf('- ') + 2))}</li>`);
            continue;
        }

        if (/^\d+\.\s/.test(trimmed)) {
            if (!inList || listType !== 'ol') {
                if (inList) out.push(listType === 'ol' ? '</ol>' : '</ul>');
                out.push('<ol class="space-y-1.5 list-decimal list-inside marker:text-emerald-500 my-2">');
                inList = true;
                listType = 'ol';
            }
            out.push(`<li class="text-sm leading-relaxed">${inlineFormat(escaped.replace(/^\d+\.\s/, ''))}</li>`);
            continue;
        }

        if (inList) { out.push(listType === 'ol' ? '</ol>' : '</ul>'); inList = false; listType = null; }

        if (trimmed.startsWith('### ')) {
            out.push(`<h3 class="text-lg font-bold mt-6 mb-2 text-foreground">${inlineFormat(escaped.slice(4))}</h3>`);
            continue;
        }
        if (trimmed.startsWith('## ')) {
            out.push(`<h2 class="text-xl font-bold mt-6 mb-2 text-foreground">${inlineFormat(escaped.slice(3))}</h2>`);
            continue;
        }
        if (trimmed.startsWith('# ')) {
            out.push(`<h1 class="text-2xl font-bold mt-6 mb-2 text-foreground">${inlineFormat(escaped.slice(2))}</h1>`);
            continue;
        }

        if (trimmed.startsWith('> ')) {
            out.push(`<blockquote class="border-l-4 border-emerald-500/40 pl-5 py-2 my-3 text-sm italic text-muted-foreground bg-secondary/10 rounded-r-2xl">${inlineFormat(escaped.slice(2))}</blockquote>`);
            continue;
        }

        if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
            out.push('<hr class="my-6 border-border" />');
            continue;
        }

        out.push(`<p class="text-sm leading-relaxed my-1.5">${inlineFormat(escaped)}</p>`);
    }

    if (inCode) out.push('</code></pre>');
    if (inList) out.push(listType === 'ol' ? '</ol>' : '</ul>');
    return out.join('\n');
}

/* ═══════════════════════════════════════════════════════════════════
   HTML → Markdown conversion (for contentEditable sync)
   ═══════════════════════════════════════════════════════════════════ */

function decodeEntities(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

function htmlToMarkdown(html) {
    let text = html;
    text = text.replace(/<pre[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi, (_, code) => {
        const inner = decodeEntities(code.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, ''));
        return '\n```\n' + inner.trim() + '\n```\n';
    });
    text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
    text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
    text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
    text = text.replace(/<hr[^>]*>/gi, '\n---\n');
    text = text.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
        return '\n> ' + content.trim().replace(/\n/g, '\n> ') + '\n';
    });
    text = text.replace(/<ul[^>]*>/gi, '');
    text = text.replace(/<\/ul>/gi, '');
    text = text.replace(/<ol[^>]*>/gi, '');
    text = text.replace(/<\/ol>/gi, '');
    text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
    text = text.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
    text = text.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
    text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
    text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
    text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n');
    text = text.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<[^>]*>/g, '');
    text = decodeEntities(text);
    text = text.replace(/\n{4,}/g, '\n\n');
    return text.trim();
}

/* ═══════════════════════════════════════════════════════════════════
   Cursor save / restore helpers for contentEditable
   ═══════════════════════════════════════════════════════════════════ */

function getCharOffset(root) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.startContainer)) return null;
    const preRange = document.createRange();
    preRange.selectNodeContents(root);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
}

function setCharOffset(root, offset) {
    if (offset == null) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let remaining = offset;
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (remaining <= node.textContent.length) {
            const sel = window.getSelection();
            const range = document.createRange();
            range.setStart(node, remaining);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
        }
        remaining -= node.textContent.length;
    }
}

/* ═══════════════════════════════════════════════════════════════════
   Toolbar button
   ═══════════════════════════════════════════════════════════════════ */

function ToolbarButton({ icon: Icon, label, onClick, active, shortcut }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={shortcut ? `${label} (${shortcut})` : label}
            className={`p-2 rounded-xl transition-all active:scale-90 ${
                active
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 shadow-sm shadow-emerald-500/10'
                    : 'hover:bg-secondary/60 border border-transparent hover:border-border text-muted-foreground hover:text-emerald-500'
            }`}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Editor Component
   ═══════════════════════════════════════════════════════════════════ */

export default function MarkdownEditor({ value, onChange, placeholder, rows = 6, compact = false }) {
    const [showSource, setShowSource] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const editorRef = useRef(null);
    const textareaRef = useRef(null);
    const isInternalUpdate = useRef(false);
    const hasContent = value.trim().length > 0;
    const isEmpty = !hasContent;

    /* ─── Render HTML preview whenever value changes externally ─── */
    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        if (!showSource && editorRef.current) {
            const offset = getCharOffset(editorRef.current);
            const rendered = renderMarkdown(value);
            if (editorRef.current.innerHTML !== rendered) {
                editorRef.current.innerHTML = rendered || '<br>';
            }
            if (offset != null) {
                requestAnimationFrame(() => setCharOffset(editorRef.current, offset));
            }
        }
    }, [value, showSource]);

    /* ─── Sync contentEditable HTML → markdown on input ─── */
    const syncHtmlToMarkdown = useCallback(() => {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        const md = htmlToMarkdown(html);
        if (md !== value) {
            isInternalUpdate.current = true;
            onChange(md);
        }
    }, [value, onChange]);

    /* ─── Insert at cursor for contentEditable (preserves undo) ─── */
    const insertHtmlAtCursor = useCallback((html) => {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const frag = range.createContextualFragment(html);
        range.insertNode(frag);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        syncHtmlToMarkdown();
    }, [syncHtmlToMarkdown]);

    /* ─── Insert around selection for source/textarea mode ─── */
    const insertSource = useCallback((before, after = '') => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = value.slice(start, end);
        const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
        onChange(newVal);
        requestAnimationFrame(() => {
            ta.focus();
            const cursorPos = start + before.length + selected.length;
            ta.selectionStart = ta.selectionEnd = cursorPos + after.length;
        });
    }, [value, onChange]);

    /* ─── Wrap selection in markdown syntax (works for both modes) ─── */
    const wrapSelection = useCallback((wrapChar, blockPrefix) => {
        if (showSource) {
            if (blockPrefix) {
                // Line-level formatting: insert prefix at line start
                const ta = textareaRef.current;
                if (!ta) return;
                const start = ta.selectionStart;
                const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                const newVal = value.slice(0, lineStart) + blockPrefix + value.slice(lineStart);
                onChange(newVal);
                requestAnimationFrame(() => {
                    ta.focus();
                    ta.selectionStart = ta.selectionEnd = start + blockPrefix.length;
                });
            } else {
                insertSource(wrapChar, wrapChar);
            }
        } else {
            editorRef.current?.focus();
            if (blockPrefix) {
                document.execCommand('formatBlock', false, blockPrefix === '## ' ? 'h2' : 'p');
            } else if (wrapChar === '**') {
                document.execCommand('bold', false, null);
            } else if (wrapChar === '*') {
                document.execCommand('italic', false, null);
            }
            syncHtmlToMarkdown();
        }
    }, [showSource, insertSource, syncHtmlToMarkdown, value, onChange]);

    /* ═══════ Toolbar Actions ═══════ */

    const handleBold = useCallback(() => {
        if (showSource) { insertSource('**', '**'); return; }
        editorRef.current?.focus();
        document.execCommand('bold', false, null);
        syncHtmlToMarkdown();
    }, [showSource, insertSource, syncHtmlToMarkdown]);

    const handleItalic = useCallback(() => {
        if (showSource) { insertSource('*', '*'); return; }
        editorRef.current?.focus();
        document.execCommand('italic', false, null);
        syncHtmlToMarkdown();
    }, [showSource, insertSource, syncHtmlToMarkdown]);

    const handleHeading = useCallback(() => {
        if (showSource) {
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart;
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = value.indexOf('\n', start);
            const line = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
            // Cycle heading levels: none → ## → ### → remove
            let newLine;
            if (line.startsWith('### ')) {
                newLine = line.slice(4);
            } else if (line.startsWith('## ')) {
                newLine = '### ' + line.slice(3);
            } else if (line.startsWith('# ')) {
                newLine = '## ' + line.slice(2);
            } else {
                newLine = '## ' + line;
            }
            const end = lineEnd === -1 ? value.length : lineEnd;
            const newVal = value.slice(0, lineStart) + newLine + value.slice(end);
            onChange(newVal);
            requestAnimationFrame(() => {
                ta.focus();
                ta.selectionStart = ta.selectionEnd = lineStart + newLine.length;
            });
            return;
        }
        editorRef.current?.focus();
        document.execCommand('formatBlock', false, 'h2');
        syncHtmlToMarkdown();
    }, [showSource, value, onChange, syncHtmlToMarkdown]);

    const handleList = useCallback(() => {
        if (showSource) {
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const beforeCursor = value.slice(0, start);
            const lineStart = beforeCursor.lastIndexOf('\n') + 1;
            const afterCursor = value.slice(end);
            const lineEnd = afterCursor.indexOf('\n');
            const fullEnd = lineEnd === -1 ? value.length : end + lineEnd;
            const selectedLines = value.slice(lineStart, fullEnd);
            const lines = selectedLines.split('\n');
            const allBullets = lines.every(l => l.trimStart().startsWith('- '));
            const newLines = allBullets
                ? lines.map(l => l.replace(/^(\s*)- /, '$1'))
                : lines.map(l => l.trimStart().startsWith('- ') ? l : '- ' + l);
            const newVal = value.slice(0, lineStart) + newLines.join('\n') + value.slice(fullEnd);
            onChange(newVal);
            requestAnimationFrame(() => {
                ta.focus();
                ta.selectionStart = lineStart;
                ta.selectionEnd = lineStart + newLines.join('\n').length;
            });
            return;
        }
        editorRef.current?.focus();
        document.execCommand('insertUnorderedList', false, null);
        syncHtmlToMarkdown();
    }, [showSource, value, onChange, syncHtmlToMarkdown]);

    const handleLink = useCallback(() => {
        if (showSource) {
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const selected = value.slice(start, end);
            if (selected) {
                const url = prompt('Enter URL:');
                if (!url) return;
                const newVal = value.slice(0, start) + `[${selected}](${url})` + value.slice(end);
                onChange(newVal);
            } else {
                insertSource('[', '](url)');
            }
        } else {
            const url = prompt('Enter link URL:');
            if (!url) return;
            editorRef.current?.focus();
            document.execCommand('createLink', false, url);
            syncHtmlToMarkdown();
        }
    }, [showSource, value, onChange, insertSource, syncHtmlToMarkdown]);

    const handleInlineCode = useCallback(() => {
        if (showSource) { insertSource('`', '`'); return; }
        editorRef.current?.focus();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const selectedText = range.toString() || 'code';
        const codeHtml = '<code class="bg-secondary/70 border border-border px-1.5 py-0.5 rounded-md text-xs font-mono text-emerald-500">' + escapeHtml(selectedText) + '</code>';
        insertHtmlAtCursor(codeHtml);
    }, [showSource, insertSource, insertHtmlAtCursor]);

    const handleCodeBlock = useCallback(() => {
        if (showSource) { insertSource('```\n', '\n```'); return; }
        editorRef.current?.focus();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const cursorBlock = range.startContainer.parentElement?.closest?.('p, h1, h2, h3, li') || range.startContainer.parentElement;
        if (cursorBlock) {
            const br = document.createElement('br');
            cursorBlock.parentNode?.insertBefore(br, cursorBlock.nextSibling);
        }
        insertHtmlAtCursor('<pre class="bg-secondary/40 border border-border rounded-2xl p-5 my-3 overflow-x-auto"><code class="text-sm font-mono leading-relaxed">\n\n</code></pre>');
    }, [showSource, insertSource, insertHtmlAtCursor]);

    /* ═══════ Keyboard Shortcuts ═══════ */

    const handleKeyDown = useCallback((e) => {
        const isMod = e.ctrlKey || e.metaKey;
        if (!isMod) {
            if (e.key === 'Tab') {
                e.preventDefault();
                if (showSource) {
                    insertSource('    ');
                } else {
                    insertHtmlAtCursor('&nbsp;&nbsp;&nbsp;&nbsp;');
                }
            }
            return;
        }
        switch (e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                handleBold();
                break;
            case 'i':
                e.preventDefault();
                handleItalic();
                break;
            case 'k':
                e.preventDefault();
                handleLink();
                break;
            case 'e':
                e.preventDefault();
                handleInlineCode();
                break;
            case 'h':
                e.preventDefault();
                handleHeading();
                break;
            default:
                break;
        }
    }, [showSource, handleBold, handleItalic, handleLink, handleInlineCode, handleHeading, insertSource, insertHtmlAtCursor]);

    /* ─── Handle Enter in preview to continue lists ─── */
    const handlePreviewKeyDown = useCallback((e) => {
        handleKeyDown(e);

        if (e.key === 'Enter' && !e.shiftKey) {
            // Let the browser handle it, then sync
            setTimeout(() => syncHtmlToMarkdown(), 0);
        }
    }, [handleKeyDown, syncHtmlToMarkdown]);

    /* ─── Ref callback for contentEditable ─── */
    const editorRefCallback = useCallback((node) => {
        if (node) {
            editorRef.current = node;
            if (!node.innerHTML || node.innerHTML === '<br>') {
                node.innerHTML = renderMarkdown(value) || '<br>';
            }
        } else {
            editorRef.current = null;
        }
    }, [value]);

    /* ─── Handle paste: strip formatting in preview mode ─── */
    const handlePaste = useCallback((e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        syncHtmlToMarkdown();
    }, [syncHtmlToMarkdown]);

    /* ─── Mode toggle ─── */
    const toggleMode = useCallback(() => {
        setShowSource(s => {
            if (s) {
                // Switching TO preview — content will re-render from value via useEffect
            }
            return !s;
        });
    }, []);

    return (
        <div className="space-y-2">
            {/* ═══ Toolbar ═══ */}
            <div className={`flex items-center gap-0.5 p-1 rounded-2xl border w-fit flex-wrap transition-all duration-200 ${
                isFocused
                    ? 'bg-secondary/60 border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                    : 'bg-secondary/40 border-border'
            }`}>
                <ToolbarButton icon={HiOutlineBold} label="Bold" shortcut="Ctrl+B" onClick={handleBold} />
                <ToolbarButton icon={HiOutlineItalic} label="Italic" shortcut="Ctrl+I" onClick={handleItalic} />
                <span className="w-px h-5 bg-border mx-0.5" />
                <ToolbarButton icon={HiOutlineHashtag} label="Heading" shortcut="Ctrl+H" onClick={handleHeading} />
                <ToolbarButton icon={HiOutlineListBullet} label="Bullet List" onClick={handleList} />
                <ToolbarButton icon={HiOutlineLink} label="Link" shortcut="Ctrl+K" onClick={handleLink} />
                <span className="w-px h-5 bg-border mx-0.5" />
                <ToolbarButton icon={HiOutlineCodeBracket} label="Inline Code" shortcut="Ctrl+E" onClick={handleInlineCode} />
                <ToolbarButton icon={HiOutlineCodeBracketSquare} label="Code Block" onClick={handleCodeBlock} />
                <span className="w-px h-5 bg-border mx-0.5" />
                <button
                    type="button"
                    onClick={toggleMode}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold tracking-wide uppercase transition-all active:scale-95 flex items-center gap-1.5 ${
                        showSource
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25 shadow-sm shadow-amber-500/10'
                            : 'hover:bg-secondary/60 border border-transparent hover:border-border text-muted-foreground hover:text-amber-500'
                    }`}
                    title={showSource ? 'Switch to Visual mode' : 'Switch to Source mode'}
                >
                    <HiOutlineCodeBracketSquare className="w-3.5 h-3.5" />
                    {showSource ? 'MD' : 'Visual'}
                </button>
            </div>

            {/* ═══ Editor area ═══ */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {showSource ? (
                        <motion.div key="source" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                            <textarea
                                ref={textareaRef}
                                value={value}
                                onChange={e => onChange(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                spellCheck={false}
                                className={`w-full bg-secondary/20 border transition-all font-mono text-sm leading-relaxed resize-none outline-none ${
                                    isFocused
                                        ? 'border-amber-500/50 shadow-sm shadow-amber-500/5'
                                        : 'border-amber-500/20'
                                } ${compact ? 'px-5 py-4 rounded-[1.5rem]' : 'px-6 py-5 rounded-[1.5rem]'}`}
                                rows={rows}
                            />
                        </motion.div>
                    ) : (
                        <motion.div key="visual" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                            <div
                                ref={editorRefCallback}
                                contentEditable
                                suppressContentEditableWarning
                                data-empty={isEmpty}
                                data-placeholder={placeholder || 'Start writing...'}
                                onInput={syncHtmlToMarkdown}
                                onBlur={() => { syncHtmlToMarkdown(); setIsFocused(false); }}
                                onFocus={() => setIsFocused(true)}
                                onKeyDown={handlePreviewKeyDown}
                                onPaste={handlePaste}
                                className={`w-full bg-secondary/5 border transition-all leading-relaxed outline-none min-h-[1.5em] resize-none cursor-text ${
                                    isFocused
                                        ? 'border-emerald-500/50 shadow-sm shadow-emerald-500/5'
                                        : 'border-border'
                                } ${compact ? 'px-5 py-4 rounded-[1.5rem]' : 'px-7 py-5 rounded-[1.5rem]'}`}
                                style={!compact ? { minHeight: rows * 1.5 + 2.5 + 'rem' } : undefined}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <style>{`
                [data-empty="true"][data-placeholder]:before {
                    content: attr(data-placeholder);
                    font-style: italic;
                    opacity: 0.25;
                    pointer-events: none;
                    font-size: 0.875rem;
                    display: block;
                }
            `}</style>

            {/* ═══ Footer status ═══ */}
            {!compact && (
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-[10px] font-medium opacity-30 hover:opacity-60 transition-opacity flex items-center gap-1.5"
                        >
                            <HiOutlineCodeBracketSquare className="w-3 h-3" />
                            {showSource ? 'Visual' : 'Source'}
                        </button>
                        {isFocused && (
                            <span className="text-[10px] font-medium opacity-20 hidden sm:inline">
                                Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link
                            </span>
                        )}
                    </div>
                    {hasContent && (
                        <span className="text-[10px] font-medium opacity-20">{value.length} chars</span>
                    )}
                </div>
            )}
        </div>
    );
}
