'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { HiOutlineMagnifyingGlass, HiOutlineArrowLeft } from 'react-icons/hi2';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center relative z-10"
      >
        <div className="mb-8 relative inline-block">
          <motion.div
            animate={{ 
                rotate: [0, 10, -10, 0],
                y: [0, -5, 5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 bg-white dark:bg-secondary/50 rounded-full flex items-center justify-center shadow-2xl border border-emerald-500/20 mx-auto"
          >
            <HiOutlineMagnifyingGlass className="w-16 h-16 text-emerald-500" />
          </motion.div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            404
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
          Opportunity <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Lost?</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed">
          The position you are looking for has either been filled, expired, or never existed in this dimension.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
              Back to Career Center
            </motion.button>
          </Link>
          
          <Link href="/jobs">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white dark:bg-secondary/50 text-foreground font-bold rounded-2xl border border-border hover:bg-secondary transition-all"
            >
              Explore Other Roles
            </motion.button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 opacity-40">
          <div className="h-2 bg-emerald-500/20 rounded-full" />
          <div className="h-2 bg-teal-500/20 rounded-full" />
          <div className="h-2 bg-emerald-500/20 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
