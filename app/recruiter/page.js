'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import LoadingScreen from '../../components/shared/LoadingScreen';
import { 
  Search, Building2, MapPin, Users, Briefcase, ExternalLink, 
  TrendingUp, Mail, Filter, X, DollarSign, Globe, Tag, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeLocation, normalizeLocationType, getConsolidatedLocations } from '../../lib/utils/locationUtils';
import NudgeModal from '../../components/recruiter/NudgeModal';
import dataJobsData from '../../superannotate_jobs_20260121_180210.json';

// SuperAnnotate referral link for all data jobs
const SUPERANNOTATE_REFERRAL = 'https://sme.careers/apply?referral=rp--dff48b';

// YC Logo URL from Wikimedia
const YC_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Y_Combinator_logo.svg';

export default function RecruiterPage() {
  const router = useRouter();
  const { user, loading: authLoading, profileData } = useAuth();
  
  // View state
  const [viewMode, setViewMode] = useState('regular'); // 'regular' or 'data-jobs'
  
  // Data state
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Student-focused filters
  const [selectedSources, setSelectedSources] = useState([]); // yc, a16z, general
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  
  // Data jobs filters
  const [dataJobsSearch, setDataJobsSearch] = useState('');
  const [dataJobsLocationType, setDataJobsLocationType] = useState('all'); // all, remote, on-site
  const [dataJobsMinPay, setDataJobsMinPay] = useState(0);
  
  // Email composer state
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [selectedCompanyForNudge, setSelectedCompanyForNudge] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [dataJobsPage, setDataJobsPage] = useState(1);
  const COMPANIES_PER_PAGE = 12;
  const DATA_JOBS_PER_PAGE = 15;

  // Check access
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load companies from Firebase
  useEffect(() => {
    const loadCompanies = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load from all three collections in parallel
        const [companiesSnap, ycSnap, a16zSnap] = await Promise.all([
          getDocs(collection(db, 'companies')),
          getDocs(collection(db, 'yc-companies')),
          getDocs(collection(db, 'a16z-companies'))
        ]);
        
        const allCompanies = [];
        
        // Process regular companies
        companiesSnap.forEach((doc) => {
          const data = doc.data();
          allCompanies.push({
            id: doc.id,
            Company: data.Company || doc.id,
            Website: data.Website || data.website,
            Email: data.Email || data.email,
            Industry: data.Industry || data.industry,
            Size: data.Size || data.size,
            Location: normalizeLocation(data.Location || data.location),
            Description: data.Description || data.description,
            source: 'general'
          });
        });
        
        // Process YC companies
        ycSnap.forEach((doc) => {
          const data = doc.data();
          allCompanies.push({
            id: doc.id,
            Company: data.Company || data.name || doc.id,
            Website: data.Website || data.website,
            Email: data.Email || data.email,
            Industry: data.Industry || data.industry || data.tags?.[0],
            Size: data.Size || data.size || data.team_size,
            Location: normalizeLocation(data.Location || data.location),
            Description: data.Description || data.one_liner || data.description,
            source: 'yc',
            batch: data.batch
          });
        });
        
        // Process A16Z companies
        a16zSnap.forEach((doc) => {
          const data = doc.data();
          allCompanies.push({
            id: doc.id,
            Company: data.Company || data.name || doc.id,
            Website: data.Website || data.website,
            Email: data.Email || data.email,
            Industry: data.Industry || data.industry || data.category,
            Size: data.Size || data.size,
            Location: normalizeLocation(data.Location || data.location),
            Description: data.Description || data.description,
            source: 'a16z'
          });
        });
        
        // Sort by completeness (companies with email first)
        allCompanies.sort((a, b) => {
          const aComplete = (a.Email ? 1 : 0) + (a.Website ? 1 : 0);
          const bComplete = (b.Email ? 1 : 0) + (b.Website ? 1 : 0);
          return bComplete - aComplete;
        });
        
        setCompanies(allCompanies);
        setLoading(false);
      } catch (error) {
        console.error('Error loading companies:', error);
        toast.error('Failed to load companies');
        setLoading(false);
      }
    };
    
    loadCompanies();
  }, [user]);

  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const locations = getConsolidatedLocations(companies, 'Location');
    const roles = new Set();
    
    companies.forEach(company => {
      if (company.Industry) roles.add(company.Industry);
    });
    
    return {
      locations,
      roles: Array.from(roles).sort().slice(0, 20) // Top 20 industries
    };
  }, [companies]);

  // Filter and search companies
  const filteredCompanies = useMemo(() => {
    let filtered = companies;
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(company => 
        company.Company?.toLowerCase().includes(query) ||
        company.Description?.toLowerCase().includes(query) ||
        company.Industry?.toLowerCase().includes(query) ||
        company.Location?.toLowerCase().includes(query)
      );
    }
    
    // Apply source filter (YC, a16z, General)
    if (selectedSources.length > 0) {
      filtered = filtered.filter(company => 
        selectedSources.includes(company.source)
      );
    }
    
    // Apply remote filter
    if (showRemoteOnly) {
      filtered = filtered.filter(company => 
        company.Location === 'Remote'
      );
    }
    
    // Apply location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(company => 
        selectedLocations.includes(company.Location)
      );
    }
    
    // Apply role filter
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(company => 
        selectedRoles.includes(company.Industry)
      );
    }
    
    return filtered;
  }, [companies, searchQuery, selectedSources, showRemoteOnly, selectedLocations, selectedRoles]);

  // Filter data jobs - JSON is an array directly, not object with .jobs property
  const filteredDataJobs = useMemo(() => {
    // dataJobsData is an array, not an object with .jobs property
    let jobs = Array.isArray(dataJobsData) ? dataJobsData : [];
    
    // Apply search
    if (dataJobsSearch.trim()) {
      const query = dataJobsSearch.toLowerCase();
      jobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.keywords?.toLowerCase().includes(query) ||
        job.role_description?.toLowerCase().includes(query)
      );
    }
    
    // Apply location type filter
    if (dataJobsLocationType !== 'all') {
      jobs = jobs.filter(job => {
        const locType = normalizeLocationType(job.location_type);
        return locType.toLowerCase() === dataJobsLocationType.toLowerCase();
      });
    }
    
    // Apply minimum pay filter
    if (dataJobsMinPay > 0) {
      jobs = jobs.filter(job => (job.pay_min || 0) >= dataJobsMinPay);
    }
    
    return jobs;
  }, [dataJobsSearch, dataJobsLocationType, dataJobsMinPay]);

  // Paginate results
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * COMPANIES_PER_PAGE;
    return filteredCompanies.slice(startIndex, startIndex + COMPANIES_PER_PAGE);
  }, [filteredCompanies, currentPage]);

  const paginatedDataJobs = useMemo(() => {
    const startIndex = (dataJobsPage - 1) * DATA_JOBS_PER_PAGE;
    return filteredDataJobs.slice(startIndex, startIndex + DATA_JOBS_PER_PAGE);
  }, [filteredDataJobs, dataJobsPage]);

  const totalPages = Math.ceil(filteredCompanies.length / COMPANIES_PER_PAGE);
  const totalDataJobsPages = Math.ceil(filteredDataJobs.length / DATA_JOBS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSources, showRemoteOnly, selectedLocations, selectedRoles]);

  useEffect(() => {
    setDataJobsPage(1);
  }, [dataJobsSearch, dataJobsLocationType, dataJobsMinPay]);

  // Handle nudge click - opens email composer
  const handleNudge = useCallback((company) => {
    setSelectedCompanyForNudge(company);
    setShowEmailComposer(true);
  }, []);
  
  // Handle email sent successfully
  const handleEmailSent = useCallback((result) => {
    const messages = [
      `Boom! ${result.company} just got your nudge. They're gonna love you.`,
      `Nice! Email sent to ${result.company}. Now sit back and let them come to you.`,
      `${result.company} is about to see what they've been missing. Well done.`,
      `Nudge sent! ${result.company} better check their inbox. You're on fire.`,
      `Hell yeah! ${result.company} just got introduced to their next hire.`
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    toast.success(randomMessage, { duration: 4000 });
  }, []);

  if (authLoading || loading) {
    return <LoadingScreen message="Loading opportunities..." />;
  }

  if (!user) {
    return null;
  }

  const toggleFilter = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSources([]);
    setShowRemoteOnly(false);
    setSelectedLocations([]);
    setSelectedRoles([]);
  };

  // Get favicon URL for a company website
  const getFavicon = (url) => {
    if (!url) return null;
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getSourceBadge = (source) => {
    // Don't show source badges - we'll show YC badge separately only for actual YC companies
    if (source === 'a16z') {
      return (
        <span className="px-2 py-0.5 text-xs rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
          a16z
        </span>
      );
    }
    return null;
  };

  const hasActiveFilters = selectedSources.length > 0 || showRemoteOnly || selectedLocations.length > 0 || selectedRoles.length > 0;

  return (
    <div className="drafted-background min-h-screen">
      <div className="drafted-bg-animated"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors mb-4 flex items-center gap-2 text-sm sm:text-base"
          >
            ← Back to Dashboard
          </button>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Time to Get Hired</h1>
          <p className="text-sm sm:text-base text-gray-400">
            {companies.length.toLocaleString()}+ companies waiting to meet you. Let's make some noise.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setViewMode('regular')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
              viewMode === 'regular'
                ? 'bg-drafted-green text-white shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">All Companies</span>
            <span className="sm:hidden">Companies</span>
            <span>({companies.length})</span>
          </button>
          <button
            onClick={() => setViewMode('data-jobs')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
              viewMode === 'data-jobs'
                ? 'bg-drafted-green text-white shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Data Jobs</span>
            <span className="sm:hidden">Data</span>
            <span>({filteredDataJobs.length})</span>
          </button>
        </div>

        {viewMode === 'regular' ? (
          <>
            {/* Search Bar */}
            <div className="drafted-card mb-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search companies, industries, locations..."
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-drafted-green/50 transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-4 rounded-lg flex items-center gap-2 transition-all ${
                    showFilters || hasActiveFilters
                      ? 'bg-drafted-green text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                      {selectedSources.length + (showRemoteOnly ? 1 : 0) + selectedLocations.length + selectedRoles.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Student-Focused Filters */}
            {showFilters && (
              <div className="drafted-card mb-6 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-drafted-green hover:text-drafted-emerald transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Funding Source */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Funding Source</label>
                    <div className="space-y-2">
                      {[
                        { value: 'yc', label: 'Y Combinator', icon: <img src={YC_LOGO_URL} alt="" className="w-4 h-4" /> },
                        { value: 'a16z', label: 'a16z', icon: <Zap className="w-4 h-4 text-purple-400" /> },
                        { value: 'general', label: 'Other', icon: <Building2 className="w-4 h-4 text-blue-400" /> }
                      ].map(({ value, label, icon }) => (
                        <button
                          key={value}
                          onClick={() => toggleFilter(value, selectedSources, setSelectedSources)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedSources.includes(value)
                              ? 'bg-drafted-green/20 text-drafted-green border border-drafted-green/30'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                          }`}
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Remote Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Work Type</label>
                    <button
                      onClick={() => setShowRemoteOnly(!showRemoteOnly)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        showRemoteOnly
                          ? 'bg-drafted-green/20 text-drafted-green border border-drafted-green/30'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      Remote Only
                    </button>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Location</label>
                    <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-white/5 rounded-lg">
                      {filterOptions.locations.slice(0, 10).map(location => (
                        <button
                          key={location}
                          onClick={() => toggleFilter(location, selectedLocations, setSelectedLocations)}
                          className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all ${
                            selectedLocations.includes(location)
                              ? 'bg-drafted-green/20 text-drafted-green'
                              : 'text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <MapPin className="w-3 h-3" />
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Industry</label>
                    <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-white/5 rounded-lg">
                      {filterOptions.roles.slice(0, 10).map(role => (
                        <button
                          key={role}
                          onClick={() => toggleFilter(role, selectedRoles, setSelectedRoles)}
                          className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all ${
                            selectedRoles.includes(role)
                              ? 'bg-drafted-green/20 text-drafted-green'
                              : 'text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <Tag className="w-3 h-3" />
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-gray-400">
              Showing {paginatedCompanies.length} of {filteredCompanies.length} companies
            </div>

            {/* Company Grid */}
            {paginatedCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedCompanies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => company.Email && handleNudge(company)}
                    className={`drafted-card hover:scale-[1.02] transition-transform duration-200 ${company.Email ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Company Favicon */}
                        {company.Website && getFavicon(company.Website) && (
                          <img 
                            src={getFavicon(company.Website)} 
                            alt="" 
                            className="w-8 h-8 rounded flex-shrink-0 mt-0.5"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div className="flex-1 min-w-0 flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-white line-clamp-1">
                                {company.Company}
                              </h3>
                              {/* YC Badge - small, inline */}
                              {company.source === 'yc' && (
                                <img 
                                  src={YC_LOGO_URL} 
                                  alt="YC" 
                                  className="w-4 h-4 flex-shrink-0" 
                                  title="Y Combinator"
                                />
                              )}
                            </div>
                            {getSourceBadge(company.source)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {company.Description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {company.Description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {company.Industry && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Briefcase className="w-4 h-4" />
                          <span>{company.Industry}</span>
                        </div>
                      )}
                      {company.Location && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{company.Location}</span>
                        </div>
                      )}
                      {company.Size && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{company.Size}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {company.Website && (
                        <a
                          href={company.Website.startsWith('http') ? company.Website : `https://${company.Website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 drafted-btn drafted-btn-glass text-sm py-2 flex items-center justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Website
                        </a>
                      )}
                      {company.Email && (
                        <button
                          className="flex-1 drafted-btn drafted-btn-primary text-sm py-2 flex items-center justify-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNudge(company);
                          }}
                        >
                          <Mail className="w-4 h-4" />
                          Nudge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="drafted-card text-center py-12">
                <p className="text-gray-400 text-lg">No companies found matching your filters</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 drafted-btn drafted-btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-drafted-green text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          /* Data Jobs View - SuperAnnotate Jobs */
          <div className="space-y-6">
            {/* Data Jobs Header */}
            <div className="drafted-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Data Annotation Jobs</h2>
                  <p className="text-gray-400">High-paying remote opportunities from SuperAnnotate</p>
                </div>
              </div>
              
              {/* Data Jobs Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={dataJobsSearch}
                    onChange={(e) => setDataJobsSearch(e.target.value)}
                    placeholder="Search by title or keywords..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
                  />
                </div>
                
                <select
                  value={dataJobsLocationType}
                  onChange={(e) => setDataJobsLocationType(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
                >
                  <option value="all" className="bg-slate-800">All Locations</option>
                  <option value="remote" className="bg-slate-800">Remote Only</option>
                  <option value="on-site" className="bg-slate-800">On-site Only</option>
                </select>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={dataJobsMinPay || ''}
                    onChange={(e) => setDataJobsMinPay(parseInt(e.target.value) || 0)}
                    placeholder="Min hourly rate"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
                  />
                </div>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="text-gray-400">
              Showing {paginatedDataJobs.length} of {filteredDataJobs.length} jobs
            </div>
            
            {/* Data Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDataJobs.map((job, index) => (
                <div 
                  key={job.job_id || index} 
                  className="drafted-card hover:scale-[1.02] transition-transform duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {job.title || 'Data Position'}
                    </h3>
                    {job.priority_level > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex-shrink-0 ml-2">
                        High Priority
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Building2 className="w-4 h-4" />
                      <span>{job.company || 'SuperAnnotate'}</span>
                    </div>
                    
                    {job.pay_rate && (
                      <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.pay_rate}</span>
                      </div>
                    )}
                    
                    {job.location_type && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Globe className="w-4 h-4" />
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          job.location_type.toLowerCase() === 'remote'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {job.location_type}
                        </span>
                        {job.country && <span>• {job.country}</span>}
                      </div>
                    )}
                    
                    {job.employment_type && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.employment_type}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Keywords as tags */}
                  {job.keywords && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.keywords.split(',').slice(0, 3).map((keyword, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 text-xs rounded bg-white/5 text-gray-400"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <a
                    href={SUPERANNOTATE_REFERRAL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full drafted-btn drafted-btn-primary text-sm py-3 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
            
            {/* Data Jobs Pagination */}
            {totalDataJobsPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setDataJobsPage(Math.max(1, dataJobsPage - 1))}
                  disabled={dataJobsPage === 1}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalDataJobsPages) }, (_, i) => {
                    let pageNum;
                    if (totalDataJobsPages <= 5) {
                      pageNum = i + 1;
                    } else if (dataJobsPage <= 3) {
                      pageNum = i + 1;
                    } else if (dataJobsPage >= totalDataJobsPages - 2) {
                      pageNum = totalDataJobsPages - 4 + i;
                    } else {
                      pageNum = dataJobsPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setDataJobsPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          dataJobsPage === pageNum
                            ? 'bg-drafted-green text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setDataJobsPage(Math.min(totalDataJobsPages, dataJobsPage + 1))}
                  disabled={dataJobsPage === totalDataJobsPages}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Email Composer Modal */}
      <NudgeModal
        isOpen={showEmailComposer}
        onClose={() => {
          setShowEmailComposer(false);
          setSelectedCompanyForNudge(null);
        }}
        company={selectedCompanyForNudge}
        userData={profileData}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
}
