"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { HiOutlineXMark, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { api } from "@/utils/api";
import { DIFFICULTY_COLORS } from "@/constants/shared";

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl h-[80vh] flex flex-col bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-border bg-emerald-500/5 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
              Organization Question Bank
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-xl transition-all"
            >
              <HiOutlineXMark className="w-6 h-6" />
            </button>
          </div>
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for existing questions..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-background border border-border focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" />
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.question_id}
                className="p-6 rounded-[1.5rem] bg-secondary/20 border border-border flex items-center justify-between group hover:border-emerald-500/30 transition-all"
              >
                <div>
                  <h4 className="font-bold truncate max-w-[25ch]">{p.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${DIFFICULTY_COLORS[p.difficulty]}`}
                    >
                      {p.difficulty}
                    </span>
                    <span className="text-[10px] font-black uppercase opacity-40">
                      {p.type} · {p.marks} Marks
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onSelect(p)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                >
                  Add to Assessment
                </button>
              </div>
            ))
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 opacity-40 font-bold uppercase tracking-widest">
              No questions found
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
