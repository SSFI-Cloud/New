'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Trophy,
  ChevronDown,
  X,
  Loader2,
} from 'lucide-react';

import EventCard from '@/components/events/EventCard';
import { useEvents } from '@/lib/hooks/useEvents';
import { useStates } from '@/lib/hooks/useStudent';
import type { EventQueryParams, EventLevel, EventType, Discipline } from '@/types/event';
import { EVENT_LEVELS, EVENT_TYPES, DISCIPLINES } from '@/types/event';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EventQueryParams>({
    page: 1,
    limit: 12,
    upcoming: true,
    sortBy: 'eventDate',
    sortOrder: 'asc',
  });

  const { fetchEvents, data, isLoading, error } = useEvents();
  const { fetchStates, data: states } = useStates();

  // Fetch events on mount and when filters change
  useEffect(() => {
    fetchEvents(filters);
  }, [fetchEvents, filters]);

  // Fetch states for filter
  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchQuery || undefined, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFilterChange = (key: keyof EventQueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      page: 1,
      limit: 12,
      upcoming: true,
      sortBy: 'eventDate',
      sortOrder: 'asc',
    });
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) =>
      !['page', 'limit', 'sortBy', 'sortOrder', 'upcoming'].includes(key) &&
      filters[key as keyof EventQueryParams]
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Upcoming{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Discover and register for skating championships, tournaments, and workshops
            across India
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by name, venue, or city..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-6 bg-slate-800/50 border border-slate-700 rounded-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Event Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Event Level
                  </label>
                  <select
                    value={filters.eventLevel || ''}
                    onChange={(e) => handleFilterChange('eventLevel', e.target.value as EventLevel)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">All Levels</option>
                    {EVENT_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Event Type
                  </label>
                  <select
                    value={filters.eventType || ''}
                    onChange={(e) => handleFilterChange('eventType', e.target.value as EventType)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">All Types</option>
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Discipline */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Discipline
                  </label>
                  <select
                    value={filters.discipline || ''}
                    onChange={(e) => handleFilterChange('discipline', e.target.value as Discipline)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">All Disciplines</option>
                    {DISCIPLINES.map((disc) => (
                      <option key={disc.value} value={disc.value}>
                        {disc.icon} {disc.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    State
                  </label>
                  <select
                    value={filters.stateId || ''}
                    onChange={(e) => handleFilterChange('stateId', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">All States</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end mt-4 pt-4 border-t border-slate-700">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Count & Sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400">
            {data?.total || 0} events found
          </p>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters((prev) => ({
                ...prev,
                sortBy: sortBy as any,
                sortOrder: sortOrder as any,
              }));
            }}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="eventDate-asc">Date (Earliest First)</option>
            <option value="eventDate-desc">Date (Latest First)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="registrationEndDate-asc">Registration Deadline</option>
          </select>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
          </div>
        ) : data?.events && data.events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
                  disabled={filters.page === 1}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-slate-400">
                  Page {filters.page} of {data.totalPages}
                </span>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                  disabled={filters.page === data.totalPages}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
            <p className="text-slate-400">
              {activeFilterCount > 0
                ? 'Try adjusting your filters to find more events'
                : 'No upcoming events at the moment. Check back soon!'}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
