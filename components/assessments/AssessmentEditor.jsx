"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  HiOutlineBold,
  HiOutlineItalic,
  HiOutlineListBullet,
  HiOutlineCodeBracket,
  HiOutlineCodeBracketSquare,
  HiOutlineLink,
  HiOutlineHashtag,
  HiOutlineMinus,
} from "react-icons/hi2";

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
          ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 shadow-sm shadow-emerald-500/10"
          : "hover:bg-secondary/60 border border-transparent hover:border-border text-muted-foreground hover:text-emerald-500"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Escape HTML for safe insertion
   ═══════════════════════════════════════════════════════════════════ */

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ═══════════════════════════════════════════════════════════════════
   Main Editor Component — contentEditable, stores HTML directly
   ═══════════════════════════════════════════════════════════════════ */

export default function AssessmentEditor({
  value,
  onChange,
  placeholder,
  rows = 6,
  compact = false,
}) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const isInternalUpdate = useRef(false);
  const isEmpty =
    !value || value === "<br>" || value.replace(/<[^>]*>/g, "").trim() === "";
  const hasContent = !isEmpty;

  /* ─── Sync external value changes into contentEditable ─── */
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (editorRef.current) {
      const normalized = value || "";
      if (editorRef.current.innerHTML !== normalized) {
        const sel = window.getSelection();
        const saved =
          sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
        editorRef.current.innerHTML = normalized || "<br>";
        if (saved && editorRef.current.contains(saved.startContainer)) {
          try {
            sel.removeAllRanges();
            sel.addRange(saved);
          } catch {}
        }
      }
    }
  }, [value]);

  /* ─── Sync contentEditable HTML → parent via onChange ─── */
  const syncToParent = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    if (html !== value) {
      isInternalUpdate.current = true;
      onChange(html === "<br>" ? "" : html);
    }
  }, [value, onChange]);

  /* ─── Execute a command and sync ─── */
  const exec = useCallback(
    (command, arg = null) => {
      editorRef.current?.focus();
      document.execCommand(command, false, arg);
      syncToParent();
    },
    [syncToParent],
  );

  /* ═══════ Toolbar Actions ═══════ */

  const handleBold = useCallback(() => exec("bold"), [exec]);

  const handleItalic = useCallback(() => exec("italic"), [exec]);

  const handleHeading = useCallback(() => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const node = sel.getRangeAt(0).startContainer;
    const block =
      node.nodeType === 3
        ? node.parentElement?.closest?.("p, h1, h2, h3, h4, li, div")
        : node.closest?.("p, h1, h2, h3, h4, li, div");
    if (block) {
      const tag = block.tagName.toLowerCase();
      if (tag === "h1") {
        exec("formatBlock", "h2");
      } else if (tag === "h2") {
        exec("formatBlock", "h3");
      } else if (tag === "h3") {
        exec("formatBlock", "p");
      } else {
        exec("formatBlock", "h2");
      }
    } else {
      exec("formatBlock", "h2");
    }
  }, [exec]);

  const handleList = useCallback(() => exec("insertUnorderedList"), [exec]);

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  }, [exec]);

  const handleInlineCode = useCallback(() => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const text = sel.toString() || "code";
    const codeHtml = `<code class="bg-secondary/70 border border-border px-1.5 py-0.5 rounded-md text-xs font-mono text-emerald-500">${escapeHtml(text)}</code>`;
    document.execCommand("insertHTML", false, codeHtml);
    syncToParent();
  }, [syncToParent]);

  const handleHorizontalRule = useCallback(() => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const br = document.createElement("br");
    range.insertNode(br);
    range.collapse(false);
    const hr = document.createElement("hr");
    hr.className = "my-4 w-full";
    range.insertNode(hr);
    range.collapse(false);
    const br2 = document.createElement("br");
    range.insertNode(br2);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    syncToParent();
  }, [syncToParent]);

  const handleCodeBlock = useCallback(() => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const node = sel.getRangeAt(0).startContainer;
    const inPre =
      node.nodeType === 3
        ? node.parentElement?.closest?.("pre")
        : node.closest?.("pre");
    if (inPre) return;
    document.execCommand(
      "insertHTML",
      false,
      '<pre class="bg-secondary/40 border border-border rounded-2xl p-5 my-3 overflow-x-auto"><code class="text-sm font-mono leading-relaxed"><br></code></pre>',
    );
    syncToParent();
  }, [syncToParent]);

  /* ═══════ Keyboard Shortcuts ═══════ */

  const handleKeyDown = useCallback(
    (e) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) {
        if (e.key === "Tab") {
          e.preventDefault();
          document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
          syncToParent();
        }
        return;
      }
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          handleBold();
          break;
        case "i":
          e.preventDefault();
          handleItalic();
          break;
        case "k":
          e.preventDefault();
          handleLink();
          break;
        case "e":
          e.preventDefault();
          handleInlineCode();
          break;
        case "h":
          e.preventDefault();
          handleHeading();
          break;
        default:
          break;
      }
    },
    [
      handleBold,
      handleItalic,
      handleLink,
      handleInlineCode,
      handleHeading,
      syncToParent,
    ],
  );

  /* ─── Paste: strip rich formatting ─── */
  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      syncToParent();
    },
    [syncToParent],
  );

  /* ─── Ref callback to initialize editor ─── */
  const editorRefCallback = useCallback(
    (node) => {
      if (node) {
        editorRef.current = node;
        if (!node.innerHTML || node.innerHTML === "<br>") {
          node.innerHTML = value || "<br>";
        }
      } else {
        editorRef.current = null;
      }
    },
    [value],
  );

  return (
    <div className="space-y-2">
      {/* ═══ Toolbar ═══ */}
      <div
        className={`flex items-center gap-0.5 p-1 rounded-2xl border w-fit flex-wrap transition-all duration-200 ${
          isFocused
            ? "bg-secondary/60 border-emerald-500/30 shadow-sm shadow-emerald-500/5"
            : "bg-secondary/40 border-border"
        }`}
      >
        <ToolbarButton
          icon={HiOutlineBold}
          label="Bold"
          shortcut="Ctrl+B"
          onClick={handleBold}
        />
        <ToolbarButton
          icon={HiOutlineItalic}
          label="Italic"
          shortcut="Ctrl+I"
          onClick={handleItalic}
        />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolbarButton
          icon={HiOutlineHashtag}
          label="Heading"
          shortcut="Ctrl+H"
          onClick={handleHeading}
        />
        <ToolbarButton
          icon={HiOutlineListBullet}
          label="Bullet List"
          onClick={handleList}
        />
        <ToolbarButton
          icon={HiOutlineLink}
          label="Link"
          shortcut="Ctrl+K"
          onClick={handleLink}
        />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolbarButton
          icon={HiOutlineCodeBracket}
          label="Inline Code"
          shortcut="Ctrl+E"
          onClick={handleInlineCode}
        />
        <ToolbarButton
          icon={HiOutlineCodeBracketSquare}
          label="Code Block"
          onClick={handleCodeBlock}
        />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolbarButton
          icon={HiOutlineMinus}
          label="Horizontal Rule"
          onClick={handleHorizontalRule}
        />
      </div>

      {/* ═══ Editor area ═══ */}
      <div className="relative">
        <div
          ref={editorRefCallback}
          contentEditable
          suppressContentEditableWarning
          data-empty={isEmpty}
          data-placeholder={placeholder || "Start writing..."}
          onInput={syncToParent}
          onBlur={() => {
            syncToParent();
            setIsFocused(false);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={`w-full bg-secondary/5 border transition-all leading-relaxed outline-none min-h-[1.5em] resize-none cursor-text ${
            isFocused
              ? "border-emerald-500/50 shadow-sm shadow-emerald-500/5"
              : "border-border"
          } ${compact ? "px-5 py-4 rounded-[1.5rem]" : "px-7 py-5 rounded-[1.5rem]"}`}
          style={!compact ? { minHeight: rows * 1.5 + 2.5 + "rem" } : undefined}
        />
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
                [contenteditable] h1 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
                [contenteditable] h2 { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
                [contenteditable] h3 { font-size: 1.125rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
                [contenteditable] p  { font-size: 0.875rem; line-height: 1.625; margin: 0.375rem 0; }
                [contenteditable] ul { list-style: none; padding-left: 0; margin: 0.5rem 0; }
                [contenteditable] ul > li { position: relative; padding-left: 1.5rem; font-size: 0.875rem; line-height: 1.625; }
                [contenteditable] ul > li::before { content: ''; position: absolute; left: 0; top: 0.6em; width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: 0.45; }
                [contenteditable] ol { padding-left: 1.5rem; margin: 0.5rem 0; }
                [contenteditable] li { font-size: 0.875rem; line-height: 1.625; }
                [contenteditable] a  { color: #10b981; text-decoration: underline; text-underline-offset: 2px; }
                [contenteditable] pre { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 1rem; padding: 1.25rem; margin: 0.75rem 0; overflow-x: auto; }
                [contenteditable] code { font-family: ui-monospace, monospace; font-size: 0.75rem; line-height: 1.625; }
                [contenteditable] hr { border: none; border-top: 2px solid; border-color: currentColor; opacity: 0.2; margin: 1.25rem 0; }
            `}</style>

      {/* ═══ Footer status ═══ */}
      {!compact && (
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
            {isFocused && (
              <span className="text-[10px] font-medium opacity-20 hidden sm:inline">
                Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link
              </span>
            )}
          </div>
          {hasContent && (
            <span className="text-[10px] font-medium opacity-20">
              {value.length} chars
            </span>
          )}
        </div>
      )}
    </div>
  );
}
