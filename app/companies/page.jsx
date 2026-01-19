"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    HiOutlineSearch,
    HiOutlineGlobeAlt,
    HiOutlineOfficeBuilding,
    HiOutlineExternalLink,
    HiOutlineShieldCheck
} from 'react-icons/hi';
import Link from 'next/link';

const CompanyCard = ({ company }) => {
    return (
        <div className="group bg-white border border-slate-200/60 rounded-[32px] p-8 transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-1">
            <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-lg shadow-slate-900/10 group-hover:rotate-3 transition-transform">
                    {company.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex gap-2">
                    {company.website && (
                        <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 hover:border-emerald-100 transition-all"
                        >
                            <HiOutlineExternalLink size={18} />
                        </a>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{company.name}</h3>
                        <HiOutlineShieldCheck className="text-emerald-500" size={18} title="Verified Organization" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <HiOutlineOfficeBuilding size={14} />
                        {company.industry || 'Technology'}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                        Pioneering world-class solutions in the {company.industry || 'Technology'} sector.
                        Join their mission to redefine the future.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300"></div>
                            </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                            +12
                        </div>
                    </div>
                    <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                        View Openings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [count, setCount] = useState(0);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_SERVER_URL}/org/all/`;
            if (search) {
                url = `${process.env.NEXT_PUBLIC_SERVER_URL}/org/search/?q=${search}`;
            }

            const response = await axios.get(url);

            if (search) {
                setCompanies(response.data.results);
                setCount(response.data.count);
            } else {
                setCompanies(response.data);
                setCount(response.data.length);
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCompanies();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, fetchCompanies]);

    return (
        <div className="min-h-screen bg-white font-poppins text-slate-800 selection:bg-emerald-100">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10 opacity-40"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20">
                {/* Hero Section */}
                <div className="mb-16 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Verified Network</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900">
                        Top Tier <br />
                        <span className="text-emerald-500 italic">Global Organizations</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-xl mx-auto antialiased text-lg">
                        Connect with the most innovative companies on the planet.
                        Each organization is vetted for excellence and culture.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-20">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[32px] blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
                        <div className="relative flex items-center bg-white border border-slate-200 rounded-[28px] p-2 pr-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                            <div className="flex-1 relative">
                                <HiOutlineSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
                                <input
                                    type="text"
                                    placeholder="Search by company name, industry or location..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent pl-16 pr-6 py-5 rounded-2xl focus:outline-none text-slate-700 text-lg font-bold placeholder:text-slate-400 placeholder:font-medium"
                                />
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-400">
                                {count} Organizations
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[380px] bg-slate-50 animate-pulse rounded-[32px] border border-slate-100"></div>
                        ))}
                    </div>
                ) : companies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {companies.map(company => (
                            <CompanyCard key={company.uuid} company={company} />
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 rounded-3xl text-slate-200 mb-8 border border-slate-100">
                            <HiOutlineOfficeBuilding size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">No organizations found</h2>
                        <p className="text-slate-400 mt-3 font-medium text-lg">We couldn't find any results matching your search.</p>
                        <button
                            onClick={() => setSearch('')}
                            className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
                        >
                            Reset Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
