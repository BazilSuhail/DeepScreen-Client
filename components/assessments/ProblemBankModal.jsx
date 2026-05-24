"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { HiOutlineXMark, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { api } from "@/utils/api";
import { Bone } from "@/components/skeletons/primitives";
import { DIFFICULTY_COLORS } from "@/constants/shared";
import { base, sheet } from "@/constants/motion";
import { iconButton, focusRing } from "@/components/ui/styles";

export default function ProblemBankModal({ onSelect, onClose }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const data = await api.get("/assessments/questions/pool/");
        setProblems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBank();
  }, []);

  const filtered = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={base}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.dialog
        open
        aria-modal="true"
        aria-labelledby="problem-bank-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={sheet}
        className="relative m-0 p-0 text-foreground w-full max-w-3xl h-[90dvh] sm:h-[80vh] flex flex-col bg-card border border-border rounded-t-lg sm:rounded-lg shadow-md overflow-hidden pb-[env(safe-area-inset-bottom)]"
      >
        <div className="p-5 sm:p-6 border-b border-border bg-emerald-500/5 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 id="problem-bank-title" className="text-lg font-semibold">
              Organization Question Bank
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close question bank"
              className={`${iconButton} -mr-2`}
            >
              <HiOutlineXMark className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for existing questions..."
              className={`w-full min-h-11 pl-12 pr-4 py-2.5 rounded-md bg-background border border-border text-sm focus:border-emerald-500 outline-none transition-colors ${focusRing}`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {loading ? (
            <output aria-busy="true" className="block space-y-3">
              <span className="sr-only">Loading questions</span>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-md border border-border p-4">
                  <div className="flex-1 space-y-2">
                    <Bone className="h-4 w-1/2" />
                    <Bone className="h-3 w-1/4" />
                  </div>
                  <Bone className="h-10 w-20 rounded-md" />
                </div>
              ))}
            </output>
          ) : (
            filtered.map((p) => (
              <div
                key={p.question_id}
                className="p-4 rounded-md bg-secondary/20 border border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:border-emerald-500/30 transition-colors"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold truncate">{p.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase border ${DIFFICULTY_COLORS[p.difficulty]}`}
                    >
                      {p.difficulty}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                      {p.type} · {p.marks} Marks
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className={`shrink-0 min-h-10 px-4 py-2 rounded-md bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-semibold text-sm hover:bg-emerald-600 hover:text-white transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none ${focusRing}`}
                >
                  Add to Assessment
                </button>
              </div>
            ))
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-sm font-medium text-muted-foreground">
              No questions found
            </div>
          )}
        </div>
      </motion.dialog>
    </div>
  );
}
