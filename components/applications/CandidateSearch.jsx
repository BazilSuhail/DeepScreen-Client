import React, { useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineEnvelope, HiOutlineXMark } from 'react-icons/hi2';

export default function CandidateSearch({ onSearch, loading }) {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            onSearch(email.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <HiOutlineEnvelope className="w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Find candidate by email..."
                className="w-full pl-10 pr-28 py-3 bg-secondary/50 border border-border focus:border-emerald-500/50 rounded-xl outline-none transition-all text-sm"
                required
            />
            <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                {email && (
                    <button
                        type="button"
                        onClick={() => setEmail('')}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors mr-1"
                    >
                        <HiOutlineXMark className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading || !email}
                    className="px-4 h-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] rounded-lg transition-all disabled:opacity-50"
                >
                    {loading ? '...' : 'Search'}
                </button>
            </div>
        </form>
    );
}
