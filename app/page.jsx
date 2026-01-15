"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { HiOutlineBolt, HiOutlineCodeBracket, HiOutlineCpuChip, HiOutlineUserGroup, HiOutlineArrowRight, HiOutlineCheckBadge } from "react-icons/hi2";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold border border-emerald-500/10 mb-6">
                <HiOutlineBolt className="w-4 h-4" /> Autonomous Recruiting
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                Hire the Best, <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Fully Autonomous.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Our platform leverages Vector Databases and AI to streamline your hiring process from CV screening to P2P calls.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/dashboard"
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2"
                >
                  Get Started <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 bg-secondary text-foreground rounded-2xl font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all border border-emerald-500/10">
                  Watch Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full" />
        </div>
      </section>

      {/* 3-Stage Process Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our 3-Stage Interview Process</h2>
            <p className="text-muted-foreground">Rigorous, fair, and completely automated until the final stage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Coding AI Assessment",
                desc: "Autonomous coding environment where AI evaluates logic, clean code, and efficiency in real-time.",
                icon: HiOutlineCodeBracket,
                delay: 0.1
              },
              {
                title: "AI Interview Bot",
                desc: "Natural language processing evaluates soft skills, culture fit, and domain knowledge through voice.",
                icon: HiOutlineCpuChip,
                delay: 0.2
              },
              {
                title: "Live P2P Call",
                desc: "The final human touch. Connect with top 1% candidates who passed our rigorous AI screening.",
                icon: HiOutlineUserGroup,
                delay: 0.3
              }
            ].map((stage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: stage.delay }}
                className="p-8 rounded-3xl bg-card border border-emerald-500/10 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <stage.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Stage {i+1}: {stage.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{stage.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vector DB Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold mb-6">
                Vector Search Technology
              </div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                CV Matching Reimagined with <br />
                <span className="text-emerald-600">Vector Databases.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Forget keyword matching. Our platform embeds every CV into a high-dimensional vector space, finding the semantic perfect fit for your job description.
              </p>
              <ul className="space-y-4">
                {[
                  "Semantic understanding of experience",
                  "Bias-free candidate ranking",
                  "Instant processing of millions of CVs",
                  "Real-time knowledge graph updates"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <HiOutlineCheckBadge className="w-6 h-6 text-emerald-500" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="aspect-square bg-emerald-500/5 rounded-full absolute -z-10 blur-3xl animate-pulse" />
              <div className="p-8 rounded-3xl bg-card border border-emerald-500/20 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">vectorspace_viz.py</div>
                </div>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-600">
                        {95 + i}%
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-emerald-500/20 rounded-full mb-2" />
                        <div className="h-1.5 w-full bg-emerald-500/10 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-emerald-500/10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 DeepScreen AI Recruiting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
