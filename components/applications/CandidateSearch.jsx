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
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <HiOutlineEnvelope className="w-5 h-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Find candidate by email..."
                className="w-full pl-12 pr-28 py-4 bg-secondary/50 border border-border focus:border-emerald-500/50 rounded-2xl outline-none transition-all text-sm"
                required
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
                {email && (
                    <button
                        type="button"
                        onClick={() => setEmail('')}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors mr-1"
                    >
                        <HiOutlineXMark className="w-4 h-4 text-muted-foreground" />
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading || !email}
                    className="px-4 h-full bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-xl transition-all disabled:opacity-50"
                >
                    {loading ? '...' : 'Search'}
                </button>
            </div>
        </form>
    );
}
