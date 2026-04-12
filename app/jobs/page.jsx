"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineFunnel,
  HiOutlineBuildingOffice2,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineDocumentText
} from 'react-icons/hi2';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    jobType: [],
    salaryRange: 'any',
    remote: false
  });

  const jobTypes = ['Full-time', 'Freelance', 'Internship', 'Volunteer', 'Contract'];
  const salaryRanges = [
    { label: 'Under $1000', value: '0-1000' },
    { label: '$1000 - $2500', value: '1000-2500' },
    { label: '$2500 - $5000', value: '2500-5000' },
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.get('/jobs/');
        setJobs(data);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchSearch = !searchQuery || job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) || job.organization_details?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLocation = !locationQuery || job.location?.toLowerCase().includes(locationQuery.toLowerCase());
    const matchType = filters.jobType.length === 0 || filters.jobType.includes(job.job_type);
    const matchSalary = filters.salaryRange === 'any' || true;
    const matchRemote = !filters.remote || job.location?.toLowerCase().includes('remote');
    return matchSearch && matchLocation && matchType && matchSalary && matchRemote;
  });

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      if (Array.isArray(current)) {
        return { ...prev, [category]: current.includes(value) ? current.filter(i => i !== value) : [...current, value] };
      }
      return { ...prev, [category]: value };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 font-sans">
      <div className="px-6 lg:px-12 xl:px-24">
        {/* Search Bar */}
        <div className="pt-22 lg:pt-35 pb-10">
          <div className="flex flex-col md:flex-row gap-0 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex-1 flex items-center px-6 py-4 border-r border-slate-100 dark:border-slate-800">
              <HiOutlineMagnifyingGlass className="text-slate-400 mr-3 w-6 h-6" />
              <input
                type="text"
                placeholder="Search job title or keyword"
                className="w-full outline-none text-slate-700 dark:text-slate-300 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-6 py-4 border-r border-slate-100 dark:border-slate-800">
              <HiOutlineMapPin className="text-slate-400 mr-3 w-6 h-6" />
              <input
                type="text"
                placeholder="Location"
                className="w-full outline-none text-slate-700 dark:text-slate-300 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold hover:text-emerald-500 transition-colors flex items-center gap-2"
            >
              <HiOutlineFunnel className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 pb-20">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="w-full lg:w-[300px] shrink-0 lg:self-start">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 lg:sticky lg:top-28">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Filter</h3>
                  <div className="flex items-center gap-3">
                    <button
                      className="text-emerald-500 text-xs font-bold hover:underline"
                      onClick={() => setFilters({ jobType: [], salaryRange: 'any', remote: false })}
                    >
                      Clear all
                    </button>
                    <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <HiOutlineXMark className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Job Type</label>
                  <div className="space-y-3">
                    {jobTypes.map(type => (
                      <label key={type} className="flex items-center group cursor-pointer">
                        <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all ${filters.jobType.includes(type) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-700 group-hover:border-emerald-200 dark:group-hover:border-emerald-500'}`}>
                          {filters.jobType.includes(type) && <HiOutlineCheckCircle className="text-white" size={14} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={filters.jobType.includes(type)} onChange={() => toggleFilter('jobType', type)} />
                        <span className={`text-sm font-bold ${filters.jobType.includes(type) ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Salary Range</label>
                  <div className="space-y-3">
                    {salaryRanges.map(range => (
                      <label key={range.value} className="flex items-center group cursor-pointer">
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${filters.salaryRange === range.value ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-700 group-hover:border-emerald-200 dark:group-hover:border-emerald-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full bg-white transition-transform ${filters.salaryRange === range.value ? 'scale-100' : 'scale-0'}`} />
                        </div>
                        <input type="radio" className="hidden" name="salary" checked={filters.salaryRange === range.value} onChange={() => toggleFilter('salaryRange', range.value)} />
                        <span className={`text-sm font-bold ${filters.salaryRange === range.value ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Working Mode</label>
                  <label className="flex items-center group cursor-pointer">
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all ${filters.remote ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-700 group-hover:border-emerald-200 dark:group-hover:border-emerald-500'}`}>
                      {filters.remote && <HiOutlineCheckCircle className="text-white" size={14} />}
                    </div>
                    <input type="checkbox" className="hidden" checked={filters.remote} onChange={() => setFilters(prev => ({ ...prev, remote: !prev.remote }))} />
                    <span className={`text-sm font-bold ${filters.remote ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Remote Only</span>
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Hero */}
            <div className="w-full mb-10">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-[70%] relative overflow-hidden bg-slate-900 rounded-[32px] p-10 text-white min-h-[180px] flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 400 400" className="w-full h-full rotate-12"><path d="M0 0 L400 0 L400 400 Z" fill="currentColor" /></svg>
                  </div>
                  <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 leading-[1.1]">
                      Find your <span className="text-emerald-400 italic">dream job</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-md">
                      Browse our latest job openings and apply to the best opportunities today.
                    </p>
                  </div>
                </div>
                <div className="lg:w-[30%] bg-emerald-500 rounded-[32px] p-8 text-white flex flex-col justify-between shadow-xl shadow-emerald-500/20 dark:shadow-emerald-500/10">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <HiOutlineSparkles className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900/10 px-3 py-1 rounded-full">{jobs.length} Live</span>
                  </div>
                  <div>
                    <p className="text-5xl font-black mb-1">{jobs.length}+</p>
                    <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest">Active Openings</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-500 dark:text-slate-400 font-bold">
                <span className="text-slate-900 dark:text-white">{filteredJobs.length}</span> jobs found
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 font-medium">Sort by:</span>
                <button className="font-black text-slate-900 dark:text-white flex items-center gap-1 hover:text-emerald-500 transition-colors">
                  Newest <HiOutlineChevronDown size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 animate-pulse">
                    <div className="flex gap-4 mb-4">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-1/3" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-1/5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6" />
                    </div>
                  </div>
                ))
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <Link
                    key={job.job_id}
                    href={`/jobs/${job.job_id}`}
                    className="block group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
                  >
                      <div className="flex items-start gap-5 relative">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/30 group-hover:scale-105 transition-all duration-300">
                        {job.organization_details?.logo_url ? (
                          <div className="w-full h-full bg-white rounded-2xl p-1.5 flex items-center justify-center">
                            <img src={job.organization_details.logo_url} alt="" className="w-full h-full object-contain" />
                          </div>
                        ) : job.organization_details?.name ? (
                          <span className="text-lg font-black tracking-tight">
                            {job.organization_details.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <HiOutlineDocumentText className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors truncate">
                              {job.job_title || 'Untitled Position'}
                            </h3>
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                              {job.organization_details?.name || 'Unknown Organization'}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20 shrink-0">
                            {job.job_type || 'N/A'}
                          </span>
                        </div>

                        {job.job_description && (
                          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {job.job_description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <HiOutlineMapPin className="w-4 h-4 text-emerald-500" />
                            {job.location || 'Remote / Anywhere'}
                          </span>
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <HiOutlineCurrencyDollar className="w-4 h-4 text-emerald-500" />
                            {job.salary_range || 'Competitive'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex gap-2 flex-wrap">
                            {job.key_skills?.length > 0 ? (
                              job.key_skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                No skills listed
                              </span>
                            )}
                            {job.key_skills?.length > 3 && (
                              <span className="text-[10px] font-bold text-slate-400 px-2 py-1">+{job.key_skills.length - 3} more</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-bold text-emerald-500 group-hover:gap-3 transition-all">
                            View Details <HiOutlineChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiOutlineBriefcase size={40} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No jobs found</h3>
                  <p className="text-slate-400 dark:text-slate-500 font-medium">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
