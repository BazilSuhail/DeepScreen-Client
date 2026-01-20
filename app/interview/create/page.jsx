"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { HiArrowLeft, HiCalendar, HiUser, HiClipboardCopy, HiCheck } from "react-icons/hi";
import axios from "axios";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export default function CreateInterview() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [createdInterview, setCreatedInterview] = useState(null);
    const [copiedLink, setCopiedLink] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        candidateId: '',
        scheduledAt: '',
        notes: ''
    });

    useEffect(() => {
        // Check if user is logged in and is a recruiter
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/auth/login');
            return;
        }

        const userData = JSON.parse(userStr);

        if (userData.role !== 'recruiter') {
            // Only recruiters can create interviews
            router.push('/interview');
            return;
        }

        setUser(userData);
        fetchCandidates(token);
    }, []);

    const fetchCandidates = async (token) => {
        try {
            // TODO: Replace with your actual API endpoint to fetch candidates
            const response = await axios.get(
                `${SERVER_URL}/users/?role=candidate`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setCandidates(response.data.data.users || []);
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(
                `${SERVER_URL}/interviews/create/`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setCreatedInterview(response.data.data);
            }
        } catch (err) {
            console.error('Failed to create interview:', err);
            alert(err.response?.data?.error || 'Failed to create interview');
        } finally {
            setIsCreating(false);
        }
    };

    const copyLink = (link, type) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(type);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center font-poppins">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Success screen after creating interview
    if (createdInterview) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 font-poppins pt-24 pb-12">
                <div className="max-w-3xl mx-auto px-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-200"
                    >
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiCheck className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">
                                Interview <span className="text-emerald-500 italic">Created!</span>
                            </h2>
                            <p className="text-slate-600">Share the links below with the candidate</p>
                        </div>

                        <div className="space-y-6">
                            {/* Interview Details */}
                            <div className="bg-slate-50 rounded-2xl p-6">
                                <h3 className="font-bold text-slate-900 mb-4">Interview Details</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-semibold">Interview ID:</span> {createdInterview.interviewId}</p>
                                    <p><span className="font-semibold">Scheduled:</span> {new Date(createdInterview.scheduledAt).toLocaleString()}</p>
                                    <p><span className="font-semibold">Status:</span> <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{createdInterview.status}</span></p>
                                </div>
                            </div>

                            {/* Recruiter Link */}
                            <div className="border border-slate-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-slate-900">Your Link (Recruiter)</h3>
                                    <button
                                        onClick={() => copyLink(createdInterview.recruiterLink, 'recruiter')}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                                    >
                                        {copiedLink === 'recruiter' ? (
                                            <>
                                                <HiCheck className="w-4 h-4 text-emerald-600" />
                                                <span className="text-sm font-semibold text-emerald-600">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <HiClipboardCopy className="w-4 h-4" />
                                                <span className="text-sm font-semibold">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs break-all text-slate-600">
                                    {createdInterview.recruiterLink}
                                </div>
                            </div>

                            {/* Candidate Link */}
                            <div className="border border-emerald-200 rounded-2xl p-6 bg-emerald-50">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-slate-900">Candidate Link</h3>
                                    <button
                                        onClick={() => copyLink(createdInterview.candidateLink, 'candidate')}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
                                    >
                                        {copiedLink === 'candidate' ? (
                                            <>
                                                <HiCheck className="w-4 h-4" />
                                                <span className="text-sm font-semibold">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <HiClipboardCopy className="w-4 h-4" />
                                                <span className="text-sm font-semibold">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="bg-white rounded-lg p-3 font-mono text-xs break-all text-slate-600">
                                    {createdInterview.candidateLink}
                                </div>
                                <p className="text-xs text-emerald-700 mt-3">
                                    💡 Send this link to the candidate via email or messaging
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => router.push('/interview')}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-bold transition-all"
                            >
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => router.push(createdInterview.recruiterLink)}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Join Interview Now
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Create interview form
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 font-poppins pt-24 pb-12">
            <div className="max-w-3xl mx-auto px-8">
                {/* Back button */}
                <button
                    onClick={() => router.push('/interview')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 font-semibold transition-colors"
                >
                    <HiArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">
                        Schedule <span className="text-emerald-500 italic">Interview</span>
                    </h1>
                    <p className="text-slate-600 font-medium">
                        Create a new interview session with a candidate
                    </p>
                </div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200"
                >
                    <div className="space-y-6">
                        {/* Select Candidate */}
                        <div>
                            <label className="flex items-center gap-2 text-slate-900 font-bold mb-3">
                                <HiUser className="w-5 h-5 text-emerald-500" />
                                Select Candidate
                            </label>
                            <select
                                name="candidateId"
                                value={formData.candidateId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium"
                            >
                                <option value="">Choose a candidate...</option>
                                {candidates.map((candidate) => (
                                    <option key={candidate.id} value={candidate.id}>
                                        {candidate.name} ({candidate.email})
                                    </option>
                                ))}
                            </select>
                            {candidates.length === 0 && (
                                <p className="text-sm text-slate-500 mt-2">No candidates available. Please add candidates first.</p>
                            )}
                        </div>

                        {/* Schedule Date & Time */}
                        <div>
                            <label className="flex items-center gap-2 text-slate-900 font-bold mb-3">
                                <HiCalendar className="w-5 h-5 text-emerald-500" />
                                Schedule Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                name="scheduledAt"
                                value={formData.scheduledAt}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-slate-900 font-bold mb-3 block">
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="e.g., Frontend Developer Position - Round 2"
                                className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium resize-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isCreating}
                        whileHover={{ scale: isCreating ? 1 : 1.02 }}
                        whileTap={{ scale: isCreating ? 1 : 0.98 }}
                        className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all ${isCreating
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            }`}
                    >
                        {isCreating ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Interview...
                            </span>
                        ) : (
                            'Create Interview'
                        )}
                    </motion.button>
                </motion.form>
            </div>
        </div>
    );
}
