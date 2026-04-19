"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlinePaperAirplane,
  HiOutlineExclamationCircle,
  HiOutlineXMark,
} from "react-icons/hi2";

export default function AIAssistantPanel({
  form,
  interview,
  onApplyConfig,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const endRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const criteriaCount = Object.keys(form.evaluation_criteria || {}).length;
      setMessages([
        {
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
        },
      ]);
    }
  }, [form, interview]);

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

    const api = (await import("@/utils/api")).api;

    try {
      const res = await api.post("/ai-interviews/generate/chat/", {
        job_id: interview.job,
        current_config: {
          title: form.title,
          description: form.description,
          system_prompt: form.system_prompt,
          context_for_ai: form.context_for_ai,
          evaluation_criteria: form.evaluation_criteria,
          questions: form.questions,
          number_of_questions: form.number_of_questions,
          duration_minutes: form.duration_minutes,
          passing_score: form.passing_score,
        },
        messages: updated.map((m) => ({
          role: m.role === "system" ? "assistant" : m.role,
          content: m.content,
        })),
      });

      if (res.type === "config") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Alright, here's the updated configuration! Take a look and click **Apply Changes** if everything looks good.",
            isComplete: true,
            config: res.config,
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
      setError(e.message || "Failed to get response");
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
    <div className="flex h-[calc(100vh-180px)] gap-6">
      <div className="flex-1 flex flex-col glass border border-border rounded-[2.5rem] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-md">
              <HiOutlineSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">
                AI Assistant
              </h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                Interview Config
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-secondary transition-all text-slate-400"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          )}
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <motion.div
                layout
                className={`max-w-[85%] px-6 py-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-secondary/50 border border-border rounded-tl-none"
                } ${msg.isComplete ? "border-emerald-500/30 bg-emerald-500/5" : ""}`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.isComplete && msg.config && !msg.applied && (
                  <motion.button
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleActionClick(msg.config)}
                    className="mt-4 w-full py-3 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <HiOutlineCheckCircle className="w-4 h-4" /> Apply Changes
                  </motion.button>
                )}
                {msg.applied && (
                  <div className="mt-3 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
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
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  Thinking
                </span>
              </div>
            </motion.div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
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
            className="flex-1 px-6 py-3.5 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500/50 transition-all text-sm font-medium disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3.5 rounded-[1.5rem] bg-emerald-600 text-white disabled:opacity-50 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {completedActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-72 shrink-0 glass border border-border rounded-[2.5rem] overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border">
              <h4 className="font-black text-[10px] uppercase tracking-widest opacity-40">
                AI Actions History
              </h4>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-full">
              {completedActions.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => {
                    setSelectedAction(
                      selectedAction === i ? null : i
                    );
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedAction === i
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border hover:border-emerald-500/20 bg-secondary/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineSparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                      Suggestion {i + 1}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium">
                    {msg.content}
                  </p>
                  {msg.applied && (
                    <div className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                      <HiOutlineCheckCircle className="w-3 h-3" /> Applied
                    </div>
                  )}
                  {!msg.applied && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(msg.config);
                      }}
                      className="mt-2 w-full py-2 rounded-lg bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-all"
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
