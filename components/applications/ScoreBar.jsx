import React from 'react';
import { motion } from 'motion/react';

const ScoreBar = ({ label, value, color = 'bg-emerald-500' }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold">{(value * 100).toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
                className={`h-full ${color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${value * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />
        </div>
    </div>
);

export default ScoreBar;
