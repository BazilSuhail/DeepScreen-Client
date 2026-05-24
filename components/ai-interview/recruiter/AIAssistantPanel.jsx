"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlinePaperAirplane,
  HiOutlineExclamationCircle,
  HiOutlineXMark,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { base, press, stagger } from "@/constants/motion";
import { focusRing, iconButton, primaryButton } from "@/components/ui/styles";
import { api } from "@/utils/api";
import {
  formatServerError,
  toEditableConfig,
  toPayload,
} from "@/components/ai-interview/recruiter/interviewConfig";

// Opening greeting, built from the config present when the panel mounts.
function greetingMessage(form, interview) {
  const criteriaCount = form.evaluation_criteria.length;
  return {
    role: "assistant",
    content:
      `Hey! I can see your current interview setup for **${interview?.title || 'this role'}**. ` +
      `You've got ${form.number_of_questions || '?'} questions planned across ${criteriaCount} evaluation criteria, ` +
      `with a ${form.passing_score || 65}% passing score.\n\n` +
      `Want me to:\n` +
      `• Review the current config and suggest improvements\n` +
      `• Help rewrite the system prompt\n` +
      `• Suggest better evaluation criteria\n` +
      `• Generate role-specific interview questions\n` +
      `• Optimize duration or passing score\n\n` +
      `Just ask — I'll give my thoughts first, and only update when you say the word.`,
  };
}

export default function AIAssistantPanel({
  form,
  interview,
  onApplyConfig,
  onClose,
}) {
  const [messages, setMessages] = useState(() => [greetingMessage(form, interview)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const endRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setError("");

    if (!interview?.job) {
      setError("Interview job reference not found. Please reload the page.");
      setMessages(messages);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/ai-interviews/generate/chat/", {
        job_id: interview.job,
        current_config: toPayload(form),
        messages: updated.map((m) => ({
          role: m.role === "system" ? "assistant" : m.role,
          content: m.content,
        })),
      });

      if (res.type === "config" && res.config) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Alright, here's the updated configuration! Take a look and click **Apply Changes** if everything looks good.",
            isComplete: true,
            config: toEditableConfig(res.config),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              res.content ||
              "Got it! Want me to elaborate or would you like me to apply any changes?",
          },
        ]);
      }
    } catch (e) {
      setError(formatServerError(e, "Failed to get response"));
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleActionClick = (config) => {
    onApplyConfig(config);
    setMessages((prev) =>
      prev.map((m) =>
        m.isComplete && m.config === config ? { ...m, applied: true } : m
      )
    );
  };

  const completedActions = messages.filter((m) => m.isComplete);

  return (
    <div className="flex flex-col-reverse gap-4 lg:h-[calc(100vh-180px)] lg:flex-row lg:gap-6">
      <div className="flex h-[75dvh] min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card lg:h-auto lg:flex-1">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 sm:px-8 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 text-emerald-600 flex items-center justify-center dark:text-emerald-400">
              <HiOutlineSparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm tracking-tight">
                AI Assistant
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                Interview Config
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close assistant"
              className={iconButton}
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          )}
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 py-5 space-y-4 sm:px-8 sm:py-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={base}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <motion.div
                layout
                className={`max-w-[85%] px-4 py-3 rounded-lg text-sm sm:px-6 sm:py-4 leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-secondary/50 border border-border rounded-tl-none"
                } ${msg.isComplete ? "border-emerald-500/30 bg-emerald-500/5" : ""}`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.isComplete && msg.config && !msg.applied && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={base}
                    whileTap={press}
                    onClick={() => handleActionClick(msg.config)}
                    className={`${primaryButton} mt-4 w-full`}
                  >
                    <HiOutlineCheckCircle className="w-4 h-4" /> Apply Changes
                  </motion.button>
                )}
                {msg.applied && (
                  <div className="mt-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold uppercase tracking-widest">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Applied
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce motion-reduce:animate-none"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce motion-reduce:animate-none"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce motion-reduce:animate-none"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                  Thinking
                </span>
              </div>
            </motion.div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="p-4 border-t border-border flex items-center gap-3 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about the config, suggest changes..."
            disabled={loading}
            className={`min-h-11 min-w-0 flex-1 px-4 py-2.5 rounded-md bg-secondary/30 border border-border outline-none focus:border-emerald-500/50 transition-colors text-sm font-medium disabled:opacity-50 ${focusRing}`}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className={`${primaryButton} h-11 w-11 shrink-0 px-0`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin motion-reduce:animate-none" />
            ) : (
              <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {completedActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={base}
            className="flex w-full shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card lg:w-72"
          >
            {/* Collapsible below lg so the chat keeps the screen; always open beside it on desktop. */}
            <button
              type="button"
              onClick={() => setHistoryOpen((o) => !o)}
              aria-expanded={historyOpen}
              className={`flex min-h-11 w-full items-center justify-between gap-2 px-5 py-4 text-left border-b border-border lg:pointer-events-none lg:px-6 lg:py-5 ${focusRing}`}
            >
              <h4 className="font-semibold text-[10px] uppercase tracking-widest text-muted-foreground">
                AI Actions History ({completedActions.length})
              </h4>
              <HiOutlineChevronDown className={`h-4 w-4 text-muted-foreground transition-transform lg:hidden ${historyOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            <div className={`${historyOpen ? "block" : "hidden"} max-h-64 p-4 space-y-3 overflow-y-auto lg:block lg:max-h-none lg:flex-1`}>
              {completedActions.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...base, delay: Math.min(i, 8) * stagger }}
                  onClick={() => {
                    setSelectedAction(
                      selectedAction === i ? null : i
                    );
                  }}
                  className={`p-4 rounded-md border cursor-pointer transition-colors ${
                    selectedAction === i
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border hover:border-emerald-500/20 bg-secondary/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineSparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Suggestion {i + 1}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                    {msg.content}
                  </p>
                  {msg.applied && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      <HiOutlineCheckCircle className="w-3 h-3" /> Applied
                    </div>
                  )}
                  {!msg.applied && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(msg.config);
                      }}
                      type="button"
                      className={`${primaryButton} mt-2 w-full min-h-10 py-2 text-xs`}
                    >
                      <HiOutlineCheckCircle className="w-3 h-3" /> Apply
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
