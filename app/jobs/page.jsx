"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineFilter,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineBadgeCheck,
  HiOutlineChevronDown,
  HiOutlineX
} from 'react-icons/hi';
import JobCard from '@/components/jobs/JobCard';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [filters, setFilters] = useState({
    jobType: [],
    salaryRange: 'any',
    experience: 'any',
    remote: false
  });

  useEffect(() => {
    handleSearchAndFilters();
  }, [filters]);

  /**
   * Fundamental "def" for fetching jobs from any endpoint with params
   */
  const fetchJobsData = async (endpoint, params = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(params);
      const url = `${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await axios.get(url);

      // Handle potential pagination wrapper from Django REST Framework
      const data = response.data.results !== undefined ? response.data.results : response.data;
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("API Error:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Separate logic to handle the orchestration of search and filter states
   */
  const handleSearchAndFilters = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const isFiltered = searchQuery || locationQuery || filters.jobType.length > 0 || filters.salaryRange !== 'any' || filters.remote;
    const endpoint = isFiltered ? `${SERVER_URL}/jobs/filtered/` : `${SERVER_URL}/jobs/all-public/`;

    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (locationQuery) params.location = locationQuery;
    if (filters.remote && !locationQuery.toLowerCase().includes('remote')) {
      params.location = params.location ? `${params.location}, Remote` : 'Remote';
    }

    if (filters.jobType.length > 0) {
      params.job_type = filters.jobType.join(',');
    }

    if (filters.salaryRange !== 'any' && filters.salaryRange !== 'custom') {
      const [min, max] = filters.salaryRange.split('-');
      if (min) params.salary_min = min;
      if (max) params.salary_max = max;
    }

    fetchJobsData(endpoint, params);
  };

  const jobTypes = ['Full-time', 'Freelance', 'Internship', 'Volunteer', 'Contract'];
  const salaryRanges = [
    { label: 'Under $1000', value: '0-1000' },
    { label: '$1000 - $2500', value: '1000-2500' },
    { label: '$2500 - $5000', value: '2500-5000' },
    { label: 'Custom', value: 'custom' }
  ];

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      if (Array.isArray(current)) {
        return {
          ...prev,
          [category]: current.includes(value)
            ? current.filter(i => i !== value)
            : [...current, value]
        };
      }
      return { ...prev, [category]: value };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins pt-34">


      <div className="max-w-7xl mx-auto px-6">
        {/* Search Bar Group */}
        <form onSubmit={handleSearchAndFilters} className="flex flex-col md:flex-row gap-0 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10">
          <div className="flex-1 flex items-center px-6 py-4 border-r border-slate-100">
            <HiOutlineSearch className="text-slate-400 mr-3" size={24} />
            <input
              type="text"
              placeholder="Search job title or keyword"
              className="w-full outline-none text-slate-700 font-medium placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 flex items-center px-6 py-4 border-r border-slate-100">
            <HiOutlineLocationMarker className="text-slate-400 mr-3" size={24} />
            <input
              type="text"
              placeholder="Country or timezone"
              className="w-full outline-none text-slate-700 font-medium placeholder:text-slate-300"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 px-10 py-4 text-white font-bold transition-all active:scale-95"
          >
            Find jobs
          </button>
        </form>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 pb-20">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900">Filter</h3>
                <button
                  className="text-emerald-500 text-xs font-bold hover:underline"
                  onClick={() => setFilters({ jobType: [], salaryRange: 'any', experience: 'any', remote: false })}
                >
                  Clear all
                </button>
              </div>

              {/* Date Post Filter */}
              <div className="mb-8">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Date Post</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-emerald-500 transition-colors">
                    <option>Anytime</option>
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                  </select>
                  <HiOutlineChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Job Type Filter */}
              <div className="mb-8">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Job Type</label>
                <div className="space-y-3">
                  {jobTypes.map(type => (
                    <label key={type} className="flex items-center group cursor-pointer">
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all ${filters.jobType.includes(type) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 group-hover:border-emerald-200'
                        }`}>
                        {filters.jobType.includes(type) && <HiOutlineCheckCircle className="text-white" size={14} />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={filters.jobType.includes(type)}
                        onChange={() => toggleFilter('jobType', type)}
                      />
                      <span className={`text-sm font-bold ${filters.jobType.includes(type) ? 'text-slate-900' : 'text-slate-500'}`}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range Filter */}
              <div className="mb-8">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Range Salary</label>
                <div className="space-y-3">
                  {salaryRanges.map(range => (
                    <label key={range.value} className="flex items-center group cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${filters.salaryRange === range.value ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 group-hover:border-emerald-200'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-white transition-transform ${filters.salaryRange === range.value ? 'scale-100' : 'scale-0'}`}></div>
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="salary"
                        checked={filters.salaryRange === range.value}
                        onChange={() => toggleFilter('salaryRange', range.value)}
                      />
                      <span className={`text-sm font-bold ${filters.salaryRange === range.value ? 'text-slate-900' : 'text-slate-500'}`}>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remote Filter */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Working Mode</label>
                <label className="flex items-center group cursor-pointer">
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all ${filters.remote ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 group-hover:border-emerald-200'
                    }`}>
                    {filters.remote && <HiOutlineCheckCircle className="text-white" size={14} />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={filters.remote}
                    onChange={() => setFilters(prev => ({ ...prev, remote: !prev.remote }))}
                  />
                  <span className={`text-sm font-bold ${filters.remote ? 'text-slate-900' : 'text-slate-500'}`}>Remote Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Job Feed */}
          <main className="flex-1 min-w-0">

            {/* Header Hero Section */}
            <div className="w-full mb-12">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Main Feature Block (70%) */}
                <div className="lg:w-[70%] relative overflow-hidden bg-slate-900 rounded-[32px] p-12 text-white min-h-[200px] flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 400 400" className="w-full h-full rotate-12">
                      <path d="M0 0 L400 0 L400 400 Z" fill="currentColor" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight mb-4 leading-[1.1]">
                      Find your <span className="text-emerald-400 italic">dream job</span>
                    </h1>
                    <p className="text-slate-400 text-md font-medium max-w-md">
                      Looking for jobs? Browse our latest job openings to view & apply to the best jobs today!
                    </p>
                  </div>
                </div>

                {/* Secondary Stats/Promo Block (30%) */}
                <div className="lg:w-[30%] bg-emerald-500 rounded-[32px] p-8 text-white flex flex-col justify-between shadow-xl shadow-emerald-500/20">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <HiOutlineLightningBolt size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900/10 px-3 py-1 rounded-full">Status: Live</span>
                  </div>
                  <div>
                    <p className="text-5xl font-black mb-1">1.2k+</p>
                    <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest">Active Openings</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-500 font-bold">
                <span className="text-slate-900">{jobs.length}</span> Jobs results
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 font-medium">Sort by:</span>
                <button className="font-black text-slate-900 flex items-center gap-1 hover:text-emerald-500 transition-colors">
                  Newest
                  <HiOutlineChevronDown size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-200 p-8 animate-pulse">
                    <div className="flex gap-4 mb-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-100 rounded-full w-1/3"></div>
                        <div className="h-4 bg-slate-100 rounded-full w-1/5"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                      <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                    </div>
                  </div>
                ))
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard key={job.uuid} job={job} />
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-[32px] border border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiOutlineBriefcase size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">No jobs found</h3>
                  <p className="text-slate-400 font-medium">Try adjusting your filters or search keywords</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}